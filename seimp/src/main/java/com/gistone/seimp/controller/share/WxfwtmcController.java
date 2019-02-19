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
 * 共享交换-危险废物填埋场
 *
 */
@RestController
@RequestMapping("shareExchange/wxfwtmc")
@SuppressWarnings("all")
public class WxfwtmcController {
	
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
	 * 危险废物填埋场，分页数据
	 * bootstrap-table
	 * 省级数据处理
	 */
	@RequestMapping( "getWxfwtmcData" )
    public Map getMlrData(HttpServletRequest request, HttpServletResponse response) {
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
            String XKZBH = data.getOrDefault("XKZBH","").toString();//许可证编号
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
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCENAME,c2.\"name\" CITYNAME,c3.\"name\" COUNTYNAME from (select * from ( select R.*,ROWNUM RN from("
            		+ " select \"BBBH\", \"BBNF\", \"BBDW\", \"DWMC\", \"XKZBH\", \"SJQH\", \"SHIJQH\", \"XJQH\", \"QYLSBH\", \"FZJG\","
            		+ " \"TMCRL\", \"YTMRL\", \"HZTMGM\", \"SJTML\", \"BBZT\",to_char(\"SCRQ\",'yyyy-mm-dd HH24:mi:ss') \"SCRQ\","
            		+ " \"TJBZ\"  from T_CER_BURYREPORT where 1=1  ";
            String sql2 = "select count(1) from T_CER_BURYREPORT where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and XJQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and DWMC like '%" + DWMC + "%'";
            }
            if (!"".equals(XKZBH)) {
            	sqlWhere += " and XKZBH like '%" + XKZBH + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and XJQH like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and XJQH like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XJQH like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += "  order by SCRQ desc nulls last)R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize)
            		+" )T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.XJQH, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.XJQH, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.XJQH = c3.\"code\""
            		+ " order by SCRQ desc ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看危险废物填埋场数据");
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
            
            String sql = "select count(1) count,to_char(\"SCRQ\",'" + datePartten + "')  UPDATETIME from T_CER_BURYREPORT where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"SCRQ\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"SCRQ\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"SCRQ\",'" + datePartten + "')  order by to_char(\"SCRQ\",'" + datePartten + "')  nulls last ";
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
            
            String sql = "select to_char( MAX(\"SCRQ\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from T_CER_BURYREPORT where 1=1";
            
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
            String XKZBH = data.getOrDefault("XKZBH","").toString();//许可证编号
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "select T1.*,c1.\"name\" PROVINCENAME,c2.\"name\" CITYNAME,c3.\"name\" COUNTYNAME from (select * from ("
            		+ " select \"BBBH\", \"BBNF\", \"BBDW\", \"DWMC\", \"XKZBH\", \"SJQH\", \"SHIJQH\", \"XJQH\", \"QYLSBH\", \"FZJG\","
            		+ " \"TMCRL\", \"YTMRL\", \"HZTMGM\", \"SJTML\", \"BBZT\",to_char(\"SCRQ\",'yyyy-mm-dd HH24:mi:ss') \"SCRQ\","
            		+ " \"TJBZ\",ROWNUM RN  from T_CER_BURYREPORT where 1=1  ";
            String sql2 = "select count(1) from T_CER_BURYREPORT where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and XJQH like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and DWMC like '%" + DWMC + "%'";
            }
            if (!"".equals(XKZBH)) {
            	sqlWhere += " and XKZBH like '%" + XKZBH + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and XJQH like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and XJQH like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XJQH like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += " ) )T1"
            		+ " left join \"tb_city\" c1 on concat(substr(T1.XJQH, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.XJQH, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.XJQH = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            for (Map map : list) {
            	//审核状态
                if(map.containsKey("TJBZ") && map.get("TJBZ")!=null){
	                String newStr = map.get("TJBZ").toString();
	        		String oldStr = map.get("TJBZ").toString();
	        		if("1".equals(oldStr)){
	        			newStr = "是";
	        		}
	        		if("0".equals(oldStr)){
	        			newStr = "否";
	        		}
	        		map.put("TJBZ", newStr);
	        	}
			}
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("BBNF", "报表年份");
            map.put("DWMC", "单位名称");
            map.put("XKZBH", "许可证编号");
            map.put("PROVINCENAME", "省级区划");
            map.put("CITYNAME", "市级区划");
            map.put("COUNTYNAME", "县级区划");
            map.put("QYLSBH", "企业历史编号");
            map.put("FZJG", "发证机关");
            map.put("TMCRL", "填埋场容量");
            map.put("YTMRL", "截至年底已填埋容量");
            map.put("HZTMGM", "核准填埋规模");
            map.put("SJTML", "实际填埋量");
            map.put("BBZT", "报表状态");
            map.put("SCRQ", "时间");
            map.put("TJBZ", "提交标识");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "危险废物填埋场数据", geturl, response);
            
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
