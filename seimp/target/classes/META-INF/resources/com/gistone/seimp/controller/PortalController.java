package com.gistone.seimp.controller;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.*;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 首页
 * @author Administrator
 *
 */
@RestController
@RequestMapping("portal")
public class PortalController {


    Logger logger = Logger.getLogger(PortalController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    @Autowired
    private LogToDb logToDb;

    /**
     * 获取站内访问统计数据
     */
    @RequestMapping("getVisitStatisData")
    public EdatResult getVisitStatisData(HttpServletRequest request, HttpServletResponse response) {
    	try {
            ClientUtil.SetCharsetAndHeader(request, response);
            
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            Date todayDate = new Date();
            Calendar cal = Calendar.getInstance();
            cal.setTime(todayDate);
            cal.set(Calendar.DAY_OF_MONTH, 0);
            Date month = cal.getTime();
            String monthStr = df.format(month);
            
           
            String sql1 = "select count(1) \"count\" from \"tb_log\" where \"content\" = '登录' "
            		+ " union all "
            		+ "	select count(1) from ("
            		+ " select count(1),\"login_ip\" from \"tb_log\" where \"content\" = '登录' "
            		+ "	 group by \"login_ip\")"
            		+ " union all"
            		+ " select count(1) from \"tb_log\" where \"content\" = '登录'"
            		+ "	and \"time\">=to_date('"+monthStr+"','yyyy-mm-dd') "
            		+ " union all "
            		+ " select count(1) from ("
            		+ " select count(1),\"login_ip\" from \"tb_log\" where \"content\" = '登录' "
            		+ " and \"time\">=to_date('"+monthStr+"','yyyy-mm-dd')   group by \"login_ip\") ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    //污染地块统计
    @RequestMapping( "wrdkByFxjb" )
    public EdatResult wrdkByFxjb(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,FXJB name from TB_WRDKJBXXB where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by FXJB  ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    @RequestMapping( "wrdkByScjdbm" )
    public EdatResult getStatisDataOfSCJDBM(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,SCJDBM name from TB_WRDKJBXXB where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by SCJDBM order by SCJDBM ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    @RequestMapping( "wrdkByProvince" )
    public EdatResult wrdkByProvince(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,c.\"name\" name from TB_WRDKJBXXB w "
            		+ " left join \"tb_city\" c on w.PROVINCE_CODE=c.\"code\" where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by c.\"name\" order by count ASC ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    @RequestMapping( "wrdkByCity" )
    public EdatResult wrdkByCity(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,c.\"name\" name from TB_WRDKJBXXB w "
            		+ " left join \"tb_city\" c on w.CITY_CODE=c.\"code\" where 1=1 and DELETE_TSAMP is null";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userlevel)){
            	sql += " and PROVINCE_CODE='" + regionCode.substring(0, 2) + "0000'";
            }
            sql += " group by c.\"name\" order by count ASC ";
            List<Map> result = getBySqlMapper.findRecords(sql);
            
          return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    //重点行业监管企业统计
    @RequestMapping( "qyByDalei" )
    public EdatResult qyByDalei(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,DALEI name from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
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
    
    @RequestMapping( "qyByProvince" )
    public EdatResult qyByProvince(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,SHENG name from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
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
    
    @RequestMapping( "qyByCity" )
    public EdatResult qyByCity(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1");
            if (status != 0) {
            	return EdatResult.build(1, "fail");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            
            String sql = "select count(1) count,SHI name from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
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
    
    
    
}