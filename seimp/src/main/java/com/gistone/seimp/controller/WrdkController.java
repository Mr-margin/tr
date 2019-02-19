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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author chendong  
 * @date 2018-05-28 11:21
 * @param   
 * @return  
 * @Description 评估分析污染地块
 */
@RestController
@RequestMapping( "wrdk" )
public class WrdkController {
    @Autowired
    private GetBySqlMapper getBySqlMapper;

    /**
     * @author chendong  
     * @date 2018-05-28 13:56
     * @param   
     * @return  
     * @Description 污染地块的bi比率
     * */
    @RequestMapping("getWrdk")
    public EdatResult getWrdk(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql1 = "";
            if (!"".equals(data.getString("wrdk1"))){
                sql1 += " and PROVINCE_CODE = '"+data.getString("wrdk1")+"'";
            }
            if (!"".equals(data.getString("wrdk2"))){
                sql1 += " and CITY_CODE = '"+data.getString("wrdk2")+"'";
            }
            if (!"".equals(data.getString("wrdk3"))){
                sql1 += " and COUNTRY_CODE = '"+data.getString("wrdk3")+"'";
            }
            if (!"".equals(data.getString("wrdk4"))){
                sql1 += " and WRDKBM = '"+data.getString("wrdk4")+"'";
            }
            if (!"".equals(data.getString("wrdk5"))){
                sql1 += " and WRDKMC like '%"+data.getString("wrdk5")+"%'";
            }
            if (!"".equals(data.getString("wrdk6"))){
                sql1 += " and SCJDBM = '"+data.getString("wrdk6")+"'";
            }
            //总数
            String  sql = "select * from  (select  PROVINCE_CODE,count(*)count from  TB_WRDKJBXXB where POLLUETED ='1' "+sql1+" GROUP BY PROVINCE_CODE ) a left join (" +
                    "select \"code\" code,\"name\" ,\"lat\",\"lon\" from  \"tb_city\" where \"level\" = 0" +
                    ") b on a.PROVINCE_CODE = b.code";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            //SCJDBM 值
            String  sql2 = "select  SCJDBM,PROVINCE_CODE,count(*)count from  TB_WRDKJBXXB where POLLUETED ='1'"+sql1+" GROUP BY PROVINCE_CODE,SCJDBM";
            List<Map> list1 = this.getBySqlMapper.findRecords(sql2);
            Map resultmap = new HashMap();
            resultmap.put("zong",list);
            resultmap.put("fenzi",list1);
            return EdatResult.ok(resultmap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-28 14:01
     * @param   
     * @return  
     * @Description 污染地块点位信息
     */
    @RequestMapping("getWrdklyl")
    public EdatResult getWrdklyl(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql1 = "";
            if ("".equals(data.getString("code"))){
                if (!"".equals(data.getString("wrdk1"))){
                    sql1 += " and PROVINCE_CODE = '"+data.getString("wrdk1")+"'";
                }
                if (!"".equals(data.getString("wrdk2"))){
                    sql1 += " and CITY_CODE = '"+data.getString("wrdk2")+"'";
                }
                if (!"".equals(data.getString("wrdk3"))){
                    sql1 += " and COUNTRY_CODE = '"+data.getString("wrdk3")+"'";
                }
                if (!"".equals(data.getString("wrdk4"))){
                    sql1 += " and WRDKBM = '"+data.getString("wrdk4")+"'";
                }
                if (!"".equals(data.getString("wrdk5"))){
                    sql1 += " and WRDKMC like '%"+data.getString("wrdk5")+"%'";
                }
                if (!"".equals(data.getString("wrdk6"))){
                    sql1 += " and SCJDBM = '"+data.getString("wrdk6")+"'";
                }
            } else {
                sql1 += " and PROVINCE_CODE = '"+data.getString("code")+"'";
            }
            String  sql = "select * from  TB_GBQYJBQK where WRDKBM in(select  WRDKBM from  TB_WRDKJBXXB where POLLUETED ='1' "+sql1+")";
            System.out.println(sql);
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-28 15:55
     * @param   
     * @return  
     * @Description 污染地块表格
     */
    @RequestMapping("getWrdTable")
    public Map getWrdTable(HttpServletRequest request , HttpServletResponse response ) {
        try {
            int pageNum = Integer.parseInt(request.getParameter("pageNumber").toString());
            //获取页面大小
            int pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
            String sql1 = "";
            if (!"".equals(request.getParameter("wrdk1"))){
                sql1 += " and PROVINCE_CODE = '"+request.getParameter("wrdk1")+"'";
            }
            if (!"".equals(request.getParameter("wrdk2"))){
                sql1 += " and CITY_CODE = '"+request.getParameter("wrdk2")+"'";
            }
            if (!"".equals(request.getParameter("wrdk3"))){
                sql1 += " and COUNTRY_CODE = '"+request.getParameter("wrdk3")+"'";
            }
            if (!"".equals(request.getParameter("wrdk4"))){
                sql1 += " and WRDKBM = '"+request.getParameter("wrdk4")+"'";
            }
            if (!"".equals(request.getParameter("wrdk5"))){
                sql1 += " and WRDKMC like '%"+request.getParameter("wrdk5")+"%'";
            }
            if (!"".equals(request.getParameter("wrdk6"))){
                sql1 += " and SCJDBM = '"+request.getParameter("wrdk6")+"'";
            }

            String code= request.getParameter("code");
            String  sql = "select * from (select a.*,ROWNUM RN from TB_GBQYJBQK a where WRDKBM in  (select WRDKBM from  TB_WRDKJBXXB  Where POLLUETED = 1 "+sql1+") ) a left join(" +
                    " select * from  (select WRDKBM ,PROVINCE_CODE,CITY_CODE,COUNTRY_CODE from  TB_WRDKJBXXB  Where POLLUETED = 1)aa left join ( select \"code\" code,\"name\" from \"tb_city\" where " +
                    " \"level\" =0)bb on  aa.PROVINCE_CODE=bb.CODE left join (select \"code\" code1,\"name\" \"name1\" from \"tb_city\" where \"level\" =1 ) cc on aa." +
                    "CITY_CODE = cc.code1 left join (select \"code\" code2,\"name\" \"name2\" from \"tb_city\" where \"level\" =2) dd on aa.COUNTRY_CODE = dd.code2 ) b on  a.WRDKBM = b.WRDKBM" +
                    " where RN > " + pageNum +" and RN <= " + (pageSize+pageNum) + " ";
            System.out.println(sql);
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            String count_sql = "select count(*) count from TB_GBQYJBQK a where WRDKBM in  (select WRDKBM from  TB_WRDKJBXXB  Where POLLUETED = 1 "+sql1+") ";
            int total = this.getBySqlMapper.findrows(count_sql);
            Map resultmap = new HashMap();
            resultmap.put("total", total);
            resultmap.put("rows", list);
            resultmap.put("pageNum", pageNum);
            return resultmap;
        } catch (Exception e) {
            e.printStackTrace();
            Map resultmap = new HashMap();
            resultmap.put("status", 4);
            return resultmap;
        }
    }

    /**
     * @author chendong  
     * @date 2018-05-29 17:14
     * @param   
     * @return  
     * @Description di点击点的详细信息
     * */
    @RequestMapping("getDianMessage")
    public EdatResult getDianMessage(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3,4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String wrdkbm = data.getString("wrdkbm");
            String whe = " POLLUETED ='1' ";
            if ( data.has("yisi")){
                whe = "POLLUETED is null ";
            }
            String  sql = "select * from (select WRDKBM bm ,WRDKMC,SCJDBM,FXJB,PROVINCE_CODE,CITY_CODE,COUNTRY_CODE from TB_WRDKJBXXB where "+whe+"  and WRDKBM ='"+wrdkbm+"') a left join " +
                    "(select * from TB_GBQYJBQK where  WRDKBM ='"+wrdkbm+"') b on a.bm = b.WRDKBM ";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-30 16:17
     * @param   
     * @return  
     * @Description 建设项目环评分析
     */
    @RequestMapping("getJchpfx")
    public EdatResult getJchpfx(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String xmin = data.getString("xmin");
            String xmax = data.getString("xmax");
            String ymin = data.getString("ymin");
            String ymax = data.getString( "ymax");
            String type = data.getString( "type");
            String  cha_sql = "";
            if (!"".equals(type)){
                cha_sql = " and EIAMANAGENAME = '"+type+"'";
            }
            String tiaojian = "('B','B9','B91','B911','B912','B913','B914','B915','B916','B919','B92','B921','B922','B32','B321','B321','B3212','B3213','B3214','B3215','B3216','B3217','B3219','B322','B3221','B3222','B323'" +
                    ",'B3231','B3232','B7','B71','B711','B712','C','C25','C251','C2511','C2512','C252','C2520','C26','C261','C2611','C2612','C2613','C2614','C2619','C263','C2631','C263','C264','C2641','C2642'" +
                    ",'C2643','C2644','C2645','C265','C2651','C2652','C266','C2661','C2662','C2664','C2669','C267','C2671','C2672','C27','C271','C2710','C28','C281','C2811','C2812','C282','C2822','C2823','C2826','C2829'" +
                    ",'C33','C336','C3360','C19','C191','C1910','C193','C1931')";
            String  sql = "select CONSTRUCTIONID,  PROJECTNAME,eiamanagename,LAT2,LON2 from  YZ_CONS where to_number(LON2) >= "+xmin+" and to_number(LON2) <= "+xmax+" and to_number(LAT2) >= "+ymin+" and to_number(LAT2)<="+ymax+" "+cha_sql+" and  NATIONALECONOMYCODE in"+tiaojian;
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-06-15 9:52
     * @param   
     * @return  
     * @Description 建设项目环评分析详细信息
     */
    @RequestMapping("getJchpfxMessage")
    public EdatResult getJchpfxMessage(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String constructionId = data.getString("constructionId");
            String  sql = "select * from  YZ_CONS where CONSTRUCTIONID='"+constructionId+"' ";
            return EdatResult.ok(this.getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * @author chendong  
     * @date 2018-06-15 9:52
     * @param   
     * @return  
     * @Description 建设项目环评分析详细信息
     */
    @RequestMapping("getJchpfxMessage1")
    public EdatResult getJchpfxMessage1(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String constructionId = data.getString("constructionId");
            String  sql = "select * from  YZ_CONS_HOUSE where CONSTRUCTIONID='"+constructionId+"' ";
            return EdatResult.ok(this.getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @author chendong  
     * @date 2018-06-14 15:36
     * @param   
     * @return  
     * @Description 建设项目环评分析行业类型
     */
    @RequestMapping("getJchpfxType")
    public EdatResult getJchpfxType (HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String  sql = "select EIAMANAGENAME from  YZ_CONS where EIAMANAGENAME is not null  GROUP BY EIAMANAGENAME";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("erw")
    public EdatResult erw(HttpServletRequest request,HttpServletResponse response ) {
        try {

            String  sql = " select CONSTRUCTIONID,LONGITUDE,LATITUDE,LON,LAT from YZ_CONS  where LONGITUDE is not null and LATITUDE is not null and LAT is null and LON is null";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            for (int i = 0 ;i <list.size(); i ++ ){
                Map map = list.get(i);
                if (isNumericzidai(map.get("LONGITUDE").toString())) {
                    if(isNumericzidai(map.get("LATITUDE").toString())){
                        String  cha_sql = "update YZ_CONS set LON="+map.get("LONGITUDE").toString()+" , LAT="+map.get("LATITUDE").toString()+" where CONSTRUCTIONID ='"+map.get("CONSTRUCTIONID").toString()+"' ";
                        this.getBySqlMapper.update(cha_sql);
                    }
                }

            }
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    public static boolean isNumericzidai (String str) {
        Pattern pattern = Pattern.compile("-?[0-9]+.?[0-9]+");
        Matcher isNum= pattern.matcher(str);
        if (!isNum.matches()){
            return false;
        }
        return true;
    }
    /**
     * @author chendong  
     * @date 2018-06-07 10:54
     * @param   
     * @return  
     * @Description 评估分析-污染地块安全利用预警 仪表盘数据
     */
    @RequestMapping("shouyeTjt")
    public EdatResult shouyeTjt(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String zongSql = "select sum(count(*)) zong from  TB_WRDKJBXXB where POLLUETED ='1' GROUP BY PROVINCE_CODE";
            String fenziSql = "select sum(COUNT) from  (select  SCJDBM,PROVINCE_CODE,count(*)count from  TB_WRDKJBXXB where POLLUETED ='1' GROUP BY PROVINCE_CODE,SCJDBM) where SCJDBM !='S1' and SCJDBM!='S2' and SCJDBM!='S3'";
            double fenzi = this.getBySqlMapper.findrows("select sum(COUNT) from  (select  SCJDBM,PROVINCE_CODE,count(*)count from  TB_WRDKJBXXB where POLLUETED ='1' GROUP BY PROVINCE_CODE,SCJDBM) where SCJDBM !='S1' and SCJDBM!='S2' and SCJDBM!='S3'");
            double fenmu = this.getBySqlMapper.findrows("select sum(count(*)) zong from  TB_WRDKJBXXB where POLLUETED ='1' GROUP BY PROVINCE_CODE");
//            System.out.println(fenzi);
//            System.out.println(fenmu);
            double num = (fenzi/fenmu)*100;
//            System.out.println(Math.round(num));
//            System.out.println(Math.floor(num));
            Map map = new HashMap();
            map.put("num",Math.round(num));
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


}

