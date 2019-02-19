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
 * 共享交换-排污许可证数据-注销/撤销数据
 *
 */
@RestController
@RequestMapping("shareExchange/enterUndo")
@SuppressWarnings("all")
public class EnterpriseUndoinfoController {
	
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
            
            String sql = "select count(1) count,HYNAME \"name\" from ( "
            		+ " select ui.ENTERID,ui.DELSTATUS,BI.HYNAME,BI.PROVINCECODE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,HYNAME,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,HYNAME,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " ) where DELSTATUS=0";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            sql += " group by HYNAME order by count desc";
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
            
            String sql = "select count(1) count,PROVINCE \"name\" from ("
            		+ " select ui.ENTERID,ui.DELSTATUS,BI.PROVINCE,BI.PROVINCECODE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ ") where  DELSTATUS=0";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            sql += " group by PROVINCE order by count asc ";
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
            
            String sql = "select count(1) count,CITY \"name\" from ("
            		+ " select ui.ENTERID,ui.DELSTATUS,BI.PROVINCE,BI.PROVINCECODE,BI.CITYCODE,BI.CITY from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,PROVINCECODE,CITYCODE,CITY from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,PROVINCECODE,CITYCODE,CITY,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ ") where  DELSTATUS=0";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            sql += " group by CITY order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	/**
	 * 排污许可证注销/撤销 ，分页数据
	 * 省级用户处理
	 * bootstrap-table
	 */
	@RequestMapping( "getEnterpriseUndoinfoData" )
    public Map getEnterpriseUndoinfoData(HttpServletRequest request, HttpServletResponse response) {
		try {
			ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            
            //登录用户
            HttpSession session = request.getSession();
            String userID = session.getAttribute("userID").toString();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";//省份名称
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String isType = data.getOrDefault("isType","").toString();//撤销、注销类型  1：注销，2：撤销
            String unitName = data.getOrDefault("unitName","").toString();//单位名称
            String zxType = data.getOrDefault("zxType","").toString();//注销/撤销类型
            String createTimeStart = data.getOrDefault("createTimeStart","").toString();//注销/撤销时间开始
            String createTimeEnd = data.getOrDefault("createTimeEnd","").toString();//注销/撤销时间结束
            
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize","10").toString());
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber","0 ").toString());
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
            
            String sql1 = "select * from (select T1.*, ROWNUM RN from (select ui.UNITNAME,ui.ENTERID,ui.XKZNUMBER,ui.ZXTYPE,ui.ZXREASON,ui.ISTYPE,ui.CREATETIME,"
            		+ "to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME,bi.PROVINCE,bi.CITY,bi.COUNTY,bi.LONGITUDE,bi.LATITUDE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0 ";
//            String sql2 = "select count(*) from ENTERPRICE_UNDOINFO where 1=1 and DELSTATUS=0 ";
            String sql2 = "select count(1) from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0 ";
            String sqlWhere = "";
            String sqlOrder = " order by INSERTTIME DESC nulls last ";
            if(!"".equals(isType)){
            	sqlWhere += " and ISTYPE = '" + isType + "'";
            }
            if(!"".equals(unitName)){
            	sqlWhere += " and UNITNAME like '%" + unitName + "%'";
            }
            if(!"".equals(zxType)){
            	sqlWhere += " and ZXTYPE = '" + zxType + "'";
            }
            if(!"".equals(createTimeStart)){
            	sqlWhere += " and CREATETIME >= '" + createTimeStart + " 00:00:00'";
            }
            if(!"".equals(createTimeEnd)){
            	sqlWhere += " and CREATETIME <= '" + createTimeEnd + " 23:59:59'";
            }
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userLevel)){
            	sqlWhere += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' )";
            }
            
            
            sql1 += sqlWhere + sqlOrder + "   )T1) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            Integer total = getBySqlMapper.findrows(sql2);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	//获取所有的注销/撤销类型
    @RequestMapping("getAllZXTYPEByZXTYPE")
	public EdatResult getAllZXTYPEByZXTYPE(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String isType = data.getOrDefault("isType", "").toString();//撤销、注销类型  1：注销，2：撤销
            
            String sql = "select ZXTYPE from ENTERPRICE_UNDOINFO where DELSTATUS=0 ";
            String sqlWhere = " ";
            if(!"".equals(isType)){
            	sqlWhere += " and ISTYPE = '" + isType + "'";
            }
            sql += (sqlWhere + " group by ZXTYPE");
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    /**
     * 获取按更新时间统计数据
     * 省级用户处理
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
            
            String sql = "select count(1) count,to_char(ui.INSERTTIME,'" + datePartten + "')  UPDATETIME from "
            		+ "(select INSERTTIME,ENTERID from ENTERPRICE_UNDOINFO where  DELSTATUS=0 ";
            
            if(!"".equals(startTime)){
            	sql += " and INSERTTIME>=to_date('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and INSERTTIME<=to_date('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += ") ui ";
            			
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql +=  "left join  (" 
            			+ " select ENTERID,ITEMENDTIME,PROVINCECODE from "
            			+ " (select ENTERID,ITEMENDTIME,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            			+ " where TEMP.ROW_FLG=1"
            			+ ") bi on ui.ENTERID=bi.ENTERID "
            			+ " where 1=1 ";
            	sql += " and bi.PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            
            sql += " group by to_char(ui.INSERTTIME,'" + datePartten + "')  order by to_char(ui.INSERTTIME,'" + datePartten + "')  nulls last ";
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
            
            
            String sql = "select to_char( MAX(ui.INSERTTIME),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from "
            		+ "(select INSERTTIME,ENTERID from ENTERPRICE_UNDOINFO where  DELSTATUS=0) ui";
            		
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " left join  (" 
            			+ " select ENTERID,ITEMENDTIME,PROVINCECODE from "
            			+ " (select ENTERID,ITEMENDTIME,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            			+ " where TEMP.ROW_FLG=1"
            			+ ") bi on ui.ENTERID=bi.ENTERID "
            			+ " where 1=1 ";
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            
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
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            HttpSession session = request.getSession();
            String userID = session.getAttribute("userID").toString();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";//省份名称
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String isType = data.getOrDefault("isType","").toString();//撤销、注销类型  1：注销，2：撤销
            String unitName = data.getOrDefault("unitName","").toString();//单位名称
            String zxType = data.getOrDefault("zxType","").toString();//注销/撤销类型
            String createTimeStart = data.getOrDefault("createTimeStart","").toString();//注销/撤销时间开始
            String createTimeEnd = data.getOrDefault("createTimeEnd","").toString();//注销/撤销时间结束
            String metadataID = data.getOrDefault("metadataID" ,"").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "select * from (select T1.*, ROWNUM RN from (select ui.UNITNAME,ui.ENTERID,ui.XKZNUMBER,ui.ZXTYPE,ui.ZXREASON,ui.ISTYPE,ui.CREATETIME,"
            		+ "to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME,bi.PROVINCE,bi.CITY,bi.COUNTY,bi.LONGITUDE,bi.LATITUDE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0 ";
//            String sql2 = "select count(*) from ENTERPRICE_UNDOINFO where 1=1 and DELSTATUS=0 ";
            String sql2 = "select count(1) from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0 ";
            String sqlWhere = "";
            String sqlOrder = " order by CREATETIME ";
            if(!"".equals(isType)){
            	sqlWhere += " and ISTYPE = '" + isType + "'";
            }
            if(!"".equals(unitName)){
            	sqlWhere += " and UNITNAME like '%" + unitName + "%'";
            }
            if(!"".equals(zxType)){
            	sqlWhere += " and ZXTYPE = '" + zxType + "'";
            }
            if(!"".equals(createTimeStart)){
            	sqlWhere += " and CREATETIME >= '" + createTimeStart + " 00:00:00'";
            }
            if(!"".equals(createTimeEnd)){
            	sqlWhere += " and CREATETIME <= '" + createTimeEnd + " 23:59:59'";
            }
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userLevel)){
            	sqlWhere += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' )";
            }
            
            
            sql1 += sqlWhere + sqlOrder + " )T1) ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理注销/撤销类型字段
            for (Map map : list) {
				if(map!=null && map.get("ISTYPE")!=null){
					if("1".equals(map.get("ISTYPE").toString())){
						map.put("ISTYPECHN", "注销");
					}else if("2".equals(map.get("ISTYPE").toString())){
						map.put("ISTYPECHN", "撤销");
					}
				}
			}
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("UNITNAME", "单位名称");
            map.put("PROVINCE", "省");
            map.put("CITY", "市");
            map.put("COUNTY", "县");
            map.put("XKZNUMBER", "许可证编号");
            map.put("ZXTYPE", "注销/撤销原因类型");
            map.put("ZXREASON", "注销/撤销原因");
            map.put("ISTYPECHN", "注销/撤销");
            map.put("CREATETIME", "注销/撤销时间");
            map.put("INSERTTIME", "更新时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = XSSFExcelUtils.writesNew(list, map, "排污许可证注销撤销数据", geturl, response);
            
            //记录下载记录
            Map userMap = new HashMap();
            int userID2 = Integer.parseInt(session.getAttribute("userID").toString());
            String userIP = request.getRemoteAddr();
            userMap.put("userID", userID2);
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
