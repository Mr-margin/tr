package com.gistone.seimp.controller;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author chendong
 * @date 2018-06-01 10:37
 * @param
 * @return
 * @Description 一张图模块
*/
@RestController
@RequestMapping( "yizhangtu" )
public class YizhangtuController {

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    /**
     * @author chendong
     * @date 2018-06-01 11:57
     * @param
     * @return
     * @Description 点击网格数据
     */
    @RequestMapping("getWangge")
    public EdatResult getWangge(HttpServletRequest request, HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String  xmin = data.getString("xmin");
            String  xmax = data.getString("xmax");
            String ymin = data.getString("ymin");
            String ymax = data.getString("ymax");
            //
            String sql = "select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", " + "\"LONGITUDE\"," +
                    " \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\", \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", " +
                    "\"SURVEY_STATUS\", " + "\"SURVEY_PROGRESS\", \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", " + "\"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", " +
                    "\"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where TO_NUMBER(LONGITUDE) >" + xmin + " and TO_NUMBER(LONGITUDE) <=" + xmax + " and " + " " +
                    "TO_NUMBER(LATITUDE) >" + ymin + " and TO_NUMBER(LATITUDE) <=" + ymax + "";
            String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" + "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" + "危险废物处理处置')";
            sql += " and   \"DALEI\" in " + str + "";
            List<Map> list = this.getBySqlMapper.findRecords(sql);

            String  sql1= "select * from (Select * from  TB_WRDKJBXXB where POLLUETED=1 and DELETE_TSAMP is null)a left join ( select * from  TB_GBQYJBQK)b  on a.WRDKBM = b.WRDKBM where " +
                    "to_number(WRDKZXJD) >= "+xmin+" and to_number(WRDKZXJD)<="+xmax+" and to_number(WRDKZXWD) >= "+ymin+" and to_number(WRDKZXWD)<="+ymax+"";
            List<Map> list1 = this.getBySqlMapper.findRecords(sql1);

            String  sql2= "select * from (Select * from  TB_WRDKJBXXB where POLLUETED is null and DELETE_TSAMP is null)a left join ( select * from  TB_GBQYJBQK)b  on a.WRDKBM = b.WRDKBM where " +
                    "to_number(WRDKZXJD) >= "+xmin+" and to_number(WRDKZXJD)<="+xmax+" and to_number(WRDKZXWD) >= "+ymin+" and to_number(WRDKZXWD)<="+ymax+"";
            List<Map> list2 = this.getBySqlMapper.findRecords(sql2);

            Map map = new HashMap();
            map.put("qiyeData",list);
            map.put("wrdk",list1);
            map.put("yisiwrdk",list2);
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    } 
    /**
     * @author chendong
     * @date 2018-06-04 10:20
     * @param
     * @return
     * @Description 污染地块省市县的数据（地图加表格）-专题图  POLLUETED：null-疑似污染地块，0-非污染地块，1-污染地块
     */
    @RequestMapping("wrdkCount")
    public EdatResult wrdkCount(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String dkbm = data.getString("dkbm");//地块编码
            String[] arrayWrdkSQL = getWrdkSQL(data,userLevel,regionCode);
            String wh = " POLLUETED = 1";
            if (data.has("yisi")){
                wh = " POLLUETED is null";
            } else {
                if (!"".equals(dkbm)){
                	arrayWrdkSQL[0] += " and WRDKBM ='"+dkbm+"' ";
                }
            }
            String sql = " select * from ( select "+arrayWrdkSQL[1]+" code1,count(*) count  from TB_WRDKJBXXB where "+wh+"  "+arrayWrdkSQL[0]+"  and DELETE_TSAMP is null GROUP BY "+arrayWrdkSQL[1]+")a left join " +
                    "(select \"name\",\"code\",\"lon\",\"lat\" from  \"tb_city\") b on  a.code1 = b.\"code\" ORDER BY A.count DESC";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("wrdkDetail")
    public EdatResult wrdkDetail(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String dkbm = data.getString("dkbm");//地块编码
            String[] arrayWrdkSQL = getWrdkSQL(data,userLevel,regionCode);
            String wh = " POLLUETED = 1"; // null-疑似污染地块，0-非污染地块，1-污染地块
            if (data.has("yisi")){
                wh = " POLLUETED is null";
            } else {
                if (!"".equals(dkbm)){
                	arrayWrdkSQL[0] += " and WRDKBM ='"+dkbm+"' ";
                }
            }
            String sql = " select * from ( select "+arrayWrdkSQL[1]+" code1,count(*) count  from TB_WRDKJBXXB where "+wh+"  "+arrayWrdkSQL[0]+"  and DELETE_TSAMP is null GROUP BY "+arrayWrdkSQL[1]+")a left join " +
                    "(select \"name\",\"code\",\"lon\",\"lat\" from  \"tb_city\") b on  a.code1 = b.\"code\" ORDER BY a.COUNT DESC";
            
            String sql_nearlyOneMonth = "select COUNT(*) AS nearlyOneMonth from TB_WRDKJBXXB where TSAMP > TO_CHAR(sysdate-30,'yyyy/mm/dd hh:mm:ss') and" + wh + arrayWrdkSQL[0];   
	        
            
            String sql_scjdbm = "SELECT COUNT(*) count1,scjdbm FROM  TB_WRDKJBXXB GROUP BY scjdbm"; // 按字段scjdbm分组查询
	        
            String sql_wrdkzs = "SELECT COUNT(*) count FROM TB_WRDKJBXXB where " + wh +" and DELETE_TSAMP is null "+ arrayWrdkSQL[0]; // 污染地块总数
            // "select count(*) count from TB_WRDKJBXXB tbw left join TB_GBQYJBQK tbg on  tbw.WRDKBM = tbg.WRDKBM where tbw." + wh.trim() +" and tbw." + arrayWrdkSQL[1].trim()" +" = " ;
            String sql_yst = "";
            if (arrayWrdkSQL[0] != "") {
            	sql_yst = "select count(*) count from TB_WRDKJBXXB tbw left join TB_GBQYJBQK tbg on  tbw.WRDKBM = tbg.WRDKBM where tbw." + wh.trim() +" and tbw." + arrayWrdkSQL[0].trim().substring(4) +
            			" AND tbg.wrdkzxjd IS NOT NULL AND tbg.wrdkzxwd IS NOT NULL AND tbw.DELETE_TSAMP IS NULL";
            } else {
            	sql_yst = "select count(*) count from TB_WRDKJBXXB tbw left join TB_GBQYJBQK tbg on  tbw.WRDKBM = tbg.WRDKBM where tbw." + wh.trim() +
            			" AND tbg.wrdkzxjd IS NOT NULL AND tbg.wrdkzxwd IS NOT NULL AND tbw.DELETE_TSAMP IS NULL";
            }
            
            //sql_yst = "SELECT sum(count) count from(" + sql + ") where \"lon\" is not null"; // 已上图
            List<Map> resultList = getBySqlMapper.findRecords(sql);
	        List<Map> resultList1 = getBySqlMapper.findRecords(sql_nearlyOneMonth);
	        List<Map> resultList2 = getBySqlMapper.findRecords(sql_scjdbm);
	        List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_wrdkzs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", resultList);
	        resultMap.put("nearlyMonth", resultList1); // 最近一月
	        resultMap.put("scjdbm", resultList2);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("wrdkzs", resultList4); // 污染地块总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 获取污染地块查询sql数组
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getWrdkSQL (JSONObject data,int userLevel,String regionCode) {
    	String[] sqlArray = new String[2];
        String sheng = data.getString("sheng");//省
        String shi = data.getString("shi");//市
        String  xian = data.getString("xian");//县
        String  scjd = data.getString("scjd");//所处阶段
        String dkbm = data.getString("dkbm");//地块编码
        String  sql1 = "";
        String  sql2 =" PROVINCE_CODE";
        if (!"".equals(sheng)){
            if ( userLevel == 2  ){
                if( regionCode.equals(sheng)){
                    sql1 += " and PROVINCE_CODE ='"+sheng+"'";
                    sql2 = " CITY_CODE ";
                } else {
                    sql1 += " and PROVINCE_CODE ='"+regionCode+"'";
                    sql2 = " CITY_CODE ";
                }
            } else {
                sql1 += " and PROVINCE_CODE ='"+sheng+"'";
                sql2 = " CITY_CODE ";
            }
        } else {
            if ( userLevel == 2 ) {
                sql1 += " and PROVINCE_CODE ='"+regionCode+"'";
                sql2 = " CITY_CODE ";
            }
        }
        if (!"".equals(shi)){
            sql1 += " and CITY_CODE ='"+shi+"'";
            sql2 = " COUNTRY_CODE";
        }
        if(!"".equals(xian)){
            sql1 += " and COUNTRY_CODE ='"+xian+"' ";
            sql2 = " COUNTRY_CODE";
        }
        if (!"".equals(scjd)){
            sql1 += " and SCJDBM ='"+scjd+"' ";
        }
        sqlArray[0] = sql1;
        sqlArray[1] = sql2;
    	return sqlArray;
    }
    /**
     * @author chendong
     * @date 2018-06-04 17:14
     * @param
     * @return
     * @Description 污染地块点位信息-分布图
     */
    @RequestMapping("xianDian")
    public EdatResult xianDian(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  sql1 = "";

            if (data.has("sheng")){
                if( !"".equals(data.getString("sheng"))){
                    if ( userLevel == 2 ) {
                        sql1 += " and PROVINCE_CODE="+regionCode;
                    } else {
                        sql1 += " and PROVINCE_CODE="+data.getString("sheng");
                    }
                } else {
                    if(userLevel == 2 ) {
                        sql1 += " and PROVINCE_CODE="+regionCode;
                    }
                }
            } else {
                if(userLevel == 2 ) {
                    sql1 += " and PROVINCE_CODE="+regionCode;
                }
            }
            if ( data.has("shi")){
                if( !"".equals(data.getString("shi"))){
                    sql1+=" and CITY_CODE="+data.getString("shi");
                }
            }
            if( data.has("xian")){
                if(!"".equals(data.getString("xian"))){
                    sql1+=" and COUNTRY_CODE="+data.getString("xian");
                }
            }
            if(data.has("code")){
                if(!"".equals(data.getString("code")))
                sql1 = "and COUNTRY_CODE = '"+data.getString("code")+"'";
            }
            if(data.has("scjd")){
                if (!"".equals(data.getString("scjd"))){
                    sql1 += " and SCJDBM ='"+data.getString("scjd")+"' ";
                }
            }
            if(data.has("dkbm")){
                if (!"".equals(data.getString("dkbm"))){
                    sql1 += " and WRDKBM ='"+data.getString("dkbm")+"' ";
                }
            }
            if(data.has("dkmc")){
                if (!"".equals(data.getString("dkmc"))){
                    sql1 += " and WRDKMC like '%"+data.getString("dkmc")+"%' ";
                }
            }
            if ( data.has("fxjb")){
                if( !"".equals(data.getString("fxjb"))){
                    sql1 +=" and FXJB='"+data.getString("fxjb")+"' ";
                }
            }
            String whe = " POLLUETED = 1" ;
            if ( data.has("yisi")){
                whe = "  POLLUETED is null";
            }
            String sql = "select  a.WRDKBM,WRDKZXJD,WRDKZXWD,WRDKMC,SCJDBM from (select * from  TB_WRDKJBXXB where "+whe+" "+sql1+"  and DELETE_TSAMP is null) a " +
                    "left join (select WRDKBM,WRDKZXJD,WRDKZXWD from  TB_GBQYJBQK)b on  a.WRDKBM = b.WRDKBM where WRDKZXJD is not null and WRDKZXWD is not null";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-05 15:02
     * @param
     * @return
     * @Description 污染地块查询条件-专题图
     */
    @RequestMapping("wrdkTiaojian")
    public EdatResult wrdkTiaojian(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String sheng = data.getString("sheng");//省
            String shi = data.getString("shi");//市
            String  xian = data.getString("xian");//县
            String  scjd = data.getString("scjd");//所处阶段
            String dkbm = data.getString("dkbm");//地块编码
            String  sql1 = "";
            String  sql2 =" PROVINCE_CODE";
            if (!"".equals(sheng)){
                sql1 += " and PROVINCE_CODE ='"+sheng+"'";
                sql2 = " PROVINCE_CODE ";
            }
            if (!"".equals(shi)){
                sql1 += " and CITY_CODE ='"+shi+"'";
                sql2 = " CITY_CODE";
            }
            if(!"".equals(xian)){
                sql1 += " and COUNTRY_CODE ='"+xian+"' ";
                sql2 = " COUNTRY_CODE";
            }
            if (!"".equals(scjd)){
                sql1 += " and SCJDBM ='"+scjd+"' ";
            }
            if (!"".equals(dkbm)){
                sql1 += " and WRDKBM ='"+dkbm+"' ";
            }
            if ( data.has("fxjb")){
                if( !"".equals(data.getString("fxjb"))){
                    sql1 +=" and FXJB='"+data.getString("fxjb")+"' ";
                }
            }
            if(data.has("dkmc")){
                if (!"".equals(data.getString("dkmc"))){
                    sql1 += " and WRDKMC like '%"+data.getString("dkmc")+"%' ";
                }
            }
            String whe = " POLLUETED = 1 ";
            if (data.has("yisi")){
                whe = " POLLUETED is null  ";
            }
            String sql = " select * from ( select "+sql2+" code1,count(*) count  from TB_WRDKJBXXB where "+whe+" "+sql1+"  and DELETE_TSAMP is null GROUP BY "+sql2+" )a left join " +
                    "(select \"name\",\"code\",\"lon\",\"lat\" from  \"tb_city\") b on  a.code1 = b.\"code\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-06 10:06
     * @param
     * @return
     * @Description 遥感核查-专题图
     */
    @RequestMapping("getZhongdianhy")
    public EdatResult getZhongdianhy(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getZdhySQL(data,userLevel,regionCode);
            String sql = "select * from  (select "+sqlArray[1]+" city,count(*) count from \"tb_wurandikuai_yaoganhecha\" where 1=1 "+sqlArray[0]+" group by "+sqlArray[1]+")a left join " +
                    "(select \"code\",\"name\",\"lat\",\"lon\" from  \"tb_city\" where \"level\" = "+sqlArray[2]+") b on a.city = b.\"name\" ORDER BY A.count DESC";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 遥感核查-专题图 详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("getZhongdianhyDetail")
    public EdatResult getZhongdianhyDetail(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getZdhySQL(data,userLevel,regionCode);
            String sql = "select * from  (select "+sqlArray[1]+" city,count(*) count from \"tb_wurandikuai_yaoganhecha\" where 1=1 "+sqlArray[0]+" group by "+sqlArray[1]+")a left join " +
                    "(select \"code\",\"name\",\"lat\",\"lon\" from  \"tb_city\" where \"level\" = "+sqlArray[2]+") b on a.city = b.\"name\" ORDER BY A.count DESC";
            String sql_zs = "select sum(count) count from  (select "+sqlArray[1]+" city,count(*) count from \"tb_wurandikuai_yaoganhecha\" where 1=1 "+sqlArray[0]+" group by "+sqlArray[1]+")a left join " +
                    "(select \"code\",\"name\",\"lat\",\"lon\" from  \"tb_city\" where \"level\" = "+sqlArray[2]+") b on a.city = b.\"name\" ORDER BY A.count DESC";
            String sql_yst = "select count(*) count from \"tb_wurandikuai_yaoganhecha\"  where lon2 is not null and lat2 is not null " + sqlArray[0]; 
            List<Map> resultList = getBySqlMapper.findRecords(sql);
	        List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_zs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", resultList);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("zdhyzs", resultList4); // 污染地块总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    /**
     * 获取 遥感核查-专题图查询条件
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getZdhySQL(JSONObject data,int userLevel,String regionCode){
    	String level = "0"; // 数据级别 （0：省，1：市，2：县）
        String sheng = data.getString("sheng");//省
        String shi = data.getString("shi");//市
        String  xian = data.getString("xian");//县
        String  dalei = data.getString("dalei");//行业大类别
        String  production = data.getString("production");//是否生产
        String  sql1 = "";
        String  sql2 =" SHENG";
        if (!"".equals(sheng)){
            if(userLevel == 2 ) {
                String  name = this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString();
                sql1 += " and SHENG like '%"+name+"%'";
                sql2 = " SHI ";
                level = "1";
            } else {
                sql1 += " and SHENG like '%"+sheng+"%'";
                sql2 = " SHI ";// 
                level = "1";
            }

        } else {
            if( userLevel == 2 ) {
                sql1 += " and SHENG like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString()+"%'";
                sql2 = " SHI ";
                level = "1";
            }
        }
        if (!"".equals(shi)){
            sql1 += " and SHI like '%"+shi+"%'";
            sql2 = " XIAN";
            level = "2";
        }
        if(!"".equals(xian)){
            sql1 += " and XIAN like'%"+xian+"%' ";
            sql2 = " XIAN";
            level = "2";
        }
        if (!"".equals(dalei)){
            sql1 += " and DALEI ='"+dalei+"' ";
        }
        if (!"".equals(production)){
            sql1 += " and PRODUCTION ='"+production+"' ";
        }
        String[] arraySql = new String[3];
        arraySql[0] = sql1;
        arraySql[1] = sql2;
        arraySql[2] = level;
        return arraySql;
    }
    /**
     * @author chendong
     * @date 2018-06-06 11:36
     * @param
     * @return
     * @Description 遥感核查详细信息-分布图
     */
    @RequestMapping("yghcDelei")
    public EdatResult yghcDelei(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql1 = "";
            if ( data.has("sheng")){
                if ( !"".equals(data.getString("sheng"))){
                    if ( userLevel == 2 ) {
                        sql1 += " and SHENG = '"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString()+"'";
                    } else {
                        sql1 += " and SHENG = '"+data.getString("sheng")+"'";
                    }
                } else {
                    if( userLevel == 2 ){
                        sql1 += " and SHENG = '"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString()+"'";
                    }
                }
            } else {
                if( userLevel == 2 ){
                    sql1 += " and SHENG = '"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString()+"'";
                }
            }
            if( data.has("shi")){
                if( !"".equals(data.getString("shi"))){
                    sql1 += "and SHI = '"+data.getString("shi")+"'";
                }
            }
            if( data.has("xian")){
                if(!"".equals(data.getString("xian"))){
                    sql1 += " and XIAN ='"+data.getString("xain")+"'";
                }
            }
            if ( data.has("code")){
                if ( !"".equals(data.getString("code"))){
                    sql1 += " and DISTRICT_CODE = '"+data.getString("code")+"'";
                }
            }
            if( data.has("dalei")){
                if(!"".equals(data.getString("dalei"))){
                    sql1 += " and DALEI = '"+data.getString("dalei")+"'";
                }
            }
            if( data.has("production")){
                if(!"".equals(data.getString("production"))){
                    sql1 += " and PRODUCTION ='"+data.getString("production")+"'";
                }
            }
            String sql = "select OID,BIANHAO,NAME,LONGITUDE,LATITUDE from \"tb_wurandikuai_yaoganhecha\" WHERE 1=1 "+sql1+"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-07-18 10:16
     * @param   
     * @return  
     * @Description 重点监管企业遥感核查详细信息
     */
    @RequestMapping("yghcDeleiDian")
    public EdatResult yghcDeleiDian(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
           String id = data.getString("id");
            String sql = "select OID,NAME,DALEI,BIANHAO,LONGITUDE,LATITUDE,ADRESS,LAIYUAN,DALEI,BIEMIN,BIANHAO,GUIMO from \"tb_wurandikuai_yaoganhecha\" WHERE 1=1 and OID ='"+id+"'";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-06 11:37
     * @param
     * @return
     * @Description 遥感核查条件查询
     */
    @RequestMapping("yaoganTiaojian")
    public EdatResult yaoganTiaojian(HttpServletRequest request,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            int level = 0;
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String sheng = data.getString("sheng");//省
            String shi = data.getString("shi");//市
            String  xian = data.getString("xian");//县
            String  dalei = data.getString("dalei");//行业大类别
            String  production = data.getString("production");//是否生产
            String  sql1 = "";
            String  sql2 =" SHENG";
            if (!"".equals(sheng)){
                sql1 += " and SHENG like '%"+sheng+"%'";
                sql2 = " SHENG ";
            }
            if (!"".equals(shi)){
                sql1 += " and SHI like '%"+shi+"%'";
                sql2 = " SHI";
                level = 1;
            }
            if(!"".equals(xian)){
                sql1 += " and XIAN like'%"+xian+"%' ";
                sql2 = " XIAN";
                level = 2;
            }
            if (!"".equals(dalei)){
                sql1 += " and DALEI ='"+dalei+"' ";
            }
            if (!"".equals(production)){
                sql1 += " and PRODUCTION ='"+production+"' ";
            }
            String sql = "select * from  (select "+sql2+" city,count(*) count from \"tb_wurandikuai_yaoganhecha\" where 1=1 "+sql1+" group by "+sql2+")a left join " +
                    "(select \"code\",\"name\",\"lat\",\"lon\" from  \"tb_city\" where \"level\"="+level+") b on a.city = b.\"name\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-14 14:06
     * @param
     * @return
     * @Description 尾矿库(绿网)-专题图
     */
    @RequestMapping("lwwkk")
    public EdatResult lwwkk(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getSqllwwkk(data,userLevel,regionCode);
            List<Map> result = new ArrayList<>();
            List<Map> list= this.getBySqlMapper.findRecords(sqlArray[0]);
            if (list.size()>0){
                for (Map map : list) {
                    Map map1 = new HashMap();
                    String cha_sql =  "select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"name\" like '"+map.get("CITY")+"%' and \"level\" = "+sqlArray[1];
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                    map1.put("code",cha_list.get(0).get("code"));
                    map1.put("lat",cha_list.get(0).get("lat"));
                    map1.put("lon",cha_list.get(0).get("lon"));
                    map1.put("name",cha_list.get(0).get("name"));
                    map1.put("COUNT",map.get("COUNT"));
                    map1.put("CITY",map.get("CITY"));
                    result.add(map1);
                }

            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 绿网尾矿库详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("lwwkkDetail")
    public EdatResult lwwkkDetail(HttpServletRequest request,HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getSqllwwkk(data,userLevel,regionCode);
            List<Map> result = new ArrayList<>();
            List<Map> list= this.getBySqlMapper.findRecords(sqlArray[0]);
            String sql_yst = "select count(*) count from TB_TAILINGS where lon2 is not null and lat2 is not null " + sqlArray[2];
            List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
            //BigDecimal yst = new BigDecimal(0);// 已上图，tb_city中经纬度不为空
            if (list.size()>0){
                for (Map map : list) {
                    Map map1 = new HashMap();
                    String cha_sql =  "select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"name\" like '%"+map.get("CITY")+"%' and \"level\" = "+sqlArray[1];
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                    map1.put("code",cha_list.get(0).get("code"));
                    map1.put("lat",cha_list.get(0).get("lat"));
                    map1.put("lon",cha_list.get(0).get("lon"));
                    /*if (cha_list.get(0).get("lon") != null) {
                    	yst = yst.add((BigDecimal) map.get("COUNT"));
                    }*/
                    map1.put("name",cha_list.get(0).get("name"));
                    map1.put("COUNT",map.get("COUNT"));
                    map1.put("CITY",map.get("CITY"));
                    result.add(map1);
                }
            }
            String sql_lwwkkzs = "SELECT sum(COUNT) count FROM(" +sqlArray[0] +")"; // 污染地块总数
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_lwwkkzs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", result);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("lwwkkzs", resultList4); // 尾矿库绿网总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    /**
     * 获得绿网尾矿库查询sql
     * @return    public String[] getpaiwuxuke(JSONObject data,int userLevel,String regionCode) {
     */
    public String[] getSqllwwkk(JSONObject data,int userLevel,String regionCode){
    	 String[] arraySql = new String[3];
    	 String sheng = data.getString("sheng");//省
         String shi = data.getString("shi");//市
         String  xian = data.getString("xian");//县
         String  sql1 = "";
         String  sql2 =" PROVINCENAME";
         String num ="0";
         boolean ss = false;
         if(data.has("str")){
             ss =true;
         }
         if (!"".equals(sheng)){
             if ( userLevel == 2 ) {
                 sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
             } else {
                 sql1 += " and PROVINCENAME like '%"+sheng.replace("省","").replace("市","").replace("自治区","")+"%'";
             }
             if(ss ){
                 sql2 = " PROVINCENAME ";
                 num = "0";
                 if ("".equals(shi) && "".equals(xian)) {
                 	sql2 = " CITYNAME ";
                 	num = "1";
                 }
                 
             } else {
                 sql2 = " CITYNAME ";
                 num = "1";
             }

         } else {
             if( userLevel == 2 ) {
                 sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                 if(ss ){
                     sql2 = " PROVINCENAME ";
                     
                     num = "0";
                 } else {
                     sql2 = " CITYNAME ";
                     num = "1";
                 }
             }
         }
         if (!"".equals(shi)){
             sql1 += " and CITYNAME like '%"+shi.replace("市","")+"%'";
             /*if(ss ){
                 sql2 = " CITYNAME ";
                 num = "1";
             } else {
                 sql2 = " DISTRICTNAME";
                 num = "2";
             }*/
             sql2 = " DISTRICTNAME";
             num = "2";
         }
         if(!"".equals(xian)){
             sql1 += " and DISTRICTNAME like'%"+xian+"%' ";
             sql2 = " DISTRICTNAME";
             num = "2";
         }
         if(data.has("tailingsname")){//尾矿库名称
             if(!"".equals(data.getString("tailingsname"))){
                 sql1 += " and TAILINGSNAME like '%"+data.getString("tailingsname")+"%'";
             }
         }
         if(data.has("pollutetype")){//污染类型
             if(!"".equals(data.getString("pollutetype"))){
                 sql1 += " and  POLLUTETYPE ='"+data.getString("pollutetype")+"'";
             }
         }
         String sql = "select "+sql2+" city,count(*) count from  TB_TAILINGS where PROVINCENAME is not null "+sql1+" group by "+sql2 + " ORDER BY count DESC";
         
         arraySql[0] = sql;
         arraySql[1] = num;
         arraySql[2] = sql1;
         return arraySql;
    }
    
    
    
    /**
     * @author chendong
     * @date 2018-06-27 16:10
     * @param
     * @return
     * @Description 尾矿库污染类型
     */
    @RequestMapping("weikuangkuType")
    public EdatResult weikuangkuType(HttpServletRequest request,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
           String  sql  = " select POLLUTETYPE from  TB_TAILINGS  where POLLUTETYPE is not null  GROUP BY POLLUTETYPE ";
            return EdatResult.ok(this.getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("huanpingqiyeName")
    public EdatResult huanpingqiyeName(HttpServletRequest request,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
           String  sql  = " select EIAMANAGENAME from  YZ_CONS  where EIAMANAGENAME is not null  GROUP BY EIAMANAGENAME";
           return EdatResult.ok(this.getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("guominjingjiName")
    public EdatResult guominjingjiName(HttpServletRequest request,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
           String  sql  = " select NATIONALECONOMYNAME from  YZ_CONS  where NATIONALECONOMYNAME is not null  GROUP BY NATIONALECONOMYNAME";
           return EdatResult.ok(this.getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-14 14:21
     * @param
     * @return
     * @Description  尾矿库（绿网）-分布图
     */
    @RequestMapping("lwwkkMessage")
    public EdatResult lwwkkMessage(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  sql1 = "";
            if(data.has("sheng")){
                if (!"".equals(data.getString("sheng"))){
                    if(userLevel == 2 ) {
                        sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                    } else {
                        sql1 += " and PROVINCENAME like '%"+data.getString("sheng").replace("省","").replace("市","").replace("自治区","")+"%'";
                    }
                } else {
                    sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";

                }
            } else {
                if ( userLevel == 2 ) {
                    sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                }
            }
            if(data.has("shi")){
                if (!"".equals(data.getString("shi"))){
                    sql1 += " and CITYNAME like '%"+data.getString("shi").replace("市","")+"%'";
                }
            }

            if(data.has("xian")){
                if(!"".equals(data.getString("xian"))){
                    sql1 += " and DISTRICTNAME like'%"+data.getString("xian")+"%' ";
                }
            }
            if(data.has("tailingsname")){//尾矿库名称
                if(!"".equals(data.getString("tailingsname"))){
                    sql1 += " and TAILINGSNAME like '%"+data.getString("tailingsname")+"%'";
                }
            }
            if(data.has("pollutetype")){//污染类型
                if(!"".equals(data.getString("pollutetype"))){
                    sql1 += " and  POLLUTETYPE ='"+data.getString("pollutetype")+"'";
                }
            }

            String sql = "select ID,TAILINGSNAME ,COORDINATE ,MINERALTYPE,ENTERPRISENAME,DETAILEDADDRESS,POLLUTETYPE,RISK from  TB_TAILINGS where COORDINATE is not null "+sql1+" ";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-08-31 11:43
     * @param   
     * @return  
     * @Description 尾矿库详细信息
     */
    @RequestMapping("weikuangkuMessage")
    public EdatResult weikuangkuMessage(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  id = data.getString("id");

            String sql = "select * from  TB_TAILINGS where ID ="+id;
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-19 15:18
     * @param
     * @return
     * @Description 一张图-淘汰落后产能企业-专题图
     */
    @RequestMapping("getEliminate")
    public EdatResult getEliminate(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getEliminateSql(data,userLevel,regionCode);
            String sql = "select "+sqlArray[1]+" city,count(*) count from  ELIMINATE_BACKWARD where CITY is not null "+sqlArray[0]+" group by "+sqlArray[1] + " ORDER BY COUNT DESC";
            List<Map> result = new ArrayList<>();
            List<Map> list= this.getBySqlMapper.findRecords(sql);
            if (list.size()>0){
                for (Map map : list) {
                    Map map1 = new HashMap();
                    String cha_sql =  "select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"name\" like '"+map.get("CITY")+"%' and \"level\" = "+sqlArray[2];
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                    if( cha_list.size() > 0 ){
                        map1.put("code",cha_list.get(0).get("code"));
                        map1.put("lat",cha_list.get(0).get("lat"));
                        map1.put("lon",cha_list.get(0).get("lon"));
                        map1.put("name",cha_list.get(0).get("name"));
                        map1.put("COUNT",map.get("COUNT"));
                        map1.put("CITY",map.get("CITY"));
                        result.add(map1);
                    }
                }
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 获取淘汰落后产能详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("getEliminateDetail")
    public EdatResult getEliminateDetail(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getEliminateSql(data,userLevel,regionCode);
            String sql = "select "+sqlArray[1]+" city,count(*) count from  ELIMINATE_BACKWARD where CITY is not null "+sqlArray[0]+" group by "+sqlArray[1] + " ORDER BY COUNT DESC";
            String sql_zs = "SELECT sum(count) count FROM(" + sql + ")"; // 总数
            //BigDecimal yst = new BigDecimal(0);// 已上图，tb_city中经纬度不为空
            String sql_yst = "select count(*) count from ELIMINATE_BACKWARD where lon is not null and lat is not null " + sqlArray[0];
            List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
            List<Map> result = new ArrayList<>();
            List<Map> list= this.getBySqlMapper.findRecords(sql);
            if (list.size()>0){
                for (Map map : list) {
                    Map map1 = new HashMap();
                    String cha_sql =  "select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"name\" like '"+map.get("CITY")+"%' and \"level\" = "+sqlArray[2];
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                    if( cha_list.size() > 0 ){
                        map1.put("code",cha_list.get(0).get("code"));
                        map1.put("lat",cha_list.get(0).get("lat"));
                        map1.put("lon",cha_list.get(0).get("lon"));
                        /*if (cha_list.get(0).get("lon") != null) {
                        	yst = yst.add((BigDecimal) map.get("COUNT"));
                        }*/
                        map1.put("name",cha_list.get(0).get("name"));
                        map1.put("COUNT",map.get("COUNT"));
                        map1.put("CITY",map.get("CITY"));
                        result.add(map1);
                    }
                }
            }
            List<Map> resultList = getBySqlMapper.findRecords(sql);
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_zs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", result);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("zs", resultList4); // 污染地块总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 获取淘汰落后产能查询sql
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getEliminateSql(JSONObject data,int userLevel,String regionCode) {
    	 String sheng = data.getString("sheng");//省
         String shi = data.getString("shi");//市
         String  xian = data.getString("xian");//县
         boolean ss = false;
         if(data.has("str")){
             ss = true;
         }
         String  sql1 = "";
         String  sql2 =" PROVINCE";
         String num ="0";
         if (!"".equals(sheng)){
             if ( userLevel == 2 ) {
                 sql1 += " and PROVINCE like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
             } else {
                 sql1 += " and PROVINCE like '%"+sheng.replace("省","").replace("市","").replace("自治区","")+"%'";
             }
             /*if(ss){
                 sql2 = " PROVINCE ";
                 num = "0";
             } else {
                 sql2 = " CITY ";
                 num = "1";
             }*/
             sql2 = " CITY ";
             num = "1";
         } else {
             if ( userLevel ==2 ) {
                 sql1 += " and PROVINCE like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                 /*if(ss){
                     sql2 = " PROVINCE ";
                     num = "0";
                 } else {
                     sql2 = " CITY ";
                     num = "1";
                 }*/
                 sql2 = " CITY ";
                 num = "1";
             }
         }
         if (!"".equals(shi)){
             sql1 += " and CITY like '%"+shi.replace("市","")+"%'";
            /* if(ss){
                 sql2 = " CITY ";
                 num = "1";
             } else {
                 sql2 = " COUNTY";
                 num = "2";
             }*/
             sql2 = " COUNTY";
             num = "2";
         }
         if(!"".equals(xian)){
             sql1 += " and COUNTY like'%"+xian+"%' ";
             sql2 = " COUNTY";
             num = "2";
         }
         if(data.has("enterprise")){//企业名称
             if(!"".equals(data.getString("enterprise"))){
                 sql1 += " and ENTERPRISE like '%"+data.getString("enterprise")+"%'";
             }
         }
         if(data.has("industry")){//行业
             if(!"".equals(data.getString("industry"))){
                 sql1 += " and INDUSTRY like '%"+data.getString("industry")+"%'";
             }
         }
         String[] sqlArray = new String[3];
         sqlArray[0] = sql1;
         sqlArray[1] = sql2;
         sqlArray[2] = num;
         return sqlArray;
    }
    
    /**
     * @author chendong
     * @date 2018-06-27 17:46
     * @param
     * @return
     * @Description  淘汰落后产能企业-行业类型
     */
    @RequestMapping("eliminateType")
    public EdatResult eliminateType(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }

            String sql = " select INDUSTRY from  ELIMINATE_BACKWARD GROUP BY INDUSTRY ";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-19 15:39
     * @param
     * @return
     * @Description  淘汰落后产能企业详细信息-分布图
     */
    @RequestMapping("getEliminateMessage")
    public EdatResult getEliminateMessage(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  sql1 = "";
            if ( data.has("name")){
                sql1 = " and COUNTY = '"+data.getString("name").replace("县","")+"' ";
            }
            if(data.has("sheng")){
                if (!"".equals(data.getString("sheng"))){
                    if( userLevel == 2 ) {
                        sql1 += " and PROVINCE like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                    } else {
                        sql1 += " and PROVINCE like '%"+data.getString("sheng").replace("省","").replace("市","").replace("自治区","")+"%'";
                    }
                } else {
                    if(userLevel == 2 ){
                        sql1 += " and PROVINCE like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                    }
                }
            } else {
                if(userLevel == 2 ){
                    sql1 += " and PROVINCE like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("市","").replace("自治区","")+"%'";
                }
            }
            if(data.has("shi")){
                if (!"".equals(data.getString("shi"))){
                    sql1 += " and CITY like '%"+data.getString("shi").replace("市","")+"%'";
                }
            }
            if(data.has("xian")){
                if(!"".equals(data.getString("xian"))){
                    sql1 += " and DISTRICT like'%"+data.getString("xian")+"%' ";
                }
            }
            if(data.has("enterprise")){//企业名称
                if(!"".equals(data.getString("enterprise"))){
                    sql1 += " and ENTERPRISE like '%"+data.getString("enterprise")+"%'";
                }
            }
            if(data.has("industry")){//行业
                if(!"".equals(data.getString("industry"))){
                    sql1 += " and INDUSTRY like '%"+data.getString("industry")+"%'";
                }
            }
            String sql = "select ELID,INDUSTRY,ENTERPRISE,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS,CAPACITY from  ELIMINATE_BACKWARD" +
                    " where  LON is not null and LAT is not null  "+sql1+" ";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-07-18 10:34
     * @param   
     * @return  
     * @Description 淘汰落后产能企业点位详细信息
     */
    @RequestMapping("getEliminateDianMessage")
    public EdatResult getEliminateDianMessage(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String id = data.getString("id");
//            String sql = "select ELID,PROVINCE,CITY,COUNTY,INDUSTRY,ENTERPRISE,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS,CAPACITY from  ELIMINATE_BACKWARD" +
//                    " where PROVINCE is not  null and CITY is not null and COUNTY is not  null and LON is not null and LAT is not null and ELID ='"+id+"'";
            String sql = "select ELID,PROVINCE,CITY,COUNTY,INDUSTRY,ENTERPRISE,LON,LAT,CAPACITY,ELIMINATION_TIME,REMARKS,CAPACITY from  ELIMINATE_BACKWARD" +
                    " where  ELID ='"+id+"'";
            
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-25 15:57
     * @param
     * @return
     * @Description 根据省份定位
     */
    @RequestMapping("cityLonLat")
    public EdatResult cityLonLat(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String  code = data.getString("code");
            String  sql1 = "";
            String sql = "select * from  \"tb_city\" where \"code\" = '"+code+"' ";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-26 14:30
     * @param
     * @return
     * @Description 建设项目环评-专题图
     */
    @RequestMapping("jsxmhpCount")
    public EdatResult jsxmhpCount(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getjsxmhpSQL(data,userLevel,regionCode);
            String sql = "select PROVINCENAME,count(*) count from YZ_CONS where PROVINCENAME is not null"+
            		" and NATIONALECONOMYCODE in "+sqlArray[1]+" "+sqlArray[0]+" group by PROVINCENAME"+
            		" ORDER BY count DESC";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            List<Map> result = new ArrayList<>();
            for(int i = 0 ;i<list.size();i++ ){
                Map map = list.get(i);
                Map map1 = new HashMap();
                if ( !map.get("PROVINCENAME").toString().contains("、")){
                    String cha = "select * from  \"tb_city\" where \"level\" ='0' and  \"name\" like '%"+map.get("PROVINCENAME").toString()+"%'";
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha);
                    if ( cha_list.size() > 0 ){
                        map1.put("code",cha_list.get(0).get("code"));
                        map1.put("lat",cha_list.get(0).get("lat"));
                        map1.put("lon",cha_list.get(0).get("lon"));
                        map1.put("name",cha_list.get(0).get("name"));
                        map1.put("COUNT",map.get("COUNT"));
                        map1.put("CITY",map.get("PROVINCENAME"));
                        result.add(map1);
                    }
                }
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 建设环评详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("jsxmhpDetail")
    public EdatResult jsxmhpDetail(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getjsxmhpSQL(data,userLevel,regionCode);
            String sql = "select PROVINCENAME,count(*) count from YZ_CONS where PROVINCENAME is not null and NATIONALECONOMYCODE in "+sqlArray[1]+" "+sqlArray[0]+" group by PROVINCENAME ORDER BY count DESC";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            List<Map> result = new ArrayList<>();
            BigDecimal yst = new BigDecimal(0);// 已上图，tb_city中经纬度不为空
            for(int i = 0 ;i<list.size();i++ ){
                Map map = list.get(i);
                Map map1 = new HashMap();
                if ( !map.get("PROVINCENAME").toString().contains("、")){
                    String cha = "select * from  \"tb_city\" where \"level\" ='0' and  \"name\" like '%"+map.get("PROVINCENAME").toString()+"%'";
                    List<Map> cha_list = this.getBySqlMapper.findRecords(cha);
                    if ( cha_list.size() > 0 ){
                        map1.put("code",cha_list.get(0).get("code"));
                        map1.put("lat",cha_list.get(0).get("lat"));
                        map1.put("lon",cha_list.get(0).get("lon"));
                        map1.put("name",cha_list.get(0).get("name"));
                        map1.put("COUNT",map.get("COUNT"));
                        map1.put("CITY",map.get("PROVINCENAME"));
                        if (cha_list.get(0).get("lon") != null) {
                        	yst = yst.add((BigDecimal) map.get("COUNT"));
                        }
                        result.add(map1);
                    }
                }
            }
            String sql_zs = "select sum(count) count from("+sql+")";
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_zs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", result);
	        resultMap.put("yst", yst); // 已上图
	        resultMap.put("zs", resultList4); // 尾矿库绿网总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取建设环评查询条件
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getjsxmhpSQL(JSONObject data,int userLevel,String regionCode){
    	String sql1 = "";
        if( data.has("sheng")){
            if ( !"".equals(data.getString("sheng"))){
                if( userLevel == 2 ) {
                    sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("自治区","")+"%'";

                } else {
                    sql1 += " and PROVINCENAME like '%"+data.getString("sheng").replace("省","").replace("自治区","")+"%'";
                }
            } else {
                if(userLevel == 2 ) {
                    sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("自治区","")+"%'";
                }
            }
        } else {
            if(userLevel == 2 ) {
                sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("自治区","")+"%'";
            }
        }
        if ( data.has("sjly")){
            if( !"".equals(data.getString("sjly"))){
                sql1 += " and DATASOURCE ='"+data.getString("sjly")+"' ";
            }
        }
        if ( data.has("hphymc")){
            if( !"".equals(data.getString("hphymc"))){
                sql1 += " and EIAMANAGENAME ='"+data.getString("hphymc")+"' ";
            }
        }
        if ( data.has("gmjjmc")){
            if( !"".equals(data.getString("gmjjmc"))){
                sql1 += " and NATIONALECONOMYNAME ='"+data.getString("gmjjmc")+"' ";
            }
        }
        if ( data.has("slrqq")){
            if( !"".equals(data.getString("slrqq"))){
                sql1 += " and ACCEPTANCEDATE >= '"+data.getOrDefault("slrqq","").toString()+"' ";
            }
        }
        if ( data.has("slrqz")){
            if( !"".equals(data.getString("slrqz"))){
                sql1 += " and ACCEPTANCEDATE <= '"+data.getOrDefault("slrqz","").toString()+"' ";
            }
        }
        String tiaojian = "('B','B9','B91','B911','B912','B913','B914','B915','B916','B919','B92','B921','B922','B32','B321','B321','B3212','B3213','B3214','B3215','B3216','B3217','B3219','B322','B3221','B3222','B323'" +
                ",'B3231','B3232','B7','B71','B711','B712','C','C25','C251','C2511','C2512','C252','C2520','C26','C261','C2611','C2612','C2613','C2614','C2619','C263','C2631','C263','C264','C2641','C2642'" +
                ",'C2643','C2644','C2645','C265','C2651','C2652','C266','C2661','C2662','C2664','C2669','C267','C2671','C2672','C27','C271','C2710','C28','C281','C2811','C2812','C282','C2822','C2823','C2826','C2829'" +
                ",'C33','C336','C3360','C19','C191','C1910','C193','C1931')";
        String[] sqlArray = new String[2];
        sqlArray[0] = sql1;
        sqlArray[1] = tiaojian;
        return sqlArray;
    }
    
    
    /**
     * @author chendong
     * @date 2018-06-26 15:29
     * @param
     * @return
     * @Description 建设项目环评-分布图
     */
    @RequestMapping("getjiansheMessage")
    public EdatResult getjiansheMessage(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql1 = "";
            if( data.has("sheng")){
                if ( !"".equals(data.getString("sheng"))){
                    if( userLevel == 2 ) {
                        sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("自治区","")+"%'";

                    } else {
                        sql1 += " and PROVINCENAME like '%"+data.getString("sheng").replace("省","").replace("自治区","")+"%'";
                    }
                } else {
                    if(userLevel == 2 ) {
                        sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("自治区","")+"%'";
                    }
                }
            } else {
                if(userLevel == 2 ) {
                    sql1 += " and PROVINCENAME like '%"+this.getBySqlMapper.findRecords("select \"name\" from \"tb_city\" where \"code\" ='"+regionCode+"'").get(0).get("name").toString().replace("省","").replace("自治区","")+"%'";
                }
            }
            if ( data.has("sjly")){
                if( !"".equals(data.getString("sjly"))){
                    sql1 += " and DATASOURCE ='"+data.getString("sjly")+"' ";
                }
            }
            String tiaojian = "('B','B9','B91','B911','B912','B913','B914','B915','B916','B919','B92','B921','B922','B32','B321','B321','B3212','B3213','B3214','B3215','B3216','B3217','B3219','B322','B3221','B3222','B323'" +
                    ",'B3231','B3232','B7','B71','B711','B712','C','C25','C251','C2511','C2512','C252','C2520','C26','C261','C2611','C2612','C2613','C2614','C2619','C263','C2631','C263','C264','C2641','C2642'" +
                    ",'C2643','C2644','C2645','C265','C2651','C2652','C266','C2661','C2662','C2664','C2669','C267','C2671','C2672','C27','C271','C2710','C28','C281','C2811','C2812','C282','C2822','C2823','C2826','C2829'" +
                    ",'C33','C336','C3360','C19','C191','C1910','C193','C1931')";
            String sql = "select CONSTRUCTIONID,LONGITUDE,LATITUDE from YZ_CONS " +
                    "where LONGITUDE is not null and LATITUDE is not null "+sql1+" and NATIONALECONOMYCODE in "+tiaojian;


            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-07-17 16:50
     * @param   
     * @return  
     * @Description 建设项目环评点位详细信息
     */
    @RequestMapping("getjiansheDianMessage")
    public EdatResult getjiansheDianMessage(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String id = data.getString("id");

            String sql = "select CONSTRUCTIONID, PROJECTNAME,EIAFILETYPE,ACCEPTANCEDATE,PROJECTADDRESS,PROJECTINVEST,ENVIRONINVEST,NATIONALECONOMYNAME,EIAMANAGENAME,LONGITUDE,LATITUDE from YZ_CONS " +
                    "where CONSTRUCTIONID = '"+id+"'  ";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
   /**
    * @author chendong
    * @date 2018-06-26 17:25
    * @param
    * @return
    * @Description 排污许可数据-专题图
    */
    @RequestMapping("paiwuxukeCount")
    public EdatResult paiwuxukeCount(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getpaiwuxuke(data,userLevel,regionCode);
            String sql = "select * from  (select SUBSTR("+sqlArray[1]+", 0, 6) code,count(*) count from ENTERPRICE_BASEINFO where 1=1 "+sqlArray[0]+" GROUP BY "+sqlArray[1]+"" +
                    ") a left join (select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"level\"="+sqlArray[2]+") b on  a.code = b.\"code\" ORDER BY A.COUNT DESC";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 排序许可详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("paiwuxukeDetail")
    public EdatResult paiwuxukeDetail(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getpaiwuxuke(data,userLevel,regionCode);
            String sql = "select * from  (select SUBSTR("+sqlArray[1]+", 0, 6) code,count(*) count from ENTERPRICE_BASEINFO where 1=1 "+sqlArray[0]+" GROUP BY "+sqlArray[1]+"" +
                    ") a left join (select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"level\"="+sqlArray[2]+") b on  a.code = b.\"code\" ORDER BY A.COUNT DESC";
            String sql_pwxkzs = " select SUM(count) pwxkzs from (select SUBSTR("+sqlArray[1]+", 0, 6) code,count(*) count from ENTERPRICE_BASEINFO where 1=1 "+sqlArray[0]+" GROUP BY "+sqlArray[1]+"" +
                    ") a left join (select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"level\"="+sqlArray[2]+") b on  a.code = b.\"code\" WHERE b.\"lon\" is not null ORDER BY A.COUNT DESC";// 排污许可数据总数
//            String sql_yst = "select SUM(count) count from  (select SUBSTR("+sqlArray[1]+", 0, 6) code,count(*) count from ENTERPRICE_BASEINFO where 1=1 "+sqlArray[0]+" GROUP BY "+sqlArray[1]+"" +
//                    ") a left join (select \"code\",\"name\",\"lon\",\"lat\" from  \"tb_city\" where \"level\"="+sqlArray[2]+" and \"lon\" is not null and \"lat\" is not null) b on  a.code = b.\"code\" ORDER BY A.COUNT DESC"; // 已上图
            
            //String sql_yst = "select sum(count) count from (" + sql +") where \"lon\" is not null";
            String sql_yst = "select count(*) count from ENTERPRICE_BASEINFO where lon2 is not null and lat2 is not null " + sqlArray[0];
            List<Map> resultList = getBySqlMapper.findRecords(sql);
	        List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_pwxkzs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", resultList);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("pwxkzs", resultList4); // 污染地块总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 获取污染地块查询数组
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getpaiwuxuke(JSONObject data,int userLevel,String regionCode) {
    	 String[] arraysql = new String[3];
    	 boolean ss = false ;
         if(data.has("str")){
             ss =true;
         }
         String  sql1 = "";
         if( data.has("xkznum")){//许可证书编号
             if( !"".equals(data.getString("xkznum"))){
                 sql1 +=" and XKZNUM like '%"+data.getString("xkznum")+"%'";
             }
         }
         String  sql2 =" PROVINCECODE";
         String num ="0";
         if(data.has("sheng")){
             if (!"".equals(data.getString("sheng"))){
                 if ( userLevel == 2 ) {
                     sql1 += " and PROVINCECODE like '%"+regionCode+"%'";
                 } else {
                     sql1 += " and PROVINCECODE like '%"+data.getString("sheng")+"%'";
                 }
                 sql2 = " CITYCODE ";
                 num = "1";

             } else {
                 if( userLevel ==2 ){
                     sql1 += " and PROVINCECODE like '%"+regionCode+"%'";
                     sql2 = " CITYCODE ";
                     num = "1";
                 }
             }
         } else {
             if ( userLevel == 2 ) {
                 sql1 += " and PROVINCECODE like '%"+regionCode+"%'";
                 sql2 = " CITYCODE ";
                 num = "1";
             }
         }
         if(data.has("shi")){
             if (!"".equals(data.getString("shi"))){
                 sql1 += " and CITYCODE like '%"+data.getString("shi")+"%'";
                 sql2 = " COUNTYCODE ";
                 num = "2";
             }
         }
         if(data.has("xian")){
             if( !"".equals(data.getString("xian"))){
                 sql1 += " and COUNTYCODE like '%"+data.getString("xian")+"%' ";
                 sql2 = " COUNTYCODE";
                 num = "2";
             }
         }
         if(data.has("ispapk")){//是否园区
             if(!"".equals(data.getString("ispapk"))){
                 sql1 += " and ISPARK = '"+data.getString("ispapk")+"'";
             }
         }
         if (data.has("zywrwlbid")){//污染类型
             if(!"".equals(data.getString("zywrwlbid"))){
                 sql1 += " and ZYWRWLBID like '%"+data.getString("zywrwlbid")+"%'";
             }
         }
         arraysql[0] = sql1;
         arraysql[1] = sql2;
         arraysql[2] = num;
         return arraysql;
    }
    /**
     * @author chendong
     * @date 2018-06-26 17:54
     * @param
     * @return
     * @Description 排污许可-分布图
     */
    @RequestMapping("paiwuxukeMessage")
    public EdatResult paiwuxukeMessage(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  sql1 = "";
            if( data.has("xkznum")){
                if( !"".equals(data.getString("xkznum"))){
                    sql1 +=" and XKZNUM like '%"+data.getString("xkznum")+"%'";
                }
            }
            if(data.has("sheng")){
                if (!"".equals(data.getString("sheng"))){
                    if( userLevel == 2 ){
                        sql1 += " and PROVINCECODE like '%"+regionCode+"%'";
                    } else {
                        sql1 += " and PROVINCECODE like '%"+data.getString("sheng")+"%'";
                    }
                } else{
                    if(userLevel == 2 ) {
                        sql1 += " and PROVINCECODE like '%"+regionCode+"%'";
                    }
                }
            } else {
                if(userLevel == 2 ) {
                    sql1 += " and PROVINCECODE like '%"+regionCode+"%'";
                }
            }
            if(data.has("shi")){
                if (!"".equals(data.getString("shi"))){
                    sql1 += " and CITYCODE like '%"+data.getString("shi")+"%'%";
                }
            }
            if(data.has("xian")){
                if( !"".equals(data.getString("xian"))){
                    sql1 += " and COUNTYCODE like '%"+data.getString("xian")+"%' ";
                }
            }
            if(data.has("ispapk")){
                if(!"".equals(data.getString("ispapk"))){
                    sql1 += " and ISPARK = '"+data.getString("ispapk")+"'";
                }
            }
            if (data.has("zywrwlbid")){
                if(!"".equals(data.getString("zywrwlbid"))){
                    sql1 += " and ZYWRWLBID like '%"+data.getString("zywrwlbid")+"%'";
                }
            }
            String sql = "select  DATAID ENTERID ,LONGITUDE,LATITUDE,OPERATIME,DEVCOMPANY,XKZNUM from  ENTERPRICE_BASEINFO where LONGITUDE is not null and LATITUDE is not null "+sql1;
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-07-17 17:16
     * @param   
     * @return  
     * @Description 排污许可点位详细信息
     */
    @RequestMapping("paiwuxukeDianMessage")
    public EdatResult paiwuxukeDianMessage(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getString("id");
            String sql = "select  DATAID,DEVCOMPANY ,ENTERID,HYNAME,HYNAME,ISPARK,OPERATIME,REGADDRESS,XKZNUM,ZYWRWLBID from  ENTERPRICE_BASEINFO where DATAID='"+id+"'";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-28 13:56
     * @param
     * @return
     * @Description 重点行业监管企业-专题图
     */
    @RequestMapping("zhongdianCount")
    public EdatResult zhongdianCount(HttpServletRequest request ,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getzhongdianSQL(data,userLevel,regionCode);
            String sql = " select "+sqlArray[1]+" city,count(*) count from  \"tb_key_industry_enterprise\" where 1=1 "+sqlArray[0]+" GROUP BY "+sqlArray[1] + " ORDER BY COUNT DESC";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            List<Map> result = new ArrayList<>();
            if(list.size() > 0 ) {
                for ( int i = 0 ; i < list.size() ; i ++ ) {
                    Map map = list.get(i);
                    Map map1 = new HashMap();
                    boolean bool = map.get("CITY").toString().matches("[0-9]+");
                    String cha_sql = "";
                    if(bool){//数字
                        cha_sql = "select * from \"tb_city\" where \"level\" = "+sqlArray[2]+" and \"code\" = '"+map.get("CITY")+"'";
                        List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                        if( cha_list.size() > 0 ) {
                            map1.put("CITY",cha_list.get(0).get("name"));
                            map1.put("name",cha_list.get(0).get("name"));
                            map1.put("COUNT",map.get("COUNT"));
                            map1.put("code",cha_list.get(0).get("code"));
                            map1.put("lat",cha_list.get(0).get("lat"));
                            map1.put("lon",cha_list.get(0).get("lon"));
                            result.add(map1);
                        }
                    }
                }
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 重点行业监管企业详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("getKeyIndustryregulatorsDetail")
    public EdatResult getKeyIndustryregulatorsDetail(HttpServletRequest request ,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getzhongdianSQL(data,userLevel,regionCode);
            String sql = " select "+sqlArray[1]+" city,count(*) count from  \"tb_key_industry_enterprise\" where 1=1 "+sqlArray[0]+" GROUP BY "+sqlArray[1] + " ORDER BY COUNT DESC";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            String sql_yst = "select count(*) count from \"tb_key_industry_enterprise\" where \"latitude\" is not null and \"longitude\" is not null " + sqlArray[0];
            List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
            //BigDecimal yst = new BigDecimal(0);// 已上图，tb_city中经纬度不为空
            String sql_zs = "select sum(count) count from("+sql+")";
            List<Map> result = new ArrayList<>();
            if(list.size() > 0 ) {
                for ( int i = 0 ; i < list.size() ; i ++ ) {
                    Map map = list.get(i);
                    Map map1 = new HashMap();
                    boolean bool = map.get("CITY").toString().matches("[0-9]+");
                    String cha_sql = "";
                    if(bool){//数字
                        cha_sql = "select * from \"tb_city\" where \"level\" = "+sqlArray[2]+" and \"code\" = '"+map.get("CITY")+"'";
                        List<Map> cha_list = this.getBySqlMapper.findRecords(cha_sql);
                        if( cha_list.size() > 0 ) {
                            map1.put("CITY",cha_list.get(0).get("name"));
                            map1.put("name",cha_list.get(0).get("name"));
                            map1.put("COUNT",map.get("COUNT"));
                            map1.put("code",cha_list.get(0).get("code"));
                            map1.put("lat",cha_list.get(0).get("lat"));
                            map1.put("lon",cha_list.get(0).get("lon"));
                           /* if (cha_list.get(0).get("lon") != null) {
                            	yst = yst.add((BigDecimal) map.get("COUNT"));
                            }*/
                            result.add(map1);
                        }
                    }
                }
            }
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_zs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", result);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("zs", resultList4); // 尾矿库绿网总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 获取重点行业监管企业查询sql
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getzhongdianSQL(JSONObject data,int userLevel,String regionCode) {
    	 boolean flg = false;
         if( data.has("str")){
             flg = true;
         }
         String sql1 = "";
         String sql2 = "\"province\"";
         String num = "0";
         if ( data.has("sheng")){
             if ( !"".equals(data.getString("sheng"))){
                 if ( userLevel == 2){
                     sql1+= " and \"province\" ='"+regionCode+"' ";
                 } else {
                     sql1+= " and \"province\" ='"+data.getString("sheng")+"' ";
                 }
               /*  if(flg){
                     sql2 = "\"province\"";
                     num = "0";
                 } else {
                     sql2 = "\"city\"";
                     num = "1";
                 } */
                 sql2 = "\"city\"";
                 num = "1";
             } else {
                 if ( userLevel ==2 ){
                     sql1+= " and \"province\" ='"+regionCode+"' ";
                    /* if(flg){
                         sql2 = "\"province\"";
                         num = "0";
                     } else {
                         sql2 = "\"city\"";
                         num = "1";
                     }*/
                     sql2 = "\"city\"";
                     num = "1";
                 }
             }
         } else {
             if( userLevel == 2 ){
                 sql1+= " and \"province\" ='"+regionCode+"' ";
                /* if(flg){
                     sql2 = "\"province\"";
                     num = "0";
                 } else {
                     sql2 = "\"city\"";
                     num = "1";
                 }*/
                 sql2 = "\"city\"";
                 num = "1";
             }
         }
         if(data.has("shi")){
             if( !"".equals(data.getString("shi"))){
                 sql1 += " and \"city\" ='"+data.getString("shi")+"' and \"city\" is not null ";
                /* if(flg){
                     sql2 = " \"city\" ";
                     num = "1";
                 } else {
                     sql2 = " \"district\" ";
                     num = "2";
                 }*/
                 sql2 = " \"district\" ";
                 num = "2";
             }
         }
         if(data.has("xian")){
             if( !"".equals(data.getString("xian"))){
                 sql1 += " and \"district\" ='"+data.getString("xian")+"' and \"city\" is not null ";
                 /*if(flg){
                     sql2 = " \"district\" ";
                     num = "1";
                 } else {
                     sql2 = " \"district\" ";
                     num = "2";
                 }*/
                 sql2 = " \"district\" ";
                 num = "2";
             }
         }
         if (data.has("enterpriseName")){//企业名称
             if(!"".equals(data.getString("enterpriseName"))){
                 sql1+=" and \"enterpriseName\" like '%"+data.getString("enterpriseName")+"%'";
             }
         }
         if(data.has("industry")){//行业
             if(!"".equals(data.getString("industry"))){
                 sql1 += " and \"industry\" = '"+data.getString("industry")+"'";
             }
         }
         String[] sqlArray = new String[3];
         sqlArray[0] = sql1;
         sqlArray[1] = sql2;
         sqlArray[2] = num;
         return sqlArray;
    }
    
    /**
     * @author chendong
     * @date 2018-06-28 13:55
     * @param
     * @return
     * @Description 重点行业监管企业-分布图
     */
    @RequestMapping("zhongdianMessage")
    public EdatResult zhongdianMessage(HttpServletResponse response ,HttpServletRequest request ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql1 = "";

            if ( data.has("sheng")){
                if ( !"".equals(data.getString("sheng"))){
                    if( userLevel == 2 ) {
                        sql1+= " and \"province\" ='"+regionCode+"' ";
                    } else {
                        sql1+= " and \"province\" ='"+data.getString("sheng")+"' ";
                    }
                } else {
                    if(userLevel == 2 ) {
                        sql1+= " and \"province\" ='"+regionCode+"' ";
                    }
                }
            } else {
                if(userLevel == 2 ) {
                    sql1+= " and \"province\" ='"+regionCode+"' ";
                }
            }
            if(data.has("shi")){
                if( !"".equals(data.getString("shi"))){
                    sql1 += " and \"city\" ='"+data.getString("shi")+"' and \"city\" is not null ";
                }
            }
            if(data.has("xian")){
                if( !"".equals(data.getString("xian"))){
                    sql1 += " and \"district\" ='"+data.getString("xian")+"' and \"city\" is not null ";
                }
            }
            if (data.has("enterpriseName")){//企业名称
                if(!"".equals(data.getString("enterpriseName"))){
                    sql1+=" and \"enterpriseName\" like '%"+data.getString("enterpriseName")+"%'";
                }
            }
            if(data.has("industry")){//行业
                if(!"".equals(data.getString("industry"))){
                    sql1 += " and \"industry\" = '"+data.getString("industry")+"'";
                }
            }
            String sql = " select \"id\",\"enterpriseName\",\"unifiedSocialCreditIdentifier\",\"organizingInstitutionBarCode\",\"industry\",\"latitude\",\"longitude\",\"mainContaminant\" from " +
                    " \"tb_key_industry_enterprise\" where 1=1 and \"latitude\" is not null and \"longitude\" is not null "+sql1+" ";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong
     * @date 2018-06-28 14:02
     * @param
     * @return
     * @Description 重点行业监管企业-行业
     */
    @RequestMapping("zhongdianIndustry")
    public EdatResult zhongdianIndustry(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));

            String sql = "select \"industry\"  from  \"tb_key_industry_enterprise\" where \"industry\" is not null GROUP BY \"industry\"";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-06-29 11:08
     * @param   
     * @return  
     * @Description 组织机构代码-专题图
     */
    @RequestMapping("zuzhijigouCount")
    public EdatResult zuzhijigouCount(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getzuzhijigouSQL(data,userLevel,regionCode);
            String sql = "select \"code\",\"name\",\"lon\",\"lat\",count from ( select "+sqlArray[1]+" xzqh,count(*) count from TB_ORGANIZATION_CODE where XZQH0 is not null "+sqlArray[0]+"" +
                    " GROUP BY "+sqlArray[1]+")a left join (select \"code\",\"name\",\"lon\",\"lat\" from \"tb_city\" where \"level\" = "+sqlArray[3]+")b on a.xzqh ="+sqlArray[2]+"  where b.\"code\" is not null ORDER BY A.count DESC";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * 组织机构详情
     * @param request
     * @param response
     * @return
     */
    @RequestMapping("organizationDetail")
    public EdatResult organizationDetail(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String[] sqlArray = getzuzhijigouSQL(data,userLevel,regionCode);
            String sql = "select \"code\",\"name\",\"lon\",\"lat\",count from ( select "+sqlArray[1]+" xzqh,count(*) count from TB_ORGANIZATION_CODE where XZQH0 is not null "+sqlArray[0]+"" +
                    " GROUP BY "+sqlArray[1]+")a left join (select \"code\",\"name\",\"lon\",\"lat\" from \"tb_city\" where \"level\" = "+sqlArray[3]+")b on a.xzqh ="+sqlArray[2]+"  where b.\"code\" is not null ORDER BY A.count DESC";
            String sql_zs = "SELECT SUM(count) count FROM("+sql+")"; // 污染地块总数
            String sql_yst = "select count(*) count from TB_ORGANIZATION_CODE where lon2 is not null and lat2 is not null " + sqlArray[0];
            List<Map> resultList = getBySqlMapper.findRecords(sql);
	        List<Map> resultList3 = getBySqlMapper.findRecords(sql_yst); // 已上图地块总数
	        List<Map> resultList4 = getBySqlMapper.findRecords(sql_zs);
	        Map resultMap = new HashMap();
	        resultMap.put("detail", resultList);
	        resultMap.put("yst", resultList3); // 已上图
	        resultMap.put("zs", resultList4); // 污染地块总数
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    
    
    /**
     * 获取组织机构查询sql
     * @param data
     * @param userLevel
     * @param regionCode
     * @return
     */
    public String[] getzuzhijigouSQL(JSONObject data,int userLevel,String regionCode) {
    	String sql1 = "";
        String num = "0";
        String sql2 = " SUBSTR(XZQH0,0,2)";
        String sql3 = " SUBSTR(b.\"code\",0,2)";
        boolean flg = false ;
        if( data.has("str")){
            flg = true;
        }
        if ( data.has("sheng")){
            if ( !"".equals(data.getString("sheng"))){
                if ( userLevel == 2 ) {
                    sql1= " and XZQH0 like '"+regionCode.substring(0,2)+"%'";
                } else {
                    sql1= " and XZQH0 like '"+data.getString("sheng").substring(0,2)+"%'";
                }
               /* if( flg){
                    sql2=" SUBSTR(XZQH0,0,2) ";
                    sql3 = " SUBSTR(b.\"code\",0,2)";
                    num = "0";
                } else {
                    sql2=" SUBSTR(XZQH0,0,4) ";
                    sql3 = " SUBSTR(b.\"code\",0,4)";
                    num = "1";
                }*/
                sql2=" SUBSTR(XZQH0,0,4) ";
                sql3 = " SUBSTR(b.\"code\",0,4)";
                num = "1";
            } else {
                if ( userLevel == 2 ) {
                    sql1= " and XZQH0 like '"+regionCode.substring(0,2)+"%'";
                   /* if( flg){
                        sql2=" SUBSTR(XZQH0,0,2) ";
                        sql3 = " SUBSTR(b.\"code\",0,2)";
                        num = "0";
                    } else {
                        sql2=" SUBSTR(XZQH0,0,4) ";
                        sql3 = " SUBSTR(b.\"code\",0,4)";
                        num = "1";
                    }*/
                    sql2=" SUBSTR(XZQH0,0,4) ";
                    sql3 = " SUBSTR(b.\"code\",0,4)";
                    num = "1";
                }
            }
        } else {
            if ( userLevel == 2 ) {
                sql1= " and XZQH0 like '"+regionCode.substring(0,2)+"%'";
             /*   if( flg){
                    sql2=" SUBSTR(XZQH0,0,2) ";
                    sql3 = " SUBSTR(b.\"code\",0,2)";
                    num = "0";
                } else {
                    sql2=" SUBSTR(XZQH0,0,4) ";
                    sql3 = " SUBSTR(b.\"code\",0,4)";
                    num = "1";
                }*/
                sql2=" SUBSTR(XZQH0,0,4) ";
                sql3 = " SUBSTR(b.\"code\",0,4)";
                num = "1";
            }

        }
        if(data.has("shi")){
            if( !"".equals(data.getString("shi"))){
                sql1 = " and XZQH0 like '"+data.getString("shi").substring(0,4)+"%'";
             /*   if( flg){
                    sql2=" SUBSTR(XZQH0,0,4) ";
                    sql3 = " SUBSTR(b.\"code\",0,4)";
                    num = "1";
                } else {
                    sql2 = " XZQH0 ";
                    sql3=" b.\"code\" ";
                    num = "2";
                }*/
                sql2 = " XZQH0 ";
                sql3=" b.\"code\" ";
                num = "2";
            }
        }
        if(data.has("xian")){
            if( !"".equals(data.getString("xian"))){
                sql1 = " and XZQH0 ="+data.getString("xian");
                sql2 = " XZQH0";
                sql3=" b.\"code\" ";
                num = "2";

            }
        }
        if (data.has("jigouName")){//机构名称
            if(!"".equals(data.getString("jigouName"))){
                sql1+=" and JGMC0 like '%"+data.getString("jigouName")+"%'";
            }
        }
        if(data.has("zhuangtai")){//状态
            if(!"".equals(data.getString("zhuangtai"))){
                String arrayjyzt = data.getString("zhuangtai");
                String[] jyztArray = arrayjyzt.substring(1,arrayjyzt.length()-1).split(",");
                for (int i = 0; i < jyztArray.length; i++) {
                	String jyzt = jyztArray[i].toString();
                	if (jyzt.length() > 0) {
                		if (i ==  0) {
                			sql1 += " and JYZT0 = '"+jyzt.substring(1,jyzt.length()-1)+"'";
                		} else {
                			sql1 += " or JYZT0 = '"+jyzt.substring(1,jyzt.length()-1)+"'";
                		}
                	}
                }
            }
        }
        String[] sqlArray = new String[4];
        sqlArray[0] = sql1;
        sqlArray[1] = sql2;
        sqlArray[2] = sql3;
        sqlArray[3] = num;
        return sqlArray;
    }
    
    /**
     * @author chendong  
     * @date 2018-06-29 11:54
     * @param   
     * @return  
     * @Description 组织机构代码-分布图
     */
    @RequestMapping("zuzhijigouMessage")
    public EdatResult zuzhijigouMessage(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql1 = "";
            if ( data.has("sheng")){
                if ( !"".equals(data.getString("sheng"))){
                    if (userLevel == 2 ) {
                        sql1= " and XZQH0 like '"+regionCode.substring(0,2)+"%'";
                    } else{
                        sql1= " and XZQH0 like '"+data.getString("sheng").substring(0,2)+"%'";
                    }
                } else {
                    if (userLevel == 2 ) {
                        sql1= " and XZQH0 like '"+regionCode.substring(0,2)+"%'";
                    }
                }
            } else {
                if (userLevel == 2 ) {
                    sql1= " and XZQH0 like '"+regionCode.substring(0,2)+"%'";
                }
            }
            if(data.has("shi")){
                if( !"".equals(data.getString("shi"))){
                    sql1 = " and XZQH0 like '"+data.getString("shi").substring(0,4)+"%'";
                }
            }
            if(data.has("xian")){
                if( !"".equals(data.getString("xian"))){
                    sql1 = " and XZQH0 ='"+data.getString("xian")+"'";
                }
            }
            if (data.has("jigouName")){//机构名称
                if(!"".equals(data.getString("jigouName"))){
                    sql1+=" and JGMC0 like '%"+data.getString("jigouName")+"%'";
                }
            }
            if(data.has("zhuangtai")){//状态
                if(!"".equals(data.getString("zhuangtai"))){
                    sql1 += " and JYZT0 = '"+data.getString("zhuangtai")+"'";
                }
            }
            String sql = " select TYDM0,JGMC0,JGDM0,JGLX,LAT,LON from  TB_ORGANIZATION_CODE where LON is not null and LAT is not null "+sql1;
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-07-18 10:44
     * @param   
     * @return  
     * @Description 组织机构代码点位详细信息
     */
    @RequestMapping("zuzhijigouDianMessage")
    public EdatResult zuzhijigouDianMessage(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  id = data.getString("id");
            String sql = " select TYDM0,JGDM0,JGMC0,JYFW0,ZCRQ0,JYZT0,ZGRS0,JJHY20110,LON,LAT, JGLX from  TB_ORGANIZATION_CODE where LON is not null and LAT is not null and JGDM0='"+id+"'";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-06-29 11:53
     * @param   
     * @return  
     * @Description 组织机构代码-机构类型
     */
    @RequestMapping("zuzhijigouType")
    public EdatResult zuzhijigouType(HttpServletRequest request ,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));

            String sql = "select  JYZT0  from  TB_ORGANIZATION_CODE where JYZT0 is not null GROUP BY JYZT0";
            List<Map> list  = this.getBySqlMapper.findRecords(sql);
            List<Map> result = new ArrayList<>();
            if(list.size() > 0 ) {
                for ( int i = 0 ; i<list.size(); i ++ ) {
                    Map map = list.get(i);
                    Map map1 = new HashMap();
                    if(!map.get("JYZT0").toString().matches("[0-9]+")){
                        if(!map.get("JYZT0").toString().matches("[A-Z]+")){
                            if(!map.get("JYZT0").toString().matches("[a-z]+")){
                                map1.put("JYZT0",map.get("JYZT0"));
                                result.add(map1);
                            }
                        }
                    }
                }
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("chaall")
    public EdatResult chaall(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = " SELECT * FROM  \"t_htqysj_copy1\" where LONB ='null'";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("updateall")
    public EdatResult updateall(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String  id = data.getString("id");
            String lon = data.getString("lon");
            String lat = data.getString("lat");
            String sql = "update \"t_htqysj_copy1\" set LONB='"+lon+"', LATB='"+lat+"' where PID ='"+id+"'";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

}
