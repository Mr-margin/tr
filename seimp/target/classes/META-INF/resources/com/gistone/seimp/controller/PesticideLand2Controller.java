package com.gistone.seimp.controller;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;

import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 评估分析-农药厂地块预警
 * @author luowenbin
 */
@RestController
@RequestMapping( "pesticide2" )
@SuppressWarnings("all")
public class PesticideLand2Controller {
	
    //当前模块功能索引
  	private String rightIndex = "4";
	
    @Autowired
    private GetBySqlMapper getBySqlMapper;

    /**
     * 获取所有农药厂数据，在地图上显示所有点
     * 省级用户处理
     */
    @RequestMapping("getAllPesticideData")
    public EdatResult getAllPesticideData(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            
            //登录用户
            HttpSession session = request.getSession();
			String userID = session.getAttribute("userID").toString();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";//省份名称
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String jgmco = data.getOrDefault("jgmco", "").toString();//机构名称
            String status1 = data.getOrDefault("status", "").toString();//状态
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            //建设项目距离分析
            String lCloumnStr = data.getOrDefault("lCloumnStr", "").toString();
            
            String sql1 = "select ID, SHENG, SHI, XIAN, YUANQIYEMINGCHENG, YUANQIDIZHI, XIANQIMINGCHENG, XIANQIDIZHI,"
            		+ " CHENNENG, LEIXING, BEIZHU, TYPE, INSERTPERSON,"
            		+ " to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, LON, LAT"
            		+ " from \"TB_PESTICIDE_BASIC\" b where  1=1";
            
            String sqlWhere = "";
            //省级用户处理
            if(userLevel.equals("2")){
            	sqlWhere += " and  SHENG like '" + names.substring(0, 2) + "%'";
            }
            
            if (!"".equals(jgmco)) {
            	sqlWhere += " and XIANQIMINGCHENG like '%" + jgmco + "%'";
            }
            if (!"".equals(status1)) {
            	sqlWhere += " and EXISTS( select 1 from TB_PESTICIDE_PRODUCT p where  b.\"ID\"=p.BASIC_ID and p.CHANPINLEIBIE='"+status1+"')";
            	
            }
            if(!"".equals(province)){
            	sqlWhere += " and SHENG like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and SHI like '" + city.substring(0, 2) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XIAN like '" + county.substring(0, 2) + "%'";
			}
			//建设项目距离分析
			if(!"".equals(lCloumnStr)){
				sqlWhere += " and "+lCloumnStr+"  = '1'";
			}
			
			 sql1 += sqlWhere;
	           
			List<Map> resultList = getBySqlMapper.findRecords(sql1);
			
            return EdatResult.ok(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取农药厂数据，分页数据
     * 省级用户处理
     * bootstrap-table
     */
    @RequestMapping("getPesticidePageData")
    public Map getPesticidePageData(HttpServletRequest request, HttpServletResponse response) {
		try {
			ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
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
            String jgmco = data.getOrDefault("jgmco", "").toString();//机构名称
            String status1 = data.getOrDefault("status", "").toString();//机构名称
            String province = data.getOrDefault("province", "").toString();//省
            String city = data.getOrDefault("city", "").toString();//市
            String county = data.getOrDefault("county", "").toString();//县
            //建设项目距离分析
            String lCloumnStr = data.getOrDefault("lCloumnStr", "").toString();
            
            String type = data.getOrDefault("type", "").toString();//企业类别
            
            String sql1 = " select * from (select ID, SHENG, SHI, XIAN, YUANQIYEMINGCHENG, YUANQIDIZHI, XIANQIMINGCHENG, XIANQIDIZHI,"
            		+ " CHENNENG, LEIXING, BEIZHU, TYPE, INSERTPERSON,"
            		+ " to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, LON, LAT, ROWNUM RN"
            		+ " from \"TB_PESTICIDE_BASIC\" b where  1=1";
            String sql2 = "select count(*) from \"TB_PESTICIDE_BASIC\" b where 1=1 ";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and  SHENG like '" + names.substring(0, 2) + "%'";
            }
            
            if (!"".equals(jgmco)) {
            	sqlWhere += " and XIANQIMINGCHENG like '%" + jgmco + "%' ";
            }
            if (!"".equals(status1)) {
            	sqlWhere += " and EXISTS( select 1 from TB_PESTICIDE_PRODUCT p where  b.\"ID\"=p.BASIC_ID and p.CHANPINLEIBIE='"+status1+"')";
            	
            }
            if(!"".equals(province)){
            	sqlWhere += " and SHENG like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and SHI like '" + city.substring(0, 2) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XIAN like '" + county.substring(0, 2) + "%'";
			}
			//建设项目距离分析
			if(!"".equals(lCloumnStr)){
				sqlWhere += " and "+lCloumnStr+"  = '1'";
			}
			
			if(!"".equals(type)){
				sqlWhere += " and TYPE = '"+type+"' ";
			}
            
            sql1 += sqlWhere;
            sql1 += ") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize) ;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            
            //现企业名称与污染地块关联
            for (Map map : list) {
				if(map.containsKey("XIANQIMINGCHENG")){
					String xqymc = map.get("XIANQIMINGCHENG").toString();
					String sqlWrdk = "select WRDKMC from TB_WRDKJBXXB where WRDKMC='"+xqymc.trim()+"' and  DELETE_TSAMP is null";
					List<Map> list2 = getBySqlMapper.findRecords(sqlWrdk);
					if(list2.size()>0){
						map.put("nameWrdk", list2.size());
					}else{
						map.put("nameWrdk", "0");
					}
				}
			}
            
            
            sql2 += sqlWhere;
            int total = getBySqlMapper.findrows(sql2);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            return result;
		} catch (Exception e) {
			e.printStackTrace();
            return null;
		}
	}
    
    /**
     * 农药厂数据，产品类别列表
     */
    @RequestMapping("getLeibieList")
    public EdatResult getLeibieList(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            
            //登录用户
            HttpSession session = request.getSession();
			String userID = session.getAttribute("userID").toString();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";//省份名称
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ID = data.getOrDefault("ID", "").toString();//id
            
            String sql1 = "select DISTINCT CHANPINLEIBIE from TB_PESTICIDE_PRODUCT where CHANPINLEIBIE is not null";
			List<Map> resultList = getBySqlMapper.findRecords(sql1);
			
			
				return EdatResult.ok(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    /**
     * 根据id获取农药厂数据
     */
    @RequestMapping("getPesticideByID")
    public EdatResult getPesticideByID(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            
            //登录用户
            HttpSession session = request.getSession();
			String userID = session.getAttribute("userID").toString();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";//省份名称
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ID = data.getOrDefault("ID", "").toString();//id
            
            String sql1 = "select ID, SHENG, SHI, XIAN, YUANQIYEMINGCHENG, YUANQIDIZHI, XIANQIMINGCHENG, XIANQIDIZHI,"
            		+ " CHENNENG, LEIXING, BEIZHU, TYPE, INSERTPERSON,"
            		+ " to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, LON, LAT, ROWNUM RN"
            		+ " from \"TB_PESTICIDE_BASIC\" where  ID="+ID;
			List<Map> resultList = getBySqlMapper.findRecords(sql1);
			
			
			if(resultList.size()>0){
				String sql2 = "select ID, CHANPINLEIBIE, CHANPINMINGCHENG, SHENGCHANPIJIANHAO, TYPE, BASIC_ID "
						+ " from TB_PESTICIDE_PRODUCT where BASIC_ID="+resultList.get(0).get("ID");
				List<Map> list2 = getBySqlMapper.findRecords(sql2);
				resultList.get(0).put("productList", list2);
				
				return EdatResult.ok(resultList.get(0));
			}
            return EdatResult.build(1, "fail");
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取农药厂周围的住宅、医院、学校的建设项目数据
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("getYzConsHouseAroundPesticide")
    public EdatResult getYzConsHouseAroundPesticide(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            
            //登录用户
            HttpSession session = request.getSession();
			String userID = session.getAttribute("userID").toString();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";//省份名称
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            double minLon = Double.parseDouble(data.getString("minLon"));
            double maxLon = Double.parseDouble(data.getString("maxLon"));
            double minLat = Double.parseDouble(data.getString("minLat"));
            double maxLat = Double.parseDouble(data.getString("maxLat"));
            String hangyeType = data.getOrDefault("hangyeType", "").toString();
            
            String sql1 = "select \"CONSTRUCTIONID\" , \"PROJECTNAME\", \"EIAFILETYPE\", \"ACCEPTANCEDATE\", "
            		+ "\"NATIONALECONOMYCODE\", " + "\"DATASOURCE\", \"EIAMANAGETYPE\", \"PROJECTADDRESS\", \"PROJECTINVEST\", "
            		+ "\"ENVIRONINVEST\", \"PROVINCENAME\", \"DELMARK\", \"LONGITUDE\"," + "\"LATITUDE\", \"NATIONALECONOMYNAME\", "
            		+ "\"EIAMANAGENAME\", \"STORAGETIME\", \"CONSREPORTPATH\"," + 
            		" to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss') INSERTTIME, \"ISDOWNLOADED\" from YZ_CONS_HOUSE where 1=1 ";
            
            String sqlWhere = "";
            //省级用户处理
            if(userLevel.equals("2")){
            	names = names.replace("省", "");
            	sqlWhere += " and PROVINCENAME like '%" + names + "%'";
            }
            
            if(!"".equals(hangyeType)){
            	sqlWhere += " and EIAMANAGENAME='"+hangyeType + "'";
            }
            sqlWhere += " and LONGITUDE >= '" + minLon + "' and LONGITUDE <= '" + maxLon + "' and LATITUDE >= '" + minLat + "' and LATITUDE <= '" + maxLat + "'";
            
			sql1 += sqlWhere;
            List<Map> list = getBySqlMapper.findRecords(sql1);
			List<Map> resultList = getBySqlMapper.findRecords(sql1);
			
            return EdatResult.ok(resultList);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 获取农药厂周围的污染地块数据
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("getWrdkAroundPesticide")
    public EdatResult getWrdkAroundPesticide(HttpServletRequest request , HttpServletResponse response ) {
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
    		int status = Check.CheckRight(request, "4");
    		if (status != 0) {
    			return EdatResult.build(status, "");
    		}
    		
    		//登录用户
    		HttpSession session = request.getSession();
    		String userID = session.getAttribute("userID").toString();
    		String regionCode = session.getAttribute("regionCode").toString();
    		String userLevel = session.getAttribute("userLevel").toString();
    		String names = "";//省份名称
    		if (!userLevel.equals("0") && !userLevel.equals("1")) {
    			String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
    			List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
    			Map mapS = codemap.get(0);
    			names = mapS.get("name").toString();
    		}
    		
    		//接收参数
    		JSONObject data = JSONObject.fromObject(request.getParameter("data"));
    		double minLon = Double.parseDouble(data.getString("minLon"));
    		double maxLon = Double.parseDouble(data.getString("maxLon"));
    		double minLat = Double.parseDouble(data.getString("minLat"));
    		double maxLat = Double.parseDouble(data.getString("maxLat"));
    		String name = data.getOrDefault("name", "").toString();
    		
    		String sql1 = "select w.WRDKID , w.WRDKBM, w.WRDKMC, w.POLLUETED, w.SCJDBM, g.WRDKZXJD, g.WRDKZXWD from TB_WRDKJBXXB w"
    				+ " left join TB_GBQYJBQK g on w.WRDKBM=g.WRDKBM where w.DELETE_TSAMP is  null ";
    		
    		String sqlWhere = "";
    		//省级用户处理
    		if(userLevel.equals("2")){
    			names = names.replace("省", "");
    			sqlWhere += " and w.PROVINCE_CODE = '" + regionCode + "'";
    		}
    		
    		sqlWhere += " and (w.WRDKMC='" + name + "' or (g.WRDKZXJD >= " + minLon + " and g.WRDKZXJD <= " + maxLon + " and g.WRDKZXWD >= " + minLat + " and g.WRDKZXWD <= " + maxLat + "))";
    		
    		sql1 += sqlWhere;
    		List<Map> resultList = getBySqlMapper.findRecords(sql1);
    		
    		return EdatResult.ok(resultList);
    	} catch (Exception e) {
    		e.printStackTrace();
    		return EdatResult.build(1, "fail");
    	}
    }
    
    /**
     * 获取根据农药厂名称分析污染地块数据
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("getWrdkByQymc")
    public Map getWrdkByQymc(HttpServletRequest request , HttpServletResponse response ) {
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
    		int status = Check.CheckRight(request, "4");
    		if (status != 0) {
    			Map map = new HashMap();
                map.put("status", status);
                return map;
    		}
    		
    		//登录用户
    		HttpSession session = request.getSession();
    		String userID = session.getAttribute("userID").toString();
    		String regionCode = session.getAttribute("regionCode").toString();
    		String userLevel = session.getAttribute("userLevel").toString();
    		String names = "";//省份名称
    		if (!userLevel.equals("0") && !userLevel.equals("1")) {
    			String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
    			List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
    			Map mapS = codemap.get(0);
    			names = mapS.get("name").toString();
    		}
    		
    		//接收参数
    		JSONObject data = JSONObject.fromObject(request.getParameter("data"));
    		String qymc = data.getOrDefault("qymc", "").toString();
    		
    		String sql1 = "select w.*,T2.\"name\" provinceName from ( select  WRDKID , WRDKBM, WRDKMC, SCJDBM, PROVINCE_CODE   from TB_WRDKJBXXB where DELETE_TSAMP is null ";
    		String sql2 = "select  count(1)   from TB_WRDKJBXXB where DELETE_TSAMP is null ";
    		
    		String sqlWhere = "";
    		//省级用户处理
    		if(userLevel.equals("2")){
    			names = names.replace("省", "");
    			sqlWhere += " and PROVINCE_CODE = '" + regionCode + "'";
    		}
    		
    		sqlWhere += " and  WRDKMC='"+qymc.trim()+"' ";
    		
    		sql1 += sqlWhere
    				+ ") w"
    				+ " left join \"tb_city\" T2 on w.\"PROVINCE_CODE\" = T2.\"code\"  ";
    		List<Map> resultList = getBySqlMapper.findRecords(sql1);
    		
    		sql2 += sqlWhere;
    		Integer total = getBySqlMapper.findrows(sql2);
    		
    		
    		Map result = new HashMap();
            result.put("rows", resultList);
            result.put("total", total);
//            result.put("page", pageNumber / pageSize);
            return result;
//    		return EdatResult.ok(resultList);
    	} catch (Exception e) {
    		e.printStackTrace();
    		return null;
    	}
    }
    
    /**
     * 农药厂地污染预警-汇总数据
     */
    @RequestMapping( "getIndexSumValue" )
    public EdatResult getIndexSumValue(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
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
            
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            Calendar cal = Calendar.getInstance();
            cal.setTime(new Date());
            cal.add(Calendar.DAY_OF_YEAR, 30);
            String dateStr = df.format(cal.getTime());
            String nowStr = df.format(new Date());
            
            //接收参数
            String sql1 = " select count(1) count from TB_PESTICIDE_BASIC where 1=1 ";
            //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and  SHENG like '" + names.substring(0, 2) + "%'";
            }
            sql1 += " union ALL "+
							" select count(1) from TB_PESTICIDE_BASIC where   TYPE='1' ";
            //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and  SHENG like '" + names.substring(0, 2) + "%'";
            }
            sql1 += " union ALL "+
							" select count(1) from TB_PESTICIDE_BASIC where   TYPE='2'";
            //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and  SHENG like '" + names.substring(0, 2) + "%'";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 农药厂地污染预警，分省汇总
     */
    @RequestMapping( "getStatisDataByProvince" )
    public EdatResult getStatisDataByProvince(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
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
            
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String isCancle = data.getOrDefault("isCancle","").toString();
            
            //接收参数
            String sql1 = " select * from ("
            		+ " select count(1) count,substr(SHENG, 0, 2) \"name\" from TB_PESTICIDE_BASIC "
			 		+ " GROUP BY substr(SHENG, 0, 2) having substr(SHENG,0,2) is not null order by COUNT desc"
					+ ") where rownum<10 ";
            
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 农药厂地污染预警，分产品汇总
     */
    @RequestMapping( "getStatisDataByProduct" )
    public EdatResult getStatisDataByProduct(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
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
            
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String isCancle = data.getOrDefault("isCancle","").toString();
            
            //接收参数
            String sql1 = " select CHANPINLEIBIE \"name\",count(1) count  from ("
            		+ " select CHANPINLEIBIE,BASIC_ID from TB_PESTICIDE_PRODUCT where CHANPINLEIBIE is not null GROUP BY CHANPINLEIBIE,BASIC_ID" 
            		+ " ) GROUP BY CHANPINLEIBIE ORDER BY COUNT DESC  ";
            
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取农药厂和建设项目数据
     */
    @RequestMapping( "getPesticideAndYzcons" )
    public EdatResult getPesticideAndYzcons(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            
            //接收参数
            String sql1 = "select ID,LON,LAT from TB_PESTICIDE_BASIC ";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            String sql2 = "select CONSTRUCTIONID,LONGITUDE lon,LATITUDE lat,PROJECTNAME from YZ_CONS_HOUSE";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            Map result = new HashMap();
            result.put("pesticide", list1);
            result.put("yzcons", list2);
            
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 更新农药厂数据，周围是否有建设项目
     */
    @RequestMapping( "updatePesticideL" )
    public EdatResult updatePesticideL(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String organIDs = data.getOrDefault("organIDs","").toString();//数据id集合
            String lColumnStr = data.getOrDefault("lColumnStr","").toString();//字段名称
            
            if(!"".equals(organIDs)){
            	String sql = "update TB_PESTICIDE_BASIC set " + lColumnStr + "='1' where ID in ("+organIDs+")";
            	getBySqlMapper.update(sql);
            }
            
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

}

