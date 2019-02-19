package com.gistone.seimp.controller;


import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.controller.Check;
import com.gistone.seimp.controller.UserController;
import com.gistone.seimp.job.GetContructProjectData;
import com.gistone.seimp.service.CheckService;
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
import org.springframework.web.bind.annotation.RequestBody;
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
 * 移动端扫二维访问
 */

@RestController
@RequestMapping( "mobile" )
@SuppressWarnings("all")
public class MobileController {

    Logger logger = Logger.getLogger(MobileController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private UrlsUtil urlUtil;
    @Autowired
    private LogToDb logToDb;
    
    
    @Autowired
    private VisitOrDownService visitOrDownService;
    
    @Autowired
    private CheckService checkService;
    
    /*图片后缀*/
    private static String[] extensionPermit = {"doc", "txt", "docx", "pdf"};


    
    /**
     * 通过ID，获取元数据信息
     */
    @RequestMapping( "getMetadataInfoByID" )
    public EdatResult getMetadataInfoByID(HttpServletRequest request, HttpServletResponse response) {
        try {
        	
            ClientUtil.SetCharsetAndHeader(request, response);
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String mID = data.getOrDefault("MID", "").toString();//元数据集ID
            
            String sql = "select T1.*,T2.\"interface_url\",nvl(T3.VISITCOUNT,0) VISITCOUNT,nvl(T4.DOWNCOUNT,0) DOWNCOUNT from ("
            		
            		+ " select \"id\", \"name\", \"department\", to_char(\"updateTime\",'yyyy-mm-dd HH24:mi:ss')\"updateTime\","
            		+ "  \"serviceAccount\",  \"visitAccount\", to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss')\"dataTime\","
            		+ "   \"location\", \"subjectTerms\", \"dataType\", \"abstract\", \"instructions\", \"contact\","
            		+ " \"tel\", \"email\", \"address\",   \"ministry\",\"interface_id\","
            		+ " \"produce_name\",\"produce_people\",\"produce_tel\",\"produce_email\",\"produce_address\", "
            		+ "\"todatabase_name\",\"todatabase_people\",\"todatabase_tel\",\"todatabase_email\",\"todatabase_address\""
            		+ " from \"tb_source_metadata\" where \"id\" = '" + mID + "'"
            		
            		+ " ) T1"
            		+ " left join \"tb_interface\" T2 on T1.\"interface_id\" = T2.\"interface_id\""
            		+ " left join (select sum(COUNT) VISITCOUNT,METADATAID  from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T3 on T1.\"id\"=T3.METADATAID"
            		+ " left join (select sum(COUNT) DOWNCOUNT,METADATAID  from TB_VISITORDOWN_DAY where TYPE=2 group by METADATAID )  T4 on T1.\"id\"=T4.METADATAID";
            List<Map> list = getBySqlMapper.findRecords(sql);
            //添加分类信息
            addCatalogUrl(list);
            
            return EdatResult.ok(list.get(0));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 处理结果集数据，加上数据集的分类路径
     * @param list：数据集列表
     */
    private void addCatalogUrl(List<Map> list){
    	for (Map map : list) {
            String catalogUrl = "";
            if(map.get("dataType") != null && map.get("dataType") != ""){
            	String dataType = map.get("dataType").toString();
            	
            	//获取最低一级分类名称
            	String sql1 = "select \"id\",\"name\",\"parent_id\",\"level\" from \"tb_source_catalog\" where \"id\" = " + dataType;
            	List<Map> list1 = getBySqlMapper.findRecords(sql1);
            	if (list1.size() > 0) {
					catalogUrl += list1.get(0).get("name").toString();
					
					//获取
					if(list1.get(0).get("level") != null && list1.get(0).get("level") != "" && !list1.get(0).toString().equals("1")){
						String sql2 = "select \"id\",\"name\",\"parent_id\",\"level\" from \"tb_source_catalog\" where \"id\" = " + list1.get(0).get("parent_id");
		            	List<Map> list2 = getBySqlMapper.findRecords(sql2);
		            	if(list2.size() > 0){
		            		catalogUrl = list2.get(0).get("name").toString() + "/" + catalogUrl;
		            		
		            		//获取最高一级分类名称
		            		if(list2.get(0).get("level") != null && list2.get(0).get("level") != "" && !list2.get(0).toString().equals("1")){
		            			String sql3 = "select \"id\",\"name\",\"parent_id\",\"level\" from \"tb_source_catalog\" where \"id\" = " + list2.get(0).get("parent_id");
				            	List<Map> list3 = getBySqlMapper.findRecords(sql3);
				            	if(list3.size() > 0){
				            		catalogUrl = list3.get(0).get("name").toString() + "/" + catalogUrl;
				            	}
		            		}
		            	}
					}
            	}
            }
           
            map.put("catalogUrl", catalogUrl);
            
        }
    	
    }
    
    /**
     * 获取按更新时间统计数据
     */
    @RequestMapping( "getStatisDataByUpdateTime" )
    public EdatResult getStatisDataByUpdateTime(HttpServletRequest request, HttpServletResponse response) {
        try {
        	
            ClientUtil.SetCharsetAndHeader(request, response);
            
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            
          //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getOrDefault("startTime", "").toString();//开始时间
            String endTime = data.getOrDefault("endTime", "").toString();//结束时间
            String statisType = data.getOrDefault("statisType", "天").toString();//统计类型
            String statisColumn = data.getOrDefault("statisColumn", "").toString();//统计字段
            String statisTable = data.getOrDefault("statisTable", "").toString();//统计表格
            String statisColumnType = data.getOrDefault("statisColumnType", "").toString();//统计字段类型，1：字符串，2：date，3：timestamp
            
            //处理统计类型
            int substrLength = 10;
            String datePartten = "yyyy-mm-dd";
            if("月".equals(statisType)){
            	datePartten = "yyyy-mm";
            	substrLength = 7;
            }else if("年".equals(statisType)){
            	datePartten = "yyyy";
            	substrLength = 4;
            }
            
            //默认一个月
            if("".equals(startTime)){
            	Calendar instance = Calendar.getInstance();
            	instance.add(Calendar.YEAR, -1);
            	Date date = instance.getTime();
            	startTime = df.format(date);
            	
            }
            if("".equals(endTime)){
            	endTime = df.format(new Date());
            }
            
            //sql字符串
            String sql = "";
            
            //varchar
            if("1".equals(statisColumnType)){
            	sql = "select count(1) count,substr(\"" + statisColumn + "\",0," + substrLength + ") UPDATETIME1 from \"" + statisTable + "\" where 1=1  ";
                if(!"".equals(startTime)){
                	sql += " and \"" + statisColumn + "\">='" + startTime + "'";
                }
                if(!"".equals(endTime)){
                	sql += " and \"" + statisColumn + "\"<='" + endTime + "'";
                }
                sql += " group by substr(\"" + statisColumn + "\",0," + substrLength + ") order by substr(\"" + statisColumn + "\",0," + substrLength + ") nulls last ";
            }
            
            //date
            if("2".equals(statisColumnType)){
            	sql = "select count(1) count,to_char(\"" + statisColumn + "\",'" + datePartten + "')  UPDATETIME1 from \"" + statisTable + "\" where 1=1 ";
                if(!"".equals(startTime)){
                	sql += " and \"" + statisColumn + "\">=to_date('" + startTime + "','yyyy-mm-dd')";
                }
                if(!"".equals(endTime)){
                	sql += " and \"" + statisColumn + "\"<=to_date('" + endTime + "','yyyy-mm-dd')";
                }
                sql += " group by to_char(\"" + statisColumn + "\",'" + datePartten + "') order by to_char(\"" + statisColumn + "\",'" + datePartten + "') nulls last ";
            }
            
            //to_timestamp
            if("3".equals(statisColumnType)){
            	//拼接字符串
                sql = "select count(1) count,to_char(\"" + statisColumn + "\",'" + datePartten + "')  UPDATETIME1 from \"" + statisTable + "\" where 1=1 ";
                if(!"".equals(startTime)){
                	sql += " and \"" + statisColumn + "\">=to_timestamp('" + startTime + "','yyyy-mm-dd')";
                }
                if(!"".equals(endTime)){
                	sql += " and \"" + statisColumn + "\"<=to_timestamp('" + endTime + "','yyyy-mm-dd')";
                }
                sql += " group by to_char(\"" + statisColumn + "\",'" + datePartten + "')  order by to_char(\"" + statisColumn + "\",'" + datePartten + "')  nulls last ";
            }
            
            List<Map> result = getBySqlMapper.findRecords(sql);
            
            return EdatResult.ok(result);
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取按更新时间统计数据
     */
    @RequestMapping( "createErweima" )
    public EdatResult createErweima(HttpServletRequest request, HttpServletResponse response) {
        try {
        	String urlStr = "http://10.100.244.97/seimp/Qrcode/index.html?metaID=";
        	String fileUrl = urlUtil.geturl() + "";
        	
        	String[] metaIds = {"10", "5", "7", "37", "36", "35", "9", "30", "38", "27", "39",
        			"4", "6", "1", "12", "23", "22", "20", "19", "18", "17", "16", "15", "14", "13",
        			"3", "8", "34", "40", "41" , "42"};
        	for (int i = 0; i < metaIds.length; i++) {
				String metaId = metaIds[i];
				
				ZxingUtil.createZxing(urlStr + metaId, fileUrl + "img/erweima/" + metaId + ".png");
			}
        	
        	return EdatResult.ok("成功");
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 通过ID，获取元数据信息
     */
    @RequestMapping( "getJson" )
    public EdatResult getJson(@RequestBody JSONObject jsonParam) {
        try {
        	System.out.println(jsonParam.toString());
            
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取按更新时间统计数据
     */
    @RequestMapping( "ceshiLog" )
    public EdatResult ceshiLog(HttpServletRequest request, HttpServletResponse response) {
        try {
        	logger.warn("sdsfffff");
        	return EdatResult.ok();
        } catch (Exception e) {
        	e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    
}
