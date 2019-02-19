package com.gistone.seimp.controller.share;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;
import oracle.sql.CLOB;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.controller.Check;
import com.gistone.seimp.service.CheckService;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.service.VisitOrDownService;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.DateUtil;
import com.gistone.seimp.util.EdatResult;
import com.gistone.seimp.util.ExcelUtils;
import com.gistone.seimp.util.UrlsUtil;
import com.gistone.seimp.util.XSSFExcelUtils;

/**
 * 共享交换-举报预警12369
 *
 */
@RestController
@RequestMapping("shareExchange/jubao12369")
@SuppressWarnings("all")
public class Jubao12369Controller {
	
	//当前模块功能索引
	private String rightIndex = "5";
	
	@Autowired
	private GetBySqlMapper getBySqlMapper;
	
	@Autowired
	private LogToDb logToDb;
	
	@Autowired
	private UrlsUtil urlsUtil;
	
	@Autowired
	private VisitOrDownService visitOrDownService;
	
	@Autowired
	private CheckService checkService;
	
	/**
     * 获取根据行业大类统计数据
     * 省级用户处理
     */
    @RequestMapping( "getStatisDataOfHyname" )
    public EdatResult getStatisDataOfHyname(HttpServletRequest request, HttpServletResponse response) {
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
            
            String sql = "select count(1) count,c1.REPORT_FROM_NAME \"name\" from \"YQ12369_DSJ_REPORTINFO\" T1"
            		+ " left join \"YQ12369_DSJ_COD_REPORTFROM\" c1 on T1.REPORT_FROM=c1.\"REPORT_FROM\""
            		+ " where 1=1 ";
            //省级用户处理
            if("2".equals(userlevel)){
            	sql += " and AREA_CODE like '" + regionCode.substring(0, 2) +"%'";
            }
            sql += " group by c1.\"REPORT_FROM_NAME\" order by count desc";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取根据省份统计数据
     * 省级用户处理
     */
    @RequestMapping( "getStatisDataOfProvince" )
    public EdatResult getStatisDataOfProvince(HttpServletRequest request, HttpServletResponse response) {
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
            
            String sql = "select count(1) count,c1.\"name\" \"name\" from \"YQ12369_DSJ_REPORTINFO\" T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.AREA_CODE, 0, 2), '0000')=c1.\"code\" "
            		+ " where 1=1 ";
            //省级用户处理
            if("2".equals(userlevel)){
            	sql += " and AREA_CODE like '" + regionCode.substring(0, 2) +"%'";
            }
            sql += " group by c1.\"name\" order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取根据省份统计数据
     * 省级用户处理
     */
    @RequestMapping( "getStatisDataOfCity" )
    public EdatResult getStatisDataOfCity(HttpServletRequest request, HttpServletResponse response) {
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
            
            String sql = "select count(1) count,c1.\"name\" \"name\" from \"YQ12369_DSJ_REPORTINFO\" T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.AREA_CODE, 0, 4), '00')=c1.\"code\" "
            		+ " where 1=1 ";
            //省级用户处理
            if("2".equals(userlevel)){
            	sql += " and AREA_CODE like '" + regionCode.substring(0, 2) +"%'";
            }
            sql += " group by c1.\"name\" order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	/**
	 * 涉重有色金属采矿权项目，分页数据
	 * bootstrap-table
	 */
	@RequestMapping( "getJubaoData" )
    public Map getJubaoData(HttpServletRequest request, HttpServletResponse response) {
		try {
			ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //登录用户
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
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize", "10").toString());//每页条数
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "0").toString());//开始索引
            String reportDeptName = data.getOrDefault("reportDeptName","").toString();//举报对象
            String locationLabel = data.getOrDefault("locationLabel","").toString();//详细地址
            String reportFrom = data.getOrDefault("reportFrom", "").toString();//举报方式
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metaID = data.getOrDefault("metaID", "").toString();//数据集ID
            
            if(metaID==""){
            	return null;
            }
            
            //判断数据集权限
            int selectAuth = checkService.CheckSelectAuth(request, metaID);
            if(selectAuth != 0){
            	 Map map = new HashMap();
                 map.put("status", status);
                 return map;
            }
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from ( select * from (select R.*,ROWNUM RN from(select \"REPORT_ID\", \"EVENT_NUMBER\",to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss') \"REPORT_TIME\" ,"
            			+ " \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\", \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\","
            			+ " \"REPORT_LATITUDE\"," + " \"PROCESS_AREA_UNITNAME\", \"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\","
            			+ " to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') \"INSERTTIME\" "
            			+ " from \"YQ12369_DSJ_REPORTINFO\" where 1=1 ";
            String sql2 = "select count(1) from \"YQ12369_DSJ_REPORTINFO\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if("2".equals(userlevel)){
            	sqlWhere += " and AREA_CODE like '" + regionCode.substring(0, 2) +"%'";
            }
            if (!reportDeptName.equals("")) {
            	sqlWhere += " and REPORT_DEPT_NAME like '%" + reportDeptName + "%'";
            }
            if (!locationLabel.equals("")) {
            	sqlWhere += " and LOCATION_LABEL like '%" + locationLabel + "%'";
            }
            if (!reportFrom.equals("")) {
            	sqlWhere += " and REPORT_FROM = '" + reportFrom + "'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and AREA_CODE like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and AREA_CODE like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and AREA_CODE like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += " order by INSERTTIME desc nulls last)R)  where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize) + ")T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.AREA_CODE, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.AREA_CODE, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.AREA_CODE = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理clob类型数据
            for (Map map : list) {
                if (map.get("REPORT_CONTENT") == null) {
                    map.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("REPORT_CONTENT");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("REPORT_CONTENT", content1);
                }
                if (map.get("FINALOPINION") == null) {
                    map.put("FINALOPINION", "");
                } else {
                    CLOB clob = (CLOB) map.get("FINALOPINION");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("FINALOPINION", content);
                }

            }
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看12369举报预警数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	/**
	 * 
	 */
	@RequestMapping( "getJubaoDataByID" )
    public EdatResult getJubaoDataByID(HttpServletRequest request, HttpServletResponse response) {
		try {
			ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            //登录用户
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
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String REPORT_ID = data.getOrDefault("REPORT_ID","").toString();//
            
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from ( select \"REPORT_ID\", \"EVENT_NUMBER\","
            		+ " to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss') \"REPORT_TIME\" ,"
        			+ " \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\", \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\","
        			+ " \"REPORT_LATITUDE\", \"PROCESS_AREA_UNITNAME\", \"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\","
        			+ " to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') \"INSERTTIME\",ROWNUM RN"
        			+ " from \"YQ12369_DSJ_REPORTINFO\" where REPORT_ID='" + REPORT_ID + "'";
            
            sql1 += " )T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.AREA_CODE, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.AREA_CODE, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.AREA_CODE = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
          //处理clob类型数据
            for (Map map : list) {
                if (map.get("REPORT_CONTENT") == null) {
                    map.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("REPORT_CONTENT");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("REPORT_CONTENT", content1);
                }
                if (map.get("FINALOPINION") == null) {
                    map.put("FINALOPINION", "");
                } else {
                    CLOB clob = (CLOB) map.get("FINALOPINION");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("FINALOPINION", content);
                }

            }

            if(list.size()>0){
            	return EdatResult.ok(list.get(0));
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
	}
	
	
	
    
    /**
     * 获取按更新时间统计数据
     */
    @RequestMapping( "getStatisDataByUpdateTime" )
    public EdatResult getStatisDataByUpdateTime(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            //登录用户
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getOrDefault("startTime", "").toString();//开始时间
            String endTime = data.getOrDefault("endTime", "").toString();//结束时间
            String statisType = data.getOrDefault("statisType", "天").toString();//统计类型
            
            //处理统计类型
            int substrLength = 10;
            String datePartten = "yyyy-mm-dd";
            if("月".equals(statisType)){
            	datePartten = "yyyy-mm";
            }else if("年".equals(statisType)){
            	datePartten = "yyyy";
            }
            
            String sql = "select count(1) count,to_char(\"INSERTTIME\",'" + datePartten + "')  UPDATETIME from \"YQ12369_DSJ_REPORTINFO\" where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"INSERTTIME\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"INSERTTIME\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"INSERTTIME\",'" + datePartten + "')  order by to_char(\"INSERTTIME\",'" + datePartten + "')  nulls last ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          //处理数据，添加0
            //1.获取开始时间，结束时间
            Date startDate = null;
            Date endDate = null;
            int currIndex = 0;
            List<Map> newResult = new ArrayList<Map>();
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            if("".equals(startTime)){
            	startDate = DateUtil.getNullStartDate(result, df);
            	if(startDate == null){
            		return EdatResult.ok(result);
            	}
            }else{
            	startDate = df.parse(startTime);
            }
            if("".equals(endTime)){
            	endDate = DateUtil.getNullEndDate(result, df);
            	if(endDate == null){
            		return EdatResult.ok(result);
            	}
            }else{
            	endDate = df.parse(endTime);
            }
            
            //循环添加
            while(true){
            	//列表中数据
            	Map currMap = null;
            	if(currIndex < result.size()){
            		currMap = result.get(currIndex);
            	}
            	Date currDate = null;
            	Map newMap = new HashMap();
            	if(currMap!=null && currMap.containsKey("UPDATETIME") && currMap.get("UPDATETIME")!=null && currMap.get("UPDATETIME")!=""){
            		currDate = df.parse(currMap.get("UPDATETIME").toString());
            	}
            	if(currDate!=null && startDate.getTime() == currDate.getTime()){
            		newMap.put("UPDATETIME", currMap.get("UPDATETIME"));
            		newMap.put("COUNT", currMap.get("COUNT"));
            		currIndex++;
            	}else{
            		newMap.put("UPDATETIME", df.format(startDate));
            		newMap.put("COUNT", 0);
            	}
            	newResult.add(newMap);
            	
            	//判断是否结束
            	if(startDate.getTime() >= endDate.getTime()){
            		break;
            	}else{
            		//时间+1
            		Calendar cal = Calendar.getInstance();
            		cal.setTime(startDate);
            		cal.add(Calendar.DAY_OF_YEAR, 1);
            		startDate = cal.getTime();
            	}
            }
            
          return EdatResult.ok(newResult);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    //排污许可证注销/撤销数据-最后更新时间
    //省级用户处理
    @RequestMapping("getLastUpdateTime")
	public EdatResult getLastUpdateTime(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            
            String sql = "select to_char( MAX(\"INSERTTIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from \"YQ12369_DSJ_REPORTINFO\" where 1=1";
            
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list.get(0));
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    /**
     * 污染地块Excel文件下载
     */
    @RequestMapping( "getExcelFile" )
    public EdatResult getExcelFile(HttpServletRequest request, HttpServletResponse response) {
        try {
        	
        	ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
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
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String reportDeptName = data.getOrDefault("reportDeptName","").toString();//举报对象
            String locationLabel = data.getOrDefault("locationLabel","").toString();//详细地址
            String reportFrom = data.getOrDefault("reportFrom", "").toString();//举报方式
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from ( select * from (select \"REPORT_ID\", \"EVENT_NUMBER\",to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss') \"REPORT_TIME\" ,"
        			+ " \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\", \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\","
        			+ " \"REPORT_LATITUDE\"," + " \"PROCESS_AREA_UNITNAME\", \"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\","
        			+ " to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') \"INSERTTIME\",ROWNUM RN"
        			+ " from \"YQ12369_DSJ_REPORTINFO\" where 1=1 ";
	
            String sql2 = "select count(1) from \"YQ12369_DSJ_REPORTINFO\" where 1=1";
            
	        String sqlWhere = "";
	        //省级用户处理
	        if("2".equals(userlevel)){
	        	sqlWhere += " and AREA_CODE like '" + regionCode.substring(0, 2) +"%'";
	        }
	        if (!reportDeptName.equals("")) {
	        	sqlWhere += " and REPORT_DEPT_NAME like '%" + reportDeptName + "%'";
	        }
	        if (!locationLabel.equals("")) {
	        	sqlWhere += " and LOCATION_LABEL like '%" + locationLabel + "%'";
	        }
	        if (!reportFrom.equals("")) {
	        	sqlWhere += " and REPORT_FROM = '" + reportFrom + "'";
	        }
	        if(!"".equals(province)){
	        	sqlWhere += " and AREA_CODE like '" + province.substring(0, 2) + "%'";
	        }
	        if(!"".equals(city)){
	        	sqlWhere += " and AREA_CODE like '" + city.substring(0, 4) + "%'";
	        }
			if(!"".equals(county)){
				sqlWhere += " and AREA_CODE like '" + county + "'";
			}
	        
			sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);
            if(total>500000){
            	return  EdatResult.ok("您当前下载的数据量过大，请设置过滤条件后重新下载！");
            }
			
	        sql1 += sqlWhere;
	        sql1 += "))T1"
	        		+ " left join \"tb_city\" c1 on concat(substr(T1.AREA_CODE, 0, 2), '0000')=c1.\"code\" "
	        		+ " left join \"tb_city\" c2 on concat(substr(T1.AREA_CODE, 0, 4), '00')=c2.\"code\" "
	        		+ " left join \"tb_city\" c3 on T1.AREA_CODE = c3.\"code\" ";
            
            sql1 += sqlWhere;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
         
            for (Map map : list) {
            	 //处理clob类型数据
                if (map.get("REPORT_CONTENT") == null) {
                    map.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("REPORT_CONTENT");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("REPORT_CONTENT", content1);
                }
                if (map.get("FINALOPINION") == null) {
                    map.put("FINALOPINION", "");
                } else {
                    CLOB clob = (CLOB) map.get("FINALOPINION");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("FINALOPINION", content);
                }
                
                if(map.containsKey("REPORT_FROM") && map.get("REPORT_FROM")!=null){
                	String newStr = map.get("REPORT_FROM").toString();
            		String oldStr = map.get("REPORT_FROM").toString();
            		if("0".equals(oldStr)){
            			newStr = "微信";
            		}
            		if("1".equals(oldStr)){
            			newStr = "电话";
            		}
            		if("2".equals(oldStr)){
            			newStr = "网络";
            		}
            		map.put("REPORT_FROM", newStr);
                }else{
                	map.put("REPORT_FROM", "");
                }
                
                if(map.containsKey("REPORT_DEPT_NAME") && map.get("REPORT_DEPT_NAME")!=null){
                	String newStr = map.get("REPORT_DEPT_NAME").toString();
            		String oldStr = map.get("REPORT_DEPT_NAME").toString();
            		if("(null)".equals(oldStr)){
            			newStr = "";
            		}
            		map.put("REPORT_DEPT_NAME", newStr);
                }else{
                	map.put("REPORT_DEPT_NAME", "");
                }

            }
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("EVENT_NUMBER", "举报编号");
            map.put("REPORT_FROM", "举报方式");
            map.put("REPORT_DEPT_NAME", "举报对象");
            map.put("LOCATION_LABEL", "详细地址");
            map.put("PROVINCE", "对接省份");
            map.put("CITY", "对接市区");
            map.put("COUNTY", "对接县区");
            map.put("REPORT_CONTENT", "污染描述");
            map.put("REPORT_LONGITUDE", "经度");
            map.put("REPORT_LATITUDE", "纬度");
            map.put("PROCESS_AREA_UNITNAME", "");
            map.put("PROCESS_AREA_UNITNAME", "办理单位");
            map.put("FINALOPINION", "办结意见");
            map.put("REPORT_TIME", "举报时间");
            map.put("INSERTTIME", "更新时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = XSSFExcelUtils.writesNew(list, map, "12369举报预警数据", geturl, response);
            
            //记录下载记录
            
            Map userMap = new HashMap();
            int userID = Integer.parseInt(session.getAttribute("userID").toString());
            String userIP = request.getRemoteAddr();
            userMap.put("userID", userID);
            userMap.put("userIP", userIP);
            visitOrDownService.addData(metadataID, "2", userMap);
            
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
}
