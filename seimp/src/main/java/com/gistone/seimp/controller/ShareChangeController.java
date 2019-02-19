package com.gistone.seimp.controller;


import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.job.GetContructProjectData;
import com.gistone.seimp.service.LogToDb;
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
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;

/**
 * Created by qiang on 2017/10/21.
 */

@RestController
@RequestMapping( "share" )
@SuppressWarnings("all")
public class ShareChangeController {

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
     * @Author:renqiang
     * @Description:资源目录
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getSourceCatalog" )
    public EdatResult getSourceCatalog(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql = "select \"id\",\"name\" from \"tb_source_catalog\" where \"level\" = 1";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                String sql1 = "select \"id\",\"name\" from \"tb_source_catalog\" where \"parent_id\" = " + map.get("id");
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
                for (Map map1 : list1) {
                    String sql2 = "select \"id\",\"name\" from \"tb_source_catalog\" where \"parent_id\" = " + map1.get("id");
                    List<Map> list2 = getBySqlMapper.findRecords(sql2);
                    if (list2.size() > 0) {
                        map1.put("children", list2);
                    }
                }
                if (list1.size() > 0) {
                    map.put("children", list1);
                }
            }
            return EdatResult.ok(list);

        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:资源目录
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getDatalist" )
    public EdatResult getDatalist(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            if (roleID == null) {
                return EdatResult.build(1, "fail");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int type = data.getInt("type");
            int pageNumber = Integer.valueOf(data.get("pageNumber").toString());
            int pageSize = Integer.valueOf(data.get("pageSize").toString());
            if (type > 100) {
                return EdatResult.ok(getDatalistByBuwei(roleID, type - 100, pageNumber, pageSize));
            } else {
                return EdatResult.ok(getDatalistByDataType(roleID, type, pageNumber, pageSize));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取数据集数量
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getDataNum" )
    public EdatResult getDataNum(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select count(*) from \"tb_source_metadata\" ";
            return EdatResult.ok(getBySqlMapper.findrows(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据数据类型分类数据集
     * @Date:09:20 2017/10/20
     */
    public Map getDatalistByDataType(String roleID, int type, int pageNumber, int pageSize) {
        try {
            String sql = "";
            String sql1 = "";

            if (type == 0) {
                sql = "SELECT * FROM(select T1.*,ROWNUM RN FROM(select * from \"tb_source_metadata\")T1) WHERE RN>" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize + " order by \"dataTime\" desc ";
                sql1 = "select count(*) from \"tb_source_metadata\"";
            } else {
                sql = "SELECT * FROM(select T1.*,ROWNUM RN FROM(select * from \"tb_source_metadata\" where \"dataType\" in " + " (select \"id\" from (select * from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID = " + roleID + ") T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")A" + " where A.\"parent_id\" = '" + type + "' or A.\"id\" = '" + type + "' union all  (select \"id\" from (select * from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID = " + roleID + ") T1 " + " JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")B where B.\"parent_id\" in (select \"id\" from (select * from (select RIGHTID from T_ROLE_DATARIGHT " + " where ROLEID = " + roleID + ") T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")C  where C.\"parent_id\" = '" + type + "')))" + ")T1) WHERE RN>" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize + " order by \"dataTime\" desc";
                sql1 = "select count(*) from \"tb_source_metadata\" where \"dataType\" in " + " (select \"id\" from (select * from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID = " + roleID + ") T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")A" + "  where A.\"parent_id\" = '" + type + "' or A.\"id\" = '" + type + "' union all  (select \"id\" from (select * from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID = " + roleID + ") T1 " + "  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")B where B.\"parent_id\" in (select \"id\" from (select * from (select RIGHTID from T_ROLE_DATARIGHT " + "  where ROLEID = " + roleID + ") T1  JOIN \"tb_source_catalog\" T2 on T1.RIGHTID = T2.\"id\")C  where C.\"parent_id\" = '" + type + "')))";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                map.put("name", map.get("name") == null ? "" : map.get("name").toString());
                map.put("serviceAccount", map.get("serviceAccount") == null ? "" : map.get("serviceAccount").toString());
                map.put("department", map.get("department") == null ? "" : map.get("department").toString());
            }
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", Math.ceil((double) getBySqlMapper.findrows(sql1) / pageSize));
            result.put("page", list.size() == 0 ? 0 : pageNumber);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据名称搜索数据集
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getDatalistByName" )
    public Map getDatalistByName(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            HttpSession session = request.getSession();
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = RegUtil.checkParam(data.getString("name"));
            int pageNumber = data.getInt("pageNumber");
            int pageSize = data.getInt("pageSize");
            String roleID = (String) session.getAttribute("roleID");
            String sql = "SELECT * from (select A.*,ROWNUM RN FROM (SELECT * from (select * from \"tb_source_metadata\" where 1=1";
            String sql1 = "SELECT count(*) from (select * from \"tb_source_metadata\" where 1=1";
            String sql2 = "";
            if (!name.equals("")) {
                sql2 += " and \"name\" like '%" + name + "%'";
            }
            sql2 += "  ) T1 JOIN (SELECT RIGHTID from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "') T2 on T1.\"dataType\" = T2.RIGHTID";
            sql += sql2;
            sql1 += sql2;
            sql += ")A) WHERE RN >" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize + " order by \"dataTime\" desc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                map.put("name", map.get("name") == null ? "" : map.get("name").toString());
                map.put("serviceAccount", map.get("serviceAccount") == null ? "" : map.get("serviceAccount").toString());
                map.put("department", map.get("department") == null ? "" : map.get("department").toString());
            }
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", Math.ceil((double) getBySqlMapper.findrows(sql1) / pageSize));
            result.put("page", list.size() == 0 ? 0 : pageNumber);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据部位分类数据集
     * @Date:09:20 2017/10/20
     */
    public Map getDatalistByBuwei(String roleID, int name, int pageNumber, int pageSize) {
        try {
            String sql = "SELECT * FROM(select T1.*,ROWNUM RN FROM(select * from \"tb_source_metadata\" where \"ministry\"='" + name + "' )T1 JOIN (SELECT RIGHTID from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "') T2 on T1.\"dataType\" = T2.RIGHTID) WHERE RN>" + pageSize * (pageNumber - 1) + " and RN<=" + pageNumber * pageSize + " order by \"dataTime\" desc";
            String sql1 = "select count(*) from \"tb_source_metadata\" where \"ministry\"='" + name + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                map.put("name", map.get("name") == null ? "" : map.get("name").toString());
                map.put("serviceAccount", map.get("serviceAccount") == null ? "" : map.get("serviceAccount").toString());
                map.put("department", map.get("department") == null ? "" : map.get("department").toString());
            }
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", Math.ceil((double) getBySqlMapper.findrows(sql1) / pageSize));
            result.put("page", pageNumber);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:统计
     * @Date:13:20 2017/10/26
     */
    @RequestMapping( "getStatistic" )
    public EdatResult getStatistic(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");
            String sql = "";
            if (type.equals("1")) {
                sql = "SELECT sum(\"serviceAccount\")SUM,\"ministry\" TYPE from \"tb_source_metadata\" GROUP BY \"ministry\"";
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据部委统计图
     * @Date:13:20 2017/10/26
     */
    @RequestMapping( "getStaByMinistry" )
    public EdatResult getStaByMinistry(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select * from (SELECT sum(\"serviceAccount\") \"value\",\"ministry\" from \"tb_source_metadata\" GROUP BY \"ministry\" )T0 " + " right join \"tb_ministry_dict\" T1 on T0.\"ministry\"= T1.\"id\" order by T1.\"ordernum\" asc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                if (map.get("value") == null) {
                    map.put("value", 0);
                }
            }
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据数据类型统计图
     * @Date:13:20 2017/10/26
     */
    @RequestMapping( "getStaByDateType" )
    public EdatResult getStaByDateType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql1 = "select \"id\",\"name\" ,0 \"SUM\" from \"tb_source_catalog\" where \"parent_id\"=0 ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            String sql = "select SUM(\"serviceAccount\") as SUM,TYPE from (select T3.\"serviceAccount\"," + " \"DECODE\"(T4.\"parent_id\",0,T4.\"id\", T4.\"parent_id\") as TYPE,T4.\"name\" FROM (select T1.\"serviceAccount\"," + " \"DECODE\"(T2.\"parent_id\", 0,T2.\"id\", T2.\"parent_id\") " + " as type1 from \"tb_source_metadata\" T1 left join \"tb_source_catalog\" T2 on T1.\"dataType\" = T2.\"id\")T3" + " left join \"tb_source_catalog\" T4 on T3.TYPE1 = T4.\"id\") GROUP BY TYPE ";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            for (Map map : list1) {
                for (Map map1 : list) {
                    if (map.get("TYPE").toString().equals(map1.get("id").toString())) {
                        map1.put("SUM", map.get("SUM").toString());
                    }
                }
            }
            List list2 = new ArrayList();
            List list3 = new ArrayList();
            for (Map map : list) {
                list2.add(map.get("SUM").toString());
                list3.add(map.get("name").toString());
            }
            Map result = new HashMap();
            result.put("names", list3);
            result.put("values", list2);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:查看元数据
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getSourceData" )
    public EdatResult getSourceData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ID = data.getString("type");
            String sql = "select * from(select T1.*,T2.\"name\" \"dataName\" from(select \"id\", \"name\", \"department\", to_char(\"updateTime\",'yyyy-mm-dd HH24:mi:ss')\"updateTime\", " + " \"serviceAccount\", \"visitAccount\", to_char(\"dataTime\",'yyyy-mm-dd HH24:mi:ss')\"dataTime\", " + "  \"location\", \"subjectTerms\", \"dataType\", \"abstract\", \"instructions\", \"contact\", \"tel\", \"email\", \"address\", " + "  \"ministry\",\"interface_id\" from \"tb_source_metadata\" where \"id\" = " + ID + ")T1 left join \"tb_source_catalog\" T2 on T1.\"dataType\" = T2.\"id\" )A" + " left join \"tb_interface\" B on A.\"interface_id\" = B.\"interface_id\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:查看数据，点击量加一
     * @Date:09:20 2017/10/30
     */
    @RequestMapping( "hitData" )
    public synchronized EdatResult hitData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ID = data.getString("ID");
            String sql = "update \"tb_source_metadata\" set \"visitAccount\" = \"NVL\"(\"visitAccount\", 0)+1 where \"id\" =" + ID;
            getBySqlMapper.update(sql);
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取最新元数据信息
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getLatestMetaData" )
    public EdatResult getLatestMetaData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            String sql = "select * from (select A.*,ROWNUM RN from (SELECT T1.* from (select \"id\", \"name\",\"department\",\"serviceAccount\"," + " to_char(\"dataTime\",'yyyy-mm-dd')\"dataTime\",\"dataType\"  from \"tb_source_metadata\")T1" + " join (select * from T_ROLE_DATARIGHT where ROLEID = " + roleID + ")T2 on T1.\"dataType\" = T2.RIGHTID order by T1.\"dataTime\" desc,T1.\"serviceAccount\" desc )A )where RN<=3";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:工业园区
     * @Date:09:20 2017/10/21
     */
    @RequestMapping( "getIndustryPark" )
    public Map getIndustryPark(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userLevel = session.getAttribute("userLevel").toString();
            String names = "";
            if (!userLevel.equals("0") && !userLevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");
            String type = request.getParameter("type");
            String province = request.getParameter("province");
            String sql = "select * from(select T1.*,ROWNUM RN from(select * from \"tb_industrial_park\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_industrial_park\" where 1=1 ";
            String sql2 = "";
            if (!userLevel.equals("1") && !userLevel.equals("0")) {
                sql2 += " and \"province_name\" like '" + names + "%'";
            }
            if (!type.equals("")) {
                sql2 += " and \"type_name\" like '" + type + "%'";
            }
            if (!name.equals("")) {
                sql2 += " and \"name\" like '" + name + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"province_name\" like '" + province + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += " )T1) where RN>" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            Map result = new HashMap();
            result.put("rows", getBySqlMapper.findRecords(sql));
            result.put("total", getBySqlMapper.findrows(sql1));
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看工业园区数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 工业园区下拉框数据
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getGYYQC" )
    public JSONObject getGYYQC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            String sql1 = "select * from \"tb_city\" where \"level\"='0'";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            String sql2 = "select \"type_name\" from \"tb_industrial_park\" where 1=1 GROUP BY \"type_name\"";
            List<Map> type_namelist = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();
            obj.put("citylist", list);
            obj.put("type_namelist", type_namelist);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:全国土壤污染状况详查检测实验室名录
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getLaboratory" )
    public Map getLaboratory(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String soil = request.getParameter("soil");
            String path = request.getParameter("path");
            String name = request.getParameter("name");
            String ariculture = request.getParameter("ariculture");
            String sql = "select * from (select T1.*,rownum RN from (select * from \"tb_laboratory\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_laboratory\" where 1=1";

            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"working_range\" like '" + names + "%'";

            }
            if (!soil.equals("")) {
                sql2 += " and \"domain_soil_heavymetal\" = " + soil;
            }
            if (!path.equals("")) {
                sql2 += " and \"domain_soil_pahs\" = " + path;
            }
            if (!ariculture.equals("")) {
                sql2 += " and \"domain_ariculture_heavymetal\" = '" + ariculture + "'";
            }
            if (!name.equals("")) {
                sql2 += " and \"laboratory_name\" like  '" + name + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看实验室数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:降水——酸雨
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getAcidrainInfo" )
    public Map getAcidrainInfo(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String A06005_DT_FLAG = request.getParameter("so");//硫酸根离子监测标志
            String A06013_DT_FLAG = request.getParameter("k");//钾离子监测标志
            String A06010_DT_FLAG = request.getParameter("ca");//钙离子监测标志
            String A06012_DT_FLAG = request.getParameter("na");//钠离子监测标志
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select " + "\"A06005_DT_FLAG\",\"A06010_DT_FLAG\",\"A06013_DT_FLAG\",\"A06012_DT_FLAG\",\"A06013\",\"A06010\",\"A06008\",\"A06006\",\"A06003\",\"" + "A06012\",\"A06005\",\"A06011\",\"A06009\",\"A06007\",\"A06004\",\"AR_UPFLAG\",to_char(INF_SAMPLEDATE_TIME,'yyyy-mm-dd HH24:mi:ss')INF_SAMPLEDATE_TIME,\"" + "AR_INF_EMI\",\"AR_INF_EH\",\"AR_INF_ED\",\"AR_INF_EM\",\"AR_INF_EY\",\"AR_INF_SMI\",\"AR_INF_SH\",\"AR_INF_SD\",\"AR_INF_SM\",\"" + "AR_INF_SY\",\"DATA_VERSION\",to_char(DATA_UPLOADINGTIME,'yyyy-mm-dd HH24:mi:ss')DATA_UPLOADINGTIME,\"REDUNDANCY_FLAG\",\"" + "AUDIT_FLAG\",\"AR_INF_RAINFALL\",\"PT_CODE\",\"ARM_P_CODE\",\"AR_INF_ID\",\"A06006_DT_FLAG\",\"" + "A06003_DT_FLAG\",\"A06011_DT_FLAG\",\"A06004_DT_FLAG\",\"A06007_DT_FLAG\",\"A06009_DT_FLAG\",\"A06008_DT_FLAG\",\"CS_FILENAME\"" + " from \"INI_ACIDRAIN_INFO\" where 1=1 ";
            String sql1 = "select count(*) from \"INI_ACIDRAIN_INFO\" where 1=1";
            String sql2 = "";

            if (!A06005_DT_FLAG.equals("")) {
                sql2 += " and \"A06005_DT_FLAG\" =" + A06005_DT_FLAG;
            }
            if (!A06013_DT_FLAG.equals("")) {
                sql2 += " and \"A06013_DT_FLAG\" =" + A06013_DT_FLAG;
            }
            if (!A06010_DT_FLAG.equals("")) {
                sql2 += " and \"A06010_DT_FLAG\" =" + A06010_DT_FLAG;
            }
            if (!A06012_DT_FLAG.equals("")) {
                sql2 += " and \"A06012_DT_FLAG\" =" + A06012_DT_FLAG;
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {

            }
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看酸雨数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:自行监测（工业废水污染源基本信息）
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getT_GY_WASTEBASCIMESSAGE" )
    public Map getT_GY_WASTEBASCIMESSAGE(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            String province = request.getParameter("province");
            String city = request.getParameter("city");
            String county = request.getParameter("county");//县代码
            String industry = request.getParameter("industry");//行业代码
            String name = request.getParameter("keyword");//名称
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select YEAR," + "QUARTER,PARTICULARNAME," + "BUSINESSCODE,MONITORNAME," + "MONITOR_ITEM_NAME,WASTE_IMPORT," + "POLLUTANT_CONCENTRATION," + "DISCHARGE_S,DISCHARGE_X," + "DISCHARGE_MONAD,EXCEED_NUMBER," + "POLLUTANT_QUALIFIED,VALUATION," + "RECEIVING_WATERNAME,THE_DIRECTION," + "REGISTER_TYPE,SCALE," + "RUN_NORMAL_MOVE,WASTE_RANK," + "GASE_RANK,SCALE_CODE,POLLUTION_RANK_CODE," + "POLLUTION_TYPE_CODE,LONGTITUDE_INDEX," + "LATITUDE_INDEX,ENTERPRISE_SITE," + "WASTE_MOUTH_NUMBER," + "GAS_EQUIPMENT_NUMBER," + "GAS_MOUTH_NUMBER," + "S02_GROSS_VALUE," + "C0D_GROSS_VALUE,POLLUTION_DECLARE_MARK," + "INORGANIZATION_PFDS,EGALPERSON_NAME," + "SOURCE_CONTACTS,PHONE," + "FAXES,DAWK_CODE," + "START_BUSINESS_TIME," + "CWGY_SKETCH," + "WRCL_SKETCH," + "FINALLY_ALTER_TIME," + "CONTACT_SECTION," + "DELETE_SATE," + "GAS_POLLUTION_RANK_CODE," + "EXEC_STANDARD_CODE," + "EXEC_CONDITION_CODE," + "POLLUTED_ATTRIBUTE," + "MONITOR_JD," + "MONITOR_WD," + "MONTH," + "DAYS," + "POLLUTE_PF_VALUE," + "WASTE_PF_VALUE," + "MONITORING_VALUE," + "LOAD_CONDITION," + "DATA_INTEGRITY," + "CAUSE," + "FREQUENCY," + "IMPORT_GAS_QUANTITY," + "ENTERPRISE_CODE," + "RECEIVING_WATERCODE," + "THE_DIRECTION_TYPECODE," + "DISTRICT_CODE," + "PROVINCE," + "MUNICIPAL," + "ONE_BUSINESSNAME," + "ONE_BUSINESSCODE," + "TWO_BUSINESSNAME," + "TWO_BUSINESSCODE," + "THREE_BUSINESSNAME," + "THREE_BUSINESSCODE," + "LEGALPERSON_CODE," + "DISCHARGE_GL_CODE," + "REGISTER_TYPECODE," + "CUSTOM_ATTRIBUTE," + "STANDARD_NAME," + "PKID," + "UPDATEFLAG_HBB_BIGDATA," + "to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
            String sql1 = "select count(*) from \"T_GY_WASTEBASCIMESSAGE\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"PROVINCE\" ='" + names + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"MUNICIPAL\" ='" + names + "'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"DISTRICT_CODE\" =" + regionCode;
            }
            if (name != null && !name.equals("")) {
                sql2 += " and \"PARTICULARNAME\" like '" + name + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE\" ='" + province + "'";
            }
            if (!city.equals("")) {
                sql2 += " and \"MUNICIPAL\" ='" + city + "'";
            }
            if (!county.equals("")) {
                sql2 += " and \"DISTRICT_CODE\" =" + county;
            }
            if (!industry.equals("")) {
                sql2 += " and \"ONE_BUSINESSCODE\" ='" + industry + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
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
     * @Author:renqiang
     * @Description:自行监测（工业废水污染源基本信息）
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getT_GY_WASTEBASCIMESSAGE2" )
    public Map getT_GY_WASTEBASCIMESSAGE2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            String province = request.getParameter("province");
            String city = request.getParameter("city");
            String county = request.getParameter("county");//县代码
            String industry = request.getParameter("industry");//行业代码
            String name = request.getParameter("keyword");//名称
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select YEAR," + "QUARTER,PARTICULARNAME," + "BUSINESSCODE,MONITORNAME," + "MONITOR_ITEM_NAME,WASTE_IMPORT," + "POLLUTANT_CONCENTRATION," + "DISCHARGE_S,DISCHARGE_X," + "DISCHARGE_MONAD,EXCEED_NUMBER," + "POLLUTANT_QUALIFIED,VALUATION," + "RECEIVING_WATERNAME,THE_DIRECTION," + "REGISTER_TYPE,SCALE," + "RUN_NORMAL_MOVE,WASTE_RANK," + "GASE_RANK,SCALE_CODE,POLLUTION_RANK_CODE," + "POLLUTION_TYPE_CODE,LONGTITUDE_INDEX," + "LATITUDE_INDEX,ENTERPRISE_SITE," + "WASTE_MOUTH_NUMBER," + "GAS_EQUIPMENT_NUMBER," + "GAS_MOUTH_NUMBER," + "S02_GROSS_VALUE," + "C0D_GROSS_VALUE,POLLUTION_DECLARE_MARK," + "INORGANIZATION_PFDS,EGALPERSON_NAME," + "SOURCE_CONTACTS,PHONE," + "FAXES,DAWK_CODE," + "START_BUSINESS_TIME," + "CWGY_SKETCH," + "WRCL_SKETCH," + "FINALLY_ALTER_TIME," + "CONTACT_SECTION," + "DELETE_SATE," + "GAS_POLLUTION_RANK_CODE," + "EXEC_STANDARD_CODE," + "EXEC_CONDITION_CODE," + "POLLUTED_ATTRIBUTE," + "MONITOR_JD," + "MONITOR_WD," + "MONTH," + "DAYS," + "POLLUTE_PF_VALUE," + "WASTE_PF_VALUE," + "MONITORING_VALUE," + "LOAD_CONDITION," + "DATA_INTEGRITY," + "CAUSE," + "FREQUENCY," + "IMPORT_GAS_QUANTITY," + "ENTERPRISE_CODE," + "RECEIVING_WATERCODE," + "THE_DIRECTION_TYPECODE," + "DISTRICT_CODE," + "PROVINCE," + "MUNICIPAL," + "ONE_BUSINESSNAME," + "ONE_BUSINESSCODE," + "TWO_BUSINESSNAME," + "TWO_BUSINESSCODE," + "THREE_BUSINESSNAME," + "THREE_BUSINESSCODE," + "LEGALPERSON_CODE," + "DISCHARGE_GL_CODE," + "REGISTER_TYPECODE," + "CUSTOM_ATTRIBUTE," + "STANDARD_NAME," + "PKID," + "UPDATEFLAG_HBB_BIGDATA," + "to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
            String sql1 = "select count(*) from \"T_GY_WASTEBASCIMESSAGE\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"PROVINCE\" ='" + names + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"MUNICIPAL\" ='" + names + "'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"DISTRICT_CODE\" =" + regionCode;
            }

            if (name != null && !name.equals("")) {
                sql2 += " and \"PARTICULARNAME\" like '" + name + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE\" ='" + province + "'";
            }
            if (!city.equals("")) {
                sql2 += " and \"MUNICIPAL\" ='" + city + "'";
            }
            if (!county.equals("")) {
                sql2 += " and \"DISTRICT_CODE\" =" + county;
            }
            if (!industry.equals("")) {
                sql2 += " and \"ONE_BUSINESSNAME\" ='" + industry + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看工业废水基本信息表数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:验收项目
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getYZ_BAS_ACPT" )
    public Map getYZ_BAS_ACPT(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");//项目名称
            String type = request.getParameter("type");//分类
            String province = request.getParameter("province");//省份名称
            String address = request.getParameter("address");//省份名称
            String sql = "select * from (select T1.*,ROWNUM RN from (select  ID,PROJECTNAME,EIAMANAGENAME,PROJECTADDRESS,EIAEVALUATIONNUMBER,PROVINCENAME,UPDATEFLAG_HBB_BIGDATA," + "to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss') UPDATETIME_HBB_BIGDATA from \"YZ_BAS_ACPT\" where 1=1 ";
            String sql1 = "select count(*) from \"YZ_BAS_ACPT\" where 1=1";
            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
            if (!name.equals("")) {
                sql2 += " and \"PROJECTNAME\" like'%" + name + "%'";
            }
            if (!type.equals("")) {
                sql2 += " and \"EIAMANAGENAME\" like'%" + type + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCENAME\" like'%" + province + "%'";
            }
            if (!address.equals("")) {
                sql2 += " and \"PROJECTADDRESS\" like'%" + address + "%'";
            }

            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看验收项目数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:建设项目
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getYZ_BAS_CONS" )
    public Map getYZ_BAS_CONS(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = RegUtil.checkParam(request.getParameter("name"));//项目名称
            String province = RegUtil.checkParam(request.getParameter("province"));//省份
            String jg = RegUtil.checkParam(request.getParameter("jg"));//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"CONSTRUCTIONID\" ID , \"PROJECTNAME\", \"EIAFILETYPE\", \"ACCEPTANCEDATE\" APPROVALDATE, \"NATIONALECONOMYCODE\", " + "\"DATASOURCE\", \"EIAMANAGETYPE\", \"PROJECTADDRESS\", \"PROJECTINVEST\", \"ENVIRONINVEST\", \"PROVINCENAME\", \"DELMARK\", \"LONGITUDE\"," + "\"LATITUDE\", \"NATIONALECONOMYNAME\", \"EIAMANAGENAME\", \"STORAGETIME\", \"CONSREPORTPATH\"," + " to_char(INSERTTIME,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA, \"ISDOWNLOADED\"" + " from \"YZ_CONS\" where 1=1 ";
            String sql1 = "select count(*) from \"YZ_CONS\" where 1=1";
            String sql2 = "";

            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
            if (!name.equals("")) {
                sql2 += " and \"PROJECTNAME\" like'%" + name + "%'";
            }
            if (!jg.equals("")) {
                sql2 += " and \"EIAMANAGENAME\" like'%" + jg + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCENAME\" like'%" + province + "%'";
            }
        /*    if (!jg.equals("")) {
                sql2 += " and \"EVALUATIONUNIT\" like'%" + jg + "%'";
            }*/
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看建设项目数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:遥感核查
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getWrdkYghc" )
    public Map getWrdkYghc(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");//污染企业名称

            String province = request.getParameter("province");//所属行政区
            String status1 = request.getParameter("status");//核查状态

            String production = request.getParameter("production");//是否在产

            String progress = request.getParameter("progress");//核查进度
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,T2.\"QYGM_NAME\" as \"qiye\",ROWNUM RN from (select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", \"LONGITUDE\", \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\", \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", \"SURVEY_STATUS\", \"SURVEY_PROGRESS\", \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", \"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", \"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"SHENG\" ='" + names + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"SHI\" ='" + names + "'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"XIAN\" ='" + names + "'";
            }
            if (!name.equals("")) {
                sql2 += " and \"NAME\" like'%" + name + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"SHENG\" ='" + province + "'";
            }
            if (!status1.equals("")) {
                sql2 += " and \"SURVEY_STATUS\" ='" + status1 + "'";
            }
            if (!production.equals("")) {
                sql2 += " and \"PRODUCTION\" ='" + production + "'";
            }
            if (!progress.equals("")) {
                sql2 += " and \"SURVEY_PROGRESS\" ='" + progress + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 left join \"T_Cod_QYGM\" T2 on T1.\"GUIMO\"=T2.\"QYGM_CODE\") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看遥感核查数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:污染地块
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getWrdkData" )
    public Map getWrdkData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String province = request.getParameter("province");//省
            String wrdkbm = request.getParameter("wrdkbm");//污染地块编码
           /* String lxrxm = request.getParameter("lxrxm");//联系人姓名
            String fddbr = request.getParameter("fddbr");//法定代表人*/
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\", to_char(INSETTIME,'yyyy-mm-dd HH24:mi:ss') \"INSETTIME\" from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select" + " \"WRDKID\", \"WRDKBM\", \"WRDKMC\", \"BZ\", \"POLLUETED\", \"SCJDBM\", \"USER_ID\", \"FXJB\", \"FLAG\", \"TSAMP\", \"PROVINCE_CODE\", \"CITY_CODE\", " + "\"COUNTRY_CODE\", \n" + "\"TYPE\", \"HSLYLX\", \"YTBGLX\", \"TDSYQR\", \"HYLB\", \"HYDM\", \"YTBGBZ\", \"HYLBBZ\", \"WRDK_WZ\", \"WRDK_LNG\", " + "\"WRDK_LAT\", \"WRDK_BOUNDS\", \"WRDK_AREA\", \"WRDK_JSL\",\"WRDK_ADDR\" from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_WRDKJBXXB\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"CITY_CODE\" ='" + regionCode + "'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE_CODE\" = '" + province + "'";
            }

            if (!wrdkbm.equals("")) {
                sql2 += " and \"WRDKBM\" = '" + wrdkbm + "'";
            }

          /*  if (!lxrxm.equals("")) {
                sql2 += " and \"LXRXM\" = '" + lxrxm + "'";
            }*/

           /* if (!fddbr.equals("")) {
                sql2 += " and \"FDDBR\" = '" + fddbr + "'";
            }*/
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\"" + " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看污染地块数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:举报预警
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getReportData" )
    public Map getReportData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");//举报对象
            String label = request.getParameter("label");//详细地址
            String type = request.getParameter("type");//分类
            String province = request.getParameter("province");
            String report = request.getParameter("report");
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"REPORT_ID\", \"EVENT_NUMBER\",to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss') \"REPORT_TIME\" ," + " \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\", \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\", \"REPORT_LATITUDE\"," + " \"PROCESS_AREA_UNITNAME\", \"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\", to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') \"INSERTTIME\"" + " from \"YQ12369_DSJ_REPORTINFO\" where 1=1 ";
            String sql1 = "select count(*) from \"YQ12369_DSJ_REPORTINFO\" where 1=1";
            String sql2 = "";
            if (!type.equals("")) {
                sql2 += " and INDUSTRY_TYPE = " + type;
            }
            if (!name.equals("")) {
                sql2 += " and REPORT_DEPT_NAME like '%" + name + "%'";
            }
            if (!label.equals("")) {
                sql2 += " and LOCATION_LABEL like '%" + label + "%'";
            }
            if (!report.equals("")) {
                sql2 += " and REPORT_FROM = '" + report + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += "order by \"REPORT_FROM\")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                if (map.get("REPORT_CONTENT") == null) {
                    map.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("REPORT_CONTENT");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("REPORT_CONTENT", content1);
                }
                if (map.get("FINALOPINION") == null) {
                    map.put("FINALOPINION", "");
                } else {
                    CLOB clob = (CLOB) map.get("FINALOPINION");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("FINALOPINION", content);
                }

            }
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看12369举报预警数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:舆情预警
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getNetworkData" )
    public Map getNetworkData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String title = request.getParameter("title");//污染企业名称
            String source = request.getParameter("source");//分类
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"id\", \"newsid\", \"url\", \"urlhash\", \"title\", \"content\"," + " \"source\", to_char(\"time\",'yyyy-mm-dd HH24:mi:ss')\"time\", to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\", \"summary\", \"newsType\", \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\"," + " \"DICT_type\", \"mainContentHtml\", \"encoding\", \"codePage\" from \"tb_network_news\" where \"state\"='0' ";
            String sql1 = "select count(*) from \"tb_network_news\" where  \"state\"='0'";
            String sql2 = "";

            if (userlevel.equals("2")) {
                sql2 += " and \"chinaRegion1\" like'%" + names + "%'";
            } else if (userlevel.equals("3")) {
                sql2 += " and \"chinaRegion2\" like'%" + names + "%'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"chinaRegion3\" like'%" + names + "%'";
            }
            if (!title.equals("")) {
                sql2 += " and \"title\" like '%" + title + "%'";
            }
            if (!source.equals("")) {
                sql2 += " and \"source\" like '%" + source + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob1 = (CLOB) map.get("content");
                    String content1 = clob1.getSubString(1, (int) clob1.length());
                    map.put("content", content1);
                }
            }
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
     * 企业信息查询
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXX" )
    public Map getQYXX(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String xxmc = request.getParameter("xxmc");//法人单位名称
            String flmc = request.getParameter("flmc");//行业分类
            String lxmc = request.getParameter("lxmc");//登记注册类型
            String lbmc = request.getParameter("lbmc");//单位类别
            String xxdz = request.getParameter("xxdz");//详细地址
            String sql = "select * from (select T1.*,ROWNUM RN from (select 	\"UUID\",\"WRY_ID\",\"CODE_XZQH\",\"SYND\",\"QYDM\",\"XXMC\",\"FRDM\",\"FRDM_2\",\"FRDB\",\"FLMC\",\"CODE_FLDM\",\"LXMC\",\"CODE_LXDM\",\"CODE_LBDM\",\"LBMC\",\"CODE_GXDM\",\"GXMC\",\"CODE_GMDM\",\"GMMC\",\"DZ_1\",\"DZ_2\",\"DZ_3\",\"DZ_4\",\"DZ_5\",\"JD\",\"SQ\",\"XXDZ\",\"QH\",\"YZBM\",\"DH\",\"FJ\",\"CZ\",\"YJ\",\"WZ\",\"JD_D\",\"JD_F\",\"JD_M\",\"WD_D\",\"WD_F\",\"WD_M\",\"ZDYLBDM\",\"ZDYLBMC\",to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_EEY_QY_XX\" where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_EEY_QY_XX\" where 1=1";

            String sql2 = "";

            if (userlevel.equals("2")) {
                sql2 += " and \"DZ_1\" like'" + names + "%'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"DZ_2\" like'" + names + "%'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"DZ_3\" like'" + names + "%'";
            }
            if (!xxmc.equals("")) {
                sql2 += " and \"XXMC\" like '%" + xxmc + "%'";
            }
            if (!flmc.equals("")) {
                sql2 += " and \"FLMC\" like '%" + flmc + "%'";
            }
            if (!lxmc.equals("")) {
                sql2 += " and \"LXMC\" like '%" + lxmc + "%'";
            }
            if (!lbmc.equals("")) {
                sql2 += " and \"LBMC\" like '%" + lbmc + "%'";
            }
            if (!xxdz.equals("")) {
                sql2 += " and \"XXDZ\" like '%" + xxdz + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业基本信息(持久性有机物)数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业信息查询框数据
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXC" )
    public JSONObject getQYXXC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select FLMC from \"T_BUS_EEY_QY_XX\" where 1=1 GROUP BY FLMC";
            String sql2 = "select LXMC from \"T_BUS_EEY_QY_XX\" where 1=1 GROUP BY LXMC";
            String sql3 = "select LBMC from \"T_BUS_EEY_QY_XX\" where 1=1 GROUP BY LBMC";
            List<Map> FLMCLIST = getBySqlMapper.findRecords(sql1);
            List<Map> LXMCLIST = getBySqlMapper.findRecords(sql2);
            List<Map> LBMCLIST = getBySqlMapper.findRecords(sql3);
            JSONObject obj = new JSONObject();
            obj.put("FLMCLIST", FLMCLIST);
            obj.put("LXMCLIST", LXMCLIST);
            obj.put("LBMCLIST", LBMCLIST);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业排放
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYPF" )
    public Map getQYPF(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String zdylbmc = request.getParameter("zdylbmc");//排放源类别
            String synd = request.getParameter("synd");//统计年度
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"XXMC\" as \"QYName\",ROWNUM RN from (select \"UUID\", \"CODE_XZQH\", \"SYND\", \"QYDM\", \"CODE_ZDYLBDM\", \"ZDYLBMC\", \"ZCL\", \"DW\", \"YSL\", \"LXSL\", \"FQJCPFL\", \"FQGSPFL\", \"PFZL\", \"FHNCL\", \"FZNCL\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_EEY_PFY_GK\"  where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_EEY_PFY_GK\" where 1=1";
            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"CODE_XZQH\" ='" + regionCode + "'";

            }
            if (!zdylbmc.equals("")) {
                sql2 += " and \"ZDYLBMC\" like '%" + zdylbmc + "%'";
            }
            if (!synd.equals("")) {
                sql2 += " and \"SYND\" ='" + synd + "'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"tb_city\" T2 on T1.\"CODE_XZQH\" = T2.\"code\"" + " left join \"T_BUS_EEY_QY_XX\" T3 on T1.\"QYDM\" = T3.\"QYDM\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业排放概况数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业排放下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYPFC" )
    public JSONObject getQYPFC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select * from \"T_Cod_EmissionsSourceType\" where 1=1";
            String sql2 = "select ZDYLBMC from \"T_BUS_EEY_PFY_GK\" where 1=1 GROUP BY ZDYLBMC";
            String sql3 = "select SYND from \"T_BUS_EEY_PFY_GK\" where 1=1 GROUP BY SYND";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> ZDYLBMCLIST = getBySqlMapper.findRecords(sql2);
            List<Map> ndlist = getBySqlMapper.findRecords(sql3);
            JSONObject obj = new JSONObject();
            obj.put("ZDYLBMCLIST", ZDYLBMCLIST);
            obj.put("NDLIST", ndlist);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业信息查询(危险化学品)
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXH" )
    public Map getQYXXH(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String dwmc = request.getParameter("dwmc");//企业名称
            String dz_1 = request.getParameter("dz_1");//行政区划
            String hyflmc = request.getParameter("hyflmc");//行业分类名称
            String zclxmc = request.getParameter("zclxmc");//登记注册类型
            String sql = "select * from (select T1.*,T2.*,ROWNUM RN from (select \"UUID\", \"WRY_ID\", \"DWMC\", \"CYM\", \"QYDM\", \"FDDBR\", \"CODE_XZQH\", \"TJND\", \"DZ_1\", \"DZ_2\", \"DZ_3\", \"DZ_4\", \"DZ_5\", \"DZ_6\", \"YB\", \"ZXJD_D\", \"ZXJD_F\", \"ZXJD_M\", \"ZXWD_D\", \"ZXWD_F\", \"ZXWD_M\", \"WXQY\", \"JRYQ\", \"YQJB\", \"YQJB_QT\", \"YQMC\", \"CODE_YQDM\", \"CODE_HYFLDM\", \"HYFLMC\", \"CODE_ZCLXDM\", \"ZCLXMC\", \"ZCZJ\", \"CQMJ\", \"ZGRS\", \"NSCXS\", \"CODE_QYGMDM\", \"QYGMMC\", \"JCSJ_N\", \"JCSJ_Y\", \"KJSJ_N\", \"KJSJ_Y\", \"DH\", \"CZ\", \"SJ\", \"EMAIL\", \"FQPFL\", \"FSCSL\", \"FSPFL\", \"CODE_FSPFQX\", \"FSPFQXMC\", \"SNSTMC\", \"CODE_SNSTDM\", \"GFCSL\", \"WFCSL\", \"WFCZ_ZX\", \"WFCZ_WT\", \"WFCZJGMC\", \"YJYA\", \"YJYADW\", \"HJPJ\", \"HJPJZZ\", \"HJSG\", \"HJSG_COUNT\", \"DWFZR\", \"SHR\", \"TBR\", \"TBSJ\", \"REMARK\",to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_JH101\" where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_JH101\" where 1=1";

            String sql2 = "";

            if (userlevel.equals("2")) {
                sql2 += " and \"DZ_1\" like'" + names + "%'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"DZ_2\" like'" + names + "%'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"DZ_3\" like'" + names + "%'";
            }

            if (!dwmc.equals("")) {
                sql2 += " and \"DWMC\" like '%" + dwmc + "%'";
            }
            if (!dz_1.equals("")) {
                sql2 += " and \"DZ_1\" like '%" + dz_1 + "%'";
            }
            if (!hyflmc.equals("")) {
                sql2 += " and \"HYFLMC\" like '%" + hyflmc + "%'";
            }
            if (!zclxmc.equals("")) {
                sql2 += " and \"ZCLXMC\" like '%" + zclxmc + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"T_Cod_YQJB\" T2 on T1.\"YQJB\"=T2.\"DM\") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业基本信息(危险化学品)数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 企业信息查询(危险化学品)下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXHC1" )
    public JSONObject getQYXXHC1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3,5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select * from \"tb_city\" where \"level\"='0'";

            List<Map> list = getBySqlMapper.findRecords(sql1);
            String sql2 = "select HYFLMC from \"T_BUS_JH101\" where 1=1 GROUP BY HYFLMC";
            String sql3 = "select ZCLXMC from \"T_BUS_JH101\" where 1=1 GROUP BY ZCLXMC";


            List<Map> HYFLMCLIST = getBySqlMapper.findRecords(sql2);
            List<Map> ZCLXMCLIST = getBySqlMapper.findRecords(sql3);
            JSONObject obj = new JSONObject();
            obj.put("citylist", list);
            obj.put("HYFLMCLIST", HYFLMCLIST);
            obj.put("ZCLXMCLIST", ZCLXMCLIST);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 省查询
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXHC" )
    public JSONObject getQYXXHC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3,5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            String sql1 = "select * from \"tb_city\" where \"level\"='0' and \"code\"!='660000'";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            JSONObject result = new JSONObject();
            result.put("rows", list);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 产品清单
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getCPQD" )
    public Map getCPQD(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String cpmc = request.getParameter("cpmc");//产品名称
            String wxhxp = request.getParameter("wxhxp");//是否属于危险化学品
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"DWMC\" as \"DWMC\",ROWNUM RN from (select \"UUID\", \"QYDM\", \"CODE_XZQH\", \"TJND\", \"BH\", \"CPMC\", \"CAS\", \"WXHXP\", \"CN\", \"CL\", \"ZCL\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_JH102\"  where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_JH102\" where 1=1";
            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"CODE_XZQH\" ='" + regionCode + "'";
            }
            if (!cpmc.equals("")) {
                sql2 += " and \"CPMC\" like '%" + cpmc + "%'";
            }
            if (!wxhxp.equals("")) {
                sql2 += " and \"WXHXP\" like '%" + wxhxp + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"tb_city\" T2 on T1.\"CODE_XZQH\" = T2.\"code\"" + " left join \"T_BUS_JH101\" T3 on T1.\"QYDM\" = T3.\"QYDM\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看产品清单数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业信息查询(汞调查)
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXG" )
    public Map getQYXXG(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String dwmc = request.getParameter("dwmc");//企业名称
            String hyfl = request.getParameter("hyfl");//行业分类
            String qyzclxmc = request.getParameter("qyzclxmc");//登记注册类型
            String sheng = request.getParameter("sheng");//省份
            String sql = "select * from (select T1.*,T2.\"Name\" as \"danwei\",T3.\"Name\" as \"lishu\",T4.\"QYGM_NAME\" as \"qygmmc\",T5.\"Name\" as \"pflbmc\",ROWNUM RN from (select \"UUID\", \"WRY_ID\", \"TJND\", \"DWMC\", \"DWZZJGDM\", \"FDDBR\", \"CODE_XZQH\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"HAO\", \"YZBM\", \"ZXJD\", \"ZXWD\", \"HYFL\", \"CODE_HYFL\", \"QYZCLXMC\", \"CODE_QYZCLX\", \"CODE_DWLB\", \"CODE_LSGX\", \"CODE_QYGM\", \"GYZCZ\", \"JCSJ\", \"CYRS\", \"LXR\", \"LXDH\", \"CZHM\", \"EMAIL\", \"DWWZ\", \"PFYLB\", \"PFYLBMC\", \"DWFZR\", \"SHR\", \"TBR\", \"TBRQ\", \"JD_D\", \"JD_F\", \"JD_M\", \"WD_D\", \"WD_F\", \"WD_M\", \"ISPASSED\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_HBHG101\" where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_HBHG101\" where 1=1";

            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"SHENG\" like'" + names + "%'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"SHI\" like'" + names + "%'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"XIAN\" like'" + names + "%'";
            }

            if (!dwmc.equals("")) {
                sql2 += " and \"DWMC\" like '%" + dwmc + "%'";
            }
            if (!hyfl.equals("")) {
                sql2 += " and \"HYFL\" like '%" + hyfl + "%'";
            }
            if (!qyzclxmc.equals("")) {
                sql2 += " and \"QYZCLXMC\" like '%" + qyzclxmc + "%'";
            }
            if (!sheng.equals("")) {
                sql2 += " and \"SHENG\" like '%" + sheng + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"T_Cod_OrganizationType\" T2 on T1.\"CODE_DWLB\"=T2.\"Code\" left join \"T_Cod_Subjection\" T3 on T1.\"CODE_LSGX\"=T3.\"Code\" left join \"T_Cod_QYGM\" T4 on T1.\"CODE_QYGM\"=T4.\"QYGM_CODE\" left join \"T_Cod_EmissionsSourceType\" T5 on T1.\"PFYLB\"=T5.\"Code\") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业基本信息(汞调查)数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业信息查询(汞调查)下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXGC" )
    public JSONObject getQYXXGC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select * from \"tb_city\" where \"level\"='0'";

            List<Map> list = getBySqlMapper.findRecords(sql1);
            String sql2 = "select HYFL from \"T_BUS_HBHG101\" where 1=1 GROUP BY HYFL";
            String sql3 = "select QYZCLXMC from \"T_BUS_HBHG101\" where 1=1 GROUP BY QYZCLXMC";


            List<Map> HYFLLIST = getBySqlMapper.findRecords(sql2);
            List<Map> QYZCLXMCLIST = getBySqlMapper.findRecords(sql3);
            JSONObject obj = new JSONObject();
            obj.put("citylist", list);
            obj.put("HYFLLIST", HYFLLIST);
            obj.put("QYZCLXMCLIST", QYZCLXMCLIST);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业汞排放源概况子表
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYGPFZ" )
    public Map getQYGPFZ(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String tjnd = request.getParameter("tjnd");//企业名称
            String cphylmc = request.getParameter("cphylmc");//行政区划
            String sfdb = request.getParameter("sfdb");//行业分类名称
            String sql = "select * from (select T1.*,T2.\"Name\" as \"pflbmc\",ROWNUM RN from (select \"UUID\", \"TJND\", \"XH\", \"PFYLB\", \"CPHYLMC\", \"CN\", \"CL\", \"PFYSL\", \"SJYGZL\", \"CPHGZL\", \"PFFSHGL\", \"PFFQHGL\", \"GTFWHGL\", \"HSGL\", \"SFDB\", \"PFYLB_SUB\", \"PFFSCSL\", \"PFFQCSL\", \"GTFWCSL\", \"PFFSPFL\", \"PFFQPFL\", \"GTFWPFL\", \"HSL\", \"QYDBL\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_HBHG201_SUB\" where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_HBHG201_SUB\" where 1=1";

            String sql2 = "";
            if (!tjnd.equals("")) {
                sql2 += " and \"TJND\" like '%" + tjnd + "%'";
            }
            if (!cphylmc.equals("")) {
                sql2 += " and \"CPHYLMC\" like '%" + cphylmc + "%'";
            }
            if (!sfdb.equals("")) {
                sql2 += " and \"SFDB\" like '%" + sfdb + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"T_Cod_EmissionsSourceType\" T2 on T1.\"PFYLB\"=T2.\"Code\") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业汞排放源概况数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 企业信息查询(汞调查)下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYGPFZC" )
    public JSONObject getQYGPFZC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select TJND from \"T_BUS_HBHG201_SUB\" where 1=1 GROUP BY TJND";

            List<Map> TJNDLIST = getBySqlMapper.findRecords(sql1);
            String sql2 = "select CPHYLMC from \"T_BUS_HBHG201_SUB\" where 1=1 GROUP BY CPHYLMC";


            List<Map> CPHYLMCLIST = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();
            obj.put("TJNDLIST", TJNDLIST);
            obj.put("CPHYLMCLIST", CPHYLMCLIST);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 原生汞生产情况_固体废物去向
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getYSGSC" )
    public Map getYSGSC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String hggtfwzl = request.getParameter("hggtfwzl");//企业名称
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"UUID\", \"TJND\", \"XH\", \"SSSDS\", \"CZJGMC\", \"HGGTFWZL\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_HBHG301_GFQX\" where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_HBHG301_GFQX\" where 1=1";

            String sql2 = "";
            if (!hggtfwzl.equals("")) {
                sql2 += " and \"HGGTFWZL\" like '%" + hggtfwzl + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看原生汞生产情况_固体废物去向数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 含汞试剂生产_含汞固体废物去向
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getHGSJ" )
    public Map getHGSJ(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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

            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String hggtfwczjgmc = request.getParameter("hggtfwczjgmc");//企业名称
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"UUID\", \"TJND\", \"SHENGSHI\", \"HGGTFWCZJGMC\", \"HGGTFWZL\", to_char(\"UPDATETIME\",'yyyy-mm-dd HH24:mi:ss') \"UPDATETIME\" from \"T_BUS_HBHG302_GFQX\" where 1=1 ";
            String sql1 = "select count(*) from \"T_BUS_HBHG302_GFQX\" where 1=1";

            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"SHENGSHI\" like'" + names.substring(0, 2) + "%'";

            }
            if (!hggtfwczjgmc.equals("")) {
                sql2 += " and \"HGGTFWCZJGMC\" like '%" + hggtfwczjgmc + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看含汞试剂生产_含汞固体废物去向数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    /**
     * 企业信息（固废）
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getQYXXGF" )
    public Map getQYXXGF(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String dwmc = request.getParameter("dwmc");//企业名称
            String dwszsf = request.getParameter("dwszsf");//企业名称
            String qybz = request.getParameter("qybz");//企业名称
            String sfwfcsy = request.getParameter("sfwfcsy");//企业名称
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select \"LSBH\", \"QYBZ\",to_char(\"SJC\",'yyyy-mm-dd HH24:mi:ss') \"SJC\", \"QYBH\", \"DLMC\", \"YHMM\", \"ZZJGDM\", \"DWMC\", \"DWSZSF\", \"DWSZCS\", \"DWSZQX\", \"DWDZ\", \"XZQHBZBB\", \"JD\", \"WD\", \"YZBM\", \"HYFL1\", \"HYFL2\", \"HYFL3\", \"HYFL4\", \"HYFLBZBB\", \"QYGM\", \"LSGX\", \"FDDBR\", \"FDDBRDH\", \"LXR\", \"LXRDH\", \"LXRCZ\", \"LXRDZYX\", \"LXRSJ\", \"SFWFCSY\", \"SFYFCSY\", \"SFYBGYCSY\", \"SFWSWNCSY\", \"SFWFYS\", \"SFWFJY\", \"SFWFCK\", \"SFJKLY\", \"SHZT\", \"SFZX\", \"SYNC\"  from \"T_ENT_ENTERPRISE\" where 1=1 ";
            String sql1 = "select count(*) from \"T_ENT_ENTERPRISE\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"DWSZSF\" ='" + regionCode + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"DWSZCS\" ='" + regionCode + "'";

            } else if (userlevel.equals("4")) {
                sql2 += " and \"DWSZQX\" ='" + regionCode + "'";

            }
            if (!dwmc.equals("")) {
                sql2 += " and \"DWMC\" like '%" + dwmc + "%'";
            }
            if (!dwszsf.equals("")) {
                sql2 += " and \"DWSZSF\" = '" + dwszsf + "'";
            }
            if (!qybz.equals("")) {
                sql2 += " and \"QYBZ\" like '%" + qybz + "%'";
            }
            if (!sfwfcsy.equals("")) {
                sql2 += " and \"SFWFCSY\" like '%" + sfwfcsy + "%'";
            }

            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"tb_city\" T2 on T1.\"DWSZSF\" = T2.\"code\"" + " left join \"tb_city\" T3 on T1.\"DWSZCS\" = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"DWSZQX\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看企业基本信息(固废)数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 危险废物经营单位基本情况信息
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getWXJY" )
    public Map getWXJY(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String dwmc = request.getParameter("dwmc");//单位名称
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"Name\" as \"danwei\",ROWNUM RN from (select \"BBBH\", \"BBNF\", \"BBDW\", \"DWMC\", \"FRMC\", \"FDDBR\", \"ZS\", \"YZBM\", \"SSDZ\", \"SSXZQHDM\", \"SSJD\", \"SSWD\", \"JJFS\", \"YXQX\",to_char(\"FZRQ\",'yyyy-mm-dd HH24:mi:ss') \"FZRQ\", \"HZNJYZGM\", \"HZNJYCZGM\", \"HZNJYLYGM\", \"XKZBH\", \"FZJG\", \"JYDWLB\", \"SJNJYZGM\", \"SJNJYCZGM\", \"SJNJYLYGM\", \"SGYAQK\", \"YLQK\", \"SGFSCS\", \"JYJLBQK\", \"ZCZ\", \"ZGRS\", \"BFHHBTR\", \"LXR\", \"DZYX\", \"DH\", \"CZ\", \"SJ\", \"DWFZR\",to_char(\"SCRQ\",'yyyy-mm-dd HH24:mi:ss') \"SCRQ\", \"BBZT\", \"FJBCLJ\", \"XKZBHSD\", \"SJWXFWCZL\", \"SJYLFWCZL\", \"TJBZ\", \"YTJLHZL\", \"SJYTJLHZL\", \"HZNJYWXCZGM\", \"HZNJYYLCZGM\"  from \"T_CER_BASEREPORT\" where 1=1 ";
            String sql1 = "select count(*) from \"T_CER_BASEREPORT\" where 1=1";
            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"SSXZQHDM\" = '" + regionCode + "'";
            }
            if (!dwmc.equals("")) {
                sql2 += " and \"DWMC\" like '%" + dwmc + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"tb_city\" T2 on T1.\"SSXZQHDM\" = T2.\"code\" left join \"T_Cod_OrganizationType\" T3 on T1.\"JYDWLB\"=T3.\"Code\") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看危险废物经营单位数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 危险废物填埋场基本情况信息
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getWXTM" )
    public Map getWXTM(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String dwmc = request.getParameter("dwmc");//企业名称
            String sjqh = request.getParameter("sjqh");//企业名称
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select \"BBBH\", \"BBNF\", \"BBDW\", \"DWMC\", \"XKZBH\", \"SJQH\", \"SHIJQH\", \"XJQH\", \"QYLSBH\", \"FZJG\", \"TMCRL\", \"YTMRL\", \"HZTMGM\", \"SJTML\", \"BBZT\",to_char(\"SCRQ\",'yyyy-mm-dd HH24:mi:ss') \"SCRQ\", \"TJBZ\"  from \"T_CER_BURYREPORT\" where 1=1 ";
            String sql1 = "select count(*) from \"T_CER_BURYREPORT\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"SJQH\" ='" + regionCode + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"SHIJQH\" ='" + regionCode + "'";

            } else if (userlevel.equals("4")) {
                sql2 += " and \"XJQH\" ='" + regionCode + "'";

            }
            if (!dwmc.equals("")) {
                sql2 += " and \"DWMC\" like '%" + dwmc + "%'";
            }
            if (!sjqh.equals("")) {
                sql2 += " and \"SJQH\" like '%" + sjqh + "%'";
            }


            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"tb_city\" T2 on T1.\"SJQH\" = T2.\"code\"" + " left join \"tb_city\" T3 on T1.\"SHIJQH\" = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"XJQH\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看危险废物填埋场数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 全国土壤污染状况详查质量控制实验室名录
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZLKZSYS" )
    public Map getZLKZSYS(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String laboratory_name = request.getParameter("laboratory_name");//实验室名称
            String working_range = request.getParameter("working_range");//实验室所在省
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_laboratory_QC\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_laboratory_QC\" where 1=1";

            String sql2 = "";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"working_range\" ='" + names + "'";

            }
            if (!laboratory_name.equals("")) {
                sql2 += " and \"laboratory_name\" like '%" + laboratory_name + "%'";
            }
            if (!working_range.equals("")) {
                sql2 += " and \"working_range\" like '%" + working_range + "%'";
            }

            sql += sql2;
            sql1 += sql2;

            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看土壤污染状况详查质量控制实验室数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    /**
     * 二噁英实验室
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getREYSYS" )
    public Map getREYSYS(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String laboratory_name = request.getParameter("laboratory_name");//实验室名称
            String working_range = request.getParameter("working_range");//实验室所在省
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_laboratory_Dioxin\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_laboratory_Dioxin\" where 1=1";

            String sql2 = "";

            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"working_range\" ='" + names + "'";

            }
            if (!laboratory_name.equals("")) {
                sql2 += " and \"laboratory_name\" like '%" + laboratory_name + "%'";
            }
            if (!working_range.equals("")) {
                sql2 += " and \"working_range\" like '%" + working_range + "%'";
            }

            sql += sql2;
            sql1 += sql2;

            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看二噁英实验室数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    /**
     * 土壤环境管理专家库
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZJK" )
    public Map getZJK(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");//专家名称
            String department = request.getParameter("department");//所属部门
            String field = request.getParameter("field");//研究领域
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_experts\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_experts\" where 1=1";

            String sql2 = "";
            if (!name.equals("")) {
                sql2 += " and \"name\" like '%" + name + "%'";
            }
            if (!field.equals("")) {
                sql2 += " and \"field\" like '%" + field + "%'";
            }
            if (!department.equals("")) {
                sql2 += " and \"department\" like '%" + department + "%'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看土壤环境管理专家库数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /*获取上传数据站点文件数据*/
    @RequestMapping( "getFileJson" )
    @Transactional( rollbackFor = Exception.class )
    public EdatResult uploadFile(@RequestParam( "file" ) MultipartFile file, HttpServletRequest request, HttpServletResponse response) throws Exception {
        ClientUtil.SetCharsetAndHeader(request, response);
        int status = Check.CheckRight(request, "5");
        if (status != 0) {
            return EdatResult.build(status, "");
        }
        String type = request.getParameter("type");
        Workbook book = null;
        if (!file.isEmpty()) {
            List<Map> list = new ArrayList<>();
            try {
                book = WorkbookFactory.create(file.getInputStream());
                Sheet sheet = book.getSheetAt(0);
                int firstRowNum = sheet.getFirstRowNum();
                int lastRowNum = sheet.getLastRowNum();
                // 循环除了第一行的所有行
                List list1 = new ArrayList();
                List list2 = new ArrayList();
                List list3 = new ArrayList();
                List list4 = new ArrayList();
                List list5 = new ArrayList();
                List list6 = new ArrayList();
                if (type.equals("1")) {
                    for (int rowNum = firstRowNum + 1; rowNum <= lastRowNum; rowNum++) {
                        // 获得当前行
                        Row row = sheet.getRow(rowNum);
                        if (row == null || row.getCell(0) == null || ExcelUtil.getCellValue(row.getCell(0)) == "") {
                            continue;
                        } else {
                            Map map = new HashMap();
                            map.put("num", ExcelUtil.getCellValue(row.getCell(0)));
                            String province = ExcelUtil.getCellValue(row.getCell(1));
                            String city = ExcelUtil.getCellValue(row.getCell(2));
                            String county = ExcelUtil.getCellValue(row.getCell(3));
                            String address = ExcelUtil.getCellValue(row.getCell(8));
                            String name = ExcelUtil.getCellValue(row.getCell(4));
                            String enterpriceType = ExcelUtil.getCellValue(row.getCell(5));
                            String lon = ExcelUtil.getCellValue(row.getCell(9));
                            String lat = ExcelUtil.getCellValue(row.getCell(10));
                            String code = ExcelUtil.getCellValue(row.getCell(6));
                            String legend = ExcelUtil.getCellValue(row.getCell(7));
                            String time = ExcelUtil.getCellValue(row.getCell(11));
                            String note = ExcelUtil.getCellValue(row.getCell(12));
                            map.put("province", province);
                            map.put("name", name);
                            map.put("code", code);
                            map.put("city", city);
                            map.put("county", county);
                            map.put("address", address);
                            map.put("enterpriceType", enterpriceType);
                            map.put("lon", lon);
                            map.put("lat", lat);
                            map.put("legend", legend);
                            map.put("time", time);
                            map.put("note", note);
                            if (list1.contains(province + "-" + name)) {
                                if (!list3.contains(province + "-" + name)) {
                                    list3.add(province + "-" + name);
                                }
                            }
                            if (list2.contains(code)) {
                                if (!list4.contains(code)) {
                                    list4.add(code);
                                }
                            }
                            String sql = "select 1 from \"tb_datasite\" where \"province\" = '" + province + "' and \"name\" = '" + name + "'";
                            if (getBySqlMapper.findRecords(sql).size() > 0) {
                                if (!list5.contains(province + "-" + name)) {
                                    list5.add(province + "-" + name);
                                }
                            }
                            String sql1 = "select 1 from \"tb_datasite\" where \"code\" = '" + code + "'";
                            if (getBySqlMapper.findRecords(sql1).size() > 0) {
                                if (!list6.contains(code)) {
                                    list6.add(code);
                                }
                            }
                            list1.add(province + "-" + name);
                            list2.add(code);
                            list.add(map);
                        }
                    }
                } else if (type.equals("2")) {
                    for (int rowNum = firstRowNum + 1; rowNum <= lastRowNum; rowNum++) {
                        // 获得当前行
                        Row row = sheet.getRow(rowNum);
                        if (row == null || row.getCell(0) == null || ExcelUtil.getCellValue(row.getCell(0)) == "") {
                            continue;
                        } else {
                            Map map = new HashMap();
                            map.put("num", ExcelUtil.getCellValue(row.getCell(0)));
                            String province = ExcelUtil.getCellValue(row.getCell(1));
                            String city = ExcelUtil.getCellValue(row.getCell(2));
                            String county = ExcelUtil.getCellValue(row.getCell(3));
                            String address = ExcelUtil.getCellValue(row.getCell(4));
                            String name = ExcelUtil.getCellValue(row.getCell(5));
                            String enterpriceType = ExcelUtil.getCellValue(row.getCell(6));
                            String lon = ExcelUtil.getCellValue(row.getCell(9));
                            String lat = ExcelUtil.getCellValue(row.getCell(10));
                            String code = ExcelUtil.getCellValue(row.getCell(7));
                            String legend = ExcelUtil.getCellValue(row.getCell(10));
                            String time = ExcelUtil.getCellValue(row.getCell(8));
                            String note = ExcelUtil.getCellValue(row.getCell(12));
                            map.put("province", province);
                            map.put("name", name);
                            map.put("code", code);
                            map.put("city", city);
                            map.put("county", county);
                            map.put("address", address);
                            map.put("enterpriceType", enterpriceType);
                            map.put("lon", lon);
                            map.put("lat", lat);
                            map.put("legend", legend);
                            map.put("time", time);
                            map.put("note", note);
                            list.add(map);
                        }
                    }
                }
                Map res = new HashMap();
                res.put("result", list);
                res.put("errors", list3);//文件中省内企业名称冲突
                res.put("errors1", list4);//文件中组织机构代码冲突
                res.put("errors2", list5);//与库中省内企业名称冲突
                res.put("errors3", list6);//与库中组织机构代码冲突
                return EdatResult.ok(res);
            } catch (Exception e) {
                throw new RuntimeException(e.getMessage());
            } finally {
                if (book != null) {
                    book.close();
                }
            }
        } else {
            return EdatResult.build(1, "没有文件");
        }
    }

    @RequestMapping( "getFileJson1" )
    @Transactional( rollbackFor = Exception.class )
    public EdatResult getFileJson1(@RequestParam( "file" ) MultipartFile file, HttpServletRequest request, HttpServletResponse response) throws Exception {
        ClientUtil.SetCharsetAndHeader(request, response);
        int status = Check.CheckRight(request, "5");
        if (status != 0) {
            return EdatResult.build(status, "");
        }
        String type = request.getParameter("type");
        Workbook book = null;
        if (!file.isEmpty()) {
            List<Map> list = new ArrayList<>();
            try {
                book = WorkbookFactory.create(file.getInputStream());
                Sheet sheet = book.getSheetAt(0);
                int firstRowNum = sheet.getFirstRowNum();
                int lastRowNum = sheet.getLastRowNum();
                // 循环除了第一行的所有行
                List list1 = new ArrayList();
                List list2 = new ArrayList();
                List list3 = new ArrayList();
                List list4 = new ArrayList();
                List list5 = new ArrayList();
                List list6 = new ArrayList();
                List titles = new ArrayList();
                Row row1 = sheet.getRow(firstRowNum);
                int len = row1.getLastCellNum();
                for (int i = 0; i < len; i++) {
                    titles.add(ExcelUtil.getCellValue(row1.getCell(i)));
                }
                for (int rowNum = firstRowNum + 1; rowNum <= lastRowNum; rowNum++) {
                    // 获得当前行
                    Row row = sheet.getRow(rowNum);
                    if (row == null || row.getCell(0) == null || ExcelUtil.getCellValue(row.getCell(0)) == "") {
                        continue;
                    } else {
                        Map map = new HashMap();
                        for (int j = 0; j < len; j++) {
                            map.put("par" + j, ExcelUtil.getCellValue(row.getCell(j)));
                        }
                        String province = ExcelUtil.getCellValue(row.getCell(1));
                        String city = ExcelUtil.getCellValue(row.getCell(2));
                        String county = ExcelUtil.getCellValue(row.getCell(3));
                        String name = ExcelUtil.getCellValue(row.getCell(4));
                        String code = ExcelUtil.getCellValue(row.getCell(5));
                        if (list1.contains(province + "-" + name)) {
                            if (!list3.contains(province + "-" + name)) {
                                list3.add(province + "-" + name);
                            }
                        }
                        if (list2.contains(code)) {
                            if (!list4.contains(code)) {
                                list4.add(code);
                            }
                        }
                        String sql = "select 1 from \"tb_datasite\" where \"province\" = '" + province + "' and \"name\" = '" + name + "'";
                        if (getBySqlMapper.findRecords(sql).size() > 0) {
                            if (!list5.contains(province + "-" + name)) {
                                list5.add(province + "-" + name);
                            }
                        }
                        String sql1 = "select 1 from \"tb_datasite\" where \"code\" = '" + code + "'";
                        if (getBySqlMapper.findRecords(sql1).size() > 0) {
                            if (!list6.contains(code)) {
                                list6.add(code);
                            }
                        }
                        list1.add(province + "-" + name);
                        list2.add(code);
                        list.add(map);
                    }
                }
                Map res = new HashMap();
                res.put("titles", titles);
                res.put("result", list);
                res.put("errors", list3);//文件中省内企业名称冲突
                res.put("errors1", list4);//文件中组织机构代码冲突
                res.put("errors2", list5);//与库中省内企业名称冲突
                res.put("errors3", list6);//与库中组织机构代码冲突
                return EdatResult.ok(res);
            } catch (Exception e) {
                throw new RuntimeException(e.getMessage());
            } finally {
                if (book != null) {
                    book.close();
                }
            }
        } else {
            return EdatResult.build(1, "没有文件");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:数据站点信息入库
     * @Date:13:49 2017/11/8
     */
    @RequestMapping( "addDatasite" )
    public EdatResult addDatasite(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            JSONArray array = data.getJSONArray("array");
            String type = data.getString("type");
            HttpSession session = request.getSession();
            String name = (String) session.getAttribute("userName");
            for (int i = 0; i < array.size(); i++) {
                Map tem = array.getJSONObject(i);
                String province = tem.get("province") == null ? "" : tem.get("province").toString();
                String name1 = tem.get("name") == null ? "" : tem.get("name").toString();
                String code = tem.get("code") == null ? "" : tem.get("code").toString();
                String sql = "insert when (not exists (select 1 from \"tb_datasite\" where \"code\" = '" + code + "' or (\"province\" = '" + province + "' and \"name\"='" + name1 + "'))) then " + " into \"tb_datasite\"(\"id\", \"province\", \"code\",\"name\",\"legal_person\", \"publish_time\", \"add_person\", \"add_time\") " + " values (DATASITE_SEQ.nextval,'" + province + "','" + code + "','" + name1 + "','" + (tem.get("legalPerson") == null ? "" : tem.get("legalPerson").toString()) + "'," + "to_date ( '" + (tem.get("time") == null ? "" : tem.get("time").toString()) + "' , 'YYYY-MM-DD HH24:MI:SS' )," + name + ",sysdate) select 1 from dual";
                getBySqlMapper.insert(sql);
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * 接口服务查询
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getJKFWC" )
    public JSONObject getJKFWC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select * from \"tb_interface\" where 1=1 order by \"interface_id\"";

            List<Map> tb_interface = getBySqlMapper.findRecords(sql1);
            JSONObject obj = new JSONObject();
            obj.put("tb_interface", tb_interface);

            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 重点行业企业
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZDHQ" )
    public Map getZDHQ(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String province = request.getParameter("province");//企业名称
            String industry = request.getParameter("industry");//企业名称
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select \"id\", \"province\", \"city\", \"district\", \"county\", \"town\", \"street\", \"road\", \"enterpriseName\", \"administrativeRegionCode\", \"unifiedSocialCreditIdentifier\", \"organizingInstitutionBarCode\", \"industry\", \"remark\", \"enabled\", \"latitude\", \"longitude\", \"createTime\", \"updateTime\", \"mainContaminant\", \"date\", \"address\", \"phone\" from \"tb_key_industry_enterprise\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_key_industry_enterprise\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"province\" ='" + regionCode + "'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"city\" ='" + regionCode + "'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"administrativeRegionCode\" ='" + regionCode + "'";
            }
            if (!province.equals("")) {
                sql2 += " and \"province\" = '" + province + "'";
            }
            if (!industry.equals("")) {
                sql2 += " and \"industry\" = '" + industry + "'";
            }


            sql += sql2;
            sql1 += sql2;

            sql += ")T1 left join \"tb_city\" T2 on T1.\"province\" = T2.\"code\"" + " left join \"tb_city\" T3 on T1.\"city\" = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"administrativeRegionCode\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看重点行业企业数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 重点行业企业下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZDHQS" )
    public JSONObject getZDHQS(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }

            String sql1 = "select \"industry\" from \"tb_key_industry_enterprise\" where 1=1 group by \"industry\"";

            List<Map> industry = getBySqlMapper.findRecords(sql1);
            String sql2 = "select * from \"tb_city\" where \"level\"='0'";

            List<Map> codes = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();

            obj.put("industry", industry);
            obj.put("codes", codes);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 网络舆情
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getWLYQ" )
    public Map getWLYQ(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String newsType = request.getParameter("newsType");//企业名称
            String sql = "select * from (select \"id\", \"newsid\", \"url\", \"urlhash\", \"title\", \"content\", "
            + " \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\",to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss') \"fetchTime\","
            + " \"summary\", \"newsType\", \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\", \"DICT_type\", "
            + " \"mainContentHtml\", \"encoding\", \"codePage\", \"state\", \"titlesimhash\", \"contentsimhash\",ROWNUM RN"
            + " from \"tb_network_news\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_network_news\" where 1=1";
            String sql2 = "";
            if (userlevel.equals("2")) {
                sql2 += " and \"chinaRegion1\" like'%" + names + "%'";

            } else if (userlevel.equals("3")) {
                sql2 += " and \"chinaRegion2\" like'%" + names + "%'";
            } else if (userlevel.equals("4")) {
                sql2 += " and \"chinaRegion3\" like'%" + names + "%'";
            }

            if (!newsType.equals("")) {
                sql2 += " and \"newsType\" = '" + newsType + "'";
            }
            sql += sql2;
            sql1 += sql2;

            sql += ") where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);

            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                CLOB clob = (CLOB) map.get("content");
                String content = clob.getSubString(1, (int) clob.length());
                map.put("content", content);
            }


            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看网络舆情数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 网络舆情下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getWLYQC" )
    public JSONObject getWLYQC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            String sql2 = "select \"newsType\" from \"tb_network_news\" where 1=1 group by \"newsType\"";

            List<Map> newsType = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();

            obj.put("newsType", newsType);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 专家库下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZJKC" )
    public JSONObject getZJKC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            String sql1 = "select \"department\" from \"tb_experts\" where 1=1 group by \"department\"";
            String sql2 = "select \"field\" from \"tb_experts\" where 1=1 group by \"field\"";
            List<Map> department = getBySqlMapper.findRecords(sql1);
            List<Map> field = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();

            obj.put("department", department);
            obj.put("field", field);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * 专家库下拉框查询条件
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getGYFSC" )
    public JSONObject getGYFSC(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            String sql1 = "select \"ONE_BUSINESSNAME\" from \"T_GY_WASTEBASCIMESSAGE\" where ONE_BUSINESSNAME!='null' group by \"ONE_BUSINESSNAME\"";
            String sql2 = "select * from \"tb_city\"";
            List<Map> ONE_BUSINESSNAME = getBySqlMapper.findRecords(sql1);
            List<Map> city = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();

            obj.put("ONE_BUSINESSNAME", ONE_BUSINESSNAME);
            obj.put("city", city);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 涉重有色金属采矿权 查询条件下拉框
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getCKQCX" )
    public JSONObject getCKQCX(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            String sql1 = "SELECT \"kcfs\" FROM \"mlr_mining_rights\" GROUP BY \"kcfs\" order by \"kcfs\"";
            String sql2 = "SELECT \"kz\" FROM \"mlr_mining_rights\" GROUP BY \"kz\" order by \"kz\"";
            List<Map> ONE_BUSINESSNAME = getBySqlMapper.findRecords(sql1);
            List<Map> city = getBySqlMapper.findRecords(sql2);
            JSONObject obj = new JSONObject();
            obj.put("kcfs", ONE_BUSINESSNAME);
            obj.put("kz", city);
            JSONObject result = new JSONObject();
            result.put("data", obj);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 涉重有色金属采矿权 条件查询
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getCKQ" )
    public Map getCKQ(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String xkzh = request.getParameter("xkzh");//许可证号
            String ksmc = request.getParameter("ksmc");//矿山名称
            String kyqr = request.getParameter("kyqr");//矿业权人
            String kz = request.getParameter("kz");//矿种
            String kcfs = request.getParameter("kcfs");//开采方式
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"mlr_mining_rights\" where 1=1 ";
            String sql1 = "select count(*) from \"mlr_mining_rights\" where 1=1";
            String sql2 = "";
            if (!xkzh.equals("")) {
                sql2 += " and \"xkzh\" like '%" + xkzh + "%'";
            }
            if (!ksmc.equals("")) {
                sql2 += " and \"ksmc\" like '%" + ksmc + "%'";
            }
            if (!kyqr.equals("")) {
                sql2 += " and \"kyqr\" like '%" + kyqr + "%'";
            }
            if (!kz.equals("")) {
                sql2 += " and \"kz\" = '" + kz + "'";
            }
            if (!kcfs.equals("")) {
                sql2 += " and \"kcfs\" = '" + kcfs + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看涉重有色金属采矿权项目数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 根据行政区划查询code
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getCODE" )
    public JSONObject getCODE(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                JSONObject map = new JSONObject();
                map.put("status", status);
                return map;
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
            String sql1 = "select \"code\" from \"tb_city\" where \"name\"='" + name + "'";
            List<Map> code = getBySqlMapper.findRecords(sql1);
            JSONObject result = new JSONObject();
            result.put("data", code);
            result.put("total", 0);
            result.put("page", 0);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    //二噁英实验室下载
    @RequestMapping( "getREYSYSex" )
    public EdatResult getREYSYSex(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
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
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_laboratory_Dioxin\" where 1=1 ";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"working_range\" ='" + names + "'";
            }
            sql += ")T1 )";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, String> map = new LinkedHashMap();
            map.put("laboratory_name", "实验室名称");
            map.put("working_range", "工作范围");
            map.put("recommendation_department", "推荐部门");
            String geturl = urlUtil.geturl();
            String writes = ExcelUtils.writes(list, map, "二噁英实验室", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    //专家库下载
    @RequestMapping( "getZJKex" )
    public EdatResult getZJKex(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_experts\" where 1=1 ";
            sql += ")T1 )";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, String> map = new LinkedHashMap();
            map.put("name", "专家名称");
            map.put("field", "擅长领域");
            map.put("department", "所属部门");
            String geturl = urlUtil.geturl();
            String writes = ExcelUtils.writes(list, map, "土壤环境管理专家库", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    //全国土壤污染状况详查质量控制实验室名录下载
    @RequestMapping( "getZLKZSYSex" )
    public EdatResult getZLKZSYSex(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
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
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_laboratory_QC\" where 1=1 ";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"working_range\" ='" + names + "'";
            }
            sql += ")T1 )";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, String> map = new LinkedHashMap();

            map.put("laboratory_name", "实验室名称");
            map.put("working_range", "工作范围");
            map.put("recommendation_department", "推荐部门");
            String geturl = urlUtil.geturl();
            String writes = ExcelUtils.writes(list, map, "全国土壤污染状况详查质量控制实验室名录", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    //实验室名录下载
    @RequestMapping( "getLaboratoryex" )
    public EdatResult getLaboratoryex(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
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
            String sql = "select * from (select T1.*,rownum RN from (select * from \"tb_laboratory\" where 1=1 ";
            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql += " and \"working_range\" like '" + names + "%'";
            }
            sql += ")T1 )";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, String> map = new LinkedHashMap();
            map.put("laboratory_name", "实验室名称");
            map.put("domain_soil_heavymetal", "监测领域范围(土壤重金属)");
            map.put("domain_soil_pahs", "监测领域范围(土壤PAHs)");
            map.put("domain_ariculture_heavymetal", "监测领域范围(农产品重金属)");
            map.put("working_range", "检测工作范围");
            map.put("recommendation_department", "推荐部门");
            String geturl = urlUtil.geturl();
            String writes = ExcelUtils.writes(list, map, "实验室名录", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @RequestMapping( "getRefreshData" )
    public EdatResult getRefreshData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getString("startTime");
            ;
            String endTime = data.getString("endTime");
            JSONArray table = data.getJSONArray("tables");
            int type = data.getInt("type");//1天、2周、3月 统计单位
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-M-d");
            List result = new ArrayList();
            LocalDate time1 = LocalDate.parse(startTime);
            LocalDate time2 = LocalDate.now();
            if (!endTime.equals("")) {
                time2 = LocalDate.parse(endTime);
            }
            List<String> times = new ArrayList();
            List names = new ArrayList();
            if (type == 1) {//天
                while (time1.isBefore(time2)) {
                    times.add(time1.toString());
                    time1 = time1.plusDays(1);
                }
                times.add(time1.toString());

                for (int i = 0; i < table.size(); i++) {
                    String t = table.getString(i);
                    Map tem = new HashMap();
                    String sql0 = "select \"name\" from \"tb_source_metadata\" where \"table_name\" = '" + t + "'";
                    List<Map> tt = getBySqlMapper.findRecords(sql0);
                    if (tt == null || tt.size() < 1) {
                        continue;
                    }
                    tem.put("table", t);
                    tem.put("name", tt.get(0).get("name"));
                    names.add(tt.get(0).get("name"));
                    String sql = "select TO_CHAR(INSERTTIME，'yyyy-mm-dd') DAY,count(1) NUM from \"" + t + "\" where 1=1 ";
                    if (!startTime.equals("")) {
                        sql += " and INSERTTIME >= to_date('" + startTime + " 00:00:00','yyyy-mm-dd HH24:mi:ss')";
                    }
                    if (!endTime.equals("")) {
                        sql += " and INSERTTIME <= to_date('" + endTime + " 23:59:59','yyyy-mm-dd HH24:mi:ss')";
                    }
                    sql += " group by TO_CHAR(INSERTTIME，'yyyy-mm-dd') order by DAY asc";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    int num = 0;
                    int pos = 0;
                    int len = times.size();
                    List<Integer> da = new ArrayList();
                    while (pos < len && num < list.size()) {
                        String time = times.get(pos);
                        if (list.get(num).get("DAY").toString().equals(time)) {
                            pos++;
                            da.add(Integer.parseInt(list.get(num).get("NUM").toString()));
                            num++;
                        } else {
                            pos++;
                            da.add(0);
                        }
                    }
                    while (pos < len) {
                        da.add(0);
                        pos++;
                    }
                    tem.put("data", da);
                    result.add(tem);
                }
            } else if (type == 2) {//周
                int w = time1.getDayOfWeek().getValue();
                if (w != 1) {
                    time1 = time1.plusDays(1 - w);
                }
                while (!time1.isAfter(time2)) {
                    times.add(time1.toString());
                    time1 = time1.plusWeeks(1);
                }
                for (int i = 0; i < table.size(); i++) {
                    String t = table.getString(i);
                    Map tem = new HashMap();
                    String sql0 = "select \"name\" from \"tb_source_metadata\" where \"table_name\" = '" + t + "'";
                    List<Map> tt = getBySqlMapper.findRecords(sql0);
                    if (tt == null || tt.size() < 1) {
                        continue;
                    }
                    tem.put("table", t);
                    tem.put("name", tt.get(0).get("name"));
                    names.add(tt.get(0).get("name"));
                    String sql = "select to_char(next_day(INSERTTIME+15/24 - 7,2),'YYYY-MM-DD') WEEK,count(1) NUM from \"" + t + "\" where 1=1 ";
                    if (!startTime.equals("")) {
                        sql += " and INSERTTIME >= to_date('" + startTime + " 00:00:00','yyyy-mm-dd HH24:mi:ss')";
                    }
                    if (!endTime.equals("")) {
                        sql += " and INSERTTIME <= to_date('" + endTime + " 23:59:59','yyyy-mm-dd HH24:mi:ss')";
                    }
                    sql += " group by to_char(next_day(INSERTTIME+15/24 - 7,2),'YYYY-MM-DD')  order by WEEK asc";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    int num = 0;
                    int pos = 0;
                    int len = times.size();
                    List<Integer> da = new ArrayList();
                    while (pos < len && num < list.size()) {
                        String time = times.get(pos);
                        if (LocalDate.parse(list.get(num).get("WEEK").toString(), formatter).equals(LocalDate.parse(time, formatter))) {
                            pos++;
                            da.add(Integer.parseInt(list.get(num).get("NUM").toString()));
                            num++;
                        } else {
                            pos++;
                            da.add(0);
                        }
                    }
                    while (pos < len) {
                        da.add(0);
                        pos++;
                    }
                    tem.put("data", da);
                    result.add(tem);
                }
            } else if (type == 3) {//月
                while (time1.isBefore(time2)) {
                    times.add(time1.getYear() + "-" + time1.getMonthValue());
                    time1 = time1.plusMonths(1);
                }
                if (time1.getMonthValue() == time2.getMonthValue()) {
                    times.add(time1.getYear() + "-" + time1.getMonthValue());
                }
                for (int i = 0; i < table.size(); i++) {
                    String t = table.getString(i);
                    Map tem = new HashMap();
                    String sql0 = "select \"name\" from \"tb_source_metadata\" where \"table_name\" = '" + t + "'";
                    List<Map> tt = getBySqlMapper.findRecords(sql0);
                    if (tt == null || tt.size() < 1) {
                        continue;
                    }
                    tem.put("table", t);
                    tem.put("name", tt.get(0).get("name"));
                    names.add(tt.get(0).get("name"));
                    String sql = "select TO_CHAR(INSERTTIME，'yyyy-mm') MONTH,count(1) NUM from \"" + t + "\" where 1=1 ";
                    if (!startTime.equals("")) {
                        sql += " and INSERTTIME >= to_date('" + startTime + " 00:00:00','yyyy-mm-dd HH24:mi:ss')";
                    }
                    if (!endTime.equals("")) {
                        sql += " and INSERTTIME <= to_date('" + endTime + " 23:59:59','yyyy-mm-dd HH24:mi:ss')";
                    }
                    sql += " group by TO_CHAR(INSERTTIME，'yyyy-mm') order by MONTH asc";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    int num = 0;
                    int pos = 0;
                    int len = times.size();
                    List<Integer> da = new ArrayList();
                    while (pos < len && num < list.size()) {
                        String time = times.get(pos);
                        if (LocalDate.parse(list.get(num).get("MONTH").toString() + "-1", formatter).equals(LocalDate.parse(time + "-1", formatter))) {
                            pos++;
                            da.add(Integer.parseInt(list.get(num).get("NUM").toString()));
                            num++;
                        } else {
                            pos++;
                            da.add(0);
                        }
                    }
                    while (pos < len) {
                        da.add(0);
                        pos++;
                    }
                    tem.put("data", da);
                    result.add(tem);
                }
            } else if (type == 4) {//年
                while (time1.isBefore(time2)) {
                    times.add(time1.getYear() + "");
                    time1 = time1.plusYears(1);
                }
                if (time1.getYear() == time2.getYear()) {
                    times.add(time1.getYear() + "");
                }
                for (int i = 0; i < table.size(); i++) {
                    String t = table.getString(i);
                    Map tem = new HashMap();
                    String sql0 = "select \"name\" from \"tb_source_metadata\" where \"table_name\" = '" + t + "'";
                    List<Map> tt = getBySqlMapper.findRecords(sql0);
                    if (tt == null || tt.size() < 1) {
                        continue;
                    }
                    tem.put("table", t);
                    tem.put("name", tt.get(0).get("name"));
                    names.add(tt.get(0).get("name"));
                    String sql = "select TO_CHAR(INSERTTIME，'yyyy') YEAR,count(1) NUM from \"" + t + "\" where 1=1 ";
                    if (!startTime.equals("")) {
                        sql += " and INSERTTIME >= to_date('" + startTime + " 00:00:00','yyyy-mm-dd HH24:mi:ss')";
                    }
                    if (!endTime.equals("")) {
                        sql += " and INSERTTIME <= to_date('" + endTime + " 23:59:59','yyyy-mm-dd HH24:mi:ss')";
                    }
                    sql += " group by TO_CHAR(INSERTTIME，'yyyy') order by YEAR asc";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    int num = 0;
                    int pos = 0;
                    int len = times.size();
                    List<Integer> da = new ArrayList();
                    while (pos < len && num < list.size()) {
                        String time = times.get(pos);
                        if (list.get(num).get("YEAR").toString().equals(time)) {
                            pos++;
                            da.add(Integer.parseInt(list.get(num).get("NUM").toString()));
                            num++;
                        } else {
                            pos++;
                            da.add(0);
                        }
                    }
                    while (pos < len) {
                        da.add(0);
                        pos++;
                    }
                    tem.put("data", da);
                    result.add(tem);
                }
            }
            Map rr = new HashMap();
            rr.put("x", times);
            rr.put("values", result);
            rr.put("names", names);
            return EdatResult.ok(rr);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    @RequestMapping( "getRefreshTable" )
    public EdatResult getRefreshTable(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
            String sql = "select \"name\",\"table_name\" from \"tb_source_metadata\" where \"type\" = 1 ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /*企业基本信息*/
    @RequestMapping( "getENTERPRICE_BASEINFOType" )
    public EdatResult getENTERPRICE_BASEINFOType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select distinct  HYNAME from ENTERPRICE_BASEINFO where HYNAME is not null";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            List result = new ArrayList();
            for (Map map : list1) {
                result.add(map.get("HYNAME").toString());
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /*排污许可证 企业基本信息*/
    @RequestMapping( "getENTERPRICE_BASEINFO" )
    public Map getENTERPRICE_BASEINFO(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");//专家名称
            String type = request.getParameter("type");//所属部门
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"DATAID\", \"ENTERID\", \"XKZNUM\", \"DEVCOMPANY\", \"REGADDRESS\", \"PROVINCECODE\"," + " \"PROVINCE\", \"CITYCODE\", \"CITY\", \"COUNTYCODE\", \"COUNTY\", \"HYID\", \n" + "\"HYNAME\", \"OPERATIME\", \"ORGANCODE\", \"CREDITCODE\", " + "\"VALITIMES\", \"FZTIME\", \"OPEADDRESS\", \"LONGITUDE\", \"LATITUDE\", \"ISSHORTPERMIT\", \"POSTCODE\", \n" + "\"ISPARK\", \"INDUSTRIAL\", " + "\"ZYWRWLBID\", \"AIRWRWID\", \"AIRWRWNAME\", \"WATERWRWID\", \"WATERWRWNAME\", \"WATEREMISSIONNAME\", \"ITEMTYPE\", \"ITEMENDTIME\"," + " to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME from \"ENTERPRICE_BASEINFO\" where 1=1 ";
            String sql1 = "select count(*) from \"ENTERPRICE_BASEINFO\" where 1=1";

            String sql2 = "";
            if (!name.equals("")) {
                sql2 += " and \"DEVCOMPANY\" like '%" + name + "%'";
            }
            if (!type.equals("")) {
                sql2 += " and \"HYNAME\" = '" + type + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看排污许可证企业基本信息数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /*排污许可证 撤销、注销企业信息*/
    @RequestMapping( "getENTERPRICE_UNDOINFO" )
    public Map getENTERPRICE_UNDOINFO(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String name = request.getParameter("name");//专家名称
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"UNITNAME\", \"ENTERID\", \"XKZNUMBER\", \"ZXTYPE\", \"ZXREASON\", \"ISTYPE\", \"CREATETIME\"," + " to_char(\"INSERTTIME\",'yyyy-mm-dd HH24:mi:ss') INSERTTIME from \"ENTERPRICE_UNDOINFO\" where 1=1 ";
            String sql1 = "select count(*) from \"ENTERPRICE_UNDOINFO\" where 1=1";

            String sql2 = "";
            if (!name.equals("")) {
                sql2 += " and \"UNITNAME\" like '%" + name + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看排污许可证撤销、注销企业信息数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Description:污染地块结构查询条件--地块名单来源
     */
    @RequestMapping( "getDATASOURCEParData" )
    public Map getDATASOURCEParData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

            String sql = "select DISTINCT DATASOURCE from TB_POLLUTION_LAND_STRUCTURE";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            logToDb.addLog(request, "查询地块名单来源");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Description:污染地块结构查询条件--行业分类
     */
    @RequestMapping( "getINDUSTRYTYPEParData" )
    public Map getINDUSTRYTYPEParData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

            String sql = "select DISTINCT INDUSTRYTYPE from TB_POLLUTION_LAND_STRUCTURE";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            logToDb.addLog(request, "查询地块名单来源");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Description:污染地块结构查询条件--潜在污染物
     */
    @RequestMapping( "getPOTENTIALPOLLUTANTParData" )
    public Map getPOTENTIALPOLLUTANTParData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

            String sql = "select DISTINCT POTENTIALPOLLUTANT from TB_POLLUTION_LAND_STRUCTURE";
            List<Map> list = getBySqlMapper.findRecords(sql);
            HashSet<String> set = new HashSet<String>();
            for (Map map : list) {
				String[] strArr = map.get("POTENTIALPOLLUTANT").toString().split(",");
				for (String string : strArr) {
					set.add(string);
				}
			}
            
            Map result = new HashMap();
            result.put("rows", set);
            logToDb.addLog(request, "查询地块名单来源");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Description:污染地块结构查询条件--地块状态
     */
    @RequestMapping( "getLANDSTATUSParData" )
    public Map getLANDSTATUSParData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }

            String sql = "select DISTINCT LANDSTATUS from TB_POLLUTION_LAND_STRUCTURE";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            logToDb.addLog(request, "查询地块名单来源");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Description:污染地块结构基本信息
     */
    @RequestMapping( "getPollutionLandStructureData" )
    public Map getPollutionLandStructureData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            
            String OLDENTERPRISENAMEPar = RegUtil.checkParam(request.getParameter("OLDENTERPRISENAMEPar"));//原用地企业名称
            String DATASOURCEPar = RegUtil.checkParam(request.getParameter("DATASOURCEPar"));//地块名单来源
            String STARTRUNYEARTIMEParStart = RegUtil.checkParam(request.getParameter("STARTRUNYEARTIMEParStart"));//开始运营时间
            String STARTRUNYEARTIMEParEnd = RegUtil.checkParam(request.getParameter("STARTRUNYEARTIMEParEnd"));//开始运营时间
            String ENDRUNYEARTIMEParStart = RegUtil.checkParam(request.getParameter("ENDRUNYEARTIMEParStart"));//结束运营时间
            String ENDRUNYEARTIMEParEnd = RegUtil.checkParam(request.getParameter("ENDRUNYEARTIMEParEnd"));//结束运营时间
            String MAINPRODUCTPar = RegUtil.checkParam(request.getParameter("MAINPRODUCTPar"));//主要产品
            String INDUSTRYTYPEPar = RegUtil.checkParam(request.getParameter("INDUSTRYTYPEPar"));//行业分类
            String POTENTIALPOLLUTANTPar = RegUtil.checkParam(request.getParameter("POTENTIALPOLLUTANTPar"));//潜在污染物
            String NOWENTERPRISENAMEPar = RegUtil.checkParam(request.getParameter("NOWENTERPRISENAMEPar"));//现用地企业名称
            String LANDSTATUSPar = RegUtil.checkParam(request.getParameter("LANDSTATUSPar"));//地块状态
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"ID\", \"OLDENTERPRISENAME\", \"DATASOURCE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", \"POINTCOORDINATE\", \"POLYGONCOORDINATE\", \"STARTRUNYEARTIME\", \"ENDRUNYEARTIME\", \"AREA\", \"MAINPRODUCT\", \"INDUSTRYTYPE\", \"POTENTIALPOLLUTANT\", \"ELSEPOTENTIALPOLLUTANT\", \"RESEARCHINFO\", \"RESEARCHINFOATTACHMENTFILE\", \"FIXPLAN\", \"FIXPLANATTACHMENTFILE\", \"FIXCHECKINFO\", \"FIXCHECKINFOATTACHMENTFILE\", \"NOWENTERPRISENAME\", \"NOWLANDTYPE\", \"REMARK\", \"LANDSTATUS\", to_char(\"LANDSTATUSUPDATETIME\",'yyyy-mm-dd HH24:mi:ss') LANDSTATUSUPDATETIME, \"INSERTTIME\"" + " from \"TB_POLLUTION_LAND_STRUCTURE\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_POLLUTION_LAND_STRUCTURE\" where 1=1";
            String sql2 = "";

            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
           
            if (!OLDENTERPRISENAMEPar.equals("")) {
                sql2 += " and \"OLDENTERPRISENAME\" like'%" + OLDENTERPRISENAMEPar + "%'";
            }
            if (!DATASOURCEPar.equals("")) {
            	String[] strArr = DATASOURCEPar.split(",");
            	DATASOURCEPar = StringUtils.join(strArr,"','");
            	sql2 += " and \"DATASOURCE\" in ('" + DATASOURCEPar + "')";
            }
            if (!STARTRUNYEARTIMEParStart.equals("")) {
            	sql2 += " and \"STARTRUNYEARTIME\" >= " + STARTRUNYEARTIMEParStart + "";
            }
            if (!STARTRUNYEARTIMEParEnd.equals("")) {
            	sql2 += " and \"STARTRUNYEARTIME\" <= " + STARTRUNYEARTIMEParEnd + "";
            }
            if (!ENDRUNYEARTIMEParStart.equals("")) {
            	sql2 += " and \"ENDRUNYEARTIME\" >= " + ENDRUNYEARTIMEParStart + "";
            }
            if (!ENDRUNYEARTIMEParEnd.equals("")) {
            	sql2 += " and \"ENDRUNYEARTIME\" <= " + ENDRUNYEARTIMEParEnd + "";
            }
            if (!MAINPRODUCTPar.equals("")) {
            	sql2 += " and \"MAINPRODUCT\" like '%" + MAINPRODUCTPar + "%'";
            }
            if (!INDUSTRYTYPEPar.equals("")) {
            	String[] strArr = INDUSTRYTYPEPar.split(",");
            	INDUSTRYTYPEPar = StringUtils.join(strArr,"','");
            	sql2 += " and \"INDUSTRYTYPE\" in ('" + INDUSTRYTYPEPar + "')";
            }
            if (!POTENTIALPOLLUTANTPar.equals("")) {
            	String[] strArr = POTENTIALPOLLUTANTPar.split(",");
            	sql2 += " and (\"POTENTIALPOLLUTANT\" like '%" + strArr[0] + "%'";
            	for (int i = 1; i < strArr.length; i++) {
            		sql2 += " or \"POTENTIALPOLLUTANT\" like '%" + strArr[i] + "%'";
				}
            	sql2 += ")";	
            	
            }
            if (!NOWENTERPRISENAMEPar.equals("")) {
                sql2 += " and \"NOWENTERPRISENAME\" like '%" + NOWENTERPRISENAMEPar + "%'";
            }
            if (!LANDSTATUSPar.equals("")) {
            	String[] strArr = LANDSTATUSPar.split(",");
            	DATASOURCEPar = StringUtils.join(strArr,"','");
            	sql2 += " and \"LANDSTATUS\" in ('" + LANDSTATUSPar + "')";
            }
        /*    if (!jg.equals("")) {
                sql2 += " and \"EVALUATIONUNIT\" like'%" + jg + "%'";
            }*/
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看污染地块结构数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
  //污染地块结构下载
    @RequestMapping( "getPollutionLandStructureFile" )
    public EdatResult getPollutionLandStructureFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
            
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


            
            String OLDENTERPRISENAMEPar = RegUtil.checkParam(request.getParameter("OLDENTERPRISENAMEPar"));//原用地企业名称
            String DATASOURCEPar = RegUtil.checkParam(request.getParameter("DATASOURCEPar"));//地块名单来源
            String STARTRUNYEARTIMEParStart = RegUtil.checkParam(request.getParameter("STARTRUNYEARTIMEParStart"));//开始运营时间
            String STARTRUNYEARTIMEParEnd = RegUtil.checkParam(request.getParameter("STARTRUNYEARTIMEParEnd"));//开始运营时间
            String ENDRUNYEARTIMEParStart = RegUtil.checkParam(request.getParameter("ENDRUNYEARTIMEParStart"));//结束运营时间
            String ENDRUNYEARTIMEParEnd = RegUtil.checkParam(request.getParameter("ENDRUNYEARTIMEParEnd"));//结束运营时间
            String MAINPRODUCTPar = RegUtil.checkParam(request.getParameter("MAINPRODUCTPar"));//主要产品
            String INDUSTRYTYPEPar = RegUtil.checkParam(request.getParameter("INDUSTRYTYPEPar"));//行业分类
            String POTENTIALPOLLUTANTPar = RegUtil.checkParam(request.getParameter("POTENTIALPOLLUTANTPar"));//潜在污染物
            String NOWENTERPRISENAMEPar = RegUtil.checkParam(request.getParameter("NOWENTERPRISENAMEPar"));//现用地企业名称
            String LANDSTATUSPar = RegUtil.checkParam(request.getParameter("LANDSTATUSPar"));//地块状态
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"ID\", \"OLDENTERPRISENAME\", \"DATASOURCE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", \"POINTCOORDINATE\", \"POLYGONCOORDINATE\", \"STARTRUNYEARTIME\", \"ENDRUNYEARTIME\", \"AREA\", \"MAINPRODUCT\", \"INDUSTRYTYPE\", \"POTENTIALPOLLUTANT\", \"ELSEPOTENTIALPOLLUTANT\", \"RESEARCHINFO\", \"RESEARCHINFOATTACHMENTFILE\", \"FIXPLAN\", \"FIXPLANATTACHMENTFILE\", \"FIXCHECKINFO\", \"FIXCHECKINFOATTACHMENTFILE\", \"NOWENTERPRISENAME\", \"NOWLANDTYPE\", \"REMARK\", \"LANDSTATUS\", to_char(\"LANDSTATUSUPDATETIME\",'yyyy-mm-dd HH24:mi:ss') LANDSTATUSUPDATETIME, \"INSERTTIME\"" + " from \"TB_POLLUTION_LAND_STRUCTURE\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_POLLUTION_LAND_STRUCTURE\" where 1=1";
            String sql2 = "";

            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
           
            if (!OLDENTERPRISENAMEPar.equals("")) {
                sql2 += " and \"OLDENTERPRISENAME\" like'%" + OLDENTERPRISENAMEPar + "%'";
            }
            if (!DATASOURCEPar.equals("")) {
            	String[] strArr = DATASOURCEPar.split(",");
            	DATASOURCEPar = StringUtils.join(strArr,"','");
            	sql2 += " and \"DATASOURCE\" in ('" + DATASOURCEPar + "')";
            }
            if (!STARTRUNYEARTIMEParStart.equals("")) {
            	sql2 += " and \"STARTRUNYEARTIME\" >= " + STARTRUNYEARTIMEParStart + "";
            }
            if (!STARTRUNYEARTIMEParEnd.equals("")) {
            	sql2 += " and \"STARTRUNYEARTIME\" <= " + STARTRUNYEARTIMEParEnd + "";
            }
            if (!ENDRUNYEARTIMEParStart.equals("")) {
            	sql2 += " and \"ENDRUNYEARTIME\" >= " + ENDRUNYEARTIMEParStart + "";
            }
            if (!ENDRUNYEARTIMEParEnd.equals("")) {
            	sql2 += " and \"ENDRUNYEARTIME\" <= " + ENDRUNYEARTIMEParEnd + "";
            }
            if (!MAINPRODUCTPar.equals("")) {
            	sql2 += " and \"MAINPRODUCT\" like '%" + MAINPRODUCTPar + "%'";
            }
            if (!INDUSTRYTYPEPar.equals("")) {
            	String[] strArr = INDUSTRYTYPEPar.split(",");
            	INDUSTRYTYPEPar = StringUtils.join(strArr,"','");
            	sql2 += " and \"INDUSTRYTYPE\" in ('" + INDUSTRYTYPEPar + "')";
            }
            if (!POTENTIALPOLLUTANTPar.equals("")) {
            	String[] strArr = POTENTIALPOLLUTANTPar.split(",");
            	sql2 += " and (\"POTENTIALPOLLUTANT\" like '%" + strArr[0] + "%'";
            	for (int i = 1; i < strArr.length; i++) {
            		sql2 += " or \"POTENTIALPOLLUTANT\" like '%" + strArr[i] + "%'";
				}
            	sql2 += ")";	
            	
            }
            if (!NOWENTERPRISENAMEPar.equals("")) {
                sql2 += " and \"NOWENTERPRISENAME\" like '%" + NOWENTERPRISENAMEPar + "%'";
            }
            if (!LANDSTATUSPar.equals("")) {
            	String[] strArr = LANDSTATUSPar.split(",");
            	DATASOURCEPar = StringUtils.join(strArr,"','");
            	sql2 += " and \"LANDSTATUS\" in ('" + LANDSTATUSPar + "')";
            }
        /*    if (!jg.equals("")) {
                sql2 += " and \"EVALUATIONUNIT\" like'%" + jg + "%'";
            }*/
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) ";
//            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_experts\" where 1=1 ";
//            sql += ")T1 )";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, String> map = new LinkedHashMap();
            map.put("OLDENTERPRISENAME", "原用地企业名称");
            map.put("DATASOURCE", "地块名单来源");
            map.put("PROVINCENAME", "省");
            map.put("CITYNAME", "市");
            map.put("DISTRICTNAME", "区");
            map.put("DETAILEDADDRESS", "详细地址");
            map.put("POINTCOORDINATE", "地块点坐标（百度坐标）");
            map.put("POLYGONCOORDINATE", "地块面坐标（百度坐标）");
            map.put("STARTRUNYEARTIME", "开始运营时间");
            map.put("ENDRUNYEARTIME", "结束运营时间");
            map.put("AREA", "占地面积（万平方米）");
            map.put("MAINPRODUCT", "主要产品");
            map.put("INDUSTRYTYPE", "行业分类");
            map.put("POTENTIALPOLLUTANT", "潜在污染物");
            map.put("ELSEPOTENTIALPOLLUTANT", "其他潜在污染物");
            map.put("RESEARCHINFO", "调查信息");
            map.put("RESEARCHINFOATTACHMENTFILE", "附件");
            map.put("FIXPLAN", "修复方案");
            map.put("FIXPLANATTACHMENTFILE", "附件");
            map.put("FIXCHECKINFO", "修复验收信息");
            map.put("FIXCHECKINFOATTACHMENTFILE", "附件");
            map.put("NOWENTERPRISENAME", "现用地单位");
            map.put("NOWLANDTYPE", "现用地性质");
            map.put("REMARK", "备注");
            map.put("LANDSTATUS", "地块状态");
            map.put("LANDSTATUSUPDATETIME", "地跨状态更新时间");
            map.put("INSERTTIME", "入库时间");


            String geturl = urlUtil.geturl();
            String writes = ExcelUtils.writes(list, map, "污染地块结构", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }
    
    /**
     * @Author:renqiang
     * @Description:尾矿库基本信息
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getTailingsData" )
    public Map getTailingsData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
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


            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String TAILINGSNAMEPar = RegUtil.checkParam(request.getParameter("TAILINGSNAMEPar"));//尾矿库名称
            String DETAILEDADDRESSPar = RegUtil.checkParam(request.getParameter("DETAILEDADDRESSPar"));//详细地址
            String ENTERPRISENAMEPar = RegUtil.checkParam(request.getParameter("ENTERPRISENAMEPar"));//所属企业名称
            String MINERALTYPEPar = RegUtil.checkParam(request.getParameter("MINERALTYPEPar"));//矿物种类
            String BASINPar = RegUtil.checkParam(request.getParameter("BASINPar"));//所属流域
            String LEVELPar = RegUtil.checkParam(request.getParameter("LEVELPar"));//等别
            String name = RegUtil.checkParam(request.getParameter("name"));//项目名称
            String province = RegUtil.checkParam(request.getParameter("province"));//省份
            String jg = RegUtil.checkParam(request.getParameter("jg"));//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"ID\", \"TAILINGSNAME\", \"COORDINATE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", \"ENTERPRISENAME\", \"MINERALTYPE\", \"POLLUTETYPE\", \"BASIN\", \"RISK\", \"LEVEL\", \"PICTURE\", \"AREACOVERAGE\", \"ELSEINFO\", \"INSERTTIME\"" + " from \"TB_TAILINGS\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_TAILINGS\" where 1=1";
            String sql2 = "";

            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
            if (!DETAILEDADDRESSPar.equals("")) {
            	sql2 += " and \"DETAILEDADDRESS\" like'%" + DETAILEDADDRESSPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like'%" + ENTERPRISENAMEPar + "%'";
            }
            if (!MINERALTYPEPar.equals("")) {
            	sql2 += " and \"MINERALTYPE\" like'%" + MINERALTYPEPar + "%'";
            }
            if (!BASINPar.equals("")) {
            	sql2 += " and \"BASIN\" like'%" + BASINPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like'%" + ENTERPRISENAMEPar + "%'";
            }
            if (!LEVELPar.equals("")) {
            	sql2 += " and \"LEVEL\" = " + LEVELPar;
            }
            
            if (!name.equals("")) {
                sql2 += " and \"PROJECTNAME\" like'%" + name + "%'";
            }
            if (!jg.equals("")) {
                sql2 += " and \"EIAMANAGENAME\" like'%" + jg + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCENAME\" like'%" + province + "%'";
            }
        /*    if (!jg.equals("")) {
                sql2 += " and \"EVALUATIONUNIT\" like'%" + jg + "%'";
            }*/
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
            int total = getBySqlMapper.findrows(sql1);
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            result.put("page", pageNumber / pageSize);
            logToDb.addLog(request, "查看尾矿库数据");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    //尾矿库下载
    @RequestMapping( "getTailingsFile" )
    public EdatResult getTailingsFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
            
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


            String TAILINGSNAMEPar = RegUtil.checkParam(request.getParameter("TAILINGSNAMEPar"));//尾矿库名称
            String DETAILEDADDRESSPar = RegUtil.checkParam(request.getParameter("DETAILEDADDRESSPar"));//详细地址
            String ENTERPRISENAMEPar = RegUtil.checkParam(request.getParameter("ENTERPRISENAMEPar"));//所属企业名称
            String MINERALTYPEPar = RegUtil.checkParam(request.getParameter("MINERALTYPEPar"));//矿物种类
            String BASINPar = RegUtil.checkParam(request.getParameter("BASINPar"));//所属流域
            String LEVELPar = RegUtil.checkParam(request.getParameter("LEVELPar"));//等别
            String name = RegUtil.checkParam(request.getParameter("name"));//项目名称
            String province = RegUtil.checkParam(request.getParameter("province"));//省份
            String jg = RegUtil.checkParam(request.getParameter("jg"));//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"ID\", \"TAILINGSNAME\", \"COORDINATE\", \"PROVINCENAME\", \"CITYNAME\", \"DISTRICTNAME\", \"DETAILEDADDRESS\", \"ENTERPRISENAME\", \"MINERALTYPE\", \"POLLUTETYPE\", \"BASIN\", \"RISK\", \"LEVEL\", \"PICTURE\", \"AREACOVERAGE\", \"ELSEINFO\", \"INSERTTIME\"" + " from \"TB_TAILINGS\" where 1=1 ";
            String sql2 = "";

            if (!userlevel.equals("1") && !userlevel.equals("0")) {
                sql2 += " and \"PROVINCENAME\" like'%" + names.substring(0, 2) + "%'";
            }
            if (!DETAILEDADDRESSPar.equals("")) {
            	sql2 += " and \"DETAILEDADDRESS\" like'%" + DETAILEDADDRESSPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like'%" + ENTERPRISENAMEPar + "%'";
            }
            if (!MINERALTYPEPar.equals("")) {
            	sql2 += " and \"MINERALTYPE\" like'%" + MINERALTYPEPar + "%'";
            }
            if (!BASINPar.equals("")) {
            	sql2 += " and \"BASIN\" like'%" + BASINPar + "%'";
            }
            if (!ENTERPRISENAMEPar.equals("")) {
            	sql2 += " and \"ENTERPRISENAME\" like'%" + ENTERPRISENAMEPar + "%'";
            }
            if (!LEVELPar.equals("")) {
            	sql2 += " and \"LEVEL\" = " + LEVELPar;
            }
            
            if (!name.equals("")) {
                sql2 += " and \"PROJECTNAME\" like'%" + name + "%'";
            }
            if (!jg.equals("")) {
                sql2 += " and \"EIAMANAGENAME\" like'%" + jg + "%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCENAME\" like'%" + province + "%'";
            }
        /*    if (!jg.equals("")) {
                sql2 += " and \"EVALUATIONUNIT\" like'%" + jg + "%'";
            }*/
            sql += sql2;
            sql += ")T1 ) ";
//            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"tb_experts\" where 1=1 ";
//            sql += ")T1 )";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, String> map = new LinkedHashMap();
            map.put("TAILINGSNAME", "尾矿库名称");
            map.put("COORDINATE", "坐标");
            map.put("PROVINCENAME", "省");
            map.put("CITYNAME", "市");
            map.put("DISTRICTNAME", "区");
            map.put("DETAILEDADDRESS", "详细地址");
            map.put("ENTERPRISENAME", "所属企业名称");
            map.put("MINERALTYPE", "矿物种类");
            map.put("POLLUTETYPE", "污染类型");
            map.put("BASIN", "所属流域（由小到大）");
            map.put("RISK", "风险");
            map.put("LEVEL", "等别（0为未知，1到5对应一到五等）");
            map.put("PICTURE", "图片");
            map.put("AREACOVERAGE", "尾矿库区域范围");
            map.put("ELSEINFO", "其他信息（如运营时间、占地面积等）");
            map.put("INSERTTIME", "入库时间");

            String todayStr = new SimpleDateFormat("yyy-MM-dd").format(new Date());

            String geturl = urlUtil.geturl();
            String writes = ExcelUtils.writes(list, map, "尾矿库结构", geturl, response);
            if (writes != null) {
                return EdatResult.ok(writes);
            }
            return EdatResult.ok(writes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }


    /*获取建设项目文件*/
    @RequestMapping( "getConsFiles" )
    public EdatResult getConsFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getString("id");
            String sql = "select * from YZ_CONS_FILE where CONSTRUCTIONID = '" + id + "'";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /*获取建设项目文件*/
    @RequestMapping( "downloadConsFile" )
    public synchronized EdatResult downloadConsFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getString("id");
            String sql = "select * from YZ_CONS_FILE where ID = " + id + " and STATE = 1 and REMOTEURL is not null";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            if (list1.size() > 0) {
                String url = list1.get(0).get("REMOTEURL").toString();
                String dir = urlUtil.geturl() + "/YZ_CONS/";
                String filedir = GetContructProjectData.downRemoteFile(url, dir);
                if (!filedir.equals("")) {
                    String sql1 = "update YZ_CONS_FILE set URL = '" + filedir + "', STATE =0 ,UPDATETIME = SYSDATE where  ID = " + id;
                    getBySqlMapper.update(sql1);
                    return EdatResult.ok(filedir);
                }
            }
            return EdatResult.build(1, "下载失败");
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "下载失败");
        }
    }


    /*excel导入土壤污染舆情数据*/
    @RequestMapping( "storeYq" )
    public  EdatResult storeYQinfoFromExcel()  {
        Workbook book = null;
        try {
            File file = new File("C:\\Users\\soil-pc2\\Desktop\\土壤污染（修复）舆情分类汇总（2016、18年）0426.xlsx");//本地文件
            book = WorkbookFactory.create(file);
            Sheet sheet = book.getSheetAt(0);
            int firstRowNum = sheet.getFirstRowNum();
            int lastRowNum = sheet.getLastRowNum();
            String lastTitle="";
            String id = "";
            for (int rowNum = firstRowNum + 2; rowNum <= lastRowNum; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null || row.getCell(0) == null || ExcelUtil.getCellValue(row.getCell(0)) == "") {
                    continue;
                } else {
                    String title = ExcelUtil.getCellValue(row.getCell(14));
                    if(title.equals(lastTitle)){
                        String sql2="INSERT INTO \"YQ_DETAIL\" (\"ID\", \"PROVINCE\", \"CITY\", \"XIAN\", \"COUNTY\", \"LON\", \"LAT\", \"INVOLVEENTERPRICE\", " +
                                "\"YQID\", \"WJJS\", \"WJWRCD\", \"YJXM\", \"YJWRCD\", \"POLLUTEDAREA\", \"SAMPLETIME\") " +
                                "VALUES (YQ_DETAILSEQ.nextval, '"+ExcelUtil.getCellValue(row.getCell(1))+"',  '"+ExcelUtil.getCellValue(row.getCell(2))+"',  '"+ExcelUtil.getCellValue(row.getCell(3))+"'," +
                                "  '"+ExcelUtil.getCellValue(row.getCell(4))+"', '"+ExcelUtil.getCellValue(row.getCell(5))+"',  '"+ExcelUtil.getCellValue(row.getCell(6))+"',  '"+ExcelUtil.getCellValue(row.getCell(7))+"'" +
                                ",  '"+id+"',  '"+ExcelUtil.getCellValue(row.getCell(8))+"',  '"+ExcelUtil.getCellValue(row.getCell(9))+"', " +
                                " '"+ExcelUtil.getCellValue(row.getCell(10))+"',  '"+ExcelUtil.getCellValue(row.getCell(12))+"',  '"+ExcelUtil.getCellValue(row.getCell(12))+"',  '"+ExcelUtil.getCellValue(row.getCell(13))+"')";
                        getBySqlMapper.insert(sql2);
                    }else{
                        lastTitle=title;
                        String sql0="select * from YQ_BASEINFO where TITLE = '"+title+"'";
                        List<Map> list0 = getBySqlMapper.findRecords(sql0);
                        if(list0.size()>0){
                            id=list0.get(0).get("ID").toString();
                        }else{
                            String sql="SELECT NEWS_SEQ.nextval from dual";
                            List<Map> list1 = getBySqlMapper.findRecords(sql);
                            id=list1.get(0).get("NEXTVAL").toString();
                        }
                        String source =  ExcelUtil.getCellValue(row.getCell(15));
                        String time =  ExcelUtil.getCellValue(row.getCell(16));
                        String bz =  ExcelUtil.getCellValue(row.getCell(17));
                        String sql1 = "INSERT INTO \"YQ_BASEINFO\" (\"ID\", \"TITLE\", \"SOURCE\", \"PUBLISHTIME\", \"BZ\") VALUES " + "(" + id + ", '" + title + "', '" + source + "', '" + time + "', '" + bz + "')";
                        getBySqlMapper.insert(sql1);
                        String sql3 = "INSERT INTO \"TBNEWS\" (\"ID\", \"TITLE\",TYPE, \"SOURCE\", \"WRITEDATE\", \"COMMENT\") VALUES " +
                                "( NEWS_SEQ.nextval, '" + title + "','10', '" + source + "', TO_DATE('"+time+"','yyyy-mm') , '" + bz + "')";
                        getBySqlMapper.insert(sql3);
                        String sql2 = "INSERT INTO \"YQ_DETAIL\" (\"ID\", \"PROVINCE\", \"CITY\", \"XIAN\", \"COUNTY\", \"LON\", \"LAT\", \"INVOLVEENTERPRICE\", " + "\"YQID\", \"WJJS\", \"WJWRCD\", \"YJXM\", \"YJWRCD\", \"POLLUTEDAREA\", \"SAMPLETIME\") " + "VALUES (YQ_DETAILSEQ.nextval, '" + ExcelUtil.getCellValue(row.getCell(1)) + "',  '" + ExcelUtil.getCellValue(row.getCell(2)) + "',  '" + ExcelUtil.getCellValue(row.getCell(3)) + "'," + "  '" + ExcelUtil.getCellValue(row.getCell(4)) + "', '" + ExcelUtil.getCellValue(row.getCell(5)) + "',  '" + ExcelUtil.getCellValue(row.getCell(6)) + "',  '" + ExcelUtil.getCellValue(row.getCell(7)) + "'" + ", '" + id + "', '" + ExcelUtil.getCellValue(row.getCell(8)) + "',  '" + ExcelUtil.getCellValue(row.getCell(9)) + "', " + " '" + ExcelUtil.getCellValue(row.getCell(10)) + "',  '" + ExcelUtil.getCellValue(row.getCell(12)) + "',  '" + ExcelUtil.getCellValue(row.getCell(12)) + "',  '" + ExcelUtil.getCellValue(row.getCell(13)) + "')";
                        getBySqlMapper.insert(sql2);
                    }
                }
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        } finally {
            try{
                if (book != null) {
                    book.close();
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }
    }
}
