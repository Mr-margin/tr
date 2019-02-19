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
 * 共享交换-排污许可证数据-企业基本信息
 *
 */
@RestController
@RequestMapping("shareExchange/enterBase")
@SuppressWarnings("all")
public class EnterpriseBaseinfoController {
	
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
            
            String sql = "select count(1) count,HYNAME \"name\" from ENTERPRICE_BASEINFO where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
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
            
            String sql = "select count(1) count,PROVINCE \"name\" from ENTERPRICE_BASEINFO where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            sql += " group by PROVINCE order by count asc ";
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
            
            String sql = "select count(1) count,CITY \"name\" from ENTERPRICE_BASEINFO where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            sql += " group by CITY order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
	
	
	/**
	 * 企业基本信息，分页数据
	 * 省级用户处理
	 * bootstrap-table
	 */
	@RequestMapping( "getEnterpriseBaseinfoData" )
    public Map getEnterpriseBaseinfoData(HttpServletRequest request, HttpServletResponse response) {
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
            String devcompany = data.getOrDefault("devcompany","").toString();//企业名称
            String hyName = data.getOrDefault("hyName","").toString();//行业类型
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
            
            String sql1 = "select * from (select T1.*,ROWNUM RN from (select \"DATAID\", \"ENTERID\", \"XKZNUM\", \"DEVCOMPANY\", \"REGADDRESS\", \"PROVINCECODE\"," + 
            		" \"PROVINCE\", \"CITYCODE\", \"CITY\", \"COUNTYCODE\", \"COUNTY\", \"HYID\"," + "\"HYNAME\", \"OPERATIME\", \"ORGANCODE\", \"CREDITCODE\", " + 
            		"\"VALITIMES\", \"FZTIME\", \"OPEADDRESS\", \"LONGITUDE\", \"LATITUDE\", \"ISSHORTPERMIT\", \"POSTCODE\", \"ISPARK\", \"INDUSTRIAL\", " + 
            		"\"ZYWRWLBID\", \"AIRWRWID\", \"AIRWRWNAME\", \"WATERWRWID\", \"WATERWRWNAME\", \"WATEREMISSIONNAME\", \"ITEMTYPE\", \"ITEMENDTIME\"," + 
            		" to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME from \"ENTERPRICE_BASEINFO\" where 1=1 ";
            String sql2 = "select count(*) from \"ENTERPRICE_BASEINFO\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            if (!"".equals(devcompany)) {
            	sqlWhere += " and \"DEVCOMPANY\" like '%" + devcompany + "%'";
            }
            if (!"".equals(hyName)) {
            	sqlWhere += " and \"HYNAME\" = '" + hyName + "'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and \"PROVINCECODE\" = '" + province + "000000'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and \"CITYCODE\" = '" + city + "000000'";
            }
			if(!"".equals(county)){
				sqlWhere += " and \"COUNTYCODE\" = '" + county + "000000'";
			}
            
