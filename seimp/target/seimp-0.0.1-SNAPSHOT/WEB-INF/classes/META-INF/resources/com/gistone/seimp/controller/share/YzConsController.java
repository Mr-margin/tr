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
 * 共享交换-建设项目环评
 *
 */
@RestController
@RequestMapping("shareExchange/yzCons")
@SuppressWarnings("all")
public class YzConsController {
	
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
            
            String sql = "select count(1) count,HYNAME \"name\" from YZ_CONS where 1=1 ";
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql += " and PROVINCENAME like '%" + names + "%'";
            }
            sql += " group by HYNAME order by count desc";
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
            
            String sql = "select count(1) count,PROVINCENAME \"name\" from YZ_CONS where 1=1 ";

            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql += " and PROVINCENAME like '%" + names + "%'";
            }
            sql += " group by PROVINCENAME order by count desc ";
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
            
            String sql = "select count(1) count,PROVINCENAME \"name\" from YZ_CONS where 1=1 ";

            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sql += " and PROVINCENAME like '%" + names + "%'";
            }
            sql += " group by PROVINCENAME order by count desc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

	/**
	 * 获取建设项目分页数据
	 * 省级用户处理
	 * bootstrap-table
	 * @author luowenbin
	 * @date 2018年6月25日
	 */
	@RequestMapping( "getYzConsData" )
    public Map getYzConsData(HttpServletRequest request, HttpServletResponse response) {
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
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize", "10").toString());//每页条数
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "0").toString());//开始索引
            String projectname = data.getOrDefault("projectname","").toString();//项目名称
            String provincename = data.getOrDefault("provincename","").toString();//省份
            String eiamanagename = data.getOrDefault("eiamanagename","").toString();//环评管理类别名称
            String nationalecomomyname = data.getOrDefault("nationalecomomyname","").toString();//国民经济类别名称
            String datasource = data.getOrDefault("datasource","").toString();//数据来源
            String acceptancedateStart = data.getOrDefault("acceptancedateStart","").toString();//受理日期开始
            String acceptancedateEnd = data.getOrDefault("acceptancedateEnd","").toString();//受理日期结束
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
            
            String sql1 = "select * from (select T1.*,ROWNUM RN from (select \"CONSTRUCTIONID\" ID , \"PROJECTNAME\", \"EIAFILETYPE\", \"ACCEPTANCEDATE\", "
            		+ "\"NATIONALECONOMYCODE\", " + "\"DATASOURCE\", \"EIAMANAGETYPE\", \"PROJECTADDRESS\", \"PROJECTINVEST\", "
            				+ "\"ENVIRONINVEST\", \"PROVINCENAME\", \"DELMARK\", \"LONGITUDE\"," + "\"LATITUDE\", \"NATIONALECONOMYNAME\", "
            						+ "\"EIAMANAGENAME\", \"STORAGETIME\", \"CONSREPORTPATH\"," + 
            				" to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, \"ISDOWNLOADED\" from YZ_CONS where 1=1 ";
            String sql2 = "select count(1) from YZ_CONS where 1=1 ";
            String sqlWhere = "";
            
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sqlWhere += " and PROVINCENAME like '%" + names + "%'";
            }
            if(!"".equals(projectname)){
            	sqlWhere += " and PROJECTNAME like '%" + projectname + "%'";
            }
            if(!"".equals(provincename)){
            	provincename = provincename.replace("省", "");
            	provincename = provincename.replace("市", "");
            	sqlWhere += " and PROVINCENAME like '%" + provincename + "%'";
            }
            if(!"".equals(eiamanagename)){//环评管理类别名称
            	String[] eiaArrs = eiamanagename.split(",");
            	if(eiaArrs.length>0){
            		sqlWhere += " and (  ";
            	}
            	for (int i = 0; i < eiaArrs.length; i++) {
					String eiaStr = eiaArrs[i];
					if(i==0){
						sqlWhere += "  EIAMANAGENAME like '%" + eiaStr + "%'";
					}else{
						sqlWhere += " or EIAMANAGENAME like '%" + eiaStr + "%'";
					}
				}
            	if(eiaArrs.length>0){
            		sqlWhere += "  )";
            	}
            }
            if(!"".equals(nationalecomomyname) && !"''".equals(nationalecomomyname)){///国民经济类别名称
            	sqlWhere += " and NATIONALECONOMYNAME in (" + nationalecomomyname + ")";
            }
            if(!"".equals(datasource)){
            	sqlWhere += " and DATASOURCE = '" + datasource + "'";
            }
            if(!"".equals(acceptancedateStart)){
            	sqlWhere += " and ACCEPTANCEDATE >= '" + acceptancedateStart + "'";
            }
            if(!"".equals(acceptancedateEnd)){
            	sqlWhere += " and ACCEPTANCEDATE <= '" + acceptancedateEnd + "'";
            }
            sqlWhere += " and ACCEPTANCEDATE <= '" + df.format(new Date()) + "'";
            
            //数据集合
            sql1 += sqlWhere;
            sql1 += " order by ACCEPTANCEDATE desc nulls last )T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //数据总条数
            sql2 += sqlWhere;
            Integer total = getBySqlMapper.findrows(sql2);
            
            //接口返回数据
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看建设项目数据");
            return result;
		} catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
	
	/**
	 * 
	 */
	@RequestMapping( "getYzConsDataByID" )
    public EdatResult getYzConsDataByID(HttpServletRequest request, HttpServletResponse response) {
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
            String CONSTRUCTIONID = data.getOrDefault("CONSTRUCTIONID","").toString();//
            
            
            String sql1 = "select \"CONSTRUCTIONID\" , \"PROJECTNAME\", \"EIAFILETYPE\", \"ACCEPTANCEDATE\", "
            		+ "\"NATIONALECONOMYCODE\", \"DATASOURCE\", \"EIAMANAGETYPE\", \"PROJECTADDRESS\", \"PROJECTINVEST\", "
            		+ "\"ENVIRONINVEST\", \"PROVINCENAME\", \"DELMARK\", \"LONGITUDE\",\"LATITUDE\", \"NATIONALECONOMYNAME\", "
            		+ "\"EIAMANAGENAME\", \"STORAGETIME\", \"CONSREPORTPATH\","
            		+ " to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, \"ISDOWNLOADED\" from YZ_CONS"
            		+ " where CONSTRUCTIONID='" + CONSTRUCTIONID + "'";
            
            
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
     * 所有数据来源
     */
    @RequestMapping( "getAllDatasource" )
    public EdatResult getAllDatasource(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            String sql1 = "select DATASOURCE from YZ_CONS where 1=1";
            sql1 += " group by DATASOURCE";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            ///国民经济类别名称
            String sql2 = "select DISTINCT NATIONALECONOMYNAME from YZ_CONS where NATIONALECONOMYNAME is not null";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            Map map = new HashMap();
            map.put("dataSource", list);
            map.put("nationaleconomyname", list2);
            
            return EdatResult.ok(map);
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
            
            String sql = "select count(1) count,to_char(INSERTTIME,'" + datePartten + "')  UPDATETIME from YZ_CONS where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	names = names.replace("省", "");
            	sql += " and PROVINCENAME like '%" + names + "%'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and INSERTTIME>=to_date('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and INSERTTIME<=to_date('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(INSERTTIME,'" + datePartten + "')  order by to_char(INSERTTIME,'" + datePartten + "')  nulls last ";
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
            
            
            String sql = "select to_char( MAX(INSERTTIME),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from YZ_CONS where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	names = names.replace("省", "");
            	sql += " and PROVINCENAME like '%" + names + "%'";
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
            String projectname = data.getOrDefault("projectname","").toString();//项目名称
            String provincename = data.getOrDefault("provincename","").toString();//省份
            String eiamanagename = data.getOrDefault("eiamanagename","").toString();//环评管理类别名称
            String datasource = data.getOrDefault("datasource","").toString();//数据来源
            String acceptancedateStart = data.getOrDefault("acceptancedateStart","").toString();//受理日期开始
            String acceptancedateEnd = data.getOrDefault("acceptancedateEnd","").toString();//受理日期结束
            String metadataID = data.getOrDefault("metadataID","").toString();//受理日期结束
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select \"CONSTRUCTIONID\" ID , \"PROJECTNAME\", \"EIAFILETYPE\", \"ACCEPTANCEDATE\" , "
            		+ "\"NATIONALECONOMYCODE\", " + "\"DATASOURCE\", \"EIAMANAGETYPE\", \"PROJECTADDRESS\", \"PROJECTINVEST\", "
            				+ "\"ENVIRONINVEST\", \"PROVINCENAME\", \"DELMARK\", \"LONGITUDE\"," + "\"LATITUDE\", \"NATIONALECONOMYNAME\", "
            						+ "\"EIAMANAGENAME\", \"STORAGETIME\", \"CONSREPORTPATH\"," + 
            				" to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, \"ISDOWNLOADED\" from YZ_CONS where 1=1 ";
            String sqlWhere = "";
            String sql2 = "select count(1) from YZ_CONS where 1=1 ";
            
            //省级用户处理
            if(userlevel.equals("2")){
            	names = names.replace("省", "");
            	sqlWhere += " and PROVINCENAME like '%" + names + "%'";
            }
            if(!"".equals(projectname)){
            	sqlWhere += " and PROJECTNAME like '%" + projectname + "%'";
            }
            if(!"".equals(provincename)){
            	provincename = provincename.replace("省", "");
            	provincename = provincename.replace("市", "");
            	sqlWhere += " and PROVINCENAME like '%" + provincename + "%'";
            }
            if(!"".equals(eiamanagename)){
            	sqlWhere += " and EIAMANAGENAME = '" + eiamanagename + "'";
            }
            if(!"".equals(datasource)){
            	sqlWhere += " and DATASOURCE = '" + datasource + "'";
            }
            if(!"".equals(acceptancedateStart)){
            	sqlWhere += " and ACCEPTANCEDATE >= '" + acceptancedateStart + "'";
            }
            if(!"".equals(acceptancedateEnd)){
            	sqlWhere += " and ACCEPTANCEDATE <= '" + acceptancedateEnd + "'";
            }
            
          //数据总条数
            sql2 += sqlWhere;
            Integer total = getBySqlMapper.findrows(sql2);
            if(total>500000){
            	return  EdatResult.ok("您当前下载的数据量过大，请设置过滤条件后重新下载！");
            }
            
            //数据集合
            sql1 += sqlWhere;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("PROJECTNAME", "项目名称");
            map.put("DATASOURCE", "数据来源");
            map.put("EIAMANAGENAME", "环评管理类别名称");
            map.put("ACCEPTANCEDATE", "受理日期");
            map.put("PROVINCENAME", "对接省份");
            map.put("NATIONALECONOMYNAME", "国民经济类别名称");
            map.put("PROJECTINVEST", "总投资（万元）");
            map.put("ENVIRONINVEST", "环保投资（万元）");
            map.put("PROJECTADDRESS", "建设地点");
            map.put("LONGITUDE", "经度");
            map.put("LATITUDE", "纬度");
            map.put("STORAGETIME", "入监管平台时间");
            map.put("INSERTTIME", "更新时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "建设项目数据", geturl, response);
            
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
