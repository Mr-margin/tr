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

import org.apache.commons.lang.StringUtils;
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
 * 共享交换-（疑似）污染地块
 *
 */
@RestController
@RequestMapping("shareExchange/yswrdk")
@SuppressWarnings("all")
public class YswrdkController {
	
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
	 * （疑似）污染地块，分页数据
	 * bootstrap-table
	 * 省级用户处理
	 */
	@RequestMapping( "getYswrdkData" )
    public Map getYswrdkData(HttpServletRequest request, HttpServletResponse response) {
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
            String OLDENTERPRISENAME = data.getOrDefault("OLDENTERPRISENAME","").toString();//原用地企业名称
            String DATASOURCE = data.getOrDefault("DATASOURCE","").toString();//地块名单来源
            String STARTRUNYEARTIMEStart = data.getOrDefault("STARTRUNYEARTIMEStart","").toString();//开始运营时间
            String STARTRUNYEARTIMEEnd = data.getOrDefault("STARTRUNYEARTIMEEnd","").toString();//开始运营时间
            String ENDRUNYEARTIMEStart = data.getOrDefault("ENDRUNYEARTIMEStart","").toString();//结束运营时间
            String ENDRUNYEARTIMEEnd = data.getOrDefault("ENDRUNYEARTIMEEnd", "").toString();//结束运营时间
            String MAINPRODUCT = data.getOrDefault("MAINPRODUCT", "").toString();//主要产品
            String INDUSTRYTYPE = data.getOrDefault("INDUSTRYTYPE", "").toString();//行业分类
            String POTENTIALPOLLUTANT = data.getOrDefault("POTENTIALPOLLUTANT", "").toString();//潜在污染物
            String NOWENTERPRISENAME = data.getOrDefault("NOWENTERPRISENAME", "").toString();//现用地企业名称
            String LANDSTATUS = data.getOrDefault("LANDSTATUS", "").toString();//地块状态
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
            
            String sql1 = "	select * from ( select R.*,ROWNUM RN from("
            		+ " select \"ID\", \"OLDENTERPRISENAME\", \"DATASOURCE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", "
            		+ "\"POINTCOORDINATE\", \"POLYGONCOORDINATE\", \"STARTRUNYEARTIME\", \"ENDRUNYEARTIME\", \"AREA\", \"MAINPRODUCT\", \"INDUSTRYTYPE\","
            		+ " \"POTENTIALPOLLUTANT\", \"ELSEPOTENTIALPOLLUTANT\", \"RESEARCHINFO\", \"RESEARCHINFOATTACHMENTFILE\", \"FIXPLAN\", \"FIXPLANATTACHMENTFILE\","
            		+ " \"FIXCHECKINFO\", \"FIXCHECKINFOATTACHMENTFILE\", \"NOWENTERPRISENAME\", \"NOWLANDTYPE\", \"REMARK\", \"LANDSTATUS\","
            		+ " to_char(\"LANDSTATUSUPDATETIME\",'yyyy-mm-dd HH24:mi:ss') LANDSTATUSUPDATETIME, \"INSERTTIME\" "
            		+ " from \"TB_POLLUTION_LAND_STRUCTURE\" where 1=1  ";
            String sql2 = "select count(1) from TB_POLLUTION_LAND_STRUCTURE where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(OLDENTERPRISENAME)) {
            	sqlWhere += " and \"OLDENTERPRISENAME\" like '%" + OLDENTERPRISENAME + "%'";
            }
            if (!"".equals(DATASOURCE)) {
            	String[] strArr = DATASOURCE.split(",");
            	DATASOURCE = StringUtils.join(strArr,"','");
            	sqlWhere += " and \"DATASOURCE\" in ('" + DATASOURCE + "')";
            }
            if (!"".equals(STARTRUNYEARTIMEStart)) {
            	sqlWhere += " and \"STARTRUNYEARTIME\" >= '" + STARTRUNYEARTIMEStart + "'";
            }
            if (!"".equals(STARTRUNYEARTIMEEnd)) {
            	sqlWhere += " and \"STARTRUNYEARTIME\" <= '" + STARTRUNYEARTIMEEnd + "'";
            }
            if (!"".equals(ENDRUNYEARTIMEStart)) {
            	sqlWhere += " and \"ENDRUNYEARTIME\" >= '" + ENDRUNYEARTIMEStart + "'";
            }
            if(!"".equals(ENDRUNYEARTIMEEnd)){
            	sqlWhere += " and ENDRUNYEARTIME <= '" + ENDRUNYEARTIMEEnd + "'";
            }
            if(!"".equals(MAINPRODUCT)){
            	sqlWhere += " and MAINPRODUCT like '%" + MAINPRODUCT + "%'";
            }
			if(!"".equals(INDUSTRYTYPE)){
				String[] strArr = INDUSTRYTYPE.split(",");
				INDUSTRYTYPE = StringUtils.join(strArr,"','");
				sqlWhere += " and \"INDUSTRYTYPE\" in ('" + INDUSTRYTYPE + "')";
			}
			if(!"".equals(POTENTIALPOLLUTANT)){
				String[] strArr = POTENTIALPOLLUTANT.split(",");
				sqlWhere += " and (\"POTENTIALPOLLUTANT\" like '%" + strArr[0] + "%'";
            	for (int i = 1; i < strArr.length; i++) {
            		sqlWhere += " or \"POTENTIALPOLLUTANT\" like '%" + strArr[i] + "%'";
				}
            	sqlWhere += ")";	
			}
			if(!"".equals(NOWENTERPRISENAME)){
				sqlWhere += " and \"NOWENTERPRISENAME\" like '%" + NOWENTERPRISENAME + "%'";
			}
			if(!"".equals(LANDSTATUS)){
				String[] strArr = LANDSTATUS.split(",");
				LANDSTATUS = StringUtils.join(strArr,"','");
				sqlWhere += " and \"LANDSTATUS\" in ('" + LANDSTATUS + "')";
			}
            
