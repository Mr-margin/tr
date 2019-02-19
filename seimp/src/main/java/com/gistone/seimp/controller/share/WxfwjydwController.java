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
 * 共享交换-危险废物经营单位
 *
 */
@RestController
@RequestMapping("shareExchange/wxfwjydw")
@SuppressWarnings("all")
public class WxfwjydwController {
	
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
	 * 危险废物经营单位，分页数据
	 * bootstrap-table
	 * 省级数据处理
	 */
	@RequestMapping( "getWxfwjydwData" )
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
            String FDDBR = data.getOrDefault("FDDBR","").toString();//法定代表人
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
            
            String sql1 = "select T1.*,T3.\"Name\" as \"danwei\", c1.\"name\" PROVINCENAME,c2.\"name\" CITYNAME,c3.\"name\" COUNTYNAME from ("
            		+ "	select * from ( select R.*,ROWNUM RN from ("
            		+ " select \"BBBH\", \"BBNF\", \"BBDW\", \"DWMC\", \"FRMC\", \"FDDBR\", \"ZS\", \"YZBM\", \"SSDZ\", \"SSXZQHDM\","
            		+ " \"SSJD\", \"SSWD\", \"JJFS\", \"YXQX\",to_char(\"FZRQ\",'yyyy-mm-dd HH24:mi:ss') \"FZRQ\", \"HZNJYZGM\","
            		+ " \"HZNJYCZGM\", \"HZNJYLYGM\", \"XKZBH\", \"FZJG\", \"JYDWLB\", \"SJNJYZGM\", \"SJNJYCZGM\", \"SJNJYLYGM\","
            		+ " \"SGYAQK\", \"YLQK\", \"SGFSCS\", \"JYJLBQK\", \"ZCZ\", \"ZGRS\", \"BFHHBTR\", \"LXR\", \"DZYX\", \"DH\","
            		+ " \"CZ\", \"SJ\", \"DWFZR\",to_char(\"SCRQ\",'yyyy-mm-dd HH24:mi:ss') \"SCRQ\", \"BBZT\", \"FJBCLJ\", \"XKZBHSD\","
            		+ " \"SJWXFWCZL\", \"SJYLFWCZL\", \"TJBZ\", \"YTJLHZL\", \"SJYTJLHZL\", \"HZNJYWXCZGM\", \"HZNJYYLCZGM\"  from \"T_CER_BASEREPORT\" where 1=1 ";
            String sql2 = "select count(1) from T_CER_BASEREPORT where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and SSXZQHDM like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and DWMC like '%" + DWMC + "%'";
            }
            if (!"".equals(FDDBR)) {
            	sqlWhere += " and FDDBR like '%" + FDDBR + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and SSXZQHDM like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and SSXZQHDM like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and SSXZQHDM like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += " order by FZRQ desc nulls last )R) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize)
            		+" )T1"
            		+ " left join \"T_Cod_OrganizationType\" T3 on T1.\"JYDWLB\"=T3.\"Code\" "
            		+ " left join \"tb_city\" c1 on concat(substr(T1.SSXZQHDM, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.SSXZQHDM, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.SSXZQHDM = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看危险废物经营单位数据");
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
            
            String sql = "select count(1) count,to_char(\"FZRQ\",'" + datePartten + "')  UPDATETIME from T_CER_BASEREPORT where 1=1 ";
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            
            if(!"".equals(startTime)){
            	sql += " and \"FZRQ\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
            }
            if(!"".equals(endTime)){
            	sql += " and \"FZRQ\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
            }
            
            sql += " group by to_char(\"FZRQ\",'" + datePartten + "')  order by to_char(\"FZRQ\",'" + datePartten + "')  nulls last ";
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
            
            String sql = "select to_char( MAX(\"FZRQ\"),'yyyy-mm-dd HH24:mi:ss') UPDATETIME from T_CER_BASEREPORT where 1=1";
            
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
            String FDDBR = data.getOrDefault("FDDBR","").toString();//法定代表人
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status1 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status1 != 0){
            	return EdatResult.build(status1, "");
            }
            
            
            String sql1 = "select T1.*,T3.\"Name\" as \"danwei\", c1.\"name\" PROVINCENAME,c2.\"name\" CITYNAME,c3.\"name\" COUNTYNAME from (select * from ("
            		+ " select \"BBBH\", \"BBNF\", \"BBDW\", \"DWMC\", \"FRMC\", \"FDDBR\", \"ZS\", \"YZBM\", \"SSDZ\", \"SSXZQHDM\","
            		+ " \"SSJD\", \"SSWD\", \"JJFS\", \"YXQX\",to_char(\"FZRQ\",'yyyy-mm-dd HH24:mi:ss') \"FZRQ\", \"HZNJYZGM\","
            		+ " \"HZNJYCZGM\", \"HZNJYLYGM\", \"XKZBH\", \"FZJG\", \"JYDWLB\", \"SJNJYZGM\", \"SJNJYCZGM\", \"SJNJYLYGM\","
            		+ " \"SGYAQK\", \"YLQK\", \"SGFSCS\", \"JYJLBQK\", \"ZCZ\", \"ZGRS\", \"BFHHBTR\", \"LXR\", \"DZYX\", \"DH\","
            		+ " \"CZ\", \"SJ\", \"DWFZR\",to_char(\"SCRQ\",'yyyy-mm-dd HH24:mi:ss') \"SCRQ\", \"BBZT\", \"FJBCLJ\", \"XKZBHSD\","
            		+ " \"SJWXFWCZL\", \"SJYLFWCZL\", \"TJBZ\", \"YTJLHZL\", \"SJYTJLHZL\", \"HZNJYWXCZGM\", \"HZNJYYLCZGM\", ROWNUM RN  from \"T_CER_BASEREPORT\" where 1=1 ";
            String sql2 = "select count(1) from T_CER_BASEREPORT where 1=1";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and SSXZQHDM like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(DWMC)) {
            	sqlWhere += " and DWMC like '%" + DWMC + "%'";
            }
            if (!"".equals(FDDBR)) {
            	sqlWhere += " and FDDBR like '%" + FDDBR + "%'";
            }
            if(!"".equals(province)){
            	sqlWhere += " and SSXZQHDM like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and SSXZQHDM like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and SSXZQHDM like '" + county + "'";
			}
            
            sql1 += sqlWhere;
            sql1 += " ) )T1"
            		+ " left join \"T_Cod_OrganizationType\" T3 on T1.\"JYDWLB\"=T3.\"Code\" "
            		+ " left join \"tb_city\" c1 on concat(substr(T1.SSXZQHDM, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.SSXZQHDM, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.SSXZQHDM = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            for (Map map : list) {
            	//设施所在经度
                if(map.containsKey("SSJD") && map.get("SSJD")!=null){
                	String oldStr = map.get("SSWD").toString();
	        		map.put("SSJD", getLonLat(oldStr));
	        	}
                //设施所在纬度
                if(map.containsKey("SSWD") && map.get("SSWD")!=null){
                	String oldStr = map.get("SSWD").toString();
                	map.put("SSWD", getLonLat(oldStr));
                }
                //事故预案情况
                if(map.containsKey("SGYAQK") && map.get("SGYAQK")!=null){
                	String newStr = map.get("SGYAQK").toString();
                	String oldStr = map.get("SGYAQK").toString();
                	if("1".equals(oldStr)){
                		newStr = "制定";
                	}
                	if("2".equals(oldStr)){
                		newStr = "制定并参照《危险废物经营单位编制应急预案指南》（原国家环境保护总局公告2007年第48号）确定了应急协调人或建立类似制度。";
                	}
                	map.put("SGYAQK", newStr);
                }
                //建立危险废物经营情况记录簿情况
                if(map.containsKey("JYJLBQK") && map.get("JYJLBQK")!=null){
                	String newStr = map.get("JYJLBQK").toString();
                	String oldStr = map.get("JYJLBQK").toString();
                	if("1".equals(oldStr)){
                		newStr = "已建立";
                	}
                	if("0".equals(oldStr)){
                		newStr = "未建立";
                	}
                	map.put("JYJLBQK", newStr);
                }
                //提交标识
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
            map.put("FRMC", "法人名称");
            map.put("FDDBR", "法定代表人");
            map.put("ZS", "住所");
            map.put("YZBM", "邮政编码");
            map.put("PROVINCENAME", "省份");
            map.put("CITYNAME", "市区");
            map.put("COUNTYNAME", "县区");
            map.put("SSJD", "设施所在经度");
            map.put("SSWD", "设施所在纬度");
            map.put("YXQX", "有效期限");
            map.put("FZRQ", "发证日期");
            map.put("HZNJYZGM", "核准年经营总规模");
            map.put("HZNJYCZGM", "核准年经营处置规模");
            map.put("HZNJYLYGM", "核准年经营利用规模");
            map.put("XKZBH", "许可证编号");
            map.put("FZJG", "发证机关");
            map.put("danwei", "经营单位类别");
            map.put("SJNJYZGM", "时机年经营总规模");
            map.put("SJNJYCZGM", "实际年经营处置规模");
            map.put("SJNJYLYGM", "实际年经营利用规模");
            map.put("SGYAQK", "事故预案情况");
            map.put("YLQK", "演练情况");
            map.put("SGFSCS", "事故发生次数");
            map.put("JYJLBQK", "建立危险废物经营情况记录簿情况");
            map.put("ZCZ", "总产值");
            map.put("ZGRS", "职工总人数");
            map.put("LXR", "联系人");
            map.put("DZYX", "电子邮箱");
            map.put("DH", "电话");
            map.put("CZ", "传真");
            map.put("SJ", "手机");
            map.put("DWFZR", "单位发证人");
            map.put("SCRQ", "生产日期");
            map.put("BBZT", "报表状态");
            map.put("FJBCLJ", "附件路径");
            map.put("XKZBHSD", "许可证编号（手动）");
            map.put("SJWXFWCZL", "实际危险废物处置量");
            map.put("SJYLFWCZL", "实际医疗废物处置量");
            map.put("TJBZ", "提交标识");
            map.put("YTJLHZL", "以桶计量核准量");
            map.put("SJYTJLHZL", "实际以桶计量核准量");
            map.put("HZNJYWXCZGM", "核准年经营危险处置规模");
            map.put("HZNJYYLCZGM", "核准年经营医疗处置规模");
           
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = ExcelUtils.writesNew(list, map, "危险废物经营单位数据", geturl, response);
            
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
    		String[] arr = value.split("-");
    		if(arr.length > 0){
    			result = Integer.parseInt(arr[0]);
    		}
    		if(arr.length > 1){
    			result += (double)Math.round((Double.parseDouble(arr[1])/60) * 100) / 100;
    		}
    		if(arr.length > 2){
    			result += (double)Math.round((Double.parseDouble(arr[2])/3600) * 10000) / 10000;
    		}
    	}
    	if(result == 0){
    		return "";
    	}
    	return result + "";
    }
    
}
