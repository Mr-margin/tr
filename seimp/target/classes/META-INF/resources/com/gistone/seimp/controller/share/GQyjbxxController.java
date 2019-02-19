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
 * 共享交换-企业基本信息(汞调查)
 *
 */
@RestController
@RequestMapping("shareExchange/gqyjbxx")
@SuppressWarnings("all")
public class GQyjbxxController {
	
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
	 * 企业基本信息(汞调查)，分页数据
	 * bootstrap-table
	 * 省级用户处理
	 */
	@RequestMapping( "getGQyjbxxData" )
    public Map getGQyjbxxData(HttpServletRequest request, HttpServletResponse response) {
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
            String DWMC = data.getOrDefault("DWMC","").toString();//单位名称
            String HYFL = data.getOrDefault("HYFL","").toString();//行业分类
            String QYZCLXMC = data.getOrDefault("QYZCLXMC","").toString();//企业注册类型
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
            
            String sql1 = "select T1.*, T2.\"Name\" as \"danwei\",T3.\"Name\" as \"lishu\",T4.\"QYGM_NAME\" as \"qygmmc\",T5.\"Name\" as \"pflbmc\" from ("
            		+ "	select * from (select R.*,ROWNUM RN from("
            		+ " select \"UUID\", \"WRY_ID\", \"TJND\", \"DWMC\", \"DWZZJGDM\", \"FDDBR\", \"CODE_XZQH\","
            		+ " \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"HAO\", \"YZBM\", \"ZXJD\", \"ZXWD\", \"HYFL\","
            		+ " \"CODE_HYFL\", \"QYZCLXMC\", \"CODE_QYZCLX\", \"CODE_DWLB\", \"CODE_LSGX\", \"CODE_QYGM\","
            		+ " \"GYZCZ\", \"JCSJ\", \"CYRS\", \"LXR\", \"LXDH\", \"CZHM\", \"EMAIL\", \"DWWZ\", \"PFYLB\","
            		+ " \"PFYLBMC\", \"DWFZR\", \"SHR\", \"TBR\", \"TBRQ\", \"JD_D\", \"JD_F\", \"JD_M\", \"WD_D\","
            		+ " \"WD_F\", \"WD_M\", \"ISPASSED\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" "
            		+ " from \"T_BUS_HBHG101\" where 1=1 ";
            String sql2 = "select count(1) from T_BUS_HBHG101 where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and CODE_XZQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and \"DWMC\" like '%" + DWMC + "%'";
            }
            if (!"".equals(HYFL)) {
            	sqlWhere += " and \"HYFL\" = '" + HYFL + "'";
            }
            if (!"".equals(QYZCLXMC)) {
            	sqlWhere += " and \"QYZCLXMC\" = '" + QYZCLXMC + "'";
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
            sql1 += " order by UPDATETIME desc nulls last )R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize)
            		+ " ) T1"
            		+ " left join \"T_Cod_OrganizationType\" T2 on T1.\"CODE_DWLB\"=T2.\"Code\""
            		+ " left join \"T_Cod_Subjection\" T3 on T1.\"CODE_LSGX\"=T3.\"Code\""
            		+ " left join \"T_Cod_QYGM\" T4 on T1.\"CODE_QYGM\"=T4.\"QYGM_CODE\""
            		+ " left join \"T_Cod_EmissionsSourceType\" T5 on T1.\"PFYLB\"=T5.\"Code\"";
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
	
	//企业基本信息(汞调查)，查询条件
    @RequestMapping("getGQyjbxxCons")
	public EdatResult getGQyjbxxCons(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            String sql1 = "select HYFL from \"T_BUS_HBHG101\" where 1=1 GROUP BY HYFL";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            String sql2 = "select QYZCLXMC from \"T_BUS_HBHG101\" where 1=1 GROUP BY QYZCLXMC";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            Map result = new HashMap();
            result.put("hyfl", list1);
            result.put("qyzclmc", list2);
            
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
            
            String sql = "select count(1) count,to_char(\"UPDATETIME\",'" + datePartten + "')  UPDATETIME1 from T_BUS_HBHG101 where 1=1 ";
            
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
            
            String sql = "select to_char( MAX(\"UPDATETIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from T_BUS_HBHG101 where 1=1";
            
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
            String DWMC = data.getOrDefault("DWMC","").toString();//单位名称
            String HYFL = data.getOrDefault("HYFL","").toString();//行业分类
            String QYZCLXMC = data.getOrDefault("QYZCLXMC","").toString();//企业注册类型
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "select T1.*, T2.\"Name\" as \"danwei\",T3.\"Name\" as \"lishu\",T4.\"QYGM_NAME\" as \"qygmmc\",T5.\"Name\" as \"pflbmc\" from ("
            		+ "	select * from ("
            		+ " select \"UUID\", \"WRY_ID\", \"TJND\", \"DWMC\", \"DWZZJGDM\", \"FDDBR\", \"CODE_XZQH\","
            		+ " \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"HAO\", \"YZBM\", \"ZXJD\", \"ZXWD\", \"HYFL\","
            		+ " \"CODE_HYFL\", \"QYZCLXMC\", \"CODE_QYZCLX\", \"CODE_DWLB\", \"CODE_LSGX\", \"CODE_QYGM\","
            		+ " \"GYZCZ\", \"JCSJ\", \"CYRS\", \"LXR\", \"LXDH\", \"CZHM\", \"EMAIL\", \"DWWZ\", \"PFYLB\","
            		+ " \"PFYLBMC\", \"DWFZR\", \"SHR\", \"TBR\", \"TBRQ\", \"JD_D\", \"JD_F\", \"JD_M\", \"WD_D\","
            		+ " \"WD_F\", \"WD_M\", \"ISPASSED\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\",ROWNUM RN"
            		+ " from \"T_BUS_HBHG101\" where 1=1 ";
            String sql2 = "select count(1) from T_BUS_HBHG101 where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and CODE_XZQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and \"DWMC\" like '%" + DWMC + "%'";
            }
            if (!"".equals(HYFL)) {
            	sqlWhere += " and \"HYFL\" = '" + HYFL + "'";
            }
            if (!"".equals(QYZCLXMC)) {
            	sqlWhere += " and \"QYZCLXMC\" = '" + QYZCLXMC + "'";
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
            sql1 += " ) ) T1"
            		+ " left join \"T_Cod_OrganizationType\" T2 on T1.\"CODE_DWLB\"=T2.\"Code\""
            		+ " left join \"T_Cod_Subjection\" T3 on T1.\"CODE_LSGX\"=T3.\"Code\""
            		+ " left join \"T_Cod_QYGM\" T4 on T1.\"CODE_QYGM\"=T4.\"QYGM_CODE\""
            		+ " left join \"T_Cod_EmissionsSourceType\" T5 on T1.\"PFYLB\"=T5.\"Code\"";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            for (Map map : list) {
            	//省
                if(map.containsKey("SHENG") && map.get("v")!=null){
	                String newStr = map.get("SHENG").toString();
	        		String oldStr = map.get("SHENG").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("SHENG", newStr);
	        	}
                //市
                if(map.containsKey("SHI") && map.get("SHI")!=null){
	                String newStr = map.get("SHI").toString();
	        		String oldStr = map.get("SHI").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("SHI", newStr);
	        	}
                
                
              //县
                if(map.containsKey("XIAN") && map.get("XIAN")!=null){
	                String newStr = map.get("XIAN").toString();
	        		String oldStr = map.get("XIAN").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("XIAN", newStr);
	        	}
              //乡
                if(map.containsKey("XIANG") && map.get("XIANG")!=null){
	                String newStr = map.get("XIANG").toString();
	        		String oldStr = map.get("XIANG").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("XIANG", newStr);
	        	}
              //号
                if(map.containsKey("HAO") && map.get("HAO")!=null){
	                String newStr = map.get("HAO").toString();
	        		String oldStr = map.get("HAO").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("HAO", newStr);
	        	}
              
                //中心经度
                if(map.containsKey("ZXJD") && map.get("ZXJD")!=null){
	        		String oldStr = map.get("ZXJD").toString();
	        		map.put("ZXJD", getLonLat(oldStr));
	        	}
              //中心纬度
                if(map.containsKey("ZXWD") && map.get("ZXWD")!=null){
	        		String oldStr = map.get("ZXWD").toString();
	        		map.put("ZXWD", getLonLat(oldStr));
	        	}
              //单位网址
                if(map.containsKey("DWWZ") && map.get("DWWZ")!=null){
	                String newStr = map.get("DWWZ").toString();
	        		String oldStr = map.get("DWWZ").toString();
	        		if("(null)".equals(oldStr)){
	        			newStr = "";
	        		}
	        		map.put("DWWZ", newStr);
	        	}
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("TJND", "调查年度");
            map.put("DWMC", "单位名称");
            map.put("FDDBR", "法定代表人");
            map.put("SHENG", "省");
            map.put("SHI", "市");
            map.put("XIAN", "县");
            map.put("XIANG", "乡");
            map.put("HAO", "号");
            map.put("YZBM", "邮政编码");
            map.put("ZXJD", "中心经度");
            map.put("ZXWD", "中心纬度");
            map.put("HYFL", "行业分类");
            map.put("QYZCLXMC", "企业注册类型");
            map.put("danwei", "单位类别");
            map.put("lishu", "隶属关系");
            map.put("qygmmc", "企业规模");
            map.put("GYZCZ", "工业总产值");
            map.put("JCSJ", "建厂时间");
            map.put("CYRS", "从业人数");
            map.put("LXR", "联系人");
            map.put("LXDH", "联系电话");
            map.put("CZHM", "传真号码");
            map.put("Email", "电子邮箱");
            map.put("DWWZ", "单位网址");
            map.put("pflbmc", "排放类别");
            map.put("DWFZR", "单位负责人");
            map.put("SHR", "审核人");
            map.put("TBR", "填表人");
            map.put("TBRQ", "填表日期");
            map.put("UPDATETIME", "更新日期");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "企业基本信息(汞调查)数据", geturl, response);
            
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
    private String getLonLat(String value){
    	double result = 0;
    	if(value != null && value != ""){
    		String[] arr = value.split("\\|");
    		if(arr.length > 0){
    			if(arr[0].trim().length()>1){
    				result = Integer.parseInt(arr[0].trim().substring(0, arr[0].trim().length()-1).trim());
    			}
    		}
    		if(arr.length > 1){
    			if(arr[1].trim().length()>1){
    				result += (double)Math.round((Double.parseDouble(arr[1].trim().substring(0, arr[1].trim().length()-1).trim())/60) * 100) / 100;
    			}
    		}
    		if(arr.length > 2){
    			if(arr[2].trim().length()>1){
    				result += (double)Math.round((Double.parseDouble(arr[2].trim().substring(0, arr[2].trim().length()-1).trim())/3600) * 10000) / 10000;
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