            sql1 += sqlWhere;
            sql1 += " order by LANDSTATUSUPDATETIME desc nulls last)R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看（疑似）污染地块数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	//疑似污染地块，查询条件
    @RequestMapping("getYswrdkCons")
	public EdatResult getYswrdkCons(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            String sql1 = "select DISTINCT DATASOURCE from \"TB_POLLUTION_LAND_STRUCTURE\"";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            String sql2 = "select DISTINCT INDUSTRYTYPE from \"TB_POLLUTION_LAND_STRUCTURE\" ";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            String sql3 = "select DISTINCT POTENTIALPOLLUTANT from \"TB_POLLUTION_LAND_STRUCTURE\" ";
            List<Map> list3 = getBySqlMapper.findRecords(sql3);
            
            String sql4 = "select DISTINCT LANDSTATUS from \"TB_POLLUTION_LAND_STRUCTURE\" ";
            List<Map> list4 = getBySqlMapper.findRecords(sql4);
            
            Map result = new HashMap();
            result.put("dataSource", list1);
            result.put("industryType", list2);
            result.put("potentialPollutant", list3);
            result.put("landStatus", list4);
            
            return EdatResult.ok(result);
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
            
            String sql = "select count(1) count,to_char(\"LANDSTATUSUPDATETIME\",'" + datePartten + "')  UPDATETIME1 from TB_POLLUTION_LAND_STRUCTURE where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"LANDSTATUSUPDATETIME\">=to_date('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"LANDSTATUSUPDATETIME\"<=to_date('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"LANDSTATUSUPDATETIME\",'" + datePartten + "')  order by to_char(\"LANDSTATUSUPDATETIME\",'" + datePartten + "')  nulls last ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          //处理数据，添加0
            //1.获取开始时间，结束时间
            Date startDate = null;
            Date endDate = null;
            int currIndex = 0;
            List<Map> newResult = new ArrayList<Map>();
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            if("".equals(startTime)){
            	startDate = DateUtil.getNullStartDate1(result, df);
            	if(startDate == null){
            		return EdatResult.ok(result);
            	}
            }else{
            	startDate = df.parse(startTime);
            }
            if("".equals(endTime)){
            	endDate = DateUtil.getNullEndDate1(result, df);
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
            	if(currMap!=null && currMap.containsKey("UPDATETIME1") && currMap.get("UPDATETIME1")!=null && currMap.get("UPDATETIME1")!=""){
            		currDate = df.parse(currMap.get("UPDATETIME1").toString());
            	}
            	if(currDate!=null && startDate.getTime() == currDate.getTime()){
            		newMap.put("UPDATETIME1", currMap.get("UPDATETIME1"));
            		newMap.put("COUNT", currMap.get("COUNT"));
            		currIndex++;
            	}else{
            		newMap.put("UPDATETIME1", df.format(startDate));
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
    
    //含汞试剂生产_含汞固体废物去向数据-最后更新时间
    @RequestMapping("getLastUpdateTime")
	public EdatResult getLastUpdateTime(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            
            String sql = "select to_char( MAX(\"LANDSTATUSUPDATETIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from TB_POLLUTION_LAND_STRUCTURE where 1=1";
            
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
            String OLDENTERPRISENAME = data.getOrDefault("OLDENTERPRISENAME","").toString();//原用地企业名称
            String DATASOURCE = data.getOrDefault("DATASOURCE","").toString();//地块名单来源
            String STARTRUNYEARTIMEStart = data.getOrDefault("STARTRUNYEARTIMEStart","").toString();//开始运营时间
            String STARTRUNYEARTIMEEnd = data.getOrDefault("STARTRUNYEARTIMEEnd","").toString();//开始运营时间
            String ENDRUNYEARTIMEStart = data.getOrDefault("ENDRUNYEARTIMEStart","").toString();//结束运营时间
            String ENDRUNYEARTIMEEnd = data.getOrDefault("ENDRUNYEARTIMEEnd", "").toString();//结束运营时间
            String MAINPRODUCT = data.getOrDefault("MAINPRODUCT", "").toString();//主要产品
            String INDUSTRYTYPE = data.getOrDefault("INDUSTRYTYPE", "").toString();//行业分类
            String POTENTIALPOLLUTANT = data.getOrDefault("POTENTIALPOLLUTANT", "").toString();//潜在污染物
            String NOWENTERPRISENAME = data.getOrDefault("NOWENTERPRISENAME", "").toString();//现用地企业名称
            String LANDSTATUS = data.getOrDefault("LANDSTATUS", "").toString();//地块状态
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "	select * from ("
            		+ " select \"ID\", \"OLDENTERPRISENAME\", \"DATASOURCE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", "
            		+ "\"POINTCOORDINATE\", \"POLYGONCOORDINATE\", \"STARTRUNYEARTIME\", \"ENDRUNYEARTIME\", \"AREA\", \"MAINPRODUCT\", \"INDUSTRYTYPE\","
            		+ " \"POTENTIALPOLLUTANT\", \"ELSEPOTENTIALPOLLUTANT\", \"RESEARCHINFO\", \"RESEARCHINFOATTACHMENTFILE\", \"FIXPLAN\", \"FIXPLANATTACHMENTFILE\","
            		+ " \"FIXCHECKINFO\", \"FIXCHECKINFOATTACHMENTFILE\", \"NOWENTERPRISENAME\", \"NOWLANDTYPE\", \"REMARK\", \"LANDSTATUS\","
            		+ " to_char(\"LANDSTATUSUPDATETIME\",'yyyy-mm-dd HH24:mi:ss') LANDSTATUSUPDATETIME, \"INSERTTIME\", ROWNUM RN "
            		+ " from \"TB_POLLUTION_LAND_STRUCTURE\" where 1=1  ";
            String sql2 = "select count(1) from TB_POLLUTION_LAND_STRUCTURE where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(OLDENTERPRISENAME)) {
            	sqlWhere += " and \"OLDENTERPRISENAME\" like '%" + OLDENTERPRISENAME + "%'";
            }
            if (!"".equals(DATASOURCE)) {
            	String[] strArr = DATASOURCE.split(",");
            	DATASOURCE = StringUtils.join(strArr,"','");
            	sqlWhere += " and \"DATASOURCE\" in ('" + DATASOURCE + "')";
            }
            if (!"".equals(STARTRUNYEARTIMEStart)) {
            	sqlWhere += " and \"STARTRUNYEARTIME\" >= '" + STARTRUNYEARTIMEStart + "'";
            }
            if (!"".equals(STARTRUNYEARTIMEEnd)) {
            	sqlWhere += " and \"STARTRUNYEARTIME\" <= '" + STARTRUNYEARTIMEEnd + "'";
            }
            if (!"".equals(ENDRUNYEARTIMEStart)) {
            	sqlWhere += " and \"ENDRUNYEARTIME\" >= '" + ENDRUNYEARTIMEStart + "'";
            }
            if(!"".equals(ENDRUNYEARTIMEEnd)){
            	sqlWhere += " and ENDRUNYEARTIME <= '" + ENDRUNYEARTIMEEnd + "'";
            }
            if(!"".equals(MAINPRODUCT)){
            	sqlWhere += " and MAINPRODUCT like '%" + MAINPRODUCT + "%'";
            }
			if(!"".equals(INDUSTRYTYPE)){
				String[] strArr = INDUSTRYTYPE.split(",");
				INDUSTRYTYPE = StringUtils.join(strArr,"','");
				sqlWhere += " and \"INDUSTRYTYPE\" in ('" + INDUSTRYTYPE + "')";
			}
			if(!"".equals(POTENTIALPOLLUTANT)){
				String[] strArr = POTENTIALPOLLUTANT.split(",");
				sqlWhere += " and (\"POTENTIALPOLLUTANT\" like '%" + strArr[0] + "%'";
            	for (int i = 1; i < strArr.length; i++) {
            		sqlWhere += " or \"POTENTIALPOLLUTANT\" like '%" + strArr[i] + "%'";
				}
            	sqlWhere += ")";	
			}
			if(!"".equals(NOWENTERPRISENAME)){
				sqlWhere += " and \"NOWENTERPRISENAME\" like '%" + NOWENTERPRISENAME + "%'";
			}
			if(!"".equals(LANDSTATUS)){
				String[] strArr = LANDSTATUS.split(",");
				LANDSTATUS = StringUtils.join(strArr,"','");
				sqlWhere += " and \"LANDSTATUS\" in ('" + LANDSTATUS + "')";
			}
            
            sql1 += sqlWhere;
            sql1 += " ) ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("OLDENTERPRISENAME", "原用地企业名称");
            map.put("DATASOURCE", "地块名单来源");
            map.put("PROVINCENAME", "省");
            map.put("CITYNAME", "市");
            map.put("DISTRICTNAME", "区");
            map.put("DETAILEDADDRESS", "详细地址");
            map.put("POINTCOORDINATE", "地块点坐标");
            map.put("地块面坐标（百度坐标）", "开始运营时间");
            map.put("ENDRUNYEARTIME", "结束运营时间");
            map.put("AREA", "占地面积（万平方米）");
            map.put("MAINPRODUCT", "主要产品");
            map.put("INDUSTRYTYPE", "行业分类");
            map.put("POTENTIALPOLLUTANT", "潜在污染物");
            map.put("ELSEPOTENTIALPOLLUTANT", "其他潜在污染物");
            map.put("RESEARCHINFO", "调查信息");
            map.put("FIXPLAN", "修复方案");
            map.put("FIXCHECKINFO", "修复验收信息");
            map.put("NOWENTERPRISENAME", "现用地单位");
            map.put("NOWLANDTYPE", "现用地性质");
            map.put("REMARK", "备注");
            map.put("LANDSTATUS", "地块状态");
            map.put("LANDSTATUSUPDATETIME", "地块状态更新时间");
            
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "（疑似）污染地块数据", geturl, response);
            
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
    
   
    
    
    /**
     *   
     * @Description: TODO
     * @author luowenbin
     * @date 2018年8月10日
     */
    private String getLon(Map map){
    	double result = 0;
    	if(map != null){
    		if(map.containsKey("JD_D")){
    			if(map.get("JD_D").toString() != ""){
    				try {
    					result = Integer.parseInt(map.get("JD_D").toString().trim());
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("JD_F")){
    			if(map.get("JD_F").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("JD_D").toString().trim())/60) * 100) / 100;
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("JD_M")){
    			if(map.get("JD_M").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("JD_M").toString().trim())/3600) * 10000) / 10000;
					} catch (Exception e) {}
    			}
    		}
    	}
    	if((result+"").length()>9){
    		result = Double.parseDouble((result+"").substring(0, (result + "").indexOf(".")+5));
    	}
    	if(result == 0){
    		return "";
    	}
    	return result + "";
    }
    
    private String getLat(Map map){
    	double result = 0;
    	if(map != null){
    		if(map.containsKey("WD_D")){
    			if(map.get("WD_D").toString() != ""){
    				try {
    					result = Integer.parseInt(map.get("WD_D").toString().trim());
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("WD_F")){
    			if(map.get("WD_F").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("WD_F").toString().trim())/60) * 100) / 100;
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("WD_M")){
    			if(map.get("WD_M").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("WD_M").toString().trim())/3600) * 10000) / 10000;
					} catch (Exception e) {}
    			}
    		}
    	}
    	if((result+"").length()>9){
    		result = Double.parseDouble((result+"").substring(0, (result + "").indexOf(".")+5));
    	}
    	if(result == 0){
    		return "";
    	}
    	return result + "";
    }
    
    
    
    /**
     * 处理数据
     * @Description: TODO
     * @param @param map：集合
     * @param @param column：字段
     * @param @param type：类型
     * @author luowenbin
     * @date 2018年8月16日
     */
    private void handleValue(Map map, String column, String type){
    	if(type != null && type != "" && map.containsKey(column)){
    		String newStr = map.get(column).toString();
    		String oldStr = map.get(column).toString();
    		//处理(null)
    		if("1".equals(type)){
        		if("(null)".equals(oldStr)){
        			newStr = "-";
        		}
        		
    		}
    		//处理1是0否
    		if("2".equals(type)){
    			if("1".equals(oldStr)){
        			newStr = "是";
        		}
        		if("0".equals(oldStr)){
        			newStr = "否";
        		}
    		}
    		//处理(null)1是0否
    		if("3".equals(type)){
    			if("(null)".equals(oldStr)){
        			newStr = "-";
        		}
    			if("1".equals(oldStr)){
        			newStr = "是";
        		}
        		if("0".equals(oldStr)){
        			newStr = "否";
        		}
    		}
    		map.put(column, newStr);
    			
    	}
    }
    
}
