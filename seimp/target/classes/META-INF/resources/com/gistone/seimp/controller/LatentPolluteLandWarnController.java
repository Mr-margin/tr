package com.gistone.seimp.controller;

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

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;
import com.gistone.seimp.util.ExcelUtils;
import com.gistone.seimp.util.UrlsUtil;
import com.sun.jndi.toolkit.url.UrlUtil;

/**
 * 潜在污染地块预警
 * @author 罗文斌
 *
 */
@RestController
@RequestMapping("lplw")
@SuppressWarnings("all")
public class LatentPolluteLandWarnController {
	//当前模块功能索引
	private String rightIndex = "4";
	
	Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    
    @Autowired
    private LogToDb logToDb;
    
    @Autowired
    private UrlsUtil urlsUtil;
    
    //排污许可证注销/撤销数据-查询列表---
    //分页查询--bootstrap table
    //省级用户处理
    @RequestMapping("getEnterpriceUndoInfoData")
	public Map getEnterpriceUndoInfoData(HttpServletRequest request, HttpServletResponse response){
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
            String isType = data.getString("isType");//撤销、注销类型  1：注销，2：撤销
            String unitName = data.getString("unitName");//单位名称
            String zxType = data.getString("zxType");//注销/撤销类型
            String createTimeStart = data.getString("createTimeStart");//注销/撤销时间开始
            String createTimeEnd = data.getString("createTimeEnd");//注销/撤销时间结束
            String timeRange = data.getString("timeRange");//时间范围
            String timeSort = data.getString("timeSort");//时间排序方式
            
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            String sql1 = "select * from (select T1.*, ROWNUM RN from (select ui.*,bi.PROVINCE,bi.CITY,bi.COUNTY,bi.LONGITUDE,bi.LATITUDE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0  and bi.ENTERID is not null";
//            String sql2 = "select count(*) from ENTERPRICE_UNDOINFO where 1=1 and DELSTATUS=0 ";
            // and bi.ENTERID is not null
            String sql2 = "select count(1) from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0  and bi.ENTERID is not null";
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
            /*
            if(!"".equals(timeRange)){
            	Calendar calendar = Calendar.getInstance();
            	if(timeRange.contains("天")){
            		Integer days = Integer.parseInt(timeRange.substring(0, timeRange.length() - 1));
            		calendar.add(Calendar.DAY_OF_YEAR, -days);
            		Date time = calendar.getTime();
            		String timeStr = df.format(time);
            		sqlWhere += " and CREATETIME >= '"+timeStr +" 00:00:00'";
            	}else if(timeRange.contains("月")){
            		Integer months = Integer.parseInt(timeRange.substring(0, timeRange.length() - 1));
            		calendar.add(Calendar.MONTH, -months);
            		Date time = calendar.getTime();
            		String timeStr = df.format(time);
            		sqlWhere += " and CREATETIME >= '"+timeStr +" 00:00:00'";
            	}else if(timeRange.contains("年")){
            		Integer years = Integer.parseInt(timeRange.substring(0, timeRange.length() - 1));
            		calendar.add(Calendar.YEAR, -years);
            		Date time = calendar.getTime();
            		String timeStr = df.format(time);
            		sqlWhere += " and CREATETIME >= '"+timeStr +" 00:00:00'";
            	}
            }
            */
            if(!"".equals(timeSort)){
            	sqlOrder += timeSort;
            }else{
            	sqlOrder += " ASC";
            }
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userLevel)){
            	sqlWhere += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' or PROVINCECODE is null)";
            }
            
            
            sql1 += sqlWhere + sqlOrder + " )T1) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            sql2 += sqlWhere;
            List<Map> list = getBySqlMapper.findRecords(sql1);
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
    
    //根据企业主键关联，查询排污许可证注销/撤销详细信息：注销/撤销信息、企业信息
    @RequestMapping("getEnterpriceBaseInfoDataByEnterId")
	public EdatResult getEnterpriceBaseInfoDataByEnterId(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            
            String sql = "select * from (select * from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.*,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            if(list.size()>0){
            	return EdatResult.ok(list.get(0));
            }
            
            return EdatResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    //排污许可证注销/撤销数据-分省统计
    //省级用户处理
    @RequestMapping("getStatisDataOfEnterpriceUndoDataByProvince")
	public EdatResult getStatisDataOfEnterpriceUndoDataByProvince(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
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
            
            String sql = "select count(1),bi.PROVINCE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where ui.DELSTATUS=0  and bi.ENTERID is not null ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userLevel)){
            	sql += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' or PROVINCECODE is null)";
            }
            
            sql	+= " group by bi.PROVINCE"
            		+ " order by count(1) ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    //排污许可证注销/撤销数据-按行业统计
    //省级用户处理
    @RequestMapping("getStatisDataOfEnterpriceUndoDataByHYNAME")
	public EdatResult getStatisDataOfEnterpriceUndoDataByHYNAME(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
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
            
            String sql = "select count(1),bi.HYNAME from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,HYNAME from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,PROVINCECODE,HYNAME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where ui.DELSTATUS=0  and bi.ENTERID is not null ";
            		
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userLevel)){
            	sql += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' or PROVINCECODE is null)";
            }
            
			sql += " group by bi.HYNAME "
            		+ "	order by count(1) ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    //排污许可证注销/撤销数据-关联污染地块信息
    @RequestMapping("getWrdkDataByEnterId")
	public EdatResult getWrdkDataByEnterId(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            String joinType = data.getString("joinType");//关联类型：1：相同企业名称，2：相同组织机构代码
            String undoColumnName = "DEVCOMPANY";
            String wrdkColumnName = "SYQDWMC";
            if("2".equals(joinType)){
            	undoColumnName = "CREDITCODE";
                wrdkColumnName = "GSYYZZH";
            }
            
            String sql = "select T2.*,ui.ENTERID from ENTERPRICE_UNDOINFO ui left join"+
            		" (" +
            			" select bi.ENTERID,T1.* from ENTERPRICE_BASEINFO bi left join"+
            			" ("+
            				"select jb.WRDKBM,jb.WRDKMC,jb.SCJDBM,gb.SYQDWMC,gb.GSYYZZH from TB_WRDKJBXXB jb left join TB_GBQYJBQK gb on JB.WRDKBM=gb.WRDKBM"
            				+ " where   jb.DELETE_TSAMP is null"+
            			" ) T1"+
            			" on BI." + undoColumnName + "= T1." + wrdkColumnName + ""+
            		" )T2"+
            		" on ui.ENTERID=T2.ENTERID where ui.DELSTATUS=0 and ui.ENTERID='" + enterId + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    //搜索附近的污染地块
    @RequestMapping("getWrdkDataByRange")
	public Map getWrdkDataByRange(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            Map<String, String[]> parameterMap = request.getParameterMap();
            
            String parameter = request.getParameter("data");
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            double minLon = Double.parseDouble(data.getString("minLon"));
            double maxLon = Double.parseDouble(data.getString("maxLon"));
            double minLat = Double.parseDouble(data.getString("minLat"));
            double maxLat = Double.parseDouble(data.getString("maxLat"));
            
            //获取排污许可证企业的坐标
            String sql = "select jb.WRDKBM,jb.WRDKMC,jb.SCJDBM,gb.SYQDWMC,gb.GSYYZZH,gb.WRDKZXJD lon,gb.WRDKZXWD lat from TB_WRDKJBXXB jb left join TB_GBQYJBQK gb on JB.WRDKBM=gb.WRDKBM"
            		+ " where jb.DELETE_TSAMP is null and gb.WRDKZXJD >= " + minLon + " and gb.WRDKZXJD <= " + maxLon + " and gb.WRDKZXWD >= " + minLat + " and gb.WRDKZXWD <= " + maxLat;
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            Map scjdbmMap = new HashMap();
            scjdbmMap.put("S0", "疑似地块");
            scjdbmMap.put("S1", "初步调查");
            scjdbmMap.put("S2", "详细调查");
            scjdbmMap.put("S3", "风险评估");
            scjdbmMap.put("S4", "风险管控");
            scjdbmMap.put("S5", "土壤修复与治理");
            scjdbmMap.put("S6", "土壤修复与治理评估");
            
            for (Map map : list) {
				if(map.get("SCJDBM")!=null && map.get("SCJDBM")!=""){
					map.put("scjdbmChn",scjdbmMap.get(map.get("SCJDBM").toString()).toString());
				}
			}
            
            Map result = new HashMap();
            result.put("rows", list);
//            result.put("total", total);
//            result.put("page", pageNumber / pageSize);
            return result;
		} catch (Exception e) {
			List<Map> list = new ArrayList<Map>();
			Map result = new HashMap();
	        result.put("rows", list);
            return result;
		}
    }
    
    //排污许可证注销/撤销数据-最后更新时间
    @RequestMapping("getLastUpdateTime")
	public EdatResult getLastUpdateTime(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            
            String sql = "select to_char(MAX(INSERTTIME),'yyyy-mm-dd') UPDATETIME from ENTERPRICE_UNDOINFO where DELSTATUS=0";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list.get(0));
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    //下载功能
    @RequestMapping("getExcelFile")
	public EdatResult getExcelFile(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String isType = data.getString("isType");//撤销、注销类型  1：注销，2：撤销
            String unitName = data.getString("unitName");//单位名称
            String zxType = data.getString("zxType");//注销/撤销类型
            String createTimeStart = data.getString("createTimeStart");//注销/撤销时间开始
            String createTimeEnd = data.getString("createTimeEnd");//注销/撤销时间结束
            String timeRange = data.getString("timeRange");//时间范围
            String timeSort = data.getString("timeSort");//时间排序方式
            
            
            String sql1 = "select ui.*,bi.PROVINCE,bi.CITY,bi.COUNTY,bi.LONGITUDE,bi.LATITUDE from ENTERPRICE_UNDOINFO ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
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
            if(!"".equals(timeSort)){
            	sqlOrder += timeSort;
            }else{
            	sqlOrder += " ASC";
            }
            sql1 += sqlWhere + sqlOrder;
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
            map.put("ISTYPECHN", "注销/撤销类型");
            map.put("PROVINCE", "省");
            map.put("CITY", "市");
            map.put("COUNTY", "县");
            map.put("UNITNAME", "单位名称");
            map.put("ZXTYPE", "注销/撤销原因");
            map.put("CREATETIME", "注销/撤销时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "排污许可证注销撤销数据", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
  //下载功能
    @RequestMapping("getExcelFileByIds")
	public EdatResult getExcelFileByIds(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterIds = data.getString("enterIds");//主键ID
            String timeSort = data.getOrDefault("timeSort","").toString();//时间排序方式
            
            
            String sql1 = "select ui.*,bi.PROVINCE,bi.CITY,bi.COUNTY,bi.LONGITUDE,bi.LATITUDE from "
            		+ " (select * from ENTERPRICE_UNDOINFO where ENTERID in ("+ enterIds +") and DELSTATUS=0) ui "
            		+ " left join ("
            		+ " select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE from "
            		+ " (select ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID "
            		+ " where DELSTATUS=0 ";
            String sqlWhere = "";
            String sqlOrder = " order by CREATETIME ";
            if(!"".equals(timeSort)){
            	sqlOrder += timeSort;
            }else{
            	sqlOrder += " ASC";
            }
            sql1 += sqlWhere + sqlOrder;
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
            map.put("ISTYPECHN", "注销/撤销类型");
            map.put("PROVINCE", "省");
            map.put("CITY", "市");
            map.put("COUNTY", "县");
            map.put("UNITNAME", "单位名称");
            map.put("ZXTYPE", "注销/撤销原因");
            map.put("CREATETIME", "注销/撤销时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "排污许可证注销撤销数据", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证注销/撤销数据--改变上报状态
    @RequestMapping("updateReportStatus")
	public EdatResult updateReportStatus(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
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
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String date = df.format(new Date());
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            String reportStatus = data.getString("reportStatus");//上报类型
            String reportReason = data.getOrDefault("reportReason","").toString();//上报类型
            
            String sql = "update ENTERPRICE_UNDOINFO set REPORTSTATUS='"+reportStatus+"',REPORTTIME=to_date('" + date + "','yyyy-mm-dd hh24:mi:ss'),REPORTUSERID="+userID+
            		",REPORTREASON='"+reportReason+"' where ENTERID='"+enterId+"' and DELSTATUS=0";
            getBySqlMapper.update(sql);
            return EdatResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    /**
     * 疑似污染地块预警首页-汇总数
     */
    @RequestMapping( "getIndexSumValue" )
    public EdatResult getIndexSumValue(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(1, "fail");
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
            
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            Calendar cal = Calendar.getInstance();
            cal.setTime(new Date());
            cal.add(Calendar.DAY_OF_YEAR, 30);
            String dateStr = df.format(cal.getTime());
            String nowStr = df.format(new Date());
            
            //接收参数
            String sql1 = " select count(1) count from ("
            		+ "		select count(1) from ENTERPRICE_BASEINFO where 1=1";
            if("2".equals(userLevel)){
            	sql1 += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' )";
            }
            
            sql1 += " GROUP BY ENTERID)" +
            		
							" union all" +
            		
							" select count(1)  from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS='0' and ISTYPE='1')ui " +
							"	left join (" +
							"	select ENTERID,ITEMENDTIME,PROVINCECODE from " +
							"	(select ENTERID,ITEMENDTIME,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp" +
							"	where TEMP.ROW_FLG=1" +
							"	) bi on ui.ENTERID=bi.ENTERID " +
							"	where BI.ENTERID is not null ";
            if("2".equals(userLevel)){
            	sql1 += " and (BI.PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' )";
            }
            
            sql1 +=" union all" +

							" select count(1)  from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS='0' and ISTYPE='2')ui " +
							"	left join (" +
							"	select ENTERID,ITEMENDTIME,PROVINCECODE from " +
							"	(select ENTERID,ITEMENDTIME,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp" +
							"	where TEMP.ROW_FLG=1" +
							"	) bi on ui.ENTERID=bi.ENTERID " +
							"	where BI.ENTERID is not null";
            if("2".equals(userLevel)){
            	sql1 += " and (BI.PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' )";
            }
            
            sql1 +=" union all" +
							" select count(1)  from ("
								+ " select ENTERID,ITEMENDTIME,VALITIMES,PROVINCECODE from "
			            		+ " (select ENTERID,ITEMENDTIME,VALITIMES,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
			            		+ " where TEMP.ROW_FLG=1"
								+ ") where substr(VALITIMES,INSTR(VALITIMES,'至',1,1)+1,10)<='" + dateStr + "'"
								+ "	and substr(VALITIMES,INSTR(VALITIMES,'至',1,1)+1,10)>='" + nowStr + "'";
            if("2".equals(userLevel)){
            	sql1 += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' )";
            }
            
            
			sql1 += " union all" +
							" select count(1)  from ENTERPRICE_UNDOINFO where DELSTATUS='0' and REPORTSTATUS='2'" +
							" union all" +
							" select count(1)  from ENTERPRICE_UNDOINFO where DELSTATUS='0' and ISTYPE='3'";
            
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
  //根据企业主键关联，查询企业dataid，查询其他详细信息
    @RequestMapping("getDetailsDataByEnterId")
	public EdatResult getDetailsDataByEnterId(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            
            Map resultMap = new HashMap();
            
            String sql = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            if(list.size()>0){
            	Map map = list.get(0);
            	if(map!=null && map.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = map.get("DATAID").toString();
            		
            		//主要产品及产能信息
            		String sql1 = "select ID,DATAID,PRODUCTNAME,CAPACITY,PRODUNITSNAME "
            				+ " from TB_ENTERPRISE_PRODUCTINFO where DATAID='"+dataID+"'";
            		List<Map> list1 = getBySqlMapper.findRecords(sql1);
            		resultMap.put("productInfo", list1);
            		
            		//主要原辅料信息
            		String sql2 = "select ID,DATAID,HYNAME,DEVICENAME,FUELNAME,YEARMAX,UNITSNAME,POISON "
            				+ " from TB_ENTERPRISE_MATERIAL where DATAID='"+dataID+"'";
            		List<Map> list2 = getBySqlMapper.findRecords(sql2);
            		//根据id，查询原辅料有毒有害成分
            		for (Map map2 : list2) {
						String id = map2.get("ID").toString();
						if(id!=null && !"".equals(id)){
							String sql21 = "select ID,MATERIALID,TAHNAME,PROPORTION from TB_ENTERPRISE_MATERIAL_POISON"
									+ " where MATERIALID='"+id+"'";
							List<Map> list21 = getBySqlMapper.findRecords(sql21);
							//拼接有毒有害成分字符串
							String poisonsStr = "";
							for (Map map3 : list21) {
								if(map3.get("TAHNAME")!=null){
									poisonsStr += map3.get("TAHNAME").toString();
								}
								if(map3.get("PROPORTION")!=null){
									poisonsStr += "(" + map3.get("PROPORTION").toString() + "),";
								}
							}
							//将有毒有害成分字符串放入集合
							map2.put("poisonsStr", poisonsStr);
						}
					}
            		
            		resultMap.put("material", list2);
            		
            		//燃料信息
            		String sql3 = "select ID,DATAID,DEVICENAME,FUELNAME,YEARMAX "
            				+ " from TB_ENTERPRISE_FUEL where DATAID='"+dataID+"'";
            		List<Map> list3 = getBySqlMapper.findRecords(sql3);
            		resultMap.put("fuel", list3);
            		
            		//直接排放口数据
            		String sql4 = "select ID,DATAID,XKDRAINCODE,DRAINNAME,LONGITUDE,LATITUDE,PFQXNAME,PFFSNAME,EMISSIONTIME,"
            				+ "SEWAGENAME,FUNCTIONNAME,FUNCTIONNAME,NATURELATITUDE "
            				+ " from TB_ENTERPRISE_DIRECTLY where DATAID='"+dataID+"'";
            		List<Map> list4 = getBySqlMapper.findRecords(sql4);
            		resultMap.put("drectly", list4);
            		
            		//间接排放口数据
            		String sql5 = "select ID,DATAID,XKDRAINCODE,DRAINNAME,LONGITUDE,LATITUDE,PFQXNAME,PFFSNAME,EMISSIONTIME,"
            				+ "SEWAGENAME "
            				+ " from TB_ENTERPRISE_INDIRECT where DATAID='"+dataID+"'";
            		List<Map> list5 = getBySqlMapper.findRecords(sql5);
            		resultMap.put("indirect", list5);
            		
            		//固体废物排放信息
            		String sql6 = "select ID,DATAID,FWLY,FWMC,FWZLNAME,FWLBNAME,FWMS,FWSCL,FWCLFSNAME,"
            				+ "FWZHLYCLL,FWCZL,FWCCL,FWPFL "
            				+ " from TB_ENTERPRISE_SOLIDWASTE where DATAID='"+dataID+"'";
            		List<Map> list6 = getBySqlMapper.findRecords(sql6);
            		resultMap.put("solidwaste", list6);
            		
            		//2.6.自行监测及记录信息
            		String sql7 = "select ID,DATAID,POLLNAME,XKDRAINCODE,DRAINNAME,MONCONTENT,WRWNAME,ISLINKSCODE,ISSAFE,"
            				+ "TYPECHAR "
            				+ " from TB_ENTERPRISE_MONITORINFO where DATAID='"+dataID+"'";
            		List<Map> list7 = getBySqlMapper.findRecords(sql7);
            		resultMap.put("monitorInfo", list7);
            	}
            }
            
            //许可证变更、延续记录信息
            String sql8 = "select ID,DATAID,DEVCOMPANY,ENTERID,ITEMENDTIME,INFORMATION,XKZNUM,ITEMTYPE "
            		+ " from TB_ENTERPRISE_APPLYRECORD where  ENTERID='" + enterId + "'";
            List<Map> list8 = getBySqlMapper.findRecords(sql8);
    		resultMap.put("applyrecord", list8);
            
            return EdatResult.ok(resultMap);
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    //排污许可证企业，主要产品及产能信息
    //分页查询--bootstrap table
    @RequestMapping("getProductInfoPageData")
	public Map getProductInfoPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,PRODUCTNAME,CAPACITY,PRODUNITSNAME,ROWNUM RN "
            				+ " from TB_ENTERPRISE_PRODUCTINFO where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_PRODUCTINFO where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，主要原辅料信息
    //分页查询--bootstrap table
    @RequestMapping("getMaterialPageData")
	public Map getMaterialPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,HYNAME,DEVICENAME,FUELNAME,YEARMAX,UNITSNAME,POISON,ROWNUM RN "
            				+ " from TB_ENTERPRISE_MATERIAL where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_MATERIAL where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    //根据id，查询原辅料有毒有害成分
            		for (Map map2 : list) {
						String id = map2.get("ID").toString();
						if(id!=null && !"".equals(id)){
							String sql21 = "select ID,MATERIALID,TAHNAME,PROPORTION from TB_ENTERPRISE_MATERIAL_POISON"
									+ " where MATERIALID='"+id+"'";
							List<Map> list21 = getBySqlMapper.findRecords(sql21);
							//拼接有毒有害成分字符串
							String poisonsStr = "";
							for (Map map3 : list21) {
								if(map3.get("TAHNAME")!=null){
									poisonsStr += map3.get("TAHNAME").toString();
								}
								if(map3.get("PROPORTION")!=null){
									poisonsStr += "(" + map3.get("PROPORTION").toString() + "),";
								}
							}
							//将有毒有害成分字符串放入集合
							map2.put("poisonsStr", poisonsStr);
						}
					}
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，燃料信息
    //分页查询--bootstrap table
    @RequestMapping("getFuelPageData")
	public Map getFuelPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,DEVICENAME,FUELNAME,YEARMAX,ROWNUM RN "
            				+ " from TB_ENTERPRISE_FUEL where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_FUEL where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，直接排放口数据
    //分页查询--bootstrap table
    @RequestMapping("getDrectlyPageData")
	public Map getDrectlyPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,XKDRAINCODE,DRAINNAME,LONGITUDE,LATITUDE,PFQXNAME,PFFSNAME,EMISSIONTIME,"
            				+ "SEWAGENAME,FUNCTIONNAME,NATURELONGITUDE,NATURELATITUDE,ROWNUM RN "
            				+ " from TB_ENTERPRISE_DIRECTLY where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_DIRECTLY where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，间接排放口数据
    //分页查询--bootstrap table
    @RequestMapping("getIndirectPageData")
	public Map getIndirectPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,XKDRAINCODE,DRAINNAME,LONGITUDE,LATITUDE,PFQXNAME,PFFSNAME,EMISSIONTIME,"
            				+ "SEWAGENAME,ROWNUM RN "
            				+ " from TB_ENTERPRISE_INDIRECT where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_INDIRECT where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，固体废物排放信息
    //分页查询--bootstrap table
    @RequestMapping("getSolidwastePageData")
	public Map getSolidwastePageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,FWLY,FWMC,FWZLNAME,FWLBNAME,FWMS,FWSCL,FWCLFSNAME,"
            				+ "FWZHLYCLL,FWCZL,FWCCL,FWPFL,ROWNUM RN "
            				+ " from TB_ENTERPRISE_SOLIDWASTE where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_SOLIDWASTE where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，固体废物排放信息
    //分页查询--bootstrap table
    @RequestMapping("getMonitorInfoPageData")
	public Map getMonitorInfoPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            //根据企业主键查询dataid
            String sqlDataid = "select ui.ENTERID,bi.DATAID from (select ENTERID from ENTERPRICE_UNDOINFO where DELSTATUS=0 and ENTERID='" + enterId + "' ) ui"
            		+ " left join ("
            		+ " select * from "
            		+ " (select t4.ENTERID,t4.DATAID,t4.ITEMENDTIME,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO t4) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") bi on ui.ENTERID=bi.ENTERID ";
            List<Map> listDataid = getBySqlMapper.findRecords(sqlDataid);
            if(listDataid.size()>0){
            	Map mapDataid = listDataid.get(0);
            	if(mapDataid!=null && mapDataid.containsKey("DATAID")){
            		//获取企业数据dataid
            		String dataID = mapDataid.get("DATAID").toString();
            		
            		String sql1 = "select * from (select ID,DATAID,POLLNAME,XKDRAINCODE,DRAINNAME,MONCONTENT,WRWNAME,ISLINKSCODE,ISSAFE,"
            				+ "TYPECHAR,ROWNUM RN "
            				+ " from TB_ENTERPRISE_MONITORINFO where 1=1 ";
                    String sql2 = "select count(1) from TB_ENTERPRISE_MONITORINFO where 1=1";
                    String sqlWhere = " and DATAID='"+dataID+"'";
                    
                    sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    
                    sql2 += sqlWhere;
                    Integer total = getBySqlMapper.findrows(sql2);
                    Map result = new HashMap();
                    result.put("rows", list);
                    result.put("total", total);
                    result.put("page", pageNumber / pageSize);
                    return result;
            	}
            }
            
            Map map = new HashMap();
            map.put("status", "0");
            return map;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
    }
    
    //排污许可证企业，许可证变更、延续记录信息
    //分页查询--bootstrap table
    @RequestMapping("getApplyrecordPageData")
	public Map getApplyrecordPageData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterId = data.getString("enterId");//企业主键
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            		
    		String sql1 = "select * from (select ID,DATAID,DEVCOMPANY,ENTERID,ITEMENDTIME,INFORMATION,XKZNUM,ITEMTYPE,"
    				+ "ROWNUM RN "
    				+ " from TB_ENTERPRISE_APPLYRECORD where 1=1 ";
            String sql2 = "select count(1) from TB_ENTERPRISE_APPLYRECORD where 1=1";
            String sqlWhere = " and ENTERID='" + enterId + "'";
            
            sql1 += sqlWhere + ") where RN>"+pageNumber +" and RN<="+(pageNumber+pageSize);
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
    
}
