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

/**
 * 共享交换-重点行业监管企业
 *
 */
@RestController
@RequestMapping("kep")
@SuppressWarnings("all")
public class KeyEnterpriseController {
	
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
     * 获取分行业统计数据
     * 省级用户处理
     */
    @RequestMapping( "getStatisDataOfIndustry" )
    public EdatResult getStatisDataOfIndustry(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,\"industry\" from \"tb_key_industry_enterprise\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"province\"='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by \"industry\" order by count desc";
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
            
            String sql = "select count(1) count,c.\"name\" from \"tb_key_industry_enterprise\" w left join \"tb_city\" c on w.\"province\"=c.\"code\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"province\"='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by c.\"name\" order by count asc ";
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
            
            String sql = "select count(1) count,c.\"name\" from \"tb_key_industry_enterprise\" w"
            		+ " left join \"tb_city\" c on w.\"city\"=c.\"code\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += "and \"province\"='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by c.\"name\" order by count asc ";
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
    @RequestMapping( "getKeyEnterprise" )
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
            String enterpriseName = data.getOrDefault("enterpriseName", "").toString();//重点行业企业名称
            String industry = data.getOrDefault("industry", "").toString();//行业
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//省
            String county = data.getOrDefault("county", "").toString();//省
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
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from ("
            		+ " select" + " \"id\", \"enterpriseName\", \"industry\", to_char(\"createTime\",'yyyy-mm-dd HH24:mi:ss') \"createTime\",\"province\",\"city\",\"district\","
            				+ " \"latitude\",\"longitude\" from \"tb_key_industry_enterprise\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_key_industry_enterprise\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"province\" ='" + regionCode.substring(0, 2) + "0000'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"city\" ='" + regionCode.substring(0, 4) + "00'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"district\" ='" + regionCode + "'";
            }
            
            if(!"".equals(enterpriseName)){
            	sql2 += " and \"enterpriseName\" like '%" + enterpriseName + "%'";
            }
            if(!"".equals(industry)){
            	sql2 += " and \"industry\" = '" + industry + "'";
            }
            
            if (!province.equals("")) {
                sql2 += " and \"province\" = '" + province + "'";
            }
            if (!city.equals("")) {
            	sql2 += " and \"city\" = '" + city + "'";
            }
            if (!county.equals("")) {
            	sql2 += " and \"district\" = '" + county + "'";
            }

            sql += sql2;
            sql1 += sql2;
            sql += "order by \"createTime\" desc nulls last)T1 left join \"tb_city\" T2 on T1.\"province\" = T2.\"code\""
            		+ " left join \"tb_city\" T3 on T1.\"city\" = T3.\"code\""
            		+ " left join \"tb_city\" T4 on T1.\"district\" = T4.\"code\" ) "
            		+ " where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看重点行业企业数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    
    /**
     * 所有行业
     */
    @RequestMapping( "getAllIndustry" )
    public EdatResult getAllIndustry(HttpServletRequest request, HttpServletResponse response) {
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
            
            String sql1 = "select \"industry\" from \"tb_key_industry_enterprise\" where 1=1";
            
            if (userlevel.equals("2")) {
            	sql1 += " and \"province\" ='" + regionCode + "'";
            }

            sql1 += " group by \"industry\"";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
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
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getOrDefault("startTime", "").toString();//开始时间
            String endTime = data.getOrDefault("endTime", "").toString();//结束时间
            String statisType = data.getOrDefault("statisType", "天").toString();//统计类型
            
            //处理统计类型
            String dateParttern = "yyyy-mm-dd";
            if("月".equals(statisType)){
            	dateParttern = "yyyy-mm";
            }else if("年".equals(statisType)){
            	dateParttern = "yyyy";
            }
            
            String sql = "select count(1) count,to_char(\"createTime\",'" + dateParttern + "')  UPDATETIME from \"tb_key_industry_enterprise\" where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"province\"='" + regionCode.substring(0, 2) + "0000'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and \"createTime\">=to_date('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"createTime\"<=to_date('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"createTime\",'" + dateParttern + "') order by to_char(\"createTime\",'" + dateParttern + "') nulls last ";
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
            
            String sql = "select to_char(MAX(\"createTime\"),'yyyy-mm-dd') UPDATETIME from \"tb_key_industry_enterprise\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"province\"='" + regionCode.substring(0, 2) + "0000'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list.get(0));
		} catch (Exception e) {
			e.printStackTrace();
			return EdatResult.build(1, "fail");
		}
    }
    
    /**
     * Excel文件下载
     */
    @RequestMapping( "getExcelFile" )
    public EdatResult getExcelFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");            
            }

            //用户
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
            String enterpriseName = data.getOrDefault("enterpriseName", "").toString();//重点行业企业名称
            String industry = data.getOrDefault("industry", "").toString();//行业
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//省
            String county = data.getOrDefault("county", "").toString();//省
            String metadataID = data.getOrDefault("metadataID", "").toString();//数据集Id
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from ("
            		+ " select" + " \"id\", \"enterpriseName\", \"industry\", to_char(\"createTime\",'yyyy-mm-dd HH24:mi:ss') \"createTime\",\"province\",\"city\",\"district\","
            				+ " \"latitude\",\"longitude\" from \"tb_key_industry_enterprise\" where 1=1 ";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"province\" ='" + regionCode.substring(0, 2) + "0000'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"city\" ='" + regionCode.substring(0, 4) + "00'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"district\" ='" + regionCode + "'";
            }
            
            if(!"".equals(enterpriseName)){
            	sql2 += " and \"enterpriseName\" like '%" + enterpriseName + "%'";
            }
            if(!"".equals(industry)){
            	sql2 += " and \"industry\" = '" + industry + "'";
            }
            
            if (!province.equals("")) {
                sql2 += " and \"province\" = '" + province + "'";
            }
            if (!city.equals("")) {
            	sql2 += " and \"city\" = '" + city + "'";
            	
            }
            if (!county.equals("")) {
            	sql2 += " and \"district\" = '" + county + "'";
            }
//            sql2 += " and \"city\" = '510100'";

            sql += sql2;
            sql += ")T1 left join \"tb_city\" T2 on T1.\"province\" = T2.\"code\""
            		+ " left join \"tb_city\" T3 on T1.\"city\" = T3.\"code\""
            		+ " left join \"tb_city\" T4 on T1.\"district\" = T4.\"code\" ) ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("enterpriseName", "企业名称");
            map.put("industry", "行业");
            map.put("provinceName", "省名");
            map.put("cityName", "市名");
            map.put("countyName", "县名");
            map.put("longitude", "经度");
            map.put("latitude", "纬度");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "重点行业企业数据", geturl, response);
            
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
