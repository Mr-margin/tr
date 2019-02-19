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
import com.gistone.seimp.util.UrlsUtil;
import com.gistone.seimp.util.XSSFExcelUtils;

/**
 * 共享交换-重点监管企业遥感核查
 * tb_wurandikuai_yaoganhecha
 *
 */
@RestController
@RequestMapping("shareExchange/wy")
@SuppressWarnings("all")
public class WrdkYghcController {
	
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
            
            String sql = "select count(1) count,DALEI \"name\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            }
            sql += " group by DALEI order by count desc";
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
            
            String sql = "select count(1) count,SHENG \"name\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            }
            sql += " group by SHENG order by count asc ";
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
            
            String sql = "select count(1) count,SHI \"name\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if(userlevel.equals("2")){
            	sql += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            }
            sql += " group by SHI order by count asc ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
	
    /**
     * 污染地块遥感核查分页数据
     * 省级用户处理
     * bootstrap-table
     */
    @RequestMapping( "getWYData" )
    public Map getWYData(HttpServletRequest request, HttpServletResponse response) {
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
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = Integer.parseInt(data.getOrDefault("pageSize","10").toString());
            int pageNumber = Integer.parseInt(data.getOrDefault("pageNumber", "0").toString());
            String name = data.getOrDefault("name", "").toString();//污染企业名称
            String province = data.getOrDefault("province", "").toString();//所属行政区
            String status1 = data.getOrDefault("status", "").toString();//核查状态
            String production = data.getOrDefault("production", "").toString();//是否在产
            String progress = data.getOrDefault("progress", "").toString();//核查进度
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
            
            
            String sql1 = "select * from (select T1.*,T2.\"QYGM_NAME\" as \"qiye\",ROWNUM RN from ("
            		+ "select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", "
            		+ "\"LONGITUDE\", \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\","
            		+ " \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", \"SURVEY_STATUS\", \"SURVEY_PROGRESS\","
            		+ " \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", \"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", "
            		+ "\"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            String sql2 = "select count(*) from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            String sqlWhere = "";
            //省级用户处理
            if (userlevel.equals("2")) {
            	sqlWhere += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!name.equals("")) {
            	sqlWhere += " and \"NAME\" like'%" + name + "%'";
            }
            if (!province.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" like '" + province.substring(0, 2) + "%'";
            }
            if (!status1.equals("")) {
            	sqlWhere += " and \"SURVEY_STATUS\" ='" + status1 + "'";
            }
            if (!production.equals("")) {
            	sqlWhere += " and \"PRODUCTION\" ='" + production + "'";
            }
            if (!progress.equals("")) {
            	sqlWhere += " and \"SURVEY_PROGRESS\" ='" + progress + "'";
            }
            
            sql1 += sqlWhere;
            sql1 += " order by GW_UPDATE_TIME desc nulls last)T1 left join \"T_Cod_QYGM\" T2 on T1.\"GUIMO\"=T2.\"QYGM_CODE\") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);
            
            //返回数据
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看遥感核查数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    
    /**
	 * 
	 */
	@RequestMapping( "getWYDataByID" )
    public EdatResult getWYDataByID(HttpServletRequest request, HttpServletResponse response) {
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
            String OID = data.getOrDefault("OID","").toString();//
            
            
            String sql1 = "select T1.*,T2.\"QYGM_NAME\" as \"qiye\" from ("
            		+ "select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", "
            		+ "\"LONGITUDE\", \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\","
            		+ " \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", \"SURVEY_STATUS\", \"SURVEY_PROGRESS\","
            		+ " \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", \"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", "
            		+ "\"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where  OID='" + OID + "'";
            
            sql1 += ")T1 left join \"T_Cod_QYGM\" T2 on T1.\"GUIMO\"=T2.\"QYGM_CODE\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);

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
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
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
            
            String sql = "select count(1) count,substr(GW_UPDATE_TIME,0," + substrLength + ") UPDATETIME from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            
            
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and DISTRICT_CODE like '" + regionCode.substring(0, 2) + "%'";
            }
            
            if(!"".equals(startTime)){
            	sql += " and GW_UPDATE_TIME>='" + startTime + "'";
            }
            if(!"".equals(endTime)){
            	sql += " and GW_UPDATE_TIME<='" + endTime + "'";
            }
            
            sql += " group by substr(GW_UPDATE_TIME,0," + substrLength + ") order by substr(GW_UPDATE_TIME,0," + substrLength + ") nulls last ";
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
            
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            //接收参数
            
            String sql = "select MAX(GW_UPDATE_TIME) UPDATETIME from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and DISTRICT_CODE like '" + regionCode.substring(0, 2) + "%'";
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
            String name = data.getOrDefault("name", "").toString();//污染企业名称
            String province = data.getOrDefault("province", "").toString();//所属行政区
            String status1 = data.getOrDefault("status", "").toString();//核查状态
            String production = data.getOrDefault("production", "").toString();//是否在产
            String progress = data.getOrDefault("progress", "").toString();//核查进度
            String metadataID = data.getOrDefault("metadataID", "").toString();
            
            //下载权限验证
            int status2 = checkService.CheckSeDownRight(request, Integer.parseInt(metadataID));
            if(status2 != 0){
            	return EdatResult.build(status2, "");
            }
            
            
            String sql1 = "select T1.*,T2.\"QYGM_NAME\" as \"qiye\",ROWNUM RN from ("
            		+ "select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", "
            		+ "\"LONGITUDE\", \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\","
            		+ " \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", \"SURVEY_STATUS\", \"SURVEY_PROGRESS\","
            		+ " \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", \"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", "
            		+ "\"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            String sqlWhere = "";
            //省级用户处理
            if (userlevel.equals("2")) {
            	sqlWhere += " and \"DISTRICT_CODE\"  like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!name.equals("")) {
            	sqlWhere += " and \"NAME\" like'%" + name + "%'";
            }
            if (!province.equals("")) {
            	sqlWhere += " and \"DISTRICT_CODE\" like '" + province.substring(0, 2) + "%'";
            }
            if (!status1.equals("")) {
            	sqlWhere += " and \"SURVEY_STATUS\" ='" + status1 + "'";
            }
            if (!production.equals("")) {
            	sqlWhere += " and \"PRODUCTION\" ='" + production + "'";
            }
            if (!progress.equals("")) {
            	sqlWhere += " and \"SURVEY_PROGRESS\" ='" + progress + "'";
            }
            
            String sql2 = "select count(*) from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);
            if(total>500000){
            	return  EdatResult.ok("您当前下载的数据量过大，请设置过滤条件后重新下载！");
            }
            
            sql1 += sqlWhere;
            sql1 += ")T1 left join \"T_Cod_QYGM\" T2 on T1.\"GUIMO\"=T2.\"QYGM_CODE\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            //数据处理
            for (Map map : list) {
            	//是否在产
				if(map!=null && map.get("PRODUCTION")!=null){
					String newStr = map.get("PRODUCTION").toString();
					String oldStr = map.get("PRODUCTION").toString();
					if(oldStr.equals("1")){
						newStr = "是";
					}else if(oldStr.equals("0")){
						newStr = "否 ";
					}
					map.put("PRODUCTION", newStr);
				}
				//建厂时间
				if(map!=null && map.get("BUILDTIME")!=null){
					String newStr = map.get("BUILDTIME").toString();;
					String oldStr = map.get("BUILDTIME").toString();
					if(oldStr.equals("null")){
						newStr = "";
					}
					map.put("BUILDTIME", newStr);
				}
				//筛选企业
				if(map!=null && map.get("LINK")!=null){
					String newStr = map.get("LINK").toString();;
					String oldStr = map.get("LINK").toString();
					if(oldStr.equals("1")){
						newStr = "是";
					}else if(oldStr.equals("0")){
						newStr = "否";
					}
					map.put("LINK", newStr);
				}
				//是否符合筛选原则
				if(map!=null && map.get("IS_GUIMO")!=null){
					String newStr = map.get("IS_GUIMO").toString();;
					String oldStr = map.get("IS_GUIMO").toString();
					if(oldStr.equals("1")){
						newStr = "是";
					}else if(oldStr.equals("0")){
						newStr = "否";
					}
					map.put("IS_GUIMO", newStr);
				}
				//核查状态
				if(map!=null && map.get("SURVEY_STATUS")!=null){
					String newStr = map.get("SURVEY_STATUS").toString();;
					String oldStr = map.get("SURVEY_STATUS").toString();
					if(oldStr.equals("1")){
						newStr = "存疑";
					}else if(oldStr.equals("0")){
						newStr = "待核查";
					}else if(oldStr.equals("2")){
						newStr = "完成";
					}
					map.put("SURVEY_STATUS", newStr);
				}
				//核查进度
				if(map!=null && map.get("SURVEY_PROGRESS")!=null){
					String newStr = map.get("SURVEY_PROGRESS").toString();;
					String oldStr = map.get("SURVEY_PROGRESS").toString();
					if(oldStr.equals("1")){
						newStr = "省";
					}else if(oldStr.equals("0")){
						newStr = "国家";
					}else if(oldStr.equals("2")){
						newStr = "市";
					}else if(oldStr.equals("2")){
						newStr = "县";
					}
					map.put("SURVEY_PROGRESS", newStr);
				}
				//更新类型
				if(map!=null && map.get("UPDATA_STATUS")!=null){
					String newStr = map.get("UPDATA_STATUS").toString();;
					String oldStr = map.get("UPDATA_STATUS").toString();
					if (oldStr.equals("1")) {
						newStr = "默认未变化";
	                } else if (oldStr.equals("3")) {
	                	newStr = "位置更新";
	                } else if (oldStr.equals("5")) {
	                	newStr = "属性更新";
	                } else if (oldStr.equals("7")) {
	                	newStr = "位置更新和属性更新";
	                } else if (oldStr.equals("8")) {
	                	newStr = "新增点";
	                } else if (oldStr.equals("10")) {
	                	newStr = "新增点和位置更新";
	                } else if (oldStr.equals("12")) {
	                	newStr = "新增点和属性更新";
	                } else if (oldStr.equals("14")) {
	                	newStr = "新增点、位置更新和属性更新";
	                }
					map.put("UPDATA_STATUS", newStr);
				}
			}
            
            //文件标题集合
            Map<String, String> map = new LinkedHashMap();
            map.put("NAME", "污染企业名称");
//            map.put("GEOMETRY", "poi点坐标");
            map.put("SHENG", "省");
            map.put("SHI", "市");
            map.put("XIAN", "县");
            map.put("XIANG", "乡");
            map.put("CUN", "村");
            map.put("LONGITUDE", "经度");
            map.put("LATITUDE", "纬度");
            map.put("LAIYUAN", "来源");
            map.put("REMARK", "备注");
            map.put("DALEI", "行业大类别");
            map.put("BIEMIN", "行业小类别名");
            map.put("BIANHAO", "编号");
            map.put("PREDID", "原始编号");
            map.put("AFTDID", "修改后的编号");
            map.put("PRODUCTION", "是否在产");
            map.put("BUILDTIME", "建厂时间");
            map.put("LINK", "筛选企业");
            map.put("IS_GUIMO", "是否符合筛选原则");
            map.put("qiye", "企业规模");
            map.put("SURVEY_STATUS", "核查状态");
            map.put("SURVEY_PROGRESS", "核查进度");
            map.put("UPDATA_STATUS", "更新类型");
            map.put("ELSEINFO", "其他信息");
            
            
            Map result = new HashMap();
            String geturl = urlsUtil.geturl();
            String writes = XSSFExcelUtils.writesNew(list, map, "重点行业监管企业遥感核查数据", geturl, response);
            
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
