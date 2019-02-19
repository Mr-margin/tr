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
 * 共享交换-网络舆情
 *
 */
@RestController
@RequestMapping("shareExchange/networkNews")
@SuppressWarnings("all")
public class NetworkNewsController {
	
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
            
            String sql = "select count(1) count,to_char(\"fetchTime\",'yyyy-mm')  \"name\" from \"tb_network_news\" where \"fetchTime\">to_timestamp('2000','yyyy')";
          //省级用户处理
            if("2".equals(userlevel)){
            	sql += " and \"chinaRegion1\" like '%" + regionCode +"%'";
            }
            sql += " group by to_char(\"fetchTime\",'yyyy-mm') order by to_char(\"fetchTime\",'yyyy-mm') asc";
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
            
            String sql = "select count(1) count,PROVINCE \"name\" from \"tb_network_news\" where 1=1 ";
            //省级用户处理
            if("2".equals(userlevel)){
            	sql += " and \"chinaRegion1\" like '%" + regionCode +"%'";
            }
            sql += " group by PROVINCE order by count desc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	/**
	 * 网络舆情，分页数据
	 * bootstrap-table
	 */
	@RequestMapping( "getNetworkNewsData" )
    public Map getNetworkNewsData(HttpServletRequest request, HttpServletResponse response) {
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
            String title = data.getOrDefault("title","").toString();//标题
            String newsType = data.getOrDefault("newsType","").toString();//舆情类型
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
            
            String sql1 = "select * from ( select R.*,ROWNUM RN from (select \"id\", \"newsid\", \"url\", \"urlhash\", \"title\", \"content\", "
                    + " \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\",to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss') \"fetchTime\","
                    + " \"summary\", \"newsType\", \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\", \"DICT_type\", "
                    + " \"mainContentHtml\", \"encoding\", \"codePage\", \"state\", \"titlesimhash\", \"contentsimhash\",INSERTTIME "
                    + " from \"tb_network_news\" where \"state\"='0'";
            String sql2 = "select count(*) from \"tb_network_news\" where \"state\"='0'";

            String sqlWhere = "";
            //省级用户处理
            if("2".equals(userlevel)){
            	sqlWhere += " and \"chinaRegion1\" like '%" + regionCode +"%'";
            }
            if (!title.equals("")) {
            	sqlWhere += " and \"title\" like '%" + title + "%'";
            }
            if (!newsType.equals("")) {
            	sqlWhere += " and \"newsType\" = '" + newsType + "'";
            }
            
            sql1 += sqlWhere;
            sql1 += " order by \"fetchTime\" desc nulls last )R)  where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理clob类型数据
            for (Map map : list) {
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("content");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("content", content1);
                }
            }
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看网络舆情数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	/**
     * 根据ID，获取网络舆情数据
     */
    @RequestMapping( "getNetworkNewsDataByID" )
    public EdatResult getNetworkNewsDataByID(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }

            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsid = data.getOrDefault("newsid", "").toString();//
            
