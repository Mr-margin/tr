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
@RequestMapping("shareExchange/tailings2")
@SuppressWarnings("all")
public class Tailings2Controller {
	
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
            
            String sql = "select count(1) count,SSZYKZ \"name\" from TB_TAILINGS2 where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"XZQH\" like '%" + names.substring(0, 2) + "%'";
            }
            sql += " group by SSZYKZ order by count desc";
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
            
            String sql = "select count(1) count,substr(\"XZQH\", 0, 3) \"name\" from TB_TAILINGS2 where 1=1 ";
            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and substr(\"XZQH\", 0, 3) like '%" + names.substring(0, 2) + "%'";
            }
            sql += " group by substr(\"XZQH\", 0, 3) order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
	
	/**
	 * 尾矿库2 ，分页数据
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
            String WKKMC = data.getOrDefault("WKKMC", "").toString();//尾矿库名称
            String XZQH = data.getOrDefault("XZQH", "").toString();//行政区划
            String WKKQYMC = data.getOrDefault("WKKQYMC", "").toString();//尾矿库企业名称
            String WKKDB = data.getOrDefault("WKKDB", "").toString();//尾矿库等别
            String province = data.getOrDefault("province", "").toString();//省份
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
            
            String sql = "select * from ("
            		+ " select R.*,ROWNUM RN from ("
            		+ " select XH, XZQH, XZQHM, SFWWZK, WKKQYMC, WKKQYSFYCYM, WKKQYCYM, QYDM, FDDBR, LXDH, SSZYKZ, SSZYKZQTSM, SSFSKZ, SSFSKZQTSM,"
            		+ " CXKGY, AQXKZBH, AQXKZFFDW, AQXKZBFSJ, PWXKZBH, PWXKZFFDW, PWXKZBFSJ, WKKMC, WKKSFYCYM, WKKCYM, ZXJD_D, ZXJD_F, ZXJD_M, ZXWD_D,"
            		+ " ZXWD_F, ZXWD_M, GC, SZXZMC, SZCMC, XDFW, JCZXJL, WKKXS, WKKQTXS, WKRKXS, BTLX, WKKDB, AQDDJ, SWHDYY, SCZK, WKKKGJSRQ, WKKTRSYRQ,"
            		+ " SJDZLD, FHBZ, SJZKR, SJKR, SJZBG, XZZBG, SJNPWL, SJSYNX, YSYNX, WKZYCF, WKFSCF, WKSZYCF, WKSFSCF, SJNWKRKL, WKSCSL, WKSHSLYPFL,"
            		+ " WKSHYL, WKSSFS, SSJL, SFJXLHP, WJXHPYY, HJYXPJWJ, SFTGHBSTSYS, WTGYY, SFJXPWSBDJ, SFCQFSLCLCS, SFCQFYSCLCS, SFCQFLSCLCS, SFJSFHSS,"
            		+ " PHFS, FHSSSFZC, CZWT, SFJYWKSHSLYCLSS, PFSFDB, WKKSFJZYZZ, WKKZBSFYHJMGD, JTQK1, SFCZYXGT, WKKXYSFYJM, JTQK2, WKKXYSFJYLYFKSS, JTQK3,"
            		+ " SFPBHJYJRY, RS, SFCBHJYJWZ, YJWZQK, SFJSHJYJSS, YJSSQK, SFBZHJYJYA, HJYJYASFXHBBMBA, SFDQKZHJYJYL, SFPBHJJCSB, SFJXHJRCJC, JCZBX,"
            		+ " ZBXNPJJCZ, JCPL, ZBSFYHJYJWZWBGYDW, SFFSTFHJSJ, TFHJSJCS, YWFXWTZGLSQK, JCZFXDZYWTJZGYQ, BJCDWFZRYJ, BZ, JCRY, JCSJ"
            		+ " from \"TB_TAILINGS2\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_TAILINGS2\" where 1=1";
            String sql2 = "";

            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"XZQH\" like '%" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(WKKMC)) {
            	sql2 += " and \"WKKMC\" like '%" + WKKMC + "%'";
            }
            if (!XZQH.equals("")) {
            	sql2 += " and \"XZQH\" like '%" + XZQH + "%'";
            }
            if (!WKKQYMC.equals("")) {
            	sql2 += " and \"WKKQYMC\" like '%" + WKKQYMC + "%'";
            }
            if (!WKKDB.equals("")) {
            	sql2 += " and \"WKKDB\" = '" + WKKDB + "'";
            }
            
            if (!"".equals(province)) {
                sql2 += " and \"XZQH\" like '%" + province.substring(0, 2) + "%'";
            }
            
            sql += sql2;
            sql += " order by JCSJ desc nulls last )R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql);
            
           
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
     * 根据ID，获取数据
     */
    @RequestMapping( "getTailingsDataByID" )
    public EdatResult getTailingsDataByID(HttpServletRequest request, HttpServletResponse response) {
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
            String XH = data.getOrDefault("XH", "").toString();//ID
            
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\", to_char(INSETTIME,'yyyy-mm-dd HH24:mi:ss') \"INSETTIME\" from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql = "select XH, XZQH, XZQHM, SFWWZK, WKKQYMC, WKKQYSFYCYM, WKKQYCYM, QYDM, FDDBR, LXDH, SSZYKZ, SSZYKZQTSM, SSFSKZ, SSFSKZQTSM,"
            		+ " CXKGY, AQXKZBH, AQXKZFFDW, AQXKZBFSJ, PWXKZBH, PWXKZFFDW, PWXKZBFSJ, WKKMC, WKKSFYCYM, WKKCYM, ZXJD_D, ZXJD_F, ZXJD_M, ZXWD_D,"
            		+ " ZXWD_F, ZXWD_M, GC, SZXZMC, SZCMC, XDFW, JCZXJL, WKKXS, WKKQTXS, WKRKXS, BTLX, WKKDB, AQDDJ, SWHDYY, SCZK, WKKKGJSRQ, WKKTRSYRQ,"
            		+ " SJDZLD, FHBZ, SJZKR, SJKR, SJZBG, XZZBG, SJNPWL, SJSYNX, YSYNX, WKZYCF, WKFSCF, WKSZYCF, WKSFSCF, SJNWKRKL, WKSCSL, WKSHSLYPFL,"
            		+ " WKSHYL, WKSSFS, SSJL, SFJXLHP, WJXHPYY, HJYXPJWJ, SFTGHBSTSYS, WTGYY, SFJXPWSBDJ, SFCQFSLCLCS, SFCQFYSCLCS, SFCQFLSCLCS, SFJSFHSS,"
            		+ " PHFS, FHSSSFZC, CZWT, SFJYWKSHSLYCLSS, PFSFDB, WKKSFJZYZZ, WKKZBSFYHJMGD, JTQK1, SFCZYXGT, WKKXYSFYJM, JTQK2, WKKXYSFJYLYFKSS, JTQK3,"
            		+ " SFPBHJYJRY, RS, SFCBHJYJWZ, YJWZQK, SFJSHJYJSS, YJSSQK, SFBZHJYJYA, HJYJYASFXHBBMBA, SFDQKZHJYJYL, SFPBHJJCSB, SFJXHJRCJC, JCZBX,"
            		+ " ZBXNPJJCZ, JCPL, ZBSFYHJYJWZWBGYDW, SFFSTFHJSJ, TFHJSJCS, YWFXWTZGLSQK, JCZFXDZYWTJZGYQ, BJCDWFZRYJ, BZ, JCRY, JCSJ, ROWNUM RN"
            		+ " from \"TB_TAILINGS2\" where 1=1 and XH="+XH;
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
            if("月".equals(statisType)){
            	substrLength = 7;
            }else if("年".equals(statisType)){
            	substrLength = 4;
            }
            
            String sql = "select count(1) count,substr(JCSJ,0," + substrLength + ") UPDATETIME from TB_TAILINGS2 where 1=1  ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and XZQH = '" + names.substring(0, 2) + "0000'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and JCSJ>='" + startTime + "'";
            }
            if(!"".equals(endTime)){
            	sql += " and JCSJ<='" + endTime + "'";
            }
            
            sql += " group by substr(JCSJ,0," + substrLength + ") order by substr(JCSJ,0," + substrLength + ") nulls last ";
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
            
            
            String sql = "select MAX(JCSJ) UPDATETIME from TB_TAILINGS2 where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"XZQH\" like '%" + names.substring(0, 2) + "%'";
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
            String WKKMC = data.getOrDefault("WKKMC", "").toString();//尾矿库名称
            String XZQH = data.getOrDefault("XZQH", "").toString();//行政区划
            String WKKQYMC = data.getOrDefault("WKKQYMC", "").toString();//尾矿库企业名称
            String WKKDB = data.getOrDefault("WKKDB", "").toString();//尾矿库等别
            String province = data.getOrDefault("province", "").toString();//省份
            String metadataID = data.getOrDefault("metadataID", "").toString();
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            String sql = "select * from ("
            		+ " select XH, XZQH, XZQHM, SFWWZK, WKKQYMC, WKKQYSFYCYM, WKKQYCYM, QYDM, FDDBR, LXDH, SSZYKZ, SSZYKZQTSM, SSFSKZ, SSFSKZQTSM,"
            		+ " CXKGY, AQXKZBH, AQXKZFFDW, AQXKZBFSJ, PWXKZBH, PWXKZFFDW, PWXKZBFSJ, WKKMC, WKKSFYCYM, WKKCYM, ZXJD_D, ZXJD_F, ZXJD_M, ZXWD_D,"
            		+ " ZXWD_F, ZXWD_M, GC, SZXZMC, SZCMC, XDFW, JCZXJL, WKKXS, WKKQTXS, WKRKXS, BTLX, WKKDB, AQDDJ, SWHDYY, SCZK, WKKKGJSRQ, WKKTRSYRQ,"
            		+ " SJDZLD, FHBZ, SJZKR, SJKR, SJZBG, XZZBG, SJNPWL, SJSYNX, YSYNX, WKZYCF, WKFSCF, WKSZYCF, WKSFSCF, SJNWKRKL, WKSCSL, WKSHSLYPFL,"
            		+ " WKSHYL, WKSSFS, SSJL, SFJXLHP, WJXHPYY, HJYXPJWJ, SFTGHBSTSYS, WTGYY, SFJXPWSBDJ, SFCQFSLCLCS, SFCQFYSCLCS, SFCQFLSCLCS, SFJSFHSS,"
            		+ " PHFS, FHSSSFZC, CZWT, SFJYWKSHSLYCLSS, PFSFDB, WKKSFJZYZZ, WKKZBSFYHJMGD, JTQK1, SFCZYXGT, WKKXYSFYJM, JTQK2, WKKXYSFJYLYFKSS, JTQK3,"
            		+ " SFPBHJYJRY, RS, SFCBHJYJWZ, YJWZQK, SFJSHJYJSS, YJSSQK, SFBZHJYJYA, HJYJYASFXHBBMBA, SFDQKZHJYJYL, SFPBHJJCSB, SFJXHJRCJC, JCZBX,"
            		+ " ZBXNPJJCZ, JCPL, ZBSFYHJYJWZWBGYDW, SFFSTFHJSJ, TFHJSJCS, YWFXWTZGLSQK, JCZFXDZYWTJZGYQ, BJCDWFZRYJ, BZ, JCRY, JCSJ, ROWNUM RN"
            		+ " from \"TB_TAILINGS2\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_TAILINGS2\" where 1=1";
            String sql2 = "";

            //省级用户处理
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"XZQH\" like '%" + names.substring(0, 2) + "%'";
            }
            if (!"".equals(WKKMC)) {
            	sql2 += " and \"WKKMC\" like '%" + WKKMC + "%'";
            }
            if (!XZQH.equals("")) {
            	sql2 += " and \"XZQH\" like '%" + XZQH + "%'";
            }
            if (!WKKQYMC.equals("")) {
            	sql2 += " and \"WKKQYMC\" like '%" + WKKQYMC + "%'";
            }
            if (!WKKDB.equals("")) {
            	sql2 += " and \"WKKDB\" = '" + WKKDB + "'";
            }
            
            if (!"".equals(province)) {
                sql2 += " and \"XZQH\" like '%" + province.substring(0, 2) + "%'";
            }
            
            sql += sql2;
            sql += ") ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            
            //处理数据
            for (Map map : list) {

            	//中心经度
                if(map.containsKey("ZXJD_D") && map.get("ZXJD_D")!=null){
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
            }
            
            Map<String, String> map = new LinkedHashMap();
            map.put("XZQH", "行政区划");
            map.put("XZQHM", "行政区划名");
            map.put("SFWWZK", "是否为无主库");
            map.put("WKKQYMC", "尾矿库企业名称");
            map.put("WKKQYSFYCYM", "尾矿库企业是否有曾用名");
            map.put("WKKQYCYM", "尾矿库企业曾用名");
            map.put("QYDM", "企业代码");
            map.put("FDDBR", "法定代表人");
            map.put("LXDH", "联系电话");
            map.put("SSZYKZ", "所涉主要矿种");
            map.put("SSZYKZQTSM", "所涉主要矿种其他说明");
            map.put("SSFSKZ", "所涉附属矿种");
            map.put("SSFSKZQTSM", "所涉附属矿种其他说明");
            map.put("CXKGY", "采选矿工艺");
            map.put("AQXKZBH", "安全许可证编号");
            map.put("AQXKZFFDW", "安全许可证发放单位");
            map.put("AQXKZBFSJ", "安全许可证颁（换）发时间");
            map.put("PWXKZBH", "排污许可证编号");
            map.put("PWXKZFFDW", "排污许可证发放单位");
            map.put("PWXKZBFSJ", "排污许可证颁（换）发时间");
            map.put("WKKMC", "尾矿库名称");
            map.put("WKKSFYCYM", "尾矿库是否有曾用名");
            map.put("WKKCYM", "尾矿库曾用名");
            map.put("ZXJD_D", "中心经度");
            map.put("ZXWD_D", "中心纬度");
            map.put("GC", "高程");
            map.put("SZXZMC", "所在乡镇名称");
            map.put("SZCMC", "所在村名称");
            map.put("XDFW", "相对方位");
            map.put("JCZXJL", "距村中心距离");
            map.put("WKKXS", "尾矿库型式");
            map.put("WKKQTXS", "尾矿库其它型式");
            map.put("WKRKXS", "尾矿入库形式");
            map.put("BTLX", "坝体类型");
            map.put("WKKDB", "尾矿库等别");
            map.put("AQDDJ", "安全度等级");
            map.put("SWHDYY", "尚未核定原因");
            map.put("SCZK", "生产状况");
            map.put("WKKKGJSRQ", "尾矿库开工建设日期");
            map.put("WKKTRSYRQ", "尾矿库投入使用日期");
            map.put("SJDZLD", "设计地震烈度");
            map.put("FHBZ", "防洪标准");
            map.put("SJZKR", "设计总库容");
            map.put("SJKR", "实际库容");
            map.put("SJZBG", "设计总坝高");
            map.put("XZZBG", "现状总坝高");
            map.put("SJNPWL", "设计年排尾量");
            map.put("SJSYNX", "设计使用年限");
            map.put("YSYNX", "已使用年限");
            map.put("WKZYCF", "尾矿主要成分");
            map.put("WKFSCF", "尾矿附属成分");
            map.put("WKSZYCF", "尾矿水主要成分");
            map.put("WKSFSCF", "尾矿水附属成分");
            map.put("SJNWKRKL", "实际年尾矿入库量");
            map.put("WKSCSL", "尾矿水产生量");
            map.put("WKSHSLYPFL", "尾矿水和渗滤液排放量");
            map.put("WKSHYL", "尾矿水回用率");
            map.put("WKSSFS", "尾矿输送方式");
            map.put("SSJL", "输送距离");
            map.put("SFJXLHP", "是否进行了环评");
            map.put("WJXHPYY", "未进行环评原因");
            map.put("HJYXPJWJ", "环境影响评价文件是否按《建设项目环境风险评价技术导则（HJ/T169号）》要求编制环境风险评价专篇");
            map.put("SFTGHBSTSYS", "是否通过环保“三同时”验收");
            map.put("WTGYY", "未通过原因");
            map.put("SFJXPWSBDJ", "是否进行排污申报登记");
            map.put("SFCQFSLCLCS", "是否采取防渗漏处理措施");
            map.put("SFCQFYSCLCS", "是否采取防扬散处理措施");
            map.put("SFCQFLSCLCS", "是否采取防流失处理措施");
            map.put("SFJSFHSS", "是否建设防洪设施");
            map.put("PHFS", "排洪方式");
            map.put("FHSSSFZC", "防洪设施是否正常");
            map.put("CZWT", "存在问题");
            map.put("SFJYWKSHSLYCLSS", "是否建有尾矿水和渗滤液处理设施");
            map.put("PFSFDB", "排放是否达标");
            map.put("WKKSFJZYZZ", "尾矿库是否建在饮用水源地保护区、自然保护区、重要生态功能区");
            map.put("WKKZBSFYHJMGD", "尾矿库周边是否有环境敏感点");
            map.put("JTQK1", "具体情况1");
            map.put("SFCZYXGT", "是否存在影响公路、铁路饮用水源安全的情况");
            map.put("WKKXYSFYJM", "尾矿库下游是否有居民或重要设施");
            map.put("JTQK2", "具体情况2");
            map.put("WKKXYSFJYLYFKSS", "尾矿库下游是否建有流域防控设施");
            map.put("JTQK3", "具体情况3");
            map.put("SFPBHJYJRY", "是否配备环境应急人员");
            map.put("RS", "人数");
            map.put("SFCBHJYJWZ", "是否储备环境应急物资");
            map.put("YJWZQK", "应急物资情况");
            map.put("SFJSHJYJSS", "是否建设环境应急设施");
            map.put("YJSSQK", "应急设施情况");
            map.put("SFBZHJYJYA", "是否编制环境应急预案");
            map.put("HJYJYASFXHBBMBA", "环境应急预案是否向环保部门备案");
            map.put("SFDQKZHJYJYL", "是否定期开展环境应急演练");
            map.put("SFPBHJJCSB", "是否配备环境监测设备");
            map.put("SFJXHJRCJC", "是否进行环境日常监测");
            map.put("JCZBX", "监测指标项");
            map.put("ZBXNPJJCZ", "指标项年平均监测值");
            map.put("JCPL", "监测频率");
            map.put("ZBSFYHJYJWZWBGYDW", "周边是否有环境应急物资外部供应单位");
            map.put("SFFSTFHJSJ", "是否发生突发环境事件（截至2012年5月31日）");
            map.put("TFHJSJCS", "突发环境事件次数");
            map.put("YWFXWTZGLSQK", "以往发现问题整改落实情况");
            map.put("JCZFXDZYWTJZGYQ", "检查组发现的主要问题及整改要求");
            map.put("BJCDWFZRYJ", "被检查单位负责人意见");
            map.put("BZ", "备注");
            map.put("JCRY", "检查人员");
            map.put("JCSJ", "检查时间");


            String todayStr = new SimpleDateFormat("yyy-MM-dd").format(new Date());

            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "尾矿库数据", geturl, response);
            
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
