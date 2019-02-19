package com.gistone.seimp.controller;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.job.Data;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;


import net.sf.json.JSON;
import net.sf.json.JSONArray;
import com.gistone.seimp.util.RegUtil;
import net.sf.json.JSON;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import oracle.sql.CLOB;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.util.CellRangeAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.*;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * @Author:renqiang
 * @Description: Created by soil-pc2 on 2017/10/13.
 */
@RestController
@RequestMapping( "warn" )
public class WarnController {

    Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private LogToDb logToDb;

    private final String[] FirstType = {"搬迁", "迁建", "迁址", "异地", "进园", "入园", "进城", "退城", "退市"};//I类污染关键词
    private final String[] AType = {"有色金属", "石油", "化工", "焦化", "电镀", "制革"};//A类高风险关键词
    private final String[] SecondType = {"技改", "改建", "改扩建", "改进", "改建", "扩建", "改造", "升级", "扩容", "增容", "整改", "整治", "整合", "调整", "治理", "闭", "重建", "翻建", "迁改", "加固", "完善", "改线", "二期", "三期", "四期", "维修", "更改"};//II类污染关键词

    @RequestMapping( "getYearRange" )
    public EdatResult getYearRange(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "SELECT Max(TO_CHAR(to_date(ACCEPTANCEDATE,'YYYY-MM-DD hh24:mi:ss'),'YYYY')) MAXYEAR,MIN(TO_CHAR(to_date(ACCEPTANCEDATE,'YYYY-MM-DD hh24:mi:ss'),'YYYY')) MINYEAR from YZ_CONS";
            String sql1 = "SELECT Max(TO_CHAR(UPDATETIME_HBB_BIGDATA,'YYYY')) MAXYEAR,MIN(TO_CHAR(UPDATETIME_HBB_BIGDATA,'YYYY')) MINYEAR from YZ_BAS_ACPT";
            List<Map> list = getBySqlMapper.findRecords(sql);
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            Map result = new HashMap();
            int my1 = Integer.parseInt(list.get(0).get("MAXYEAR").toString());
            int my2 = Integer.parseInt(list1.get(0).get("MAXYEAR").toString());
            int sy1 = Integer.parseInt(list.get(0).get("MINYEAR").toString());
            int sy2 = Integer.parseInt(list1.get(0).get("MINYEAR").toString());
            result.put("maxYear", my1 > my2 ? my1 : my2);
            result.put("minYear", sy1 > sy2 ? sy2 : sy1);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:新增污染企业
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "newPollutingEnterprise" )
    public EdatResult newPollutingEnterprise(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");//0全部、1建设、2验收
            String time = data.getString("timePar");//更新时间
            String industry = data.getString("industryPar");//
            List<Map> list = new ArrayList<>();
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            if (type.equals("0") || type.equals("1")) {
                String sql = "select * from YZ_CONS where 1=1";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (time != null && !time.equals("")) {//过滤时间
                    String time1 = time + "-01-01 00:00:00";
                    sql = sql + " and UPDATETIME_HBB_BIGDATA >= to_date('" + time1 + "','yyyy-mm-dd HH24:mi:ss')";
                }
                if (userLevel > 1 && !regionCode.equals("")) {
                    sql += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
                List<Map> list2 = getBySqlMapper.findRecords(sql);//建设项目
                list.addAll(list2);
            }
            if (type.equals("0") || type.equals("2")) {
                String sql1 = "select * from YZ_BAS_ACPT where 1=1";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql1 += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (time != null && !time.equals("")) {//过滤时间
                    String time2 = time + "-01-01 00:00:00";
                    sql1 = sql1 + " and UPDATETIME_HBB_BIGDATA >= to_date('" + time2 + "','yyyy-mm-dd HH24:mi:ss')";
                }
                if (userLevel > 1 && !regionCode.equals("")) {
                    sql1 += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
                List<Map> list1 = getBySqlMapper.findRecords(sql1);//验收项目
                list.addAll(list1);
            }
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                int flag0 = 0;
                for (Map map1 : result) {
                    if (map1.get("provinceName").toString().equals(map.get("PROVINCENAME").toString())) {//判断结果集中是否已有该省份，将相应类数据加一
                        flag0 = 1;
                        int flag = 0;
                        for (String tem : FirstType) {
                            if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//I类污染
                                int flag1 = 0;
                                for (String tem3 : AType) {
                                    if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {//A类高风险
                                        map1.put("IA", (map1.get("IA") == null ? 0 : Integer.parseInt(map1.get("IA").toString())) + 1);//IA类数量加1
                                        flag1 = 1;
                                        break;
                                    }
                                }
                                if (flag1 == 0) {//其他风险
                                    map1.put("IB", (map1.get("IB") == null ? 0 : Integer.parseInt(map1.get("IB").toString())) + 1);//IB类数量加1
                                }
                                flag = 1;
                                break;
                            }
                        }
                        if (flag == 0) {
                            for (String tem : SecondType) {
                                if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//II类污染
                                    int flag2 = 0;
                                    for (String tem3 : AType) {
                                        if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {
                                            map1.put("IIA", (map1.get("IIA") == null ? 0 : Integer.parseInt(map1.get("IIA").toString())) + 1);//IIA类数量加1
                                            flag2 = 1;
                                            break;
                                        }
                                    }
                                    if (flag2 == 0) {
                                        map1.put("IIB", (map1.get("IIB") == null ? 0 : Integer.parseInt(map1.get("IIB").toString())) + 1);//IIB类数量加1
                                    }
                                    flag = 1;
                                    break;
                                }
                            }
                        }
                        if (flag == 0) {//III类污染
                            map1.put("III", (map1.get("III") == null ? 0 : Integer.parseInt(map1.get("III").toString())) + 1);//III类数量加1
                        }
                    }
                }
                if (flag0 == 0) {//结果集中没有该省份，添加一个该省份的map对象
                    int flag = 0;
                    Map map1 = new HashMap();
                    //初始化
                    map1.put("provinceName", map.get("PROVINCENAME").toString());
                    map1.put("IB", 0);
                    map1.put("IIA", 0);
                    map1.put("IA", 0);
                    map1.put("IIB", 0);
                    map1.put("III", 0);
                    //添加本条数据
                    for (String tem : FirstType) {
                        if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {
                            int flag1 = 0;
                            for (String tem3 : AType) {
                                if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {
                                    map1.put("IA", 1);
                                    flag1 = 1;
                                    break;
                                }
                            }
                            if (flag1 == 0) {
                                map1.put("IB", 1);
                            }
                            flag = 1;
                            break;
                        }
                    }
                    if (flag == 0) {
                        for (String tem : SecondType) {
                            if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {
                                int flag2 = 0;
                                for (String tem3 : AType) {
                                    if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {
                                        map1.put("IIA", 1);
                                        flag2 = 1;
                                        break;
                                    }
                                }
                                if (flag2 == 0) {
                                    map1.put("IIB", 1);
                                }
                                flag = 1;
                                break;
                            }
                        }
                    }
                    if (flag == 0) {
                        map1.put("III", 1);
                    }
                    result.add(map1);
                }
            }
            //exportFile(result);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:新增污染企业
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "newPollutingEnterprise1" )
    public EdatResult newPollutingEnterprise1(HttpServletRequest request, HttpServletResponse response) {
        try {
  /*          ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getOrDefault("type", "").toString();//0全部、1建设、2验收
            String time = data.getOrDefault("timePar", "").toString();//更新时间
            String industry = data.getOrDefault("industryPar", "").toString();//
            String startTime = "";//
            String endTime = "";//批复时间
            String minPROJECTINVEST = "";//总投资
            String maxPROJECTINVEST = "";
            String minENVIRONINVEST = "";//环保投资
            String maxENVIRONINVEST = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            if (data.has("minPROJECTINVEST")) {
                minPROJECTINVEST = data.getString("minPROJECTINVEST").trim();
            }
            if (data.has("maxPROJECTINVEST")) {
                maxPROJECTINVEST = data.getString("maxPROJECTINVEST").trim();
            }
            if (data.has("minENVIRONINVEST")) {
                minENVIRONINVEST = data.getString("minENVIRONINVEST").trim();
            }
            if (data.has("maxENVIRONINVEST")) {
                maxENVIRONINVEST = data.getString("maxENVIRONINVEST").trim();
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "";
            if (type.equals("1") || type.equals("0")) {
                sql = "select T2.NUM,T3.\"code\",T3.\"name\" PROVINCENAME  from ( select count(*) NUM,\"PROVINCENAME\" from YZ_CONS where \"PROVINCENAME\" is not null";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (!startTime.equals("")) {
                    sql += " and TO_DATE(TO_CHAR(\"ACCEPTANCEDATE\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
                if (!endTime.equals("")) {
                    sql += " and TO_DATE(TO_CHAR(\"ACCEPTANCEDATE\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
                if (!minPROJECTINVEST.equals("")) {
                    sql += " and \"PROJECTINVEST\" >= " + Double.parseDouble(minPROJECTINVEST);
                }
                if (!maxPROJECTINVEST.equals("")) {
                    sql += " and \"PROJECTINVEST\" <= " + Double.parseDouble(maxPROJECTINVEST);
                }
                if (!minENVIRONINVEST.equals("")) {
                    sql += " and \"ENVIRONINVEST\" >= " + Double.parseDouble(minENVIRONINVEST);
                }
                if (!maxENVIRONINVEST.equals("")) {
                    sql += " and \"ENVIRONINVEST\" <= " + Double.parseDouble(maxENVIRONINVEST);
                }
                if (userLevel > 1 && !regionCode.equals("")) {
                    sql += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
            } else if (type.equals("2")) {
                sql = "select T2.NUM,T3.\"code\",T3.\"name\" PROVINCENAME  from ( select count(*) NUM,\"PROVINCENAME\" from YZ_BAS_ACPT where PROVINCENAME is not null";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (time != null && !time.equals("")) {//过滤时间
                    String time2 = time + "-01-01 00:00:00";
                    sql += " and UPDATETIME_HBB_BIGDATA >= to_date('" + time2 + "','yyyy-mm-dd HH24:mi:ss')";
                }
                if (userLevel > 1 && !regionCode.equals("")) {
                    sql += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
            }
            sql += " group by \"PROVINCENAME\")T2 join \"tb_city\" T3 on T3.\"level\" = 0 and instr(T3.\"name\",T2.\"PROVINCENAME\") > 0 ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, Map> map = new HashMap();
            for (Map map1 : list) {
                String name = map1.get("PROVINCENAME").toString();
                if (map.containsKey(name)) {
                    Map tem = map.get(name);
                    map1.put("NUM", Integer.parseInt(tem.get("NUM").toString()) + Integer.parseInt(map1.get("NUM").toString()));
                    map.put(name, map1);
                } else {
                    map.put(name, map1);
                }
            }
            List<Map> result = new ArrayList<>(map.values());
            return EdatResult.ok(result);
        } catch (NumberFormatException ex) {
            return EdatResult.build(1, "参数异常");
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:新增污染企业详情
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "newPollutingEnterpriseDetail" )
    public EdatResult newPollutingEnterpriseDetail(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");//1建设项目，2验收项目 0全部
            String time = data.getString("timePar");//用户ID
            String industry = data.getString("industryPar");//行业
            String province = data.getString("provinceFIDPar");//省
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            List<Map> result = new ArrayList<>();
            if (type.equals("0") || type.equals("1")) {
                /*建设项目表*/
                String sql = "select ID,PROJECTNAME,EIAMANAGENAME,PROJECTINVEST,ENVIRONINVEST,EVALUATIONUNIT,to_char(APPROVALDATE,'yyyy-mm-dd HH24:mi:ss')APPROVALDATE," + "PROVINCENAME,UPDATEFLAG_HBB_BIGDATA,to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA from YZ_BAS_CONS where PROJECTNAME is not null and EIAMANAGENAME is not null ";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (province != null && !province.equals("")) {//过滤省份
                    sql += " and PROVINCENAME = '" + province + "'";
                } else if (userLevel > 1 && !regionCode.equals("")) {
                    sql += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }

                if (time != null && !time.equals("")) {//过滤时间
                    String time1 = time + "-01-01 00:00:00";
                    sql = sql + " and UPDATETIME_HBB_BIGDATA > to_date('" + time1 + "','yyyy-mm-dd HH24:mi:ss')";
                }
                List<Map> list = getBySqlMapper.findRecords(sql);//建设项目
                for (Map map : list) {
                    map.put("projectType", "建设项目");
                    int flag = 0;
                    for (String tem : FirstType) {
                        if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//I类污染
                            int flag1 = 0;
                            for (String tem3 : AType) {
                                if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {//A类高风险
                                    map.put("type", "IA");
                                    flag1 = 1;
                                    break;
                                }
                            }
                            if (flag1 == 0) {//其他风险
                                map.put("type", "IB");
                            }
                            flag = 1;
                            break;
                        }
                    }
                    if (flag == 0) {
                        for (String tem : SecondType) {
                            if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//II类污染
                                int flag2 = 0;
                                for (String tem3 : AType) {
                                    if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {//A类高风险
                                        map.put("type", "IIA");
                                        flag2 = 1;
                                        break;
                                    }
                                }
                                if (flag2 == 0) {//其他风险
                                    map.put("type", "IIB");
                                }
                                flag = 1;
                                break;
                            }
                        }
                    }
                    if (flag == 0) {//III类污染
                        map.put("type", "III");
                    }
                }
                result.addAll(list);
            }

            if (type.equals("0") || type.equals("2")) {
            /*验收表*/
                String sql1 = "select ID,PROJECTNAME,EIAMANAGENAME,PROJECTADDRESS,EIAEVALUATIONNUMBER,PROVINCENAME,UPDATEFLAG_HBB_BIGDATA,to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss') UPDATETIME_HBB_BIGDATA from " + "YZ_BAS_ACPT where PROJECTNAME is not null and EIAMANAGENAME is not null ";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql1 += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (province != null && !province.equals("")) {//过滤省份
                    sql1 += " and PROVINCENAME = '" + province + "'";
                } else if (userLevel > 1 && !regionCode.equals("")) {
                    sql1 += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
                if (time != null && !time.equals("")) {//过滤时间
                    String time2 = time + "-01-01 00:00:00";
                    sql1 = sql1 + " and UPDATETIME_HBB_BIGDATA > to_date('" + time2 + "','yyyy-mm-dd HH24:mi:ss')";
                }
                List<Map> list1 = getBySqlMapper.findRecords(sql1);//验收项目
                for (Map map : list1) {
                    map.put("projectType", "验收项目");
                    int flag = 0;
                    for (String tem : FirstType) {
                        if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//I类污染
                            int flag1 = 0;
                            for (String tem3 : AType) {
                                if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {//A类高风险
                                    map.put("type", "IA");
                                    flag1 = 1;
                                    break;
                                }
                            }
                            if (flag1 == 0) {//其他风险
                                map.put("type", "IB");
                            }
                            flag = 1;
                            break;
                        }
                    }
                    if (flag == 0) {
                        for (String tem : SecondType) {
                            if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//II类污染
                                int flag2 = 0;
                                for (String tem3 : AType) {
                                    if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {//A类高风险
                                        map.put("type", "IIA");
                                        flag2 = 1;
                                        break;
                                    }
                                }
                                if (flag2 == 0) {
                                    map.put("type", "IIB");//其他风险
                                }
                                flag = 1;
                                break;
                            }
                        }
                    }
                    if (flag == 0) {//III类污染
                        map.put("type", "III");
                    }
                }
                result.addAll(list1);
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:新增污染企业详情
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "newPollutingEnterpriseDetail1" )
    public EdatResult newPollutingEnterpriseDetail1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");//1建设项目，2验收项目 0全部
            String time = data.getOrDefault("timePar", "").toString();//
            String industry = data.getOrDefault("industryPar", "").toString();//行业
            String province = data.getOrDefault("provinceFIDPar", "").toString();//省
            int page = Integer.parseInt(data.getOrDefault("pageNumber", "1").toString());
            int size = Integer.parseInt(data.getOrDefault("pageSize", "10").toString());
            String startTime = "";//
            String endTime = "";//批复时间
            String minPROJECTINVEST = "";//总投资
            String maxPROJECTINVEST = "";
            String minENVIRONINVEST = "";//环保投资
            String maxENVIRONINVEST = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            if (data.has("minPROJECTINVEST")) {
                minPROJECTINVEST = data.getString("minPROJECTINVEST").trim();
            }
            if (data.has("maxPROJECTINVEST")) {
                maxPROJECTINVEST = data.getString("maxPROJECTINVEST").trim();
            }
            if (data.has("minENVIRONINVEST")) {
                minENVIRONINVEST = data.getString("minENVIRONINVEST").trim();
            }
            if (data.has("maxENVIRONINVEST")) {
                maxENVIRONINVEST = data.getString("maxENVIRONINVEST").trim();
            }
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            List<Map> result = new ArrayList<>();
            String sql0 = "select count(1) NUM from ";
            if (type.equals("1") || type.equals("0")) {
                /*建设项目表*/
           /*     String sql = "select ID,PROJECTNAME,EIAMANAGENAME,PROJECTINVEST,ENVIRONINVEST,EVALUATIONUNIT,to_char(APPROVALDATE,'yyyy-mm-dd HH24:mi:ss')APPROVALDATE" +
                        ",PROVINCENAME,UPDATEFLAG_HBB_BIGDATA,to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss')UPDATETIME_HBB_BIGDATA from YZ_BAS_CONS where 1=1 ";*/
                String sql = "SELECT * from (select CONSTRUCTIONID as ID,PROJECTNAME,EIAMANAGENAME,PROJECTINVEST,ENVIRONINVEST,ACCEPTANCEDATE as APPROVALDATE" + ",PROVINCENAME,\'建设项目\' as \"projectType\",ROWNUM RN   from YZ_CONS where 1=1 ";
                String sql1 = "";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql1 += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (province != null && !province.equals("")) {//过滤省份
                    sql1 += " and PROVINCENAME = '" + province + "'";
                } else if (userLevel > 1 && !regionCode.equals("")) {
                    sql1 += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
            /*    if (time != null && !time.equals("")) {//过滤时间
                    String time1 = time + "-01-01 00:00:00";
                    sql = sql + " and UPDATETIME_HBB_BIGDATA > to_date('" + time1 + "','yyyy-mm-dd HH24:mi:ss')";
                }*/
                if (!startTime.equals("")) {
                    sql1 += " and TO_DATE(\"ACCEPTANCEDATE\" , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
                if (!endTime.equals("")) {
                    sql1 += " and TO_DATE(\"ACCEPTANCEDATE\" , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
                if (!minPROJECTINVEST.equals("")) {
                    sql1 += " and \"PROJECTINVEST\" >= " + Double.parseDouble(minPROJECTINVEST);
                }
                if (!maxPROJECTINVEST.equals("")) {
                    sql1 += " and \"PROJECTINVEST\" <= " + Double.parseDouble(maxPROJECTINVEST);
                }
                if (!minENVIRONINVEST.equals("")) {
                    sql1 += " and \"ENVIRONINVEST\" >= " + Double.parseDouble(minENVIRONINVEST);
                }
                if (!maxENVIRONINVEST.equals("")) {
                    sql1 += " and \"ENVIRONINVEST\" <= " + Double.parseDouble(maxENVIRONINVEST);
                }
              /*  if (userLevel > 1 && !regionCode.equals("")) {
                    sql += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }*/
                sql0 += " YZ_CONS where 1=1 ";
                sql0 += sql1;
                sql += sql1;
                sql += " order by \"PROVINCENAME\" ) where RN >" + (page - 1) * size + " and RN <=" + page * size;
                List<Map> list = getBySqlMapper.findRecords(sql);//建设项目
                result.addAll(list);
            }
            if (type.equals("2")) {
            /*验收表*/
                String sql1 = "select * from (select ID,PROJECTNAME,EIAMANAGENAME,PROJECTADDRESS,EIAEVALUATIONNUMBER,PROVINCENAME,UPDATEFLAG_HBB_BIGDATA," + "to_char(UPDATETIME_HBB_BIGDATA,'yyyy-mm-dd HH24:mi:ss') UPDATETIME_HBB_BIGDATA ,\'验收项目\' as \"projectType\" ,ROWNUM RN from YZ_BAS_ACPT where 1=1 ";
                String sql2 = "";
                if (industry != null && !industry.equals("")) {//过滤行业
                    sql2 += " and EIAMANAGENAME = '" + industry + "'";
                }
                if (province != null && !province.equals("")) {//过滤省份
                    sql2 += " and PROVINCENAME = '" + province + "'";
                } else if (userLevel > 1 && !regionCode.equals("")) {
                    sql2 += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
                if (time != null && !time.equals("")) {//过滤时间
                    String time2 = time + "-01-01 00:00:00";
                    sql2 += " and UPDATETIME_HBB_BIGDATA > to_date('" + time2 + "','yyyy-mm-dd HH24:mi:ss')";
                }
                if (userLevel > 1 && !regionCode.equals("")) {
                    sql2 += " and \"INSTR\"((SELECT \"name\" from \"tb_city\" where \"code\" = '" + regionCode.substring(0, 2) + "0000'),PROVINCENAME) >0";
                }
                sql1 += sql2;
                sql1 += " order by \"PROVINCENAME\" ) where RN >" + (page - 1) * size + " and RN <=" + page * size;
                sql0 += " YZ_BAS_ACPT where 1=1 ";
                sql0 += sql2;
                List<Map> list1 = getBySqlMapper.findRecords(sql1);//验收项目
                result.addAll(list1);
            }
            int total = getBySqlMapper.findrows(sql0);
            Map rr = new HashMap();
            rr.put("total", Math.ceil((double) total / size));
            rr.put("page", page);
            rr.put("rows", result);
            return EdatResult.ok(rr);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:全国各省点位超标情况
     * @Date:10:20 2017/10/16
     */
    @RequestMapping( "overproof_Pro" )
    public EdatResult overproof_Pro(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");
            String wuRanObjectStr = "";
            String wuRanObject = "";
            if (data.has("wuRanObject")) {
                wuRanObject = data.getString("wuRanObject");//污染物类型，全部污染物类型为"Cr","Pb","Cd","Hg","As","Cu","Zn","Ni"
            }
            //生成字符串
            if (wuRanObject != null && !wuRanObject.equals("")) {
                String[] split = wuRanObject.split(",");
                for (String string : split) {
                    wuRanObjectStr += "\"" + string + "\"" + "+";
                }
            }
            if (wuRanObjectStr.length() > 0) {
                wuRanObjectStr = wuRanObjectStr.substring(0, wuRanObjectStr.length() - 1);
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "";
            if (type.equals("1")) {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    if (wuRanObjectStr.length() > 0) {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(" + wuRanObjectStr + ") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( " + wuRanObjectStr + ") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" like '" + regionCode + "%'l " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum(" + wuRanObjectStr + ") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( " + wuRanObjectStr + ") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";

                    } else {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"tatal_number\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" like '" + regionCode + "%'l " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"tatal_number\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    }
                } else {
                    if (wuRanObjectStr.length() > 0) {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(" + wuRanObjectStr + ") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum(" + wuRanObjectStr + ") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum(" + wuRanObjectStr + ") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum(" + wuRanObjectStr + ") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    } else {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"tatal_number\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"tatal_number\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    }
                }
            } else {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"bhc\"+\"ddt\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\"  like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\"  like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\"  like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3 )T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                } else {
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"bhc\"+\"ddt\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3 )T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                }
            }
            //查询全国各省点位超标情况
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:全国各省点位超标情况
     * @Date:10:20 2017/10/16
     */
    @RequestMapping( "overproof_Pro1" )
    public EdatResult overproof_Pro1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            /*int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");
          /*  HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));*/
            int userLevel = 1;
            String regionCode = "";
            //String regionCode = (String) session.getAttribute("regionCode");
            String sql = "";
            if (type.equals("1")) {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"tatal_number\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" like '" + regionCode + "%'l " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"tatal_number\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                } else {
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"tatal_number\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"tatal_number\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                }
            } else {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"bhc\"+\"ddt\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\"  like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\"  like '" + regionCode + "%'  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\"  like '" + regionCode + "%' " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3 )T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                } else {
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code from" + " \"overproof_middle\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T1 full join " + " (select sum( \"bhc\"+\"ddt\") as light,\"RPAD\"(SUBSTR(\"county_code\", 0,2), 6, '0') as code1 from  \"overproof_light\" where  \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\") " + " as slight,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code2 from  \"overproof_slight\" where \"county_code\" is not null  GROUP BY SUBSTR( \"county_code\", 0,2))T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,\"RPAD\"(SUBSTR(\"county_code\", 0, 2), 6, '0') as code3 from  \"overproof_severe\" where \"county_code\" is not null " + " GROUP BY SUBSTR( \"county_code\", 0, 2))T4 on CODE = CODE3 )T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                }
            }
            //查询全国各省点位超标情况
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:某省下各县点位超标情况
     * @Date:10:20 2017/10/16
     */
    @RequestMapping( "overproof_Shi" )
    public EdatResult overproof_Shi(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String proCode = data.getString("regionCode");//区域码
            proCode = proCode.substring(0, 2);//截取省区域码
            String type = data.getString("type");

            String wuRanObjectStr = "";
            String wuRanObject = "";
            if (data.has("wuRanObject")) {
                wuRanObject = data.getString("wuRanObject");//污染物类型，全部污染物类型为"Cr","Pb","Cd","Hg","As","Cu","Zn","Ni"
            }
            //生成字符串
            if (wuRanObject != null && !wuRanObject.equals("")) {
                String[] split = wuRanObject.split(",");
                for (String string : split) {
                    wuRanObjectStr += "\"" + string + "\"" + "+";
                }
            }
            if (wuRanObjectStr.length() > 0) {
                wuRanObjectStr = wuRanObjectStr.substring(0, wuRanObjectStr.length() - 1);
            }
            String sql = "";
            //查询某省各市点位超标情况
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            if (type.equals("1")) {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    if (wuRanObjectStr.length() > 0) {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(" + wuRanObjectStr + ") as middle,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" like  '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T1 full join " + " (select sum(" + wuRanObjectStr + ") as light,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0') CODE1 from  \"overproof_light\" WHERE \"county_code\" like '" + regionCode + "%' and  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T2 on CODE = CODE1 full join (select sum(" + wuRanObjectStr + ")slight," + " RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE2 from  \"overproof_slight\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\"" + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T3 " + " on CODE = CODE2 full join (select sum( " + wuRanObjectStr + ") as SERVERE,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE3 from" + "  \"overproof_severe\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    } else {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" like  '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T1 full join " + " (select sum( \"tatal_number\") as light,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0') CODE1 from  \"overproof_light\" WHERE \"county_code\" like '" + regionCode + "%' and  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T2 on CODE = CODE1 full join (select sum( \"tatal_number\")slight," + " RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE2 from  \"overproof_slight\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\"" + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE3 from" + "  \"overproof_severe\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    }

                } else {
                    if (wuRanObjectStr.length() > 0) {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(" + wuRanObjectStr + ") as middle,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T1 full join " + " (select sum(" + wuRanObjectStr + ") as light,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0') CODE1 from  \"overproof_light\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T2 on CODE = CODE1 full join (select sum( " + wuRanObjectStr + ")slight," + " RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE2 from  \"overproof_slight\" WHERE  \"county_code\"" + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T3 " + " on CODE = CODE2 full join (select sum( " + wuRanObjectStr + ") as SERVERE,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    } else {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T1 full join " + " (select sum( \"tatal_number\") as light,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0') CODE1 from  \"overproof_light\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T2 on CODE = CODE1 full join (select sum( \"tatal_number\")slight," + " RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE2 from  \"overproof_slight\" WHERE  \"county_code\"" + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";

                    }
                }

            } else {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T1 full join " + " (select sum(\"bhc\"+\"ddt\") as light,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0') CODE1 from  \"overproof_light\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\")slight," + " RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE2 from  \"overproof_slight\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\"" + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE3 from" + "  \"overproof_severe\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                } else {
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T1 full join " + " (select sum(\"bhc\"+\"ddt\") as light,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0') CODE1 from  \"overproof_light\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\")slight," + " RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE2 from  \"overproof_slight\" WHERE  \"county_code\"" + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,RPAD(SUBSTR(\"county_code\", 0, 4), 6, '0')CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY SUBSTR( \"county_code\", 0, 4))T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                }
            }

            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:某市点位超标情况
     * @Date:10:20 2017/10/16
     */
    @RequestMapping( "overproof_Xian" )
    public EdatResult overproof_Xian(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
         /*   int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String proCode = data.getString("regionCode");//区域码
            proCode = proCode.substring(0, 4);//截取市区域码
            String type = data.getString("type");

            String wuRanObject = "";
            if (data.has("wuRanObject")) {
                wuRanObject = data.getString("wuRanObject");//污染物类型，全部污染物类型为"Cr","Pb","Cd","Hg","As","Cu","Zn","Ni"
            }
            String wuRanObjectStr = "";
            //生成字符串
            if (wuRanObject != null && !wuRanObject.equals("")) {
                String[] split = wuRanObject.split(",");
                for (String string : split) {
                    wuRanObjectStr += "\"" + string + "\"" + "+";
                }
            }
            if (wuRanObjectStr.length() > 0) {
                wuRanObjectStr = wuRanObjectStr.substring(0, wuRanObjectStr.length() - 1);
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "";
            //查询某市各市点位超标情况
            if (type.equals("1")) {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    if (wuRanObjectStr.length() > 0) {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(" + wuRanObjectStr + ") as middle,\"county_code\" CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" like '" + proCode + "%' GROUP BY \"county_code\")T1 full join " + " (select sum(" + wuRanObjectStr + ") as light,\"county_code\" CODE1 from  \"overproof_light\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\" )T2 on CODE = CODE1 full join (select sum(" + wuRanObjectStr + ")slight," + " \"county_code\" CODE2 from  \"overproof_slight\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\"" + " like '" + proCode + "%' GROUP BY  \"county_code\")T3 " + " on CODE = CODE2 full join (select sum(" + wuRanObjectStr + ") as SERVERE,\"county_code\" CODE3 from" + "  \"overproof_severe\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\")T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    } else {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,\"county_code\" CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" like '" + proCode + "%' GROUP BY \"county_code\")T1 full join " + " (select sum( \"tatal_number\") as light,\"county_code\" CODE1 from  \"overproof_light\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\" )T2 on CODE = CODE1 full join (select sum( \"tatal_number\")slight," + " \"county_code\" CODE2 from  \"overproof_slight\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\"" + " like '" + proCode + "%' GROUP BY  \"county_code\")T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,\"county_code\" CODE3 from" + "  \"overproof_severe\" WHERE \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\")T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    }
                } else {
                    if (wuRanObjectStr.length() > 0) {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(" + wuRanObjectStr + ") as middle,\"county_code\" CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + proCode + "%' GROUP BY \"county_code\")T1 full join " + " (select sum(" + wuRanObjectStr + ") as light,\"county_code\" CODE1 from  \"overproof_light\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\" )T2 on CODE = CODE1 full join (select sum(" + wuRanObjectStr + ")slight," + " \"county_code\" CODE2 from  \"overproof_slight\" WHERE  \"county_code\"" + " like '" + proCode + "%' GROUP BY  \"county_code\")T3 " + " on CODE = CODE2 full join (select sum(" + wuRanObjectStr + ") as SERVERE,\"county_code\" CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\")T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    } else {
                        sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"tatal_number\") as middle,\"county_code\" CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + proCode + "%' GROUP BY \"county_code\")T1 full join " + " (select sum( \"tatal_number\") as light,\"county_code\" CODE1 from  \"overproof_light\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\" )T2 on CODE = CODE1 full join (select sum( \"tatal_number\")slight," + " \"county_code\" CODE2 from  \"overproof_slight\" WHERE  \"county_code\"" + " like '" + proCode + "%' GROUP BY  \"county_code\")T3 " + " on CODE = CODE2 full join (select sum( \"tatal_number\") as SERVERE,\"county_code\" CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\")T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                    }
                }
            } else {
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,\"county_code\" CODE from " + " \"overproof_middle\" WHERE  \"county_code\" like '" + regionCode + "%' and \"county_code\" like '" + proCode + "%' GROUP BY  \"county_code\")T1 full join " + " (select sum(\"bhc\"+\"ddt\") as light,\"county_code\" CODE1 from  \"overproof_light\" WHERE  \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\")T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\")slight," + " \"county_code\" CODE2 from  \"overproof_slight\" WHERE  \"county_code\" like '" + regionCode + "%' and \"county_code\"" + " like '" + proCode + "%' GROUP BY  \"county_code\")T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,\"county_code\" CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" like '" + regionCode + "%' and \"county_code\" " + " like '" + proCode + "%' GROUP BY \"county_code\")T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                } else {
                    sql = "select T1.*,T2.\"name\" NAME from (SELECT CODE,MIDDLE,SLIGHT,LIGHT,SERVERE FROM (select sum(\"bhc\"+\"ddt\") as middle,\"county_code\" CODE from " + " \"overproof_middle\" WHERE \"county_code\" like '" + proCode + "%' GROUP BY  \"county_code\")T1 full join " + " (select sum(\"bhc\"+\"ddt\") as light,\"county_code\" CODE1 from  \"overproof_light\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY  \"county_code\")T2 on CODE = CODE1 full join (select sum( \"bhc\"+\"ddt\")slight," + " \"county_code\" CODE2 from  \"overproof_slight\" WHERE  \"county_code\"" + " like '" + proCode + "%' GROUP BY  \"county_code\")T3 " + " on CODE = CODE2 full join (select sum( \"bhc\"+\"ddt\") as SERVERE,\"county_code\" CODE3 from" + "  \"overproof_severe\" WHERE  \"county_code\" " + " like '" + proCode + "%' GROUP BY \"county_code\")T4 on CODE = CODE3)T1 left join \"tb_city\" T2 on T1.CODE = T2.\"code\"";
                }
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:点位超标情况详情（省市县）
     * @Date:10:20 2017/10/16
     */
    @RequestMapping( "overproof_Detail" )
    public EdatResult overproof_Detail(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String proCode = data.getString("regionCode");
            String type = data.getString("type");//1sligh，2ligjt,3,middle,4severe
            int flag = 0;
            if (proCode.indexOf("0000") != -1) {//区域码含四个零表示省
                proCode = proCode.substring(0, 2);
            } else if (proCode.indexOf("00") != -1) {//两个零表示市
                proCode = proCode.substring(0, 4);
            } else {
                flag = 1;//县
            }
            String sql = "";
            if (flag == 0) {//省、市查询
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select SUM(\"tatal_number\") as TATAL_NUMBER,SUM(\"cr\") as CR,SUM(\"pb\") as PB,SUM(\"cd\") as CD,SUM(\"hg\") as HG,SUM(\"as\") as SUMAS,SUM(\"cu\") as CU,SUM(\"zn\") as ZN,SUM(\"ni\") as NI,SUM(\"bhc\") as BHC,SUM(\"ddt\") as DDT  from";
                    if (type.equals("1")) {
                        sql += " \"overproof_slight\"";
                    } else if (type.equals("2")) {
                        sql += " \"overproof_light\"";
                    } else if (type.equals("3")) {
                        sql += " \"overproof_middle\"";
                    } else if (type.equals("4")) {
                        sql += " \"overproof_severe\"";
                    } else {
                        return EdatResult.build(1, "类型错误");
                    }
                    sql += " where  \"county_code\" LIKE '" + regionCode + "%' and \"county_code\" LIKE '" + proCode + "%'";
                } else {
                    sql = "select SUM(\"tatal_number\") as TATAL_NUMBER,SUM(\"cr\") as CR,SUM(\"pb\") as PB,SUM(\"cd\") as CD,SUM(\"hg\") as HG,SUM(\"as\") as SUMAS,SUM(\"cu\") as CU,SUM(\"zn\") as ZN,SUM(\"ni\") as NI,SUM(\"bhc\") as BHC,SUM(\"ddt\") as DDT  from";
                    if (type.equals("1")) {
                        sql += " \"overproof_slight\"";
                    } else if (type.equals("2")) {
                        sql += " \"overproof_light\"";
                    } else if (type.equals("3")) {
                        sql += " \"overproof_middle\"";
                    } else if (type.equals("4")) {
                        sql += " \"overproof_severe\"";
                    } else {
                        return EdatResult.build(1, "类型错误");
                    }
                    sql += " where \"county_code\" LIKE '" + proCode + "%'";
                }
            } else {//县查询
                if (userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql = "select  \"tatal_number\" as TATAL_NUMBER , \"cr\" AS CR, \"pb\" AS PB, \"cd\" AS CD,\"hg\" AS HG,\"as\" as SUMAS,\"cu\" AS CU,\"zn\" AS ZN,\"ni\" AS NI ,\"bhc\" as BHC,\"ddt\" as DDT from";
                    if (type.equals("1")) {
                        sql += " \"overproof_slight\"";
                    } else if (type.equals("2")) {
                        sql += " \"overproof_light\"";
                    } else if (type.equals("3")) {
                        sql += " \"overproof_middle\"";
                    } else if (type.equals("4")) {
                        sql += " \"overproof_severe\"";
                    } else {
                        return EdatResult.build(1, "类型错误");
                    }
                    sql += " where  \"county_code\" LIKE '" + regionCode + "%' and  \"county_code\" = '" + proCode + "'";
                } else {
                    sql = "select  \"tatal_number\" as TATAL_NUMBER , \"cr\" AS CR, \"pb\" AS PB, \"cd\" AS CD,\"hg\" AS HG,\"as\" as SUMAS,\"cu\" AS CU,\"zn\" AS ZN,\"ni\" AS NI ,\"bhc\" as BHC,\"ddt\" as DDT from";
                    if (type.equals("1")) {
                        sql += " \"overproof_slight\"";
                    } else if (type.equals("2")) {
                        sql += " \"overproof_light\"";
                    } else if (type.equals("3")) {
                        sql += " \"overproof_middle\"";
                    } else if (type.equals("4")) {
                        sql += " \"overproof_severe\"";
                    } else {
                        return EdatResult.build(1, "类型错误");
                    }
                    sql += " where \"county_code\" = '" + proCode + "'";
                }

            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:舆情列表
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "weixin_ReportList" )
    public EdatResult weixin_ReportList(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select REPORT_ID,to_char(REPORT_TIME,'yyyy-mm-dd HH24:mi:ss') REPORT_TIME,LOCATION_LABEL,REPORT_LONGITUDE,REPORT_LATITUDE from YQ12369_DSJ_REPORTINFO where 1=1  ";
            /*if(data.has("type")&&!data.getString("type").equals("")){
                sql+=" and REPORT_FROM = "+data.getString("type");
            }*/
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and AREA_CODE LIKE '" + regionCode + "%'";
            }
            if (data.has("industryType") && !data.getString("industryType").equals("")) {
                sql += " and REPORT_FROM = '" + data.getString("industryType") + "'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:行业类别
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "weixin_IndustryType" )
    public EdatResult weixin_IndustryType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select INDUSTRY_TYPE,INDUSTRY_NAME,INDUSTRY_SORT from YQ12369_DSJ_COD_INDUSTRY where 1=1 ";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and AREA_CODE LIKE '" + regionCode + "%'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:微信举报详情
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "weixin_ReportDetail" )
    public EdatResult weixin_ReportDetail(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String reportIDs = data.getString("reportID");
            String[] arr = reportIDs.split(",");//获取ID数组
            if (arr.length < 1) {
                return EdatResult.build(1, "参数错误：reportID");
            }
            String sql = "select * from (select REPORT_ID,EVENT_NUMBER,to_char(REPORT_TIME,'yyyy-mm-dd HH24:mi:ss') REPORT_TIME,REPORT_FROM,REPORT_DEPT_NAME,AREA_CODE," + "LOCATION_LABEL,REPORT_CONTENT,REPORT_LONGITUDE,REPORT_LATITUDE" + ",PROCESS_AREA_UNITNAME,INDUSTRY_TYPE,WHETHER_CODE,FINALOPINION,to_char(DATA_UTIME,'yyyy-mm-dd HH24:mi:ss')DATA_UTIME from YQ12369_DSJ_REPORTINFO where ";

            for (int i = 0; i < arr.length; i++) {
                if (i == 0) {
                    sql += "( REPORT_ID ='" + arr[0] + "'";
                } else {
                    sql += " or REPORT_ID ='" + arr[i] + "'";
                }
            }
            sql += "))T0 left join YQ12369_DSJ_COD_REPORTFROM T1 on T0.REPORT_FROM = T1.REPORT_FROM " + " left join YQ12369_DSJ_COD_AREAINFO T2 on T0.AREA_CODE = T2.AREA_CODE " + " left join YQ12369_DSJ_COD_INDUSTRY T3 on T0.INDUSTRY_TYPE = T3.INDUSTRY_TYPE " + " left join YQ12369_DSJ_COD_WHETHER T4 on T0.WHETHER_CODE = T4.WHETHER_CODE";
            List<Map> list = getBySqlMapper.findRecords(sql);
            List<Map> list1 = new ArrayList<>();
            for (Map map : list) {
                Map result = new HashMap();
                result.put("REPORT_ID", map.get("REPORT_ID") == null ? "" : map.get("REPORT_ID").toString());
                result.put("EVENT_NUMBER", map.get("EVENT_NUMBER") == null ? "" : map.get("EVENT_NUMBER").toString());
                result.put("REPORT_TIME", map.get("REPORT_TIME") == null ? "" : map.get("REPORT_TIME").toString());
                result.put("REPORT_FROM", map.get("REPORT_FROM_NAME") == null ? "" : map.get("REPORT_FROM_NAME").toString());
                result.put("REPORT_DEPT_NAME", map.get("REPORT_DEPT_NAME") == null ? "" : map.get("REPORT_DEPT_NAME").toString());
                result.put("AREA_CODE", map.get("AREA_NAME") == null ? "" : map.get("AREA_NAME").toString());
                result.put("LOCATION_LABEL", map.get("LOCATION_LABEL") == null ? "" : map.get("LOCATION_LABEL").toString());
                if (map.get("REPORT_CONTENT") == null) {
                    result.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob = (CLOB) map.get("REPORT_CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    result.put("REPORT_CONTENT", content);
                }
                result.put("REPORT_LONGITUDE", map.get("REPORT_LONGITUDE") == null ? "" : map.get("REPORT_LONGITUDE").toString());
                result.put("REPORT_LATITUDE", map.get("REPORT_LATITUDE") == null ? "" : map.get("REPORT_LATITUDE").toString());
                result.put("PROCESS_AREA_UNITNAME", map.get("PROCESS_AREA_UNITNAME") == null ? "" : map.get("PROCESS_AREA_UNITNAME").toString());
                result.put("INDUSTRY_CODE", map.get("INDUSTRY_NAME") == null ? "" : map.get("INDUSTRY_NAME").toString());
                result.put("WHETHER_CODE", map.get("WHETHER_NAME") == null ? "" : map.get("WHETHER_NAME").toString());
                result.put("FINALOPINION", map.get("FINALOPINION") == null ? "" : map.get("FINALOPINION").toString());
                result.put("DATA_UTIME", map.get("DATA_UTIME") == null ? "" : map.get("DATA_UTIME").toString());
                list1.add(result);
            }
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:舆情预警
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "getNetworkNews" )
    public EdatResult getNetworkNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");//类型
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select \"newsid\",\"chinaRegion1\",\"chinaRegion2\",\"chinaRegion3\" from \"tb_network_news\" where \"newsType\" = '土壤舆情' and \"state\" = '0' ";
            if (!type.equals("")) {
                if (type.equals("其他")) {
                    sql += " and \"DICT_type\" is null ";
                } else {
                    sql += " and \"DICT_type\" like '%" + type + "%'";
                }
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and (\"chinaRegion1\" LIKE '" + regionCode + "%'or \"chinaRegion2\" LIKE '" + regionCode + "%' or \"chinaRegion3\" LIKE '" + regionCode + "%')";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                List<Map> pos = new ArrayList<>();
                String codes = "";
                if (map.get("chinaRegion1") != null) {
                    String[] arr1 = map.get("chinaRegion1").toString().split(",");
                    for (int i = 0; i < arr1.length; i++) {
                        String[] arr = arr1[i].split("_");
                        if (arr.length == 2) {
                            codes += arr[0].trim() + ",";
                        }
                    }
                }
                if (map.get("chinaRegion2") != null) {
                    String[] arr1 = map.get("chinaRegion2").toString().split(",");
                    for (int i = 0; i < arr1.length; i++) {
                        String[] arr = arr1[i].split("_");
                        if (arr.length == 2) {
                            codes += arr[0].trim() + ",";
                        }
                    }
                }
                if (map.get("chinaRegion3") != null) {
                    String[] arr1 = map.get("chinaRegion3").toString().split(",");
                    for (int i = 0; i < arr1.length; i++) {
                        String[] arr = arr1[i].split("_");
                        if (arr.length == 2) {
                            codes += arr[0].trim() + ",";
                        }
                    }
                }
                if (codes.length() > 0) {
                    String sql1 = "select \"lon\",\"lat\" from \"tb_city\" where \"code\" in (" + codes.substring(0, codes.length() - 1) + ") and \"lon\" is not null and \"lat\" is not null ";
                    pos = getBySqlMapper.findRecords(sql1);
                }
                map.put("pos", pos);
            }
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:舆情预警类型
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "getNetworkNewsTypes" )
    public EdatResult getNetworkNewsTypes(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select distinct \"DICT_type\" from \"tb_network_news\" where  \"newsType\" = '土壤舆情' and \"state\"='0' and \"DICT_type\" is not null";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and (\"chinaRegion1\" LIKE '" + regionCode + "%'or \"chinaRegion2\" LIKE '" + regionCode + "%' or \"chinaRegion3\" LIKE '" + regionCode + "%')";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            Set set = new HashSet();
            for (Map map : list) {
                String[] arr = map.get("DICT_type").toString().split(",|，");
                for (String str : arr) {
                    set.add(str);
                }
            }
            return EdatResult.ok(set);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:舆情预警详情
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "getNetworkNewsDetail" )
    public EdatResult getNetworkNewsDetail(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ids = data.getString("IDs");
            String[] arr = ids.split(",");
            List<Map> result = new ArrayList<>();
            for (String str : arr) {
                String sql = "select \"newsid\",\"url\",\"urlhash\",\"title\",\"content\",\"source\",\"chinaRegion1\",\"chinaRegion2\",\"chinaRegion3\"," + "to_char(\"time\",'yyyy-mm-dd HH24:mi:ss')\"time\",to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\",\"summary\",\"newsType\"" + ",\"domain\",\"DICT_type\",\"mainContentHtml\",\"encoding\",\"codePage\" from \"tb_network_news\" where \"newsid\"='" + str + "'";
                List<Map> list = getBySqlMapper.findRecords(sql);
                Map map = list.get(0);
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("content");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("content", content);
                }
                result.add(map);
            }

            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:污染地块统计
     * @Date:10:20 2017/10/30
     */
    @RequestMapping( "staWurandikuai" )
    public EdatResult staWurandikuai(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select count(*) as SUM ,POLLUETED from \"TB_WRDKJBXXB\" where SCJDBM is not null and DELETE_TSAMP is null";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and COUNTRY_CODE LIKE '" + regionCode + "%'";
            }
            sql += " group by POLLUETED";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:重点企业统计
     * @Date:10:20 2017/10/30
     */
    @RequestMapping( "staKeyIndustry" )
    public EdatResult staKeyIndustry(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select count(*) as SUM ,DALEI from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and DISTRICT_CODE LIKE '" + regionCode + "%'";
            }
            sql += " GROUP BY DALEI HAVING DALEI in ('有色金属矿采选业','有色金属采选业'," + "'有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" + "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" + "危险废物处理处置')";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map<String, Integer> result = new HashMap();
            result.put("有色金属矿采选", 0);
            result.put("有色金属冶炼", 0);
            result.put("石油开采", 0);
            result.put("石油加工", 0);
            result.put("化工", 0);
            result.put("焦化", 0);
            result.put("石油开采", 0);
            result.put("制革", 0);
            result.put("医药制造", 0);
            result.put("铅酸蓄电池制造", 0);
            result.put("废旧电子拆解", 0);
            result.put("危险废物处理处置", 0);
            result.put("危险化学品生产、存储、使用", 0);
            for (Map map : list) {
                if ("有色金属矿采选业,有色金属采选业".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("有色金属矿采选", Integer.parseInt(result.get("有色金属矿采选").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("有色金属冶炼,有色金属冶炼和压延加工业".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("有色金属冶炼", Integer.parseInt(result.get("有色金属冶炼").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("石油加工,石油加工业".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("石油加工", Integer.parseInt(result.get("石油加工").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("化工,化工原料和化工制品制造业".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("化工", Integer.parseInt(result.get("化工").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("石油加工、炼焦及核燃料加工业".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("焦化", Integer.parseInt(result.get("焦化").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("皮革、毛皮、羽毛及其制品和制鞋业,皮革、毛皮、羽毛(绒)及其制品业,皮革、毛皮、羽毛（绒）及其制品业,皮革、毛皮、羽毛及其制品和制造业".indexOf(map.get("DALEI").toString()) > -1) {
                    result.put("制革", Integer.parseInt(result.get("制革").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("医药,医药制造,医药制造业".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("医药制造", Integer.parseInt(result.get("医药制造").toString()) + Integer.parseInt(map.get("SUM").toString()));
                } else if ("危险废物处理处置".indexOf(map.get("DALEI").toString()) != -1) {
                    result.put("危险废物处理处置", Integer.parseInt(result.get("危险废物处理处置").toString()) + Integer.parseInt(map.get("SUM").toString()));
                }
            }
            List<Integer> vv = new ArrayList<>(result.values());
            int total = 0;
            for (int tem : vv) {
                total += tem;
            }
            result.put("total", total);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:举报预警省查询
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getJBYJSENG" )
    public EdatResult getJBYJSENG(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String report_from = data.getString("report_from");//项目名称
            String sql = "select T1.\"REPORT_ID\",T1.\"AREA_CODE\", T2.\"lon\",T2.\"lat\" from (select * from \"YQ12369_DSJ_REPORTINFO\" where 1=1";
            if (report_from != null && !report_from.equals("")) {
                sql += " AND \"REPORT_FROM\"='" + report_from + "'";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and AREA_CODE LIKE '" + regionCode + "%'";
            }
            sql += ") T1 left join \"tb_city\" T2 on T1.\"AREA_CODE\" = T2.\"code\"";
            List<Map> list = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据省查询县的数量
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getS_XIAN" )
    public EdatResult getS_XIAN(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String code = request.getParameter("code");
            String xcode = "";
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            if (!code.equals("")) {
                xcode += code.substring(0, 2);
            }
            String sql = "select count(1) from \"tb_city\" where \"code\" like '" + xcode + "%' and \"level\"='2'";
            Integer count = getBySqlMapper.findrows(sql);
            JSONObject obj = new JSONObject();
            obj.put("count", count);
            return EdatResult.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据县查询县的预警详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getX_XIANGQING" )
    public EdatResult getX_XIANGQING(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String code = request.getParameter("code");
            if (code == "") {
                return EdatResult.build(1, "无code参数");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql = "select \"REPORT_ID\", \"EVENT_NUMBER\", to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss') \"REPORT_TIME\", \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\", \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\", \"REPORT_LATITUDE\", \"PROCESS_AREA_UNITNAME\", \"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\",to_char(\"DATA_UTIME\",'yyyy-mm-dd HH24:mi:ss') \"DATA_UTIME\" from \"YQ12369_DSJ_REPORTINFO\" where \"AREA_CODE\" = '" + code + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:根据省预警详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getJbyj1" )
    public EdatResult getJbyj1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String endTime = "";
            String  startTime ="";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            String sql = "SELECT T1.\"count\",T2.\"name\",T2.\"code\",T2.\"code\" \"province\"  FROM (select count(*) \"count\",\"SUBSTR\"(AREA_CODE, 0, 2) CODE " + " from YQ12369_DSJ_REPORTINFO where 1=1 ";
            if (!industry.equals("")) {
                sql += " and INDUSTRY_TYPE = " + industry;
            }
            sql += "and  TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('"+startTime+"', 'YYYY-MM-DD:HH24:MI:SS') " +
                    "and TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('"+endTime+"', 'YYYY-MM-DD:HH24:MI:SS')";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and AREA_CODE LIKE '" + regionCode + "%'";
            }
            sql += " GROUP BY \"SUBSTR\"(AREA_CODE, 0, 2))T1 LEFT JOIN \"tb_city\" T2 on \"RPAD\"(T1.CODE, 6, 0) = T2.\"code\"  where \"code\" is not null";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据省获取市预警详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getJbyj2" )
    public EdatResult getJbyj2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String endTime = "";
            String startTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            String sql = "SELECT T1.\"count\",T2.\"name\",T2.\"code\",T2.\"code\" \"city\"  FROM (select count(*) \"count\",\"SUBSTR\"(AREA_CODE, 0, 4) CODE " + " from YQ12369_DSJ_REPORTINFO where AREA_CODE like '" + code.substring(0, 2) + "%' ";
            if (!industry.equals("")) {
                sql += " and INDUSTRY_TYPE = " + industry;
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and AREA_CODE LIKE '" + regionCode + "%'";
            }
            sql += "and  TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') ,'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('"+startTime+"', 'YYYY-MM-DD:HH24:MI:SS') and TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') ," +
                    " 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('"+endTime+"', 'YYYY-MM-DD:HH24:MI:SS')";
            sql += "  GROUP BY \"SUBSTR\"(AREA_CODE, 0, 4))T1 " + " LEFT JOIN \"tb_city\" T2 on \"RPAD\"(T1.CODE, 6, 0) = T2.\"code\"";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据市内预警详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping( "getJbyj3" )
    public EdatResult getJbyj3(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            String sql = "select T1.*,T2.\"name\" \"countyName\",T2.\"lon\",T2.\"lat\",T3.\"name\" \"cityName\",T4.\"name\" \"provinceName\" from (SELECT \"REPORT_ID\"," + " \"EVENT_NUMBER\",to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss')\"REPORT_TIME\", \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\"," + " \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\", \"REPORT_LATITUDE\", \"PROCESS_AREA_UNITNAME\", " + "\"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\", to_char(\"DATA_UTIME\",'yyyy-mm-dd HH24:mi:ss')\"DATA_UTIME\"" + " from YQ12369_DSJ_REPORTINFO where AREA_CODE like '" + code.substring(0, 4) + "%'";
            if (!industry.equals("")) {
                sql += " and INDUSTRY_TYPE = " + industry;
            }
            sql += ")T1 left join \"tb_city\" T2 on T1.AREA_CODE  = T2.\"code\" " + " left join \"tb_city\" T3 on \"RPAD\"(\"SUBSTR\"(T1.AREA_CODE, 0, 4), 6, 0) = T3.\"code\" " + " left join \"tb_city\" T4 on \"RPAD\"(\"SUBSTR\"(T1.AREA_CODE, 0, 2), 6, 0)  = T4.\"code\" ";
            ;
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                if (map.get("REPORT_CONTENT") == null) {
                    map.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob = (CLOB) map.get("REPORT_CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("REPORT_CONTENT", content);
                }
                if (map.get("FINALOPINION") == null) {
                    map.put("FINALOPINION", "");
                } else {
                    CLOB clob = (CLOB) map.get("FINALOPINION");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("FINALOPINION", content);
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
     * @Param:
     * @Description:舆情省统计
     * @Date:14:51 2017/11/9
     */
    @RequestMapping( "getYq1" )
    public EdatResult getYq1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            String sql1 = "SELECT \"newsid\",\"chinaRegion1\" CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode + "%'or \"chinaRegion2\" LIKE '" + regionCode + "%' or \"chinaRegion3\" LIKE '" + regionCode + "%')";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String[] temarr = arr[i].split("_");
                        if (temarr.length == 2) {
                            String code = temarr[0].trim();
                            code = code.substring(0, 2) + "0000";
                            String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                            List<Map> list = getBySqlMapper.findRecords(sql);
                            String name = "";
                            if (list.size() > 0) {
                                name = list.get(0).get("name").toString();
                            } else {
                                name = temarr[1].trim();
                            }
                            int flag = 0;
                            for (Map map1 : list2) {
                                if (map1.get("province").toString().equals(code)) {
                                    map1.put("count", Integer.parseInt(map1.get("count").toString()) + 1);
                                    flag = 1;
                                    break;
                                }
                            }
                            if (flag == 0) {
                                Map map2 = new HashMap();
                                map2.put("province", code);
                                map2.put("count", 1);
                                map2.put("name", name);
                                list2.add(map2);
                            }
                        }
                    }
                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-04-28 11:24
     * @param   
     * @return  
     * @Description 舆情分析统计图
     */
    @RequestMapping( "staYq" )
    public EdatResult staYq(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));

            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-M-d");
            int type = data.getInt("type");
            String startTime = "";
            String endTime = "";
            String code = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            if (data.has("regionCode")) {
                code = data.getString("regionCode");
            }
            LocalDate time1 = LocalDate.parse(startTime, formatter);
            LocalDate time2 = LocalDate.parse(endTime, formatter);
            Map<String, Integer> result = new HashMap();
            List<String> x = new ArrayList();
            if (type == 1) {
                while (!time1.isAfter(time2)) {
                    result.put(time1.toString(), 0);
                    x.add(time1.toString());
                    time1 = time1.plusDays(1);
                }
            } else if (type == 2) {
                time1 = LocalDate.of(time1.getYear(), time1.getMonthValue(), 1);
                while (!time1.isAfter(time2)) {
                    result.put(time1.toString().substring(0, 7), 0);
                    x.add(time1.toString().substring(0, 7));
                    time1 = time1.plusMonths(1);
                }
            } else if (type == 3) {
                time1 = LocalDate.of(time1.getYear(), 1, 1);
                while (!time1.isAfter(time2)) {
                    result.put(time1.getYear() + "", 0);
                    x.add(time1.getYear() + "");
                    time1 = time1.plusYears(1);
                }
            }
            String sql1 = "select * from (SELECT \"newsid\",";
            String region1 = "";
            String regionCode1 = "";
            if (code.equals("")) {
                sql1 += " \"chinaRegion1\"";
                region1 = " and \"chinaRegion1\" != '_'  ";
                regionCode1 = "\"chinaRegion1\" LIKE '%"+code+"%'";
            } else if (code.length() == 2) {
                sql1 += "\"chinaRegion2\"";
                regionCode1 = "\"chinaRegion2\" LIKE '%"+code+"%'";
            } else if (code.length() == 4) {
                sql1 += "\"chinaRegion3\"";
                regionCode1 = "\"chinaRegion3\" LIKE '%"+code+"%'";
            } else if (code.length() == 6) {
                sql1 += "\"chinaRegion3\"";
            }
            sql1 += " CODE ,";
            if (type == 1) {
                sql1 += " TO_CHAR(\"time\",'YYYY-MM-DD') TIME";
            } else if (type == 2) {
                sql1 += " TO_CHAR(\"time\",'YYYY-MM') TIME";
            } else if (type == 3) {
                sql1 += " TO_CHAR(\"time\",'YYYY') TIME";
            }
            sql1 += " from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode + "%'or \"chinaRegion2\" LIKE '" + regionCode + "%' or \"chinaRegion3\" LIKE '" + regionCode + "%')";
            }
            if (!code.equals("")) {
                sql1 += " and ("+regionCode1+")";
            }
            sql1 += " "+region1+")T1 where CODE is not null and TIME is not null";
            sql1 += " order by TIME asc";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                String time = map.get("TIME").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String  str = arr[i].toString();
                        if (!code.equals("")) {
                            if (str.contains(code)){
                                if (result.containsKey(time)) {
                                    result.put(time, Integer.parseInt(result.get(time).toString()) + 1);
                                }
                            }
                        } else {
                            if (result.containsKey(time)) {
                                result.put(time, Integer.parseInt(result.get(time).toString()) + 1);
                            }
                        }
                    }
                }
            }
            Map rr = new HashMap();
            rr.put("x", x);
            List values = new ArrayList();
            for (String str : x) {
                values.add(result.get(str).toString());
            }
            rr.put("values", values);
            return EdatResult.ok(rr);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:luowenbin
     * @Param:
     * @Description:舆情省统计,右边表格数据
     * @Date:2018/01/29
     */
    @RequestMapping( "getTabkeYq1" )
    public EdatResult getTabkeYq1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
//            String sql1 = "SELECT \"newsid\",  \"url\", \"urlhash\"," + " \"title\",  \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + "\"NVL\"(\"chinaRegion3\", \"NVL\"(\"chinaRegion2\", \"chinaRegion1\")) CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            String sql1 = "SELECT \"newsid\",  \"url\", \"urlhash\"," + " \"title\",  \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + "\"chinaRegion1\" CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode + "%'or \"chinaRegion2\" LIKE '" + regionCode + "%' or \"chinaRegion3\" LIKE '" + regionCode + "%') ORDER BY \"time\" DESC";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String[] temarr = arr[i].split("_");
                        if (temarr.length == 2) {
                            String code = temarr[0].trim();
                            code = code.substring(0, 2) + "0000";
                            String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                            List<Map> list = getBySqlMapper.findRecords(sql);
                            String name = "";
                            if (list.size() > 0) {
                                name = list.get(0).get("name").toString();
                            } else {
                                name = temarr[1].trim();
                            }

                            Map map3 = new HashMap();
                            map3.put("newsid", map.get("newsid"));
                            map3.put("title", map.get("title"));
                            map3.put("fetchTime", map.get("fetchTime"));
                            map3.put("time", map.get("time"));
                            map3.put("source", map.get("source"));
                            list2.add(map3);

                        }
                    }
                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情省内市统计
     * @Date:14:51 2017/11/9
     */
    @RequestMapping( "getYq2" )
    public EdatResult getYq2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String regionCode = data.getString("code");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String regionCode1 = regionCode.substring(0, 2);
            String sql1 = "SELECT \"newsid\", \"chinaRegion2\" CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql1 += " and ( \"chinaRegion2\" LIKE '" + regionCode2 + "%')";
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String[] temarr = arr[i].split("_");
                        if (temarr.length == 2) {
                            String code = temarr[0].trim();
                            if (code.substring(0, 2).equals(regionCode1)) {
                                code = code.substring(0, 4) + "00";
                                String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                                List<Map> list = getBySqlMapper.findRecords(sql);
                                String name = "";
                                if (list.size() > 0) {
                                    name = list.get(0).get("name").toString();
                                } else {
                                    name = temarr[1].trim();
                                }
                                int flag = 0;
                                for (Map map1 : list2) {
                                    if (map1.get("city").toString().equals(code)) {
                                        map1.put("count", Integer.parseInt(map1.get("count").toString()) + 1);
                                        flag = 1;
                                        break;
                                    }
                                }
                                if (flag == 0) {
                                    Map map2 = new HashMap();
                                    map2.put("city", code);
                                    map2.put("count", 1);
                                    map2.put("name", name);
                                    list2.add(map2);
                                }
                            }

                        }
                    }
                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:luowenbin
     * @Param:
     * @Description:舆情省内市统计，更新右边表格数据
     * @Date:14:51 2018/01/29
     */
    @RequestMapping( "getTableYq2" )
    public EdatResult getTableYq2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String regionCode = data.getString("code");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String regionCode1 = regionCode.substring(0, 2);
//            String sql1 = "SELECT \"newsid\",  \"url\", \"urlhash\"," + " \"title\",  \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + "\"NVL\"(\"chinaRegion3\", \"NVL\"(\"chinaRegion2\", \"chinaRegion1\")) CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            String sql1 = "SELECT \"newsid\",  \"url\", \"urlhash\"," + " \"title\",  \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + "\"chinaRegion2\" CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
//                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode2 + "%'or \"chinaRegion2\" LIKE '" + regionCode2 + "%' or \"chinaRegion3\" LIKE '" + regionCode2 + "%')";
                sql1 += " and ( \"chinaRegion2\" LIKE '" + regionCode2 + "%' )";
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS') ORDER BY \"time\" DESC";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String[] temarr = arr[i].split("_");
                        if (temarr.length == 2) {
                            String code = temarr[0].trim();
                            if (code.substring(0, 2).equals(regionCode1)) {
                                code = code.substring(0, 4) + "00";
                                String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                                List<Map> list = getBySqlMapper.findRecords(sql);
                                String name = "";
                                if (list.size() > 0) {
                                    name = list.get(0).get("name").toString();
                                } else {
                                    name = temarr[1].trim();
                                }


                                Map map3 = new HashMap();
                                map3.put("newsid", map.get("newsid"));
                                map3.put("title", map.get("title"));
                                map3.put("fetchTime", map.get("fetchTime"));
                                map3.put("time", map.get("time"));
                                map3.put("source", map.get("source"));
                                list2.add(map3);
                            }

                        }
                    }
                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情市内点位
     * @Date:14:51 2017/11/9
     */
    @RequestMapping( "getYq3" )
    public EdatResult getYq3(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String regionCode = data.getString("code");
            String regionCode1 = regionCode.substring(0, 4);
            String sql1 = "SELECT \"chinaRegion3\" CODE, \"newsid\", \"url\", \"urlhash\"," + " \"title\", \"content\", \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\", \"summary\", " + " \"newsType\", \"domain\",  \"mainContentHtml\"," + " \"encoding\", \"codePage\", \"state\" from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            for (Map map : list1) {
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("content");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("content", content);
                }
            }
            List<Map> list = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String[] temarr = arr[i].split("_");
                        if (temarr.length == 2) {
                            String code = temarr[0].trim();
                            if (code.substring(0, 4).equals(regionCode1)) {
                                String name = temarr[1].trim();
                                String sql2 = "select * from \"tb_city\" where \"code\"='" + code + "' and \"lon\" is not null and \"lat\" is not null";
                                List<Map> list2 = getBySqlMapper.findRecords(sql2);
                                if (list2.size() > 0) {
                                    map.put("lon", list2.get(0).get("lon") == null ? "" : list2.get(0).get("lon").toString());
                                    map.put("lat", list2.get(0).get("lat") == null ? "" : list2.get(0).get("lat").toString());
                                }
                                map.put("county", name);
                                list.add(map);
                            }
                        }
                    }
                }
            }
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:luowenbin
     * @Param:
     * @Description:舆情市内点位,更新右侧表格数据
     * @Date:2018/01/29
     */
    @RequestMapping( "getTableYq3" )
    public EdatResult getTableYq3(HttpServletRequest request, HttpServletResponse response) {

        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String regionCode = data.getString("code");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String regionCode1 = regionCode.substring(0, 4);
//            String sql1 = "SELECT \"newsid\",  \"url\", \"urlhash\"," + " \"title\",  \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + "\"NVL\"(\"chinaRegion3\", \"NVL\"(\"chinaRegion2\", \"chinaRegion1\")) CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            String sql1 = "SELECT \"newsid\",  \"url\", \"urlhash\"," + " \"title\",  \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + "\"chinaRegion3\" CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
//                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode2 + "%'or \"chinaRegion2\" LIKE '" + regionCode2 + "%' or \"chinaRegion3\" LIKE '" + regionCode2 + "%')";
                sql1 += " and ( \"chinaRegion3\" LIKE '" + regionCode2 + "%' )";
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS') ORDER BY \"time\" DESC";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {
                    String[] arr = region.split(",");
                    for (int i = 0; i < arr.length; i++) {
                        String[] temarr = arr[i].split("_");
                        if (temarr.length == 2) {
                            String code = temarr[0].trim();
                            if (code.substring(0, 4).equals(regionCode1)) {
//                                code = code.substring(0, 4) + "00";
                                String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                                List<Map> list = getBySqlMapper.findRecords(sql);
                                String name = "";
                                if (list.size() > 0) {
                                    name = list.get(0).get("name").toString();
                                } else {
                                    name = temarr[1].trim();
                                }


                                Map map3 = new HashMap();
                                map3.put("newsid", map.get("newsid"));
                                map3.put("title", map.get("title"));
                                map3.put("fetchTime", map.get("fetchTime"));
                                map3.put("time", map.get("time"));
                                map3.put("source", map.get("source"));
                                list2.add(map3);
                            }

                        }
                    }
                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    @RequestMapping( "getFiles" )
    public void getFiles(HttpServletRequest request, HttpServletResponse response) {
        String[] title = {"省份", "数量"};
        String[] keys = {"name", "SUM"};
        exportFile(staWurandikuai(), title, keys, "污染地块");
        exportFile(staYuqing(), title, keys, "舆情");
        String[] title1 = {"省份", "IA", "IB", "IIA", "IIB", "III"};
        String[] keys1 = {"provinceName", "IA", "IB", "IIA", "IIB", "III"};
        exportFile(staNewPluEnter(), title1, keys1, "新增污染企业");
    }

    /*新增污染企业统计*/
    public List<Map> staNewPluEnter() {
        List<Map> list = new ArrayList<>();
        String sql = "select * from YZ_CONS where 1=1";
        List<Map> list2 = getBySqlMapper.findRecords(sql);//建设项目
        list.addAll(list2);
        String sql1 = "select * from YZ_BAS_ACPT where 1=1";
        List<Map> list1 = getBySqlMapper.findRecords(sql1);//验收项目
        list.addAll(list1);
        List<Map> result = new ArrayList<>();
        for (Map map : list) {
            int flag0 = 0;
            for (Map map1 : result) {
                if (map1.get("provinceName").toString().equals(map.get("PROVINCENAME").toString())) {//判断结果集中是否已有该省份，将相应类数据加一
                    flag0 = 1;
                    int flag = 0;
                    for (String tem : FirstType) {
                        if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//I类污染
                            int flag1 = 0;
                            for (String tem3 : AType) {
                                if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {//A类高风险
                                    map1.put("IA", (map1.get("IA") == null ? 0 : Integer.parseInt(map1.get("IA").toString())) + 1);//IA类数量加1
                                    flag1 = 1;
                                    break;
                                }
                            }
                            if (flag1 == 0) {//其他风险
                                map1.put("IB", (map1.get("IB") == null ? 0 : Integer.parseInt(map1.get("IB").toString())) + 1);//IB类数量加1
                            }
                            flag = 1;
                            break;
                        }
                    }
                    if (flag == 0) {
                        for (String tem : SecondType) {
                            if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {//II类污染
                                int flag2 = 0;
                                for (String tem3 : AType) {
                                    if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {
                                        map1.put("IIA", (map1.get("IIA") == null ? 0 : Integer.parseInt(map1.get("IIA").toString())) + 1);//IIA类数量加1
                                        flag2 = 1;
                                        break;
                                    }
                                }
                                if (flag2 == 0) {
                                    map1.put("IIB", (map1.get("IIB") == null ? 0 : Integer.parseInt(map1.get("IIB").toString())) + 1);//IIB类数量加1
                                }
                                flag = 1;
                                break;
                            }
                        }
                    }
                    if (flag == 0) {//III类污染
                        map1.put("III", (map1.get("III") == null ? 0 : Integer.parseInt(map1.get("III").toString())) + 1);//III类数量加1
                    }
                }
            }
            if (flag0 == 0) {//结果集中没有该省份，添加一个该省份的map对象
                int flag = 0;
                Map map1 = new HashMap();
                //初始化
                map1.put("provinceName", map.get("PROVINCENAME").toString());
                map1.put("IB", 0);
                map1.put("IIA", 0);
                map1.put("IA", 0);
                map1.put("IIB", 0);
                map1.put("III", 0);
                //添加本条数据
                for (String tem : FirstType) {
                    if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {
                        int flag1 = 0;
                        for (String tem3 : AType) {
                            if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {
                                map1.put("IA", 1);
                                flag1 = 1;
                                break;
                            }
                        }
                        if (flag1 == 0) {
                            map1.put("IB", 1);
                        }
                        flag = 1;
                        break;
                    }
                }
                if (flag == 0) {
                    for (String tem : SecondType) {
                        if (map.get("PROJECTNAME").toString().indexOf(tem) != -1) {
                            int flag2 = 0;
                            for (String tem3 : AType) {
                                if (map.get("EIAMANAGENAME").toString().indexOf(tem3) != -1) {
                                    map1.put("IIA", 1);
                                    flag2 = 1;
                                    break;
                                }
                            }
                            if (flag2 == 0) {
                                map1.put("IIB", 1);
                            }
                            flag = 1;
                            break;
                        }
                    }
                }
                if (flag == 0) {
                    map1.put("III", 1);
                }
                result.add(map1);
            }
        }
        return result;
    }

    /*污染地块统计*/
    public List<Map> staWurandikuai() {
        String sql = "select T1.SUM,T2.\"name\" from (select count(1) SUM,PROVINCE_CODE from \"tb_wurandikuai\" " + " GROUP BY PROVINCE_CODE )T1 LEFT JOIN \"tb_city\" T2 on T1.PROVINCE_CODE = T2.\"code\" ORDER BY SUM DESC";
        List<Map> list = getBySqlMapper.findRecords(sql);
        return list;
    }

    /*舆情统计*/
    public List<Map> staYuqing() {
        String sql1 = "SELECT * from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
        List<Map> list1 = getBySqlMapper.findRecords(sql1);
        Map result = new HashMap();
        for (Map map : list1) {
            String region = map.get("chinaRegion1") == null ? "" : map.get("chinaRegion1").toString();
            if (!region.equals("")) {
                String[] arr = region.split(",");
                for (int i = 0; i < arr.length; i++) {
                    String[] temarr = arr[i].split("_");
                    if (temarr.length == 2) {
                        String name = arr[i].split("_")[1].trim();
                        if (result.containsKey(name)) {
                            result.put(name, Integer.parseInt(result.get(name).toString()) + 1);
                        } else {
                            result.put(name, 1);
                        }
                    }
                }
            }
        }
        Set<Map> mapSet = result.entrySet();
        Iterator it = mapSet.iterator();
        List<Map> list3 = new ArrayList<>();
        while (it.hasNext()) {
            Map.Entry<String, String> entry = (Map.Entry<String, String>) it.next();
            Map map = new HashMap();
            if (entry.getKey() == null) {
            }
            map.put("name", entry.getKey());
            map.put("SUM", entry.getValue());
            list3.add(map);
        }
        return list3;
    }

    /*导出文件*/
    public void exportFile(List<Map> list, String[] title, String[] keys, String name) {
        String url = "D:/file";
        File file3 = new File(url);
        HSSFWorkbook wb = new HSSFWorkbook();
        HSSFSheet sheet = wb.createSheet(name);
        HSSFRow row = sheet.createRow((int) 0);
        HSSFCellStyle style = wb.createCellStyle();
        HSSFFont font = wb.createFont();
        font.setColor(HSSFColor.VIOLET.index);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        int len = title.length;
        for (int k = 0; k < len; k++) {
            HSSFCell cell = row.createCell((short) k);
            cell.setCellValue(title[k]);
            cell.setCellStyle(style);
        }
        for (int i = 0; i < list.size(); i++) {
            Map map = list.get(i);
            row = sheet.createRow((int) i + 1);
            for (int j = 0; j < len; j++) {
                row.createCell((short) j).setCellValue(map.get(keys[j]).toString());
            }
        }
        try {
            FileOutputStream fout = new FileOutputStream(url + "/" + name + ".xlsx");
            wb.write(fout);
            fout.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:遥感核查统计网格内数量
     * @Date:9:41 2017/11/23
     */
    @RequestMapping( "staYghc" )
    public EdatResult staYghc(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
       /*     int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String xmin = data.getString("xmin");
            String xmax = data.getString("xmax");
            String ymin = data.getString("ymin");
            String ymax = data.getString("ymax");
            String industry = data.getString("industry");
            String sql = "select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", " + "\"LONGITUDE\", \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\", \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", \"SURVEY_STATUS\", " + "\"SURVEY_PROGRESS\", \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", " + "\"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", \"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where TO_NUMBER(LONGITUDE) >" + xmin + " and TO_NUMBER(LONGITUDE) <=" + xmax + " and " + " TO_NUMBER(LATITUDE) >" + ymin + " and TO_NUMBER(LATITUDE) <=" + ymax + "";

            if (!industry.equals("")) {
                sql += " and \"DALEI\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" + "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" + "危险废物处理处置')";
                sql += " and   \"DALEI\" in " + str + "";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * 更具网格的行列号查询土地利用数据
     */
    @RequestMapping( "getTudiliyongData" )
    public EdatResult getTudiliyongData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String lineNum = data.getString("lineNum");
            String columnNum = data.getString("columnNum");
            String sql = "select \"CODE\",\"SUM\"(\"AREA\") as area from \"tb_wangge_tudiliyong\" where LINENUM=" + lineNum + " and COLUMNNUM=" + columnNum + " GROUP BY CODE";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情市内点位
     * @Date:13:45 2017/11/23
     */
    @RequestMapping( "staNetwork1" )
    public EdatResult staNetwork1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
            String industry = data.getString("industry");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            String regionCode1 = regionCode.substring(0, 4);
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
//            String sql1 = "select * from (SELECT  \"newsid\",\"NVL\"(\"chinaRegion3\", \"NVL\"(\"chinaRegion2\", \"chinaRegion1\"))" + " CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            String sql1 = "select * from (SELECT  \"newsid\",\"chinaRegion3\" CODE from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";

            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            }

            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode2 + "%'or \"chinaRegion2\" LIKE '" + regionCode2 + "%' or \"chinaRegion3\" LIKE '" + regionCode2 + "%')";
//                sql1 += " and (\"chinaRegion3\" LIKE '" + regionCode2 + "%')";
            }
            sql1 += " ) where CODE like '%" + regionCode1 + "%' ";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            List<String> list1 = new ArrayList();
            Set<String> set = new HashSet();
            for (Map map : list) {
                String[] arr = map.get("CODE").toString().split(",");
                for (String str : arr) {
                    String[] temarr = str.split("_");
                    if (temarr.length == 2 && temarr[0].trim().substring(0, 4).equals(regionCode1)) {
                        list1.add(temarr[0].trim());
                        set.add(temarr[0].trim());
                    }
                }
            }
            for (String str : set) {
                String sql = "select * from \"tb_city\" where \"code\" = '" + str + "' and \"lon\" is not null and \"lat\" is not null";
                List<Map> list2 = getBySqlMapper.findRecords(sql);
                if (list2.size() > 0) {
                    int num = Collections.frequency(list1, str);
                    Map map = new HashMap();
                    map.put("count", num);
                    map.put("lon", list2.get(0).get("lon").toString());
                    map.put("lat", list2.get(0).get("lat").toString());
                    map.put("code", str);
                    map.put("name", list2.get(0).get("name") == null ? "" : list2.get(0).get("name").toString());
                    result.add(map);
                }
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情点位详情
     * @Date:13:46 2017/11/23
     */
    @RequestMapping( "staNetwork2" )
    public EdatResult staNetwork2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String code = data.getString("code");
            String industry = data.getString("industry");
            String startTime = "";
            String endTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String sql1 = "select* from (SELECT \"NVL\"(\"chinaRegion3\", \"NVL\"(\"chinaRegion2\", \"chinaRegion1\")) CODE, \"newsid\", \"url\", \"urlhash\"," + " \"title\", \"content\", \"source\",to_char(\"time\",'yyyy-mm-dd HH24:mi:ss') \"time\"," + " to_char(\"fetchTime\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\", \"summary\", " + " \"newsType\", \"domain\",  \"mainContentHtml\"," + " \"encoding\", \"codePage\", \"state\" from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'";
            if (!industry.equals("")) {
                if (industry.equals("其他")) {
                    sql1 += " and \"DICT_type\" is null ";
                } else {
                    sql1 += " and \"DICT_type\" = '" + industry + "'";
                }
            }
            if (startTime.equals("")) {
                if (endTime.equals("")) {
                    sql1 += " and SYSDATE-TO_DATE(to_char(\"time\", 'yyyy-mm-dd hh24:mi:ss'),'yyyy-mm-dd hh24:mi:ss')<= 30";
                } else {
                    sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
                }
            } else if (endTime.equals("")) {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            } else {
                sql1 += " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('" + startTime + "', 'YYYY-MM-DD:HH24:MI:SS')" + " and TO_DATE(TO_CHAR(\"time\",'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('" + endTime + "', 'YYYY-MM-DD:HH24:MI:SS')";
            }
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql1 += " and (\"chinaRegion1\" LIKE '" + regionCode2 + "%'or \"chinaRegion2\" LIKE '" + regionCode2 + "%' or \"chinaRegion3\" LIKE '" + regionCode2 + "%')";
            }
            sql1 += " )where CODE like '%" + code + "%'";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            for (Map map : list) {
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("content");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("content", content);
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
     * @Param:
     * @Description:舆情预警市内点位
     * @Date:13:45 2017/11/23
     */
    @RequestMapping( "staYQ123691FO1" )
    public EdatResult staYQ123691FO1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
            String industry = data.getString("industry");
            String regionCode1 = regionCode.substring(0, 4);
            String endTime = "";
            String startTime = "";
            if (data.has("startTime")) {
                startTime = data.getString("startTime");
            }
            if (data.has("endTime")) {
                endTime = data.getString("endTime");
            }
            String sql1 = "SELECT count(*) \"count\",AREA_CODE from YQ12369_DSJ_REPORTINFO where AREA_CODE LIKE '%" + regionCode1 + "%' " +
                    "and  TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('"+startTime+"', " +
                    "'YYYY-MM-DD:HH24:MI:SS') and TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS')" +
                    " <= TO_DATE('"+endTime+"', 'YYYY-MM-DD:HH24:MI:SS')";

            if (!industry.equals("")) {
                sql1 += " and REPORT_FROM = " + industry;
            }
            sql1 += " group by AREA_CODE";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                String code = map.get("AREA_CODE").toString();
                String sql = "select * from YQ12369_DSJ_REPORTINFO where AREA_CODE = '" + code + "' and REPORT_LONGITUDE is not null and REPORT_LATITUDE is not null " +
                        "and  TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('"+startTime+"', 'YYYY-MM-DD:HH24:MI:SS') and " +
                        "TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('"+endTime+"', 'YYYY-MM-DD:HH24:MI:SS')";
                List<Map> list1 = getBySqlMapper.findRecords(sql);
                Map map1 = new HashMap();
                String lon = "";
                String lat = "";
                if (list1.size() > 0) {
                    lon = list1.get(0).get("REPORT_LONGITUDE").toString();
                    lat = list1.get(0).get("REPORT_LATITUDE").toString();
                } else {
                    String sql2 = "select * from \"tb_city\" where \"code\" = '" + code + "' and \"lon\" is not null and  \"lat\" is not null";
                    List<Map> list2 = getBySqlMapper.findRecords(sql2);
                    if (list2.size() > 0) {
                        lon = list2.get(0).get("lon").toString();
                        lat = list2.get(0).get("lat").toString();
                    }
                }
                map1.put("lon", lon);
                map1.put("lat", lat);
                map1.put("code", code);
                map1.put("count", map.get("count").toString());
                result.add(map1);
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情预警点位详情
     * @Date:13:46 2017/11/23
     */
    @RequestMapping( "staYQ123691FO2" )
    public EdatResult staYQ123691FO2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
            String industry = data.getString("industry");
            String sql1 = "SELECT \"REPORT_ID\"," + " \"EVENT_NUMBER\",to_char(\"REPORT_TIME\",'yyyy-mm-dd HH24:mi:ss')\"REPORT_TIME\", \"REPORT_FROM\", \"REPORT_DEPT_NAME\", \"AREA_CODE\"," + " \"LOCATION_LABEL\", \"REPORT_CONTENT\", \"REPORT_LONGITUDE\", \"REPORT_LATITUDE\", \"PROCESS_AREA_UNITNAME\", " + "\"INDUSTRY_TYPE\", \"WHETHER_CODE\", \"FINALOPINION\", to_char(\"DATA_UTIME\",'yyyy-mm-dd HH24:mi:ss')\"DATA_UTIME\"" + " from YQ12369_DSJ_REPORTINFO where AREA_CODE  = '" + regionCode + "'";
            ;

            if (!industry.equals("")) {
                sql1 += " and REPORT_FROM = " + industry;
            }
            List<Map> list = getBySqlMapper.findRecords(sql1);
            for (Map map : list) {
                if (map.get("REPORT_CONTENT") == null) {
                    map.put("REPORT_CONTENT", "");
                } else {
                    CLOB clob = (CLOB) map.get("REPORT_CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("REPORT_CONTENT", content);
                }
                if (map.get("FINALOPINION") == null) {
                    map.put("FINALOPINION", "");
                } else {
                    CLOB clob = (CLOB) map.get("FINALOPINION");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("FINALOPINION", content);
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
     * @Param:
     * @Description:点位超标率
     * @Date:11:46 2017/11/28
     */
    @RequestMapping( "getOverproofTotal" )
    public Map getOverproofTotal(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String province = request.getParameter("province");//省
            String city = request.getParameter("city");//市
            String county = request.getParameter("county");//县
            String type = request.getParameter("type");//1有机，2无机
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String sql = "";
            String sql1 = "";
            String sql2 = "";
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql2 += " and \"county_code\" like '" + regionCode2 + "%'";
            }
            if (!county.equals("")) {
                sql2 += " and \"county_code\" = '" + county + "'";
            } else if (!city.equals("")) {
                sql2 += " and \"county_code\" like '" + city.substring(0, 4) + "%'";
            } else if (!province.equals("")) {
                sql2 += " and \"county_code\" like '" + province.substring(0, 2) + "%'";
            }
            List<Map> list = new ArrayList<>();
            if (type.equals("1")) {
                sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select " + " \"county_code\", \"tatal_number\", \"none_pollution_number\", \"slight_pollution_number\", \"light_pollution_number\", \"middle_pollution_number\", \"severe_pollution_number\" from \"overproof_total\" where 1=1 ";
                sql1 = "select count(*) from \"overproof_total\" where 1=1";
                sql += sql2;
                sql1 += sql2;
                sql += ")T1 left join \"tb_city\" T2 on \"RPAD\"(\"SUBSTR\"(T1.\"county_code\", 0, 2), 6, 0) = T2.\"code\"" + " left join \"tb_city\" T3 on \"RPAD\"(\"SUBSTR\"(T1.\"county_code\", 0, 4), 6, 0) = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"county_code\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
                list = getBySqlMapper.findRecords(sql);
            } else {
                sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select " + " \"county_code\", \"NVL\"(\"none_pollution_number2\", 0) \"none_pollution_number\", \"NVL\"(\"slight_pollution_number2\", 0) \"slight_pollution_number\"," + " \"NVL\"(\"light_pollution_number2\", 0) \"light_pollution_number\",\"NVL\"(\"middle_pollution_number2\", 0) \"middle_pollution_number\"," + " \"NVL\"(\"severe_pollution_number2\", 0) \"severe_pollution_number\" from \"overproof_total\" where 1=1 ";
                sql1 = "select count(*) from \"overproof_total\" where 1=1";
                sql += sql2;
                sql1 += sql2;
                sql += ")T1 left join \"tb_city\" T2 on \"RPAD\"(\"SUBSTR\"(T1.\"county_code\", 0, 2), 6, 0) = T2.\"code\"" + " left join \"tb_city\" T3 on \"RPAD\"(\"SUBSTR\"(T1.\"county_code\", 0, 4), 6, 0) = T3.\"code\"" + " left join \"tb_city\" T4 on T1.\"county_code\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
                list = getBySqlMapper.findRecords(sql);
                for (int i = 0; i < list.size(); i++) {
                    Map map = list.get(i);
                    int num = Integer.parseInt(map.get("none_pollution_number").toString()) + Integer.parseInt(map.get("slight_pollution_number").toString()) + Integer.parseInt(map.get("light_pollution_number").toString()) + Integer.parseInt(map.get("middle_pollution_number").toString()) + Integer.parseInt(map.get("severe_pollution_number").toString());
                    map.put("tatal_number", num);
                }
            }
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", getBySqlMapper.findrows(sql1));
            result.put("page", pageNumber / pageSize);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    @RequestMapping( "getshangzhi" )
    public EdatResult getshangzhi(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限问题");
            }

            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();

            String names = "";

            String userlevel = session.getAttribute("userLevel").toString();
            if (!userlevel.equals("0") && !userlevel.equals("1")) {
                String sqlcode = "select * from \"tb_city\" where \"code\"='" + regionCode + "'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
                Map mapS = codemap.get(0);
                names = mapS.get("name").toString();
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");
            String codes = data.getString("code");
            String typecode = "";
            if (type.equals("2")) {
                typecode += codes.substring(0, 2);
            } else if (type.equals("3")) {
                typecode += codes.substring(0, 4);
            }

//            String province = data.getString("province");//
//            String city = data.getString("city");//
            String sql = "";
            String sql1 = "";
            String sql1sum = "";
            String sql2 = "";
            String sql3 = "";
            if (type.equals("1")) {
                sql += "select * from \"tb_network_news\" where \"state\"='0' and \"chinaRegion1\" is not null";

            } else if (type.equals("2")) {
                sql += "select * from \"tb_network_news\" where \"state\"='0' and \"chinaRegion2\" is not null";

            } else if (type.equals("3")) {
                sql += "select * from \"tb_network_news\" where \"state\"='0' and \"chinaRegion3\" is not null";

            }
            List<Map> list = getBySqlMapper.findRecords(sql);

            Map<String, Map<String, Double>> pmap = new HashMap();
            Map<String, Map<String, Double>> dmap = new HashMap();
            //-k
            BigDecimal b1 = new BigDecimal(Math.log(3));
            BigDecimal b2 = new BigDecimal(1);
            double k = -(b2.subtract(b1).doubleValue());
            BigDecimal bigfk = new BigDecimal(k);
            //舆情数据
            //舆情省对应数量
            Map<String, Double> yuqingmap = new HashMap();
            //所有省的总舆情数
            double yqsum = 0;
            //舆情比重
            Map<String, Double> yqbzmap = new HashMap();
            //舆情比重和
            double yqbzsum = 0;
            //舆情中熵值的聚合数
            double yqszjh = 0;
            //舆情熵值
            double yqsz = 0;
            //舆情差异系数
            double yqxs = 0;

            List<String> namelist = new ArrayList();
            for (Map map : list) {
                String name = "";
                if (type.equals("1")) {
                    if (map.get("chinaRegion1") == null || map.get("chinaRegion1").equals("")) {
                        continue;
                    }
                    name = map.get("chinaRegion1").toString();

                } else if (type.equals("2")) {
                    if (map.get("chinaRegion2") == null || map.get("chinaRegion2").equals("")) {
                        continue;
                    }
                    name = map.get("chinaRegion2").toString();

                } else if (type.equals("3")) {
                    if (map.get("chinaRegion3") == null || map.get("chinaRegion3").equals("")) {
                        continue;
                    }
                    name = map.get("chinaRegion3").toString();

                }
                String[] split = name.split(",");
                for (int a = 0; a < split.length; a++) {
                    String name2 = "";
                    String code = "";
                    if (split[a].contains("_")) {
                        code = split[a].substring(0, split[a].indexOf("_"));
                    } else {
                        continue;
                    }

                    code = code.trim();
                    String sqlname = "select * from \"tb_city\" where \"code\"='" + code + "'";
                    if (type.equals("1")) {
                        sqlname += " and \"level\"='0'";
                    } else if (type.equals("2")) {
                        sqlname += " and \"level\"='1'";
                    } else if (type.equals("3")) {
                        sqlname += " and \"level\"='2'";
                    }
                    List<Map> listname = getBySqlMapper.findRecords(sqlname);
                    if (listname.isEmpty()) {
                        continue;
                    }
                    if (!type.equals("1")) {
                        if (type.equals("2")) {
                            if (userlevel.equals("2")) {
                                if (code.substring(0, 2).contains(typecode) && code.substring(0, 2).contains(regionCode.substring(0, 2))) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }
                            } else if (userlevel.equals("3")) {
                                if (code.substring(0, 2).contains(typecode) && code.substring(0, 4).contains(regionCode.substring(0, 4))) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }
                            } else if (userlevel.equals("4")) {
                                if (code.substring(0, 2).contains(typecode) && code.contains(regionCode)) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }

                            } else {
                                if (code.substring(0, 2).contains(typecode)) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }
                            }
                        } else if (type.equals("3")) {
                            if (userlevel.equals("2")) {
                                if (code.substring(0, 4).contains(typecode) && code.substring(0, 2).contains(regionCode.substring(0, 2))) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }
                            } else if (userlevel.equals("3")) {
                                if (code.substring(0, 4).contains(typecode) && code.substring(0, 4).contains(regionCode.substring(0, 4))) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }

                            } else if (userlevel.equals("4")) {
                                if (code.substring(0, 4).contains(typecode) && code.contains(regionCode)) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }

                            } else {
                                if (code.substring(0, 4).contains(typecode)) {
                                    if (yuqingmap.keySet().contains(code)) {
                                        double cou = yuqingmap.get(code) + (double) 1;
                                        yuqingmap.put(code, cou);
                                        yqsum += (double) 1;
                                    } else {

                                        yuqingmap.put(code, (double) 1);
                                    }
                                }

                            }
                        }

                    } else {
                        if (userlevel.equals("2")) {
                            if (code.substring(0, 2).contains(regionCode.substring(0, 2))) {
                                if (yuqingmap.keySet().contains(code)) {
                                    double cou = yuqingmap.get(code) + (double) 1;
                                    yuqingmap.put(code, cou);
                                    yqsum += (double) 1;
                                } else {

                                    yuqingmap.put(code, (double) 1);
                                }
                            }
                        } else if (userlevel.equals("3")) {
                            if (code.substring(0, 4).contains(regionCode.substring(0, 4))) {
                                if (yuqingmap.keySet().contains(code)) {
                                    double cou = yuqingmap.get(code) + (double) 1;
                                    yuqingmap.put(code, cou);
                                    yqsum += (double) 1;
                                } else {

                                    yuqingmap.put(code, (double) 1);
                                }
                            }
                        } else if (userlevel.equals("4")) {
                            if (code.contains(regionCode)) {
                                if (yuqingmap.keySet().contains(code)) {
                                    double cou = yuqingmap.get(code) + (double) 1;
                                    yuqingmap.put(code, cou);
                                    yqsum += (double) 1;
                                } else {

                                    yuqingmap.put(code, (double) 1);
                                }
                            }
                        } else {
                            if (yuqingmap.keySet().contains(code)) {
                                double cou = yuqingmap.get(code) + (double) 1;
                                yuqingmap.put(code, cou);
                                yqsum += (double) 1;
                            } else {

                                yuqingmap.put(code, (double) 1);
                            }
                        }
                    }
                }
            }
            for (String key : yuqingmap.keySet()) {
                Double val = yuqingmap.get(key);
                BigDecimal bigval = new BigDecimal(val);
                BigDecimal bigyqsum = new BigDecimal(yqsum);
                if (yqsum == 0) {
                    continue;
                }
                double bz = bigval.divide(bigyqsum, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                yqbzsum += bz;
                BigDecimal bigbz = new BigDecimal(bz);//pij

                BigDecimal biglogbz = new BigDecimal(Math.log(bz));//log(pij).

                double szdg = biglogbz.multiply(bigbz).doubleValue();//log(pij)*pij
                yqszjh += szdg;//∑pij*log(pij);

                yqbzmap.put(key, bz);
                if (!pmap.keySet().contains(key)) {
                    Map<String, Double> maps = new HashMap();
                    maps.put("yq", bz);
                    pmap.put(key, maps);
                } else {
                    pmap.get(key).put("yq", bz);
                }
                if (!dmap.keySet().contains(key)) {
                    Map<String, Double> maps = new HashMap();
                    maps.put("yq", val);
                    //省市名称处理

                    dmap.put(key, maps);
                }
            }


            BigDecimal bigyqszjh = new BigDecimal(yqszjh);
            BigDecimal big1 = new BigDecimal(1);
            BigDecimal sz = bigfk.multiply(bigyqszjh);
            yqsz = sz.doubleValue();
            yqxs = big1.subtract(sz).doubleValue();//差异系数

            //污染地块比重和
            double wrdkbzh = 0;
            //污染地块比重
            Map<String, Double> dkbzmap = new HashMap();
            //污染地块中熵值的聚合数
            double dkszjh = 0;
            //污染地块中熵值
            double wrdksz = 0;
            //污染地块差异系数
            double dkxs = 0;
            if (type.equals("1")) {
                sql1 += "select * from (select \"PROVINCE_CODE\",count(*) as \"count\" from \"TB_WRDKJBXXB\" ";
                if (userlevel.equals("2")) {
                    sql1 += "where \"PROVINCE_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("3")) {
                    sql1 += "where \"CITY_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("4")) {
                    sql1 += "where \"COUNTRY_CODE\"='" + regionCode + "' ";
                }
                sql1 += "group by \"PROVINCE_CODE\") T1 left join \"tb_city\" T3 on T1.\"PROVINCE_CODE\"= T3.\"code\"";

                sql1sum += "select sum(T1.\"count\") as \"sum\" from (select \"PROVINCE_CODE\",count(*) as \"count\" from \"TB_WRDKJBXXB\" ";
                if (userlevel.equals("2")) {
                    sql1sum += "where \"PROVINCE_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("3")) {
                    sql1sum += "where \"CITY_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("4")) {
                    sql1sum += "where \"COUNTRY_CODE\"='" + regionCode + "' ";
                }
                sql1sum += "group by \"PROVINCE_CODE\") T1 left join \"tb_city\" T3 on T1.\"PROVINCE_CODE\"= T3.\"code\"";

            } else if (type.equals("2")) {
                sql1 += "select * from (select \"CITY_CODE\",count(*) as \"count\" from \"TB_WRDKJBXXB\" where \"PROVINCE_CODE\"='" + codes + "' ";
                if (userlevel.equals("2")) {
                    sql1 += "and \"PROVINCE_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("3")) {
                    sql1 += "and \"CITY_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("4")) {
                    sql1 += "and \"COUNTRY_CODE\"='" + regionCode + "' ";
                }
                sql1 += "group by \"CITY_CODE\") T1 left join \"tb_city\" T3 on T1.\"CITY_CODE\"= T3.\"code\"";
                sql1sum += "select sum(T1.\"count\") as \"sum\" from (select \"CITY_CODE\",count(*) as \"count\" from \"TB_WRDKJBXXB\" where \"PROVINCE_CODE\"='" + codes + "' ";
                if (userlevel.equals("2")) {
                    sql1sum += "and \"PROVINCE_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("3")) {
                    sql1sum += "and \"CITY_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("4")) {
                    sql1sum += "and \"COUNTRY_CODE\"='" + regionCode + "' ";
                }
                sql1sum += "group by \"CITY_CODE\") T1 left join \"tb_city\" T3 on T1.\"CITY_CODE\"= T3.\"code\"";

            } else if (type.equals("3")) {
                sql1 += "select * from (select \"COUNTRY_CODE\",count(*) as \"count\" from \"TB_WRDKJBXXB\" where \"CITY_CODE\"='" + codes + "' ";
                if (userlevel.equals("2")) {
                    sql1 += "and \"PROVINCE_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("3")) {
                    sql1 += "and \"CITY_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("4")) {
                    sql1 += "and \"COUNTRY_CODE\"='" + regionCode + "' ";
                }
                sql1 += "group by \"COUNTRY_CODE\") T1 left join \"tb_city\" T3 on T1.\"COUNTRY_CODE\"= T3.\"code\"";
                sql1sum += "select sum(T1.\"count\") as \"sum\" from (select \"COUNTRY_CODE\",count(*) as \"count\" from \"TB_WRDKJBXXB\" where \"CITY_CODE\"='" + codes + "' ";
                if (userlevel.equals("2")) {
                    sql1sum += "and \"PROVINCE_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("3")) {
                    sql1sum += "and \"CITY_CODE\"='" + regionCode + "' ";
                } else if (userlevel.equals("4")) {
                    sql1sum += "and \"COUNTRY_CODE\"='" + regionCode + "' ";
                }
                sql1sum += "group by \"COUNTRY_CODE\") T1 left join \"tb_city\" T3 on T1.\"COUNTRY_CODE\"= T3.\"code\"";
            }
            List<Map> wrdklist = getBySqlMapper.findRecords(sql1);
            //污染地块数据和
            Integer sum = getBySqlMapper.findrows(sql1sum);

            for (Map map : wrdklist) {
                if (map.get("code") == null || map.get("code").equals("")) {
                    continue;
                }
                String code = map.get("code").toString();
                double count = Double.valueOf(map.get("count").toString());


                BigDecimal bigval = new BigDecimal(count);
                BigDecimal bigyqsum = new BigDecimal(sum);
                double bz = bigval.divide(bigyqsum, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                wrdkbzh += bz;
                BigDecimal bigbz = new BigDecimal(bz);//pij
                BigDecimal biglogbz = new BigDecimal(Math.log(bz));//log(pij).
                double szdg = biglogbz.multiply(bigbz).doubleValue();//log(pij)*pij
                dkszjh += szdg;//∑pij*log(pij);
                dkbzmap.put(code, bz);
                if (!pmap.keySet().contains(code)) {
                    Map<String, Double> maps = new HashMap();
                    maps.put("wrdk", bz);
                    pmap.put(code, maps);
                } else {
                    pmap.get(code).put("wrdk", bz);
                }

                if (!dmap.keySet().contains(code)) {
                    Map<String, Double> maps = new HashMap();
                    maps.put("wrdk", count);

                    dmap.put(code, maps);
                }
            }


            BigDecimal bigdkszjh = new BigDecimal(dkszjh);
            BigDecimal dksz = bigfk.multiply(bigdkszjh);//熵值
            wrdksz = dksz.doubleValue();
            dkxs = big1.subtract(dksz).doubleValue();//差异系数


            //新增污染企业比重和
            double xzbz = 0;
            //新增污染企业中熵值的聚合数
            double xzszjh = 0;
            //新增污染企业熵值
            double xzsz = 0;
            //新增污染企业差异系数
            double xzxs = 0;

            Map<String, Double> xzbzmap = new HashMap();

            Map<String, Double> xzmap = new HashMap();
            if (type.equals("1")) {


                sql2 += "select \"PROVINCENAME\",count(*) as \"count\" from \"YZ_CONS\" where \"PROVINCENAME\"!='国家' ";
                if (userlevel.equals("2")) {
                    sql2 += "and \"PROVINCENAME\"='" + names + "' ";
                } else if (userlevel.equals("3")) {
                    sql2 += "and \"PROVINCENAME\"='" + names + "' ";
                } else if (userlevel.equals("4")) {
                    sql2 += "and \"PROVINCENAME\"='" + names + "' ";
                }
                sql2 += "group by \"PROVINCENAME\"";
                sql3 += "select \"PROVINCENAME\",count(*) as \"count\" from \"YZ_BAS_ACPT\" where \"PROVINCENAME\"!='国家' ";
                if (userlevel.equals("2")) {
                    sql3 += "and \"PROVINCENAME\"='" + names + "' ";
                } else if (userlevel.equals("3")) {
                    sql3 += "and \"PROVINCENAME\"='" + names + "' ";
                } else if (userlevel.equals("4")) {
                    sql3 += "and \"PROVINCENAME\"='" + names + "' ";
                }
                sql3 += "group by \"PROVINCENAME\"";
                List<Map> xz1list = getBySqlMapper.findRecords(sql2);
                List<Map> xz2list = getBySqlMapper.findRecords(sql3);

                //新增和
                double xzh = 0;
                for (Map map : xz2list) {
                    String name = map.get("PROVINCENAME").toString();
                    String sqlname = "select * from \"tb_city\" where \"name\"like'" + name + "%' and \"level\"='0'";

                    List<Map> listname = getBySqlMapper.findRecords(sqlname);
                    if (listname.isEmpty()) {
                        continue;
                    }
                    Map map2 = listname.get(0);
                    String code = map2.get("code").toString();
                    if (!xzmap.keySet().contains(code)) {
                        xzmap.put(code, Double.valueOf(map.get("count").toString()));
                        xzh += Double.valueOf(map.get("count").toString());
                    } else {
                        Double double1 = xzmap.get(code);
                        xzh += Double.valueOf(map.get("count").toString());

                        xzmap.put(code, double1 + Double.valueOf(map.get("count").toString()));
                    }

                }
                for (Map map : xz1list) {
                    String name = map.get("PROVINCENAME").toString();
                    String sqlname = "select * from \"tb_city\" where \"name\" like '" + name + "%' and \"level\"='0'";

                    List<Map> listname = getBySqlMapper.findRecords(sqlname);
                    if (listname.isEmpty()) {
                        continue;
                    }
                    Map map2 = listname.get(0);
                    String code = map2.get("code").toString();
                    if (!xzmap.keySet().contains(code)) {
                        xzh += Double.valueOf(map.get("count").toString());
                        xzmap.put(code, Double.valueOf(map.get("count").toString()));
                    } else {
                        xzh += Double.valueOf(map.get("count").toString());
                        Double double1 = xzmap.get(code);
                        xzmap.put(code, double1 + Double.valueOf(map.get("count").toString()));
                    }

                }


                for (String key : xzmap.keySet()) {
                    Double val = xzmap.get(key);
                    BigDecimal bigval = new BigDecimal(val);
                    BigDecimal bigxzsum = new BigDecimal(xzh);
                    double bz = bigval.divide(bigxzsum, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                    xzbz += bz;
                    BigDecimal bigbz = new BigDecimal(bz);//pij
                    BigDecimal biglogbz = new BigDecimal(Math.log(bz));//log(pij).
                    double szdg = biglogbz.multiply(bigbz).doubleValue();//log(pij)*pij
                    xzszjh += szdg;//∑pij*log(pij);
                    xzbzmap.put(key, bz);
                    if (!pmap.keySet().contains(key)) {
                        Map<String, Double> maps = new HashMap();
                        maps.put("xz", bz);
                        pmap.put(key, maps);
                    } else {
                        pmap.get(key).put("xz", bz);
                    }
                    if (!dmap.keySet().contains(key)) {
                        Map<String, Double> maps = new HashMap();
                        maps.put("xz", val);
                        dmap.put(key, maps);
                    }
                }


                BigDecimal bigxzszjh = new BigDecimal(xzszjh);
                BigDecimal sz2 = bigfk.multiply(bigxzszjh);//熵值
                xzsz = sz2.doubleValue();
                xzxs = big1.subtract(sz2).doubleValue();//差异系数
            }
            //得分
            Map<String, Double> scmap = new HashMap();
            Map<String, Double> qzmap = new HashMap();
            JSONObject obj = new JSONObject();

            if (type.equals("1")) {
                double xsh = xzxs + dkxs + yqxs;
                BigDecimal bigxsh = new BigDecimal(xsh);
                BigDecimal bigxzxs = new BigDecimal(xzxs);
                BigDecimal bigdkxs = new BigDecimal(dkxs);
                BigDecimal bigyqxs = new BigDecimal(yqxs);

                double xzqs = bigxzxs.divide(bigxsh, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                double dkqs = bigdkxs.divide(bigxsh, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                double yqqs = bigyqxs.divide(bigxsh, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                qzmap.put("dkqz", dkqs);
                qzmap.put("yqqz", yqqs);
                qzmap.put("xzqz", xzqs);
                for (String code : pmap.keySet()) {
                    Map<String, Double> map = pmap.get(code);
                    double yqbz = 0;
                    double wrdkbz = 0;
                    double xzbz2 = 0;
                    if (map.keySet().contains("yq")) {
                        yqbz = map.get("yq");
                    }
                    if (map.keySet().contains("xz")) {
                        xzbz2 = map.get("xz");
                    }
                    if (map.keySet().contains("wrdk")) {
                        wrdkbz = map.get("wrdk");
                    }


                    BigDecimal bigyqbz = new BigDecimal(yqbz);
                    BigDecimal bigwrdkbz = new BigDecimal(wrdkbz);
                    BigDecimal bigxzbz2 = new BigDecimal(xzbz2);

                    BigDecimal bigdkqs = new BigDecimal(dkqs);
                    BigDecimal bigyqqs = new BigDecimal(yqqs);
                    BigDecimal bigxzqs = new BigDecimal(xzqs);
                    double xz = 0;
                    double dk = 0;
                    double yq = 0;
                    double s = 0;//分值
                    if (map.keySet().contains("xz")) {
                        xz = bigxzqs.multiply(bigxzbz2).doubleValue();
                    }
                    if (map.keySet().contains("yq")) {
                        yq = bigyqqs.multiply(bigyqbz).doubleValue();
                    }
                    if (map.keySet().contains("wrdk")) {
                        dk = bigdkqs.multiply(bigwrdkbz).doubleValue();
                    }
                    s = xz + dk + yq;

                    scmap.put(code, s);
                }
                obj.put("qs", qzmap);
                obj.put("sc", scmap);
            } else {

                double xsh = xzxs + dkxs + yqxs;
                BigDecimal bigxsh = new BigDecimal(xsh);
                BigDecimal bigdkxs = new BigDecimal(dkxs);
                BigDecimal bigyqxs = new BigDecimal(yqxs);

                double dkqs = bigdkxs.divide(bigxsh, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                double yqqs = bigyqxs.divide(bigxsh, 5, BigDecimal.ROUND_HALF_UP).doubleValue();
                qzmap.put("dkqz", dkqs);
                qzmap.put("yqqz", yqqs);

                for (String code : pmap.keySet()) {
                    Map<String, Double> map = pmap.get(code);
                    double yqbz = 0;
                    double wrdkbz = 0;
                    if (map.keySet().contains("yq")) {
                        yqbz = map.get("yq");
                    }
                    if (map.keySet().contains("wrdk")) {
                        wrdkbz = map.get("wrdk");
                    }


                    BigDecimal bigyqbz = new BigDecimal(yqbz);
                    BigDecimal bigwrdkbz = new BigDecimal(wrdkbz);

                    BigDecimal bigdkqs = new BigDecimal(dkqs);
                    BigDecimal bigyqqs = new BigDecimal(yqqs);

                    double dk = 0;
                    double yq = 0;
                    double s = 0;//分值

                    if (map.keySet().contains("yq")) {
                        yq = bigyqqs.multiply(bigyqbz).doubleValue();
                    }
                    if (map.keySet().contains("wrdk")) {
                        dk = bigdkqs.multiply(bigwrdkbz).doubleValue();
                    }
                    s = dk + yq;

                    scmap.put(code, s);
                }

                obj.put("qs", qzmap);
                obj.put("sc", scmap);

            }
            return EdatResult.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * @Author:szz
     * @Param:
     * @Description:比对分析
     * @Date:2018/1/25
     */
    @RequestMapping( "getBDFX" )
    public EdatResult getBDFX(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "432");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String sql = "";
            String sql2 = "";
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql2 += " and a3.\"code\" like '" + regionCode2 + "%'";
            }
            List<Map> list = new ArrayList<>();
//            sql = "select t4.\"code\",count(0) as num from "+
//            		"(select t1.\"id\",t1.\"province\",t1.\"enterpriseName\",T2.\"name\",t2.\"code\" from \"tb_key_industry_enterprise\" t1"+
//            		" left join \"tb_city\" t2 on t1.\"province\"=t2.\"code\") t4 "+
//            		" inner join \"tb_wurandikuai_yaoganhecha\" t3 on t3.\"NAME\"=t4.\"enterpriseName\""+
//            		"  where 1=1 ";
//            sql += sql2 + " group by t4.\"code\"";
            sql = "select a2.SHENG,a3.\"code\",num/zbnum*100 as rate,num,yghcnum,zbnum from (" + " select t4.\"name\",count(0) as num from " + "  (select t1.\"id\",t1.\"province\",t1.\"enterpriseName\",T2.\"name\",t2.\"code\" from \"tb_key_industry_enterprise\" t1" + " left join \"tb_city\" t2 on t1.\"province\"=t2.\"code\") t4 " + " where exists (select 1 from \"tb_wurandikuai_yaoganhecha\" t3 where t3.\"NAME\"=t4.\"enterpriseName\")" + "  group by t4.\"name\") a1" + "  right join (select SHENG,count(0) as yghcnum from \"tb_wurandikuai_yaoganhecha\" t2 group by SHENG) a2 on a1.\"name\"=a2.SHENG " + "  left join \"tb_city\" a3 on a2.SHENG=a3.\"name\"" + " left join (select \"province\",count(0) as zbnum from \"tb_key_industry_enterprise\" group by \"province\") a4 on a3.\"code\"=a4.\"province\" " + " where 1=1 " + sql2;
            list = getBySqlMapper.findRecords(sql);

//            Map result = new HashMap();
//            result.put("rows", list);
//            return result;

            Map<String, String> scmap = new HashMap();
            double maxNum = 0;
            for (Map map : list) {
                if (map.get("RATE") != "" && map.get("RATE") != null) {
                    scmap.put(map.get("code").toString(), map.get("RATE").toString());
                    double currNum = Double.parseDouble(map.get("RATE").toString());
                    if (maxNum < currNum) {
                        maxNum = currNum;
                    }
                }
            }
            JSONObject obj = new JSONObject();
            obj.put("sc", list);
            obj.put("maxNum", maxNum);

            return EdatResult.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @RequestMapping( "getBDFX2" )
    public EdatResult getBDFX2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "432");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");

            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");

            String sql = "";
            String sql2 = "";
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql2 += " and a3.\"code\" like '" + regionCode2 + "%'";
            }
            List<Map> list = new ArrayList<>();
            sql = "select a2.SHI,a3.\"code\",num/zbnum*100 as rate,num,yghcnum,zbnum from (" + " select t4.\"name\",count(0) as num from " + "  (select t1.\"id\",t1.\"province\",t1.\"enterpriseName\",T2.\"name\",t2.\"code\" from \"tb_key_industry_enterprise\" t1" + " left join \"tb_city\" t2 on t1.\"city\"=t2.\"code\") t4 " + " where exists (select 1 from \"tb_wurandikuai_yaoganhecha\" t3 where t3.\"NAME\"=t4.\"enterpriseName\")" + "  group by t4.\"name\") a1" + "  right join (select SHI,count(0) as yghcnum from \"tb_wurandikuai_yaoganhecha\" t2 group by SHI) a2 on a1.\"name\"=a2.SHI " + "  left join \"tb_city\" a3 on a2.SHI=a3.\"name\"" + " left join (select \"city\",count(0) as zbnum from \"tb_key_industry_enterprise\" group by \"city\") a4 on a3.\"code\"=a4.\"city\" " + " where 1=1 and a3.\"code\" like '" + regionCode.substring(0, 2) + "%'" + sql2;
            list = getBySqlMapper.findRecords(sql);
            Map<String, String> scmap = new HashMap();
            double maxNum = 0;
            for (Map map : list) {
                if (map.get("RATE") != "" && map.get("RATE") != null) {
                    scmap.put(map.get("code").toString(), map.get("RATE").toString());
                    double currNum = Double.parseDouble(map.get("RATE").toString());
                    if (maxNum < currNum) {
                        maxNum = currNum;
                    }
                }
            }
            JSONObject obj = new JSONObject();
            obj.put("sc", list);
            obj.put("maxNum", maxNum);

            return EdatResult.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @RequestMapping( "getBDFX3" )
    public EdatResult getBDFX3(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "432");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");

            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");

            String sql = "";
            String sql2 = "";
            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql2 += " and a3.\"code\" like '" + regionCode2 + "%'";
            }
            List<Map> list = new ArrayList<>();
            sql = "select a2.XIAN,a3.\"code\",num/zbnum*100 as rate,num,yghcnum,zbnum from (" + " select t4.\"name\",count(0) as num from " + "  (select t1.\"id\",t1.\"province\",t1.\"enterpriseName\",T2.\"name\",t2.\"code\" from \"tb_key_industry_enterprise\" t1" + " left join \"tb_city\" t2 on t1.\"district\"=t2.\"code\") t4 " + " where exists (select 1 from \"tb_wurandikuai_yaoganhecha\" t3 where t3.\"NAME\"=t4.\"enterpriseName\")" + "  group by t4.\"name\") a1" + "  right join (select XIAN,count(0) as yghcnum from \"tb_wurandikuai_yaoganhecha\" t2 group by XIAN) a2 on a1.\"name\"=a2.XIAN " + "  left join \"tb_city\" a3 on a2.XIAN=a3.\"name\"" + " left join (select \"district\",count(0) as zbnum from \"tb_key_industry_enterprise\" group by \"district\") a4 on a3.\"code\"=a4.\"district\" " + " where 1=1 and a3.\"code\" like '" + regionCode.substring(0, 2) + "%'" + sql2;
            list = getBySqlMapper.findRecords(sql);
            Map<String, String> scmap = new HashMap();
            double maxNum = 0;
            for (Map map : list) {
                if (map.get("RATE") != "" && map.get("RATE") != null) {
                    scmap.put(map.get("code").toString(), map.get("RATE").toString());
                    double currNum = Double.parseDouble(map.get("RATE").toString());
                    if (maxNum < currNum) {
                        maxNum = currNum;
                    }
                }
            }
            JSONObject obj = new JSONObject();
            obj.put("sc", list);
            obj.put("maxNum", maxNum);

            return EdatResult.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 综合分析-监管企业比对分析-自行发布
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZhfxTable" )
    public EdatResult getZhfxTable(@RequestBody Map<String, Object> requestDate, HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession();
        int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
        String regionCode2 = (String) session.getAttribute("regionCode");
        //接收data
        Map<String, Object> data = (Map<String, Object>) requestDate.get("data");
        Object parmobj = data.get("pageNum");
        int pageNum = Integer.parseInt(parmobj.toString());
        parmobj = data.get("pageSize");

        //获取页面大小
        int pageSize = Integer.parseInt(parmobj.toString());
        //分页查询的条件
        int startNum = (pageNum - 1) * pageSize;
        int endNum = pageNum * pageSize;
        String regionCode = data.get("code").toString();
        String sql1 = "", sql2 = "", sql3 = "";
        if (regionCode.equals("000000")) {
            sql2 = "a.\"code\" = b.\"province\"";
            sql3 = "a1.nam = c.\"SHENG\"";
        } else {
            if (regionCode.substring(2, 6).equals("0000")) {
                sql1 = "where \"code\"=" + regionCode;
                sql2 = "a.\"code\" = b.\"province\"";
                sql3 = "a1.nam = c.\"SHENG\"";
            } else if (regionCode.substring(4, 6).equals("00")) {
                sql1 = "where \"code\"=" + regionCode;
                sql2 = "a.\"code\" = b.\"city\"";
                sql3 = "a1.nam = c.\"SHI\"";
            } else {
                sql1 = "where \"code\"=" + regionCode;
                sql2 = "a.\"code\" = b.\"district\"";
                sql3 = "a1.nam = c.\"XIAN\"";
            }
        }

        String sql = "select * from ( select nm,you ,ROWNUM RN from (select q1.nm,nvl(cunzai,0)you from (select \"enterpriseName\" nm from ( select \"code\",\"name\" from \"tb_city\" " + sql1 + "" + ")a  left join  (select \"province\",\"city\",\"district\",\"enterpriseName\"  from \"tb_key_industry_enterprise\" " + ")b on " + sql2 + " )q1 FULL JOIN  (select b.nm,1 as cunzai from (select \"enterpriseName\" nm from \"tb_key_industry_enterprise\")a  inner join" + "(select \"NAME\" nm from \"tb_wurandikuai_yaoganhecha\") b on a.nm=b.nm) q2 on  q1.nm = q2.nm where q1.nm is not null order by you desc )) where RN BETWEEN " + startNum + " AND " + endNum + " ";

        String count_sql = "select count(*) from (select \"enterpriseName\" nm from ( select \"code\",\"name\" from \"tb_city\" " + sql1 + "" + ")a  left join  (select \"province\",\"city\",\"district\",\"enterpriseName\"  from \"tb_key_industry_enterprise\" " + ")b on " + sql2 + " )q1 FULL JOIN  (select b.nm,1 as cunzai from (select \"enterpriseName\" nm from \"tb_key_industry_enterprise\")a  inner join" + "(select \"NAME\" nm from \"tb_wurandikuai_yaoganhecha\") b on a.nm=b.nm) q2 on  q1.nm = q2.nm where q1.nm is not null";

        List<Map> list = getBySqlMapper.findRecords(sql);


        int total = this.getBySqlMapper.findrows(count_sql);
        Map resultmap = new HashMap();
        resultmap.put("total", total);
        resultmap.put("rows", list);
        resultmap.put("pageNum", pageNum);
        return EdatResult.ok(resultmap);
    }

    /**
     * 综合分析-监管企业比对分析-遥感核查
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getZhfxTable2" )
    public EdatResult getZhfxTable2(@RequestBody Map<String, Object> requestDate, HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession();
        int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
        String regionCode2 = (String) session.getAttribute("regionCode");
        //接收data
        Map<String, Object> data = (Map<String, Object>) requestDate.get("data");
        Object parmobj = data.get("pageNum");
        int pageNum = Integer.parseInt(parmobj.toString());
        parmobj = data.get("pageSize");

        //获取页面大小
        int pageSize = Integer.parseInt(parmobj.toString());
        //分页查询的条件
        int startNum = (pageNum - 1) * pageSize;
        int endNum = pageNum * pageSize;
        String regionCode = data.get("code").toString();
        String sql1 = "", sql2 = "", sql3 = "";
        if (regionCode.equals("000000")) {
            sql2 = "a.\"code\" = b.\"province\"";
            sql3 = "a1.nam = c.\"SHENG\"";
        } else {
            if (regionCode.substring(2, 6).equals("0000")) {
                sql1 = "where \"code\"=" + regionCode;
                sql2 = "a.\"code\" = b.\"province\"";
                sql3 = "a1.nam = c.\"SHENG\"";
            } else if (regionCode.substring(4, 6).equals("00")) {
                sql1 = "where \"code\"=" + regionCode;
                sql2 = "a.\"code\" = b.\"city\"";
                sql3 = "a1.nam = c.\"SHI\"";
            } else {
                sql1 = "where \"code\"=" + regionCode;
                sql2 = "a.\"code\" = b.\"district\"";
                sql3 = "a1.nam = c.\"XIAN\"";
            }
        }

        String sql = "select * from  (select nm,you ,ROWNUM RN from (select q1.nm,nvl(cunzai,0)you,ROWNUM RN from  (select nm from " + " (select \"code\" code1,\"name\" nam from \"tb_city\" " + sql1 + ")a1 " + "left join (select \"NAME\" nm,\"SHENG\",\"SHI\",\"XIAN\",\"XIANG\",\"CUN\" from \"tb_wurandikuai_yaoganhecha\") c on " + sql3 + ")q1 " + "FULL JOIN  (select b.nm,1 as cunzai from (select \"enterpriseName\" nm from \"tb_key_industry_enterprise\")a  inner join " + "(select \"NAME\" nm from \"tb_wurandikuai_yaoganhecha\") b on a.nm=b.nm)q2 on  q1.nm= q2.nm where q1.nm is not null order by you desc)) " + " where RN BETWEEN " + startNum + " AND " + endNum + " ";

        String count_sql = "select count(*) from  (select nm from " + " (select \"code\" code1,\"name\" nam from \"tb_city\" " + sql1 + ")a1 " + "left join (select \"NAME\" nm,\"SHENG\",\"SHI\",\"XIAN\",\"XIANG\",\"CUN\" from \"tb_wurandikuai_yaoganhecha\") c on " + sql3 + ")q1 " + "FULL JOIN  (select b.nm,1 as cunzai from (select \"enterpriseName\" nm from \"tb_key_industry_enterprise\")a  inner join " + "(select \"NAME\" nm from \"tb_wurandikuai_yaoganhecha\") b on a.nm=b.nm)q2 on  q1.nm= q2.nm where q1.nm is not null";

        List<Map> list = getBySqlMapper.findRecords(sql);
        int total = this.getBySqlMapper.findrows(count_sql);
        Map resultmap = new HashMap();
        resultmap.put("total", total);
        resultmap.put("rows", list);
        resultmap.put("pageNum", pageNum);
        return EdatResult.ok(resultmap);
    }


    /**************2018/01/29 文献统计*********************/
    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情省统计
     * @Date:14:51 2017/11/9
     */
    @RequestMapping( "getWx1" )
    public EdatResult getWx1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");

            String sql1 = "SELECT \"ID\",\"province\"  CODE from \"tb_wenXian\"  ";


            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql1 += " and (\"province\" LIKE '" + regionCode + "%')";
            }

            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {

                    String code = region;
                    code = code.substring(0, 2) + "0000";
                    String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    String name = "";
                    if (list.size() > 0) {
                        name = list.get(0).get("name").toString();

                        int flag = 0;
                        for (Map map1 : list2) {
                            if (map1.get("code").toString().equals(code)) {
                                map1.put("count", Integer.parseInt(map1.get("count").toString()) + 1);
                                flag = 1;
                                break;
                            }
                        }
                        if (flag == 0) {
                            Map map2 = new HashMap();
                            map2.put("code", code);
                            map2.put("count", 1);
                            map2.put("name", name);
                            list2.add(map2);
                        }
                    }

                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:luowenbin
     * @Param:
     * @Description:舆情省统计,右边表格数据
     * @Date:2018/01/29
     */
    @RequestMapping( "getTableWx1" )
    public EdatResult getTableWx1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql1 = "SELECT w.\"ID\",c1.\"name\"||' '||c2.\"name\"||' '||c3.\"name\" addressName,w.\"province\" CODE,w.\"lon\",w.\"lat\"," + "w.\"sheJiQiYe\",w.\"baoDaoShiJian\",w.\"title\",w.\"wuRanShiJian\",w.\"wuRanLeiXing\",w.\"laiYuan\"   from \"tb_wenXian\" w " + "left join \"tb_city\" c1 on w.\"province\"=c1.\"code\" and c1.\"level\"='0' " + "left join \"tb_city\" c2 on w.\"city\"=c2.\"code\" and c2.\"level\"='1'" + "left join \"tb_city\" c3 on w.\"county\"=c3.\"code\" and c3.\"level\"='2' ";

            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql1 += " and (\"province\" LIKE '" + regionCode + "%')";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {

                    String code = region;
                    code = code.substring(0, 2) + "0000";
                    String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    String name = "";
                    if (list.size() > 0) {
                        name = list.get(0).get("name").toString();

                        Map map3 = new HashMap();
                        map3.put("ID", map.get("ID"));
                        map3.put("addressName", map.get("ADDRESSNAME"));
                        map3.put("province", map.get("CODE"));
                        map3.put("lon", map.get("lon"));
                        map3.put("lat", map.get("lat"));
                        map3.put("sheJiQiYe", map.get("sheJiQiYe"));
                        map3.put("baoDaoShiJian", map.get("baoDaoShiJian"));
                        map3.put("title", map.get("title"));
                        map3.put("wuRanShiJian", map.get("wuRanShiJian"));
                        map3.put("wuRanLeiXing", map.get("wuRanLeiXing"));
                        map3.put("laiYuan", map.get("laiYuan"));
                        list2.add(map3);
                    }

                }

            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情省内市统计
     * @Date:14:51 2017/11/9
     */
    @RequestMapping( "getWx2" )
    public EdatResult getWx2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
//            String industry = data.getString("industry");
            String regionCode = data.getString("code");

            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String regionCode1 = regionCode.substring(0, 2);

            String sql1 = "SELECT \"ID\",\"city\"  CODE from \"tb_wenXian\" where \"province\"='" + regionCode + "'  ";

            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql1 += " and (\"province\" LIKE '" + regionCode + "%')";
            }


            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {

                    String code = region;
//                  code = code.substring(0, 2) + "0000";
                    String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    String name = "";
                    if (list.size() > 0) {
                        name = list.get(0).get("name").toString();

                        int flag = 0;
                        for (Map map1 : list2) {
                            if (map1.get("code").toString().equals(code)) {
                                map1.put("count", Integer.parseInt(map1.get("count").toString()) + 1);
                                flag = 1;
                                break;
                            }
                        }
                        if (flag == 0) {
                            Map map2 = new HashMap();
                            map2.put("code", code);
                            map2.put("count", 1);
                            map2.put("name", name);
                            list2.add(map2);
                        }
                    }

                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:luowenbin
     * @Param:
     * @Description:舆情省内市统计，更新右边表格数据
     * @Date:14:51 2018/01/29
     */
    @RequestMapping( "getTableWx2" )
    public EdatResult getTableWx2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode2 = (String) session.getAttribute("regionCode");
            String regionCode1 = regionCode.substring(0, 2);
            String sql1 = "SELECT w.\"ID\",c1.\"name\"||' '||c2.\"name\"||' '||c3.\"name\" addressName,w.\"province\" CODE,w.\"lon\",w.\"lat\"," + "w.\"sheJiQiYe\",w.\"baoDaoShiJian\",w.\"title\",w.\"wuRanShiJian\",w.\"wuRanLeiXing\",w.\"laiYuan\"   from \"tb_wenXian\" w " + "left join \"tb_city\" c1 on w.\"province\"=c1.\"code\" and c1.\"level\"='0' " + "left join \"tb_city\" c2 on w.\"city\"=c2.\"code\" and c2.\"level\"='1'" + "left join \"tb_city\" c3 on w.\"county\"=c3.\"code\" and c3.\"level\"='2' where w.\"province\"='" + regionCode + "'  ";
//    		String sql1 = "SELECT \"ID\",\"city\" CODE,\"title\",\"wuRanShiJian\",\"wuRanLeiXing\" from \"tb_wenXian\" where \"province\"='"+regionCode+"'  ";

            if (userLevel > 1 && !regionCode2.equals("")) {
                if (userLevel == 2) {
                    regionCode2 = regionCode2.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode2 = regionCode2.substring(0, 4);
                }
                sql1 += " and (\"city\" LIKE '" + regionCode + "%')";
            }

            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {

                    String code = region;
//                    code = code.substring(0, 2) + "0000";
                    String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    String name = "";
                    if (list.size() > 0) {
                        name = list.get(0).get("name").toString();

                        Map map3 = new HashMap();
                        map3.put("ID", map.get("ID"));
                        map3.put("addressName", map.get("ADDRESSNAME"));
                        map3.put("province", map.get("CODE"));
                        map3.put("lon", map.get("lon"));
                        map3.put("lat", map.get("lat"));
                        map3.put("sheJiQiYe", map.get("sheJiQiYe"));
                        map3.put("baoDaoShiJian", map.get("baoDaoShiJian"));
                        map3.put("title", map.get("title"));
                        map3.put("wuRanShiJian", map.get("wuRanShiJian"));
                        map3.put("wuRanLeiXing", map.get("wuRanLeiXing"));
                        map3.put("laiYuan", map.get("laiYuan"));
                        list2.add(map3);
                    }

                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情预警市内点位
     * @Date:13:45 2017/11/23
     */
    @RequestMapping( "getWxPoint" )
    public EdatResult getWxPoint(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
//            String industry = data.getString("industry");
//            String regionCode1 = regionCode.substring(0, 4);
            String sql1 = "SELECT \"county\",count(*)  count from \"tb_wenXian\" where \"city\"='" + regionCode + "' group by \"county\"";

            List<Map> result = new ArrayList<>();

            //查询当时市的坐标
            String sql2 = "select * from \"tb_city\" where \"code\" = '" + regionCode + "' and \"lon\" is not null and  \"lat\" is not null";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            //如果当前市有坐标
            if (list2.size() > 0) {
                if (list2.get(0).get("lon") != null && list2.get(0).get("lon") != "" && list2.get(0).get("lat") != null && list2.get(0).get("lat") != "") {
                    Map map1 = new HashMap();
                    map1.put("lon", list2.get(0).get("lon"));
                    map1.put("lat", list2.get(0).get("lat"));
                    map1.put("code", regionCode);
                    map1.put("count", 0);
                    result.add(map1);
                }
            }

//          sql1 += " group by AREA_CODE";
            List<Map> list = getBySqlMapper.findRecords(sql1);

            for (Map map : list) {
                //判断县的code是否存在
                if (map.get("county") == null || map.get("county") == "") {
                    //县的code不存在
                    result.get(0).put("count", map.get("COUNT"));
                } else {
                    String code = map.get("county").toString();
                    String sql = " select * from \"tb_city\",\"lon\",\"lat\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                    List<Map> list3 = getBySqlMapper.findRecords(sql);
                    String name = "";
                    if (list3.size() > 0) {

                        Map map2 = new HashMap();
                        map2.put("lon", list3.get(0).get("lon").toString());
                        map2.put("lat", list3.get(0).get("lat").toString());
                        map2.put("code", code);
                        map2.put("count", 1);
                        result.add(map2);
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
     * @Author:renqiang
     * @Param:
     * @Description:舆情预警市内点位
     * @Date:13:45 2017/11/23
     */
    @RequestMapping( "getWxPointTable" )
    public EdatResult getWxPointTable(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
//            String industry = data.getString("industry");
//            String regionCode1 = regionCode.substring(0, 4);
            String sql1 = "SELECT w.\"ID\",c1.\"name\"||' '||c2.\"name\"||' '||c3.\"name\" addressName,w.\"province\" CODE,w.\"lon\",w.\"lat\"," + "w.\"sheJiQiYe\",w.\"baoDaoShiJian\",w.\"title\",w.\"wuRanShiJian\",w.\"wuRanLeiXing\",w.\"laiYuan\"   from \"tb_wenXian\" w " + "left join \"tb_city\" c1 on w.\"province\"=c1.\"code\" and c1.\"level\"='0' " + "left join \"tb_city\" c2 on w.\"city\"=c2.\"code\" and c2.\"level\"='1'" + "left join \"tb_city\" c3 on w.\"county\"=c3.\"code\" and c3.\"level\"='2' where w.\"city\"='" + regionCode + "'  ";
//            String sql1 = "SELECT \"ID\",\"city\" CODE,\"title\",\"wuRanShiJian\",\"wuRanLeiXing\" from \"tb_wenXian\" where \"city\"='" + regionCode + "' ";


//            sql1 += " group by AREA_CODE";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            List<Map> list2 = new ArrayList<>();
            for (Map map : list1) {
                String region = map.get("CODE") == null ? "" : map.get("CODE").toString();
                if (!region.equals("")) {

                    String code = region;
//                    code = code.substring(0, 2) + "0000";
                    String sql = " select * from \"tb_city\" where \"code\"= '" + code + "' and \"lon\" is not null and \"lat\" is not null";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    String name = "";
                    if (list.size() > 0) {
                        name = list.get(0).get("name").toString();

                        Map map3 = new HashMap();
                        map3.put("ID", map.get("ID"));
                        map3.put("addressName", map.get("ADDRESSNAME"));
                        map3.put("province", map.get("CODE"));
                        map3.put("lon", map.get("lon"));
                        map3.put("lat", map.get("lat"));
                        map3.put("sheJiQiYe", map.get("sheJiQiYe"));
                        map3.put("baoDaoShiJian", map.get("baoDaoShiJian"));
                        map3.put("title", map.get("title"));
                        map3.put("wuRanShiJian", map.get("wuRanShiJian"));
                        map3.put("wuRanLeiXing", map.get("wuRanLeiXing"));
                        map3.put("laiYuan", map.get("laiYuan"));
                        list2.add(map3);
                    }

                }
            }
            return EdatResult.ok(list2);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:舆情预警点位详情
     * @Date:13:46 2017/11/23
     */
    @RequestMapping( "getWxInfoByCode" )
    public EdatResult getWxInfoByCode(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String regionCode = data.getString("code");
//            String industry = data.getString("industry");
            //如果是市的code
            String sql = "";
            if (regionCode.substring(4).toString().equals("00")) {
                sql = "SELECT \"ID\",\"city\" CODE,\"sheJiQiYe\",\"wuRanLeiXing\",\"wuRanShiJian\",\"baoDaoShiJian\",\"title\",\"laiYuan\",\"beizhu\" from \"tb_wenXian\" where \"city\"='" + regionCode + "'  and \"county\" is null";
            } else {
                sql = "SELECT \"ID\",\"city\" CODE,\"sheJiQiYe\",\"wuRanLeiXing\",\"wuRanShiJian\",\"baoDaoShiJian\",\"title\",\"laiYuan\",\"beizhu\" from \"tb_wenXian\" where \"county\"='" + regionCode + "' ";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /*首页评估分析统计数据*/
    @RequestMapping( "getAnalyzeSta" )
    public EdatResult getAnalyzeSta(HttpServletRequest request, HttpServletResponse response) {
        try {
      /*      ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }*/
//            String industry = data.getString("industry");
            //如果是市的code
            List result = new ArrayList();
            String sql1 = "select count(1) NUM from \"YZ_CONS\" ";
            Map map1 = new HashMap();
            map1.put("name", "污染物点位超标率");
            map1.put("total", getBySqlMapper.findrows(sql1));
            String sql2 = "select count(1) NUM from \"TB_WRDKJBXXB\" ";
            Map map2 = new HashMap();
            map2.put("total", getBySqlMapper.findrows(sql2));
            map2.put("name", "污染地块分布");
            String sql3 = "select count(1) NUM from \"tb_key_industry_enterprise\" ";
            Map map3 = new HashMap();
            map3.put("total", getBySqlMapper.findrows(sql3));
            map3.put("name", "污染企业名录");
            String sql4 = "select count(1) NUM from \"tb_network_news\"  where \"state\" = '0'";
            Map map4 = new HashMap();
            map4.put("total", getBySqlMapper.findrows(sql4));
            map4.put("name", "污染舆情监测");
            result.add(map1);
            result.add(map2);
            result.add(map3);
            result.add(map4);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /*获取条件*/
    @RequestMapping( "getYZ_CONS_SEL" )
    public EdatResult getYZ_CONS_SEL(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status, "fail");
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
            String sql = "select *   from TB_CONS_EIATYPE_DIC where TYPE = 3 ";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            String sql2 = "select  *  from TB_CONS_EIATYPE_DIC where TYPE = 2 or TYPE = 1";
            List<Map> list2 = getBySqlMapper.findRecords(sql2);
            String sql3 = "select *  from \"tb_city\" where \"level\" = 0 ";
            List<Map> list3 = getBySqlMapper.findRecords(sql3);
/*            List<String > list11 = new ArrayList<>();
            List<String > list22 = new ArrayList<>();
            List<String > list33 = new ArrayList<>();
            for(Map map:list1){
                list11.add(map.get("NATIONALECONOMYNAME").toString());
            }
            for(Map map:list2){
                list22.add(map.get("EIAMANAGENAME").toString());
            }
            for(Map map:list3){
                list33.add(map.get("PROVINCENAME").toString());
            }*/
            Map result = new HashMap();
            result.put("NATIONALECONOMYNAME", list1);
            result.put("EIAMANAGENAME", list2);
            result.put("PROVINCENAME", list3);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:建设项目
     * @Date:09:23 2017/10/23
     */
    @RequestMapping( "getYZ_BAS_CONS" )
    public EdatResult getYZ_BAS_CONS(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
   /*         int status = Check.CheckRight(request, "5");
            if (status != 0) {
                return EdatResult.build(status,"fail");
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
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String nationaleconomyname = data.getString("nationaleconomyname");//国民经济名称
            String eiamanagename = data.getString("eiamanagename");//环评行业名称
            String province = RegUtil.checkParam(data.getString("province"));//省份
            String startTime = RegUtil.checkParam(data.getString("startTime"));//
            String endTime = RegUtil.checkParam(data.getString("endTime"));//
            if (startTime.equals("")) {
                return EdatResult.build(1, "没有开始时间");
            }
            if (endTime.equals("")) {
                return EdatResult.build(1, "没有结束时间");
            }
            int type = data.getInt("type");//1省、2国民经济名称、3环评行业名称,4年，5月
            JSONArray type1 = data.getJSONArray("type1");//1建设项目综合统计分析,2企业关闭预警,3建设项目污染情况分析
            Map result = new HashMap();
            List r1 = new ArrayList();//建设项目数据
            List r2 = new ArrayList();//企业关闭预警数据
            List r3 = new ArrayList();//疑似污染地块数据
            List r4 = new ArrayList();//污染地块数据
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-M-d");
            List<String> x = new ArrayList<>();
            String sel = "";
            if (!eiamanagename.equals("")) {
                String[] tem = eiamanagename.split(",");
                String str0 = "";
                String str = "";
                for (String tem1 : tem) {
                    if (tem1.length() == 1) {
                        str0 += "'" + tem1 + "',";
                    } else {
                        str += "'" + tem1 + "',";
                    }
                }
                sel += " and ( ";
                if (str0.length() > 0) {
                    sel += " substr(\"EIAMANAGETYPE\",0,1) in (" + str0.substring(0, str0.length() - 1) + ")";
                    if (str.length() > 0) {
                        sel += " or substr(\"EIAMANAGETYPE\",0,2) in (" + str.substring(0, str.length() - 1) + ")";
                    }
                } else {
                    sel += " substr(\"EIAMANAGETYPE\",0,2) in (" + str.substring(0, str.length() - 1) + ")";
                }
                sel += ")";
            }
            if (!nationaleconomyname.equals("")) {
                String[] tem = nationaleconomyname.split(",");
                String str = "'" + tem[0] + "'";
                for (int i = 1; i < tem.length; i++) {
                    str += ",'" + tem[i] + "'";
                }
                sel += " and \"NATIONALECONOMYCODE\"  in (" + str + ")";
            }
            if (!province.equals("")) {
                String[] tem = province.split(",");
                String str = "'" + tem[0] + "'";
                for (int i = 1; i < tem.length; i++) {
                    str += ",'" + tem[i] + "'";
                }
                sel += " and \"PROVINCENAME\" in (" + str + ")";
            }
            if (!startTime.equals("")) {
                sel += " and \"ACCEPTANCEDATE\" >= \"TO_CHAR\"(\"TO_DATE\"('" + startTime + " 00:00:00', 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sel += " and \"ACCEPTANCEDATE\" <= \"TO_CHAR\"(\"TO_DATE\"('" + endTime + " 23:59:59', 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss')";
            }
            Map<String, Integer> rr = new HashMap<>();
            if (type == 2) {
                /*if (nationaleconomyname.equals("")) {
                    String sql = "select NAME  from TB_CONS_EIATYPE_DIC where TYPE =3 order by NAME asc ";
                    List<Map> list1 = getBySqlMapper.findRecords(sql);
                    for (Map map : list1) {
                        x.add(map.get("NAME").toString());
                    }
                } else {
                    String[] tem = nationaleconomyname.split(",|，");
                    String str="";
                    for(String tem1:tem){
                        str+="'"+tem1+"',";
                    }
                    String sql="select * from TB_CONS_EIATYPE_DIC where TYPE = 3 and CODE in ("+str.substring(0,str.length()-1)+")";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    for(Map map:list){
                        x.add(map.get("NAME").toString());
                    }
                }*/
            } else if (type == 3) {
               /* if (eiamanagename.equals("")) {
                    String sql = "select NAME  from TB_CONS_EIATYPE_DIC where TYPE !=3 order by NAME asc";
                    List<Map> list1 = getBySqlMapper.findRecords(sql);
                    for (Map map : list1) {
                        x.add(map.get("NAME").toString());
                    }
                } else {
                    String[] tem = eiamanagename.split(",|，");
                    String str="";
                    for(String tem1:tem){
                        str+="'"+tem1+"',";
                    }
                    String sql="select * from TB_CONS_EIATYPE_DIC where  CODE in ("+str.substring(0,str.length()-1)+")";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    for(Map map:list){
                        x.add(map.get("NAME").toString());
                    }
                }*/
            } else if (type == 4) {
                LocalDate time = LocalDate.parse(startTime);
                LocalDate time2 = LocalDate.parse(endTime);
                while (time.getYear() <= time2.getYear()) {
                    x.add(time.getYear() + "");
                    time = time.plusYears(1);
                }
            } else if (type == 5) {
                LocalDate time = LocalDate.parse(startTime);
                time = LocalDate.of(time.getYear(), time.getMonthValue(), 1);
                LocalDate time2 = LocalDate.parse(endTime);
                String tem="";
                while (!time.isAfter(time2)) {
                    tem=time.getYear() + "-" ;
                    if(time.getMonthValue()<10){
                        tem+="0";
                    }
                    tem+=time.getMonthValue();
                    x.add(tem);
                    time = time.plusMonths(1);
                }
            } else if (type == 1) {
                if (province.equals("")) {
                 /*   String sql = "select distinct PROVINCENAME  from YZ_CONS where PROVINCENAME is not null " + sel;
                    sql+=" order by PROVINCENAME asc";*/
                    String sql = "select \"name\" from  \"tb_city\" where \"level\" = '0' order by \"name\" asc";
                    List<Map> list1 = getBySqlMapper.findRecords(sql);
                    for (Map map : list1) {
                        rr.put(map.get("name").toString(), 0);
                        x.add(map.get("name").toString());
                    }
                } else {
                    x = Arrays.asList(province.split(",|，"));
                }
            }
            if (type1.contains("1")) {
                String mainSql = "select count(1) NUM , ";
                if (type == 2) {
                    mainSql += " NAME  ";
                } else if (type == 3) {
                    mainSql += " NAME ";
                } else if (type == 4) {
                    mainSql += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy') ";
                } else if (type == 5) {
                    mainSql += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm') ";
                } else {
                    mainSql += " PROVINCENAME ";
                }
                mainSql += " NN from(select * from  (select * from  YZ_CONS where PROJECTNAME is not null ";
                mainSql += sel;
                mainSql += " )T0 ";
                if (type == 2) {
                    mainSql += " join TB_CONS_EIATYPE_DIC T3 on T0.NATIONALECONOMYCODE = T3.CODE and T3.TYPE = 3";
                } else if (type == 3) {
                    mainSql += " join TB_CONS_EIATYPE_DIC T3 on ( (substr(T0.EIAMANAGETYPE,0,1) = T3.CODE and T3.TYPE = 1 ) or ( substr(T0.EIAMANAGETYPE,0,2) = T3.CODE and T3.TYPE=2))";
                }
                mainSql += " ) T2 group by ";
                if (type == 2) {
                    mainSql += " NAME  ";
                } else if (type == 3) {
                    mainSql += " NAME";
                } else if (type == 4) {
                    mainSql += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy') ";
                } else if (type == 5) {
                    mainSql += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm') ";
                } else {
                    mainSql += " PROVINCENAME";
                }
                if (type == 4 || type == 5 || type == 1) {
                    mainSql += " order by NN ASC";
                } else {
                    mainSql += " order by NUM desc";
                }
                List<Map> list1 = getBySqlMapper.findRecords(mainSql);
                int pos = 0;
                int l = 0;
                if (type == 4) {
                    while (l < x.size() && pos < list1.size()) {
                        String name = list1.get(pos).get("NN").toString();
                        String name1 = x.get(l);
                        if (LocalDate.parse(name + "-1-1", formatter).equals(LocalDate.parse(name1 + "-1-1", formatter))) {
                            r1.add(Integer.parseInt(list1.get(pos).get("NUM").toString()));
                            pos++;
                            l++;
                        } else {
                            r1.add(0);
                            l++;
                        }
                    }
                    while (l < x.size()) {
                        r1.add(0);
                        l++;
                    }
                } else if (type == 5) {
                    while (l < x.size() && pos < list1.size()) {
                        String name = list1.get(pos).get("NN").toString();
                        String name1 = x.get(l);
                        if (LocalDate.parse(name + "-1", formatter).equals(LocalDate.parse(name1 + "-1", formatter))) {
                            r1.add(Integer.parseInt(list1.get(pos).get("NUM").toString()));
                            pos++;
                            l++;
                        } else {
                            r1.add(0);
                            l++;
                        }
                    }
                    while (l < x.size()) {
                        r1.add(0);
                        l++;
                    }
                } else if (type == 1) {
                    for (Map map : list1) {
                        if (map.get("NN") == null) {
                            continue;
                        }
                        String name = map.get("NN").toString();
                        int num = Integer.parseInt(map.get("NUM").toString());
                        if (rr.containsKey(name)) {
                            rr.put(name, rr.get(name) + num);
                        } else {
                            String[] arr = name.split(",|、");
                            for (String str1 : arr) {
                                for (String tem : rr.keySet()) {
                                    if (tem.indexOf(str1) != -1) {
                                        rr.put(tem, rr.get(tem) + num);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    Comparator<Map.Entry<String, Integer>> valueComparator = new Comparator<Map.Entry<String, Integer>>() {
                        @Override
                        public int compare(Map.Entry<String, Integer> o1, Map.Entry<String, Integer> o2) {
// TODO Auto-generated method stub
                            return o2.getValue() - o1.getValue();
                        }
                    };
// map转换成list进行排序
                    List<Map.Entry<String, Integer>> list = new ArrayList<Map.Entry<String, Integer>>(rr.entrySet());
// 排序
                    Collections.sort(list, valueComparator);
                    if(x.size()>0){
                        x.clear();
                    }
                    for (Map.Entry<String, Integer> tem : list) {
                        x.add(tem.getKey());
                        r1.add(tem.getValue());
                    }
                } else {
                    for (Map map : list1) {
                        x.add(map.get("NN").toString());
                        r1.add(map.get("NUM").toString());
                    }
                }
            }
            /*企业关停预警*/
            if (type1.contains("2")) {

            }
            /*污染情況分析*/
            if (type1.contains("3")) {
                String sql1 = "";
                String sql2 = "";
                String mainSql = "select count(1) NUM , ";
                if (type == 2) {
                    mainSql += " NAME  ";
                } else if (type == 3) {
                    mainSql += " NAME ";
                } else if (type == 4) {

                    mainSql += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy') ";
                } else if (type == 5) {
                    mainSql += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm') ";
                } else {
                    mainSql += " PROVINCENAME";
                }
                mainSql += " NN from(select * from (select * from  (select * from  YZ_CONS where PROJECTNAME is not null ";
                mainSql += sel;
                mainSql += ")T0";
                if (type == 2) {
                    mainSql += " join TB_CONS_EIATYPE_DIC T3 on T0.NATIONALECONOMYCODE = T3.CODE and T3.TYPE = 3";
                } else if (type == 3) {
                    mainSql += " join TB_CONS_EIATYPE_DIC T3 on ( (substr(T0.EIAMANAGETYPE,0,1) = T3.CODE and T3.TYPE = 1 ) or ( substr(T0.EIAMANAGETYPE,0,2) = T3.CODE and T3.TYPE=2))";
                }
                mainSql += " ) T2";
                sql1 = mainSql;
                sql2 = mainSql;
                sql1 += ")T6 join (select * from \"TB_WRDKJBXXB\" where SCJDBM = 'S0')T1 on T6.PROJECTNAME = T1.WRDKMC ";
                sql2 += ")T6 join (select * from \"TB_WRDKJBXXB\" where SCJDBM != 'S0' and SCJDBM is not null)T1 on T6.PROJECTNAME = T1.WRDKMC ";
                String sql3 = " group by ";
                if (type == 2) {
                    sql3 += " NAME  ";
                } else if (type == 3) {
                    sql3 += " NAME";
                } else if (type == 4) {
                    sql3 += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy') ";
                } else if (type == 5) {
                    sql3 += " \"TO_CHAR\"(\"TO_DATE\"(ACCEPTANCEDATE, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm') ";
                } else {
                    sql3 += " PROVINCENAME";
                }
                if (type == 4 || type == 5 || type == 1) {
                    sql3 += " order by NN ASC";
                } else {
                    sql3 += " order by NUM desc";
                }
                sql1 += sql3;
                sql2 += sql3;
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
                List<Map> list2 = getBySqlMapper.findRecords(sql2);
                int pos = 0;
                int l = 0;
                int pos2 = 0;
                int l2 = 0;
                if (type == 4) {
                    while (l < x.size() && pos < list1.size()) {
                        String name = list1.get(pos).get("NN").toString();
                        String name1 = x.get(l);
                        if (LocalDate.parse(name + "-1-1", formatter).equals(LocalDate.parse(name1 + "-1-1", formatter))) {
                            r3.add(Integer.parseInt(list1.get(pos).get("NUM").toString()));
                            pos++;
                            l++;
                        } else {
                            r3.add(0);
                            l++;
                        }
                    }
                    while (l < x.size()) {
                        r3.add(0);
                        l++;
                    }
                    while (l2 < x.size() && pos2 < list2.size()) {
                        String name = list2.get(pos2).get("NN").toString();
                        String name1 = x.get(l2);
                        if (LocalDate.parse(name + "-1-1", formatter).equals(LocalDate.parse(name1 + "-1-1", formatter))) {
                            r4.add(Integer.parseInt(list2.get(pos2).get("NUM").toString()));
                            pos2++;
                            l2++;
                        } else {
                            r4.add(0);
                            l2++;
                        }

                    }
                    while (l2 < x.size()) {
                        r4.add(0);
                        l2++;
                    }
                } else if (type == 5) {
                    while (l < x.size() && pos < list1.size()) {
                        String name = list1.get(pos).get("NN").toString();
                        String name1 = x.get(l);
                        if (LocalDate.parse(name + "-1", formatter).equals(LocalDate.parse(name1 + "-1", formatter))) {
                            r3.add(Integer.parseInt(list1.get(pos).get("NUM").toString()));
                            pos++;
                            l++;
                        } else {
                            r3.add(0);
                            l++;
                        }

                    }
                    while (l < x.size()) {
                        r3.add(0);
                        l++;
                    }
                    while (l2 < x.size() && pos2 < list2.size()) {
                        String name = list2.get(pos2).get("NN").toString();
                        String name1 = x.get(l2);
                        if (LocalDate.parse(name + "-1", formatter).equals(LocalDate.parse(name1 + "-1", formatter))) {
                            r4.add(Integer.parseInt(list2.get(pos2).get("NUM").toString()));
                            pos2++;
                            l2++;
                        } else {
                            r4.add(0);
                            l2++;
                        }

                    }
                    while (l2 < x.size()) {
                        r4.add(0);
                        l2++;
                    }
                } else if (type == 1) {
                    for(String tem:rr.keySet()){
                        rr.put(tem,0);
                    }
                    for(Map map:list1){
                        if(map.get("NN")==null){
                            continue;
                        }
                        String name = map.get("NN").toString();
                        int num = Integer.parseInt(map.get("NUM").toString());
                        if(rr.containsKey(name)){
                            rr.put(name,rr.get(name)+num);
                        }else{
                            String [] tem = name.split(",|、");
                            for(String tem1:tem){
                                for(String tem2:x){
                                    if(tem2.indexOf(tem1)!=-1){
                                        rr.put(tem2,rr.get(tem2)+num);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    for(String tem:x){
                        r3.add(rr.get(tem));
                    }

                    for(String tem:rr.keySet()){
                        rr.put(tem,0);
                    }
                    for(Map map:list2){
                        if(map.get("NN")==null){
                            continue;
                        }
                        String name = map.get("NN").toString();
                        int num = Integer.parseInt(map.get("NUM").toString());
                        if(rr.containsKey(name)){
                            rr.put(name,rr.get(name)+num);
                        }else{
                            String [] tem = name.split(",|、");
                            for(String tem1:tem){
                                for(String tem2:x){
                                    if(tem2.indexOf(tem1)!=-1){
                                        rr.put(tem2,rr.get(tem2)+num);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    for(String tem:x){
                        r4.add(rr.get(tem));
                    }
                } else {

                    while (l < x.size() && pos < list1.size()) {
                        String name = list1.get(pos).get("NN").toString();
                        String name1 = x.get(l);
                        if (name.equals(name1)) {
                            r3.add(Integer.parseInt(list1.get(pos).get("NUM").toString()));
                            pos++;
                            l++;
                        } else {
                            r3.add(0);
                            l++;
                        }
                    }
                    while (l < x.size()) {
                        r3.add(0);
                        l++;
                    }
                }
            }
            result.put("r1", r1);
            result.put("r2", r2);
            result.put("r3", r3);
            result.put("r4", r4);
            result.put("x", x);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @param
     * @return
     * @author chendong
     * @date 2018-04-25 15:04
     * @Description 舆情所有数据
     */
    @RequestMapping( "allYq" )
    public EdatResult allYq(HttpServletRequest request, HttpServletResponse response) {
        String sql = "SELECT \"newsid\",  \"chinaRegion1\" , \"chinaRegion2\", \"chinaRegion3\",TO_CHAR(\"time\",'YYYY-MM-DD') \"time\" ,\"DICT_type\" \"type\" from \"tb_network_news\" where \"newsType\" = '土壤舆情' and  \"state\"='0'" + "and (\"chinaRegion1\"  is not null OR \"chinaRegion2\" is not null OR \"chinaRegion3\" is not null) and \"time\" is not null";
        List<Map> list = this.getBySqlMapper.findRecords(sql);
        Map result = new HashMap();
        result.put("data", list);
        return EdatResult.ok(result);
    }

    /**
     * @param
     * @return
     * @author chendong
     * @date 2018-04-26 13:38
     * @Description 查询经纬度
     */
    @RequestMapping( "allCity" )
    public EdatResult allCity(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select * from \"tb_city\"";
            List<Map> list = this.getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("data", list);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-02 9:26
     * @param   
     * @return  
     * @Description 12369举报分析所有数据
     */
    @RequestMapping( "all12369" )
    public EdatResult all12369(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select AREA_CODE,TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') REPORT_TIME ,REPORT_LONGITUDE,REPORT_LATITUDE,INDUSTRY_TYPE from  YQ12369_DSJ_REPORTINFO where 1=1 and AREA_CODE is not null";
            List<Map> list = this.getBySqlMapper.findRecords(sql);

            Map result = new HashMap();
            result.put("data", list);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-02 15:10
     * @param   
     * @return  
     * @Description 12369分析文件下载
     */
    public EdatResult download12306(HttpServletRequest request,HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String code = data.getString("code");
            String name = data.getString("name");

            String sql = "select * from  YQ12369_DSJ_REPORTINFO where AREA_CODE like '"+code+"%'";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
            String newFileName = df.format(new Date()) +"_"+new Random().nextInt(100)+".xls";
            //获取文件需要上传到的路径
            String save = request.getServletContext().getRealPath("/")+"12369\\exportExcel\\";


            Map result = new HashMap();
            result.put("data", list);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    @RequestMapping("getDowloand")
    public void getDowloand(HttpServletRequest request,HttpServletResponse response ) {

//        JSONObject data = JSONObject.fromObject(request.getParameter("data"));
//        String code = data.getString("code");//行政编码
//        String startTime = data.getString("startTime");//开始时间
//        String endTime = data.getString("endTime");//结束时间
//        String industry = data.getString("industry");//分类
//        String city_name = data.getString("name");//城市名称
        String code = request.getParameter("code").trim();
        String startTime = request.getParameter("startTime").trim();
        String endTime = request.getParameter("endTime").trim();
        String industry = request.getParameter("industry").trim();
        String city_name = request.getParameter("name").trim();
        String  sql = "select REPORT_ID,EVENT_NUMBER,REPORT_TIME,REPORT_FROM_NAME,REPORT_DEPT_NAME,AREA_CODE,LOCATION_LABEL,REPORT_CONTENT,REPORT_LONGITUDE,REPORT_LATITUDE,PROCESS_AREA_UNITNAME," +
                "INDUSTRY_NAME,WHETHER_NAME,FINALOPINION,DATA_UTIME from  (" +
                "select REPORT_ID,EVENT_NUMBER,TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') REPORT_TIME,REPORT_FROM,REPORT_DEPT_NAME,AREA_CODE,LOCATION_LABEL,TO_CHAR(REPORT_CONTENT)REPORT_CONTENT,REPORT_LONGITUDE,REPORT_LATITUDE,PROCESS_AREA_UNITNAME," +
                "INDUSTRY_TYPE,WHETHER_CODE,FINALOPINION,TO_CHAR(DATA_UTIME,'YYYY-MM-DD:HH24:MI:SS')DATA_UTIME from  YQ12369_DSJ_REPORTINFO where AREA_CODE like '"+code+"%'"+
                "and  TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') >= TO_DATE('"+startTime+"', 'YYYY-MM-DD:HH24:MI:SS') " +
                "and TO_DATE(TO_CHAR(REPORT_TIME,'YYYY-MM-DD:HH24:MI:SS') , 'YYYY-MM-DD:HH24:MI:SS') <= TO_DATE('"+endTime+"', 'YYYY-MM-DD:HH24:MI:SS')";
        if (!"".equals(industry)){
            sql +=  " and INDUSTRY_TYPE = '" +industry+"'";
        }
        sql += ")a left JOIN (select INDUSTRY_TYPE itype,INDUSTRY_NAME from  YQ12369_DSJ_COD_INDUSTRY) b on a.INDUSTRY_TYPE  = b.itype left join " +
                "(select REPORT_FROM rep_from,REPORT_FROM_NAME from  YQ12369_DSJ_COD_REPORTFROM) c on a.REPORT_FROM=c.rep_from left join " +
                "(select WHETHER_CODE w_code,WHETHER_NAME from YQ12369_DSJ_COD_WHETHER ) d on a.WHETHER_CODE =d.w_code";
        List<Map> list = this.getBySqlMapper.findRecords(sql);

        HSSFWorkbook excel = new HSSFWorkbook();
        HSSFCellStyle cellStyle = excel.createCellStyle();
        HSSFCellStyle fontStyle = excel.createCellStyle();
        cellStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);
        HSSFFont font = excel.createFont();
        font.setColor(HSSFColor.RED.index);
        font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
        fontStyle.setFont(font);
        fontStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);//创建一个居中样式
        //2.在excel中添加一个sheet
        HSSFSheet sheet = excel.createSheet("12369举报分析");
        //3.在sheet中添加第0行:标题（xx的帮扶记录情况）
        HSSFRow row = sheet.createRow(0);
        HSSFCell cell = row.createCell(0);
        cell.setCellValue(city_name+"举报分析");
        cell.setCellStyle(fontStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 14));
        //4.创建单元格，设置表头，以及表头样式
        //创建第二行，开始写表头
        row = sheet.createRow(1);
        //第一列
        cell = row.createCell(0);
        cell.setCellValue("举报基本信息ID");
        cell.setCellStyle(cellStyle);
        //第二列
        cell = row.createCell(1);
        cell.setCellValue("举报编号");
        cell.setCellStyle(cellStyle);
        //第三列
        cell = row.createCell(2);
        cell.setCellValue("举报时间");
        cell.setCellStyle(cellStyle);
        //第四列
        cell = row.createCell(3);
        cell.setCellValue("举报方式");
        cell.setCellStyle(cellStyle);
        //第五列
        cell = row.createCell(4);
        cell.setCellValue("举报对象");
        cell.setCellStyle(cellStyle);
        //第六列
        cell = row.createCell(5);
        cell.setCellValue("区域代码");
        cell.setCellStyle(cellStyle);
        //第七列
        cell = row.createCell(6);
        cell.setCellValue("详细地址");
        cell.setCellStyle(cellStyle);
        //第八列
        cell=row.createCell(7);
        cell.setCellValue("污染描述");
        cell.setCellStyle(cellStyle);
        //第九列
        cell=row.createCell(8);
        cell.setCellValue("经度");
        cell.setCellStyle(cellStyle);
        //第十列
        cell =row.createCell(9);
        cell.setCellValue("纬度");
        cell.setCellStyle(cellStyle);
        //第十一列
        cell = row.createCell(10);
        cell.setCellValue("办理单位");
        cell.setCellStyle(cellStyle);
        //第十二列
        cell = row.createCell(11);
        cell.setCellValue("行业类型");
        cell.setCellStyle(cellStyle);
        //第十三列
        cell = row.createCell(12);
        cell.setCellValue("是否属实代码");
        cell.setCellStyle(cellStyle);
        //第十四列
        cell =row.createCell(13);
        cell.setCellValue("办结意见");
        cell.setCellStyle(cellStyle);
        //第十五列
        cell = row.createCell(14);
        cell.setCellValue("数据更新时间");
        cell.setCellStyle(cellStyle);

        //5.写入数据
        for (int i = 0; i <list.size(); i++) {
            Map map = list.get(i);
            //在excel中新增一行
            row = sheet.createRow(i + 2);//标题占一行，表头已占一行，故从第三行开始添加数据
            //在新增的一行中，依次创建单元格放入上面定义的列值

            row.createCell(0).setCellValue(map.get("REPORT_ID")==null?"" : map.get("REPORT_ID").toString());
            row.createCell(1).setCellValue(map.get("EVENT_NUMBER") == null ? "" :map.get("EVENT_NUMBER").toString());
            row.createCell(2).setCellValue(map.get("REPORT_TIME")== null ? "" : map.get("REPORT_TIME").toString());
            row.createCell(3).setCellValue(map.get("REPORT_FROM_NAME")== null ? "" : map.get("REPORT_FROM_NAME").toString());
            row.createCell(4).setCellValue(map.get("REPORT_DEPT_NAME")== null ? "" : map.get("REPORT_DEPT_NAME").toString());
            row.createCell(5).setCellValue(map.get("AREA_CODE")== null ? "" : map.get("AREA_CODE").toString());
            row.createCell(6).setCellValue(map.get("LOCATION_LABEL")== null ? "" : map.get("LOCATION_LABEL").toString());
            row.createCell(7).setCellValue(map.get("REPORT_CONTENT")== null ? "" : list.get(i).get("REPORT_CONTENT").toString());
            row.createCell(8).setCellValue(map.get("REPORT_LONGITUDE")== null ? "" : map.get("REPORT_LONGITUDE").toString());
            row.createCell(9).setCellValue(map.get("REPORT_LATITUDE")== null ? "" : map.get("REPORT_LATITUDE").toString());
            row.createCell(10).setCellValue(map.get("PROCESS_AREA_UNITNAME")== null ? "" : map.get("PROCESS_AREA_UNITNAME").toString());
            row.createCell(11).setCellValue(map.get("INDUSTRY_NAME")== null ? "" : map.get("INDUSTRY_NAME").toString());
            row.createCell(12).setCellValue(map.get("WHETHER_NAME")== null ? "" : map.get("WHETHER_NAME").toString());
            row.createCell(13).setCellValue(map.get("FINALOPINION")== null ? "" : map.get("FINALOPINION").toString());
            row.createCell(14).setCellValue(map.get("DATA_UTIME")== null ? "" : map.get("DATA_UTIME").toString());
        }
        //6.将其生成一个excel文件，输出
        //String name = PathKit.getWebRootPath()+"/download/"+rkxx.getStr("xm")+".xls";
        Date date = new Date();
        SimpleDateFormat simpleDate = new SimpleDateFormat("yyyyMMddHHmmss");
        String datetime = simpleDate.format(date);
        String name =datetime+".xls";
        try {
            //在本地生成一个excel文件，在传
            /*File file = new File(name);
            FileOutputStream file1 = new FileOutputStream(file);
            excel.write(file1);
            file1.close();*/
            //直接获取输出，直接输出excel（优先使用）
            OutputStream output=response.getOutputStream();
            response.reset();
            response.setHeader("Content-disposition", "attachment; filename="+ URLEncoder.encode(name,"UTF-8"));
            response.setContentType("application/msexcel");
            excel.write(output);
            output.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}


