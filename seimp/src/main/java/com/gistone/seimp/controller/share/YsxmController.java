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
 * 共享交换-验收项目
 *
 */
@RestController
@RequestMapping("shareExchange/ysxm")
@SuppressWarnings("all")
public class YsxmController {
	
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
	 * 验收项目，分页数据
	 * bootstrap-table
	 * 省级用户处理
	 */
	@RequestMapping( "getYsxmData" )
    public Map getYsxmData(HttpServletRequest request, HttpServletResponse response) {
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
            String PROJECTNAME = data.getOrDefault("PROJECTNAME","").toString();//项目名称
            String PROJECTADDRESS = data.getOrDefault("PROJECTADDRESS","").toString();//项目地址
            String EIAMANAGENAME = data.getOrDefault("EIAMANAGENAME","").toString();//行业类别
            String province = data.getOrDefault("province","").toString();//省份
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
            		+ " select  ID,PROJECTNAME,EIAMANAGENAME,PROJECTADDRESS,EIAEVALUATIONNUMBER,PROVINCENAME,"
            		+ "UPDATEFLAG_HBB_BIGDATA,to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss') UPDATETIME_HBB_BIGDATA"
            		+ " "
            		+ "from \"YZ_BAS_ACPT\" where 1=1  ";
            String sql2 = "select count(1) from YZ_BAS_ACPT where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and PROVINCENAME like '" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(PROJECTNAME)) {
            	sqlWhere += " and \"PROJECTNAME\" like '%" + PROJECTNAME + "%'";
            }
            if (!"".equals(PROJECTADDRESS)) {
            	sqlWhere += " and \"PROJECTADDRESS\" like '%" + PROJECTADDRESS + "%'";
            }
            if (!"".equals(EIAMANAGENAME)) {
            	sqlWhere += " and \"EIAMANAGENAME\" = '" + EIAMANAGENAME + "'";
            }
            if (!"".equals(province)) {
            	sqlWhere += " and \"PROVINCENAME\" like '%" + province.substring(0, 2) + "%'";
            }
            
            sql1 += sqlWhere;
            sql1 += " order by UPDATETIME_HBB_BIGDATA desc nulls last)R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看验收项目数据");
            return result;
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
            
            String sql = "select count(1) count,to_char(\"UPDATETIME_HBB_BIGDATA\",'" + datePartten + "')  UPDATETIME1 from YZ_BAS_ACPT where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"UPDATETIME_HBB_BIGDATA\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"UPDATETIME_HBB_BIGDATA\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"UPDATETIME_HBB_BIGDATA\",'" + datePartten + "')  order by to_char(\"UPDATETIME_HBB_BIGDATA\",'" + datePartten + "')  nulls last ";
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
            
            String sql = "select to_char( MAX(\"UPDATETIME_HBB_BIGDATA\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from YZ_BAS_ACPT where 1=1";
            
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
            String PROJECTNAME = data.getOrDefault("PROJECTNAME","").toString();//项目名称
            String PROJECTADDRESS = data.getOrDefault("PROJECTADDRESS","").toString();//项目地址
            String EIAMANAGENAME = data.getOrDefault("EIAMANAGENAME","").toString();//行业类别
            String province = data.getOrDefault("province","").toString();//省份
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "	select * from ("
            		+ " select  ID,PROJECTNAME,EIAMANAGENAME,PROJECTADDRESS,EIAEVALUATIONNUMBER,PROVINCENAME,"
            		+ "UPDATEFLAG_HBB_BIGDATA,to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss') UPDATETIME_HBB_BIGDATA"
            		+ ",ROWNUM RN "
            		+ "from \"YZ_BAS_ACPT\" where 1=1  ";
            String sql2 = "select count(1) from YZ_BAS_ACPT where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and PROVINCENAME like '" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(PROJECTNAME)) {
            	sqlWhere += " and \"PROJECTNAME\" like '%" + PROJECTNAME + "%'";
            }
            if (!"".equals(PROJECTADDRESS)) {
            	sqlWhere += " and \"PROJECTADDRESS\" like '%" + PROJECTADDRESS + "%'";
            }
            if (!"".equals(EIAMANAGENAME)) {
            	sqlWhere += " and \"EIAMANAGENAME\" = '" + EIAMANAGENAME + "'";
            }
            if (!"".equals(province)) {
            	sqlWhere += " and \"PROVINCENAME\" like '%" + province.substring(0, 2) + "%'";
            }
            
            sql1 += sqlWhere;
            sql1 += " )";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            for (Map map : list) {
            	handleValue(map, "PROJECTADDRESS", "1");//项目地址
            	handleValue(map, "EIAMANAGENAME", "1");//行业类别
            	handleValue(map, "EIAEVALUATIONNUMBER", "1");//环评审批文号
            	
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("PROJECTNAME", "项目名称");
            map.put("PROJECTADDRESS", "项目地址");
            map.put("EIAMANAGENAME", "行业类别");
            map.put("EIAEVALUATIONNUMBER", "环评审批文号");
            map.put("UPDATEFLAG_HBB_BIGDATA", "更新标记");
            map.put("PROVINCENAME", "对接省份");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "验收项目数据", geturl, response);
            
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
