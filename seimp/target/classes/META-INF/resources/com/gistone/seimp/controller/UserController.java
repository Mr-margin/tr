package com.gistone.seimp.controller;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.Console;
import java.net.URLDecoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.micro.auth.PortalLoginService;
import com.gistone.seimp.micro.log.LogService;
import com.gistone.seimp.runner.TestRedis;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.*;
import com.sun.org.apache.regexp.internal.RE;

import net.sf.json.JSONObject;
import oracle.sql.CLOB;

import org.apache.catalina.util.URLEncoder;
import org.apache.ibatis.logging.LogException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;


@RestController
@RequestMapping("user")
public class UserController {


    Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    @Autowired
    private LogToDb logToDb;

    /**
     * @Author:renqiang
     * @Description:登录
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("login")
    public EdatResult login(HttpServletRequest request,
                            HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
         /*   if(session.getAttribute("isLogin").equals("true")){
                return EdatResult.build(0, "已登录");
            }*/
            String userName = data.getString("loginName");//账号
            String userPwd = data.getString("password");//密码
//            String type = data.getString("type");//用户类型,0理员,1国家用户,2省级用户
            String rand = data.getString("rand");//密码
            String randNum = (String) session.getAttribute("rand");
            if (randNum == null || !rand.equals(randNum)) {
                return EdatResult.build(1, "验证码错误");
            }
            String sql = "select * from TBPUBUSER where USERNAME = '" + userName + "' and state = '0'";
            List<Map> list = getBySqlMapper.findRecords(sql);
//            if (list.size() > 0 && MD5Util.verify(userPwd, list.get(0).get("PASSWORD").toString())) {
            if (list.size() > 0 && list.get(0).get("PASSWORD").toString().equals(MD5Util.md5Encode(userPwd))) {
                String userLevel = list.get(0).get("USERLEVEL")==null?"":list.get(0).get("USERLEVEL").toString();
                /*if(!userLevel.equals(type)){
                    return EdatResult.build(1, "账号类型错误");
                }*/
                Map result = new HashMap();
                String name = list.get(0).get("NAME") == null ? "" : list.get(0).get("NAME").toString();
                String userID = list.get(0).get("USERID").toString();
                String sql1 = "select T2.* from (select * from TBPUBUSERROLE where USERID = " + userID + ")T1 JOIN TBPUBROLE T2 ON T1.ROLEID = T2.ROLEID ";
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
                List<Map> rights = new ArrayList<>();
                if (list1.size() > 0) {
                    String roleId = list1.get(0).get("ROLEID") == null ? "" : list1.get(0).get("ROLEID").toString();
                    rights = getRightsByRole(roleId);
                    result.put("roleID", roleId);
                    result.put("roleName", list1.get(0).get("ROLENAME") == null ? "" : list1.get(0).get("ROLENAME").toString());
                    String sql2 = "select \"RIGHTID\" from \"TBPUBROLERIGHT\" where \"ROLEID\" = " + roleId;
                    List<Map> list2 = getBySqlMapper.findRecords(sql2);
                    List permi = new ArrayList();
                    for (Map map : list2) {
                        permi.add(map.get("RIGHTID").toString());
                    }
                    if (permi.size() > 0) {
                        session.setAttribute("rights", permi);
                    }
                    session.setAttribute("roleID", roleId);
                }
                String regionCode = list.get(0).get("REGIONCODE") == null ? "" : list.get(0).get("REGIONCODE").toString();
                /*设置已登录的状态*/
                session.setAttribute("isLogin", "true");
                session.setAttribute("userID", userID);
                session.setAttribute("loginName", userName);
                session.setAttribute("name", name);
                session.setAttribute("regionCode", regionCode);
                session.setAttribute("userLevel", userLevel);
                result.put("name", name);
                result.put("rights", rights);
                result.put("userID", userID);
                result.put("regionCode", regionCode);
                result.put("userLevel", userLevel);
                logToDb.addLog(request, "登录");

                //存储登录信息到Redis
                DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String  TOKEN_SALT = "Gistone2301";
                String token = DigestUtils.md5DigestAsHex((userName+TOKEN_SALT).getBytes()) + "#" + UUID.randomUUID().toString();
                JSONObject jsonObject=new JSONObject();
                String Email = list.get(0).get("EMAIL") == null ? "" : list.get(0).get("EMAIL").toString();
                jsonObject.put("username",userName);
                jsonObject.put("regioncode",regionCode);
                jsonObject.put("tel","");
                jsonObject.put("email",Email);
                jsonObject.put("logintime", df.format(new Date()));
                jsonObject.put("updatetime", df.format(new Date()));
                jsonObject.put("expiretime","");
                jsonObject.put("loginip",request.getRemoteAddr());
                jsonObject.put("auth","[{\"systemid\":\"portal\",\"authorcontext\":\"1,2,5,9,10\"},{\"systemid\":\"wrdk\",\"authorcontext\":\"15,20,21,22\"}]");
//                session.setAttribute("token", jsonObject.toString());
                result.put("token", java.net.URLEncoder.encode(token,"UTF-8"));//URLDecoder.decode(param, "utf-8");
//                redisRun(java.net.URLEncoder.encode(token,"UTF-8"),jsonObject.toString());

                //记录token
                session.setAttribute("token", java.net.URLEncoder.encode(token,"UTF-8"));
                return EdatResult.ok(result);
            } else {
                return EdatResult.build(1, "账号不存在或密码错误");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    private void redisRun(String token, String json) {
        TestRedis testRedis = new TestRedis();
        testRedis.connectRedis();
        testRedis.testString(token,json);
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:修改密码
     * @Date:10:33 2017/11/7
     */
    @RequestMapping("resetpw")
    public EdatResult resetpw(HttpServletRequest request,
                              HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String opw = data.get("oldpassword").toString();
            String npw = data.get("newpassword").toString();
            if (!RegUtil.CheckParameter(opw, null, null, false)) {
                return EdatResult.build(1, "原密码不能为空");
            }
            if (!RegUtil.CheckParameter(npw, null, null, false)) {
                return EdatResult.build(1, "新密码不能为空");
            }
            if (npw.length() < 6) {
                return EdatResult.build(1, "新密码长度不足六位");
            }
            if (opw.equals(npw)) {
                return EdatResult.build(1, "新旧密码相同");
            }
            HttpSession session = request.getSession();
            String userID = (String) session.getAttribute("userID");
            String sql = "select * from TBPUBUSER where USERID = '" + userID + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
//            if (list.size() > 0 && MD5Util.verify(data.get("oldpassword").toString(), list.get(0).get("PASSWORD").toString())) {
            if (list.size() > 0 && list.get(0).get("PASSWORD").toString().equals(MD5Util.md5Encode(data.get("oldpassword").toString()))) {
                String sql1 = "update TBPUBUSER set PASSWORD = '" + MD5Util.md5Encode(npw) + "' where USERID = '" + userID + "'";
                getBySqlMapper.update(sql1);
            } else {
                return EdatResult.build(1, "原密码错误");
            }
            return EdatResult.ok();
        } catch (Exception e) {
            return EdatResult.build(1, "修改密码异常");
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取数据权限
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getDataRightByRole")
    public EdatResult getDataRightByRole(HttpServletRequest request,
                                         HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String roleID = data.getString("roleID");//
            Map<String, String> statusmap = new HashMap();
            String sql = "select T1.\"id\",T1.\"name\" from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID= " + roleID + "  )T0" +
                    "  JOIN \"tb_source_catalog\" T1 " +
                    "ON T0.RIGHTID =T1.\"id\" and T1.\"parent_id\" = 0 order by T1.\"id\" asc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            String sqlstatus = "SELECT T2.* FROM (SELECT RIGHTID FROM TBPUBROLERIGHT where ROLEID = " + roleID + " )T1  join" +
                    " TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and  T2.\"ID\" <= 103 and T2.\"ID\" >= 100 order by T2.ID asc";
            List<Map> statuslist = getBySqlMapper.findRecords(sqlstatus);
            for (Map map : list) {
                String sql1 = "select T1.\"id\",T1.\"name\" from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID=  " + roleID + " )T0" +
                        "  JOIN \"tb_source_catalog\" T1 " +
                        " ON T0.RIGHTID =T1.\"id\"  and T1.\"parent_id\"= '" + map.get("id").toString() + "'  order by T1.\"id\" asc";
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
                if (list1.size() > 0) {
                    for (Map map1 : list1) {
                        String sql2 = "select T1.\"id\",T1.\"name\" from (select RIGHTID from T_ROLE_DATARIGHT where ROLEID=  " + roleID + " )T0" +
                                "  JOIN \"tb_source_catalog\" T1 " +
                                " ON T0.RIGHTID =T1.\"id\" and T1.\"parent_id\"= '" + map1.get("id").toString() + "' order by T1.\"id\" asc";
                        List<Map> list2 = getBySqlMapper.findRecords(sql2);
                        if (list2.size() > 0) {
                            map1.put("children", list2);
                        }

                    }
                    map.put("children", list1);
                }

            }
            for (Map map : statuslist) {

                statusmap.put(map.get("NAME").toString(), map.get("ID").toString());
            }
            String sql3 = "select * from \"tb_ministry_dict\" order by \"ordernum\" asc";
//            String sql3 = "select * from \"tb_ministry_dict\" order by \"id\" asc";
            List<Map> list1 = getBySqlMapper.findRecords(sql3);
            Map result = new HashMap();
            result.put("dataRights", list);
            result.put("ministries", list1);
            result.put("statusmap", statusmap);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /*获取功能权限*/
    public List getRightsByRole(String roleID) {
        //查询所有有效权限
        String sql = "SELECT T2.* FROM (SELECT RIGHTID FROM TBPUBROLERIGHT where ROLEID = " + roleID + " )T1  join" +
                " TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID = 0 order by T2.ID asc";
        List<Map> list = getBySqlMapper.findRecords(sql);


        for (Map map : list) {
            String sql1 = "select T2.ID,T2.NAME from (select RIGHTID from TBPUBROLERIGHT where ROLEID = " + roleID + ")T1 join TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID = "
                    + map.get("ID").toString() + " order by T2.ID asc";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            if (list1.size() > 0) {
                map.put("children", list1);
                for (Map map1 : list1) {
                    String sql2 = "select T2.ID,T2.NAME from (select RIGHTID from TBPUBROLERIGHT where ROLEID = " + roleID + ")T1 join TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID = " + map1.get("ID").toString() + " order by T2.ID asc";
                    List<Map> list2 = getBySqlMapper.findRecords(sql2);
                    if (list2.size() > 0) {
                        map1.put("children", list2);
                        for (Map map2 : list2) {
                            String sql3 = "select T2.ID,T2.NAME from (select RIGHTID from TBPUBROLERIGHT where ROLEID = " + roleID + ")T1 join TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID = " + map2.get("ID").toString() + " order by T2.ID asc";
                            List<Map> list3 = getBySqlMapper.findRecords(sql3);
                            if (list3.size() > 0) {
                                map2.put("children", list3);
                            }
                        }
                    }
                }
            }
        }

        return list;
    }

    /**
     * @Author:renqiang
     * @Description:添加角色
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("addRole")
    public EdatResult addRole(HttpServletRequest request,
                              HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userID = (String) session.getAttribute("userID");//用户ID
            String roleName = data.getString("roleName");//角色名
            String comments = data.getString("comments");//角色说明
            /*功能权限*/
            String rights = data.getString("rights");//权限ID
            /*数据权限*/
            String rights1 = data.getString("rights1");//权限
            String sql = "select * from TBPUBROLE where ROLENAME = '" + roleName + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            if (list.size() > 0) {
                return EdatResult.build(1, "角色名称重复");
            }
            String sql1 = "insert into tbPubRole(roleID,roleName,comments,createTime,author) values (PUBROLE_SEQ.nextval," +
                    "'" + roleName + "','" + comments + "',sysdate,'" + userID + "')";
            getBySqlMapper.insert(sql1);
            String sql3 = "select * from tbPubRole where roleName = '" + roleName + "'";
            List<Map> list1 = getBySqlMapper.findRecords(sql3);
            String roleID = list1.get(0).get("ROLEID").toString();
            if (rights.length() > 0) {
                String[] arr = rights.split(",");
                for (int i = 0; i < arr.length; i++) {
                    String sql2 = "insert into tbPubRoleRight(ROLERIGHTID,roleId,rightId) values(PUBROLERIGHT_SEQ.nextval," +
                            roleID + "," + arr[i] + ")";
                    getBySqlMapper.insert(sql2);
                }
            }
            if (rights1.length() > 0) {
                String[] arr = rights1.split(",");
                for (int j = 0; j < arr.length; j++) {
                    String sql2 = "INSERT INTO T_ROLE_DATARIGHT(ID, ROLEID, RIGHTID) VALUES (T_ROLE_DATARIGHT_SEQ.nextval," +
                            roleID + "," + arr[j] + ")";
                    getBySqlMapper.insert(sql2);
                }
            }
            logToDb.addLog(request, "添加角色");
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:修改角色信息
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("modifyRole")
    public EdatResult modifyRole(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userID = (String) session.getAttribute("userID");//用户ID
            String roleID = data.getString("roleID");//角色ID
            String roleName = data.getString("roleName");//角色名
            String comments = data.getString("comments");//角色说明
            String rights = data.getString("rights");
            /*数据权限*/
            String rights1 = data.getString("rights1");
            String sql = "update tbPubRole set roleName = '" + roleName + "',comments = '" + comments + "',updateTime = sysdate,author='" + userID + "' where roleID = " + roleID;
            getBySqlMapper.update(sql);
            String sql1 = "delete from tbPubRoleRight where roleId = " + roleID;
            getBySqlMapper.delete(sql1);
            String sql3 = "delete from T_ROLE_DATARIGHT where ROLEID = " + roleID;
            getBySqlMapper.delete(sql3);
            if (rights.length() > 0) {
                String[] arr = rights.split(",");
                for (int i = 0; i < arr.length; i++) {
                    String sql2 = "insert into tbPubRoleRight(roleRightId,roleId,rightId) values(PUBROLERIGHT_SEQ.nextval," + roleID + "," + arr[i] + ")";
                    getBySqlMapper.insert(sql2);
                }
            }
            if (rights1.length() > 0) {
                String[] arr = rights1.split(",");
                for (int j = 0; j < arr.length; j++) {
                    String sql2 = "INSERT INTO T_ROLE_DATARIGHT(\"ID\", \"ROLEID\", \"RIGHTID\") VALUES (T_ROLE_DATARIGHT_SEQ.nextval," +
                            roleID + "," + arr[j] + ")";
                    getBySqlMapper.insert(sql2);
                }
            }
            logToDb.addLog(request, "修改角色信息");
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:删除角色
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("deleteRole")
    public EdatResult deleteRole(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String roleID = data.getString("roleID");//角色名
            String sql2 = "select * from tbPubUserRole where ROLEID = " + roleID;
            if (getBySqlMapper.findRecords(sql2).size() > 0) {
                return EdatResult.build(1, "存在该角色用户，无法删除");
            } else {
                String sql = "delete from TBPUBROLE where roleID = " + roleID;
                String sql1 = "delete from TBPUBROLERIGHT where roleID = " + roleID;
                getBySqlMapper.delete(sql);
                getBySqlMapper.delete(sql1);
                logToDb.addLog(request, "删除角色");
                return EdatResult.ok();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "操作失败");
        }
    }


    /**
     * @Author:renqiang
     * @Description:获取所有角色
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getAllRoles1")
    public EdatResult getAllRoles1(HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            /*查询所有角色信息*/
            String sql = "select *  from TBPUBROLE ";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:获取所有角色列表(bootstrap table 用)
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getAllRoles")
    public Map getAllRoles(HttpServletRequest request,
                           HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));//页码
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));//每页条数
            String name = RegUtil.checkParam(request.getParameter("name"));//姓名
            /*查询所有角色信息*/
            String sql = "SELECT * FROM (select T1.*,ROWNUM RN FROM(select *  from (select * from TBPUBROLE ";
            String sql3 = " select count(*) from TBPUBROLE";
            if (!name.equals("")) {
                sql += " where ROLENAME like '%" + name + "%'";
                sql3 += " where ROLENAME like '%" + name + "%'";
            }
            sql += " )T0 left join tbPubUser on T0.AUTHOR = TBPUBUSER.USERID)T1 ) WHERE RN>" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql);
            int total = getBySqlMapper.findrows(sql3);
            Map result = new HashMap();
            result.put("rows", list);
            result.put("page", pageNumber / pageSize);
            result.put("total", total);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:获取一个角色
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getARole")
    public EdatResult getARole(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String roleID = data.getString("roleID");
            /*查询所有角色信息*/
            String sql = "select * from tbPubRoleRight where ROLEID = " + roleID;
            List<Map> list = getBySqlMapper.findRecords(sql);
            String sql1 = "select * from tbPubRole where ROLEID = " + roleID;
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            String rights = "";
            for (Map map : list) {
                rights += map.get("RIGHTID").toString() + ",";
            }
            if (rights.length() > 0) {
                rights = rights.substring(0, rights.length() - 1);
            }
            String sql3 = "select * from T_ROLE_DATARIGHT where ROLEID = " + roleID;
            List<Map> list3 = getBySqlMapper.findRecords(sql3);
            String rights1 = "";
            for (Map map : list3) {
                rights1 += map.get("RIGHTID").toString() + ",";
            }
            if (rights1.length() > 0) {
                rights1 = rights1.substring(0, rights1.length() - 1);
            }
            Map map = new HashMap();
            map.put("rights", rights);
            map.put("dataRights", rights1);
            map.put("name", list1.get(0).get("ROLENAME") == null ? "" : list1.get(0).get("ROLENAME").toString());
            map.put("comment", list1.get(0).get("COMMENTS") == null ? "" : list1.get(0).get("COMMENTS").toString());
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:添加用户
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("addUser")
    @Transactional(rollbackFor = Exception.class)
    public EdatResult addUser(HttpServletRequest request,
                              HttpServletResponse response) throws Exception {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String loginName = data.getString("loginName");//登录名
            String password = data.getString("password");
            String name = data.getString("name");
            String tel = data.getString("tel");
            String email = data.getString("email");
            String section = data.getString("section");//部门
            String level = data.getString("level");//用户等级
            String roleID = data.getString("roleID");//用户角色Id
            String regionCode = data.getString("regionCode");//行政区划
            if (loginName.length() > 16 || loginName.length() < 5) {
                return EdatResult.build(1, "登录名长度不符合要求");
            }
            if (password.length() > 20 || password.length() <8) {
                return EdatResult.build(1, "密码长度不符合要求");
            }
            if (name.length() > 25) {
                return EdatResult.build(1, "姓名长度不符合要求");
            }
            String sql0 = "select * from tbPubUser where userName = '" + loginName + "'";
            List<Map> list = getBySqlMapper.findRecords(sql0);
            if (list.size() > 0) {
                return EdatResult.build(1, "已存在该用户名");
            }
            /*插入用户基本信息*/
//            String sql = "insert into tbPubUser(userId,userName,password,name,tel,email,userLevel,section,state,REGIONCODE) values(PUBUSER_SEQ.nextval,'" + loginName + "','" + MD5Util.generate(password) + "','" +
            String sql = "insert into tbPubUser(userId,userName,password,name,tel,email,userLevel,section,state,REGIONCODE) values(PUBUSER_SEQ.nextval,'" + loginName + "','" + MD5Util.md5Encode(password) + "','" +
                    name + "','" + tel + "','" + email + "','" + level + "','" + section + "','0','" + regionCode + "')";
            int flag0 = getBySqlMapper.insert(sql);
            if (flag0 == 1) {
                String sql2 = "select USERID from tbPubUser where userName = '" + loginName + "'";
                List<Map> list1 = getBySqlMapper.findRecords(sql2);
                /*插入用户角色信息*/
                String sql1 = "insert into tbPubUserRole(userRoleId,userId,roleId) values(PUBUSERROLE_SEQ.nextval," + list1.get(0).get("USERID").toString() + "," + roleID + ")";
                getBySqlMapper.insert(sql1);
            }
            logToDb.addLog(request, "添加用户");
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"status\":\"1\",\"msg\":\"fail\",\"data\":\"\"}");
            throw e;
        }
    }

    /**
     * @Author:renqiang
     * @Description:修改用户信息
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("modifyUser")
    public EdatResult modifyUser(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String targetID = data.getString("userID");//被修改用户ID
            String name = data.getString("name");//姓名
            String tel = data.getString("tel");//电话
            String email = data.getString("email");
            String section = data.getString("section");//部门
            String level = data.getString("level");//用户等级
            String roleID = data.getString("roleID");//角色ID
            String password = data.getString("password");//角色ID
            String regionCode = data.getString("regionCode");//行政区划
            String sql = "update tbPubUser set name = '" + name + "',tel = '" + tel + "',email='" + email + "',userLevel = '" + level + "',regionCode = '" + regionCode + "',section='" + section + "'";
            if (!password.equals("")) {
                sql += ",PASSWORD = '" + MD5Util.md5Encode(password) + "'";
//                sql += ",PASSWORD = '" + MD5Util.generate(password) + "'";
            }
            sql += " where userID = " + targetID;
            getBySqlMapper.update(sql);
            String sql1 = "update tbPubUserRole set roleId  = " + roleID + " where userID = " + targetID;
            getBySqlMapper.update(sql1);
            logToDb.addLog(request, "修改用户信息");
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:删除用户
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("deleteUser")
    public EdatResult deleteUser(HttpServletRequest request,
                                 HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String userId = data.getString("userID");//被删除用户Id
            String sql = "delete from  tbPubUser  where userId = " + userId;
            String sql1 = "delete from tbPubUserRole where userId = " + userId;
            getBySqlMapper.update(sql);
            getBySqlMapper.delete(sql1);
            logToDb.addLog(request, "删除用户");
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:分页查询用户
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getUsers")
    public Map getUsers(HttpServletRequest request,
                        HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));//页码
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));//每页条数
            String loginName = RegUtil.checkParam(request.getParameter("loginName"));//登录名
            String name = RegUtil.checkParam(request.getParameter("name"));//姓名
            String section = RegUtil.checkParam(request.getParameter("section"));//部门
            String level = request.getParameter("level");//用户等级
            String role = request.getParameter("role");//角色
            String sql = "select * from (select T2.* ,ROWNUM RN from (select T1.* from (select * from TBPUBUSER ";
            String sql1 = "select count(*) from (select * from TBPUBUSER ";
            //    String sql2 = "where STATE = '0' and USERLEVEL <> '0' ";
            String sql2 = "where STATE = '0'  and (USERLEVEL != '0' or USERLEVEL is null ) ";
            if (!loginName.equals("")) {//过滤登录名
                sql2 += " and USERNAME like '%" + loginName + "%'";
            }
            if (!name.equals("")) {//过滤姓名
                sql2 += " and NAME like '%" + name + "%'";
            }
            if (!section.equals("")) {//过滤部门
                sql2 += " and SECTION like '%" + section + "%'";
            }
            if (!level.equals("")) {//过滤用户等级
                sql2 += " and USERLEVEL = '" + level + "'";
            }
            sql2 += ")T1";
            if (!role.equals("")) {
                sql2 += " join (select * from TBPUBUSERROLE where ROLEID = " + role + ")T3 ON T1.USERID = T3.USERID";
            }
            sql += sql2;
            sql1 += sql2;
            sql += "  order by T1.USERLEVEL asc,T1.USERNAME asc,T1.NAME asc)T2)where RN>" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql);
            int total = getBySqlMapper.findrows(sql1);
            //从前台获取到数据
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                Map map1 = new HashMap();
                String ID = map.get("USERID").toString();
                map1.put("USERID", ID);
                map1.put("USERNAME", map.get("USERNAME") == null ? "" : map.get("USERNAME").toString());//登录名称
                map1.put("NAME", map.get("NAME") == null ? "" : map.get("NAME").toString());//姓名
                map1.put("TEL", map.get("TEL") == null ? "" : map.get("TEL").toString());//电话号
                map1.put("SECTION", map.get("SECTION") == null ? "" : map.get("SECTION").toString());//部门
                map1.put("EMAIL", map.get("EMAIL") == null ? "" : map.get("EMAIL").toString());//邮箱
                String userlevel=map.get("USERLEVEL") == null ? "" : map.get("USERLEVEL").toString();
                map1.put("USERLEVEL",userlevel );//用户等级
                String pro="";
                if(!userlevel.equals("")&&Integer.parseInt(userlevel)>1&&map.get("REGIONCODE")!=null){
                    String sql3="select * from \"tb_city\" where \"code\" = '"+map.get("REGIONCODE").toString().substring(0,2)+"0000'";
                    List<Map> list1 = getBySqlMapper.findRecords(sql3);
                    if(list1.size()>0){
                        pro=list1.get(0).get("name")==null?"":list1.get(0).get("name").toString();
                    }
                }
                map1.put("province",pro);
                String sql11 = "select ROLEID from tbPubUserRole where USERID = " + ID;
                List<Map> list1 = getBySqlMapper.findRecords(sql11);
                String roleName = "";
                if (list1.size() > 0) {
                    roleName = list1.get(0).get("ROLEID") == null ? "" : list1.get(0).get("ROLEID").toString();
                }
                map1.put("ROLEID", roleName);//角色
                result.add(map1);
            }
            Map res = new HashMap();
            res.put("rows", result);
            res.put("total", total);
            res.put("page", pageNumber / pageSize);
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:分页查询日志
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getLogs")
    public Map getLogs(HttpServletRequest request,
                       HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            String name = RegUtil.checkParam(request.getParameter("name").trim());
            String content = RegUtil.checkParam(request.getParameter("content").trim());
            String startTime = request.getParameter("startTime");
            String endTime = request.getParameter("endTime");
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));//页码
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));//每页条数
            String sql = "select * from (select T1.*,ROWNUM RN from (select \"id\", to_char(\"time\",'yyyy-mm-dd HH24:mi:ss')\"time\", \"user_id\", \"login_ip\", " +
                    " \"content\", \"user_name\" from \"tb_log\" where 1=1 ";
            String sql1 = "select count(*) from \"tb_log\" where 1=1 ";
            String sql2 = "";
            if (!name.equals("")) {
                sql2 += " and \"user_name\" like '%" + name + "%'";
            }
            if (!content.equals("")) {
                sql2 += " and \"content\" like '%" + content + "%'";
            }
            if (!startTime.equals("")) {
                sql2 += " and \"time\" >=  to_date('"+startTime+"','YYYY-MM-DD')";
            }
            if (!endTime.equals("")) {
                sql2 += " and \"time\" <= to_date('"+endTime+"','YYYY-MM-DD')+1";
            }
            sql += sql2;
            sql1 += sql2;
            sql += " order by \"time\" desc)T1 )where RN>" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql);
            int total = getBySqlMapper.findrows(sql1);
            //从前台获取到数据
            List<Map> result = new ArrayList<>();
            Map res = new HashMap();
            res.put("rows", list);
            res.put("total", total);
            res.put("page", pageNumber / pageSize);
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:查询一个用户信息
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getAUser")
    public EdatResult getAUser(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String userID = data.getString("userID");//用户ID
            //查询所有有效权限
            String sql = "SELECT * FROM tbPubUser where USERID = " + userID;
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map map = list.get(0);
            Map map1 = new HashMap();
            String ID = map.get("USERID").toString();
            map1.put("USERID", ID);
            map1.put("USERNAME", map.get("USERNAME") == null ? "" : map.get("USERNAME").toString());//登录名称
            map1.put("NAME", map.get("NAME") == null ? "" : map.get("NAME").toString());//姓名
            map1.put("TEL", map.get("TEL") == null ? "" : map.get("TEL").toString());//电话号
            map1.put("SECTION", map.get("SECTION") == null ? "" : map.get("SECTION").toString());//部门
            map1.put("EMAIL", map.get("EMAIL") == null ? "" : map.get("EMAIL").toString());//邮箱
            map1.put("USERLEVEL", map.get("USERLEVEL") == null ? "" : map.get("USERLEVEL").toString());//用户等级
            map1.put("REGIONCODE", map.get("REGIONCODE") == null ? "" : map.get("REGIONCODE").toString());
            String sql11 = "select ROLEID from tbPubUserRole where USERID = " + ID;
            List<Map> list1 = getBySqlMapper.findRecords(sql11);
            String roleName = "";
            if (list1.size() > 0) {
                roleName = list1.get(0).get("ROLEID") == null ? "" : list1.get(0).get("ROLEID").toString();
            }
            map1.put("ROLEID", roleName);//角色
            return EdatResult.ok(map1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:获取所有权限
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("getAllRights")
    public EdatResult getAllRights(HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            //查询所有有效权限
            String sql = "SELECT ID \"id\",NAME \"name\" FROM tbPubRight where parent_id = 0 order by ID";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
                String sql1 = "SELECT ID \"id\",NAME \"name\" FROM tbPubRight where parent_id =" + map.get("id").toString() + "order by ID";
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
                if (list1.size() > 0) {
                    map.put("children", list1);
                    for (Map map1 : list1) {
                        String sql2 = "SELECT ID \"id\",NAME \"name\" FROM tbPubRight where parent_id =" + map1.get("id").toString() + "order by ID";
                        List<Map> list2 = getBySqlMapper.findRecords(sql2);
                        if (list2.size() > 0) {
                            map1.put("children", list2);
                            for (Map map2 : list2) {
                                String sql3 = "SELECT ID \"id\",NAME \"name\" FROM tbPubRight where parent_id =" + map2.get("id").toString() + "order by ID";
                                List<Map> list3 = getBySqlMapper.findRecords(sql3);
                                if (list3.size() > 0) {
                                    map2.put("children", list3);
                                }
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
     * @Author:renqiang
     * @Param:
     * @Description:退出登录
     * @Date:10:27 2017/11/7
     */
    @RequestMapping("loginOut")
    public EdatResult loginOut(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            //false代表：不创建session对象，只是从request中获取。
            HttpSession session = request.getSession(false);
            if (session == null) {
                return EdatResult.build(1, "获取session异常");
            } else {
            	String currID = logToDb.addLog(request, "退出登录");
            	
            	//往门户推送日志
            	
            	String userID = (String) session.getAttribute("userID");
            	if(userID != null && userID!=""){
	            	String sql = "select * from TBPUBUSER where USERID="+userID +" and ISPORTALUSER='1'";
	            	List<Map> list = getBySqlMapper.findRecords(sql);
	            	if(list.size()>0){
	            		//记录日志
		                //往门户推送日志
		                String UUID2 = list.get(0).get("UUID") == null ? "" : list.get(0).get("UUID").toString();
		                String name = list.get(0).get("NAME") == null ? "" : list.get(0).get("NAME").toString();
		                String userName = list.get(0).get("USERNAME") == null ? "" : list.get(0).get("USERNAME").toString();
		                JSONObject addDataResult = logService.addData(UUID2, name, userName, UserIPUtils.getIpAddress(request), "2", "退出登录", df.format(new Date()), currID);
		                if(addDataResult.containsKey("RESULT")){
		                	if("true".equals(addDataResult.get("RESULT").toString())){
		                		System.out.println("推送登出日志成功");
		                	}
		                }
	            	}
	                
	                
            	}
                
                session.invalidate();
                return EdatResult.ok();
            }
        } catch (Exception e) {
            return EdatResult.build(1, "获取session异常");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:获取权限菜单
     * @Date:11:33 2017/11/29
     */
    @RequestMapping("getMenus")
    public EdatResult getMenus(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            String part = data.getString("partID");
            String sql = "select T2.ID from (select * from TBPUBROLERIGHT where ROLEID = '" + roleID + "')T1  join TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID ='" + part + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            List result = new ArrayList();
            for (Map map : list) {
                String id = map.get("ID").toString();
                result.add(id);
                String sql1 = "select T2.ID from (select * from TBPUBROLERIGHT where ROLEID = '" + roleID + "')T1  join TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID ='" + id + "'";
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
                for (Map map1 : list1) {
                    String id1 = map1.get("ID").toString();
                    result.add(id1);
                    String sql2 = "select T2.ID from (select * from TBPUBROLERIGHT where ROLEID = '" + roleID + "')T1  join TBPUBRIGHT T2 on T1.RIGHTID = T2.ID and T2.PARENT_ID ='" + id1 + "'";
                    List<Map> list2 = getBySqlMapper.findRecords(sql2);
                    for (Map map2 : list2) {
                        result.add(map2.get("ID").toString());
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
     * @Description:验证码
     * @Date:14:20 2017/11/23
     */
    @RequestMapping("getImage")
    public final ModelAndView handleRequestInternal(final HttpServletRequest request,
                                                    final HttpServletResponse response) throws Exception {
        try {
            response.setContentType("image/jpeg");
            response.setHeader("Pragma", "No-cache");
            response.setHeader("Cache-Control", "no-cache");
            response.setDateHeader("Expires", 0);
            // 在内存中创建图象
            int width = 136, height = 40;
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            // 获取图形上下文
            Graphics g = image.getGraphics();
            // 生成随机类
            Random random = new Random();
            // 设定背景色
            g.setColor(getRandColor(200, 250));
            g.fillRect(0, 0, width, height);
            // 设定字体
            g.setFont(new Font("Arial", Font.PLAIN, 32));
            // 随机产生155条干扰线，使图象中的认证码不易被其它程序探测到
            g.setColor(getRandColor(160, 200));
            for (int i = 0; i < 155; i++) {
                int x = random.nextInt(width);
                int y = random.nextInt(height);
                int xl = random.nextInt(12);
                int yl = random.nextInt(12);
                g.drawLine(x, y, x + xl, y + yl);
            }
            // 取随机产生的认证码(4位数字)
            int sRand = 0;
          /*  // 是加法还是减法
            int math = random.nextInt(2);
            // 加法
            if (math == 0) {*/
            // 第一个数据
            int rand = random.nextInt(10);
            if (rand == 0) {
                rand = 1;
            }
            g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
            g.drawString("" + rand, 26 * 0 + 6, 32);
            //
              /*  int rand1 = random.nextInt(10);
                g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
                g.drawString("" + rand1, 13 * 1 + 6, 16);*/
            // +号
            g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
            g.drawString("+", 26 * 1 + 6, 32);
            // 第二个数据
            int rand2 = random.nextInt(10);
            if (rand2 == 0) {
                rand2 = 1;
            }
            g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
            g.drawString("" + rand2, 26 * 2 + 6, 32);
            g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
            g.drawString("=", 26 * 3 + 6, 32);
            g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
            g.drawString("?", 26 * 4 + 6, 32);
            /* sRand = rand * 10 + rand1 + rand2;*/
            sRand = rand + rand2;
         /*   } else {
                // 减法
                // 第一个数据
                int rand = random.nextInt(10);
                if (rand == 0) {
                    rand = 1;
                }
                g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
                g.drawString("" + rand, 13 * 0 + 6, 16);
                //
               *//* int rand1 = random.nextInt(10);
                g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
                g.drawString("" + rand1, 13 * 1 + 6, 16);*//*
                // -号
                g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
                g.drawString("-", 13 * 1 + 6 + 3, 16);
                // 第二个数据
                int rand2 = random.nextInt(10);
                g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));// 调用函数出来的颜色相同，可能是因为种子太接近，所以只能直接生成
                g.drawString("" + rand2, 13 * 2 + 6, 16);
                sRand = rand  - rand2;
            }*/
            synchronized (this) {
                HttpSession session = request.getSession();
                session.setAttribute("rand", "" + sRand);
            }
            ImageIO.write(image, "jpg", response.getOutputStream());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /*生成验证码*/
    public Color getRandColor(int fc, int bc) {// 给定范围获得随机颜色
        Random random = new Random();
        if (fc > 255) {
            fc = 255;
        }
        if (bc > 255) {
            bc = 255;
        }
        int r = fc + random.nextInt(bc - fc);
        int g = fc + random.nextInt(bc - fc);
        int b = fc + random.nextInt(bc - fc);
        return new Color(r, g, b);
    }

    /*获取舆情分类*/
    @RequestMapping( "getNetwoorkTypes" )
    public EdatResult getNetwoorkTypes(HttpServletRequest request, HttpServletResponse response){
        try{
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "权限问题");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String keyword = data.getString("keyword");
            String sql="select distinct \"DICT_type\" from \"tb_network_news\" where \"DICT_type\" is not null";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Set<String> result = new HashSet<>();
            if(keyword.equals("")){
                for(Map map:list){
                    String[] tem = map.get("DICT_type").toString().split(",|，");
                    for(String str:tem){
                        result.add(str);
                        if(result.size()>4){
                            return EdatResult.ok(result);
                        }
                    }
                }
            }else{
                for(Map map:list){
                    String[] tem = map.get("DICT_type").toString().split(",|，");
                    for(String str:tem){
                        if(str.contains(keyword)){
                            result.add(str);
                            if(result.size()>4){
                                return EdatResult.ok(result);
                            }
                        }
                    }
                }
            }
            return EdatResult.ok(result);
        }catch (Exception e){
            return EdatResult.build(1,"fail");
        }
    }
    
    @Autowired
    private PortalLoginService portalLoginService;
    private String appkey = "TRHJPT";
    
    @Autowired
    private LogService logService;
    
    /**
     * @Author:renqiang
     * @Description:门户登录
     * @Date:17:20 2017/10/11
     */
    @RequestMapping("portalLogin")
    public EdatResult portalLogin(HttpServletRequest request,
                            HttpServletResponse response) {
        try {
        	LogFileUtil.appendLog("1.进入单点登录方法", true);
        	
            ClientUtil.SetCharsetAndHeader(request, response);
            
            HttpSession session = request.getSession();
            Map resultMap = new HashMap();
            List<Map> rights = new ArrayList<>();

            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String token = data.getOrDefault("token", "").toString();
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            if(!"".equals(token)){

            	//门户单点登录
            	LogFileUtil.appendLog("2.开始访问远程接口");
            	JSONObject authResult = portalLoginService.auth(token, appkey);
            	LogFileUtil.appendLog("3.远程接口返回结果"+authResult.toString());
            	if(authResult.containsKey("RESULT")){
            		String result = authResult.get("RESULT").toString();
            		if("true".equals(result)){
//            		if(!"true".equals(result)){//Test
            			String LOGNAME = "";//用户登录名
                		if(authResult.containsKey("LOGNAME")){
                			LOGNAME = authResult.get("LOGNAME").toString();
                		}
                		String USERNAME = "";//用户名称
                		if(authResult.containsKey("USERNAME")){
                			USERNAME = authResult.get("USERNAME").toString();
                		}
                		String UUID1 = "";//用户UUID
                		if(authResult.containsKey("UUID")){
                			UUID1 = authResult.get("UUID").toString();
                		}
                		String MAIL = "";//用户邮箱
                		if(authResult.containsKey("MAIL")){
                			MAIL = authResult.get("MAIL").toString();
                		}
                		
                		//获取用户信息，存入session
                		String sql = "select * from TBPUBUSER where EMAIL='"+MAIL+"'  and ISPORTALUSER='1'";
//                		String sql = "select * from TBPUBUSERC where USERID='"+3457+"'";//Test
                		List<Map> list = getBySqlMapper.findRecords(sql);
                		LogFileUtil.appendLog("4.seimp用户表查询结果："+list.size());
                		if(list.size()>0){
                			Map userMap = list.get(0);
                    		//获取用户信息
                			String userLevel = list.get(0).get("USERLEVEL")==null?"":list.get(0).get("USERLEVEL").toString();
                			String name = list.get(0).get("NAME") == null ? "" : list.get(0).get("NAME").toString();
                            String userName = list.get(0).get("USERNAME") == null ? "" : list.get(0).get("USERNAME").toString();
                            String regionCode = list.get(0).get("REGIONCODE") == null ? "" : list.get(0).get("REGIONCODE").toString();
                            String userID = list.get(0).get("USERID").toString();
                            
                            
                            //获取角色id和名称
                            String sql1 = "select T2.* from (select * from TBPUBUSERROLE where USERID = " + userID + ")T1 JOIN TBPUBROLE T2 ON T1.ROLEID = T2.ROLEID ";
                            List<Map> list1 = getBySqlMapper.findRecords(sql1);
                            LogFileUtil.appendLog("5.seimp查询角色结果："+list1.size());
                            if(list1.size()>0){
                            	Map map1 = list1.get(0);
                            	String roleId = list1.get(0).get("ROLEID") == null ? "" : list1.get(0).get("ROLEID").toString();
                                String roleName = list1.get(0).get("ROLENAME") == null ? "" : list1.get(0).get("ROLENAME").toString();
                                //存储
                                session.setAttribute("roleID", roleId);
                                
                                resultMap.put("roleID", roleId);
                                resultMap.put("roleName", roleName);
                                
                                //获取权限
                                rights = getRightsByRole(roleId);
                                
                                //获取权限信息
                                String sql2 = "select \"RIGHTID\" from \"TBPUBROLERIGHT\" where \"ROLEID\" = " + roleId;
                                List<Map> list2 = getBySqlMapper.findRecords(sql2);
                                LogFileUtil.appendLog("6.seimp查询权限结果："+list2.size());
                                List permi = new ArrayList();
                                for (Map map : list2) {
                                    permi.add(map.get("RIGHTID").toString());
                                }
                                if (permi.size() > 0) {
                                    session.setAttribute("rights", permi);
                                }
                            }else{
                            	return EdatResult.build(11, "该用户没有系统权限，请联系管理员！");
                            }
                            
                            //存储
                            session.setAttribute("isLogin", "true");
                            session.setAttribute("userLevel", userLevel);
                            session.setAttribute("name", name);
                            session.setAttribute("loginName", userName);
                            session.setAttribute("regionCode", regionCode);
                            session.setAttribute("userID", userID);
                            
                            resultMap.put("name", name);
                            resultMap.put("rights", rights);
                            resultMap.put("userID", userID);
                            resultMap.put("regionCode", regionCode);
                            resultMap.put("userLevel", userLevel);
                            
                            //记录日志
                            String currID = logToDb.addLog(request, "登录");
                            LogFileUtil.appendLog("7.开始向门户推送日志");
                            //往门户推送日志
                            String UUID2 = list.get(0).get("UUID") == null ? "" : list.get(0).get("UUID").toString();
                            JSONObject addDataResult = logService.addData(UUID2, name, userName, UserIPUtils.getIpAddress(request), "1", "登录成功", df.format(new Date()), currID);
                            LogFileUtil.appendLog("8.日志推送结果："+addDataResult.toString());
                            if(addDataResult.containsKey("RESULT")){
                            	if("true".equals(addDataResult.get("RESULT").toString())){
                            		LogFileUtil.appendLog("9.日志推送成功");
                            	}
                            }
                            
                            //存储登录信息到Redis
//                            DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            String  TOKEN_SALT = "Gistone2301";
                            String token1 = DigestUtils.md5DigestAsHex((userName+TOKEN_SALT).getBytes()) + "#" + UUID.randomUUID().toString();
                            JSONObject jsonObject=new JSONObject();
                            String Email = list.get(0).get("EMAIL") == null ? "" : list.get(0).get("EMAIL").toString();
                            jsonObject.put("username",userName);
                            jsonObject.put("regioncode",regionCode);
                            jsonObject.put("tel","");
                            jsonObject.put("email",Email);
                            jsonObject.put("logintime", df.format(new Date()));
                            jsonObject.put("updatetime", df.format(new Date()));
                            jsonObject.put("expiretime","");
                            jsonObject.put("loginip",request.getRemoteAddr());
                            jsonObject.put("auth","[{\"systemid\":\"portal\",\"authorcontext\":\"1,2,5,9,10\"},{\"systemid\":\"wrdk\",\"authorcontext\":\"15,20,21,22\"}]");
//                            session.setAttribute("token", jsonObject.toString());
                            resultMap.put("token", java.net.URLEncoder.encode(token1,"UTF-8"));//URLDecoder.decode(param, "utf-8");
                            redisRun(java.net.URLEncoder.encode(token1,"UTF-8"),jsonObject.toString());
                            LogFileUtil.appendLog("10.存储Redis内容成功");
                            
                            //记录token
                            session.setAttribute("token", java.net.URLEncoder.encode(token1,"UTF-8"));
                            LogFileUtil.appendLog("10.登陆成功");
                            return EdatResult.ok(resultMap);
                		}else{//无用户
                			LogFileUtil.appendLog("没有此用户");
                			return EdatResult.build(10, "没有此用户！");
                		}
            		}else{//门户登录 Rest返回 false
            			LogFileUtil.appendLog("登录失败！");
            			return EdatResult.build(10, "登录失败！");
            		}
            	}else{//门户登录失败
            		LogFileUtil.appendLog("门户单点登录未返回结果，登录失败！");
            		return EdatResult.build(10, "登录失败！");
            	}
            }else{
            	//token为空
            	LogFileUtil.appendLog("token不能为为空！");
            	return EdatResult.build(10, "token不能为为空！");
            }
        } catch (Exception e) {
            e.printStackTrace();
            LogFileUtil.appendLog("程序错误！");
            return EdatResult.build(1, "fail");
        }
    }
}