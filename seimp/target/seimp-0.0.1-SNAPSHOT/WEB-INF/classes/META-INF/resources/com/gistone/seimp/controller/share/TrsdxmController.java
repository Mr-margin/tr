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
 * 共享交换-土壤试点项目
 *
 */
@RestController
@RequestMapping("shareExchange/trsdxm")
@SuppressWarnings("all")
public class TrsdxmController {
	
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
            
            String sql = "select count(1) count,trim(\"XMLX\") \"name\" from \"TB_TRSDXM\" where 1=1 ";
          //省级用户处理
            if(userlevel.equals("2")){
            	sql += " and SHENG like '" + names.substring(0, 2) + "%'";
            }
            sql += " group by trim(\"XMLX\") order by count desc";
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
            
            String sql = "select count(1) count,\"SHENG\" \"name\" from \"TB_TRSDXM\" where 1=1 ";
          //省级用户处理
            if(userlevel.equals("2")){
            	sql += " and SHENG like '" + names.substring(0, 2) + "%'";
            }
            sql += " group by \"SHENG\" order by count asc ";
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
            
            String sql = "select count(1) count,\"SHI\" \"name\" from \"TB_TRSDXM\" where 1=1 ";
          //省级用户处理
            if(userlevel.equals("2")){
            	sql += " and SHENG like '" + names.substring(0, 2) + "%'";
            }
            sql += " group by \"SHI\" order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	/**
	 * 企业基本信息(危险化学品)，分页数据
	 * bootstrap-table
	 * 省级用户处理
	 */
	@RequestMapping( "getTrsdxmData" )
    public Map getTrsdxmData(HttpServletRequest request, HttpServletResponse response) {
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
            String XMMC = data.getOrDefault("XMMC","").toString();//单位名称
            String XMLX = data.getOrDefault("XMLX","").toString();//项目类型
            String DIZHI = data.getOrDefault("DIZHI","").toString();//地址
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
            
            String sql1 = "	select * from (select R.*,ROWNUM RN from (select ID, SHENG, SHI, XIAN, ZHEN, CUN, LON, LAT, BEIZHU, DIZHI, XMMC, XMLX,"
            		+ " INSERTPERSION, to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME from \"TB_TRSDXM\" where 1=1   ";
            String sql2 = "select count(1) from TB_TRSDXM where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and SHENG like '" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(XMMC)) {
            	sqlWhere += " and \"XMMC\" like '%" + XMMC + "%'";
            }
            if (!"".equals(XMLX)) {
            	sqlWhere += " and \"XMLX\" = '" + XMLX + "'";
            }
            if (!"".equals(DIZHI)) {
            	sqlWhere += " and \"DIZHI\" like '%" + DIZHI + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and SHENG like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and SHI like '" + city.substring(0, 2) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XIAN like '" + county.substring(0, 2) + "%'";
			}
			
			
			
            
            sql1 += sqlWhere;
            sql1 +=  " order by INSERTTIME desc nulls last)R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看土壤试点项目数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	 /**
     * 根据ID 获取数据
     */
    @RequestMapping( "getTrsdxmDataByID" )
    public EdatResult getTrsdxmDataByID(HttpServletRequest request, HttpServletResponse response) {
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

            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ID = data.getOrDefault("ID", "").toString();//污染地块ID
            
            String sql = "select ID, SHENG, SHI, XIAN, ZHEN, CUN, LON, LAT, BEIZHU, DIZHI, XMMC, XMLX,"
            		+ " INSERTPERSION, to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME, ROWNUM RN from \"TB_TRSDXM\""
            		+ " where 1=1  and ID='" + ID + "'";
            
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            if(list.size()>0){
            	return EdatResult.ok(list.get(0));
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	//土壤试点项目，查询条件
    @RequestMapping("getTrsdxmCons")
	public EdatResult getTrsdxmCons(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            String sql1 = "select XMLX from \"TB_TRSDXM\" where 1=1 GROUP BY XMLX";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list1);
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
            
            String sql = "select count(1) count,to_char(\"INSERTTIME\",'" + datePartten + "')  UPDATETIME1 from TB_TRSDXM where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"INSERTTIME\">=to_date('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"INSERTTIME\"<=to_date('" + endTime + "','yyyy-mm-dd')";
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
    
    //产品清单数据-最后更新时间
    @RequestMapping("getLastUpdateTime")
	public EdatResult getLastUpdateTime(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            
            String sql = "select to_char( MAX(\"INSERTTIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from TB_TRSDXM where 1=1";
            
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
            String XMMC = data.getOrDefault("XMMC","").toString();//单位名称
            String XMLX = data.getOrDefault("XMLX","").toString();//项目类型
            String DIZHI = data.getOrDefault("DIZHI","").toString();//地址
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "	select * from (select ID, SHENG, SHI, XIAN, ZHEN, CUN, LON, LAT, BEIZHU, DIZHI, XMMC, XMLX,"
            		+ " INSERTPERSION, to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME, ROWNUM RN from \"TB_TRSDXM\" where 1=1   ";
            String sql2 = "select count(1) from TB_TRSDXM where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and SHENG like '" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(XMMC)) {
            	sqlWhere += " and \"XMMC\" like '%" + XMMC + "%'";
            }
            if (!"".equals(XMLX)) {
            	sqlWhere += " and \"XMLX\" = '" + XMLX + "'";
            }
            if (!"".equals(DIZHI)) {
            	sqlWhere += " and \"DIZHI\" like '%" + DIZHI + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and SHENG like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and SHI like '" + city.substring(0, 2) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XIAN like '" + county.substring(0, 2) + "%'";
			}
			
			
			
            
            sql1 += sqlWhere;
            sql1 +=  ") ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            for (Map map : list) {

              
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("XMMC", "项目名称");
            map.put("XMLX", "项目类型");
            map.put("SHENG", "省");
            map.put("SHI", "市");
            map.put("XIAN", "县");
            map.put("ZHEN", "镇");
            map.put("CUN", "村");
            map.put("LON", "经度");
            map.put("LAT", "纬度");
            map.put("BEIZHU", "备注");
            map.put("DIZHI", "地点");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "土壤试点项目数据", geturl, response);
            
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
    
    /**
     *   
     * @Description: TODO
     * @author luowenbin
     * @date 2018年8月10日
     */
    private String getLon(Map map){
    	double result = 0;
    	if(map != null){
    		if(map.containsKey("ZXJD_D")){
    			if(map.get("ZXJD_D").toString() != ""){
    				try {
    					result = Integer.parseInt(map.get("ZXJD_D").toString().trim());
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("ZXJD_F")){
    			if(map.get("ZXJD_F").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("ZXJD_D").toString().trim())/60) * 100) / 100;
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("ZXJD_M")){
    			if(map.get("ZXJD_M").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("ZXJD_M").toString().trim())/3600) * 10000) / 10000;
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
    		if(map.containsKey("ZXWD_D")){
    			if(map.get("ZXWD_D").toString() != ""){
    				try {
    					result = Integer.parseInt(map.get("ZXWD_D").toString().trim());
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("ZXWD_F")){
    			if(map.get("ZXWD_F").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("ZXWD_F").toString().trim())/60) * 100) / 100;
					} catch (Exception e) {}
    			}
    		}
    		if(map.containsKey("ZXWD_M")){
    			if(map.get("ZXWD_M").toString() != ""){
    				try {
    					result += (double)Math.round((Double.parseDouble(map.get("ZXWD_M").toString().trim())/3600) * 10000) / 10000;
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
    
    
}
