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

/**
 * 共享交换-污染地块
 *
 */
@RestController
@RequestMapping("wrdk")
@SuppressWarnings("all")
public class WurandikuaiController {
	
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
     * 获取根据所处阶段统计数据
     * 省级用户处理
     */
    @RequestMapping( "getStatisDataOfSCJDBM" )
    public EdatResult getStatisDataOfSCJDBM(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,SCJDBM from TB_WRDKJBXXB where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by SCJDBM order by SCJDBM ";
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
            
            String sql = "select count(1) count,c.\"name\" from TB_WRDKJBXXB w "
            		+ " left join \"tb_city\" c on w.PROVINCE_CODE=c.\"code\" where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by c.\"name\" order by count ASC ";
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
            
            String sql = "select count(1) count,c.\"name\" from TB_WRDKJBXXB w "
            		+ " left join \"tb_city\" c on w.CITY_CODE=c.\"code\" where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by c.\"name\" order by count ASC ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    /**
     * 污染地块分页数据
     * 省级用户处理
     * bootstrap-table
     */
    @RequestMapping( "getWrdkData" )
    public Map getWrdkData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
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
            
            

            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize", "10").toString());
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "0").toString());
            String wrdkbm = data.getOrDefault("wrdkbm", "").toString();//污染地块编码
            String wrdkmc = data.getOrDefault("wrdkmc", "").toString();//污染地块名称
            String scjdbm = data.getOrDefault("scjdbm", "").toString();//所处阶段编码
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
            
            
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\", to_char(INSETTIME,'yyyy-mm-dd HH24:mi:ss') \"INSETTIME\" from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",T5.WRDKZXJD,T5.WRDKZXWD, ROWNUM RN from ("
            		+ " select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\" from \"TB_WRDKJBXXB\" where 1=1 and DELETE_TSAMP is null";
            String sql1 = "select count(*) from \"TB_WRDKJBXXB\" where 1=1  and DELETE_TSAMP is null";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"PROVINCE_CODE\" ='" + regionCode.substring(0, 2) + "0000'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"CITY_CODE\" ='" + regionCode.substring(0, 4) + "00'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
            }
            
            if(!"".equals(wrdkbm)){
            	sql2 += " and \"WRDKBM\" like '%" + wrdkbm + "%'";
            }
            if(!"".equals(wrdkmc)){
            	sql2 += " and \"WRDKMC\" like '%" + wrdkmc + "%'";
            }
            if(!"".equals(scjdbm)){
            	sql2 += " and \"SCJDBM\" = '" + scjdbm + "'";
            }
            
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE_CODE\" = '" + province + "'";
            }
            if (!city.equals("")) {
            	sql2 += " and \"CITY_CODE\" = '" + city + "'";
            }
            if (!county.equals("")) {
            	sql2 += " and \"COUNTRY_CODE\" = '" + county + "'";
            }

            sql += sql2;
            sql1 += sql2;
            
            sql += " order by TSAMP desc nulls last )T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\"" + " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" "
            		+ " left join TB_GBQYJBQK T5 on T1.WRDKBM=T5.WRDKBM"
            		+ ")  where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看污染地块数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * 根据污染地块ID 获取污染地块数据
     */
    @RequestMapping( "getWrdkDataByID" )
    public EdatResult getWrdkDataByID(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5,3");
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

            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String WRDKBM = data.getOrDefault("WRDKBM", "").toString();//污染地块ID
            
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\", to_char(INSETTIME,'yyyy-mm-dd HH24:mi:ss') \"INSETTIME\" from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\","
            		+ " T5.WRDKID, T5.CBDCID, T5.WRDKBM, T5.WRDKMC, T5.SYQDWMC, T5.GSYYZZH, T5.WRDKDZ, T5.YZBM, T5.HYLB, T5.HYDM,"
            		+ " T5.WRDKZXJD, T5.WRDKZXWD, T5.ZBSM, T5.DKSZFW, T5.ZDMJ, T5.FRDB, T5.SYQDWXR, T5.SYQDWLXDH, T5.SYQDWLXSJ,"
            		+ " T5.FAX, T5.EMAIL, T5.BZ, T5.FLAG, T5.TSAMP, T5.FDDBR, "
            		+ " T6.CBDCID, T6.WRDKID, T6.CBDCBT, T6.CBDCZZ, T6.CBDCFBSJ, T6.DCBGLJ, T6.JCBGLJ, T6.TBJDBM, T6.WRYXX, T6.QYTJXX, T6.DCPGXX,"
            		+ " T6.HJJC, T6.MGSTXX, T6.SFWRDK, T6.TBRXM, T6.LXDH, T6.E_MAIL, T6.FLAG, T6.TSAMP, T6.BGJBXXBLJ, T6.SFJGLZ, T6.GSWZ,"
            		+ " T6.CBDCWCSJ, T6.DELETE_TSAMP, T6.DCBGNR from ("
            		
            		+ " select WRDKID, WRDKBM, WRDKMC, BZ, POLLUETED, SCJDBM, USER_ID, FXJB, FLAG, TSAMP, PROVINCE_CODE, CITY_CODE,"
            		+ " COUNTRY_CODE, TYPE, HSLYLX, YTBGLX, TDSYQR, HYLB, HYDM, YTBGBZ, HYLBBZ, WRDK_WZ, WRDK_LNG, WRDK_LAT, WRDK_BOUNDS,"
            		+ " WRDK_AREA, WRDK_JSL, WRDK_ADDR, to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, DELETE_TSAMP, CREATE_TSAMP"
            		+ " from \"TB_WRDKJBXXB\" where 1=1 and DELETE_TSAMP is null and WRDKBM='" + WRDKBM + "'";
            
            
            sql += ")T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\""
            		+ " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\""
            		+ " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" "
            		+ " left join TB_GBQYJBQK T5 on T1.WRDKBM=T5.WRDKBM"
            		+ " left join TB_CBDC T6 on T1.WRDKID=T6.WRDKID";
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            //处理clob
            for (Map map : list) {
            	if(map.containsKey("DCBGNR")){
            		CLOB clob = (CLOB) map.get("DCBGNR");
            		String content = clob.getSubString(1, (int) clob.length());
            		map.put("DCBGNR", content);
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
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getOrDefault("startTime", "").toString();//开始时间
            String endTime = data.getOrDefault("endTime", "").toString();//结束时间
            String statisType = data.getOrDefault("statisType", "天").toString();//统计类型
            
            //处理统计类型
            int substrLength = 10;
            if("月".equals(statisType)){
            	substrLength = 7;
            }else if("年".equals(statisType)){
            	substrLength = 4;
            }
            
            String sql = "select count(1) count,substr(TSAMP,0," + substrLength + ") UPDATETIME from TB_WRDKJBXXB where 1=1  and DELETE_TSAMP is null";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and TSAMP>='" + startTime + "'";
            }
            if(!"".equals(endTime)){
            	sql += " and TSAMP<='" + endTime + "'";
            }
            
            sql += " group by substr(TSAMP,0," + substrLength + ") order by substr(TSAMP,0," + substrLength + ") nulls last ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          //处理数据，添加0
            //1.获取开始时间，结束时间
            Date startDate = null;
            Date endDate = null;
            int currIndex = 0;
            List<Map> newResult = new ArrayList<Map>();
            DateFormat df = new SimpleDateFormat("yyyy/MM/dd");
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
            
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            //接收参数
            
            String sql = "select MAX(TSAMP) UPDATETIME from TB_WRDKJBXXB where 1=1  and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
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
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
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

            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String wrdkbm = data.getOrDefault("wrdkbm", "").toString();//污染地块编码
            String wrdkmc = data.getOrDefault("wrdkmc", "").toString();//污染地块名称
            String scjdbm = data.getOrDefault("scjdbm", "").toString();//所处阶段编码
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//省
            String county = data.getOrDefault("county", "").toString();//省
            String metadataID = data.getOrDefault("metadataID", "").toString();//数据集ID
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\", to_char(INSETTIME,'yyyy-mm-dd HH24:mi:ss') \"INSETTIME\" from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",T5.WRDKZXJD,T5.WRDKZXWD, ROWNUM RN from ("
            		+ " select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\" from \"TB_WRDKJBXXB\" where 1=1  and DELETE_TSAMP is null";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"PROVINCE_CODE\" ='" + regionCode.substring(0, 2) + "0000'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"CITY_CODE\" ='" + regionCode.substring(0, 4) + "00'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
            }
            
            if(!"".equals(wrdkbm)){
            	sql2 += " and \"WRDKBM\" like '%" + wrdkbm + "%'";
            }
            if(!"".equals(wrdkmc)){
            	sql2 += " and \"WRDKMC\" like '%" + wrdkmc + "%'";
            }
            if(!"".equals(scjdbm)){
            	sql2 += " and \"SCJDBM\" = '" + scjdbm + "'";
            }
            
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE_CODE\" = '" + province + "'";
            }
            if (!city.equals("")) {
            	sql2 += " and \"CITY_CODE\" = '" + city + "'";
            }
            if (!county.equals("")) {
            	sql2 += " and \"COUNTRY_CODE\" = '" + county + "'";
            }
//            sql2 += " and \"CITY_CODE\" = '510100'";

            sql += sql2;
            
            sql += ")T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\"" + " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" "
            		+ " left join TB_GBQYJBQK T5 on T1.WRDKBM=T5.WRDKBM";
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            Map scjdbmMap = new HashMap();
            scjdbmMap.put("S0", "疑似地块");
            scjdbmMap.put("S1", "初步调查");
            scjdbmMap.put("S2", "详细调查");
            scjdbmMap.put("S3", "风险评估");
            scjdbmMap.put("S4", "风险管控");
            scjdbmMap.put("S5", "土壤修复与治理");
            scjdbmMap.put("S6", "土壤修复与治理评估");
            
            //所处阶段处理
            for (Map map : list) {
				if(map!=null && map.get("SCJDBM")!=null){
					map.put("SCJDBMChn", scjdbmMap.get(map.get("SCJDBM").toString()).toString());
				}
			}
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("WRDKID", "污染地块ID");
            map.put("USER_ID", "用户ID");
            map.put("WRDKBM", "污染地块编码");
            map.put("WRDKMC", "污染地块名称");
            map.put("provinceName", "省名");
            map.put("cityName", "市名");
            map.put("countyName", "县名");
            map.put("SCJDBMChn", "所处阶段");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "污染地块数据", geturl, response);
            
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
