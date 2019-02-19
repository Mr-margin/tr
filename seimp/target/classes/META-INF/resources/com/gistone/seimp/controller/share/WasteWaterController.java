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
 * 共享交换-工业废水基本信息表
 *
 */
@RestController
@RequestMapping("shareExchange/water")
@SuppressWarnings("all")
public class WasteWaterController {
	
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
	 * 省级用户处理
	 * bootstrap-table
	 */
	@RequestMapping( "getWaterData" )
    public Map getWaterData(HttpServletRequest request, HttpServletResponse response) {
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
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize", "10").toString());//每页条数
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "0").toString());//开始索引
            String particularName = data.getOrDefault("particularName","").toString();//详细名称
            String oneBusinessName = data.getOrDefault("oneBusinessName","").toString();//一级行业分类
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
            
            String sql1 = "select   T1.*,c1.\"name\" PROVINCENAME,c2.\"name\" CITYNAME,c3.\"name\" COUNTYNAME from ("
            		+ "select * from (select R.*,ROWNUM RN from("
            		+ "select YEAR,QUARTER,PARTICULARNAME,BUSINESSCODE,MONITORNAME,MONITOR_ITEM_NAME,WASTE_IMPORT,POLLUTANT_CONCENTRATION,"
            		+ "DISCHARGE_S,DISCHARGE_X,DISCHARGE_MONAD,EXCEED_NUMBER,POLLUTANT_QUALIFIED,VALUATION,RECEIVING_WATERNAME,THE_DIRECTION,"
            		+ "REGISTER_TYPE,SCALE,RUN_NORMAL_MOVE,WASTE_RANK,GASE_RANK,SCALE_CODE,POLLUTION_RANK_CODE,POLLUTION_TYPE_CODE,LONGTITUDE_INDEX,"
            		+ "LATITUDE_INDEX,ENTERPRISE_SITE,WASTE_MOUTH_NUMBER,GAS_EQUIPMENT_NUMBER,GAS_MOUTH_NUMBER,S02_GROSS_VALUE,"
            		+ "C0D_GROSS_VALUE,POLLUTION_DECLARE_MARK,INORGANIZATION_PFDS,EGALPERSON_NAME,SOURCE_CONTACTS,PHONE,FAXES,DAWK_CODE,"
            		+ "START_BUSINESS_TIME,CWGY_SKETCH,WRCL_SKETCH,FINALLY_ALTER_TIME,CONTACT_SECTION,DELETE_SATE,GAS_POLLUTION_RANK_CODE,"
            		+ "EXEC_STANDARD_CODE,EXEC_CONDITION_CODE,POLLUTED_ATTRIBUTE,MONITOR_JD,MONITOR_WD,MONTH,DAYS,POLLUTE_PF_VALUE,"
            		+ "WASTE_PF_VALUE,MONITORING_VALUE,LOAD_CONDITION,DATA_INTEGRITY,CAUSE,FREQUENCY,IMPORT_GAS_QUANTITY,ENTERPRISE_CODE,"
            		+ "RECEIVING_WATERCODE,THE_DIRECTION_TYPECODE,DISTRICT_CODE,PROVINCE,MUNICIPAL,ONE_BUSINESSNAME,ONE_BUSINESSCODE,"
            		+ "TWO_BUSINESSNAME,TWO_BUSINESSCODE,THREE_BUSINESSNAME,THREE_BUSINESSCODE,LEGALPERSON_CODE,DISCHARGE_GL_CODE,"
            		+ "REGISTER_TYPECODE,CUSTOM_ATTRIBUTE,STANDARD_NAME,PKID,UPDATEFLAG_HBB_BIGDATA,"
            		+ "to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA "
            		+ "from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
            String sql2 = "select count(*) from \"T_GY_WASTEBASCIMESSAGE\" where 1=1";
            
            String sqlWhere = "";
            //省级用户处理
            if (userlevel.equals("2")) {
            	sqlWhere += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            } else if (userlevel.equals("3")) {
            	sqlWhere += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 4) + "%'";
            } else if (userlevel.equals("4")) {
            	sqlWhere += " and \"DISTRICT_CODE\" =" + regionCode;
            }

            if (particularName != null && !particularName.equals("")) {
            	sqlWhere += " and \"PARTICULARNAME\" like '%" + particularName + "%'";
            }
           
            if (!oneBusinessName.equals("")) {
            	sqlWhere += " and \"ONE_BUSINESSNAME\" ='" + oneBusinessName + "'";
            }
            if (!province.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" like '" + province.substring(0, 2) + "%'";
            }
            if (!city.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" like '" + city.substring(0, 4) + "%'";
            }
            if (!county.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" = " + county;
            }
            
            sql1 += sqlWhere;
            sql1 += "order by UPDATETIME_HBB_BIGDATA desc nulls last)R)  where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize)+")T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.DISTRICT_CODE, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.DISTRICT_CODE, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.DISTRICT_CODE = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看工业废水基本信息表数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	/**
     * 行业分类数据
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getWaterCondition" )
    public EdatResult getWaterCondition(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            String sql1 = "select \"ONE_BUSINESSNAME\" from \"T_GY_WASTEBASCIMESSAGE\" where ONE_BUSINESSNAME!='null' group by \"ONE_BUSINESSNAME\"";
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
            int status = Check.CheckRight(request, rightIndex);
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
            
            String sql = "select count(1) count,to_char(\"UPDATETIME_HBB_BIGDATA\",'" + datePartten + "')  UPDATETIME from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
            
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
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            
            String sql = "select to_char( MAX(\"UPDATETIME_HBB_BIGDATA\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from \"T_GY_WASTEBASCIMESSAGE\" where 1=1";
            
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
            int status = Check.CheckRight(request, rightIndex);
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
            String particularName = data.getOrDefault("particularName","").toString();//
            String oneBusinessName = data.getOrDefault("oneBusinessName","").toString();//
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select   T1.*,c1.\"name\" PROVINCENAME,c2.\"name\" CITYNAME,c3.\"name\" COUNTYNAME from ("
            		+ "select * from ("
            		+ "select YEAR,QUARTER,PARTICULARNAME,BUSINESSCODE,MONITORNAME,MONITOR_ITEM_NAME,WASTE_IMPORT,POLLUTANT_CONCENTRATION,"
            		+ "DISCHARGE_S,DISCHARGE_X,DISCHARGE_MONAD,EXCEED_NUMBER,POLLUTANT_QUALIFIED,VALUATION,RECEIVING_WATERNAME,THE_DIRECTION,"
            		+ "REGISTER_TYPE,SCALE,RUN_NORMAL_MOVE,WASTE_RANK,GASE_RANK,SCALE_CODE,POLLUTION_RANK_CODE,POLLUTION_TYPE_CODE,LONGTITUDE_INDEX,"
            		+ "LATITUDE_INDEX,ENTERPRISE_SITE,WASTE_MOUTH_NUMBER,GAS_EQUIPMENT_NUMBER,GAS_MOUTH_NUMBER,S02_GROSS_VALUE,"
            		+ "C0D_GROSS_VALUE,POLLUTION_DECLARE_MARK,INORGANIZATION_PFDS,EGALPERSON_NAME,SOURCE_CONTACTS,PHONE,FAXES,DAWK_CODE,"
            		+ "START_BUSINESS_TIME,CWGY_SKETCH,WRCL_SKETCH,FINALLY_ALTER_TIME,CONTACT_SECTION,DELETE_SATE,GAS_POLLUTION_RANK_CODE,"
            		+ "EXEC_STANDARD_CODE,EXEC_CONDITION_CODE,POLLUTED_ATTRIBUTE,MONITOR_JD,MONITOR_WD,MONTH,DAYS,POLLUTE_PF_VALUE,"
            		+ "WASTE_PF_VALUE,MONITORING_VALUE,LOAD_CONDITION,DATA_INTEGRITY,CAUSE,FREQUENCY,IMPORT_GAS_QUANTITY,ENTERPRISE_CODE,"
            		+ "RECEIVING_WATERCODE,THE_DIRECTION_TYPECODE,DISTRICT_CODE,PROVINCE,MUNICIPAL,ONE_BUSINESSNAME,ONE_BUSINESSCODE,"
            		+ "TWO_BUSINESSNAME,TWO_BUSINESSCODE,THREE_BUSINESSNAME,THREE_BUSINESSCODE,LEGALPERSON_CODE,DISCHARGE_GL_CODE,"
            		+ "REGISTER_TYPECODE,CUSTOM_ATTRIBUTE,STANDARD_NAME,PKID,UPDATEFLAG_HBB_BIGDATA,"
            		+ "to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA,ROWNUM RN "
            		+ "from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
            String sql2 = "select count(*) from \"T_GY_WASTEBASCIMESSAGE\" where 1=1";
            
            String sqlWhere = "";
            //省级用户处理
            if (userlevel.equals("2")) {
            	sqlWhere += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            } else if (userlevel.equals("3")) {
            	sqlWhere += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 4) + "%'";
            } else if (userlevel.equals("4")) {
            	sqlWhere += " and \"DISTRICT_CODE\" =" + regionCode;
            }

            if (particularName != null && !particularName.equals("")) {
            	sqlWhere += " and \"PARTICULARNAME\" like '%" + particularName + "%'";
            }
           
            if (!oneBusinessName.equals("")) {
            	sqlWhere += " and \"ONE_BUSINESSNAME\" ='" + oneBusinessName + "'";
            }
            if (!province.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" like '" + province.substring(0, 2) + "%'";
            }
            if (!city.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" like '" + city.substring(0, 4) + "%'";
            }
            if (!county.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" = " + county;
            }
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);
            if(total>500000){
            	return  EdatResult.ok("您当前下载的数据量过大，请设置过滤条件后重新下载！");
            }
            
            
            sql1 += sqlWhere;
            sql1 += ") )T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.DISTRICT_CODE, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.DISTRICT_CODE, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.DISTRICT_CODE = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            
            //数据处理
            for (Map map : list) {
				//是否参与评价
            	if(map.containsKey("VALUATION")){
            		String newStr = map.get("VALUATION").toString();
            		String oldStr = map.get("VALUATION").toString();
            		if("1".equals(oldStr)){
            			newStr = "是";
            		}
            		if("0".equals(oldStr)){
            			newStr = "否";
            		}
            		map.put("VALUATION", newStr);
            	}
            	//数据是否完整
            	if(map.containsKey("DATA_INTEGRITY")){
            		String newStr = map.get("DATA_INTEGRITY").toString();
            		String oldStr = map.get("DATA_INTEGRITY").toString();
            		if("1".equals(oldStr)){
            			newStr = "是";
            		}
            		if("0".equals(oldStr)){
            			newStr = "否";
            		}
            		map.put("DATA_INTEGRITY", newStr);
            	}
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("PARTICULARNAME", "详细名称");
            map.put("PROVINCENAME", "省级行政区");
            map.put("CITYNAME", "市级行政区");
            map.put("COUNTYNAME", "县级行政区");
            map.put("YEAR", "监测年");
            map.put("QUARTER", "季度");
            map.put("MONITORNAME", "监测点名称");
            map.put("MONITOR_ITEM_NAME", "监测项目名称");
            map.put("WASTE_IMPORT", "废水处理设施进口浓度");
            map.put("POLLUTANT_CONCENTRATION", "污染物浓度");
            map.put("DISCHARGE_S", "排放上限");
            map.put("DISCHARGE_X", "排放下限");
            map.put("DISCHARGE_MONAD", "排放单位");
            map.put("EXCEED_NUMBER", "超标倍数");
            map.put("POLLUTANT_QUALIFIED", "污染物浓度是否达标");
            map.put("VALUATION", "是否参与评价");
            map.put("RECEIVING_WATERNAME", "受纳水体名称");
            map.put("THE_DIRECTION", "排水去向");
            map.put("REGISTER_TYPE", "登记注册类型");
            map.put("SCALE", "规模");
            map.put("RUN_NORMAL_MOVE", "治理设施是否正常运行");
            map.put("WASTE_RANK", "废水控制级别");
            map.put("GASE_RANK", "废气控制级别");
            map.put("LONGTITUDE_INDEX", "中心经度");
            map.put("LATITUDE_INDEX", "中心纬度");
            map.put("ENTERPRISE_SITE", "企业详细地址");
            map.put("WASTE_MOUTH_NUMBER", "废水排放口数");
            map.put("GAS_EQUIPMENT_NUMBER", "废气排放设备数");
            map.put("GAS_MOUTH_NUMBER", "废气排放口数");
            map.put("S02_GROSS_VALUE", "SO2总量控制值");
            map.put("C0D_GROSS_VALUE", "COD总量控制值");
            map.put("POLLUTION_DECLARE_MARK", "排污申报登记号");
            map.put("INORGANIZATION_PFDS", "无组织排放点数");
            map.put("EGALPERSON_NAME", "法人代表姓名");
            map.put("SOURCE_CONTACTS", "污染源监测联系人");
            map.put("PHONE", "电话");
            map.put("FAXES", "传真");
            map.put("DAWK_CODE", "邮政编码");
            map.put("CWGY_SKETCH", "产污工艺简述");
            map.put("WRCL_SKETCH", "污染处理工艺简述");
            map.put("CONTACT_SECTION", "污染源监测联系部门");
            map.put("POLLUTED_ATTRIBUTE", "排口属性");
            map.put("MONITOR_JD", "监测点经度");
            map.put("MONITOR_WD", "监测点纬度");
            map.put("MONTH", "监测月");
            map.put("DAYS", "监测日");
            map.put("POLLUTE_PF_VALUE", "污染物排放量");
            map.put("WASTE_PF_VALUE", "废水排放量");
            map.put("MONITORING_VALUE", "在线监测污染物排放浓度");
            map.put("LOAD_CONDITION", "工况负荷");
            map.put("DATA_INTEGRITY", "数据是否完整");
            map.put("CAUSE", "原因");
            map.put("FREQUENCY", "次数");
            map.put("IMPORT_GAS_QUANTITY", "进口水量");
            map.put("ONE_BUSINESSNAME", "一级行业名称");
            map.put("TWO_BUSINESSNAME", "二级行业名称");
            map.put("THREE_BUSINESSNAME", "三级行业名称");
            map.put("CUSTOM_ATTRIBUTE", "自定义属性");
            map.put("STANDARD_NAME", "标准名称");
            map.put("UPDATEFLAG_HBB_BIGDATA", "是否更新");
            map.put("UPDATETIME_HBB_BIGDATA", "推送时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = XSSFExcelUtils.writesNew(list, map, "工业废水基本信息表数据", geturl, response);
            
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
