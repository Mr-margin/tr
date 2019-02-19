package com.gistone.seimp.controller;

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

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;
import com.gistone.seimp.util.ExcelUtils;
import com.gistone.seimp.util.UrlsUtil;
import com.sun.jndi.toolkit.url.UrlUtil;

/**
 * 排污许可证详细信息-企业基本信息
 * @author 罗文斌
 *
 */
@RestController
@RequestMapping("enterBase")
@SuppressWarnings("all")
public class EnterpriseBaseInfoController {
	//当前模块功能索引
	private String rightIndex = "4";
	
	Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    
    @Autowired
    private LogToDb logToDb;
    
    @Autowired
    private UrlsUtil urlsUtil;
    
    //排污许可证注销/撤销数据-查询列表---
    //分页查询--bootstrap table
    //省级用户处理
    @RequestMapping("getEnterpriceBaseInfoData")
	public Map getEnterpriceUndoInfoData(HttpServletRequest request, HttpServletResponse response){
    	try {
    		ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, rightIndex);
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
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String devcompany = data.getOrDefault("devcompany","").toString();//单位名称
            String valiTimesEnd = data.getOrDefault("valiTimesEnd","").toString();//到期时间
            String valiTimesStart = data.getOrDefault("valiTimesStart","").toString();//到期时间
            
            int pageSize = Integer.parseInt(data.getString("pageSize"));
            int pageNumber = Integer.parseInt(data.getString("pageNumber"));
            
            String sql1 = "select * from (select T1.*, ROWNUM RN from (select * from ("
            		+ " select DATAID,ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,XKZNUM,DEVCOMPANY,VALITIMES,PROVINCECODE from "
            		+ " (select DATAID,ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,XKZNUM,DEVCOMPANY,VALITIMES,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO) temp"
            		+ " where TEMP.ROW_FLG=1"
            		+ ") where 1=1 ";
            String sql2 = "select count(1) from ("
            		+ " select DATAID,ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,XKZNUM,"
					+ "	DEVCOMPANY,VALITIMES,PROVINCECODE from  ("
					+ " select DATAID,ENTERID,ITEMENDTIME,PROVINCE,CITY,COUNTY,LONGITUDE,LATITUDE,XKZNUM,DEVCOMPANY,VALITIMES,PROVINCECODE,row_number() over(partition by ENTERID order by ITEMENDTIME desc) as row_flg from ENTERPRICE_BASEINFO"
					+ ") temp where TEMP.ROW_FLG=1"
            		+ ") where 1=1";
            
            String sqlWhere = "";
            //如果用户级别是省级用户，将用户的行政区划编码作为查询条件
            if("2".equals(userLevel)){
            	sqlWhere += " and (PROVINCECODE='" + regionCode.substring(0, 2) + "0000000000' or PROVINCECODE is null)";
            }
            if(!"".equals(devcompany)){
            	sqlWhere += " and (DEVCOMPANY like '%" + devcompany + "%' or XKZNUM like '%" + devcompany + "%')";
            }
            if(!"".equals(valiTimesEnd)){
            	sqlWhere += " and  substr(VALITIMES,INSTR(VALITIMES,'至',1,1)+1,10)<='" + valiTimesEnd + "' ";
            }
            
            if(!"".equals(valiTimesStart)){
            	sqlWhere += " and  substr(VALITIMES,INSTR(VALITIMES,'至',1,1)+1,10)>='" + valiTimesStart + "' ";
            }
            
            sql1 += sqlWhere +  " order by substr(VALITIMES,INSTR(VALITIMES,'至',1,1)+1,10) )T1) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            Integer total = getBySqlMapper.findrows(sql2);
            
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
    
    
    
}