            String sql1 = "select \"id\", \"newsid\", \"url\", \"urlhash\", \"title\", \"content\", "
                    + " \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\",to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss') \"fetchTime\","
                    + " \"summary\", \"newsType\", \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\", \"DICT_type\", "
                    + " \"mainContentHtml\", \"encoding\", \"codePage\", \"state\", \"titlesimhash\", \"contentsimhash\",INSERTTIME,ROWNUM RN"
                    + " from \"tb_network_news\" where \"state\"='0' and  \"newsid\"='"+newsid+"'";
           
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理clob类型数据
            for (Map map : list) {
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("content");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("content", content1);
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
     * 网络舆情 查询条件下拉框
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getNetworkNewsCon" )
    public EdatResult getNetworkNewsCon(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            String sql1 = "select \"newsType\" from \"tb_network_news\" where 1=1 group by \"newsType\"";

            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
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
            
            String sql = "select count(1) count,to_char(\"INSERTTIME\",'" + datePartten + "')  UPDATETIME from \"tb_network_news\" where \"state\"='0'";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"INSERTTIME\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"INSERTTIME\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += "  group by to_char(\"INSERTTIME\",'" + datePartten + "')  order by to_char(\"INSERTTIME\",'" + datePartten + "')  nulls last ";
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
            
            String sql = "select to_char( MAX(\"INSERTTIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from \"tb_network_news\" where \"state\"='0'";
            
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
            String title = data.getOrDefault("title","").toString();//标题
            String newsType = data.getOrDefault("newsType","").toString();//舆情类型
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select * from (select \"id\", \"newsid\", \"url\", \"urlhash\", \"title\", \"content\", "
                    + " \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\",to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss') \"fetchTime\","
                    + " \"summary\", \"newsType\", \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\", \"DICT_type\", "
                    + " \"mainContentHtml\", \"encoding\", \"codePage\", \"state\", \"titlesimhash\", \"contentsimhash\",INSERTTIME,ROWNUM RN"
                    + " from \"tb_network_news\" where \"state\"='0'";

            String sqlWhere = "";
            //省级用户处理
            if("2".equals(userlevel)){
            	sqlWhere += " and \"chinaRegion1\" like '%" + regionCode +"%'";
            }
            if (!title.equals("")) {
            	sqlWhere += " and \"title\" like '%" + title + "%'";
            }
            if (!newsType.equals("")) {
            	sqlWhere += " and \"newsType\" = '" + newsType + "'";
            }
            
//            sqlWhere += " and \"chinaRegion2\" like '%成都%'";
            
            sql1 += sqlWhere;
            sql1 += ")  ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理clob类型数据
            for (Map map : list) {
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("content");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("content", content1);
                }
                
                //相关省份
                if(map.containsKey("chinaRegion1") && map.get("chinaRegion1")!=null){
	                String newStr = map.get("chinaRegion1").toString();
	        		String oldStr = map.get("chinaRegion1").toString();
	        		newStr = handleCodeAndName(oldStr);
	        		map.put("chinaRegion1", newStr);
	        	}
                
                //相关市
                if(map.containsKey("chinaRegion2") && map.get("chinaRegion2")!=null){
	                String newStr = map.get("chinaRegion2").toString();
	        		String oldStr = map.get("chinaRegion2").toString();
	        		newStr = handleCodeAndName(oldStr);
	        		map.put("chinaRegion2", newStr);
	        	}
                
                //相关县
                if(map.containsKey("chinaRegion3") && map.get("chinaRegion3")!=null){
	                String newStr = map.get("chinaRegion3").toString();
	        		String oldStr = map.get("chinaRegion3").toString();
	        		newStr = handleCodeAndName(oldStr);
	        		map.put("chinaRegion3", newStr);
	        	}
                
                //审核状态
                if(map.containsKey("state") && map.get("state")!=null){
	                String newStr = map.get("state").toString();
	        		String oldStr = map.get("state").toString();
	        		if("1".equals(oldStr)){
	        			newStr = "审核通过";
	        		}
	        		if("0".equals(oldStr)){
	        			newStr = "审核未通过";
	        		}
	        		map.put("state", newStr);
	        	}else{
	        		map.put("state", "未审核");
	        	}
            }
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("title", "标题");
            map.put("url", "链接");
            map.put("source", "发布部门");
            map.put("fetchTime", "抓取时间");
            map.put("summary", "摘要");
            map.put("newsType", "所属分类");
            map.put("domain", "网站");
            map.put("chinaRegion1", "相关省份");
            map.put("chinaRegion2", "相关市");
            map.put("chinaRegion3", "相关县");
            map.put("DICT_type", "资讯类型");
            map.put("state", "审核状态");
           
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "网络舆情数据", geturl, response);
            
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
    
    private String handleCodeAndName(String value){
    	String result = "";
    	String[] codeAndNameArr = value.split(",");
    	for (int i = 0; i < codeAndNameArr.length; i++) {
			String currCodeAndName = codeAndNameArr[i];
			String[] codeOrNameArr = currCodeAndName.split("_");
			if(codeOrNameArr.length>1){
				result += codeOrNameArr[1] + ",";
			}
		}
    	if(result.length() > 0){
    		return result.substring(0, result.length()-1);
    	}
    	return result;
    }
}
