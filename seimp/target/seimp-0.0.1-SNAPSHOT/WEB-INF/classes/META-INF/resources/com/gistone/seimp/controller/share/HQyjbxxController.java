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
 * 共享交换-企业基本信息(危险化学品)
 *
 */
@RestController
@RequestMapping("shareExchange/hqyjbxx")
@SuppressWarnings("all")
public class HQyjbxxController {
	
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
	 * 企业基本信息(危险化学品)，分页数据
	 * bootstrap-table
	 * 省级用户处理
	 */
	@RequestMapping( "getHQyjbxxData" )
    public Map getHQyjbxxData(HttpServletRequest request, HttpServletResponse response) {
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
            String HYFLMC = data.getOrDefault("HYFLMC","").toString();//行业分类
            String ZCLXMC = data.getOrDefault("ZCLXMC","").toString();//登记注册类型
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
            
            String sql1 = "select T4.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from ("
            		+ "	select * from (select T1.*,T3.*,ROWNUM RN from ("
            		+ " select \"UUID\", \"WRY_ID\", \"DWMC\", \"CYM\", \"QYDM\", \"FDDBR\", \"CODE_XZQH\", \"TJND\","
            		+ " \"DZ_1\", \"DZ_2\", \"DZ_3\", \"DZ_4\", \"DZ_5\", \"DZ_6\", \"YB\", \"ZXJD_D\", \"ZXJD_F\","
            		+ " \"ZXJD_M\", \"ZXWD_D\", \"ZXWD_F\", \"ZXWD_M\", \"WXQY\", \"JRYQ\", \"YQJB\", \"YQJB_QT\","
            		+ " \"YQMC\", \"CODE_YQDM\", \"CODE_HYFLDM\", \"HYFLMC\", \"CODE_ZCLXDM\", \"ZCLXMC\", \"ZCZJ\","
            		+ " \"CQMJ\", \"ZGRS\", \"NSCXS\", \"CODE_QYGMDM\", \"QYGMMC\", \"JCSJ_N\", \"JCSJ_Y\", \"KJSJ_N\","
            		+ " \"KJSJ_Y\", \"DH\", \"CZ\", \"SJ\", \"EMAIL\", \"FQPFL\", \"FSCSL\", \"FSPFL\", \"CODE_FSPFQX\","
            		+ " \"FSPFQXMC\", \"SNSTMC\", \"CODE_SNSTDM\", \"GFCSL\", \"WFCSL\", \"WFCZ_ZX\", \"WFCZ_WT\","
            		+ " \"WFCZJGMC\", \"YJYA\", \"YJYADW\", \"HJPJ\", \"HJPJZZ\", \"HJSG\", \"HJSG_COUNT\", \"DWFZR\","
            		+ " \"SHR\", \"TBR\", \"TBSJ\", \"REMARK\","
            		+ "to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_JH101\" where 1=1   ";
            String sql2 = "select count(1) from (select \"QYDM\" from T_BUS_JH101 where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and CODE_XZQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and \"DWMC\" like '%" + DWMC + "%'";
            }
            if (!"".equals(HYFLMC)) {
            	sqlWhere += " and \"HYFLMC\" = '" + HYFLMC + "'";
            }
            if (!"".equals(ZCLXMC)) {
            	sqlWhere += " and \"ZCLXMC\" = '" + ZCLXMC + "'";
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
            sql1 += " order by UPDATETIME desc nulls last) T1"
            		+ " left join \"T_Cod_YQJB\" T3 on T1.\"YQJB\"=T3.\"DM\""
            		+ "	where 1=1"
            		
            		+ ") "
            		+ " where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize)
            		+ " ) T4"
            		+ " left join \"tb_city\" c1 on concat(substr(T4.CODE_XZQH, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T4.CODE_XZQH, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T4.CODE_XZQH = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere
            		+" )T1 "
            		+ " "
            		+ "	where 1=1"
            		;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业基本信息(危险化学品)数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	
	//企业基本信息(危险化学品)，查询条件
    @RequestMapping("getHQyjbxxCons")
	public EdatResult getHQyjbxxCons(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            String sql1 = "select HYFLMC from \"T_BUS_JH101\" where 1=1 GROUP BY HYFLMC";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            String sql2 = "select ZCLXMC from \"T_BUS_JH101\" where 1=1 GROUP BY ZCLXMC";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            Map result = new HashMap();
            result.put("hyflmc", list1);
            result.put("zclxmc", list2);
            
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
            
            String sql = "select count(1) count,to_char(\"UPDATETIME\",'" + datePartten + "')  UPDATETIME1 from T_BUS_JH101 where 1=1 ";
            
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
            
            String sql = "select to_char( MAX(\"UPDATETIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from T_BUS_JH101 where 1=1";
            
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
            String HYFLMC = data.getOrDefault("HYFLMC","").toString();//行业分类
            String ZCLXMC = data.getOrDefault("ZCLXMC","").toString();//登记注册类型
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "select T4.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from ("
            		+ "	select * from (select T1.*,T3.*,ROWNUM RN from ("
            		+ " select \"UUID\", \"WRY_ID\", \"DWMC\", \"CYM\", \"QYDM\", \"FDDBR\", \"CODE_XZQH\", \"TJND\","
            		+ " \"DZ_1\", \"DZ_2\", \"DZ_3\", \"DZ_4\", \"DZ_5\", \"DZ_6\", \"YB\", \"ZXJD_D\", \"ZXJD_F\","
            		+ " \"ZXJD_M\", \"ZXWD_D\", \"ZXWD_F\", \"ZXWD_M\", \"WXQY\", \"JRYQ\", \"YQJB\", \"YQJB_QT\","
            		+ " \"YQMC\", \"CODE_YQDM\", \"CODE_HYFLDM\", \"HYFLMC\", \"CODE_ZCLXDM\", \"ZCLXMC\", \"ZCZJ\","
            		+ " \"CQMJ\", \"ZGRS\", \"NSCXS\", \"CODE_QYGMDM\", \"QYGMMC\", \"JCSJ_N\", \"JCSJ_Y\", \"KJSJ_N\","
            		+ " \"KJSJ_Y\", \"DH\", \"CZ\", \"SJ\", \"EMAIL\", \"FQPFL\", \"FSCSL\", \"FSPFL\", \"CODE_FSPFQX\","
            		+ " \"FSPFQXMC\", \"SNSTMC\", \"CODE_SNSTDM\", \"GFCSL\", \"WFCSL\", \"WFCZ_ZX\", \"WFCZ_WT\","
            		+ " \"WFCZJGMC\", \"YJYA\", \"YJYADW\", \"HJPJ\", \"HJPJZZ\", \"HJSG\", \"HJSG_COUNT\", \"DWFZR\","
            		+ " \"SHR\", \"TBR\", \"TBSJ\", \"REMARK\","
            		+ "to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_JH101\" where 1=1   ";
            String sql2 = "select count(1) from (select \"QYDM\" from T_BUS_JH101 where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and CODE_XZQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and \"DWMC\" like '%" + DWMC + "%'";
            }
            if (!"".equals(HYFLMC)) {
            	sqlWhere += " and \"HYFLMC\" = '" + HYFLMC + "'";
            }
            if (!"".equals(ZCLXMC)) {
            	sqlWhere += " and \"ZCLXMC\" = '" + ZCLXMC + "'";
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
            sql1 += " ) T1"
            		+ " left join \"T_Cod_YQJB\" T3 on T1.\"YQJB\"=T3.\"DM\""
            		+ "	where 1=1"
            		
            		+ ") ) T4"
            		+ " left join \"tb_city\" c1 on concat(substr(T4.CODE_XZQH, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T4.CODE_XZQH, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T4.CODE_XZQH = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            for (Map map : list) {

                handleValue(map, "CYM", "1");//曾用名
                handleValue(map, "FDDBR", "1");//法定代表人
                handleValue(map, "TJND", "1");//调查年度
                handleValue(map, "DZ_1", "1");//省
                handleValue(map, "DZ_2", "1");//市
                handleValue(map, "DZ_3", "1");//县
                handleValue(map, "DZ_4", "1");//乡
                handleValue(map, "DZ_5", "1");//街道
                handleValue(map, "DZ_6", "1");//号
                
            	//中心经度
                if(map.containsKey("ZXJD_D") && map.get("ZXJD_D")!=null){
	                String newStr = map.get("ZXJD_D").toString();
	        		String oldStr = map.get("ZXJD_D").toString();
	        		if(map != null){
	        			map.put("ZXJD_D", getLon(map));
	        		}
	        	}
                //中心纬度
                if(map.containsKey("ZXWD_D") && map.get("ZXWD_D")!=null){
	                if(map != null){
	                	map.put("ZXWD_D", getLat(map));
	                }
	        	}
                
                handleValue(map, "WXQY", "2");//危险化学品生产企业
                handleValue(map, "MC", "1");//工业园区级别
                handleValue(map, "YQJB_QT", "1");//工业园区其他级别
                handleValue(map, "YQMC", "1");//所在工业园区名称
                handleValue(map, "KJSJ_N", "1");//最新改扩建时间-年
                handleValue(map, "KJSJ_Y", "1");//最新改扩建时间-月
                handleValue(map, "EMAIL", "1");//电子邮箱
                handleValue(map, "SNSTMC", "1");//废水受纳水体名称
                handleValue(map, "WFCZ_ZX", "3");//危险废物处置方式-自行处理
                handleValue(map, "WFCZ_WT", "2");//危险废物处置方式-委托处理
                handleValue(map, "WFCZJGMC", "1");//危险废物处置机构名称
                handleValue(map, "YJYA", "2");//环境应急预案编制情况
                handleValue(map, "YJYADW", "1");//环境应急预案备案单位
                handleValue(map, "HJPJ", "2");//环境影响评价情况
                handleValue(map, "HJPJZZ", "2");//环评文件中环境风险评价专章情况
                handleValue(map, "HJSG", "2");//近10年发生突发环境事件情况
                handleValue(map, "REMARK", "1");//备注
              
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("DWMC", "企业名称");
            map.put("CYM", "曾用名");
            map.put("FDDBR", "法定代表人");
            map.put("TJND", "调查年度");
            map.put("DZ_1", "省");
            map.put("DZ_2", "市");
            map.put("DZ_3", "县");
            map.put("DZ_4", "乡");
            map.put("DZ_5", "街道");
            map.put("DZ_6", "号");
            map.put("YB", "邮编");
            map.put("ZXJD_D", "中心经度");
            map.put("ZXWD_D", "中心纬度");
            map.put("WXQY", "危险化学品生产企业");
            map.put("MC", "工业园区级别");
            map.put("YQJB_QT", "工业园区其他级别");
            map.put("YQMC", "所在工业园区名称");
            map.put("HYFLMC", "行业分类名称");
            map.put("ZCLXMC", "企业登记注册类型");
            map.put("ZCZJ", "注册资金（万元）");
            map.put("CQMJ", "厂区面积（平方米）");
            map.put("ZGRS", "职工人数（人）");
            map.put("NSCXS", "年生产小时");
            map.put("QYGMMC", "企业规模");
            map.put("JCSJ_N", "建厂时间-年");
            map.put("JCSJ_Y", "建厂时间-月");
            map.put("KJSJ_N", "最新改扩建时间-年");
            map.put("KJSJ_Y", "最新改扩建时间-月");
            map.put("DH", "填表人联系电话");
            map.put("CZ", "传真号码");
            map.put("SJ", "手机号码");
            map.put("EMAIL", "电子邮箱");
            map.put("FQPFL", "废气排放量（万立方米/年）");
            map.put("FSCSL", "废水产生量（吨/年）");
            map.put("FSPFL", "废水排放量（吨/年）");
            map.put("FSPFQXMC", "废水排放去向");
            map.put("SNSTMC", "废水受纳水体名称");
            map.put("GFCSL", "一般固体废物产生量（吨/年）");
            map.put("WFCSL", "危险废物产生量（吨/年）");
            map.put("WFCZ_ZX", "危险废物处置方式-自行处理");
            map.put("WFCZ_WT", "危险废物处置方式-委托处理");
            map.put("WFCZJGMC", "危险废物处置机构名称");
            map.put("YJYA", "环境应急预案编制情况");
            map.put("YJYADW", "环境应急预案备案单位");
            map.put("HJPJ", "环境影响评价情况");
            map.put("HJPJZZ", "环评文件中环境风险评价专章情况");
            map.put("HJSG", "近10年发生突发环境事件情况");
            map.put("HJSG_COUNT", "事故次数");
            map.put("DWFZR", "单位负责人");
            map.put("SHR", "审核人");
            map.put("TBSJ", "填表时间");
            map.put("REMARK", "备注");
            map.put("UPDATETIME", "更新日期");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "企业基本信息(危险化学品)数据", geturl, response);
            
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
