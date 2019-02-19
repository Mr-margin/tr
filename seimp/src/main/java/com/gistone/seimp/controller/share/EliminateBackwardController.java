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
 * 共享交换-淘汰落后产能企业
 * ELIMINATE_BACKWARD
 *
 */
@RestController
@RequestMapping("shareExchange/eb")
@SuppressWarnings("all")
public class EliminateBackwardController {
	
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
            
            String sql = "select count(1) count,ELIMINATION_TIME \"name\" from ELIMINATE_BACKWARD where 1=1 ";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql += " and PROVINCE like '%" + names + "%'";
            }
            sql += " group by ELIMINATION_TIME order by ELIMINATION_TIME asc";
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
            
            String sql = "select count(1) count,PROVINCE \"name\" from ELIMINATE_BACKWARD where 1=1 ";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql += " and PROVINCE like '%" + names + "%'";
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
			String names = "";
            if (!userlevel.equals("0") && !userlevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            String sql = "select count(1) count,CITY \"name\" from ELIMINATE_BACKWARD where 1=1 ";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql += " and PROVINCE like '%" + names + "%'";
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
     * 获取淘汰落后产能企业分页数据
     * 省级用户处理
     * bootstrap-table
     */
    @RequestMapping( "getEBData" )
    public Map getEBData(HttpServletRequest request, HttpServletResponse response) {
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
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize","10").toString());
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "0").toString());
            String enterprise = data.getOrDefault("enterprise", "").toString();//企业名称
            String industry = data.getOrDefault("industry", "").toString();//行业类型
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
            
            String sql1 = "select * from  (select R.*,ROWNUM RN from (select PROVINCE,CITY,COUNTY,INDUSTRY,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS,ENTERPRISE "
            		+ " FROM ELIMINATE_BACKWARD where 1=1 ";
            String sql2 = "select count(*) count FROM ELIMINATE_BACKWARD where 1=1";
            
            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sqlWhere += " and PROVINCE like '%" + names + "%'";
            }
            if (!"".equals(enterprise)){
            	sqlWhere += " and ENTERPRISE like '%" + enterprise.trim() + "%' ";
            }
            if (!"".equals(industry)){
            	sqlWhere += " and INDUSTRY = '" + industry.trim() + "' ";
            }
            if (!"".equals(province)){
            	province = province.replace("省", "");
            	province = province.replace("市", "");
            	sqlWhere += " and PROVINCE like '%" + province.trim() + "%' ";
            }
            if (!"".equals(city)){
            	city = city.replace("市", "");
            	sqlWhere += " and CITY like '%" + city.trim() + "%' ";
            }
            if (!"".equals(county)){
            	county = county.replace("县", "");
            	sqlWhere += " and COUNTY like '%" + county.trim() + "%' ";
            }
            
            sql1 += sqlWhere;
            sql1 += " order by ELIMINATION_TIME desc nulls last )R) where RN > " + pageNumber +" and RN <= " + (pageSize+pageNumber);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = this.getBySqlMapper.findrows(sql2);
            
            
            //返回数据
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看遥感核查数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    //查询所有行业
    @RequestMapping("getAllIndustry")
    public EdatResult getAllIndustry(HttpServletRequest request,HttpServletResponse response ) {
        try {
            String sql = "select INDUSTRY from  ELIMINATE_BACKWARD GROUP BY INDUSTRY";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            
            return  EdatResult.ok(list);
        } catch ( Exception e ){
            return EdatResult.build(1, "查询错误");
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
            if("月".equals(statisType)){
            	substrLength = 7;
            }else if("年".equals(statisType)){
            	substrLength = 4;
            }
            
            String sql = "select count(1) count,substr(IMPORT_TIME,0," + substrLength + ") UPDATETIME from \"ELIMINATE_BACKWARD\" where 1=1 ";
            
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	names = names.replace("省", "");
            	sql += " and PROVINCE like '%" + names + "%'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and IMPORT_TIME>='" + startTime + "'";
            }
            if(!"".equals(endTime)){
            	sql += " and IMPORT_TIME<='" + endTime + "'";
            }
            
            sql += " group by substr(IMPORT_TIME,0," + substrLength + ") order by substr(IMPORT_TIME,0," + substrLength + ") nulls last ";
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
            
            //接收参数
            
            String sql = "select MAX(IMPORT_TIME) UPDATETIME from \"ELIMINATE_BACKWARD\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	names = names.replace("省", "");
            	sql += " and PROVINCE like '%" + names + "%'";
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
            
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String enterprise = data.getOrDefault("enterprise", "").toString();//企业名称
            String industry = data.getOrDefault("industry", "").toString();//行业类型
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select PROVINCE,CITY,COUNTY,INDUSTRY,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS,ENTERPRISE,"
            		+ "ROWNUM RN FROM ELIMINATE_BACKWARD where 1=1 ";
            
            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sqlWhere += " and PROVINCE like '%" + names + "%'";
            }
            if (!"".equals(enterprise)){
            	sqlWhere += " and ENTERPRISE like '%" + enterprise.trim() + "%' ";
            }
            if (!"".equals(industry)){
            	sqlWhere += " and INDUSTRY = '" + industry.trim() + "' ";
            }
            if (!"".equals(province)){
            	province = province.replace("省", "");
            	province = province.replace("市", "");
            	sqlWhere += " and PROVINCE like '%" + province.trim() + "%' ";
            }
            if (!"".equals(city)){
            	city = city.replace("市", "");
            	sqlWhere += " and CITY like '%" + city.trim() + "%' ";
            }
            if (!"".equals(county)){
            	county = county.replace("县", "");
            	sqlWhere += " and COUNTY like '%" + county.trim() + "%' ";
            }
            
            sql1 += sqlWhere;
            List<Map> list = getBySqlMapper.findRecords(sql1);

            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("PROVINCE", "省份");
            map.put("CITY", "市区");
            map.put("COUNTY", "县区");
            map.put("INDUSTRY", "行业");
            map.put("ENTERPRISE", "企业名称");
            map.put("LON", "经度");
            map.put("LAT", "纬度");
            map.put("CAPACITY", "产能(万吨)");
            map.put("ELIMINATION_TIME", "淘汰时间");
            map.put("REMARKS", "备注");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "淘汰落后产能企业数据", geturl, response);
            
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
