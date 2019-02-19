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
import com.gistone.seimp.util.RegUtil;
import com.gistone.seimp.util.UrlsUtil;

/**
 * 共享交换-尾矿库数据
 *
 */
@RestController
@RequestMapping("shareExchange/tailings")
@SuppressWarnings("all")
public class TailingsController {
	
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
            
            String sql = "select count(1) count,MINERALTYPE \"name\" from TB_TAILINGS where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
            }
            sql += " group by MINERALTYPE order by count desc";
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
            
            String sql = "select count(1) count,PROVINCENAME \"name\" from TB_TAILINGS where 1=1 ";
            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
            }
            sql += " group by PROVINCENAME order by count asc ";
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
            
            String sql = "select count(1) count,CITYNAME \"name\" from TB_TAILINGS where 1=1 ";
            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
            }
            sql += " group by CITYNAME order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	
	/**
	 * 排污许可证注销/撤销 ，分页数据
	 * 省级用户处理
	 * bootstrap-table
	 */
	@RequestMapping( "getTailingsData" )
    public Map getTailingsData(HttpServletRequest request, HttpServletResponse response) {
		try {
			ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
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
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize", "").toString());
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "").toString());
            String TAILINGSNAMEPar = data.getOrDefault("TAILINGSNAMEPar", "").toString();//尾矿库名称
            String DETAILEDADDRESSPar = data.getOrDefault("DETAILEDADDRESSPar", "").toString();//详细地址
            String ENTERPRISENAMEPar = data.getOrDefault("ENTERPRISENAMEPar", "").toString();//所属企业名称
            String MINERALTYPEPar = data.getOrDefault("MINERALTYPEPar", "").toString();//矿物种类
            String BASINPar = data.getOrDefault("BASINPar", "").toString();//所属流域
            String LEVELPar = data.getOrDefault("LEVELPar", "").toString();//等别
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
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            String sql = "select * from (select T1.*,ROWNUM RN from ("
            		+ " select \"ID\", \"TAILINGSNAME\", \"COORDINATE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", "
            		+ " \"ENTERPRISENAME\", \"MINERALTYPE\", \"POLLUTETYPE\", \"BASIN\", \"RISK\", \"LEVEL\", \"PICTURE\", \"AREACOVERAGE\", "
            		+ " \"ELSEINFO\", \"INSERTTIME\"" + " from \"TB_TAILINGS\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_TAILINGS\" where 1=1";
            String sql2 = "";

            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(TAILINGSNAMEPar)) {
            	sql2 += " and \"TAILINGSNAME\" like '%" + TAILINGSNAMEPar + "%'";
            }
            if (!DETAILEDADDRESSPar.equals("")) {
            	sql2 += " and \"DETAILEDADDRESS\" like '%" + DETAILEDADDRESSPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like '%" + ENTERPRISENAMEPar + "%'";
            }
            if (!MINERALTYPEPar.equals("")) {
            	sql2 += " and \"MINERALTYPE\" like '%" + MINERALTYPEPar + "%'";
            }
            if (!BASINPar.equals("")) {
            	sql2 += " and \"BASIN\" like '%" + BASINPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like '%" + ENTERPRISENAMEPar + "%'";
            }
            if (!LEVELPar.equals("")) {
            	sql2 += " and \"LEVEL\" = " + LEVELPar;
            }
            
            if (!"".equals(province)) {
                sql2 += " and \"PROVINCENAME\" like '%" + province.substring(0, 2) + "%'";
            }
            if (!"".equals(city)) {
                sql2 += " and \"CITYNAME\" like '%" + city.substring(0, 2) + "%'";
            }
            if (!"".equals(county)) {
                sql2 += " and \"DISTRICTNAME\" like '%" + county.substring(0, 2) + "%'";
            }
            
            sql += sql2;
            sql += " order by INSERTTIME desc nulls last)T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            //处理
            for (Map map : list) {
				if(map.get("AREACOVERAGE")==null){
					map.put("AREACOVERAGE", "");
				}else{
					CLOB clob = (CLOB) map.get("AREACOVERAGE");
					String content = clob.getSubString(1, (int) clob.length());
					map.put("AREACOVERAGE", content);
				}
			}
            
            sql1 += sql2;
            int total = getBySqlMapper.findrows(sql1);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看尾矿库数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
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
            
            String sql = "select count(1) count,to_char(INSERTTIME,'" + datePartten + "')  UPDATETIME from TB_TAILINGS where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
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
            
            
            String sql = "select to_char( MAX(INSERTTIME),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from TB_TAILINGS where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
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
                return EdatResult.build(status, "权限问题");
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


            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String TAILINGSNAMEPar = data.getOrDefault("TAILINGSNAMEPar", "").toString();//尾矿库名称
            String DETAILEDADDRESSPar = data.getOrDefault("DETAILEDADDRESSPar", "").toString();//详细地址
            String ENTERPRISENAMEPar = data.getOrDefault("ENTERPRISENAMEPar", "").toString();//所属企业名称
            String MINERALTYPEPar = data.getOrDefault("MINERALTYPEPar", "").toString();//矿物种类
            String BASINPar = data.getOrDefault("BASINPar", "").toString();//所属流域
            String LEVELPar = data.getOrDefault("LEVELPar", "").toString();//等别
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql = " select \"ID\", \"TAILINGSNAME\", \"COORDINATE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", "
            		+ " \"ENTERPRISENAME\", \"MINERALTYPE\", \"POLLUTETYPE\", \"BASIN\", \"RISK\", \"LEVEL\", \"PICTURE\", \"AREACOVERAGE\", "
            		+ " \"ELSEINFO\", \"INSERTTIME\"" + " from \"TB_TAILINGS\" where 1=1 ";
            String sql2 = "";

            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like '%" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(TAILINGSNAMEPar)) {
            	sql2 += " and \"TAILINGSNAME\" like '%" + TAILINGSNAMEPar + "%'";
            }
            if (!DETAILEDADDRESSPar.equals("")) {
            	sql2 += " and \"DETAILEDADDRESS\" like '%" + DETAILEDADDRESSPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like '%" + ENTERPRISENAMEPar + "%'";
            }
            if (!MINERALTYPEPar.equals("")) {
            	sql2 += " and \"MINERALTYPE\" like '%" + MINERALTYPEPar + "%'";
            }
            if (!BASINPar.equals("")) {
            	sql2 += " and \"BASIN\" like '%" + BASINPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like '%" + ENTERPRISENAMEPar + "%'";
            }
            if (!LEVELPar.equals("")) {
            	sql2 += " and \"LEVEL\" = " + LEVELPar;
            }
            
            if (!"".equals(province)) {
                sql2 += " and \"PROVINCENAME\" like '%" + province.substring(0, 2) + "%'";
            }
            if (!"".equals(city)) {
                sql2 += " and \"CITYNAME\" like '%" + city.substring(0, 2) + "%'";
            }
            if (!"".equals(county)) {
                sql2 += " and \"DISTRICTNAME\" like '%" + county.substring(0, 2) + "%'";
            }
            
            sql += sql2;
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            //处理数据
            for (Map map : list) {
            	//经度、纬度
				if(map.containsKey("COORDINATE") && map.get("COORDINATE")!=null){
					String[] arr1 = map.get("COORDINATE").toString().split(",");
					if(arr1.length > 0){
						String[] arr2 = arr1[0].split(":");
						if(arr2.length > 1){
							map.put("COORLON", arr2[1]);
						}
					}
					if(arr1.length > 1){
						String[] arr2 = arr1[1].split(":");
						if(arr1.length > 1){
							String lat = arr2[1];
							if(lat!=""){
								map.put("COORLAT", lat.substring(0, lat.length()-1));
							}
						
						}
					}
				}
				//等别
				if(map.containsKey("LEVEL") && map.get("LEVEL")!=null){
					String level = "";
					String oldLevel = map.get("LEVEL").toString();
					switch (oldLevel) {
					case "0":
						level = "未知";
						break;
						
					case "1":
						level = "一等";
						break;
					
					case "2":
						level = "二等";
						break;
						
					case "3":
						level = "三等";
						break;
						
					case "4":
						level = "四等";
						break;
						
					case "5":
						level = "五等";
						break;
						
					default:
						level = "未知";
						break;
					}
					map.put("LEVEL", level);
				}
				

	            //处理
					if(map.get("AREACOVERAGE")==null){
						map.put("AREACOVERAGE", "");
					}else{
						CLOB clob = (CLOB) map.get("AREACOVERAGE");
						String content = clob.getSubString(1, (int) clob.length());
						map.put("AREACOVERAGE", content);
					}
			}
            
            Map<String, String> map = new LinkedHashMap();
            map.put("TAILINGSNAME", "尾矿库名称");
            map.put("COORLON", "经度");
            map.put("COORLAT", "纬度");
            map.put("PROVINCENAME", "省");
            map.put("CITYNAME", "市");
            map.put("DISTRICTNAME", "县");
            map.put("DETAILEDADDRESS", "详细地址");
            map.put("ENTERPRISENAME", "所属企业名称");
            map.put("MINERALTYPE", "矿物种类");
            map.put("POLLUTETYPE", "污染类型");
            map.put("BASIN", "所属流域（由小到大）");
            map.put("RISK", "风险");
            map.put("LEVEL", "等别");
            map.put("AREACOVERAGE", "尾矿库区域范围");
            map.put("ELSEINFO", "其他信息（如运营时间、占地面积等）");
            map.put("INSERTTIME", "入库时间");

            String todayStr = new SimpleDateFormat("yyy-MM-dd").format(new Date());

            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "尾矿库结构", geturl, response);
            
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
