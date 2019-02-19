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
 * 共享交换-酸雨
 *
 */
@RestController
@RequestMapping("shareExchange/sy")
@SuppressWarnings("all")
public class SuanyuController {
	
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
	 * 酸雨，分页数据
	 * bootstrap-table
	 */
	@RequestMapping( "getSuanyuData" )
    public Map getSuanyuData(HttpServletRequest request, HttpServletResponse response) {
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
            String A06005_DT_FLAG = data.getOrDefault("A06005_DT_FLAG","").toString();//硫酸根离子监测标志
            String A06013_DT_FLAG = data.getOrDefault("A06013_DT_FLAG","").toString();//钙离子监测标志
            String A06010_DT_FLAG = data.getOrDefault("A06010_DT_FLAG","").toString();//钾离子监测标志
            String A06012_DT_FLAG = data.getOrDefault("A06012_DT_FLAG","").toString();//钠离子监测标志
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
            
            String sql1 = "	select * from (select R.*,ROWNUM RN from ("
            		+ " select \"A06005_DT_FLAG\",\"A06010_DT_FLAG\",\"A06013_DT_FLAG\",\"A06012_DT_FLAG\",\"A06013\","
            		+ " \"A06010\",\"A06008\",\"A06006\",\"A06003\",\"A06012\",\"A06005\",\"A06011\",\"A06009\","
            		+ "\"A06007\",\"A06004\",\"AR_UPFLAG\","
            		+ "to_char(INF_SAMPLEDATE_TIME,'yyyy-mm-dd HH24:mi:ss')INF_SAMPLEDATE_TIME,\"AR_INF_EMI\","
            		+ "\"AR_INF_EH\",\"AR_INF_ED\",\"AR_INF_EM\",\"AR_INF_EY\",\"AR_INF_SMI\",\"AR_INF_SH\","
            		+ "\"AR_INF_SD\",\"AR_INF_SM\",\"AR_INF_SY\",\"DATA_VERSION\","
            		+ "to_char(DATA_UPLOADINGTIME,'yyyy-mm-dd HH24:mi:ss')DATA_UPLOADINGTIME,\"REDUNDANCY_FLAG\","
            		+ "\"AUDIT_FLAG\",\"AR_INF_RAINFALL\",\"PT_CODE\",\"ARM_P_CODE\",\"AR_INF_ID\",\"A06006_DT_FLAG\","
            		+ "\"A06003_DT_FLAG\",\"A06011_DT_FLAG\",\"A06004_DT_FLAG\",\"A06007_DT_FLAG\",\"A06009_DT_FLAG\","
            		+ "\"A06008_DT_FLAG\",\"CS_FILENAME\" from \"INI_ACIDRAIN_INFO\" where 1=1 ";
            String sql2 = "select count(1) from INI_ACIDRAIN_INFO where 1=1";

            String sqlWhere = "";
            
            if (!"".equals(A06005_DT_FLAG)) {
            	sqlWhere += " and \"A06005_DT_FLAG\" like '%" + A06005_DT_FLAG + "%'";
            }
            if (!"".equals(A06013_DT_FLAG)) {
            	sqlWhere += " and \"A06013_DT_FLAG\" like '%" + A06013_DT_FLAG + "%'";
            }
            if (!"".equals(A06010_DT_FLAG)) {
            	sqlWhere += " and \"A06010_DT_FLAG\" like '%" + A06010_DT_FLAG + "%'";
            }
            if (!"".equals(A06012_DT_FLAG)) {
            	sqlWhere += " and \"A06012_DT_FLAG\" like '%" + A06012_DT_FLAG + "%'";
            }
            
            
            sql1 += sqlWhere;
            sql1 += " order by INF_SAMPLEDATE_TIME desc nulls last)R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看酸雨数据");
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
            
            String sql = "select count(1) count,to_char(\"DATA_UPLOADINGTIME\",'" + datePartten + "')  UPDATETIME1 from INI_ACIDRAIN_INFO where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"DATA_UPLOADINGTIME\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"DATA_UPLOADINGTIME\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"DATA_UPLOADINGTIME\",'" + datePartten + "')  order by to_char(\"DATA_UPLOADINGTIME\",'" + datePartten + "')  nulls last ";
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
    
