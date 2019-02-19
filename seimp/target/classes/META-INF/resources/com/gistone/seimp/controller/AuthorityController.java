package com.gistone.seimp.controller;

import java.awt.*;
import java.awt.image.BufferedImage;
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
import com.gistone.seimp.runner.TestRedis;
import com.gistone.seimp.service.CheckService;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.*;
import com.sun.org.apache.regexp.internal.RE;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import oracle.sql.CLOB;

import org.apache.catalina.util.URLEncoder;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

/**
 * 权限
 * ClassName: AuthorityController 
 * @author luowenbin
 * @date 2018年7月26日
 */
@RestController
@RequestMapping("authority")
@SuppressWarnings("all")
public class AuthorityController {


    Logger logger = Logger.getLogger(AuthorityController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    @Autowired
    private LogToDb logToDb;
    
    @Autowired
    private CheckService checkService;

    
    
    /**
     * 共享交换权限，树数据
     */
    @RequestMapping("getSETreeData")
    public EdatResult getSETreeData(HttpServletRequest request, HttpServletResponse response) {
        try {
        	ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "5,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            
            //一级菜单
            String sql1 = "select \"id\",\"name\" from \"tb_source_catalog\" " +
                    " where \"parent_id\" = 0 order by \"id\" asc";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            
            //二级菜单
            for (Map map1 : list1) {
                String sql2 = "select \"id\",\"name\" from \"tb_source_catalog\" " +
                        " where \"parent_id\" = '" + map1.get("id").toString() + "'  order by \"id\" asc";
                List<Map> list2 = getBySqlMapper.findRecords(sql2);
                if (list2.size() > 0) {
                	
                	//三级菜单
                    for (Map map2 : list2) {
                        String sql3 = "select \"id\",\"name\" from \"tb_source_catalog\" " +
                                " where \"parent_id\" = '" + map2.get("id").toString() + "'  order by \"id\" asc";
                        List<Map> list3 = getBySqlMapper.findRecords(sql3);
                        if (list3.size() > 0) {
                            map2.put("children", list3);
                        }

                    }
                    map1.put("children", list2);
                }

            }
            
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * 根据共享交换权限数据，获取数据集表格
     */
    @RequestMapping("getMetadataByCatalog")
    public Map getMetadataByCatalog(HttpServletRequest request, HttpServletResponse response) {
        try {
        	ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
            	Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            
            //接收参数
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String catalogID = data.getOrDefault("catalogID", "").toString();//菜单id
            String roleID = data.getOrDefault("roleID", "").toString();//角色id
            
            String sql1 = "";
            String sql2 = "";
            if("0".equals(catalogID)){
            	//全部数据集
            	sql1 = "select T1.\"id\",T1.\"name\",T2.ID READAUTH,T2.DOWNAUTH,T2.SELECTAUTH from \"tb_source_metadata\" T1 "
            			+ "left join \"T_ROLE_DATARIGHT\" T2 on T1.\"id\"=T2.\"RIGHTID\" and T2.\"ROLEID\"='" + roleID + "'";
            	sql2 = "select count(1) from \"tb_source_metadata\" ";
            	
            }else{
            	sql1 = "select T1.\"id\",T1.\"name\",T2.ID READAUTH,T2.DOWNAUTH,T2.SELECTAUTH from  ( select \"id\",\"name\",\"dataType\" from \"tb_source_metadata\" where \"dataType\" in ("
            			+ " select \"id\" from \"tb_source_catalog\" where \"id\"='" + catalogID + "' or \"parent_id\"='" + catalogID + "'"
            			+ " union all "
            			+ "	select \"id\" from \"tb_source_catalog\" where \"parent_id\" in ("
            				+ "select \"id\" from \"tb_source_catalog\" where \"parent_id\"='" + catalogID + "'"
            				+ ")"
            			+ ") )T1 "
            			+ "left join \"T_ROLE_DATARIGHT\" T2 on T1.\"id\"=T2.\"RIGHTID\" and T2.\"ROLEID\"='" + roleID + "'";
            	sql2 = "select count(1) from \"tb_source_metadata\" where \"dataType\" in ("
            			+ " select \"id\" from \"tb_source_catalog\" where \"id\"='" + catalogID + "' or \"parent_id\"='" + catalogID + "'"
            			+ " union all "
            			+ "	select \"id\" from \"tb_source_catalog\" where \"parent_id\" in ("
            				+ "select \"id\" from \"tb_source_catalog\" where \"parent_id\"='" + catalogID + "'"
            				+ ")"
            			+ ") ";
            }
            
            List<Map> list = getBySqlMapper.findRecords(sql1);
            Integer total = getBySqlMapper.findrows(sql2);
            
            Map result = new HashMap();
            result.put("rows", list);
            result.put("total", total);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * @Description:添加角色
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
            /*一张图数据权限*/
            String rights1 = data.getString("rights1");//权限
            //共享交换数据权限
            String rights2 = data.getOrDefault("rights2", "").toString();
            
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
                    String sql2 = "INSERT INTO TB_ROLE_YZTRIGHT(ID, ROLEID, RIGHTID) VALUES (TB_ROLE_YZTRIGHT_SEQ.nextval," +
                            roleID + "," + arr[j] + ")";
                    getBySqlMapper.insert(sql2);
                }
            }
            
            
            if(rights2.length()>0){
            	JSONArray rightsArr = JSONArray.fromObject(rights2);
            	for (int i = 0; i < rightsArr.size(); i++) {
            		JSONObject currObj = rightsArr.getJSONObject(i);
            		//下载权限
            		String downAuth = "";
            		if("1".equals(currObj.getString("DOWN"))){
            			downAuth = "1";
            		}
            		//查询权限
            		String selectAuth = "";
            		if("1".equals(currObj.getString("SELECT"))){
            			selectAuth = "1";
            		}
            		String sql2 = "INSERT INTO T_ROLE_DATARIGHT(ID, ROLEID, RIGHTID, DOWNAUTH, SELECTAUTH) VALUES (T_ROLE_DATARIGHT_SEQ.nextval," +
                            roleID + "," + currObj.getString("id") + ",'" + downAuth + "','" + selectAuth + "')";
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
     * @Description:修改角色信息
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
            /*一张图权限*/
            String rights1 = data.getString("rights1");
            //共享交换数据权限
            String rights2 = data.getOrDefault("rights2", "").toString();
            
            String sql = "update tbPubRole set roleName = '" + roleName + "',comments = '" + comments + "',updateTime = sysdate,author='" + userID + "' where roleID = " + roleID;
            getBySqlMapper.update(sql);
            String sql1 = "delete from tbPubRoleRight where roleId = " + roleID;
            getBySqlMapper.delete(sql1);
            String sql3 = "delete from TB_ROLE_YZTRIGHT where ROLEID = " + roleID;
            getBySqlMapper.delete(sql3);
            
            String sql4 = "delete from T_ROLE_DATARIGHT where ROLEID = " + roleID;
            getBySqlMapper.delete(sql4);
            
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
                    String sql2 = "INSERT INTO TB_ROLE_YZTRIGHT(\"ID\", \"ROLEID\", \"RIGHTID\") VALUES (TB_ROLE_YZTRIGHT_SEQ.nextval," +
                            roleID + "," + arr[j] + ")";
                    getBySqlMapper.insert(sql2);
                }
            }
            if(rights2.length()>0){
            	JSONArray rightsArr = JSONArray.fromObject(rights2);
            	for (int i = 0; i < rightsArr.size(); i++) {
            		JSONObject currObj = rightsArr.getJSONObject(i);
            		String downAuth = "";
            		String selectAuth = "";
            		if("1".equals(currObj.getString("DOWN"))){
            			downAuth = "1";
            		}
            		if("1".equals(currObj.getString("SELECT"))){
            			selectAuth = "1";
            		}
            		String sql2 = "INSERT INTO T_ROLE_DATARIGHT(ID, ROLEID, RIGHTID, DOWNAUTH, SELECTAUTH) VALUES (T_ROLE_DATARIGHT_SEQ.nextval," +
                            roleID + "," + currObj.getString("id") + ",'" + downAuth + "','" + selectAuth + "')";
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
     * @Description:获取所有一张图数据权限树
     */
    @RequestMapping("getAllYztRights")
    public EdatResult getAllYztRights(HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            
            //查询所有有效权限
            //一级菜单
            String sql = "SELECT ID \"id\",NAME \"name\" FROM TB_YZTRIGHT where PARENTID = 0 order by ID";
            List<Map> list = getBySqlMapper.findRecords(sql);
            for (Map map : list) {
            	
            	//二级菜单
                String sql1 = "SELECT ID \"id\",NAME \"name\" FROM TB_YZTRIGHT where PARENTID =" + map.get("id").toString() + "order by ID";
                List<Map> list1 = getBySqlMapper.findRecords(sql1);
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

            //功能权限
            String sql1 = "select * from tbPubRole where ROLEID = " + roleID;
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            String rights = "";
            for (Map map : list) {
                rights += map.get("RIGHTID").toString() + ",";
            }
            if (rights.length() > 0) {
                rights = rights.substring(0, rights.length() - 1);
            }
            
            //一张图数据权限
            String sql3 = "select * from TB_ROLE_YZTRIGHT where ROLEID = " + roleID;
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
     * 获取权限，不验证权限，只验证是否登录
     * 根据权限，生成一级菜单、二级菜单、一张图图层列表
     */
    @RequestMapping("getMenus")
    public EdatResult getMenus(HttpServletRequest request,
                               HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = checkService.checkIsLogin(request);
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            String part = data.getOrDefault("partID", "").toString();
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
            
            //一张图权限
            List right2 = new ArrayList();
            String sqlStr = "select RIGHTID from TB_ROLE_YZTRIGHT where ROLEID = '" + roleID + "'";
            List<Map> yztList = getBySqlMapper.findRecords(sqlStr);
            for (Map map : yztList) {
				if(map.containsKey("RIGHTID")){
					right2.add(map.get("RIGHTID").toString());
				}
			}
            
            Map resultMap = new HashMap();
            //功能权限
            resultMap.put("right1", result);
            //一张图数据权限
            resultMap.put("right2", right2);
            return EdatResult.ok(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    
}