            sql1 += sqlWhere;
            sql1 += " order by INSERTTIME desc nulls last )T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看排污许可证企业基本信息数据");
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
	
	/**
     * 所有行业类型
     */
    @RequestMapping( "getAllHyname" )
    public EdatResult getAllHyname(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            String sql1 = "select HYID,HYNAME from ENTERPRICE_BASEINFO  group by HYID,HYNAME order by HYID asc";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list);
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
            
            String sql = "select count(1) count,to_char(INSERTTIME,'" + datePartten + "')  UPDATETIME from ENTERPRICE_BASEINFO where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
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
            
            
            String sql = "select to_char( MAX(INSERTTIME),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from ENTERPRICE_BASEINFO where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
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
            String devcompany = data.getOrDefault("devcompany","").toString();//企业名称
            String hyName = data.getOrDefault("hyName","").toString();//行业类型
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID","").toString();//数据集ID
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql1 = "select \"DATAID\", \"ENTERID\", \"XKZNUM\", \"DEVCOMPANY\", \"REGADDRESS\", \"PROVINCECODE\"," + 
            		" \"PROVINCE\", \"CITYCODE\", \"CITY\", \"COUNTYCODE\", \"COUNTY\", \"HYID\", \n" + "\"HYNAME\", \"OPERATIME\", \"ORGANCODE\", \"CREDITCODE\", " + 
            		"\"VALITIMES\", \"FZTIME\", \"OPEADDRESS\", \"LONGITUDE\", \"LATITUDE\", \"ISSHORTPERMIT\", \"POSTCODE\", \"ISPARK\", \"INDUSTRIAL\", " + 
            		"\"ZYWRWLBID\", \"AIRWRWID\", \"AIRWRWNAME\", \"WATERWRWID\", \"WATERWRWNAME\", \"WATEREMISSIONNAME\", \"ITEMTYPE\", \"ITEMENDTIME\"," + 
            		" to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME from \"ENTERPRICE_BASEINFO\" where 1=1 ";
            String sql2 = "select count(*) from \"ENTERPRICE_BASEINFO\" where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and PROVINCECODE = '" + regionCode.substring(0, 2) + "0000000000'";
            }
            if (!"".equals(devcompany)) {
            	sqlWhere += " and \"DEVCOMPANY\" like '%" + devcompany + "%'";
            }
            if (!"".equals(hyName)) {
            	sqlWhere += " and \"HYNAME\" = '" + hyName + "'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and \"PROVINCECODE\" = '" + province + "000000'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and \"CITYCODE\" = '" + city + "000000'";
            }
			if(!"".equals(county)){
				sqlWhere += " and \"COUNTYCODE\" = '" + county + "000000'";
			}
            
            sql1 += sqlWhere;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            //处理数据
            for (Map map : list) {
            	//是否需整改
				if(map.containsKey("ISSHORTPERMIT") && map.get("ISSHORTPERMIT")!=null){
					if(map.get("ISSHORTPERMIT").equals("1")){
						map.put("ISSHORTPERMIT", "是");
					}
					if(map.get("ISSHORTPERMIT").equals("0")){
						map.put("ISSHORTPERMIT", "否");
					}
					if(map.get("ISSHORTPERMIT").equals("null")){
						map.put("ISSHORTPERMIT", "");
					}
				}
				//所属工业园区名称
				if(map.containsKey("INDUSTRIAL") && map.get("INDUSTRIAL")!=null){
					if("null".equals(map.get("INDUSTRIAL").toString())){
						map.put("INDUSTRIAL", "");
					}
				}
				//是否位于工业园区
				if(map.containsKey("ISPARK") && map.get("ISPARK")!=null){
					if(map.get("ISPARK").equals("1")){
						map.put("ISPARK", "是");
					}
					if(map.get("ISPARK").equals("0")){
						map.put("ISPARK", "否");
					}
					if(map.get("ISPARK").equals("null")){
						map.put("ISPARK", "");
					}
				}
				//主要污染物类别
				if(map.containsKey("ZYWRWLBID") && map.get("ZYWRWLBID")!=null){
					String zywrwlbid = map.get("ZYWRWLBID").toString();
					zywrwlbid = zywrwlbid.replace("fq", "废气");
					zywrwlbid = zywrwlbid.replace("fs", "废水");
					map.put("ZYWRWLBID", zywrwlbid);
				}
				//项目类型
				if(map.containsKey("ITEMTYPE") && map.get("ITEMTYPE")!=null){
					if(map.get("ITEMTYPE").equals("TYPEA")){
						map.put("ITEMTYPE", "首次填报");
					}else if(map.get("ITEMTYPE").equals("TYPEB")){
						map.put("ITEMTYPE", "补充填报");
					}else if(map.get("ITEMTYPE").equals("TYPEC")){
						map.put("ITEMTYPE", "变更");
					}else{
						map.put("ITEMTYPE", "");
					}
				}
			}
            
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("XKZNUM", "许可证书编号");
            map.put("DEVCOMPANY", "单位名称");
            map.put("REGADDRESS", "注册地址");
            map.put("PROVINCE", "省份");
            map.put("CITY", "市");
            map.put("COUNTY", "县");
            map.put("HYNAME", "行业类型");
            map.put("OPERATIME", "投产日期");
            map.put("ORGANCODE", "组织机构代码");
            map.put("CREDITCODE", "统一社会信用代码");
            map.put("VALITIMES", "有效期限");
            map.put("FZTIME", "发证日期");
            map.put("OPEADDRESS", "生产经营场所地址");
            map.put("LONGITUDE", "生产经营场所中心经度");
            map.put("LATITUDE", "生产经营场所中心纬度");
            map.put("ISSHORTPERMIT", "是否需整改");
            map.put("POSTCODE", "邮政编码");
            map.put("ISPARK", "是否位于工业园区");
            map.put("INDUSTRIAL", "所属工业园区名称");
            map.put("ZYWRWLBID", "主要污染物类别");
            map.put("AIRWRWNAME", "废气主要污染物种类");
            map.put("WATERWRWNAME", "废水主要污染物种类");
            map.put("WATEREMISSIONNAME", "废水污染物排放规律");
            map.put("ITEMTYPE", "项目类型");
            map.put("ITEMENDTIME", "项目办结时间");
            map.put("INSERTTIME", "更新时间");
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "排污许可证企业信息数据", geturl, response);
            
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
