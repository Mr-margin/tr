package com.gistone.seimp.controller;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.poi.util.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Author:renqiang
 * @Description: Created by soil-pc2 on 2017/10/20.
 */
@RestController
@RequestMapping("pic")
public class OnePictureController {
    Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    /**
     * @Author:renqiang
     * @Description:省市县信息
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getRegion1")
    public EdatResult getRegion(HttpServletRequest request,
                                HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,3,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String code = data.getString("regionCode");
            String sql = "";
            if (code.equals("0")) {//获取所以省
                sql = "select * from \"tb_city\" where \"parent_id\" =0 and \"code\" != '660000'";
            } else {
                sql = "select * from \"tb_city\" where \"parent_id\" = (select \"id\" from \"tb_city\" where \"code\" = '" + code + "')";
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:省市县信息
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getRegion")
    public EdatResult getRegion1(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,3,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String code = data.getString("regionCode");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                if (code.equals("0")) {//获取所以省
                    sql = "select * from \"tb_city\" where \"parent_id\" =0 and \"code\" like '" + regionCode.substring(0, 2) + "%'";
                } else {
                    sql = "select * from \"tb_city\" where \"parent_id\" = (select \"id\" from \"tb_city\" where \"code\" = '" + code + "') and \"code\" like '" + regionCode + "%'";
                }
            } else {
                if (code.equals("0")) {//获取所以省
                    sql = "select * from \"tb_city\" where \"parent_id\" =0 and \"code\" != '660000'";
                } else {
                    sql = "select * from \"tb_city\" where \"parent_id\" = (select \"id\" from \"tb_city\" where \"code\" = '" + code + "')";
                }
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取所以行业
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getIndustries")
    public EdatResult getIndustries(HttpServletRequest request,
                                    HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select distinct \"industry\" from \"tb_key_industry_enterprise\" where 1=1 ";
            if(userLevel>1&&!regionCode.equals("")){
                    sql+=" and \"province\" like '"+regionCode.substring(0,2)+"%'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            List result = new ArrayList();
            for (Map map : list) {
                result.add(map.get("industry"));
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:重点行业企业(不分页）
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getIndustryEnterprise")
    public EdatResult getIndustryEnterprise(HttpServletRequest request,
                                            HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String province = data.getString("province");
            String city = data.getString("city");
            String county = data.getString("county");
            String industry = data.getString("industry");
            String keyword = data.getString("keyword");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\" from (select * from \"tb_key_industry_enterprise\" where 1=1 ";
            if (userLevel > 1 && !regionCode.equals("")) {
                sql+=" and \"province\" LIKE '"+regionCode.substring(0,2)+"%'";
            }
            if (!province.equals("")) {
                sql += " and \"province\" = '" + province + "'";
                if (!city.equals("")) {
                    sql += " and \"city\" = '" + city + "'";
                    if (!county.equals("")) {
                        sql += " and \"district\" = '" + county + "'";
                    }
                }
            }
            if (!industry.equals("")) {
                sql += " and \"industry\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','石油开采','石油加工','石油加工及石油制品制造','石油加工及石油制品制造','精炼石油产品制造" +
                        "','化工','有机化工','焦化','钢铁、焦化','炼焦行业','炼焦','炼焦业','电镀','电镀行业','制革','蓄电池制造','废旧电器电子拆解','危险废物治理','危险废物处理')";
                sql += " and \"industry\" in " + str + "";
            }
            if (!keyword.equals("")) {
                sql += " and \"enterpriseName\" like '" + keyword + "%'";
            }
            sql += " )T1 left join \"tb_city\" T2 on T1.\"province\" = T2.\"code\" " +
                    " left join \"tb_city\" T3 on T1.\"city\" = T3.\"code\"" +
                    " left join \"tb_city\" T4 on T1.\"district\" = T4.\"code\"";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:遥感核查行业类别
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkYghcIndustries")
    public EdatResult getWrdkYghcIndustries(HttpServletRequest request,
                                            HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select distinct \"DALEI\" from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            List result = new ArrayList();
            for (Map map : list) {
                result.add(map.get("DALEI").toString());
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:污染地块行业类别
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkIndustries")
    public EdatResult getWrdkIndustries(HttpServletRequest request,
                                        HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select distinct \"HYLB\" HYLB from \"TB_WRDKJBXXB\" where 1=1";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and COUNTRY_CODE LIKE '"+regionCode+"%'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            List result = new ArrayList();
            for (Map map : list) {
                result.add(map.get("HYLB").toString());
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:污染地块(不分页)
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkData")
    public EdatResult getWrdkData(HttpServletRequest request,
                                  HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String province = data.getString("province");//
            String city = data.getString("city");//
            String county = data.getString("county");//
            String industry = data.getString("industry");//行业类别
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\" ,T4.\"lon\" as \"lon\" ,T4.\"lat\" as \"lat\" " +
                    " from (select * from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql2 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql2+=" and COUNTRY_CODE LIKE '"+regionCode+"%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE_CODE\" = '" + province + "'";
                if (!city.equals("")) {
                    sql2 += " and \"CITY_CODE\" = '" + city + "'";
                    if (!county.equals("")) {
                        sql2 += " and \"COUNTRY_CODE\" = '" + county + "'";
                    }
                }
            }
            if (!industry.equals("")) {
                sql2 += " and \"HYLB\" = '" + industry + "'";
            }
            sql += sql2;
            sql += ")T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\"" +
                    " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\"" +
                    " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:污染地块
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkTableData")
    public Map getWrdkTableData(HttpServletRequest request,
                                HttpServletResponse response) {
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
            String hylb = request.getParameter("industry");//行业类别
            String keyword = request.getParameter("keyword");//使用权单位名称
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select * from (select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select * from \"TB_WRDKJBXXB\" where 1=1 ";
            String sql1 = "select count(*) from \"TB_WRDKJBXXB\" where 1=1";
            String sql2 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql2+=" and COUNTRY_CODE LIKE '"+regionCode+"%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"PROVINCE_CODE\" = '" + province + "'";
                if (!city.equals("")) {
                    sql2 += " and \"CITY_CODE\" = '" + city + "'";
                    if (!county.equals("")) {
                        sql2 += " and \"COUNTRY_CODE\" = '" + county + "'";
                    }
                }
            }
            if (!hylb.equals("")) {
                sql2 += " and \"HYLB\" = '" + hylb + "'";
            }
            if (!keyword.equals("")) {
                sql2 += " and \"WRDKBM\" like '%" + keyword + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\"" +
                    " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\"" +
                    " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
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
     * @Description:污染地块图表查询
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkTBData")
    public EdatResult getWrdkTBData(HttpServletRequest request,
                                    HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            String names ="";
            if(!userlevel.equals("0")&&!userlevel.equals("1")){
           	 String sqlcode="select * from \"tb_city\" where \"code\"='"+regionCode+"'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
               Map mapS = codemap.get(0);
               names =mapS.get("name").toString();
               }
            

            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String province = data.getString("province");//
            String city = data.getString("city");//
            String type = data.getString("type");
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "";
            if (type.equals("1")) {
                sql += "select * from (select";
                if (!province.equals("")) {
                    if (!city.equals("")) {
                        sql += " \"COUNTRY_CODE\",count(*) as \"count\",sum(\"WRDK_AREA\") as \"sum\" from \"TB_WRDKJBXXB\" where \"CITY_CODE\"='" + city + "'";
                        if (userlevel.equals("1")) {
                            sql += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

                        } else if (userlevel.equals("2")) {
                            sql += " and \"CITY_CODE\" ='" + regionCode + "'";
                        } else if (userlevel.equals("3")) {
                            sql += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
                        }
                        sql += " group by \"COUNTRY_CODE\") T1 left join \"tb_city\" T3 on T1.\"COUNTRY_CODE\"= T3.\"code\"";
                    } else {
                        sql += " \"CITY_CODE\",count(*) as \"count\",sum(\"WRDK_AREA\") as \"sum\" from \"TB_WRDKJBXXB\" where \"PROVINCE_CODE\"='" + province + "'";
                        if (userlevel.equals("2")) {
                            sql += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

                        } else if (userlevel.equals("3")) {
                            sql += " and \"CITY_CODE\" ='" + regionCode + "'";
                        } else if (userlevel.equals("4")) {
                            sql += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
                        }
                        sql += "group by \"CITY_CODE\") T1 left join \"tb_city\" T3 on T1.\"CITY_CODE\"= T3.\"code\"";
                    }
                } else {
                    sql += " \"PROVINCE_CODE\",count(*) as \"count\",sum(\"WRDK_AREA\") as \"sum\" from \"TB_WRDKJBXXB\" where 1=1";
                    if (userlevel.equals("2")) {
                        sql += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

                    } else if (userlevel.equals("3")) {
                        sql += " and \"CITY_CODE\" ='" + regionCode + "'";
                    } else if (userlevel.equals("4")) {
                        sql += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
                    }
                    sql += " group by \"PROVINCE_CODE\") T1 left join \"tb_city\" T3 on T1.\"PROVINCE_CODE\"= T3.\"code\"";
                }
            } else {
                if (!province.equals("")) {
                    if (!city.equals("")) {
                        sql += "select \"FXJB\",count(*) as \"count\",sum(\"WRDK_AREA\") as \"sum\" from \"TB_WRDKJBXXB\" where \"CITY_CODE\"='" + city + "'";
                        if (userlevel.equals("2")) {
                            sql += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

                        } else if (userlevel.equals("3")) {
                            sql += " and \"CITY_CODE\" ='" + regionCode + "'";
                        } else if (userlevel.equals("4")) {
                            sql += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
                        }
                        sql += " group by \"FXJB\"";
                    } else {
                        sql += "select \"FXJB\",count(*) as \"count\",sum(\"WRDK_AREA\") as \"sum\" from \"TB_WRDKJBXXB\" where \"PROVINCE_CODE\"='" + province + "'";
                        if (userlevel.equals("2")) {
                            sql += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

                        } else if (userlevel.equals("3")) {
                            sql += " and \"CITY_CODE\" ='" + regionCode + "'";
                        } else if (userlevel.equals("4")) {
                            sql += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
                        }
                        sql += "group by \"FXJB\"";
                    }
                } else {
                    sql += "select \"FXJB\",count(*) as \"count\",sum(\"WRDK_AREA\") as \"sum\" from \"TB_WRDKJBXXB\" where 1=1";
                    if (userlevel.equals("2")) {
                        sql += " and \"PROVINCE_CODE\" ='" + regionCode + "'";

                    } else if (userlevel.equals("3")) {
                        sql += " and \"CITY_CODE\" ='" + regionCode + "'";
                    } else if (userlevel.equals("4")) {
                        sql += " and \"COUNTRY_CODE\" ='" + regionCode + "'";
                    }
                    sql += " group by \"FXJB\"";
                }


            }
            if (type.equals("1")) {
                sql += " order by T1.\"count\" desc";
            } else {
                sql += " order by \"sum\" desc";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:污染地块详情
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkDataDetail")
    public EdatResult getWrdkDataDetail(HttpServletRequest request,
                                        HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getString("ID");
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\" " +
                    "from (select * from \"TB_WRDKJBXXB\" where \"WRDKID\"='" + id + "' )T1 left join \"tb_city\" T2 on T1.\"PROVINCE_CODE\" = T2.\"code\"" +
                    " left join \"tb_city\" T3 on T1.\"CITY_CODE\" = T3.\"code\"" +
                    " left join \"tb_city\" T4 on T1.\"COUNTRY_CODE\" = T4.\"code\" ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:遥感核查(不分页)
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkYghcData")
    public EdatResult getWrdkYghcData(HttpServletRequest request,
                                      HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String province = data.getString("province");//
            String city = data.getString("city");//市编码
            String county = data.getString("county");//
            String name = data.getString("keyword");//企业名称
            String industry = data.getString("industry");//行业类别
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select * from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            if (!county.equals("")) {
                sql += " and \"DISTRICT_CODE\" ='" + county + "'";
            } else if (!city.equals("")) {
                sql += " and \"DISTRICT_CODE\" like '" + city.substring(0, 4) + "%'";
            } else if (!province.equals("")) {
                sql += " and \"DISTRICT_CODE\" like '" + province.substring(0, 2) + "%'";
            }
            if (!industry.equals("")) {
                sql += " and \"DALEI\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" +
                        "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" +
                        "危险废物处理处置')";
                sql += " and \"DALEI\" in " + str + "";
            }
            if (!name.equals("")) {
                sql += " and \"NAME\" like '%" + name + "%'";
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
     * @Description:遥感核查
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkYghc")
    public Map getWrdkYghc(HttpServletRequest request,
                           HttpServletResponse response) {
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
            String name = request.getParameter("keyword");//污染企业名称
            String type = request.getParameter("industry");//
            String province = request.getParameter("province");//
            String city = request.getParameter("city");//
            String county = request.getParameter("county");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"OID\", \"GUID\", \"GEOMETRY\", \"NAME\", \"TYPE\", \"DISTRICT_CODE\", \"ADRESS\", \"SHENG\", \"SHI\", \"XIAN\", \"XIANG\", \"CUN\", " +
                    "\"LONGITUDE\", \"LATITUDE\", \"LAIYUAN\", \"REMARK\", \"DALEI\", \"BIEMIN\", \"BIANHAO\", \"PREDID\", \"AFTDID\", \"PRODUCTION\", \"BUILDTIME\", \"LINK\", \"IS_GUIMO\", \"GUIMO\", \"SURVEY_STATUS\", " +
                    "\"SURVEY_PROGRESS\", \"EXCEPTION_REPORTING\", \"ER_DISTRICT_CODE\", \"DISTRICT_CODE_STR\", \"GW_UPDATE_TIME\", \"GW_UPDATE_TYPE\", \"UPDATA_STATUS\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_wurandikuai_yaoganhecha\" where 1=1";
            String sql2 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql2+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            if (!name.equals("")) {
                sql2 += " and \"NAME\" like'%" + name + "%'";
            }
            if (!type.equals("")) {
                sql += " and \"DALEI\" in('" + StringUtils.join(type.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" +
                        "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" +
                        "危险废物处理处置')";
                sql += " and \"DALEI\" in " + str + "";
            }
            if (!county.equals("")) {
                sql2 += " and \"DISTRICT_CODE\" ='" + county + "'";
            } else if (!city.equals("")) {
                sql2 += " and \"DISTRICT_CODE\" like'" + city.substring(0, 4) + "%'";
            } else if (!province.equals("")) {
                sql2 += " and \"DISTRICT_CODE\" like'" + province.substring(0, 2) + "%'";
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
     * @Description:遥感核查详情
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getWrdkYghcDataDetail")
    public EdatResult getWrdkYghcDataDetail(HttpServletRequest request,
                                            HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getString("ID");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from \"tb_wurandikuai_yaoganhecha\" where \"OID\" = '" + id + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:重点行业企业（分页）
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getEnterpriseTable")
    public Map getEnterpriseTable(HttpServletRequest request,
                                  HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            String province = request.getParameter("province");
            String city = request.getParameter("city");
            String county = request.getParameter("county");
            String industry = request.getParameter("industry");
            String keyword = request.getParameter("keyword");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select* from(select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\",ROWNUM RN from (select * from \"tb_key_industry_enterprise\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_key_industry_enterprise\" where 1=1 ";
            String sql2 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                sql2+=" and \"province\" LIKE '"+regionCode.substring(0,2)+"%'";
            }
            if (!province.equals("")) {
                sql2 += " and \"province\" = '" + province + "'";
                if (!city.equals("")) {
                    sql2 += " and \"city\" = '" + city + "'";
                    if (!county.equals("")) {
                        sql2 += " and \"district\" = '" + county + "'";
                    }
                }
            }
            if (!keyword.equals("")) {
                sql2 += " and \"enterpriseName\" like '" + keyword + "%'";
            }
            if (!industry.equals("")) {
                sql2 += " and \"industry\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {

                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','石油开采','石油加工','石油加工及石油制品制造','石油加工及石油制品制造','精炼石油产品制造" +
                        "','化工','有机化工','焦化','钢铁、焦化','炼焦行业','炼焦','炼焦业','电镀','电镀行业','制革','蓄电池制造','废旧电器电子拆解','危险废物治理','危险废物处理')";
                //sql2 += " and \"industry\" in " + str + "";
            }
            sql += sql2;
            sql1 += sql2;
            sql += " )T1 left join \"tb_city\" T2 on T1.\"province\" = T2.\"code\" " +
                    " left join \"tb_city\" T3 on T1.\"city\" = T3.\"code\"" +
                    " left join \"tb_city\" T4 on T1.\"district\" = T4.\"code\" ) where RN >" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql);
            int total = getBySqlMapper.findrows(sql1);
            Map result = new HashMap();
            result.put("total", total);
            result.put("rows", list);
            result.put("page", pageNumber / pageSize);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * @Author:renqiang
     * @Description:获取企业监控所有行业
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getMonitorIndustries")
    public EdatResult getMonitorIndustries(HttpServletRequest request,
                                           HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select distinct ONE_BUSINESSCODE,ONE_BUSINESSNAME from T_GY_WASTEBASCIMESSAGE where 1=1 ";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
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
     * @Description:企业监控(不分页）
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("EnterpriseMonitor")
    public EdatResult EnterpriseMonitor(HttpServletRequest request,
                                        HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String province = data.getString("province");
            String city = data.getString("city");
            String county = data.getString("county");
            String industry = data.getString("industry");
            String keyword = data.getString("keyword");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            if (industry.equals("none")) {
                return EdatResult.ok(new ArrayList<>());
            }
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\" from (select distinct PARTICULARNAME,PROVINCE,MUNICIPAL," +
                    " DISTRICT_CODE,BUSINESSCODE,ONE_BUSINESSNAME,LONGTITUDE_INDEX,LATITUDE_INDEX,ENTERPRISE_SITE,EGALPERSON_NAME" +
                    " from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            if (!county.equals("")) {
                sql += " and \"DISTRICT_CODE\" = '" + county + "'";
                if (!city.equals("")) {
                    sql += " and \"MUNICIPAL\" = '" + city + "'";
                    if (!province.equals("")) {
                        sql += " and \"PROVINCE\" = '" + province + "'";
                    }
                }
            }
            if (!industry.equals("")) {
                sql += " and \"ONE_BUSINESSCODE\" = '" + industry + "'";
            } else {
                sql += " and \"ONE_BUSINESSCODE\" in (09,33,07,25,26,19,27,44)";
            }
            if (!keyword.equals("")) {
                sql += " and \"PARTICULARNAME\" like '" + keyword + "%'";
            }
            sql += " )T1 left join \"tb_city\" T2 on T1.\"PROVINCE\" = T2.\"code\" " +
                    " left join \"tb_city\" T3 on T1.\"MUNICIPAL\" = T3.\"code\"" +
                    " left join \"tb_city\" T4 on T1.\"DISTRICT_CODE\" = T4.\"code\"";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:企业监控（分页）
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("EnterpriseMonitorPaging")
    public Map EnterpriseMonitorPaging(HttpServletRequest request,
                                       HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            String province = request.getParameter("province");
            String city = request.getParameter("city");
            String county = request.getParameter("county");//县代码
            String industry = request.getParameter("industry");//行业代码
            String keyword = request.getParameter("keyword");//名称
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select* from(select T1.*,T2.\"name\" \"countyName\",T2.\"lon\",T2.\"lat\",T1.MUNICIPAL \"cityName\",T1.PROVINCE \"provinceName\",ROWNUM RN from (select distinct PARTICULARNAME,PROVINCE,MUNICIPAL," +
                    " DISTRICT_CODE,BUSINESSCODE,LONGTITUDE_INDEX,LATITUDE_INDEX,ENTERPRISE_SITE,ONE_BUSINESSNAME,ONE_BUSINESSCODE,EGALPERSON_NAME from T_GY_WASTEBASCIMESSAGE where 1=1 ";
            String sql1 = "select count(distinct PARTICULARNAME) from T_GY_WASTEBASCIMESSAGE where 1=1 ";
            String sql2 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql2+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            if (!county.equals("")) {
                sql2 += " and DISTRICT_CODE = '" + county + "'";

            } else if (!city.equals("")) {
                sql2 += " and DISTRICT_CODE  like '" + city.substring(0, 4) + "%'";

            } else if (!province.equals("")) {
                sql2 += " and DISTRICT_CODE  like '" + province.substring(0, 2) + "%'";
            }
            if (!industry.equals("")) {
                sql2 += " and ONE_BUSINESSCODE like '%" + industry + "%'";
            }
            if (!keyword.equals("")) {
                sql2 += " and PARTICULARNAME like '" + keyword + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += " )T1 left join \"tb_city\" T2 on T1.\"DISTRICT_CODE\"  = T2.\"code\"" +
                    " ) where RN >" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            System.out.println(sql);
            List<Map> list = getBySqlMapper.findRecords(sql);
            int total = getBySqlMapper.findrows(sql1);
            Map result = new HashMap();
            result.put("total", total);
            result.put("rows", list);
            result.put("page", pageNumber / pageSize);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取企业所有监测项目
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getMonitorProject")
    public EdatResult getMonitorProject(HttpServletRequest request,
                                        HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select distinct MONITOR_ITEM_NAME from T_GY_WASTEBASCIMESSAGE where PARTICULARNAME = '" + name + "'";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            List result = new ArrayList<>();
            for (Map map : list) {
                result.add(map.get("MONITOR_ITEM_NAME").toString());
            }
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取监测项目详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getMonitorProjectDetail")
    public EdatResult getMonitorProjectDetail(HttpServletRequest request,
                                              HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
            String itemName = data.getString("itemName");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select YEAR,QUARTER,WASTE_IMPORT,MONITOR_ITEM_NAME,POLLUTANT_CONCENTRATION,DISCHARGE_S" +
                    ",DISCHARGE_X,DISCHARGE_MONAD,EXCEED_NUMBER,POLLUTANT_QUALIFIED,VALUATION,RECEIVING_WATERNAME,WASTE_MOUTH_NUMBER" +
                    ",GAS_EQUIPMENT_NUMBER,GAS_MOUTH_NUMBER,S02_GROSS_VALUE,C0D_GROSS_VALUE,MONTH,DAYS,POLLUTE_PF_VALUE,WASTE_PF_VALUE," +
                    "MONITORING_VALUE from T_GY_WASTEBASCIMESSAGE where PARTICULARNAME = '" + name + "' and MONITOR_ITEM_NAME = '" + itemName + "'";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
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
     * @Description:获取监测项目详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getMonitorProjects")
    public EdatResult getMonitorProjects(HttpServletRequest request,
                                         HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select YEAR,QUARTER,WASTE_IMPORT,MONITOR_ITEM_NAME,POLLUTANT_CONCENTRATION,DISCHARGE_S" +
                    ",DISCHARGE_X,DISCHARGE_MONAD,EXCEED_NUMBER,POLLUTANT_QUALIFIED,VALUATION,RECEIVING_WATERNAME,WASTE_MOUTH_NUMBER" +
                    ",GAS_EQUIPMENT_NUMBER,GAS_MOUTH_NUMBER,S02_GROSS_VALUE,C0D_GROSS_VALUE,MONTH,DAYS,POLLUTE_PF_VALUE,WASTE_PF_VALUE," +
                    "MONITORING_VALUE from T_GY_WASTEBASCIMESSAGE where PARTICULARNAME = '" + name + "'";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
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
     * @Description:获取企业监测基本详情
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("EnterpriseMonitorDetail")
    public EdatResult EnterpriseMonitorDetail(HttpServletRequest request,
                                              HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" as \"provinceName\",T3.\"name\" as \"cityName\",T4.\"name\" as \"countyName\" from " +
                    "(select PARTICULARNAME,PROVINCE,MUNICIPAL,DISTRICT_CODE,ONE_BUSINESSNAME,BUSINESSCODE,LONGTITUDE_INDEX,LATITUDE_INDEX,ENTERPRISE_SITE," +
                    "EGALPERSON_NAME,YEAR,QUARTER,PHONE from T_GY_WASTEBASCIMESSAGE where PARTICULARNAME = '" + name + "' )T1 left join \"tb_city\" T2 on T1.\"PROVINCE\" = T2.\"code\" " +
                    "                    \" left join \"tb_city\" T3 on T1.\"MUNICIPAL\" = T3.\"code\"" +
                    "                    \" left join \"tb_city\" T4 on T1.\"DISTRICT_CODE\" = T4.\"code\"";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            List<Map> list = getBySqlMapper.findRecords(sql);
            if (list.size() > 0) {
                return EdatResult.ok(list.get(0));
            } else {
                return EdatResult.build(1, "查询失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_food_county
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getFood1")
    public EdatResult getFood1(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" ,T2.\"lon\",T2.\"lat\" from (select count(*) \"count\"  ,\"province\" from \"tb_food_county\" ";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    sql+=" and \"province\" like '"+regionCode.substring(0,2)+"%'";
                } else if (userLevel == 3) {
                    sql+=" and \"city\" like '"+regionCode.substring(0,4)+"%'";
                }else{
                    sql+=" and \"county\" = '"+regionCode+"'";
                }

            }
            sql+=" GROUP BY \"province\")T1 " +
                    "LEFT JOIN \"tb_city\" T2 ON T1.\"province\" = T2.\"code\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_food_county
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getFood2")
    public EdatResult getFood2(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select \"ID\", \"province\", \"city\", \"county\", \"bz\", \"insertUser\", " +
                    " to_char(\"insertTime\",'yyyy-mm-dd HH24:mi:ss')\"insertTime\" " +
                    " from \"tb_food_county\" where \"province\" = '" + code + "'";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    sql+=" and \"province\" like '"+regionCode.substring(0,2)+"%'";
                } else if (userLevel == 3) {
                    sql+=" and \"city\" like '"+regionCode.substring(0,4)+"%'";
                }else{
                    sql+=" and \"county\" = '"+regionCode+"'";
                }
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    @RequestMapping("getFoodTable")
    public Map getFoodTable(HttpServletRequest request,
                            HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            String province = request.getParameter("province");
            String city = request.getParameter("city");
            String country = request.getParameter("county");
            String keyword = request.getParameter("keyword");
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "SELECT * FROM (SELECT T1.*,T2.\"name\" \"countyName\",T2.\"lon\",T2.\"lat\",T3.\"name\" \"cityName\",T4.\"name\" \"provinceName\",ROWNUM RN FROM(select \"ID\", \"province\", \"city\", \"county\", \"bz\", \"insertUser\",to_char(\"insertTime\",'yyyy-mm-dd HH24:mi:ss')\"insertTime\" " +
                    " from \"tb_food_county\" WHERE 1=1 ";
            String sql1 = "select count(*) from \"tb_food_county\" WHERE 1=1 ";
            String sql2 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    sql2+=" and \"province\" like '"+regionCode.substring(0,2)+"%'";
                } else if (userLevel == 3) {
                    sql2+=" and \"city\" like '"+regionCode.substring(0,4)+"%'";
                }else{
                    sql2+=" and \"county\" = '"+regionCode+"'";
                }

            }
            if (!country.equals("")) {
                sql2 += " and \"county\" = " + country;
            } else if (!city.equals("")) {
                sql2 += " and \"city\" = " + city;
            } else if (!province.equals("")) {
                sql2 += " and \"province\" = " + province;
            }
            if (!keyword.equals("")) {
                sql2 += " and \"bz\" like'%" + keyword + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += " )T1 left join \"tb_city\" T2 on T1.\"county\"  = T2.\"code\"" +
                    "  left join \"tb_city\" T3 on T1.\"city\"  = T3.\"code\"" +
                    "  left join \"tb_city\" T4 on T1.\"province\"  = T4.\"code\" ";
            sql += ")WHERE RN>" + pageNumber + " and RN <=" + pageNumber + pageSize;
            Map result = new HashMap();
            result.put("total", getBySqlMapper.findrows(sql1));
            result.put("rows", getBySqlMapper.findRecords(sql));
            result.put("page", pageNumber / pageSize);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:T_GY_WASTEBASCIMESSAGE 各省统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getT_GY1")
    public EdatResult getT_GY1(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.\"count\",T2.\"name\" ,T2.\"code\" \"province\",T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"SUBSTR\"(DISTRICT_CODE, 0, 2) " +
                    "as PRO from T_GY_WASTEBASCIMESSAGE where 1=1";
            if (!industry.equals("")) {
                sql += "  and \"ONE_BUSINESSCODE\" like '%" + industry + "%'";
            } else {
                sql += "  and \"ONE_BUSINESSCODE\" in (09,33,07,25,26,19,27,44)";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            sql += " GROUP BY \"SUBSTR\"(DISTRICT_CODE, 0, 2))T1" +
                    " left join \"tb_city\" T2 on RPAD (T1.PRO , 6 , '0') = T2.\"code\" and T2.\"level\" = 0";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:T_GY_WASTEBASCIMESSAGE 省内各县统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getT_GY2")
    public EdatResult getT_GY2(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.\"count\",T2.\"code\",T2.\"name\"  ,T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"SUBSTR\"(DISTRICT_CODE, 0, 4) CODE " +
                    " from T_GY_WASTEBASCIMESSAGE where DISTRICT_CODE like '" + code.substring(0, 2) + "%'";
            if (!industry.equals("")) {
                sql += " and  \"ONE_BUSINESSCODE\" like '%" + industry + "%'";
            } else {
                sql += "  and  \"ONE_BUSINESSCODE\" in (09,33,07,25,26,19,27,44)";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            sql += " GROUP BY \"SUBSTR\"(DISTRICT_CODE, 0, 4))T1" +
                    " left join \"tb_city\" T2 on RPAD (T1.CODE , 6 , '0')  = T2.\"code\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:T_GY_WASTEBASCIMESSAGE 县内信息
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getT_GY3")
    public EdatResult getT_GY3(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            String sql = "select T1.*,T2.\"name\" \"countyName\",T2.\"lon\",T2.\"lat\",T3.\"name\" \"cityName\",T4.\"name\" \"provinceName\" " +
                    " from(select \"PKID\", \"YEAR\", \"QUARTER\", \"PARTICULARNAME\", \"BUSINESSCODE\", \"MONITORNAME\", \"MONITOR_ITEM_NAME\", \"WASTE_IMPORT\", \"POLLUTANT_CONCENTRATION\", \"DISCHARGE_S\"," +
                    " \"DISCHARGE_X\", \"DISCHARGE_MONAD\", \"EXCEED_NUMBER\", \"POLLUTANT_QUALIFIED\", \"VALUATION\", \"RECEIVING_WATERNAME\", \"THE_DIRECTION\", \"REGISTER_TYPE\", \"SCALE\"," +
                    " \"RUN_NORMAL_MOVE\", \"WASTE_RANK\", \"GASE_RANK\", \"SCALE_CODE\", \"POLLUTION_RANK_CODE\", \"POLLUTION_TYPE_CODE\", \"LONGTITUDE_INDEX\", \"LATITUDE_INDEX\", \"ENTERPRISE_SITE\", " +
                    " \"WASTE_MOUTH_NUMBER\", \"GAS_EQUIPMENT_NUMBER\", \"GAS_MOUTH_NUMBER\", \"S02_GROSS_VALUE\", \"C0D_GROSS_VALUE\", \"POLLUTION_DECLARE_MARK\", \"INORGANIZATION_PFDS\", \"EGALPERSON_NAME\"," +
                    " \"SOURCE_CONTACTS\", \"PHONE\", \"FAXES\", \"DAWK_CODE\", \"START_BUSINESS_TIME\", \"CWGY_SKETCH\", \"WRCL_SKETCH\", \"FINALLY_ALTER_TIME\", \"CONTACT_SECTION\", \"DELETE_SATE\", " +
                    " \"GAS_POLLUTION_RANK_CODE\", \"EXEC_STANDARD_CODE\", \"EXEC_CONDITION_CODE\", \"POLLUTED_ATTRIBUTE\", \"MONITOR_JD\", \"MONITOR_WD\", \"MONTH\", \"DAYS\", \"POLLUTE_PF_VALUE\", " +
                    " \"WASTE_PF_VALUE\", \"MONITORING_VALUE\", \"LOAD_CONDITION\", \"DATA_INTEGRITY\", \"CAUSE\", \"FREQUENCY\", \"IMPORT_GAS_QUANTITY\", \"ENTERPRISE_CODE\", \"RECEIVING_WATERCODE\"," +
                    " \"THE_DIRECTION_TYPECODE\", \"DISTRICT_CODE\", \"PROVINCE\", \"MUNICIPAL\", \"ONE_BUSINESSNAME\", \"ONE_BUSINESSCODE\", \"TWO_BUSINESSNAME\", \"TWO_BUSINESSCODE\", \"THREE_BUSINESSNAME\"," +
                    " \"THREE_BUSINESSCODE\", \"LEGALPERSON_CODE\", \"DISCHARGE_GL_CODE\", \"REGISTER_TYPECODE\", \"CUSTOM_ATTRIBUTE\", \"STANDARD_NAME\", " +
                    "to_char(\"UPDATETIME_HBB_BIGDATA\",'yyyy-mm-dd HH24:mi:ss')\"UPDATETIME_HBB_BIGDATA\", \"UPDATEFLAG_HBB_BIGDATA\"" +
                    " from T_GY_WASTEBASCIMESSAGE  where \"SUBSTR\"(DISTRICT_CODE, 0, 4) = " + code.substring(0, 4);
            if (!industry.equals("")) {
                sql += " and  trim(\"ONE_BUSINESSCODE\") = '" + industry + "'";
            } else {
                sql += "  and  \"ONE_BUSINESSCODE\" in (09,33,07,25,26,19,27,44)";
            }

            sql += " )T1 left join \"tb_city\" T2 on T1.\"DISTRICT_CODE\"  = T2.\"code\"" +
                    "  left join \"tb_city\" T3 on T1.\"MUNICIPAL\"  = T3.\"code\"" +
                    "  left join \"tb_city\" T4 on T1.\"PROVINCE\"  = T4.\"code\" ";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_key_industry_enterprise 各省统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getKeyIndustry1")
    public EdatResult getKeyIndustry1(HttpServletRequest request,
                                      HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" ,T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"province\" " +
                    " from \"tb_key_industry_enterprise\" ";
            if (!industry.equals("")) {
                sql += " where  \"industry\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','石油开采','石油加工','石油加工及石油制品制造','石油加工及石油制品制造','精炼石油产品制造" +
                        "','化工','有机化工','焦化','钢铁、焦化','炼焦行业','炼焦','炼焦业','电镀','电镀行业','制革','蓄电池制造','废旧电器电子拆解','危险废物治理','危险废物处理')";
                sql += " where  \"industry\" in " + str + "";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                sql+=" and \"province\" LIKE '"+regionCode.substring(0,2)+"%'";
            }
            sql += " GROUP BY \"province\")T1" +
                    " left join \"tb_city\" T2 on T1.\"province\" = T2.\"code\" and T2.\"level\" = 0";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_key_industry_enterprise 省下各县统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getKeyIndustry2")
    public EdatResult getKeyIndustry2(HttpServletRequest request,
                                      HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" ,T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"city\" " +
                    " from \"tb_key_industry_enterprise\" where \"province\" = '" + code + "'";
            if (!industry.equals("")) {
                sql += " and  \"industry\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','石油开采','石油加工','石油加工及石油制品制造','石油加工及石油制品制造','精炼石油产品制造" +
                        "','化工','有机化工','焦化','钢铁、焦化','炼焦行业','炼焦','炼焦业','电镀','电镀行业','制革','蓄电池制造','废旧电器电子拆解','危险废物治理','危险废物处理')";
                sql += " and  \"industry\" in " + str + "";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                sql+=" and \"province\" LIKE '"+regionCode.substring(0,2)+"%'";
            }
            sql += " GROUP BY \"city\")T1" +
                    " left join \"tb_city\" T2 on T1.\"city\" = T2.\"code\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_key_industry_enterprise 省下各县统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getKeyIndustry3")
    public EdatResult getKeyIndustry3(HttpServletRequest request,
                                      HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" \"countyName\",T2.\"lon\",T2.\"lat\",T3.\"name\" \"cityName\",T4.\"name\" \"provinceName\" from " +
                    "(select * from \"tb_key_industry_enterprise\" where \"city\" = '" + code + "'";
            if (!industry.equals("")) {
                sql += " and  \"industry\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','石油开采','石油加工','石油加工及石油制品制造','石油加工及石油制品制造','精炼石油产品制造" +
                        "','化工','有机化工','焦化','钢铁、焦化','炼焦行业','炼焦','炼焦业','电镀','电镀行业','制革','蓄电池制造','废旧电器电子拆解','危险废物治理','危险废物处理')";
                sql += " and  \"industry\" in " + str + "";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                sql+=" and \"province\" LIKE '"+regionCode.substring(0,2)+"%'";
            }
            sql += " )T1 left join \"tb_city\" T2 on T1.\"district\"  = T2.\"code\"" +
                    "  left join \"tb_city\" T3 on T1.\"city\"  = T3.\"code\"" +
                    "  left join \"tb_city\" T4 on T1.\"province\"  = T4.\"code\" ";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_wurandikuai_yaoganhecha 各省统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getYGHC1")
    public EdatResult getYGHC1(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.\"count\",T2.\"name\" ,T2.\"code\" \"province\",T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"SUBSTR\"(DISTRICT_CODE, 0, 2) " +
                    "as PRO from \"tb_wurandikuai_yaoganhecha\" ";
            if (!industry.equals("")) {
                sql += " where \"DALEI\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" +
                        "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" +
                        "危险废物处理处置')";
                sql += " where  \"DALEI\" in " + str + "";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            sql += " GROUP BY \"SUBSTR\"(DISTRICT_CODE, 0, 2))T1" +
                    " left join \"tb_city\" T2 on RPAD (T1.PRO , 6 , '0') = T2.\"code\" and T2.\"level\" = 0";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_wurandikuai_yaoganhecha 省内各县统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getYGHC2")
    public EdatResult getYGHC2(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.\"count\",T2.\"code\" ,T2.\"name\",T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"SUBSTR\"(DISTRICT_CODE, 0, 4) CODE " +
                    " from \"tb_wurandikuai_yaoganhecha\" where \"SUBSTR\"(DISTRICT_CODE, 0, 2) = \"SUBSTR\"(" + code + ", 0, 2)";
            if (!industry.equals("")) {
                sql += " and \"DALEI\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" +
                        "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" +
                        "危险废物处理处置')";
                sql += " and  \"DALEI\" in " + str + "";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            sql += " GROUP BY \"SUBSTR\"(DISTRICT_CODE, 0, 4))T1" +
                    " left join \"tb_city\" T2 on RPAD (T1.CODE , 6 , '0')  = T2.\"code\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_wurandikuai_yaoganhecha 省内各县统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getYGHC3")
    public EdatResult getYGHC23(HttpServletRequest request,
                                HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select *  from \"tb_wurandikuai_yaoganhecha\" where \"SUBSTR\"(DISTRICT_CODE, 0, 4) = '" + code.substring(0, 4) + "'";
            if (!industry.equals("")) {
                sql += " and \"DALEI\" in('" + StringUtils.join(industry.split(","), "','") + "')";
            } else {
                String str = "('有色金属矿采选业','有色金属采选业','有色金属冶炼','有色金属冶炼和压延加工业','石油加工','石油加工业','化工','化工原料和化工制品制造业','石油加工、炼焦及核燃料加工业','" +
                        "皮革、毛皮、羽毛及其制品和制鞋业','皮革、毛皮、羽毛(绒)及其制品业','皮革、毛皮、羽毛（绒）及其制品业','皮革、毛皮、羽毛及其制品和制造业','医药','医药制造','医药制造业','" +
                        "危险废物处理处置')";
                sql += " and  \"DALEI\" in " + str + "";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and DISTRICT_CODE LIKE '"+regionCode+"%'";
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_wurandikuai各省统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getWrdk1")
    public EdatResult getWrdk1(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.\"count\",T2.\"name\" ,T2.\"code\" \"province\",T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"PROVINCE_CODE\"" +
                    " as PRO from \"TB_WRDKJBXXB\" where 1=1 and SCJDBM is not null and DELETE_TSAMP is null";
            if (!industry.equals("")) {
                sql += " and \"SCJDBM\" ='" + industry + "'";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and COUNTRY_CODE LIKE '"+regionCode+"%'";
            }
            sql += " GROUP BY \"PROVINCE_CODE\")T1" +
                    "  join \"tb_city\" T2 on  T1.PRO = T2.\"code\" and T2.\"level\" = 0";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_wurandikuai省内各县统计结果
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getWrdk2")
    public EdatResult getWrdk2(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\",T2.\"lon\",T2.\"lat\"  from (select count(*) \"count\",\"CITY_CODE\"" +
                    "  from \"TB_WRDKJBXXB\" where SCJDBM is not null and DELETE_TSAMP is null and PROVINCE_CODE = '" + code + "'";
            if (!industry.equals("")) {
                sql += " and \"HYLB\" ='" + industry + "'";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and COUNTRY_CODE LIKE '"+regionCode+"%'";
            }
            sql += " GROUP BY \"CITY_CODE\")T1" +
                    "  join \"tb_city\" T2 on T1.CITY_CODE = T2.\"code\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:tb_wurandikuai县内信息
     * @Date:11:31 2017/11/2
     */
    @RequestMapping("getWrdk3")
    public EdatResult getWrdk3(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String industry = data.getString("industry");
            String code = data.getString("code");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "select T1.*,T2.\"name\" \"countyName\",T2.\"lon\",T2.\"lat\",T3.\"name\" \"cityName\",T4.\"name\" \"provinceName\"  from (select *  from \"TB_WRDKJBXXB\" where CITY_CODE = '" + code + "'";
            if (!industry.equals("")) {
                sql += " and \"HYLB\" ='" + industry + "'";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql+=" and COUNTRY_CODE LIKE '"+regionCode+"%'";
            }
            sql += " )T1 left join \"tb_city\" T2 on T1.COUNTRY_CODE  = T2.\"code\" " +
                    " left join \"tb_city\" T3 on T1.CITY_CODE  = T3.\"code\" " +
                    " left join \"tb_city\" T4 on T1.PROVINCE_CODE  = T4.\"code\" ";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:土壤质量（不分页）
     * @Date:18:10 2017/11/6
     */
    @RequestMapping("getSoil_quality")
    public EdatResult getSoil_quality(HttpServletRequest request,
                                      HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String tdly = data.getString("tdly");
            String sql = "select * from \"t_soil_quality\"";
            if (!tdly.equals("")) {
                sql += " where \"tdly\" = '" + tdly + "'";
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:土壤质量（分页）
     * @Date:18:10 2017/11/6
     */
    @RequestMapping("getSoil_qualityTable")
    public Map getSoil_qualityTable(HttpServletRequest request,
                                    HttpServletResponse response) {
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
            String tdly = request.getParameter("tdly");
            String ybbm = request.getParameter("ybbm");
            String sql = "select * from (select T1.*,ROWNUM RN from (select * from \"t_soil_quality\" where 1=1 ";

            String sql1 = "select count(*) from \"t_soil_quality\" where 1=1 ";
            String sql2 = "";
            if (!tdly.equals("")) {
                sql2 += " and \"tdly\" = '" + tdly + "'";
            }
            if (!ybbm.equals("")) {
                sql2 += " and \"ybbm\" = '" + ybbm + "'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += ")T1) where RN >" + pageNumber + " and RN <=" + pageNumber + pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("page", pageNumber / pageSize);
            result.put("total", getBySqlMapper.findrows(sql1));
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:土壤质量详情
     * @Date:18:18 2017/11/6
     */
    @RequestMapping("getSoil_qualityDetail")
    public EdatResult getSoil_qualityDetail(HttpServletRequest request,
                                            HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String id = data.getString("ID");
            String sql = "select * from \"t_soil_quality\" where \"ybbm\" = " + id;
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:luowenbin
     * @Param:
     * @Description:土壤环境调查所有图例利用类型
     * @Date: 2017/11/13
     */
    @RequestMapping("getDiaoChaoType")
    public EdatResult getDiaoChaoType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select \"tdly\" from \"t_soil_quality\" group by  \"tdly\" ";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:查询所有省市县信息
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getallRegion")
    public EdatResult getallRegion(HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select * from \"tb_city\"";

            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:遥感核查图表查询
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getYGHCTB")
    public EdatResult getYGHCTB(HttpServletRequest request,
                                HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            String names ="";
            if(!userlevel.equals("0")&&!userlevel.equals("1")){
           	 String sqlcode="select * from \"tb_city\" where \"code\"='"+regionCode+"'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
               Map mapS = codemap.get(0);
               names =mapS.get("name").toString();
               }
       
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sheng = data.getString("sheng");//
            String dalei = data.getString("dalei");//
            String shi = data.getString("shi");//
            String laiyuan = data.getString("laiyuan");//
            String type = data.getString("type");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "";
            if (type.equals("1")) {
                if (!sheng.equals("")) {
                    if (!shi.equals("")) {
                        sql += "select T1.*,T2.* from(select \"XIAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"SHI\"='" + shi + "'";
                    } else {
                        sql += "select T1.*,T2.* from(select \"SHI\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"SHENG\"='" + sheng + "'";
                    }
                } else {
                    sql += "select T1.*,T2.* from(select \"SHENG\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"SHENG\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"SHI\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"XIAN\" ='" + names + "'";
                }
                if (!dalei.equals("")) {
                    sql += " and \"DALEI\"='" + dalei + "'";

                }
                if (!laiyuan.equals("")) {
                    sql += " and \"LAIYUAN\"='" + laiyuan + "'";

                }
                if (!sheng.equals("")) {
                    if (!shi.equals("")) {
                        sql += " group by \"XIAN\") T1 left join \"tb_city\" T2 on T1.\"XIAN\"=T2.\"name\"";
                    } else {
                        sql += " group by \"SHI\") T1 left join \"tb_city\" T2 on T1.\"SHI\"=T2.\"name\" where T2.\"level\"='1'";
                    }
                } else {
                    sql += " group by \"SHENG\") T1 left join \"tb_city\" T2 on T1.\"SHENG\"=T2.\"name\" where T2.\"level\"='0'";
                }
            } else if (type.equals("2")) {
                if (!dalei.equals("")) {
                    sql += "select \"DALEI\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"DALEI\"='" + dalei + "'";
                } else {
                    sql += "select \"DALEI\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"SHENG\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"SHI\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"XIAN\" ='" + names + "'";
                }
                if (!sheng.equals("")) {
                    sql += " and \"SHENG\"='" + sheng + "'";

                }
                if (!laiyuan.equals("")) {
                    sql += " and \"LAIYUAN\"='" + laiyuan + "'";

                }
                sql += " group by \"DALEI\"";
            } else if (type.equals("3")) {
                if (!laiyuan.equals("")) {
                    sql += "select \"LAIYUAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"LAIYUAN\"='" + laiyuan + "'";
                } else {
                    sql += "select \"LAIYUAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"SHENG\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"SHI\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"XIAN\" ='" + names + "'";
                }
                if (!sheng.equals("")) {
                    sql += " and \"SHENG\"='" + sheng + "'";

                }
                if (!dalei.equals("")) {
                    sql += " and \"DALEI\"='" + dalei + "'";

                }
                sql += " group by \"LAIYUAN\"";
            }
            sql += " order by \"count\" desc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            System.out.println(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:遥感核查图表查询
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getYGHCSWFX")
    public EdatResult getYGHCSWFX(HttpServletRequest request,
                                HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "434");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            String names ="";
            if(!userlevel.equals("0")&&!userlevel.equals("1")){
           	 String sqlcode="select * from \"tb_city\" where \"code\"='"+regionCode+"'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
               Map mapS = codemap.get(0);
               names =mapS.get("name").toString();
               }
       
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sheng = data.getString("sheng");//
            String dalei = data.getString("dalei");//
            String shi = data.getString("shi");//
            String laiyuan = data.getString("laiyuan");//
            String type = data.getString("type");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "";
            if (type.equals("1")) {
                if (!sheng.equals("")) {
                    if (!shi.equals("")) {
                        sql += "select T1.*,T2.* from(select \"XIAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"SHI\"='" + shi + "'";
                    } else {
                        sql += "select T1.*,T2.* from(select \"XIAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"SHENG\"='" + sheng + "'";
                    }
                } else {
                    sql += "select T1.*,T2.* from(select \"XIAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"SHENG\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"SHI\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"XIAN\" ='" + names + "'";
                }
                if (!dalei.equals("")) {
                    sql += " and \"DALEI\"='" + dalei + "'";

                }
                if (!laiyuan.equals("")) {
                    sql += " and \"LAIYUAN\"='" + laiyuan + "'";

                }
                if (!sheng.equals("")) {
                    if (!shi.equals("")) {
                        sql += " group by \"XIAN\") T1 left join \"tb_city\" T2 on T1.\"XIAN\"=T2.\"name\"";
                    } else {
                        sql += " group by \"XIAN\" order by count(0) desc) T1 left join \"tb_city\" T2 on T1.\"XIAN\"=T2.\"name\" where T2.\"level\"='2'";
                    }
                } else {
                    sql += " group by \"XIAN\" order by count(0) desc) T1 left join \"tb_city\" T2 on T1.\"XIAN\"=T2.\"name\" where T2.\"level\"='2'";
                }
            } else if (type.equals("2")) {
                if (!dalei.equals("")) {
                    sql += "select \"DALEI\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"DALEI\"='" + dalei + "'";
                } else {
                    sql += "select \"DALEI\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"SHENG\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"SHI\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"XIAN\" ='" + names + "'";
                }
                if (!sheng.equals("")) {
                    sql += " and \"SHENG\"='" + sheng + "'";

                }
                if (!laiyuan.equals("")) {
                    sql += " and \"LAIYUAN\"='" + laiyuan + "'";

                }
                sql += " group by \"DALEI\"";
            } else if (type.equals("3")) {
                if (!laiyuan.equals("")) {
                    sql += "select \"LAIYUAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 and \"LAIYUAN\"='" + laiyuan + "'";
                } else {
                    sql += "select \"LAIYUAN\",count(*) as \"count\" from \"tb_wurandikuai_yaoganhecha\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"SHENG\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"SHI\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"XIAN\" ='" + names + "'";
                }
                if (!sheng.equals("")) {
                    sql += " and \"SHENG\"='" + sheng + "'";

                }
                if (!dalei.equals("")) {
                    sql += " and \"DALEI\"='" + dalei + "'";

                }
                sql += " group by \"LAIYUAN\"";
            }
            sql += " and ROWNUM <11 order by \"count\" desc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            System.out.println(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:地方自报图表查询
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getDFZBTB")
    public EdatResult getDFZBTB(HttpServletRequest request,
                                HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            String names ="";
            if(!userlevel.equals("0")&&!userlevel.equals("1")){
           	 String sqlcode="select * from \"tb_city\" where \"code\"='"+regionCode+"'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
               Map mapS = codemap.get(0);
               names =mapS.get("name").toString();
               }

            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String chanyeleixing = data.getString("chanyeleixing");//
            String city = data.getString("city");//
            String city2 = data.getString("city2");//
            String type = data.getString("type");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "";
            if (type.equals("4")) {
                sql += "select * from (";
                if (!city.equals("")) {
                    if (!city2.equals("")) {
                        sql += "select \"district\",count(*) as \"count\" from \"tb_key_industry_enterprise\" where 1=1 and \"city\"='" + city2 + "'";

                    } else {
                        sql += "select \"city\",count(*) as \"count\" from \"tb_key_industry_enterprise\" where 1=1 and \"province\"='" + city + "'";
                    }
                } else {
                    sql += "select \"province\",count(*) as \"count\" from \"tb_key_industry_enterprise\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"province\" ='" + regionCode + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"city\" ='" + regionCode + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"district\" ='" + regionCode + "'";
                }
                if (!chanyeleixing.equals("")) {
                    sql += " and \"industry\"='" + chanyeleixing + "'";

                }

                if (!city.equals("")) {
                    if (!city2.equals("")) {
                        sql += " group by \"district\") T1 left join \"tb_city\" T2 on T1.\"district\"=T2.\"code\"";
                    } else {
                        sql += " group by \"city\") T1 left join \"tb_city\" T2 on T1.\"city\"=T2.\"code\"";
                    }
                } else {
                    sql += " group by \"province\") T1 left join \"tb_city\" T2 on T1.\"province\"=T2.\"code\"";
                }
            } else {
                if (!chanyeleixing.equals("")) {
                    sql += "select \"industry\",count(*) as \"count\" from \"tb_key_industry_enterprise\" where 1=1 and \"industry\"='" + chanyeleixing + "'";
                } else {
                    sql += "select \"industry\",count(*) as \"count\" from \"tb_key_industry_enterprise\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"province\" ='" + regionCode + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"city\" ='" + regionCode + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"district\" ='" + regionCode + "'";
                }
                if (!city.equals("")) {
                    sql += " and \"province\"='" + city + "'";

                }
                sql += " group by \"industry\"";
            }

            sql += " order by \"count\" desc";
            System.out.println(sql);
            List<Map> list = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    /**
     * @Author:renqiang
     * @Description:重点行业企业下拉框内容查询
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getallOption")
    public EdatResult getallOption(HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select \"industry\" from \"tb_key_industry_enterprise\" group by \"industry\"";
            String sql2 = "select \"DALEI\" from \"tb_wurandikuai_yaoganhecha\" group by \"DALEI\"";
            String sql3 = "select \"LAIYUAN\" from \"tb_wurandikuai_yaoganhecha\" group by \"LAIYUAN\"";
            List<Map> industry = getBySqlMapper.findRecords(sql);
            List<Map> DALEI = getBySqlMapper.findRecords(sql2);
            List<Map> LAIYUAN = getBySqlMapper.findRecords(sql3);
            Map obj = new HashMap();
            obj.put("industry", industry);
            obj.put("DALEI", DALEI);
            obj.put("LAIYUAN", LAIYUAN);
            return EdatResult.ok(obj);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:自行监测图表查询
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getZXJCSTB")
    public EdatResult getZXJCSTB(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限");
            }
            HttpSession session = request.getSession();
            String regionCode = session.getAttribute("regionCode").toString();
            String userlevel = session.getAttribute("userLevel").toString();
            String names ="";
            if(!userlevel.equals("0")&&!userlevel.equals("1")){
           	 String sqlcode="select * from \"tb_city\" where \"code\"='"+regionCode+"'";
                List<Map> codemap = getBySqlMapper.findRecords(sqlcode);
               Map mapS = codemap.get(0);
               names =mapS.get("name").toString();
               }

            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String hangye = data.getString("hangye");//
            String province = data.getString("city");//
            String city = data.getString("city2");//
            String type = data.getString("type");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "";
            if (type.equals("1")) {

                if (!province.equals("")) {
                    if (!city.equals("")) {
                        sql += "select * from (select \"DISTRICT_CODE\",count(*) as \"count\" from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 and \"MUNICIPAL\"='" + city + "'";
                    } else {
                        sql += "select * from (select \"MUNICIPAL\",count(*) as \"count\" from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 and \"PROVINCE\"='" + province + "'";
                    }
                } else {
                    sql += "select * from (select \"PROVINCE\",count(*) as \"count\" from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"PROVINCE\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"MUNICIPAL\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"DISTRICT_CODE\" ='" + regionCode + "'";
                }
                if (!hangye.equals("")) {
                    sql += " and \"ONE_BUSINESSNAME\"='" + hangye + "'";
                }

                if (!province.equals("")) {
                    if (!city.equals("")) {
                        sql += " group by \"DISTRICT_CODE\") T1 left join \"tb_city\" T2 on T1.\"DISTRICT_CODE\"=T2.\"code\"";

                    } else {
                        sql += " group by \"MUNICIPAL\") T1 left join \"tb_city\" T2 on T1.\"MUNICIPAL\"=T2.\"name\"";
                    }
                } else {
                    sql += " group by \"PROVINCE\") T1 left join \"tb_city\" T2 on T1.\"PROVINCE\"=T2.\"name\" where T2.\"level\"=0";
                }
            } else {
                if (!hangye.equals("")) {
                    sql += "select \"ONE_BUSINESSNAME\",count(*) as \"count\" from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 and \"ONE_BUSINESSNAME\"='" + hangye + "'";
                } else {
                    sql += "select \"ONE_BUSINESSNAME\",count(*) as \"count\" from \"T_GY_WASTEBASCIMESSAGE\" where 1=1 ";
                }
                if (userlevel.equals("2")) {
                    sql += " and \"PROVINCE\" ='" + names + "'";

                } else if (userlevel.equals("3")) {
                    sql += " and \"MUNICIPAL\" ='" + names + "'";
                } else if (userlevel.equals("4")) {
                    sql += " and \"DISTRICT_CODE\" ='" + regionCode + "'";
                }
                if (!province.equals("")) {
                    sql += " and \"PROVINCE\"='" + province + "'";
                }
                sql += " group by \"ONE_BUSINESSNAME\"";

            }
            sql += " order by \"count\" desc";

            List<Map> list = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:自行监测图表下拉框内容查询
     * @Date:09:20 2017/10/20
     */
    @RequestMapping("getZXJCALL")
    public EdatResult getZXJCALL(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select \"ONE_BUSINESSNAME\" from \"T_GY_WASTEBASCIMESSAGE\" group by \"ONE_BUSINESSNAME\"";
            List<Map> industry = getBySqlMapper.findRecords(sql);
            JSONObject obj = new JSONObject();
            obj.put("hangye", industry);
            return EdatResult.ok(industry);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:其他图表查询
     * @Date:09:23 2017/10/23
     */
    @RequestMapping("getQTTB")
    public EdatResult getQTTB(HttpServletRequest request,
                              HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "3");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return EdatResult.build(status, "权限");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String province = data.getString("province");//
            String city = data.getString("city");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql = "select * from (select";

            if (!province.equals("")) {
                if (!city.equals("")) {
                    sql += " \"county\",count(*) as \"count\" from \"tb_food_county\" where \"city\"='" + city + "' group by \"county\") T1 left join \"tb_city\" T3 on T1.\"county\"= T3.\"code\"";
                } else {
                    sql += " \"city\",count(*) as \"count\" from \"tb_food_county\" where \"province\"='" + province + "' group by \"city\") T1 left join \"tb_city\" T3 on T1.\"city\"= T3.\"code\"";
                }
            } else {
                sql += " \"province\",count(*) as \"count\" from \"tb_food_county\" group by \"province\") T1 left join \"tb_city\" T3 on T1.\"province\"= T3.\"code\"";
            }
            sql += " order by T1.\"count\" desc";
            List<Map> list = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


} 
