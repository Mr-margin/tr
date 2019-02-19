package com.gistone.seimp.controller;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;
import jxl.Sheet;
import jxl.read.biff.BiffException;
import net.sf.json.JSONObject;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * @author chendong  
 * @date 2018-04-17 14:52
 * @param   
 * @return  
 * @Description 淘汰落后产能企业
 */
@RestController
@RequestMapping( "eliminate" )
public class EliminateController {
    @Autowired
    private GetBySqlMapper getBySqlMapper;
    
    /**
     * @author chendong  
     * @date 2018-04-17 14:59
     * @param   
     * @return  
     * @Description 查询淘汰落后产能企业
     */
    @RequestMapping("getSelectEliminate")
    public Map getSelectEliminate( HttpServletRequest request, HttpServletResponse response ) {
        int pageNum = Integer.parseInt(request.getParameter("pageNumber").toString());
        //获取页面大小
        int pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
        String  sql1 = "where 1=1 ";
        if ( request.getParameter("province") != "" && request.getParameter("province")!=null){
            sql1 = sql1 + " and PROVINCE = '"+request.getParameter("province").trim().replace("省","").replace("市","")+"' ";
        }
        if ( request.getParameter("city") != "" && request.getParameter("city")!=null){
            sql1 = sql1 + " and CITY = '"+request.getParameter("city").trim()+"' ";
        }
        if ( request.getParameter("industry") != "" && request.getParameter("industry")!=null){
            sql1 = sql1 + " and INDUSTRY = '"+request.getParameter("industry").trim()+"' ";
        }
        if ( request.getParameter("enterprise") != "" && request.getParameter("enterprise")!=null){
            sql1 = sql1 + " and ENTERPRISE like '%"+request.getParameter("enterprise").trim()+"%' ";
        }
        if ( request.getParameter("county") != "" && request.getParameter("county")!=null){
            sql1 = sql1 + " and COUNTY like '%"+request.getParameter("county").trim()+"%' ";
        }
        String sql = "select * from  (select PROVINCE,CITY,COUNTY,INDUSTRY,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS,ENTERPRISE,ROWNUM RN FROM ELIMINATE_BACKWARD " +sql1+
                " ) where RN > " + pageNum +" and RN <= " + (pageSize+pageNum) + " ";
        String sql_count = "select count(*) count FROM ELIMINATE_BACKWARD " +sql1;
        List<Map> list = getBySqlMapper.findRecords(sql);
        int total = this.getBySqlMapper.findrows(sql_count);
        Map resultmap = new HashMap();
        resultmap.put("total", total);
        resultmap.put("rows", list);
        resultmap.put("pageNum", pageNum);
        return resultmap;
    }
    /**
     * @author chendong  
     * @date 2018-04-18 14:01
     * @param   
     * @return  
     * @Description 查找市
     */
    @RequestMapping("getCity")
    public EdatResult getCity(HttpServletResponse response ,HttpServletRequest request ) {
        try {
//            net.sf.json.JSONArray jsonArray = net.sf.json.JSONArray.fromObject(request.getPart("dta"));
            JSONObject obj = JSONObject.fromObject(request.getParameter("data").toString());
            String sql = "select \"name\",\"code\" from  \"tb_city\"  where \"parent_id\" = (select \"id\" from  \"tb_city\"  where \"name\" like '%"+obj.getString("province")+"%' and \"level\" = 0) and \"level\" = 1";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            Map res = new HashMap();
            res.put("result", list);
            return  EdatResult.ok(res);
        } catch ( Exception e ){
            return EdatResult.build(1, "查询错误");
        }
    }
    /**
     * @author chendong  
     * @date 2018-04-18 14:14
     * @param   
     * @return  
     * @Description 查找县
     */
    @RequestMapping("getCounty")
    public EdatResult getCounty( HttpServletRequest request, HttpServletResponse response ) {
        try {
            JSONObject obj = JSONObject.fromObject(request.getParameter("data").toString());
            String sql = "select \"name\",\"code\" from  \"tb_city\"  where \"parent_id\" = (select \"id\" from  \"tb_city\"  where \"name\" like '%"+obj.getString("city")+"%' and \"level\" = 1) and \"level\" = 2";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            Map res = new HashMap();
            res.put("result", list);
            return  EdatResult.ok(res);
        } catch ( Exception e ){
            return EdatResult.build(1, "查询错误");
        }
    }
    /**
     * @author chendong  
     * @date 2018-04-18 14:18
     * @param   
     * @return  
     * @Description 行业类别
     */
    @RequestMapping("getIndustry")
    public EdatResult getIndustry(HttpServletRequest request,HttpServletResponse response ) {
        try {
            String sql = "select INDUSTRY from  ELIMINATE_BACKWARD GROUP BY INDUSTRY";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            Map res = new HashMap();
            res.put("result", list);
            return  EdatResult.ok(res);
        } catch ( Exception e ){
            return EdatResult.build(1, "查询错误");
        }
    }
    /**
     * @author chendong  
     * @date 2018-04-18 16:03
     * @param   
     * @return  
     * @Description 统计图
     */
    @RequestMapping("getEcharts")
    public  EdatResult getEcharts(HttpServletRequest request,HttpServletResponse response ) {
        try{
            String  sql1 = "select INDUSTRY ,count(*) count from  ELIMINATE_BACKWARD GROUP BY INDUSTRY  ORDER BY count desc";
            String  sql2 = "select ELIMINATION_TIME,count(*) count from  ELIMINATE_BACKWARD GROUP BY ELIMINATION_TIME";
            List<Map> list1 = this.getBySqlMapper.findRecords(sql1);
            List<Map> list2 = this.getBySqlMapper.findRecords(sql2);
            Map res = new HashMap();
            res.put("bar", list1);
            res.put("line", list2);
            return  EdatResult.ok(res);
        } catch (Exception e){
            return EdatResult.build(1, "查询错误");
        }
    }
    /**
     * @author chendong  
     * @date 2018-04-17 14:56
     * @param   
     * @return  
     * @Description 导入数据
     */
    @RequestMapping( "importExcel" )
    public EdatResult importExcel(HttpServletRequest request, HttpServletResponse response) {
        File file = new File("C://Users//Administrator//Desktop//工信部淘汰落后产能企业2009-2018规整数据.xls");
        Date date = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        try {
            //创建输入流
            InputStream is = new FileInputStream(file.getAbsolutePath());
            //jxl提供的workbook类
            try {
                jxl.Workbook wb = jxl.Workbook.getWorkbook(is);
                //Excel的页签数量
                int sheet_size= wb.getNumberOfSheets();
                for ( int index = 0 ; index < sheet_size; index ++ ) {
                    //每个页签创建一个sheet对象
                    Sheet sheet = wb.getSheet(index);
                    //sheet.getRow()返回该页面的总行数
                    for(int i = 1 ; i < sheet.getRows(); i ++ ) {
                        //该页面的总列数
                        String  str1 =  sheet.getCell(1, i).getContents();//省份
                        String str2=  sheet.getCell(2, i).getContents();//市区
                        String str3 =  sheet.getCell(3, i).getContents();//县区
                        String str4=  sheet.getCell(4, i).getContents();//行业
                        String str5=  sheet.getCell(5, i).getContents().replaceAll(" ","" );//企业名称
                        String str6=  sheet.getCell(11, i).getContents();//经度
                        String str7=  sheet.getCell(12, i).getContents();//纬度
                        String str8=  sheet.getCell(8, i).getContents();//产能
                        String str9=  sheet.getCell(9, i).getContents();//淘汰时间
                        String str10=  sheet.getCell(10, i).getContents();//备注

                        String sql = "insert into  ELIMINATE_BACKWARD (PROVINCE,CITY,COUNTY,INDUSTRY,ENTERPRISE,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS," +
                                "IMPORT_TIME,IMPORT_PERSON) values ('"+str1+"','"+str2+"','"+str3+"','"+str4+"','"+str5+"','"+str6+"','"+str7+"','"+str8+"'" +
                                ",'"+str9+"','"+str10+"','"+sdf.format(date)+"','陈东')";
                        this.getBySqlMapper.insert(sql);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            } catch (BiffException e) {
                e.printStackTrace();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * @author chendong  
     * @date 2018-05-07 10:48
     * @param   
     * @return  
     * @Description 修复舆情分类汇总 污染类型
     */
    @RequestMapping("getXfyqIndustry")
     public EdatResult getXfyq1Industry(HttpServletRequest request,HttpServletResponse response ) {
        try{
            String  sql1 = "Select WJJS from YQ_DETAIL where WJJS is not null GROUP BY WJJS";
            String  sql2 = "select YJXM from  YQ_DETAIL where YJXM is not null group by YJXM\n";
            List<Map> list1 = this.getBySqlMapper.findRecords(sql1);
            List<Map> list2 = this.getBySqlMapper.findRecords(sql2);
            Map res = new HashMap();
            res.put("WJJS", list1);
            res.put("YJXM", list2);
            return  EdatResult.ok(res);
        } catch (Exception e){
            return EdatResult.build(1, "查询错误");
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-07 10:50
     * @param   
     * @return  
     * @Description 修复舆情分类汇总列表
     */
    @RequestMapping("getSelectXfyq")
    public Map getSelectXfyq( HttpServletRequest request, HttpServletResponse response ) {
        int pageNum = Integer.parseInt(request.getParameter("pageNumber").toString());
        //获取页面大小
        int pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
        String  sql1 = "where 1=1 ";
        if ( request.getParameter("province") != "" && request.getParameter("province")!=null){
            sql1 = sql1 + " and PROVINCE = '"+request.getParameter("province").trim().replace("省","").replace("市","")+"' ";
        }
        if ( request.getParameter("city") != "" && request.getParameter("city")!=null){
            sql1 = sql1 + " and CITY = '"+request.getParameter("city").trim()+"' ";
        }
        if ( request.getParameter("county") != "" && request.getParameter("county")!=null){
            sql1 = sql1 + " and XIAN = '"+request.getParameter("industry").trim()+"' ";
        }
        if ( request.getParameter("wjjs") != "" && request.getParameter("wjjs")!=null){
            sql1 = sql1 + " and WJJS = '"+request.getParameter("wjjs").trim()+"' ";
        }
        if ( request.getParameter("wjwrcd") != "" && request.getParameter("wjwrcd")!=null){
            sql1 = sql1 + " and WJWRCD like '"+request.getParameter("wjwrcd").trim()+"' ";
        }
        String sql = "select * from (SELECT  PROVINCE,CITY,XIAN,COUNTY,LON,LAT,INVOLVEENTERPRICE,WJJS,WJWRCD,YJXM,YJWRCD,POLLUTEDAREA,SAMPLETIME," +
                "TITLE,SOURCE,PUBLISHTIME,BZ,ROWNUM RN FROM (select PROVINCE,CITY,XIAN,COUNTY,LON,LAT,INVOLVEENTERPRICE,YQID,WJJS,WJWRCD,YJXM,YJWRCD," +
                "POLLUTEDAREA,SAMPLETIME FROM YQ_DETAIL "+sql1+")A  LEFT JOIN (SELECT TITLE,ID,SOURCE,PUBLISHTIME,BZ FROM YQ_BASEINFO) B ON A.YQID=B.ID" +
                " ) where RN > " + pageNum +" and RN <= " + (pageSize+pageNum) + " ";

        String sql_count = "SELECT count(*) count FROM (select PROVINCE,CITY,XIAN,COUNTY,LON,LAT,INVOLVEENTERPRICE,YQID,WJJS,WJWRCD,YJXM,YJWRCD," +
                "POLLUTEDAREA,SAMPLETIME FROM YQ_DETAIL "+sql1+")A LEFT JOIN (SELECT TITLE,ID,SOURCE,PUBLISHTIME,BZ FROM YQ_BASEINFO) B ON A.YQID=B.ID";
        List<Map> list = getBySqlMapper.findRecords(sql);
        int total = this.getBySqlMapper.findrows(sql_count);
        Map resultmap = new HashMap();
        resultmap.put("total", total);
        resultmap.put("rows", list);
        resultmap.put("pageNum", pageNum);
        return resultmap;
    }
    /**
     * @author chendong  
     * @date 2018-05-07 15:29
     * @param   
     * @return  
     * @Description 舆情文献 地图数据
     */
    @RequestMapping("getYqwx")
     public EdatResult getYqwx(HttpServletRequest request,HttpServletResponse response ) {
         try {
             ClientUtil.SetCharsetAndHeader(request, response);
             int status = Check.CheckRight(request, "4");
             if (status != 0) {
                 return EdatResult.build(status, "");
             }
             JSONObject data = JSONObject.fromObject(request.getParameter("data"));
             String industry ="";
             if ( !"".equals(data.getString("industry"))){
                 industry = " and WJJS = '"+data.getString("industry")+"'";
             }
             String industry1 = "";
             String industry2 = "";
             String industry3 = "";
             String endTime = "";
             if (!"".equals(data.getString("industry1"))){
                 industry1 = " and WJWRCD = '"+data.getString("industry1")+"'";
             }
             if (!"".equals(data.getString("industry2"))){
                 industry2 = " and YJXM = '"+data.getString("industry2")+"'";
             }
             if (!"".equals(data.getString("industry3"))){
                 industry3 = " and YJWRCD = '"+data.getString("industry3")+"'";
             }
             if (!"".equals(data.getString("endTime"))){
                 endTime = " and to_number(SAMPLETIME) <= "+data.getInt("endTime");
             }
             String startTime = "";
             if ( !"".equals(data.getString("startTime")) ) {
                 startTime = " and to_number(SAMPLETIME) >= "+data.getInt("startTime");
             }
             String type = data.getString("type");

             String city ="";
             String city_name="";
             String sql1 = "";
             if ( "1".equals(type)){
                 city = "PROVINCE";
                 city_name = "province";
             } else if ("2".equals(type)){
                 city = "CITY";
                 city_name = "city";
                 sql1 = " and PROVINCE = '"+data.getString("name")+"'";
             } else if ("3".equals(type)){
                 city = "XIAN";
                 city_name = "code";
                 sql1 = " and CITY = '"+data.getString("name")+"'";
             }
             String table = "YQ_DETAIL";
             if (startTime != "" || endTime != "" ) {
                 table = "(select * from  YQ_DETAIL where LENGTH(SAMPLETIME) =4)";

             }
             String sql = "select "+city+" \"city\",count(*) \"count\" from "+table+" where 1=1 "+industry+" and "+city+" is not" +
                     " null  "+sql1+" "+industry1+" "+industry2+" "+industry3+startTime+endTime+" GROUP BY "+city+"";

             System.out.println(sql);
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            List<Map> tian_list = new ArrayList<>();
            if ( list.size() > 0 ) {
                for ( int i = 0 ; i < list.size() ; i ++ ) {

                    Map map = list.get(i);
                    String cha_sql = "select \"name\",\"code\",\"lat\",\"lon\" from \"tb_city\" where \"level\" = "+(Integer.parseInt(type)-1)+" and \"name\" like '"+map.get("city")+"%' ";
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                    if ( cha_list.size() > 0 ) {
                        Map map1 = new HashMap();
                        map1.put("name",cha_list.get(0).get("name").toString());
                        map1.put(city_name,cha_list.get(0).get("code").toString());
                        map1.put("count",map.get("count").toString());
                        map1.put("lat",cha_list.get(0).get("lat").toString());
                        map1.put("lon",cha_list.get(0).get("lon").toString());
                        tian_list.add(map1);
                    }
                }
            }
             return EdatResult.ok(tian_list);
         } catch (Exception e) {
             e.printStackTrace();
             return EdatResult.build(1, "fail");
         }
     }
     /**
      * @author chendong  
      * @date 2018-05-07 15:28
      * @param   
      * @return  
      * @Description 舆情文献表格
      */
     @RequestMapping("getYqwxtable")
     public EdatResult getYqwxtable(HttpServletRequest request , HttpServletResponse response ) {
         try {
             ClientUtil.SetCharsetAndHeader(request, response);
             int status = Check.CheckRight(request, "4");
             if (status != 0) {
                 return EdatResult.build(status, "");
             }
             JSONObject data = JSONObject.fromObject(request.getParameter("data"));
             String industry = "";
             if ( !"".equals(data.getString("industry"))){
                 industry = " and WJJS = '"+data.getString("industry")+"'";
             }
             String industry1 = "";
             String industry2 = "";
             String industry3 = "";
             String endTime = "";
             if (!"".equals(data.getString("industry1"))){
                 industry1 = " and WJWRCD = '"+data.getString("industry1")+"'";
             }
             if (!"".equals(data.getString("industry2"))){
                 industry2 = " and YJXM = '"+data.getString("industry2")+"'";
             }
             if (!"".equals(data.getString("industry3"))){
                 industry3 = " and YJWRCD = '"+data.getString("industry3")+"'";
             }
             if (!"".equals(data.getString("endTime"))){
                 endTime = " and to_number(SAMPLETIME) <= "+data.getInt("endTime");
             }
             String startTime = "";
             if ( !"".equals(data.getString("startTime")) ) {
                 startTime = " and to_number(SAMPLETIME) >= "+data.getInt("startTime");
             }
             String type = data.getString("type");
             String city ="";
             String sql1 = "";
             if ( "1".equals(type)) {
                 city = "PROVINCE";
             } else if ("2".equals(type)) {
                 city = "CITY";
                 sql1 = " and PROVINCE = '"+data.getString("name")+"'";
             } else if ("3".equals(type)) {
                 city = "XIAN";
                 sql1 = " and CITY = '"+data.getString("name")+"'";
             }
             String table = "YQ_DETAIL";
             if (startTime != "" || endTime != "" ) {
                 table = "(select * from  YQ_DETAIL where LENGTH(SAMPLETIME) =4)";

             }
             String  sql = "select PROVINCE,CITY,XIAN,COUNTY,LON,LAT,INVOLVEENTERPRICE,YQID,WJJS,WJWRCD,YJXM,YJWRCD,POLLUTEDAREA," +
                     "SAMPLETIME FROM "+table+" WHERE 1= 1 and "+city+" is not null"+industry1+industry2+industry3+sql1+industry+startTime+endTime;
             List<Map> list = this.getBySqlMapper.findRecords(sql);
             return EdatResult.ok(list);
         } catch (Exception e) {
             e.printStackTrace();
             return EdatResult.build(1, "fail");
         }
     }
     /**
      * @author chendong  
      * @date 2018-05-11 13:52
      * @param   
      * @return  
      * @Description 舆情文献详情
      */
     @RequestMapping("getYqwxMessage")
     public EdatResult getYqwxMessage(HttpServletRequest request,HttpServletResponse response ) {
         try {
             ClientUtil.SetCharsetAndHeader(request, response);
             int status = Check.CheckRight(request, "4");
             if (status != 0) {
                 return EdatResult.build(status, "");
             }
             JSONObject data = JSONObject.fromObject(request.getParameter("data"));
             String industry = "";
             if ( !"".equals(data.getString("industry"))){
                 industry = " and WJJS = '"+data.getString("industry")+"'";
             }
             String startTime = "";
             if (!"".equals(data.getString("startTime"))) {
                 startTime = " and SAMPLETIME = '"+data.getString("startTime")+"'";
             }
             String  sql = "select * from  YQ_BASEINFO where ID in (Select YQID from  YQ_DETAIL where 1=1 and XIAN = '"+data.getString("name")+"' " +
                     " "+industry+" "+startTime+")";
             List<Map> list = this.getBySqlMapper.findRecords(sql);
             return EdatResult.ok(list);
         } catch (Exception e) {
             e.printStackTrace();
             return EdatResult.build(1, "fail");
         }
     }
    /**
     * @author chendong  
     * @date 2018-05-18 14:00
     * @param   
     * @return  
     * @Description 排污许可列表
     */
     @RequestMapping("getPaiwu")
     public Map getPaiwu(HttpServletRequest request,HttpServletResponse response ) {
         int pageNum = Integer.parseInt(request.getParameter("pageNumber").toString());
         //获取页面大小
         int pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
         String sql1 = "";
         if (!"".equals(request.getParameter("zxtype"))){
             sql1 += " and ZXTYPE = '"+request.getParameter("zxtype")+"'";
         }
         if (!"".equals(request.getParameter("istype"))){
             sql1 += " and ISTYPE = "+request.getParameter("istype");
         }
         if (!"".equals(request.getParameter("unitname"))){
             sql1 += " and UNITNAME like '%"+request.getParameter("unitName")+"%'";
         }
         if (!"".equals(request.getParameter("xkznumber"))){
             sql1 += " and XKZNUMBER like '%"+request.getParameter("xkznumber")+"%'";
         }
         String sql = "select * from (select a.*, ROWNUM RN from ENTERPRICE_UNDOINFO a where 1=1 "+sql1+") where RN > " + pageNum +" and RN <= " + (pageSize+pageNum) + " ";

         String sql_count = "SELECT count(*) count FROM ENTERPRICE_UNDOINFO where 1=1 " +sql1;
         List<Map> list = getBySqlMapper.findRecords(sql);
         int total = this.getBySqlMapper.findrows(sql_count);
         Map resultmap = new HashMap();
         resultmap.put("total", total);
         resultmap.put("rows", list);
         resultmap.put("pageNum", pageNum);
         return resultmap;
     }
    /**
     * @author chendong  
     * @date 2018-05-18 13:47
     * @param   
     * @return  
     * @Description xu许可类型
     * */
    @RequestMapping("getXkType")
     public EdatResult getXkType( HttpServletRequest request, HttpServletResponse response ) {
         try {
             ClientUtil.SetCharsetAndHeader(request, response);
             int status = Check.CheckRight(request, "4");
             if (status != 0) {
                 return EdatResult.build(status, "");
             }
             String  sql = "select ZXTYPE from ENTERPRICE_UNDOINFO GROUP BY ZXTYPE";
             List<Map> list = this.getBySqlMapper.findRecords(sql);
             return EdatResult.ok(list);
         } catch (Exception e) {
             e.printStackTrace();
             return EdatResult.build(1, "fail");
         }
     }
     @RequestMapping("getQyjb")
     public Map getQyjb(HttpServletRequest request , HttpServletResponse response ) {
         int pageNum = Integer.parseInt(request.getParameter("pageNumber").toString());
         //获取页面大小
         int pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
            String sql1 = "";
            if ( !"".equals(request.getParameter("XKZNUM"))) {
                sql1 += " and XKZNUM like '%"+request.getParameter("XKZNUM")+"%' ";
            }
            if ( !"".equals(request.getParameter("DEVCOMPANY"))) {
                sql1 += " and DEVCOMPANY like '%"+request.getParameter("DEVCOMPANY")+"%' ";
            }
            if ( !"".equals(request.getParameter("HYNAME"))){
                sql1 += " and HYNAME = '"+request.getParameter("HYNAME")+"' ";
            }
            if ( !"".equals(request.getParameter("ISSHORTPERMIT"))) {
                sql1 += " and ISSHORTPERMIT = '"+request.getParameter("ISSHORTPERMIT")+"' ";
            }
            if (!"".equals(request.getParameter("ISPARK"))) {
                sql1 += " and ISPARK='"+request.getParameter("ISPARK")+"' ";
            }
            if ( !"".equals(request.getParameter("ITEMTYPE"))) {
                sql1 += " and ITEMTYPE ='"+request.getParameter("ITEMTYPE")+"'";
            }

         String sql = "select * from (select a.*, ROWNUM RN from ENTERPRICE_BASEINFO a where 1=1 "+sql1+") where RN > " + pageNum +" and RN <= " + (pageSize+pageNum) + " ";

         String sql_count = "SELECT count(*) count FROM ENTERPRICE_BASEINFO where 1=1 "+sql1;
         List<Map> list = getBySqlMapper.findRecords(sql);
         int total = this.getBySqlMapper.findrows(sql_count);
         Map resultmap = new HashMap();
         resultmap.put("total", total);
         resultmap.put("rows", list);
         resultmap.put("pageNum", pageNum);
         return resultmap;
     }
    /**
     * @author chendong  
     * @date 2018-05-18 18:20
     * @param   
     * @return  
     * @Description 企业基本信息行业类型
     */
    @RequestMapping("getYqjbType")
     public EdatResult getYqjbType ( HttpServletRequest request , HttpServletResponse response ) {
         try {
             ClientUtil.SetCharsetAndHeader(request, response);
             int status = Check.CheckRight(request, "4");
             if (status != 0) {
                 return EdatResult.build(status, "");
             }
             String  sql = "select HYNAME from  ENTERPRICE_BASEINFO  GROUP BY HYNAME";
             List<Map> list = this.getBySqlMapper.findRecords(sql);
             return EdatResult.ok(list);
         } catch (Exception e) {
             e.printStackTrace();
             return EdatResult.build(1, "fail");
         }
     }
}