    //酸雨数据-最后更新时间
    @RequestMapping("getLastUpdateTime")
	public EdatResult getLastUpdateTime(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "");
            }
            
            //登录用户
            
            String sql = "select to_char( MAX(\"DATA_UPLOADINGTIME\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from INI_ACIDRAIN_INFO where 1=1";
            
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
            String A06005_DT_FLAG = data.getOrDefault("A06005_DT_FLAG","").toString();//硫酸根离子监测标志
            String A06013_DT_FLAG = data.getOrDefault("A06013_DT_FLAG","").toString();//钙离子监测标志
            String A06010_DT_FLAG = data.getOrDefault("A06010_DT_FLAG","").toString();//钾离子监测标志
            String A06012_DT_FLAG = data.getOrDefault("A06012_DT_FLAG","").toString();//钠离子监测标志
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "	select * from ("
            		+ " select \"A06005_DT_FLAG\",\"A06010_DT_FLAG\",\"A06013_DT_FLAG\",\"A06012_DT_FLAG\",\"A06013\","
            		+ " \"A06010\",\"A06008\",\"A06006\",\"A06003\",\"A06012\",\"A06005\",\"A06011\",\"A06009\","
            		+ "\"A06007\",\"A06004\",\"AR_UPFLAG\","
            		+ "to_char(INF_SAMPLEDATE_TIME,'yyyy-mm-dd HH24:mi:ss')INF_SAMPLEDATE_TIME,\"AR_INF_EMI\","
            		+ "\"AR_INF_EH\",\"AR_INF_ED\",\"AR_INF_EM\",\"AR_INF_EY\",\"AR_INF_SMI\",\"AR_INF_SH\","
            		+ "\"AR_INF_SD\",\"AR_INF_SM\",\"AR_INF_SY\",\"DATA_VERSION\","
            		+ "to_char(DATA_UPLOADINGTIME,'yyyy-mm-dd HH24:mi:ss')DATA_UPLOADINGTIME,\"REDUNDANCY_FLAG\","
            		+ "\"AUDIT_FLAG\",\"AR_INF_RAINFALL\",\"PT_CODE\",\"ARM_P_CODE\",\"AR_INF_ID\",\"A06006_DT_FLAG\","
            		+ "\"A06003_DT_FLAG\",\"A06011_DT_FLAG\",\"A06004_DT_FLAG\",\"A06007_DT_FLAG\",\"A06009_DT_FLAG\","
            		+ "\"A06008_DT_FLAG\",\"CS_FILENAME\",ROWNUM RN from \"INI_ACIDRAIN_INFO\" where 1=1 ";
            String sql2 = "select count(1) from INI_ACIDRAIN_INFO where 1=1";

            String sqlWhere = "";
            
            if (!"".equals(A06005_DT_FLAG)) {
            	sqlWhere += " and \"A06005_DT_FLAG\" like '%" + A06005_DT_FLAG + "%'";
            }
            if (!"".equals(A06013_DT_FLAG)) {
            	sqlWhere += " and \"A06013_DT_FLAG\" like '%" + A06013_DT_FLAG + "%'";
            }
            if (!"".equals(A06010_DT_FLAG)) {
            	sqlWhere += " and \"A06010_DT_FLAG\" like '%" + A06010_DT_FLAG + "%'";
            }
            if (!"".equals(A06012_DT_FLAG)) {
            	sqlWhere += " and \"A06012_DT_FLAG\" like '%" + A06012_DT_FLAG + "%'";
            }
            
            
            sql1 += sqlWhere;
            sql1 += " ) ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("A06005_DT_FLAG", "硫酸根离子监测标志");
            map.put("A06010_DT_FLAG", "钙离子监测标志");
            map.put("A06013_DT_FLAG", "钾离子监测标志");
            map.put("A06012_DT_FLAG", "钠离子监测标志");
            map.put("A06013", "钾离子");
            map.put("A06010", "钙离子");
            map.put("A06008", "氯离子");
            map.put("A06006", "硝酸根离子");
            map.put("A06003", "降水pH值");
            map.put("A06012", "钠离子");
            map.put("A06005", "硫酸根离子");
            map.put("A06011", "镁离子");
            map.put("A06009", "铵离子");
            map.put("A06007", "氟离子");
            map.put("A06004", "电导率(mS/m)");
            map.put("AR_UPFLAG", "上传状态");
            map.put("INF_SAMPLEDATE_TIME", "采样时间");
            map.put("AR_INF_EMI", "结束分");
            map.put("AR_INF_EH", "结束时");
            map.put("AR_INF_ED", "结束日");
            map.put("AR_INF_EM", "结束月");
            map.put("AR_INF_EY", "结束年");
            map.put("AR_INF_SMI", "开始分");
            map.put("AR_INF_SH", "开始时");
            map.put("AR_INF_SD", "开始日");
            map.put("AR_INF_SM", "开始月");
            map.put("AR_INF_SY", "开始年");
            map.put("DATA_VERSION", "数据版本");
            map.put("DATA_UPLOADINGTIME", "数据上传时间");
            map.put("REDUNDANCY_FLAG", "冗余标志");
            map.put("AUDIT_FLAG", "审核标志");
            map.put("AR_INF_RAINFALL", "降雨量(mm)");
            map.put("PT_CODE", "降水类型代码");
            map.put("ARM_P_CODE", "点位代码");
            map.put("A06006_DT_FLAG", "硝酸根离子监测标志");
            map.put("A06003_DT_FLAG", "降水 pH 值监测标志");
            map.put("A06011_DT_FLAG", "镁离子监测标志");
            map.put("A06004_DT_FLAG", "电导率(mS/m)监测标志");
            map.put("A06007_DT_FLAG", "氟离子监测标志");
            map.put("A06009_DT_FLAG", "铵离子监测标志");
            map.put("A06008_DT_FLAG", "氯离子监测标志");
            map.put("CS_FILENAME", "文件名");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "酸雨数据", geturl, response);
            
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
