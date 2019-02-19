package com.gistone.seimp.controller.share;


import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.controller.Check;
import com.gistone.seimp.controller.UserController;
import com.gistone.seimp.job.GetContructProjectData;
import com.gistone.seimp.service.CheckService;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.service.VisitOrDownService;
import com.gistone.seimp.util.*;

import jxl.write.DateTime;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import oracle.sql.CLOB;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.poi.hpsf.Section;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.beans.IntrospectionException;
import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;

/**
 * 共享交换
 */

@RestController
@RequestMapping( "shareExchange" )
@SuppressWarnings("all")
public class ShareExchangeController {

    Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private UrlsUtil urlUtil;
    @Autowired
    private LogToDb logToDb;
    
    
    @Autowired
    private VisitOrDownService visitOrDownService;
    
    @Autowired
    private CheckService checkService;
    
    /*图片后缀*/
    private static String[] extensionPermit = {"doc", "txt", "docx", "pdf"};


    /**
     * 根据名称搜索数据集
     * 分页
     */
    @RequestMapping( "getDatalistByName" )
    public EdatResult getDatalistByName(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String userID = session.getAttribute("userID").toString();//用户id
            String roleID = session.getAttribute("roleID").toString();//角色id
            
            //接收参数
//            String roleID = (String) session.getAttribute("roleID");//数据权限
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getOrDefault("name", "").toString();//搜索名称
            String sortColumn = data.getOrDefault("sortColumn", "serviceAccount").toString();//排序字段
            if("".equals(sortColumn)){
            	sortColumn = "DATETIME";//默认按照数据量排序
            }
            int pageNumber = data.getInt("pageNumber");//当前页码
            int pageSize = data.getInt("pageSize");//每页条数
            
            String sql1 = "SELECT * from (select \"id\",\"name\",\"abstract\",\"shareLevel\",nvl(serviceAccount,0) serviceAccount,nvl(\"visitAccount\",0) visitAccount,\"dataType\",\"DATETIME\",nvl(\"VISITCOUNT\",0) VISITCOUNT,nvl(\"DOWNCOUNT\",0) DOWNCOUNT,ROWNUM RN FROM (SELECT * from ("
            		+ "select \"id\",\"name\",\"abstract\",\"serviceAccount\" serviceAccount,\"visitAccount\",\"dataType\",to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss') \"DATETIME\",\"shareLevel\""
            		+ " from \"tb_source_metadata\" where 1=1";
            String sql2 = "SELECT count(*) from (select * from \"tb_source_metadata\" where 1=1";
            
            String sqlWhere = "";
            if (!name.equals("")) {
            	sqlWhere += " and \"name\" like '%" + name + "%'";
            }
            sqlWhere += "  ) T1 JOIN (SELECT RIGHTID from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "') T2 on T1.\"id\" = T2.RIGHTID";

            sql1 += sqlWhere;
            sql1 += " left join (select sum(COUNT) VISITCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T4 on T1.\"id\"=T4.METADATAID";
            sql1 += " left join (select sum(COUNT) DOWNCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T5 on T1.\"id\"=T5.METADATAID"; 
            sql1 += " order by \"" + sortColumn + "\" desc nulls last )A) WHERE RN >" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize ;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理数据
           /* for (Map map : list) {
                map.put("name", map.get("name") == null ? "" : map.get("name").toString());
                map.put("serviceAccount", map.get("serviceAccount") == null ? "" : map.get("serviceAccount").toString());
                map.put("department", map.get("department") == null ? "" : map.get("department").toString());
            }*/
            addCatalogUrl(list);
            
            //处理数据集，增加数据集详情权限
            addDataSelectAuth(list, userID, roleID);
            
            sql2 += sqlWhere;
            Integer total = getBySqlMapper.findrows(sql2);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", getBySqlMapper.findrows(sql2) );
            result.put("page", list.size() == 0 ? 0 : pageNumber);
            return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 处理结果集数据，加上数据集的分类路径
     * @param list：数据集列表
     */
    private void addCatalogUrl(List<Map> list){
    	for (Map map : list) {
            String catalogUrl = "";
            if(map.get("dataType") != null && map.get("dataType") != ""){
            	String dataType = map.get("dataType").toString();
            	
            	//获取最低一级分类名称
            	String sql1 = "select \"id\",\"name\",\"parent_id\",\"level\" from \"tb_source_catalog\" where \"id\" = " + dataType;
            	List<Map> list1 = getBySqlMapper.findRecords(sql1);
            	if (list1.size() > 0) {
					catalogUrl += list1.get(0).get("name").toString();
					
					//获取
					if(list1.get(0).get("level") != null && list1.get(0).get("level") != "" && !list1.get(0).toString().equals("1")){
						String sql2 = "select \"id\",\"name\",\"parent_id\",\"level\" from \"tb_source_catalog\" where \"id\" = " + list1.get(0).get("parent_id");
		            	List<Map> list2 = getBySqlMapper.findRecords(sql2);
		            	if(list2.size() > 0){
		            		catalogUrl = list2.get(0).get("name").toString() + "/" + catalogUrl;
		            		
		            		//获取最高一级分类名称
		            		if(list2.get(0).get("level") != null && list2.get(0).get("level") != "" && !list2.get(0).toString().equals("1")){
		            			String sql3 = "select \"id\",\"name\",\"parent_id\",\"level\" from \"tb_source_catalog\" where \"id\" = " + list2.get(0).get("parent_id");
				            	List<Map> list3 = getBySqlMapper.findRecords(sql3);
				            	if(list3.size() > 0){
				            		catalogUrl = list3.get(0).get("name").toString() + "/" + catalogUrl;
				            	}
		            		}
		            	}
					}
            	}
            }
           
            map.put("catalogUrl", catalogUrl);
            
        }
    	
    }
    
    /**
     * 处理结果集数据，加上数据集的数据集详情权限
     * 有查看权限，或者审批通过权限，即有权限
     * @param list：数据集列表
     * @param userID：用户ID
     * @param roleID：角色ID
     */
    private void addDataSelectAuth(List<Map> list, String userID, String roleID){
    	for (Map map : list) {
			//数据集id
    		String metaId = map.get("id").toString();
    		String selSql = "select 1 from dual where EXISTS(select 1 from TB_ASK_AUTH where USERID = '"+userID+"' and METAID = '"+metaId+"') "
    				+ " or EXISTS(select * from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "' and SELECTAUTH='1')";
    		List<Map> result = getBySqlMapper.findRecords(selSql);
    		if(result.size()>0){
    			map.put("SELECTAUTH", "1");
    		}
		}
    }
    
    /**
     * 共享交换首页汇总数
     */
    @RequestMapping( "getSumValue" )
    public EdatResult getSumValue(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            if (roleID == null) {
                return EdatResult.build(1, "fail");
            }
            
            //数据集数量
            String sql1 = "select count(1) metadataCount from \"tb_source_metadata\" sm "
            		+ " join (select RIGHTID from  T_ROLE_DATARIGHT  where ROLEID = " + roleID + ") rd "
            		+ " on sm.\"id\" = rd.RIGHTID";
            Integer metadataCount = getBySqlMapper.findrows(sql1);
            
            //访问数量
            String sql2 = "select sum(COUNT) from TB_VISITORDOWN_DAY tvd join ( "
            		+ "  select tsm.\"id\" from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = "+roleID
            		+ " ) tid on tvd.METADATAID=tid.\"id\""
            		+ "  where TYPE=1";
            Integer visitCount = getBySqlMapper.findrows(sql2);
            
            //下载数量
            String sql3 = "select sum(COUNT) from TB_VISITORDOWN_DAY tvd join ( "
            		+ "  select tsm.\"id\" from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = "+roleID
            		+ " ) tid on tvd.METADATAID=tid.\"id\""
            		+ "  where TYPE=2";
            Integer downCount = getBySqlMapper.findrows(sql3);
            
            Map map = new HashMap();
            map.put("metadataCount", metadataCount);
            map.put("visitCount", visitCount);
            map.put("downCount", downCount);
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 数据快速浏览列表
     * 按发布时间排序、按访问量排序、按下载量排序
     */
    @RequestMapping( "getQuickReadList" )
    public EdatResult getQuickReadList(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            if (roleID == null) {
                return EdatResult.build(1, "fail");
            }
            
            //按发布时间排序
            String sql1 = "select * from "
            		+ "(select \"id\",\"name\",to_char(\"dataTime\",'yyyy-mm-dd') \"dataTime\" from \"tb_source_metadata\" sm "
            		+ " join (select RIGHTID from  T_ROLE_DATARIGHT  where ROLEID = " + roleID + ") rd "
            		+ " on sm.\"id\" = rd.RIGHTID"
            		+ " where \"dataTime\" is not null  "
            		+ " order by \"dataTime\" DESC)"
            		+ "where  ROWNUM < 15";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            //按访问量排序
            String sql2 = "select A.VISITCOUNT,TSM2.\"id\",TSM2.\"name\" from ("
            		+ " select sum(COUNT) VISITCOUNT,TVD.METADATAID MID2 from TB_VISITORDOWN_DAY tvd join ("
            		+ "   select tsm.\"id\" MID from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = " + roleID
            		+ " ) tid on tvd.METADATAID=tid.MID"
            		+ "  where TYPE=1"
            		+ " group by tvd.METADATAID"
            		+ " )A left join \"tb_source_metadata\" tsm2 on A.MID2=TSM2.\"id\""
            		+ " where ROWNUM < 15"
            		+ " order by A.VISITCOUNT DESC";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            String sql3 = "select A.DOWNCOUNT,TSM2.\"id\",TSM2.\"name\" from ("
            		+ " select sum(COUNT) DOWNCOUNT,TVD.METADATAID MID2 from TB_VISITORDOWN_DAY tvd join ("
            		+ "   select tsm.\"id\" MID from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = " + roleID
            		+ " ) tid on tvd.METADATAID=tid.MID"
            		+ "  where TYPE=2"
            		+ " group by tvd.METADATAID"
            		
            		+ " )A left join \"tb_source_metadata\" tsm2 on A.MID2=TSM2.\"id\""
            		+ " where ROWNUM < 15"
            		+ " order by A.DOWNCOUNT DESC";
            List<Map> list3 = getBySqlMapper.findRecords(sql3);
            
            Map map = new HashMap();
            map.put("dataTimeList", list1);
            map.put("visitCountList", list2);
            map.put("downCountList", list3);
            
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取资源共享情况统计
     * 按时间统计，访问量、下载量
     */
    @RequestMapping( "getResourceShareDataStatis" )
    public EdatResult getResourceShareDataStatis(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            if (roleID == null) {
                return EdatResult.build(1, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getOrDefault("type", "1").toString();//类型
            String dateStart = data.getOrDefault("dateStart", "").toString();//开始时间
            String dateEnd = data.getOrDefault("dateEnd", "").toString();//结束时间
            
            //按发布时间排序
            String sql1 = "select sum(COUNT) count,to_char(DAYDATE, 'yyyy-mm-dd') DAYDATE   from TB_VISITORDOWN_DAY tvd join"
            		+ " (select tsm.\"id\" MID from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = " + roleID + ")A"
            		+ " on TVD.METADATAID=A.MID"
            		+ " where type = " + type;
            String sqlWhere = "";
            if(!"".equals(dateStart)){
            	sqlWhere  += " and DAYDATE >= to_date('" + dateStart + " 00:00:00','yyyy-mm-dd hh24:mi:ss')";
            }
            if(!"".equals(dateEnd)){
            	sqlWhere  += " and DAYDATE <= to_date('" + dateEnd + " 00:00:00','yyyy-mm-dd hh24:mi:ss')";
            }
            
            sql1 += sqlWhere; 
            sql1 += (" GROUP BY to_char(DAYDATE, 'yyyy-mm-dd') "
            		+ "order by DAYDATE");
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取资源共享情况统计
     * 按时间统计，访问量、下载量，同时获取访问量，下载量
     */
    @RequestMapping( "getResourceShareDataStatisAll" )
    public EdatResult getResourceShareDataStatisAll(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            if (roleID == null) {
                return EdatResult.build(1, "fail");
            }
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
//            String type = data.getOrDefault("type", "1").toString();//类型
            String dateStartStr = data.getOrDefault("dateStart", "").toString();//开始时间
            String dateEndStr = data.getOrDefault("dateEnd", "").toString();//结束时间
            
            //按发布时间排序
            String sql1 = "select sum(COUNT) count,to_char(DAYDATE, 'yyyy-mm-dd') DAYDATE   from TB_VISITORDOWN_DAY tvd join"
            		+ " (select tsm.\"id\" MID from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = " + roleID + ")A"
            		+ " on TVD.METADATAID=A.MID"
            		+ " where type = 1";
            
            String sql2 = "select sum(COUNT) count,to_char(DAYDATE, 'yyyy-mm-dd') DAYDATE   from TB_VISITORDOWN_DAY tvd join"
            		+ " (select tsm.\"id\" MID from \"tb_source_metadata\" tsm join  T_ROLE_DATARIGHT trd on tsm.\"id\"=trd.RIGHTID where ROLEID = " + roleID + ")A"
            		+ " on TVD.METADATAID=A.MID"
            		+ " where type = 2";
            
            String sqlWhere = "";
            if(!"".equals(dateStartStr)){
            	sqlWhere  += " and DAYDATE >= to_date('" + dateStartStr + " 00:00:00','yyyy-mm-dd hh24:mi:ss')";
            }
            if(!"".equals(dateEndStr)){
            	sqlWhere  += " and DAYDATE <= to_date('" + dateEndStr + " 00:00:00','yyyy-mm-dd hh24:mi:ss')";
            }
            
            sql1 += sqlWhere; 
            sql1 += (" GROUP BY to_char(DAYDATE, 'yyyy-mm-dd') "
            		+ "order by DAYDATE");
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            sql2 += (" GROUP BY to_char(DAYDATE, 'yyyy-mm-dd') "
            		+ "order by DAYDATE");
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            List<Map> visitList  = new ArrayList<Map>();
            List<Map> downList  = new ArrayList<Map>();
            
            //处理开始时间和结束时间为空的情况
            //获取开始时间和结束时间
            if(dateStartStr == ""){
	            if(list1.size() == 0 && list2.size() > 0){
	            	dateStartStr = list2.get(0).get("DAYDATE").toString();
	            }
	            if(list2.size() == 0 && list1.size() > 0){
	            	dateStartStr = list1.get(0).get("DAYDATE").toString();
	            }
	            if(list1.size() > 0 && list2.size() > 0){
	            	//开始时间
	            	Date date1 = df.parse(list1.get(0).get("DAYDATE").toString());
	            	Date date2 = df.parse(list2.get(0).get("DAYDATE").toString());
	            	if(date1.getTime() < date2.getTime()){
	            		dateStartStr = list1.get(0).get("DAYDATE").toString();
	            	}else{
	            		dateStartStr = list2.get(0).get("DAYDATE").toString();
	            	}
	            	//结束时间
	            }
            }
            
            //结束时间为空
            if(dateEndStr == ""){
                if(list1.size() == 0 && list2.size() > 0){
                	dateEndStr = list2.get(list1.size()-1).get("DAYDATE").toString();
                }
                if(list2.size() == 0 && list1.size() > 0){
                	dateEndStr = list1.get(list1.size()-1).get("DAYDATE").toString();
                }
                if(list1.size() > 0 && list2.size() > 0){
                	//开始时间
                	//结束时间
                	Date date3 = df.parse(list1.get(list1.size()-1).get("DAYDATE").toString());
                	Date date4 = df.parse(list2.get(list2.size()-1).get("DAYDATE").toString());
                	if(date3.getTime() < date4.getTime()){
                		dateEndStr = list2.get(list2.size()-1).get("DAYDATE").toString();
                	}else{
                		dateEndStr = list1.get(list1.size()-1).get("DAYDATE").toString();
                	}
                }
            }
            
            //处理数据
            if(dateStartStr != "" && dateEndStr!=""){
            	Date dateStart = df.parse(dateStartStr);
 	            Date dateEnd = df.parse(dateEndStr);
 	            //访问记录
 	            for (int i = 0; i < list1.size(); i++) {
					Map map = list1.get(i);
					
 	            	if(map!=null && map.get("DAYDATE")!=null && map.get("DAYDATE")!=""){
 	            		String currDateStr = map.get("DAYDATE").toString();
 	            		Date currDate = df.parse(currDateStr);
 	            		//从开始到当前时间补充0
 	            		if(dateStart.getTime() < currDate.getTime()){
 	            			//补0
 	            			while (dateStart.getTime() < currDate.getTime()) {
 	            				Map visitMap = new HashMap();
 								visitMap.put("count", "0");
 								visitMap.put("dateStr", df.format(dateStart));
 								visitList.add(visitMap);
 								
 								//时间加1
 								Calendar cal = Calendar.getInstance();
 								cal.setTime(dateStart);
 								cal.add(Calendar.DAY_OF_YEAR, 1);
 								dateStart = cal.getTime();
							}
 	            			//时间加1
 	            			Map visitMap = new HashMap();
							visitMap.put("count", map.get("COUNT"));
							visitMap.put("dateStr", currDateStr);
							visitList.add(visitMap);
 	            			
								Calendar cal = Calendar.getInstance();
								cal.setTime(dateStart);
								cal.add(Calendar.DAY_OF_YEAR, 1);
								dateStart = cal.getTime();
								
 	            		}else{
 	            			//
 	            			Map visitMap = new HashMap();
							visitMap.put("count", map.get("COUNT"));
							visitMap.put("dateStr", currDateStr);
							visitList.add(visitMap);
							
							//时间加1
							Calendar cal = Calendar.getInstance();
							cal.setTime(dateStart);
							cal.add(Calendar.DAY_OF_YEAR, 1);
							dateStart = cal.getTime();
 	            		}
 	            		
 	            		//补充当前时间到结束时间之间补充0
 	            		if(i == list1.size()-1){
 	            			while (currDate.getTime() < dateEnd.getTime()) {
 								//时间加1
 								Calendar cal = Calendar.getInstance();
 								cal.setTime(currDate);
 								cal.add(Calendar.DAY_OF_YEAR, 1);
 								currDate = cal.getTime();
 								
 								//补0
 								Map visitMap = new HashMap();
 								visitMap.put("count", "0");
 								visitMap.put("dateStr", df.format(currDate));
 								visitList.add(visitMap);
							}
 	            		}
 	            		
 	            		
 	            	}//--if end
					
				}//--for end
 	            
 	           Date dateStart2 = df.parse(dateStartStr);
	           Date dateEnd2 = df.parse(dateEndStr);
 	            
 	            //下载记录
 	            for (int i = 0; i < list2.size(); i++) {
					Map map = list2.get(i);
					
 	            	if(map!=null && map.get("DAYDATE")!=null && map.get("DAYDATE")!=""){
 	            		String currDateStr = map.get("DAYDATE").toString();
 	            		Date currDate = df.parse(currDateStr);
 	            		//从开始到当前时间补充0
 	            		if(dateStart2.getTime() < currDate.getTime()){
 	            			//补0
 	            			while (dateStart2.getTime() < currDate.getTime()) {
 	            				Map downMap = new HashMap();
 	            				downMap.put("count", "0");
 	            				downMap.put("dateStr", df.format(dateStart2));
 								downList.add(downMap);
 								
 								//时间加1
 								Calendar cal = Calendar.getInstance();
 								cal.setTime(dateStart2);
 								cal.add(Calendar.DAY_OF_YEAR, 1);
 								dateStart2 = cal.getTime();
							}
 	            			//时间加1
 	            			Map downMap = new HashMap();
 	            			downMap.put("count", map.get("COUNT"));
 	            			downMap.put("dateStr", currDateStr);
							downList.add(downMap);
 	            			
								Calendar cal = Calendar.getInstance();
								cal.setTime(dateStart2);
								cal.add(Calendar.DAY_OF_YEAR, 1);
								dateStart2 = cal.getTime();
								
 	            		}else{
 	            			//
 	            			Map downMap = new HashMap();
 	            			downMap.put("count", map.get("COUNT"));
 	            			downMap.put("dateStr", currDateStr);
							downList.add(downMap);
							
							//时间加1
							Calendar cal = Calendar.getInstance();
							cal.setTime(dateStart2);
							cal.add(Calendar.DAY_OF_YEAR, 1);
							dateStart2 = cal.getTime();
 	            		}
 	            		
 	            		//补充当前时间到结束时间之间补充0
 	            		if(i == list2.size()-1){
 	            			while (currDate.getTime() < dateEnd2.getTime()) {
 								//时间加1
 								Calendar cal = Calendar.getInstance();
 								cal.setTime(currDate);
 								cal.add(Calendar.DAY_OF_YEAR, 1);
 								currDate = cal.getTime();
 								
 								//补0
 								Map downMap = new HashMap();
 								downMap.put("count", "0");
 								downMap.put("dateStr", df.format(currDate));
 								downList.add(downMap);
							}
 	            		}
 	            		
 	            		
 	            	}//--if end
					
				}//--for end
            }
            
            
            
            //处理数据
            /*
            if(dateStartStr != "" && dateEndStr!=""){
	            Date dateStart = df.parse(dateStartStr);
	            Date dateEnd = df.parse(dateEndStr);
	            Date currDate = df.parse(dateStartStr);
	            if(dateStart.getTime() > dateEnd.getTime()){
	            	//开始时间比结束时间大
	            }else{
	            	while (currDate.getTime() < dateEnd.getTime()) {
	            		String currDateStr = df.format(currDate);
						//获取访问
	            		boolean flag1 = false;
	            		for (Map map : list1) {
							if(map!=null && map.get("DAYDATE")!=null && map.get("DAYDATE")!=""){
								if(map.get("DAYDATE").toString().equals(currDateStr)){
									//找到时间
									Map visitMap = new HashMap();
									visitMap.put(currDateStr, map.get("COUNT"));
									visitList.add(visitMap);
									flag1 = true;
									break;
								}
							}
						}
	            		if(!flag1){
	            			Map visitMap = new HashMap();
							visitMap.put(currDateStr, "0");
							visitList.add(visitMap);
	            		}
	            		
	            		//获取下载
	            		boolean flag2 = false;
	            		for (Map map : list1) {
							if(map!=null && map.get("DAYDATE")!=null && map.get("DAYDATE")!=""){
								if(map.get("DAYDATE").toString().equals(currDateStr)){
									//找到时间
									Map downMap = new HashMap();
									downMap.put(currDateStr, map.get("COUNT"));
									downList.add(downMap);
									flag1 = true;
									break;
								}
							}
						}
	            		if(!flag2){
	            			Map downMap = new HashMap();
	            			downMap.put(currDateStr, "0");
	            			downList.add(downMap);
	            		}
	            		
	            		//时间加1
	            		Calendar cal = Calendar.getInstance();
	            		cal.setTime(currDate);
	            		cal.add(Calendar.DAY_OF_YEAR, 1);
	            		currDate = cal.getTime();
						
					}//--while end
	            }//--if end
            }//--if end
            */
            
            
            Map map = new HashMap();
            map.put("visitList", visitList);
            map.put("downList", downList);
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 点击数据集，插入访问、下载记录
     */
    @RequestMapping( "addVisitOrDownData" )
    public Map addVisitOrDownData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            HttpSession session = request.getSession();
            int userID = Integer.parseInt(session.getAttribute("userID").toString());
            
            String userIP = request.getRemoteAddr();
            
            Map userMap = new HashMap();
            userMap.put("userID", userID);
            userMap.put("userIP", userIP);
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String metadataID = data.getString("metadataID");
            String type = data.getString("type");
            
            visitOrDownService.addData(metadataID, type, userMap);
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 根据数据分类搜索数据集、或根据不为搜索数据集
     * 点击一级菜单、二级菜单、三级菜单
     * 分页
     */
    @RequestMapping( "getDataListByCatalog" )
    public EdatResult getDataListByCatalog(HttpServletRequest request, HttpServletResponse response) {
    	try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            String userID = session.getAttribute("userID").toString();//用户id
            if (roleID == null) {
                return EdatResult.build(1, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int type = data.getInt("type");
            String sortColumn = data.getOrDefault("sortColumn", "serviceAccount").toString();//排序字段
            if("".equals(sortColumn)){
            	sortColumn = "DATETIME";//默认按照数据量排序
            }
            int pageNumber = Integer.valueOf(data.get("pageNumber").toString());
            int pageSize = Integer.valueOf(data.get("pageSize").toString());
            
            if (type > 100) {
                return EdatResult.ok(getDatalistByBuwei(roleID,userID, type - 100,sortColumn, pageNumber, pageSize));
            } else {
                return EdatResult.ok(getDatalistByDataType(roleID,userID, type,sortColumn, pageNumber, pageSize));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * @Author:renqiang
     * @Description:根据部位分类数据集
     * @Date:09:20 2017/10/20
     */
    public Map getDatalistByBuwei(String roleID,String userID, int name,String sortColumn, int pageNumber, int pageSize) {
        try {
            String sql = "SELECT * FROM( select T6.*,ROWNUM RN from ( select T1.*,nvl(T4.VISITCOUNT,0) VISITCOUNT,nvl(T5.DOWNCOUNT,0) DOWNCOUNT FROM("
					+ " select \"id\",\"name\",\"abstract\",nvl(\"serviceAccount\", 0) SERVICEACCOUNT,to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss') DATETIME,\"dataType\",\"shareLevel\" from \"tb_source_metadata\" where \"ministry\"='" + name + "' )T1" 
					+ " JOIN (SELECT RIGHTID from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "') T2 on T1.\"id\" = T2.RIGHTID"
					+ " left join (select sum(COUNT) VISITCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T4 on T1.\"id\"=T4.METADATAID"
					+ " left join (select sum(COUNT) DOWNCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T5 on T1.\"id\"=T5.METADATAID" 
					+ " order by \""+sortColumn+"\" desc )T6 )"
					+ " WHERE  RN>" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize;
            
            String sql1 = "select count(*) from \"tb_source_metadata\" T1  "
            		+ " JOIN (SELECT RIGHTID from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "') T2 on T1.\"id\" = T2.RIGHTID"
            		+ " where \"ministry\"='" + name + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            /*for (Map map : list) {
                map.put("name", map.get("name") == null ? "" : map.get("name").toString());
                map.put("serviceAccount", map.get("serviceAccount") == null ? "" : map.get("serviceAccount").toString());
                map.put("department", map.get("department") == null ? "" : map.get("department").toString());
            }*/
            
            //添加分类信息
            addCatalogUrl(list);
            
            //处理数据集，增加数据集详情权限
            addDataSelectAuth(list, userID, roleID);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total",  getBySqlMapper.findrows(sql1));
            result.put("page", pageNumber);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Author:renqiang
     * @Description:根据数据类型分类数据集
     * @Date:09:20 2017/10/20
     */
    public Map getDatalistByDataType(String roleID,String userID, int type,String sortColumn, int pageNumber, int pageSize) {
        try {
            String sql = "";
            String sql1 = "";

            if (type == 0) {
                sql = "SELECT * FROM(select T1.*,ROWNUM RN FROM("
                		+ " SELECT\"id\",\"name\",\"abstract\",nvl(\"serviceAccount\",0) SERVICEACCOUNT,\"dataType\",to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss') DATETIME,\"shareLevel\",nvl(VISITCOUNT,0) VISITCOUNT,nvl(DOWNCOUNT,0) DOWNCOUNT FROM \"tb_source_metadata\" T3"
                		+ " join  (select  RIGHTID from T_ROLE_DATARIGHT  where ROLEID = " + roleID + ")T2 on T3.\"id\" =T2.RIGHTID"
                		+ " left join (select sum(COUNT) VISITCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T4 on T3.\"id\"=T4.METADATAID" 
                		+ " left join (select sum(COUNT) DOWNCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T5 on T3.\"id\"=T5.METADATAID "
                		+ "  order by \""+sortColumn+"\" desc "
                		+ "	)T1) WHERE RN>" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize;
                sql1 = "select count(*) from \"tb_source_metadata\" T3" 
                		+ " join  (select  RIGHTID from T_ROLE_DATARIGHT  where ROLEID = " + roleID + ")T2 on T3.\"id\" =T2.RIGHTID";
            } else {
                sql = "SELECT * FROM(select \"id\",\"name\",\"abstract\", nvl(SERVICEACCOUNT,0) SERVICEACCOUNT,\"dataType\", DATETIME,\"shareLevel\",nvl(VISITCOUNT,0) VISITCOUNT,nvl(DOWNCOUNT,0) DOWNCOUNT,ROWNUM RN FROM("
                		+ " select * from("
                		+ " select \"id\",\"name\",\"abstract\",\"serviceAccount\" SERVICEACCOUNT,\"dataType\",to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss') DATETIME,\"shareLevel\" from \"tb_source_metadata\" where \"dataType\" in  ("
                		
                		+ "select \"id\" from   \"tb_source_catalog\"   where \"parent_id\" = '" + type + "' or \"id\" = '" + type + "' "
//                		+ " select \"id\" from "
//                		+ " (select * from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID = " + roleID + ") T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")A "
//                		+ " where A.\"parent_id\" = '" + type + "' or A.\"id\" = '" + type + "' "

                		+ " union all  "
                		+ "("
                		+ "select \"id\" from  \"tb_source_catalog\" where \"parent_id\" in ( select \"id\" from   \"tb_source_catalog\"  where \"parent_id\" = '" + type + "' )" 
        				+ "	) "
//                		+ " (select \"id\" from "
//                		+ " (select * from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID = " + roleID + ") T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")B "
//                		+ " where B.\"parent_id\" in ("
//                		+ " select \"id\" from "
//                		+ " (select * from (select RIGHTID from T_ROLE_DATARIGHT  where ROLEID = 1) T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")C "
//                		+ " where C.\"parent_id\" = '" + type + "'"
//                		+ " )"
//                		+ " )"
                		
                		
                		+ " )"
                	+ " )T2"
                	+ " join  (select  RIGHTID from T_ROLE_DATARIGHT  where ROLEID =" + roleID + ")T5 on T2.\"id\" =T5.RIGHTID"
                	+ " left join (select sum(COUNT) VISITCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T3 on T2.\"id\"=T3.METADATAID "
                	+ " left join (select sum(COUNT) DOWNCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T4 on T2.\"id\"=T4.METADATAID "

                	+ "  order by \""+sortColumn+"\" desc nulls last)T1 " 
                	+") WHERE RN>" + pageSize * (pageNumber - 1) + "  and RN<=" + pageNumber * pageSize;
                
                sql1 = "select count(*) from \"tb_source_metadata\" T3"
                		+ " join  (select  RIGHTID from T_ROLE_DATARIGHT  where ROLEID = " + roleID + ")T2 on T3.\"id\" =T2.RIGHTID"
                		+ " where \"dataType\" in "
                		+ "("
                		
                		+ "select \"id\" from   \"tb_source_catalog\"   where \"parent_id\" = '" + type + "' or \"id\" = '" + type + "' "

                		+ " union all  "
                		
                		+ "("
                		+ "select \"id\" from  \"tb_source_catalog\" where \"parent_id\" in ( select \"id\" from   \"tb_source_catalog\"  where \"parent_id\" = '" + type + "' )" 
        				+ "	) "
                		
                		+ ")";
                		
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            /*for (Map map : list) {
                map.put("name", map.get("name") == null ? "" : map.get("name").toString());
                map.put("serviceAccount", map.get("serviceAccount") == null ? "" : map.get("serviceAccount").toString());
                map.put("department", map.get("department") == null ? "" : map.get("department").toString());
                
            }*/
            
            //添加分类信息
            addCatalogUrl(list);
            
          //处理数据集，增加数据集详情权限
            addDataSelectAuth(list, userID, roleID);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total",getBySqlMapper.findrows(sql1) );
            result.put("page", list.size() == 0 ? 0 : pageNumber);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 根据数据集ID，获取数据集整体情况
     */
    @RequestMapping( "getDatalistByID" )
    public EdatResult getDatalistByID(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String userID = session.getAttribute("userID").toString();//用户id
            
            //接收参数
            String roleID = (String) session.getAttribute("roleID");//数据权限
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getOrDefault("ID", "").toString();//数据集ID
            
            String sql1 = "select \"id\",\"name\",\"abstract\",\"shareLevel\",nvl(\"serviceAccount\",0) serviceAccount,nvl(\"visitAccount\",0) visitAccount,\"dataType\",to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss') DATETIME,nvl(\"VISITCOUNT\",0) VISITCOUNT,nvl(\"DOWNCOUNT\",0) DOWNCOUNT from \"tb_source_metadata\" T1"
            		+ " left join (select sum(COUNT) VISITCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T4 on T1.\"id\"=T4.METADATAID "
            		+ " left join (select sum(COUNT) DOWNCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T5 on T1.\"id\"=T5.METADATAID where 1=1"
            		+ " and T1.\"id\" = " + id;

            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理数据
            addCatalogUrl(list);
            //处理数据集，增加数据集详情权限
            addDataSelectAuth(list, userID, roleID);
            
            //插入访问记录
            Map userMap = new HashMap();
//            int userID = Integer.parseInt(session.getAttribute("userID").toString());
            String userIP = request.getRemoteAddr();
            userMap.put("userID", userID);
            userMap.put("userIP", userIP);
            visitOrDownService.addData(id, "1", userMap);
            
            return EdatResult.ok(list.get(0));
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 下载权限
     * @author luowenbin
     * @date 2018年7月30日
     */
    @RequestMapping( "getDownRight" )
    public EdatResult getDownRight(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getOrDefault("ID", "").toString();//数据集ID
            
            int checkSeDownRight = checkService.CheckSeDownRight(request, Integer.parseInt(id));
            if("0".equals(checkSeDownRight+"")){
            	//有权限
            	return EdatResult.ok("1");
            }else{
            	//无权限
            	return EdatResult.ok("0");
            }
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    /**
     * 所有省份
     */
    @RequestMapping( "getAllProvince" )
    public EdatResult getAllProvince(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            String sql1 = "select * from \"tb_city\" where \"level\"='0' and \"code\"!='660000'";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 某一个省的所有市
     */
    @RequestMapping( "getCityByProvince" )
    public EdatResult getCityByProvince(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String provinceID = data.getOrDefault("provinceID", "").toString();//搜索名称
            
            String sql1 = "select * from \"tb_city\" where \"level\"='1' and \"parent_id\"=(select \"id\" from \"tb_city\" where \"code\"='" + provinceID + "')";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 某一个市的所有县
     */
    @RequestMapping( "getCountyByCity" )
    public EdatResult getCountyByCity(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String cityID = data.getOrDefault("cityID", "").toString();//搜索名称
            
            String sql1 = "select * from \"tb_city\" where \"level\"='2' and \"parent_id\"=(select \"id\" from \"tb_city\" where \"code\"='" + cityID + "')";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 通过ID，获取元数据信息
     */
    @RequestMapping( "getMetadataInfoByID" )
    public EdatResult getMetadataInfoByID(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String mID = data.getOrDefault("MID", "").toString();//元数据集ID
            
            String sql = "select T1.*,T2.\"interface_url\",nvl(T3.VISITCOUNT,0) VISITCOUNT,nvl(T4.DOWNCOUNT,0) DOWNCOUNT from ("
            		
            		+ " select \"id\", \"name\", \"department\", to_char(\"updateTime\",'yyyy-mm-dd HH24:mi:ss')\"updateTime\","
            		+ "  \"serviceAccount\",  \"visitAccount\", to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss')\"dataTime\","
            		+ "   \"location\", \"subjectTerms\", \"dataType\", \"abstract\", \"instructions\", \"contact\","
            		+ " \"tel\", \"email\", \"address\",   \"ministry\",\"interface_id\","
            		+ " \"produce_name\",\"produce_people\",\"produce_tel\",\"produce_email\",\"produce_address\", "
            		+ "\"todatabase_name\",\"todatabase_people\",\"todatabase_tel\",\"todatabase_email\",\"todatabase_address\""
            		+ " from \"tb_source_metadata\" where \"id\" = '" + mID + "'"
            		
            		+ " ) T1"
            		+ " left join \"tb_interface\" T2 on T1.\"interface_id\" = T2.\"interface_id\""
            		+ " left join (select sum(COUNT) VISITCOUNT,METADATAID  from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T3 on T1.\"id\"=T3.METADATAID"
            		+ " left join (select sum(COUNT) DOWNCOUNT,METADATAID  from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T4 on T1.\"id\"=T4.METADATAID";
            List<Map> list = getBySqlMapper.findRecords(sql);
            //添加分类信息
            addCatalogUrl(list);
            
            return EdatResult.ok(list.get(0));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 通过ID，获取元数据 数据项信息
     */
    @RequestMapping( "getMetadataColumnInfoByID" )
    public EdatResult getMetadataColumnInfoByID(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String mID = data.getOrDefault("MID", "").toString();//元数据集ID
            
            String sql = "select * from TB_COLUMN where METADATAID = '" + mID + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 共享交换首页-汇总数
     */
    @RequestMapping( "getIndexSumValue" )
    public EdatResult getIndexSumValue(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            } 
            
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            String names = "";
            if (!userlevel.equals("0") && !userlevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            String sql1   = "";
            /*String sql1 = "select count(1) count  from TB_WRDKJBXXB where DELETE_TSAMP is null";
            if("2".equals(userlevel)){
            	sql1 += " and  \"PROVINCE_CODE\" ='" + regionCode.substring(0, 2) + "0000'";
            }
            
            sql1 +=	" union ALL" +
		            " select count(1)   from YZ_CONS where 1=1";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql1 += " and PROVINCENAME like '%" + names + "%'";
            }
            
            sql1 += " union ALL" +
		            " select count(1)   from \"tb_key_industry_enterprise\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql1 += " and \"province\"='" + regionCode.substring(0, 2) + "0000'";
            }*/
            
            //数据总量
            sql1 += " union ALL" +
		            " select sum(\"serviceAccount\") from \"tb_source_metadata\"" ;
            
            //数据容量
            sql1 +=	" union ALL" +
            	     "  select sum(bytes)/(1024*1024*1024) as \"size(G)\" from SYS.USER_SEGMENTS";
            
            
            /*
            sql1 += " union ALL" +
		            " select count(1)  from ELIMINATE_BACKWARD where 1=1" ;
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql1 += " and PROVINCE like '%" + names + "%'";
            }
            
            sql1 +=	" union ALL" +
		            " select count(1)  from \"mlr_mining_rights\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel) && names.length()>=2){
            	sql1 += " and (\"dz\" like '%" + names.substring(0, 2) + "%' )";
            }*/
           /* String sql1 = "select count(1) count  from TB_WRDKJBXXB where DELETE_TSAMP is null" + 
							" union ALL" +
		            		" select count(1)   from YZ_CONS" +
		            		" union ALL" +
		            		" select count(1)   from \"tb_key_industry_enterprise\"" +
		            		" union ALL" +
//		            		" select count(1)  from ELIMINATE_BACKWARD" +
//		            		" union ALL" +
//		            		" select count(1)  from \"mlr_mining_rights\""+
//		            		" union ALL" +
							" select sum(\"serviceAccount\") from \"tb_source_metadata\"";
//							" union ALL ";
//            sql1 = " select sum(bytes)/1024/1024 from \"SYS\".\"dba_segments\" where owner='SEIMP'";
*/            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * @Description:根据部委统计图
     */
    @RequestMapping( "getStaByMinistry" )
    public EdatResult getStaByMinistry(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select T1.\"name\",T1.\"id\",nvl(T0.\"serviceCount\",0) \"serviceCount\",nvl(T0.\"metadataCount\",0) \"metadataCount\",T0.\"ministry\" from (SELECT sum(\"serviceAccount\") \"serviceCount\", sum(1) \"metadataCount\", \"ministry\" from \"tb_source_metadata\" GROUP BY \"ministry\" )T0 " + " right join \"tb_ministry_dict\" T1 on T0.\"ministry\"= T1.\"id\" order by T1.\"ordernum\" asc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                if (map.get("value") == null) {
                    map.put("value", 0);
                }
            }
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    


    
}
