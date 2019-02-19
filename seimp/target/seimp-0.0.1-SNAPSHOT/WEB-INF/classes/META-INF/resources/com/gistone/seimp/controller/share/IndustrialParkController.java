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
 * 共享交换-工业园区
 *
 */
@RestController
@RequestMapping("shareExchange/indPar")
@SuppressWarnings("all")
public class IndustrialParkController {
	
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
	 * 涉重有色金属采矿权项目，分页数据
	 * bootstrap-table
	 */
	@RequestMapping( "getIndParData" )
    public Map getIndParData(HttpServletRequest request, HttpServletResponse response) {
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
            String name = data.getOrDefault("name","").toString();//开发区名称
            String type = data.getOrDefault("type","").toString();//开发区类型
            String province = data.getOrDefault("province", "").toString();//省
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
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCENAME from (select * from(select \"code\",\"province_name\",\"type_name\",\"type_id\",\"name\",ROWNUM RN  from \"tb_industrial_park\" where 1=1";
            String sql2 = "select count(1) from \"tb_industrial_park\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if("2".equals(userlevel)){
            	sqlWhere += " and \"code\" like '" + regionCode.substring(0, 2) +"%'";
            }
            if (!name.equals("")) {
            	sqlWhere += " and \"name\" like '%" + name + "%'";
            }
            if (!type.equals("")) {
            	sqlWhere += " and \"type_id\" = '" + type + "'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and \"code\" like '" + province.substring(0, 2) + "%'";
            }
            
            sql1 += sqlWhere;
            sql1 += ")  where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize)+")T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.\"code\", 0, 2), '0000')=c1.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看12369举报预警数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	/**
     * 工业园区 查询条件下拉框
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getIndParCon" )
    public EdatResult getIndParCon(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            String sql1 = "SELECT \"type_id\",\"type_name\" FROM \"tb_industrial_park_types\"";
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
            
            String sql = "select count(1) count,to_char(\"INSERTTIME\",'" + datePartten + "')  UPDATETIME from \"tb_industrial_park\" where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"INSERTTIME\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"INSERTTIME\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"INSERTTIME\",'" + datePartten + "')  order by to_char(\"INSERTTIME\",'" + datePartten + "')  nulls last ";
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
            
            String sql = "select to_char( MAX(\"INSERTTIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from \"YQ12369_DSJ_REPORTINFO\" where 1=1";
            
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
            String name = data.getOrDefault("name","").toString();//开发区名称
            String type = data.getOrDefault("type","").toString();//开发区类型
            String province = data.getOrDefault("province", "").toString();//省
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCENAME from (select * from(select \"code\",\"province_name\",\"type_name\",\"type_id\",\"name\",ROWNUM RN  from \"tb_industrial_park\" where 1=1";
            String sql2 = "select count(1) from \"tb_industrial_park\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if("2".equals(userlevel)){
            	sqlWhere += " and \"code\" like '" + regionCode.substring(0, 2) +"%'";
            }
            if (!name.equals("")) {
            	sqlWhere += " and \"name\" like '%" + name + "%'";
            }
            if (!type.equals("")) {
            	sqlWhere += " and \"type_id\" = '" + type + "'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and \"code\" like '" + province.substring(0, 2) + "%'";
            }
            
            sql1 += sqlWhere;
            sql1 += "))T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.\"code\", 0, 2), '0000')=c1.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
         
            
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("name", "名称");
            map.put("type_name", "类型");
            map.put("PROVINCENAME", "省份");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "工业园区", geturl, response);
            
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
