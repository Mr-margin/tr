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
 * 使用的表：TB_ORGANIZATION_PESTICIDE
 * 暂时不适用了，
 * @author luowenbin
 */
@RestController
@RequestMapping( "pesticide" )
@SuppressWarnings("all")
public class PesticideLandController {
	
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
            
            String sql1 = "select  T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from("
            		+ " select * from (select ORGANID,TYDM0,JGDM0,JGMC0,JYFW0,JGDZ0,XZQH0,FDDBR0,"
            		+ " to_char(ZCRQ0,'yyyy-mm-dd HH24:mi:ss') ZCRQ0,"
            		+ " to_char(BGRQ0,'yyyy-mm-dd HH24:mi:ss') BGRQ0,to_char(BZRQ0,'yyyy-mm-dd HH24:mi:ss') BZRQ0,to_char(ZFRQ0,'yyyy-mm-dd HH24:mi:ss') ZFRQ0,"
            		+ " ZCZJ0,JYZT0,DHHM0,ZGRS0,JJHY20110,JGLX,ZGDM0,ZGMC0,EMAIL0,URL0,SCJYDZ0,"
            		+ " SCJYXZQH0,"
            		+ " to_char(GXCLDATE,'yyyy-mm-dd HH24:mi:ss') GXCLDATE,"
            		+ " JHBZ,XZQH0_NAME,SCJYXZQH0_NAME,DHHM1,LON,LAT,ROWNUM RN"
            		+ " from \"TB_ORGANIZATION_PESTICIDE\" where  1=1";
            
