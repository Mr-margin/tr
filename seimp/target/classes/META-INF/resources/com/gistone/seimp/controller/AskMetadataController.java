package com.gistone.seimp.controller;


import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.job.GetContructProjectData;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.service.VisitOrDownService;
import com.gistone.seimp.util.*;

import jxl.write.DateTime;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import oracle.sql.CLOB;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.poi.hpsf.Section;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.beans.IntrospectionException;
import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;

/**
 * 数据申请
 */

@RestController
@RequestMapping( "askData" )
@SuppressWarnings("all")
public class AskMetadataController {

    Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private UrlsUtil urlUtil;
    @Autowired
    private LogToDb logToDb;
    
    /*图片后缀*/
    private static String[] extensionPermit = {"doc", "txt", "docx", "pdf"};


    
    
    /**
     * 插入 一条申请数据
     */
    @RequestMapping( "addAskData" )
    public EdatResult addAskData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "fail");
            }
            
            HttpSession session = request.getSession();
            String userID = session.getAttribute("userID").toString();
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String metadataID = data.getOrDefault("metadataID", "").toString();//元数据集ID
            String askDepartment = data.getOrDefault("askDepartment", "").toString();//申请部门
            String askName = data.getOrDefault("askName", "").toString();//联系人姓名
            String askTel = data.getOrDefault("askTel", "").toString();//联系人电话
            String askEmail = data.getOrDefault("askEmail", "").toString();//联系人邮箱
            String askReason = data.getOrDefault("askReason", "").toString();//申请理由
            String askTime = df.format(new Date());
            
            //判断是否有正在审核 或已审核通过
            String selSlq = "select ID from TB_ASKMETADATA where ASK_USER='" + userID + "' and ASK_METADATAID='"+metadataID+"' and VERIFY_STATUS in (0,1)";
            List<Map> result = getBySqlMapper.findRecords(selSlq);
            if(result.size()>0){
            	return EdatResult.build(11, "您的申请正在审核或已审核通过");
            }
            
            String sql = "insert into TB_ASKMETADATA (ID, ASK_DEPARTMENT, ASK_NAME,ASK_TEL,ASK_EMAIL,ASK_REASON,ASK_TIME,VERIFY_STATUS,ASK_METADATAID,ASK_USER) values("
            		+ "TB_ASKMETADATA_SEQ.nextval,'" + askDepartment + "','" + askName + "','" + askTel + "','" + askEmail + "','" + askReason + "',"
            		+ "to_date('" + askTime + "','yyyy-mm-dd hh24:mi:ss'),'0','" + metadataID + "','"+userID+"'"
            		+ ")";
            getBySqlMapper.insert(sql);
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 查询未审核申请数量
     */
    @RequestMapping( "getAskDataCountByStatus" )
    public EdatResult getAskDataCountByStatus(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "fail");
            }
            
            //接收参数
            
            String sql = "select count(1) from TB_ASKMETADATA where VERIFY_STATUS = '0'";
            Integer count = getBySqlMapper.findrows(sql);
            return EdatResult.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    /**
     * 查询申请数据
     * bootstrap-table
     */
    @RequestMapping( "getAskDataByStatus" )
    public Map getAskDataByStatus(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String verifyStatus = data.getOrDefault("verifyStatus", "").toString();//审核状态
            String sAdName = data.getOrDefault("sAdName", "").toString();//申请数据
            Integer pageNumber = Integer.parseInt(data.getString("pageNumber"));//当前页数，bootstraptable从0开始
            Integer pageSize = Integer.parseInt(data.getString("pageSize"));//开始索引
            
            String sql1 = "select * from (select T1.*,T2.\"name\",ROWNUM RN from ("
            		+ "select ID,ASK_DEPARTMENT,ASK_NAME,ASK_TEL,ASK_REASON,to_char(ASK_TIME,'yyyy-mm-dd HH24:mi:ss') ASK_TIME,"
            		+ "VERIFY_STATUS,to_char(VERIFY_TIME,'yyyy-mm-dd HH24:mi:ss') VERIFY_TIME,VERIFY_USER,VERIFY_READSON,ASK_METADATAID from TB_ASKMETADATA where 1=1";
            String sql2 = "select count(1) from (select ID,ASK_METADATAID from TB_ASKMETADATA  where 1=1";
            String sqlWhere = "";
            if(!"".equals(verifyStatus)){
            	sqlWhere += " and VERIFY_STATUS='" + verifyStatus +"'";
            }
            
            String sqlWhere2 = "select \"id\",\"name\" from \"tb_source_metadata\" where 1=1 ";
            if(!"".equals(sAdName)){
            	sqlWhere2 += " and \"name\" like '%" + sAdName + "%'";
            }
            
            
            sql1 += sqlWhere;
            sql1 += " )T1"
            		+ "	join (" + sqlWhere2 + ") T2 on T1.ASK_METADATAID=T2.\"id\""
            		+ ") where RN>" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            sql2 += sqlWhere;
            sql2 += " )T1"
            		+ "	join (" + sqlWhere2 + ") T2 on T1.ASK_METADATAID=T2.\"id\"";
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
    
    /**
     * 更新申请数据
     */
    @RequestMapping( "updateAskData" )
    public EdatResult updateAskData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "fail");
            }
            HttpSession session = request.getSession();
            String userID = session.getAttribute("userID").toString();
            
            //接收参数
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String aID = data.getOrDefault("AID", "").toString();//审批数据ID
            String verifyStatus = data.getOrDefault("verifyStatus", "").toString();//审核状态
            String verifyReason = data.getOrDefault("verifyReason", "").toString();//审核理由
            String verifyTime = df.format(new Date());
            
            if(aID == null || aID == ""){
            	return EdatResult.build(1, "fail");
            }
            if(verifyStatus == null || verifyStatus == ""){
            	return EdatResult.build(1, "fail");
            }
            
            String sql = "update  TB_ASKMETADATA set VERIFY_STATUS='" + verifyStatus + "', VERIFY_TIME=to_date('" + verifyTime + "','yyyy-mm-dd hh24:mi:ss') "
            		+ " , VERIFY_USER='" + userID + "' , VERIFY_READSON='" + verifyReason + "'"
            				+ "	where ID = " + aID  ;
            getBySqlMapper.update(sql);
            
            //查询审核数据
            String selSql = " select ASK_METADATAID,ASK_USER from TB_ASKMETADATA where ID = " + aID;
            List<Map> resultList = getBySqlMapper.findRecords(selSql);
            if(resultList.size()>0){
            	String metaID = resultList.get(0).get("ASK_METADATAID").toString();
            	String askUserId = resultList.get(0).get("ASK_USER").toString();
	            //删除审核权限
	            String delAuth = " delete from TB_ASK_AUTH where METAID = "+metaID + " and USERID = " + askUserId;
	            getBySqlMapper.delete(delAuth);
	            
	            if("1".equals(verifyStatus)){
	            	//增加审核权限
	            	String insertAuth = "insert into TB_ASK_AUTH(ID,USERID,METAID) values(TB_ASK_AUTH_SEQ.nextval," +
	            			askUserId + "," + metaID + ")";
	            	getBySqlMapper.insert(insertAuth);
	            }
            }
            
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 根据id，查询申请数据详情
     * bootstrap-table
     */
    @RequestMapping( "getAskDataByID" )
    public EdatResult getAskDataByID(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
            	return EdatResult.build(status, "fail");
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String aID = data.getOrDefault("AID", "").toString();//
            
            String sql1 = "select T1.*,T2.\"name\" from (select ID,ASK_DEPARTMENT,ASK_NAME,ASK_TEL,ASK_EMAIL,ASK_REASON,to_char(ASK_TIME,'yyyy-mm-dd HH24:mi:ss') ASK_TIME,"
            		+ "VERIFY_STATUS,to_char(VERIFY_TIME,'yyyy-mm-dd HH24:mi:ss') VERIFY_TIME,VERIFY_USER,VERIFY_READSON,ASK_METADATAID from TB_ASKMETADATA where ID="+aID+" )T1"
            		+ "	left join \"tb_source_metadata\" T2 on T1.ASK_METADATAID=T2.\"id\"";
            
            List<Map> list = getBySqlMapper.findRecords(sql1);
            
            return EdatResult.ok(list.get(0));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
   


    
}
