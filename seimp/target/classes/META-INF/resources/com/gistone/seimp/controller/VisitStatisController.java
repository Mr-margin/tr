package com.gistone.seimp.controller;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.*;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 站内统计
 * @author Administrator
 *
 */
@RestController
@RequestMapping("visitStatis")
@SuppressWarnings("all")
public class VisitStatisController {


    Logger logger = Logger.getLogger(VisitStatisController.class);

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
            
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getOrDefault("startTime","").toString();//
            String endTime = data.getOrDefault("endTime","").toString();//
            String statisType = data.getOrDefault("statisType", "0").toString();
            
            String datePartten = "yyyy-mm-dd";
            if("0".equals(statisType)){
            	datePartten = "yyyy";
            }else if("1".equals(statisType)){
            	datePartten = "yyyy-mm";
            }else if("2".equals(statisType)){
            	datePartten = "yyyy-mm-dd";
            }
            
            //总访问量
            String sql2= "select count(1) COUNT,to_char(\"time\",'" + datePartten + "')  TIME  from \"tb_log\" where \"content\" = '登录'";
            if(!"".equals(startTime)){
            	sql2 += " and \"time\">=to_date('"+startTime+" 00:00:00','yyyy-mm-dd hh24:mi:ss')";
            }
            if(!"".equals(endTime)){
            	sql2 += " and \"time\"<=to_date('"+endTime+" 23:59:59','yyyy-mm-dd hh24:mi:ss')";
            }
            sql2 += " group by to_char(\"time\",'" + datePartten + "')  order by to_char(\"time\",'" + datePartten + "')  nulls last ";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            
            //独立访客
            String sql3= "select count(1) COUNT,TIME from ("
            		+ " select count(1) COUNT,to_char(\"time\",'" + datePartten + "') TIME,\"login_ip\"  from \"tb_log\" where \"content\" = '登录'";
            if(!"".equals(startTime)){
            	sql3 += " and \"time\">=to_date('"+startTime+" 00:00:00','yyyy-mm-dd hh24:mi:ss')";
            }
            if(!"".equals(endTime)){
            	sql3 += " and \"time\"<=to_date('"+endTime+" 23:59:59','yyyy-mm-dd hh24:mi:ss')";
            }
            sql3 += " group by to_char(\"time\",'" + datePartten + "'),\"login_ip\" "
            		+ " ) group by TIME  order by TIME  nulls last ";
            
            List<Map> list3 = getBySqlMapper.findRecords(sql3);
            
            Map map = new HashMap();
            map.put("visit", list2);
            map.put("ipVisit", list3);
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    
}