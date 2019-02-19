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
 * 共享交换-企业基本信息(持久性有机物)
 *
 */
@RestController
@RequestMapping("shareExchange/jqyjbxx")
@SuppressWarnings("all")
public class JQyjbxxController {
	
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
	 * 企业基本信息(持久性有机物)，分页数据
	 * bootstrap-table
	 * 省级用户处理
	 */
	@RequestMapping( "getJQyjbxxData" )
    public Map getJQyjbxxData(HttpServletRequest request, HttpServletResponse response) {
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
            String XXMC = data.getOrDefault("XXMC","").toString();//单位名称
            String FLMC = data.getOrDefault("FLMC","").toString();//行业分类
            String LXMC = data.getOrDefault("LXMC","").toString();//企业注册类型
            String LBMC = data.getOrDefault("LBMC","").toString();//单位类别
            String XXDZ = data.getOrDefault("XXDZ","").toString();//详细地址
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
            
            String sql1 = "	select * from ( select R.*,ROWNUM RN from("
            		+ " select 	\"UUID\",\"WRY_ID\",\"CODE_XZQH\",\"SYND\",\"QYDM\",\"XXMC\",\"FRDM\","
            		+ "\"FRDM_2\",\"FRDB\",\"FLMC\",\"CODE_FLDM\",\"LXMC\",\"CODE_LXDM\",\"CODE_LBDM\",\"LBMC\","
            		+ "\"CODE_GXDM\",\"GXMC\",\"CODE_GMDM\",\"GMMC\",\"DZ_1\",\"DZ_2\",\"DZ_3\",\"DZ_4\",\"DZ_5\","
            		+ "\"JD\",\"SQ\",\"XXDZ\",\"QH\",\"YZBM\",\"DH\",\"FJ\",\"CZ\",\"YJ\",\"WZ\",\"JD_D\",\"JD_F\","
            		+ "\"JD_M\",\"WD_D\",\"WD_F\",\"WD_M\",\"ZDYLBDM\",\"ZDYLBMC\","
            		+ "to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" "
            		+ "from \"T_BUS_EEY_QY_XX\" where 1=1 ";
            String sql2 = "select count(1) from T_BUS_EEY_QY_XX where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and CODE_XZQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(XXMC)) {
            	sqlWhere += " and \"XXMC\" like '%" + XXMC + "%'";
            }
            if (!"".equals(FLMC)) {
            	sqlWhere += " and \"FLMC\" = '" + FLMC + "'";
            }
            if (!"".equals(LXMC)) {
            	sqlWhere += " and \"LXMC\" = '" + LXMC + "'";
            }
            if (!"".equals(LBMC)) {
            	sqlWhere += " and \"LBMC\" = '" + LBMC + "'";
            }
            if (!"".equals(XXDZ)) {
            	sqlWhere += " and \"XXDZ\" like '%" + XXDZ + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and CODE_XZQH like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and CODE_XZQH like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and CODE_XZQH like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += "order by UPDATETIME desc nulls last)R ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业基本信息(汞调查)数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	//企业基本信息(持久性有机物)，查询条件
    @RequestMapping("getJQyjbxxCons")
	public EdatResult getJQyjbxxCons(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            String sql1 = "select FLMC from \"T_BUS_EEY_QY_XX\" where 1=1 GROUP BY FLMC";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            String sql2 = "select LXMC from \"T_BUS_EEY_QY_XX\" where 1=1 GROUP BY LXMC";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            String sql3 = "select LBMC from \"T_BUS_EEY_QY_XX\" where 1=1 GROUP BY LBMC";
            List<Map> list3 = getBySqlMapper.findRecords(sql3);
            
            Map result = new HashMap();
            result.put("flmc", list1);
            result.put("lxmc", list2);
            result.put("lbmc", list3);
            
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
            
            String sql = "select count(1) count,to_char(\"UPDATETIME\",'" + datePartten + "')  UPDATETIME1 from T_BUS_EEY_QY_XX where 1=1 ";
            
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
            
            String sql = "select to_char( MAX(\"UPDATETIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from T_BUS_EEY_QY_XX where 1=1";
            
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
            String XXMC = data.getOrDefault("XXMC","").toString();//单位名称
            String FLMC = data.getOrDefault("FLMC","").toString();//行业分类
            String LXMC = data.getOrDefault("LXMC","").toString();//企业注册类型
            String LBMC = data.getOrDefault("LBMC","").toString();//单位类别
            String XXDZ = data.getOrDefault("XXDZ","").toString();//详细地址
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "	select * from ("
            		+ " select 	\"UUID\",\"WRY_ID\",\"CODE_XZQH\",\"SYND\",\"QYDM\",\"XXMC\",\"FRDM\","
            		+ "\"FRDM_2\",\"FRDB\",\"FLMC\",\"CODE_FLDM\",\"LXMC\",\"CODE_LXDM\",\"CODE_LBDM\",\"LBMC\","
            		+ "\"CODE_GXDM\",\"GXMC\",\"CODE_GMDM\",\"GMMC\",\"DZ_1\",\"DZ_2\",\"DZ_3\",\"DZ_4\",\"DZ_5\","
            		+ "\"JD\",\"SQ\",\"XXDZ\",\"QH\",\"YZBM\",\"DH\",\"FJ\",\"CZ\",\"YJ\",\"WZ\",\"JD_D\",\"JD_F\","
            		+ "\"JD_M\",\"WD_D\",\"WD_F\",\"WD_M\",\"ZDYLBDM\",\"ZDYLBMC\","
            		+ "to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\",ROWNUM RN "
            		+ "from \"T_BUS_EEY_QY_XX\" where 1=1 ";
            String sql2 = "select count(1) from T_BUS_EEY_QY_XX where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and CODE_XZQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(XXMC)) {
            	sqlWhere += " and \"XXMC\" like '%" + XXMC + "%'";
            }
            if (!"".equals(FLMC)) {
            	sqlWhere += " and \"FLMC\" = '" + FLMC + "'";
            }
            if (!"".equals(LXMC)) {
            	sqlWhere += " and \"LXMC\" = '" + LXMC + "'";
            }
            if (!"".equals(LBMC)) {
            	sqlWhere += " and \"LBMC\" = '" + LBMC + "'";
            }
            if (!"".equals(XXDZ)) {
            	sqlWhere += " and \"XXDZ\" like '%" + XXDZ + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and CODE_XZQH like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and CODE_XZQH like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and CODE_XZQH like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += " ) ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            for (Map map : list) {
            	handleValue(map, "SYND", "1");//统计年度
            	handleValue(map, "XXMC", "1");//法人单位名称
            	handleValue(map, "FRDB", "1");//法定代表人
            	handleValue(map, "FLMC", "1");//行业分类
            	handleValue(map, "LXMC", "1");//登记注册类型
            	handleValue(map, "LBMC", "1");//单位类别
            	handleValue(map, "GXMC", "1");//企业关系名称
            	handleValue(map, "GMMC", "1");//企业规模名称
            	handleValue(map, "DZ_1", "1");//省
            	handleValue(map, "DZ_2", "1");//市
            	handleValue(map, "DZ_3", "1");//县
            	handleValue(map, "DZ_4", "1");//乡
            	handleValue(map, "DZ_5", "1");//村
            	handleValue(map, "JD", "1");//街道
            	handleValue(map, "SQ", "1");//社区门牌
            	handleValue(map, "XXDZ", "1");//详细地址
            	handleValue(map, "QH", "1");//区号
            	handleValue(map, "YZBM", "1");//邮政编码
            	handleValue(map, "DH", "1");//电话
            	handleValue(map, "FJ", "1");//分机
            	handleValue(map, "CZ", "1");//传真
            	handleValue(map, "YJ", "1");//邮件
            	handleValue(map, "WZ", "1");//网站
            	//中心经度
                if(map.containsKey("JD_D") && map.get("JD_D")!=null){
	        		if(map != null){
	        			map.put("JD_D", getLon(map));
	        		}
	        	}
                //中心纬度
                if(map.containsKey("WD_D") && map.get("WD_D")!=null){
	                if(map != null){
	                	map.put("WD_D", getLat(map));
	                }
	        	}
            	handleValue(map, "ZDYLBMC", "1");//排放源分类名称
            	handleValue(map, "BZ", "1");//备注
            	handleValue(map, "UPDATETIME", "1");//更新时间
                
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("TJND", "统计年度");
            map.put("XXMC", "法人单位名称");
            map.put("FRDB", "法定代表人");
            map.put("FLMC", "行业分类");
            map.put("LXMC", "登记注册类型");
            map.put("LBMC", "单位类别");
            map.put("GXMC", "企业关系名称");
            map.put("GMMC", "企业规模名称");
            map.put("DZ_1", "省");
            map.put("DZ_2", "市");
            map.put("DZ_3", "县");
            map.put("DZ_4", "乡");
            map.put("DZ_5", "村");
            map.put("JD", "街道");
            map.put("SQ", "社区门牌");
            map.put("XXDZ", "详细地址");
            map.put("QH", "区号");
            map.put("YZBM", "邮政编码");
            map.put("DH", "电话");
            map.put("FJ", "分机");
            map.put("CZ", "传真");
            map.put("YJ", "邮件");
            map.put("WZ", "网站");
            map.put("JD_D", "中心经度");
            map.put("WD_D", "中心纬度");
            map.put("ZDYLBMC", "排放源分类名称");
            map.put("BZ", "备注");
            map.put("UPDATETIME", "更新时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "企业基本信息(持久性有机物)数据", geturl, response);
            
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
