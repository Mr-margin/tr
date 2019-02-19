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
 * 共享交换-企业汞排放源概况
 *
 */
@RestController
@RequestMapping("shareExchange/gpfygk")
@SuppressWarnings("all")
public class GPfygkController {
	
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
	 * 企业汞排放源概况，分页数据
	 * bootstrap-table
	 */
	@RequestMapping( "getGPfygkData" )
    public Map getMlrData(HttpServletRequest request, HttpServletResponse response) {
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
            String TJND = data.getOrDefault("TJND","").toString();//调查年度
            String CPHYLMC = data.getOrDefault("CPHYLMC","").toString();//产品或原料名称/种类
            String SFDB = data.getOrDefault("SFDB","").toString();//是否达标
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
            
            String sql1 = "select T1.*,T2.\"Name\" as \"pflbmc\" from ( select R.*,ROWNUM RN from("
            		+ " select \"UUID\", \"TJND\", \"XH\", \"PFYLB\", \"CPHYLMC\", \"CN\", \"CL\","
            		+ " \"PFYSL\", \"SJYGZL\", \"CPHGZL\", \"PFFSHGL\", \"PFFQHGL\", \"GTFWHGL\", \"HSGL\", \"SFDB\", \"PFYLB_SUB\", \"PFFSCSL\", "
            		+ "\"PFFQCSL\", \"GTFWCSL\", \"PFFSPFL\", \"PFFQPFL\", \"GTFWPFL\", \"HSL\", \"QYDBL\", "
            		+ "to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_HBHG201_SUB\" where 1=1 ";
            String sql2 = "select count(1) from T_BUS_HBHG201_SUB where 1=1";

            String sqlWhere = "";
            if (!"".equals(TJND)) {
            	sqlWhere += " and \"TJND\" = '" + TJND + "'";
            }
            if (!"".equals(CPHYLMC)) {
            	sqlWhere += " and \"CPHYLMC\" = '" + CPHYLMC + "'";
            }
            if (!"".equals(SFDB)) {
            	sqlWhere += " and \"SFDB\" = '" + SFDB + "'";
            }
            
            sql1 += sqlWhere;
            sql1 += " order by UPDATETIME desc nulls last)R) T1"
            		+ " left join \"T_Cod_EmissionsSourceType\" T2 on T1.\"PFYLB\"=T2.\"Code\""
            		+ " where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业汞排放源概况数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	//企业汞排放源概况，查询条件
    @RequestMapping("getGPfygkCons")
	public EdatResult getGPfygkCons(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            String sql1 = "select TJND from \"T_BUS_HBHG201_SUB\" where 1=1 GROUP BY TJND";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            String sql2 = "select CPHYLMC from \"T_BUS_HBHG201_SUB\" where 1=1 GROUP BY CPHYLMC";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            Map result = new HashMap();
            result.put("tjnd", list1);
            result.put("cphylmc", list2);
            
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
            
            String sql = "select count(1) count,to_char(\"UPDATETIME\",'" + datePartten + "')  UPDATETIME1 from T_BUS_HBHG201_SUB where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"UPDATETIME\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"UPDATETIME\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"UPDATETIME\",'" + datePartten + "')  order by to_char(\"UPDATETIME\",'" + datePartten + "')  nulls last ";
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
            
            String sql = "select to_char( MAX(\"UPDATETIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from T_BUS_HBHG201_SUB where 1=1";
            
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
            String TJND = data.getOrDefault("TJND","").toString();//调查年度
            String CPHYLMC = data.getOrDefault("CPHYLMC","").toString();//产品或原料名称/种类
            String SFDB = data.getOrDefault("SFDB","").toString();//是否达标
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "select T1.*,T2.\"Name\" as \"pflbmc\" from (select \"UUID\", \"TJND\", \"XH\", \"PFYLB\", \"CPHYLMC\", \"CN\", \"CL\","
            		+ " \"PFYSL\", \"SJYGZL\", \"CPHGZL\", \"PFFSHGL\", \"PFFQHGL\", \"GTFWHGL\", \"HSGL\", \"SFDB\", \"PFYLB_SUB\", \"PFFSCSL\", "
            		+ "\"PFFQCSL\", \"GTFWCSL\", \"PFFSPFL\", \"PFFQPFL\", \"GTFWPFL\", \"HSL\", \"QYDBL\", "
            		+ "to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\",ROWNUM RN from \"T_BUS_HBHG201_SUB\" where 1=1 ";
            String sql2 = "select count(1) from T_BUS_HBHG201_SUB where 1=1";

            String sqlWhere = "";
            if (!"".equals(TJND)) {
            	sqlWhere += " and \"TJND\" = '" + TJND + "'";
            }
            if (!"".equals(CPHYLMC)) {
            	sqlWhere += " and \"CPHYLMC\" = '" + CPHYLMC + "'";
            }
            if (!"".equals(SFDB)) {
            	sqlWhere += " and \"SFDB\" = '" + SFDB + "'";
            }
            
            sql1 += sqlWhere;
            sql1 += " ) T1"
            		+ " left join \"T_Cod_EmissionsSourceType\" T2 on T1.\"PFYLB\"=T2.\"Code\"";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            for (Map map : list) {
            	//产品或原料名称/种类
                if(map.containsKey("CPHYLMC") && map.get("CPHYLMC")!=null){
	                String newStr = map.get("CPHYLMC").toString();
	        		String oldStr = map.get("CPHYLMC").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("CPHYLMC", newStr);
	        	}
                //是否达标
                if(map.containsKey("SFDB") && map.get("SFDB")!=null){
	                String newStr = map.get("SFDB").toString();
	        		String oldStr = map.get("SFDB").toString();
	        		if("1".equals(oldStr)){
	        			newStr = "是";
	        		}
	        		if("0".equals(oldStr)){
	        			newStr = "否";
	        		}
	        		map.put("SFDB", newStr);
	        	}
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("TJND", "调查年度");
            map.put("PFYLB", "排放源类别");
            map.put("CPHYLMC", "产品或原料名称/种类");
            map.put("CN", "产能");
            map.put("CL", "产量");
            map.put("PFYSL", "排放源数量");
            map.put("SJYGZL", "实际用汞/原料含汞总量");
            map.put("CPHGZL", "产品含汞总量");
            map.put("PFFSHGL", "排放废水含汞量");
            map.put("PFFQHGL", "排放废气含汞量");
            map.put("GTFWHGL", "固体废物含汞量");
            map.put("HSGL", "回收汞量");
            map.put("SFDB", "是否达标");
            map.put("PFYLB_Sub", "排放源列表子类");
            map.put("PFFSCSL", "排放废水产生量");
            map.put("PFFQCSL", "排放废气产生量");
            map.put("GTFWCSL", "排放废物产生量");
            map.put("PFFSPFL", "排放废水排放量");
            map.put("PFFQPFL", "排放废气排放量");
            map.put("GTFWPFL", "排放废物排放量");
            map.put("HSL", "回收量");
            map.put("QYDBL", "企业达标率");
            map.put("UPDATETIME", "更新日期");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "企业汞排放源概况数据", geturl, response);
            
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