            String sqlWhere = "";
            //省级用户处理
            if(userLevel.equals("2")){
            	sqlWhere += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            
            if (!"".equals(jgmco)) {
            	sqlWhere += " and JGMC0 like '%" + jgmco + "%'";
            }
            if (!"".equals(status1)) {
            	if("1".equals(status1)){
            		sqlWhere += " and JYZT0 in ('0012', '03', '3', '4', '99', 'DX', 'X', '吊销并注销', '已注销', '撤销', '撤销设立登记中','注销', '注销企业', '注销登记中')";
            	}
            	if("2".equals(status1)){
            		sqlWhere += " and JYZT0 in ('0006', '04', '2', '7', 'D', '吊销未注销')";
            	}if("3".equals(status1)){
            		sqlWhere += " and JYZT0 in ('0012', '03', '3', '4', '99', 'DX', 'X', '吊销并注销', '已注销', '撤销', '撤销设立登记中','注销', '注销企业', '注销登记中', '0006', '04', '2', '7', 'D', '吊销未注销')";
            	}
            	
            }
            if(!"".equals(province)){
            	sqlWhere += " and XZQH0 like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and XZQH0 like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XZQH0 like '" + county + "'";
			}
			//建设项目距离分析
			if(!"".equals(lCloumnStr)){
				sqlWhere += " and "+lCloumnStr+"  = '1'";
			}
			
			 sql1 += sqlWhere;
	            sql1 += ") )T1 "
	            		+ " left join \"tb_city\" c1 on concat(substr(T1.XZQH0, 0, 2), '0000')=c1.\"code\" "
	            		+ " left join \"tb_city\" c2 on concat(substr(T1.XZQH0, 0, 4), '00')=c2.\"code\" "
	            		+ " left join \"tb_city\" c3 on T1.XZQH0 = c3.\"code\" ";
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
            
            String sql1 = "select  T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from("
            		+ " select * from (select ORGANID,TYDM0,JGDM0,JGMC0,JYFW0,JGDZ0,XZQH0,FDDBR0,"
            		+ " to_char(ZCRQ0,'yyyy-mm-dd HH24:mi:ss') ZCRQ0,"
            		+ " to_char(BGRQ0,'yyyy-mm-dd HH24:mi:ss') BGRQ0,to_char(BZRQ0,'yyyy-mm-dd HH24:mi:ss') BZRQ0,to_char(ZFRQ0,'yyyy-mm-dd HH24:mi:ss') ZFRQ0,"
            		+ " ZCZJ0,JYZT0,DHHM0,ZGRS0,JJHY20110,JGLX,ZGDM0,ZGMC0,EMAIL0,URL0,SCJYDZ0,"
            		+ " SCJYXZQH0,"
            		+ " to_char(GXCLDATE,'yyyy-mm-dd HH24:mi:ss') GXCLDATE,"
            		+ " JHBZ,XZQH0_NAME,SCJYXZQH0_NAME,DHHM1,LON,LAT,ROWNUM RN"
            		+ " from \"TB_ORGANIZATION_PESTICIDE\" where 1=1 ";
            String sql2 = "select count(*) from \"TB_ORGANIZATION_PESTICIDE\" where 1=1 ";

            String sqlWhere = "";
            //省级用户处理
            if(userlevel.equals("2")){
            	sqlWhere += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            if (!"".equals(jgmco)) {
            	sqlWhere += " and JGMC0 like '%" + jgmco + "%'";
            }
            if (!"".equals(status1)) {
            	if("1".equals(status1)){
            		sqlWhere += " and JYZT0 in ('0012', '03', '3', '4', '99', 'DX', 'X', '吊销并注销', '已注销', '撤销', '撤销设立登记中','注销', '注销企业', '注销登记中')";
            	}
            	if("2".equals(status1)){
            		sqlWhere += " and JYZT0 in ('0006', '04', '2', '7', 'D', '吊销未注销')";
            	}if("3".equals(status1)){
            		sqlWhere += " and JYZT0 in ('0012', '03', '3', '4', '99', 'DX', 'X', '吊销并注销', '已注销', '撤销', '撤销设立登记中','注销', '注销企业', '注销登记中', '0006', '04', '2', '7', 'D', '吊销未注销')";
            	}
            	
            }
            if(!"".equals(province)){
            	sqlWhere += " and XZQH0 like '" + province.substring(0, 2) + "%'";
            }
            if(!"".equals(city)){
            	sqlWhere += " and XZQH0 like '" + city.substring(0, 4) + "%'";
            }
			if(!"".equals(county)){
				sqlWhere += " and XZQH0 like '" + county + "'";
			}
			//建设项目距离分析
			if(!"".equals(lCloumnStr)){
				sqlWhere += " and "+lCloumnStr+"  = '1'";
			}
            
            sql1 += sqlWhere;
            sql1 += ") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize) + ")T1 "
            		+ " left join \"tb_city\" c1 on concat(substr(T1.XZQH0, 0, 2), '0000')=c1.\"code\" "
            		+ " left join \"tb_city\" c2 on concat(substr(T1.XZQH0, 0, 4), '00')=c2.\"code\" "
            		+ " left join \"tb_city\" c3 on T1.XZQH0 = c3.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
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
            String organID = data.getOrDefault("ORGANID", "").toString();//id
            
            String sql1 = "select  T1.*,c1.\"name\" PROVINCE,c2.\"name\" CITY,c3.\"name\" COUNTY from("
            		+ " select * from (select ORGANID,TYDM0,JGDM0,JGMC0,JYFW0,JGDZ0,XZQH0,FDDBR0,"
            		+ " to_char(ZCRQ0,'yyyy-mm-dd HH24:mi:ss') ZCRQ0,"
            		+ " to_char(BGRQ0,'yyyy-mm-dd HH24:mi:ss') BGRQ0,to_char(BZRQ0,'yyyy-mm-dd HH24:mi:ss') BZRQ0,to_char(ZFRQ0,'yyyy-mm-dd HH24:mi:ss') ZFRQ0,"
            		+ " ZCZJ0,JYZT0,DHHM0,ZGRS0,JJHY20110,JGLX,ZGDM0,ZGMC0,EMAIL0,URL0,SCJYDZ0,"
            		+ " SCJYXZQH0,"
            		+ " to_char(GXCLDATE,'yyyy-mm-dd HH24:mi:ss') GXCLDATE,"
            		+ " JHBZ,XZQH0_NAME,SCJYXZQH0_NAME,DHHM1,LON,LAT,ROWNUM RN"
            		+ " from \"TB_ORGANIZATION_PESTICIDE\" where 1=1 and ORGANID="+organID
            		+ " ) )T1 "
	            	+ " left join \"tb_city\" c1 on concat(substr(T1.XZQH0, 0, 2), '0000')=c1.\"code\" "
	            	+ " left join \"tb_city\" c2 on concat(substr(T1.XZQH0, 0, 4), '00')=c2.\"code\" "
	            	+ " left join \"tb_city\" c3 on T1.XZQH0 = c3.\"code\" ";
			List<Map> resultList = getBySqlMapper.findRecords(sql1);
			if(resultList.size()>0){
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
     * 农药厂地污染预警-分省汇总
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
            String sql1 = " select count(1) count from TB_ORGANIZATION_PESTICIDE where 1=1 ";
          //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            sql1 += " union ALL "+
							" select count(1) from TB_ORGANIZATION_PESTICIDE where CANCELTYPE='1' ";
          //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            sql1 += " union ALL "+
							" select count(1) from TB_ORGANIZATION_PESTICIDE where ZFRQ0>=to_date('"+nowStr+"','yyyy-mm-dd HH24:mi:ss') and ZFRQ0<=to_date('"+dateStr+"','yyyy-mm-dd HH24:mi:ss')";
          //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
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
            		+ "select T1.count,T1.code,C1.\"name\" from ("
            			+ " select count(1) count,concat(substr(XZQH0, 0, 2), '0000') code from TB_ORGANIZATION_PESTICIDE "
            			+ " where 1=1 ";
            //省级用户处理
            if(userlevel.equals("2")){
            	sql1 += " and XZQH0 like '" + regionCode.substring(0, 2) + "%'";
            }
            
            if(!"".equals(isCancle) && isCancle.equals("1")){
            	sql1 += " and CANCELTYPE='1' ";
            }
			sql1 += " GROUP BY substr(XZQH0, 0, 2)"
					+ " )T1"
					+ " left join \"tb_city\" c1 on T1.code=c1.\"code\" where \"name\" is not null  order by count desc "
					+ ") where rownum<10";
            
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
            String sql1 = "select ORGANID,LON,LAT,JGMC0 from TB_ORGANIZATION_PESTICIDE ";
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
            	String sql = "update TB_ORGANIZATION_PESTICIDE set " + lColumnStr + "='1' where ORGANID in ("+organIDs+")";
            	getBySqlMapper.update(sql);
            }
            
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

}

