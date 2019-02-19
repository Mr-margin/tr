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
 * 共享交换-组织机构代码
 *
 */
@RestController
@RequestMapping("shareExchange/organCode")
@SuppressWarnings("all")
public class OrganizationCodeController {
	
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
            
            String sql = "select count(1) count,JJHY20110 \"name\" from TB_ORGANIZATION_CODE where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            sql += " group by JJHY20110 order by count desc";
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
            
            String sql = "select a.count,c1.\"name\" \"name\" from ("
            		+ "select count(1) count,concat(substr(XZQH0, 0, 2), '0000') \"name\" from TB_ORGANIZATION_CODE where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            sql += " group by concat(substr(XZQH0, 0, 2), '0000') order by count asc "
            		+ " )a  left join \"tb_city\" c1 on a.\"name\"=c1.\"code\"  where C1.\"name\" is not null  ";
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
            
            String sql = "select a.count,c1.\"name\" \"name\" from ("
            		+ "select count(1) count,concat(substr(XZQH0, 0, 4), '00') \"name\" from TB_ORGANIZATION_CODE where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            sql += " group by concat(substr(XZQH0, 0, 4), '00')  "
            		+ " )a  left join \"tb_city\" c1 on a.\"name\"=c1.\"code\"  where C1.\"name\" is not null order by COUNT asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	/**
	 * 组织机构代码，分页数据
	 * 省级用户处理
	 * bootstrap-table
	 */
	@RequestMapping( "getOrganCodeData" )
    public Map getOrganCodeData(HttpServletRequest request, HttpServletResponse response) {
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
            String tydmo = data.getOrDefault("tydmo","").toString();//统一社会信用代码
            String jgdmo = data.getOrDefault("jgdmo","").toString();//组织机构代码
            String jgmco = data.getOrDefault("jgmco", "").toString();//机构名称
            String fddbro = data.getOrDefault("fddbro", "").toString();//法定代表人或负责人姓名
            String zcrqoStart = data.getOrDefault("zcrqoStart", "").toString();//成立日期开始
            String zcrqoEnd = data.getOrDefault("zcrqoEnd", "").toString();//成立日期结束
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
            
            String sql1 = "select  T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from("
            		+ " select * from (select R.*,ROWNUM RN from(select TYDM0,JGDM0,JGMC0,JYFW0,JGDZ0,XZQH0,FDDBR0,"
            		+ " to_char(ZCRQ0,'yyyy-mm-dd HH24:mi:ss') ZCRQ0,"
            		+ " to_char(BGRQ0,'yyyy-mm-dd HH24:mi:ss') BGRQ0,to_char(BZRQ0,'yyyy-mm-dd HH24:mi:ss') BZRQ0,to_char(ZFRQ0,'yyyy-mm-dd HH24:mi:ss') ZFRQ0,"
            		+ " ZCZJ0,JYZT0,DHHM0,ZGRS0,JJHY20110,JGLX,ZGDM0,ZGMC0,EMAIL0,URL0,SCJYDZ0,"
            		+ " SCJYXZQH0,"
            		+ " to_char(GXCLDATE,'yyyy-mm-dd HH24:mi:ss') GXCLDATE,"
            		+ " JHBZ,XZQH0_NAME,SCJYXZQH0_NAME,DHHM1,LON,LAT "
            		+ " from \"TB_ORGANIZATION_CODE\" where 1=1 ";
            String sql2 = "select count(*) from \"TB_ORGANIZATION_CODE\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(tydmo)) {
            	sqlWhere += " and TYDM0 like '%" + tydmo + "%'";
            }
            if (!"".equals(jgdmo)) {
            	sqlWhere += " and JGDM0 like '%" + jgdmo + "%'";
            }
            if (!"".equals(jgmco)) {
            	sqlWhere += " and JGMC0 like '%" + jgmco + "%'";
            }
            if (!"".equals(fddbro)) {
            	sqlWhere += " and FDDBR0 like '%" + fddbro + "%'";
            }
            if (!"".equals(zcrqoStart)) {
            	sqlWhere += " and ZCRQ0 >= to_date('" + zcrqoStart + "','yyyy-mm-dd hh24:mi:ss')";
            }
            if (!"".equals(zcrqoEnd)) {
            	sqlWhere += " and ZCRQ0 <= to_date('" + zcrqoEnd + "','yyyy-mm-dd hh24:mi:ss')";
            }
            if(!"".equals(province)){
            	sqlWhere += " and XZQH0 like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and XZQH0 like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XZQH0 like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += " order by ZCRQ0 desc nulls last)R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize) + ")T1 "
            		+ " left join \"tb_city\" c1 on concat(substr(T1.XZQH0, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.XZQH0, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.XZQH0 = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看组织机构代码数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	/**
	 * 组织机构代码，
	 */
	@RequestMapping( "getOrganCodeDataByID" )
    public EdatResult getOrganCodeDataByID(HttpServletRequest request, HttpServletResponse response) {
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
            String jgdmo = data.getOrDefault("jgdmo","").toString();//组织机构代码
            
            
            String sql1 = "select  T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from("
            		+ " select TYDM0,JGDM0,JGMC0,JYFW0,JGDZ0,XZQH0,FDDBR0,"
            		+ " to_char(ZCRQ0,'yyyy-mm-dd HH24:mi:ss') ZCRQ0,"
            		+ " to_char(BGRQ0,'yyyy-mm-dd HH24:mi:ss') BGRQ0,to_char(BZRQ0,'yyyy-mm-dd HH24:mi:ss') BZRQ0,to_char(ZFRQ0,'yyyy-mm-dd HH24:mi:ss') ZFRQ0,"
            		+ " ZCZJ0,JYZT0,DHHM0,ZGRS0,JJHY20110,JGLX,ZGDM0,ZGMC0,EMAIL0,URL0,SCJYDZ0,"
            		+ " SCJYXZQH0,"
            		+ " to_char(GXCLDATE,'yyyy-mm-dd HH24:mi:ss') GXCLDATE,"
            		+ " JHBZ,XZQH0_NAME,SCJYXZQH0_NAME,DHHM1,LON,LAT,ROWNUM RN"
            		+ " from \"TB_ORGANIZATION_CODE\" where JGDM0='"+jgdmo+"'";

            
            sql1 += ")T1 "
            		+ " left join \"tb_city\" c1 on concat(substr(T1.XZQH0, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.XZQH0, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.XZQH0 = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            

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
            
            String sql = "select count(1) count,to_char(GXCLDATE,'" + datePartten + "')  UPDATETIME from TB_ORGANIZATION_CODE where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and GXCLDATE>=to_date('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and GXCLDATE<=to_date('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(GXCLDATE,'" + datePartten + "')  order by to_char(GXCLDATE,'" + datePartten + "')  nulls last ";
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
            
            
            String sql = "select to_char( MAX(GXCLDATE),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from TB_ORGANIZATION_CODE where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
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
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String tydmo = data.getOrDefault("tydmo","").toString();//统一社会信用代码
            String jgdmo = data.getOrDefault("jgdmo","").toString();//组织机构代码
            String jgmco = data.getOrDefault("jgmco", "").toString();//机构名称
            String fddbro = data.getOrDefault("fddbro", "").toString();//法定代表人或负责人姓名
            String zcrqoStart = data.getOrDefault("zcrqoStart", "").toString();//成立日期开始
            String zcrqoEnd = data.getOrDefault("zcrqoEnd", "").toString();//成立日期结束
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select  T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from("
            		+ " select * from (select TYDM0,JGDM0,JGMC0,JYFW0,JGDZ0,XZQH0,FDDBR0,"
            		+ " to_char(ZCRQ0,'yyyy-mm-dd HH24:mi:ss') ZCRQ0,"
            		+ " to_char(BGRQ0,'yyyy-mm-dd HH24:mi:ss') BGRQ0,to_char(BZRQ0,'yyyy-mm-dd HH24:mi:ss') BZRQ0,to_char(ZFRQ0,'yyyy-mm-dd HH24:mi:ss') ZFRQ0,"
            		+ " ZCZJ0,JYZT0,DHHM0,ZGRS0,JJHY20110,JGLX,ZGDM0,ZGMC0,EMAIL0,URL0,SCJYDZ0,"
            		+ " SCJYXZQH0,"
            		+ " to_char(GXCLDATE,'yyyy-mm-dd HH24:mi:ss') GXCLDATE,"
            		+ " JHBZ,XZQH0_NAME,SCJYXZQH0_NAME,DHHM1,LON,LAT,ROWNUM RN"
            		+ " from \"TB_ORGANIZATION_CODE\" where 1=1 ";
            String sql2 = "select count(*) from \"TB_ORGANIZATION_CODE\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(tydmo)) {
            	sqlWhere += " and TYDM0 like '%" + tydmo + "%'";
            }
            if (!"".equals(jgdmo)) {
            	sqlWhere += " and JGDM0 like '%" + jgdmo + "%'";
            }
            if (!"".equals(jgmco)) {
            	sqlWhere += " and JGMC0 like '%" + jgmco + "%'";
            }
            if (!"".equals(fddbro)) {
            	sqlWhere += " and FDDBR0 like '%" + fddbro + "%'";
            }
            if (!"".equals(zcrqoStart)) {
            	sqlWhere += " and ZCRQ0 >= to_date('" + zcrqoStart + "','yyyy-mm-dd hh24:mi:ss')";
            }
            if (!"".equals(zcrqoEnd)) {
            	sqlWhere += " and ZCRQ0 <= to_date('" + zcrqoEnd + "','yyyy-mm-dd hh24:mi:ss')";
            }
            if(!"".equals(province)){
            	sqlWhere += " and XZQH0 like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and XZQH0 like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XZQH0 like '" + county + "'";
			}
			
			sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);
            if(total>500000){
            	return  EdatResult.ok("您当前下载的数据量过大，请设置过滤条件后重新下载！");
            }
            
            sql1 += sqlWhere;
            sql1 += ") )T1 "
            		+ " left join \"tb_city\" c1 on concat(substr(T1.XZQH0, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.XZQH0, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.XZQH0 = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("TYDM0", "统一社会信用代码");
            map.put("JGDM0", "组织机构代码");
            map.put("JGMC0", "机构名称");
            map.put("JYFW0", "经营范围");
            map.put("JGDZ0", "注册地址");
            map.put("PROVINCE", "省份");
            map.put("CITY", "市区");
            map.put("COUNTY", "县区");
            map.put("FDDBR0", "法定代表人");
            map.put("ZCRQ0", "成立日期");
            map.put("BGRQ0", "最后变更日期");
            map.put("BZRQ0", "经营期限自");
            map.put("ZFRQ0", "经营期限至");
            map.put("ZCZJ0", "注册资本");
            map.put("JYZT0", "状态");
            map.put("DHHM0", "电话号码");
            map.put("ZGRS0", "职工人数");
            map.put("EMAIL0", "电子邮箱");
            map.put("URL0", "网址");
            map.put("SCJYDZ0", "生产经营地址");
            map.put("XZQH0_NAME", "注册地址行政区划名称");
            map.put("SCJYXZQH0_NAME", "生产经营地址行政区划名称");
            map.put("DHHM1", "电话号码");
            map.put("LON", "经度");
            map.put("LAT", "纬度");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = XSSFExcelUtils.writesNew(list, map, "组织机构代码数据", geturl, response);
            
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
