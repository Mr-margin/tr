package com.gistone.seimp.controller;


import com.alibaba.druid.util.StringUtils;
import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.*;
//import com.google.zxing.Result;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;









import net.sf.json.JSONObject;
import oracle.jdbc.OracleTypes;
import oracle.jdbc.driver.OracleConnection;
import oracle.sql.CLOB;

import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.bson.Document;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.annotation.PostConstruct;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.*;
import java.sql.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

/**
 * @Author:renqiang
 * @Description: Created by soil-pc2 on 2017/10/13.
 */

@SuppressWarnings("all")
@RestController
@RequestMapping( "news" )
public class NewsController {


    Logger logger = Logger.getLogger(UserController.class);

    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private UrlsUtil urlUtil;
    @Autowired
    private LogToDb logToDb;

    /*图片后缀*/
    private static String[] extensionPermit = {"gif", "jpg", "jpeg", "png", "bmp"};

    @Value( "${spring.datasource.driver-class-name}" )
    String driver;
    @Value( "${spring.datasource.url}" )
    String strUrl;
    @Value( "${spring.datasource.username}" )
    String databaseUserame;
    @Value( "${spring.datasource.password}" )
    String databasePwd;


    /**
     * @Author:renqiang
     * @Description:添加资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "addNews" )
    public EdatResult addNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userName = (String) session.getAttribute("loginName");//用户ID
            String title = data.getString("title").trim();//标题
            String type = data.getString("type");//类别
            String content = data.getString("content");//内容
            String author = data.getString("author").trim();//作者
            String source = data.getString("source").trim();//来源
            String time = data.getString("date");//抓取时间
            String keyword = data.getString("keyword").replaceAll(" ", "");//关键词
            String checker = data.getString("checker");//校核
            String regionCode = data.getString("regionCode");//行政区划
            String ministry = data.getString("ministry");//部委
            String top = "1";
            if (data.has("top") && !data.getString("top").equals("")) {
                top = data.getString("top");//是否置顶(0置顶)
            }
            String fileNumber = "";
            Date date = new Date();
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            if (fileNumber.equals("")) {
                fileNumber = df.format(date) + "_" + new Random().nextInt(1000);//时间戳+随机数
            }
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            /*
            Statement stmt = null;
            ResultSet rs = null;
            Connection conn = null;
            CallableStatement cstmt = null;
            try {
                Class.forName(driver);
                conn = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                CallableStatement proc = null; //创建执行存储过程的对象
                proc = conn.prepareCall("{ call INSERTNEWS(?,?,?,?,?,?,?,?,?,?,?,?,?,?) }"); //设置存储过程 call为关键字.
                //  proc.setString(1, "NEWS_SEQ.nextval"); //设置第一个输入参数
                proc.setString(1, title);//
                proc.setString(2, type);//
                proc.setString(3, author);//
                proc.setString(4, source);//
                proc.setString(5, fileNumber);//
                proc.setString(6, userName);//
                proc.setString(7, time);//
                proc.setString(8, regionCode);//
                proc.setString(9, top);//
                CLOB clob = new CLOB((OracleConnection) conn);
                clob = oracle.sql.CLOB.createTemporary((OracleConnection) conn, true, 1);
                clob.setString(1, content);
                proc.setClob(10, clob);//
                proc.setString(11, keyword);//
                proc.setString(12, checker);//
                proc.setString(13, ministry);//
                proc.registerOutParameter(14, OracleTypes.INTEGER);//
                proc.execute();//执行
                int id = proc.getInt(14);
                logToDb.addLog(request, "添加资讯[ID:" + id + "]");
                return EdatResult.ok(fileNumber);
            } catch (SQLException ex2) {
                ex2.printStackTrace();
                return EdatResult.build(1, "fail");
            } catch (Exception ex2) {
                ex2.printStackTrace();
                return EdatResult.build(1, "fail");
            } finally {
                try {
                    if (rs != null) {
                        rs.close();
                        if (stmt != null) {
                            stmt.close();
                        }
                        if (conn != null) {
                            conn.close();
                        }
                    }
                } catch (SQLException ex1) {
                }
            }*/
            
          //20180926修改
            //操作CLOB的第二种方式
            Writer outStream = null;
            Connection con = null;
            ResultSet rs2 = null;
            String ID = null;
            
            try {
            	//获取id
            	String selectId = "select NEWS_SEQ.nextval ID from dual";
            	List<Map> Idlist = getBySqlMapper.findRecords(selectId);
            	ID = Idlist.get(0).get("ID").toString();
            	
            	
            	Class.forName(driver);
                con = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                con.setAutoCommit(false);
                Statement st = con.createStatement();
                //插入一个空对象empty_clob()，这个是必须的

                String insertSql = "INSERT INTO \"TBNEWS\" (\"ID\", \"TITLE\", \"TYPE\", \"AUTHOR\", \"SOURCE\",  \"FILENUMBER\","
                		+ " \"EDITOR\", \"WRITEDATE\",\"UPDATETIME\",REGIONCODE,\"TOP\", \"STATE\",\"CONTENT\","
                		+ " \"HITS\",KEYWORD,CHECKER,SOURCETYPE,MINISTRY) VALUES ("+ID+","
                		+ " '"+title+"', '"+type+"', '"+author+"', '"+source+"', '"+fileNumber+"','"+userName+"', TO_DATE('"+time+"', 'SYYYY-MM-DD HH24:MI:SS'),"
                		+ "SYSDATE,'"+regionCode+"', '"+top+"', '0',empty_clob(),'0','"+keyword+"','"+checker+"','1','"+ministry+"')";
                st.execute(insertSql);
                //锁定数据行进行更新，注意“for update”语句,这里不用for update锁定不可以插入clob
                rs2 = st.executeQuery("select CONTENT from TBNEWS where ID="+ID+" for update");
                if (rs2.next()){
                	//得到java.sql.Clob对象后强制转换为oracle.sql.CLOB
                	oracle.sql.CLOB clob2 = (oracle.sql.CLOB) rs2.getClob(1);
//                	outStream = clob2.getCharacterOutputStream();
                	outStream = clob2.setCharacterStream(1);
                	//data是传入的字符串，定义：String data
                	char[] c = content.toCharArray();
//                	outStream.write(c, 0, c.length);
                	
                	int len = 5000;
//                	System.out.println(c.length);
                	for (int i = 0; i <= c.length/len; i++) {
                		char[] copyOfRange = null;
                		if(i*len+len <= c.length-1){
                			copyOfRange = Arrays.copyOfRange(c, i*len, i*len+len);
                		}else{
                			copyOfRange = Arrays.copyOfRange(c, i*len, c.length);
                		}
//						System.out.println(copyOfRange);
						outStream.write(copyOfRange, 0, copyOfRange.length);
						outStream.flush();
					}
                }
                //提交事务
                con.commit();
			} catch (Exception e) {
				e.printStackTrace();
				if(rs2 != null){
                	rs2.close();
                }
                if(outStream != null){
//                	outStream.flush();
                	outStream.close();
                }
                if(con != null){
                	 // 发生异常，回滚在本事务中的操做
                	con.rollback();
                	con.close();
                }
				return EdatResult.build(1, "fail");
			} finally{
				if(rs2 != null){
                	rs2.close();
                }
                if(outStream != null){
//                	outStream.flush();
                	outStream.close();
                }
                if(con != null){
                	con.close();
                }
			}
            
            logToDb.addLog(request, "添加资讯[ID:" + ID + "]");
            return EdatResult.ok(fileNumber);
            
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:修改资讯
     * @Date:17:20 2017/10/11
     */
    
	@RequestMapping( "modifyNews" )
    public EdatResult modifyNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userName = (String) session.getAttribute("loginName");
            String ID = data.getString("newsID");//资讯ID
            String title = data.getString("title").trim();//标题
            String type = data.getString("type");//类别
            String content = data.getString("content");//内容
            String time = data.getString("date");//
            String top = data.getString("top");//
            String source = data.getString("source").trim();//来源
            String author = data.getString("author").trim();//
            String keyword = data.getString("keyword").replaceAll(" ", "");//
            String checker = data.getString("checker");//
            String regionCode = data.getString("regionCode");//行政区划
            String ministry = data.getString("ministry");//部委
            if (ministry == null) {
                ministry = "";
            }
            Date date = new Date();
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql2 = "select * from tbNews where ID = " + ID;
            List<Map> list = getBySqlMapper.findRecords(sql2);
            String picNumber = "";
            if (list.size() > 0) {
                picNumber = list.get(0).get("FILENUMBER") == null ? "" : list.get(0).get("FILENUMBER").toString();
                if (picNumber.equals("")) {
                    picNumber = df.format(date) + "_" + new Random().nextInt(1000);//时间戳+随机数
                }
            }
            Statement stmt = null;
            ResultSet rs = null;
            Connection conn = null;
            CallableStatement cstmt = null;
            
            //clob第二种操作方式
            Writer outStream = null;
            Connection con = null;
            ResultSet rs2 = null;
            
            PreparedStatement pst = null;
            try {
                String sql1 = "select * from tbNews  where id =" + ID;
                Map map = getBySqlMapper.findRecords(sql1).get(0);
                if (map.get("STATE").toString().equals("0") && map.get("CHECKSTATE") != null && map.get("CHECKSTATE").toString().equals("0")) {
                    String type1 = map.get("TYPE") == null ? "" : map.get("TYPE").toString();
                    String keyword1 = map.get("KEYWORD") == null ? "" : map.get("KEYWORD").toString();
                    if (type1.equals("1")) {
                        String ministry1 = map.get("MINISTRY") == null ? "" : map.get("MINISTRY").toString();
                        if (keyword1.equals("") || ministry1.equals("")) {

                        } else {
                            String[] arr1 = keyword1.split(",|，");
                            for (String str : arr1) {
                                String sql3 = "select * from \"tb_keyword\" where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "' AND  \"ministry_type\" = " + ministry1;
                                List<Map> list1 = getBySqlMapper.findRecords(sql3);
                                if (list1.size() > 0 && Integer.parseInt(list1.get(0).get("num").toString()) <= 1) {
                                    String sql4 = "delete from  \"tb_keyword\"  where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "' AND  \"ministry_type\" = " + ministry1;
                                    getBySqlMapper.delete(sql4);
                                } else {
                                    String sql4 = "update \"tb_keyword\" set \"num\"=\"num\"-1 where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "' AND  \"ministry_type\" = " + ministry1;
                                    getBySqlMapper.update(sql4);
                                }
                            }
                        }
                    } else if (type1.equals("2") || type1.equals("3")) {
                        String[] arr1 = keyword1.split(",|，");
                        for (String str : arr1) {
                            String sql3 = "select * from \"tb_keyword\" where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "'";
                            List<Map> list1 = getBySqlMapper.findRecords(sql3);
                            if (list1.size() > 0 && list1.get(0).get("num").equals("1")) {
                                String sql4 = "delete from  \"tb_keyword\"  where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "'";
                                getBySqlMapper.delete(sql4);
                            } else {
                                String sql4 = "update \"tb_keyword\" set \"num\"=\"num\"-1 where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "'";
                                getBySqlMapper.update(sql4);
                            }
                        }
                    }
                }
                
                /*
                Class.forName(driver);
                conn = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                CallableStatement proc = null; //创建执行存储过程的对象
                proc = conn.prepareCall("{ call UPDATENEWS(?,?,?,?,?,?,?,?,?,?,?,?,?) }"); //设置存储过程 call为关键字.
                //  proc.setString(1, "NEWS_SEQ.nextval"); //设置第一个输入参数
                proc.setString(1, title);//
                proc.setString(2, type);//
                proc.setString(3, author);//
                proc.setString(4, source);//
                proc.setString(5, userName);//
                proc.setString(6, time);//
                proc.setString(7, regionCode);//
                proc.setString(8, top);//
                CLOB clob = new CLOB((OracleConnection) conn);
                clob = oracle.sql.CLOB.createTemporary((OracleConnection) conn, true, 1);
                System.err.println(content);
//                clob.setString(1, content);
                clob.putString(1, content);
                proc.setClob(9, clob);//
                proc.setString(10, ID);//
                proc.setString(11, keyword);//
                proc.setString(12, checker);//
                proc.setString(13, ministry);//
                proc.execute();//执行
                */
                
                //20180926修改
                //操作CLOB的第二种方式
                Class.forName(driver);
                con = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                con.setAutoCommit(false);
                Statement st = con.createStatement();
                //插入一个空对象empty_clob()，这个是必须的
                String updateSql = "UPDATE \"TBNEWS\" SET \"TITLE\"='"+title+"', \"TYPE\"='"+type+"', \"AUTHOR\"='"+author+"', \"SOURCE\"='"+source+"', "
                		+"\"EDITOR\"='"+userName+"', \"WRITEDATE\"=TO_DATE('"+time+"', 'SYYYY-MM-DD HH24:MI:SS'), UPDATETIME = sysdate,"
                		+ "REGIONCODE= '"+regionCode+"',\"TOP\"='"+top+"', \"CONTENT\"=empty_clob() ,\"CHECKSTATE\"=NULL,KEYWORD = '"+keyword+"',"
                		+ "CHECKER = '"+checker+"',MINISTRY = '"+ministry+"' "
                		+ "WHERE ID = '"+ID+"'";
                st.execute(updateSql);
                //锁定数据行进行更新，注意“for update”语句,这里不用for update锁定不可以插入clob
                rs2 = st.executeQuery("select CONTENT from TBNEWS where ID="+ID+" for update");
                if (rs2.next()){
                	//得到java.sql.Clob对象后强制转换为oracle.sql.CLOB
                	oracle.sql.CLOB clob2 = (oracle.sql.CLOB) rs2.getClob(1);
//                	outStream = clob2.getCharacterOutputStream();
                	outStream = clob2.setCharacterStream(1);
                	//data是传入的字符串，定义：String data
                	char[] c = content.toCharArray();
//                	outStream.write(c, 0, c.length);
                	
                	int len = 5000;
//                	System.out.println(c.length);
                	for (int i = 0; i <= c.length/len; i++) {
                		char[] copyOfRange = null;
                		if(i*len+len <= c.length-1){
                			copyOfRange = Arrays.copyOfRange(c, i*len, i*len+len);
                		}else{
                			copyOfRange = Arrays.copyOfRange(c, i*len, c.length);
                		}
//						System.out.println(copyOfRange);
						outStream.write(copyOfRange, 0, copyOfRange.length);
						outStream.flush();
					}
                }
                //提交事务
                if(con != null){
                	con.commit();
                }
                
                /*
                Class.forName(driver);
                con = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
//                con.setAutoCommit(false);
                Statement st = con.createStatement();
                //插入一个空对象empty_clob()，这个是必须的
                String updateSql = "UPDATE \"TBNEWS\" SET \"TITLE\"='"+title+"', \"TYPE\"='"+type+"', \"AUTHOR\"='"+author+"', \"SOURCE\"='"+source+"', "
                		+"\"EDITOR\"='"+userName+"', \"WRITEDATE\"=TO_DATE('"+time+"', 'SYYYY-MM-DD HH24:MI:SS'), UPDATETIME = sysdate,"
                		+ "REGIONCODE= '"+regionCode+"',\"TOP\"='"+top+"', \"CONTENT\"=empty_clob() ,\"CHECKSTATE\"=NULL,KEYWORD = '"+keyword+"',"
                		+ "CHECKER = '"+checker+"',MINISTRY = '"+ministry+"' "
                		+ "WHERE ID = '"+ID+"'";
                st.execute(updateSql);
                //锁定数据行进行更新，注意“for update”语句,这里不用for update锁定不可以插入clob
                String updateSql2 = "update TBNEWS SET \"CONTENT\"=? where ID="+ID+"";
                oracle.jdbc.OraclePreparedStatement pst1 = (oracle.jdbc.OraclePreparedStatement)con.prepareStatement(updateSql2);
                pst1.setStringForClob(1, content);
                pst1.executeUpdate();
                */
                
                
                logToDb.addLog(request, "修改资讯[ID:" + ID + "]");
                return EdatResult.ok(picNumber);
            }  catch (Exception ex2) {
                ex2.printStackTrace();
                if(rs2 != null){
                	rs2.close();
                }
                if(outStream != null){
//                	outStream.flush();
                	outStream.close();
                }
                if(con != null){
                	//异常、事务回滚
                	con.rollback();
                	con.close();
                }
                return EdatResult.build(1, "fail");
            } finally {
                try {
                    /*if (rs != null) {
                        rs.close();
                    }
                    if (stmt != null) {
                        stmt.close();
                    }
                    if (conn != null) {
                        conn.close();
                    }*/
                    if(rs2 != null){
                    	rs2.close();
                    }
                    if(outStream != null){
//                    	outStream.flush();
                    	outStream.close();
                    }
                    if(con != null){
                    	con.close();
                    }
                    
                   
                    

                } catch (SQLException ex1) {
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * @Description:修改资讯并审核通过
     */
    @RequestMapping( "modifyNewsAndPass" )
    public EdatResult modifyNewsAndPass(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userName = (String) session.getAttribute("loginName");
            String ID = data.getString("newsID");//资讯ID
            String title = data.getString("title").trim();//标题
            String type = data.getString("type");//类别
            String content = data.getString("content");//内容
            String time = data.getString("date");//
            String top = data.getString("top");//
            String source = data.getString("source").trim();//来源
            String author = data.getString("author").trim();//
            String keyword = data.getString("keyword").replaceAll(" ", "");//
            String checker = data.getString("checker");//
            String regionCode = data.getString("regionCode");//行政区划
            String ministry = data.getString("ministry");//部委
            if (ministry == null) {
                ministry = "";
            }
            
            //验证数据
            if (type == null || type.equals("")) {
                return EdatResult.build(1, "未选择资讯类型");
            }
            if (type.equals("1") && (ministry == null || ministry.equals(""))) {
                return EdatResult.build(1, "部委动态未选择部委");
            }
            if (type.equals("2") && (regionCode == null || regionCode.equals(""))) {
                return EdatResult.build(1, "地方动态未选择行政区划");
            }
            
            Date date = new Date();
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql2 = "select * from tbNews where ID = " + ID;
            List<Map> list = getBySqlMapper.findRecords(sql2);
            //生成文件字符串
            String picNumber = "";
            if (list.size() > 0) {
                picNumber = list.get(0).get("FILENUMBER") == null ? "" : list.get(0).get("FILENUMBER").toString();
                if (picNumber.equals("")) {
                    picNumber = df.format(date) + "_" + new Random().nextInt(1000);//时间戳+随机数
                }
            }
            
            Statement stmt = null;
            ResultSet rs = null;
            Connection conn = null;
            CallableStatement cstmt = null;
            
            //clob第二种操作方式
            Writer outStream = null;
            Connection con = null;
            ResultSet rs2 = null;
            
            PreparedStatement pst = null;
            try {
                String sql1 = "select * from tbNews  where id =" + ID;
                Map map = getBySqlMapper.findRecords(sql1).get(0);
                if (map.get("STATE").toString().equals("0") && map.get("CHECKSTATE") != null && map.get("CHECKSTATE").toString().equals("0")) {
                	//信息类别
                    String type1 = map.get("TYPE") == null ? "" : map.get("TYPE").toString();
                	//关键词
                    String keyword1 = map.get("KEYWORD") == null ? "" : map.get("KEYWORD").toString();
                    //处理关键词数据的数量
                    if (type1.equals("1")) {
                    	//部委
                        String ministry1 = map.get("MINISTRY") == null ? "" : map.get("MINISTRY").toString();
                        if (keyword1.equals("") || ministry1.equals("")) {

                        } else {
                            String[] arr1 = keyword1.split(",|，");
                            for (String str : arr1) {
                                String sql3 = "select * from \" \" where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "' AND  \"ministry_type\" = " + ministry1;
                                List<Map> list1 = getBySqlMapper.findRecords(sql3);
                                if (list1.size() > 0 && Integer.parseInt(list1.get(0).get("num").toString()) <= 1) {
                                    String sql4 = "delete from  \"tb_keyword\"  where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "' AND  \"ministry_type\" = " + ministry1;
                                    getBySqlMapper.delete(sql4);
                                } else {
                                    String sql4 = "update \"tb_keyword\" set \"num\"=\"num\"-1 where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "' AND  \"ministry_type\" = " + ministry1;
                                    getBySqlMapper.update(sql4);
                                }
                            }
                        }
                    } else if (type1.equals("2") || type1.equals("3")) {
                        String[] arr1 = keyword1.split(",|，");
                        for (String str : arr1) {
                            String sql3 = "select * from \"tb_keyword\" where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "'";
                            List<Map> list1 = getBySqlMapper.findRecords(sql3);
                            if (list1.size() > 0 && list1.get(0).get("num").equals("1")) {
                                String sql4 = "delete from  \"tb_keyword\"  where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "'";
                                getBySqlMapper.delete(sql4);
                            } else {
                                String sql4 = "update \"tb_keyword\" set \"num\"=\"num\"-1 where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type1 + "'";
                                getBySqlMapper.update(sql4);
                            }
                        }
                    }
                }
                /*
                Class.forName(driver);
                conn = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                CallableStatement proc = null; //创建执行存储过程的对象
                proc = conn.prepareCall("{ call UPDATENEWS(?,?,?,?,?,?,?,?,?,?,?,?,?) }"); //设置存储过程 call为关键字.
                //  proc.setString(1, "NEWS_SEQ.nextval"); //设置第一个输入参数
                proc.setString(1, title);//
                proc.setString(2, type);//
                proc.setString(3, author);//
                proc.setString(4, source);//
                proc.setString(5, userName);//
                proc.setString(6, time);//
                proc.setString(7, regionCode);//
                proc.setString(8, top);//
                CLOB clob = new CLOB((OracleConnection) conn);
                clob = oracle.sql.CLOB.createTemporary((OracleConnection) conn, true, 1);
//                clob.setString(1, content);
                clob.putString(1, content);
                proc.setClob(9, clob);//
                proc.setString(10, ID);//
                proc.setString(11, keyword);//
                proc.setString(12, checker);//
                proc.setString(13, ministry);//
                proc.execute();//执行
                */
                
              //20180926修改
                //操作CLOB的第二种方式
                try {
                	Class.forName(driver);
                    con = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                    con.setAutoCommit(false);
                    Statement st = con.createStatement();
                    //插入一个空对象empty_clob()，这个是必须的
                    String updateSql = "UPDATE \"TBNEWS\" SET \"TITLE\"='"+title+"', \"TYPE\"='"+type+"', \"AUTHOR\"='"+author+"', \"SOURCE\"='"+source+"', "
                    		+"\"EDITOR\"='"+userName+"', \"WRITEDATE\"=TO_DATE('"+time+"', 'SYYYY-MM-DD HH24:MI:SS'), UPDATETIME = sysdate,"
                    		+ "REGIONCODE= '"+regionCode+"',\"TOP\"='"+top+"', \"CONTENT\"=empty_clob() ,\"CHECKSTATE\"=NULL,KEYWORD = '"+keyword+"',"
                    		+ "CHECKER = '"+checker+"',MINISTRY = '"+ministry+"' "
                    		+ "WHERE ID = '"+ID+"'";
                    st.execute(updateSql);
                    //锁定数据行进行更新，注意“for update”语句,这里不用for update锁定不可以插入clob
                    rs2 = st.executeQuery("select CONTENT from TBNEWS where ID="+ID+" for update");
                    if (rs2.next()){
                    	//得到java.sql.Clob对象后强制转换为oracle.sql.CLOB
                    	oracle.sql.CLOB clob2 = (oracle.sql.CLOB) rs2.getClob(1);
//                    	outStream = clob2.getCharacterOutputStream();
                    	outStream = clob2.setCharacterStream(1);
                    	//data是传入的字符串，定义：String data
                    	char[] c = content.toCharArray();
//                    	outStream.write(c, 0, c.length);
                    	
                    	int len = 5000;
//                    	System.out.println(c.length);
                    	for (int i = 0; i <= c.length/len; i++) {
                    		char[] copyOfRange = null;
                    		if(i*len+len <= c.length-1){
                    			copyOfRange = Arrays.copyOfRange(c, i*len, i*len+len);
                    		}else{
                    			copyOfRange = Arrays.copyOfRange(c, i*len, c.length);
                    		}
//    						System.out.println(copyOfRange);
    						outStream.write(copyOfRange, 0, copyOfRange.length);
    						outStream.flush();
    					}
                    }
                    if(con != null){
                    	con.commit();
                    }
				} catch (Exception e) {
					if(rs2 != null){
                    	rs2.close();
                    }
                    if(outStream != null){
                    	outStream.close();
                    }
                    if(con != null){
                    	//事务回滚
                    	con.rollback();
                    	con.close();
                    }
					return EdatResult.build(1, "fail");
				} finally{
					if(rs2 != null){
                    	rs2.close();
                    }
                    if(outStream != null){
//                    	outStream.flush();
                    	outStream.close();
                    }
                    if(con != null){
                    	con.close();
                    }
				}
                
                
                //审核通过
                //资讯类型
                //关键词
                //处理关键词表数据tb_keyword
                if (type.equals("1")) {
                	//部委
                    if (!keyword.equals("")) {
                        String[] arr1 = keyword.split(",|，");
                        for (String str : arr1) {
                            if (!str.equals("")) {
                                String sql12 = "MERGE INTO \"tb_keyword\" T1 USING (SELECT 1 FROM dual) T2 ON ( T1.\"word\" = '" + str.trim() + "' AND T1.\"news_type\" ='" + type + "' AND  T1.\"ministry_type\" = " + ministry + ") " + "WHEN MATCHED THEN UPDATE SET T1.\"num\" = T1.\"num\"+1 " + "WHEN NOT MATCHED THEN INSERT (\"word\", \"num\", \"news_type\",\"ministry_type\")" + "VALUES('" + str.trim() + "', 1,'" + type + "'," + ministry + ")";
                                getBySqlMapper.insert(sql12);
                            }
                        }
                    }
                } else if (type.equals("2") || type.equals("3")) {
                    String[] arr1 = keyword.split(",|，");
                    for (String str : arr1) {
                        if (!str.equals("")) {
                            String sql12 = "MERGE INTO \"tb_keyword\" T1 USING (SELECT 1 FROM dual) T2 ON ( T1.\"word\" = '" + str.trim() + "' AND T1.\"news_type\" ='" + type + "') " + "WHEN MATCHED THEN UPDATE SET T1.\"num\" = T1.\"num\"+1 " + "WHEN NOT MATCHED THEN INSERT (\"word\", \"num\", \"news_type\")" + "VALUES('" + str.trim() + "', 1,'" + type + "')";
                            getBySqlMapper.insert(sql12);
                        }
                    }
                }
                String sql = "update tbNews set checkState='0'  where id = " + ID;
                getBySqlMapper.update(sql);
                
                logToDb.addLog(request, "修改并审核通过资讯[ID:" + ID + "]");
                return EdatResult.ok(picNumber);
            } catch (SQLException ex2) {
                ex2.printStackTrace();
                return EdatResult.build(1, "fail");
            } catch (Exception ex2) {
                ex2.printStackTrace();
                return EdatResult.build(1, "fail");
            } finally {
            	try {
            		/*if (rs != null) {
                    rs.close();
                }
                if (stmt != null) {
                    stmt.close();
                }
                if (conn != null) {
                    conn.close();
                }*/
				} catch (Exception e) {
					// TODO: handle exception
				}
            }
            
            
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:修改资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "deleteNews" )
    public synchronized EdatResult deleteNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userName = (String) session.getAttribute("loginName");//用户名
            String newsIDs = data.getString("newsIDs");//新闻id
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql1 = "select * from tbNews  where id =" + newsID;
                Map map = getBySqlMapper.findRecords(sql1).get(0);
                //state为0，checkState为0
                if (map.get("STATE").toString().equals("0") && map.get("CHECKSTATE") != null && map.get("CHECKSTATE").toString().equals("0")) {
                    String type = map.get("TYPE") == null ? "" : map.get("TYPE").toString();//类型
                    String keyword = map.get("KEYWORD") == null ? "" : map.get("KEYWORD").toString();//关键词
                    if (type.equals("1")) {
                        String ministry = map.get("MINISTRY") == null ? "" : map.get("MINISTRY").toString();//部委
                        if (keyword.equals("") || ministry.equals("")) {
//                            continue;
                        }else{
	                        String[] arr1 = keyword.split(",|，");
	                        for (String str : arr1) {
	                            String sql3 = "select * from \"tb_keyword\" where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type + "' AND  \"ministry_type\" = " + ministry;
	                            List<Map> list = getBySqlMapper.findRecords(sql3);
	                            if (list.size() > 0 && Integer.parseInt(list.get(0).get("num").toString()) <= 1) {
	                                String sql4 = "delete from  \"tb_keyword\"  where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type + "' AND  \"ministry_type\" = " + ministry;
	                                getBySqlMapper.delete(sql4);
	                            } else {
	                                String sql4 = "update \"tb_keyword\" set \"num\"=\"num\"-1 where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type + "' AND  \"ministry_type\" = " + ministry;
	                                getBySqlMapper.update(sql4);
	                            }
	                        }
                        }
                    } else if (type.equals("2") || type.equals("3")) {
                        String[] arr1 = keyword.split(",|，");
                        for (String str : arr1) {
                            String sql3 = "select * from \"tb_keyword\" where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type + "'";
                            List<Map> list = getBySqlMapper.findRecords(sql3);
                            if (list.size() > 0 && list.get(0).get("num").equals("1")) {
                                String sql4 = "delete from  \"tb_keyword\"  where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type + "'";
                                getBySqlMapper.delete(sql4);
                            } else {
                                String sql4 = "update \"tb_keyword\" set \"num\"=\"num\"-1 where \"word\" = '" + str.trim() + "' AND \"news_type\" ='" + type + "'";
                                getBySqlMapper.update(sql4);
                            }
                        }
                    }
                }
                String sql = "update tbNews set STATE = '1',EDITOR = '" + userName + "' where id =" + newsID + "";
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "删除资讯[ID:" + newsID + "]");
            }

            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:按省访问量排行
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getTopPro" )
    public EdatResult getTopPro(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            int pageSize = 5;
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            if (data.has("pageSize")) {
                pageSize = data.getInt("pageSize");
            }
            String sql1 = "";
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    sql1 = "SELECT * FROM (SELECT A.*,ROWNUM RN FROM (SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,\"SUBSTR\"(REGIONCODE, 0,4) CODE " + " from TBNEWS where state='0' and checkState = '0' and type=2 ";
                    regionCode = regionCode.substring(0, 2);
                    sql1 += " and REGIONCODE is not null and REGIONCODE like '" + regionCode + "%'";
                    sql1 += " GROUP BY \"SUBSTR\"(REGIONCODE, 0, 4) )T1  JOIN " + " \"tb_city\" T2 on RPAD(T1.CODE,6,0)  =  T2.\"code\"  ORDER BY SUM DESC) A) WHERE RN<=" + pageSize;
                } else if (userLevel == 3) {
                    sql1 = "SELECT * FROM (SELECT A.*,ROWNUM RN FROM (SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,REGIONCODE CODE " + " from TBNEWS where state='0' and checkState = '0' and type=2 ";
                    regionCode = regionCode.substring(0, 4);
                    sql1 += " and REGIONCODE like '" + regionCode + "%'";
                    sql1 += " GROUP BY REGIONCODE )T1  JOIN " + " \"tb_city\" T2 on RPAD(T1.CODE,6,0)  =  T2.\"code\"  ORDER BY SUM DESC) A) WHERE RN<=" + pageSize;
                } else {
                    sql1 = "SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,REGIONCODE CODE " + " from TBNEWS where state='0' and checkState = '0' and type=2 and REGIONCODE = '" + regionCode + "'";
                    sql1 += " )T1  JOIN " + " \"tb_city\" T2 on T1.CODE  =  T2.\"code\" ";
                }
            } else {
                sql1 = "SELECT * FROM (SELECT A.*,ROWNUM RN FROM (SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,\"SUBSTR\"(REGIONCODE, 0, 2) CODE " + " from TBNEWS where state='0' and checkState = '0' and type=2 and REGIONCODE is not null";
                sql1 += " GROUP BY \"SUBSTR\"(REGIONCODE, 0, 2) )T1  JOIN " + " \"tb_city\" T2 on RPAD(T1.CODE,6,0)  =  T2.\"code\"  ORDER BY SUM DESC) A) WHERE RN<=" + pageSize;
            }
            return EdatResult.ok(getBySqlMapper.findRecords(sql1));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:最新最热数据
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getMetadataList" )
    public EdatResult getLatestMetadata(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2,5");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            HttpSession session = request.getSession();
            String roleID = (String) session.getAttribute("roleID");
            String sql1 = "select * from (select A.*,ROWNUM RN from (SELECT T1.*  from (select \"id\", \"name\", \"department\",to_char(\"updateTime\",'yyyy-mm-dd')\"updateTime\", \"serviceAccount\"," + " \"visitAccount\", to_char(\"dataTime\",'yyyy-mm-dd')\"dataTime\", " + " \"location\", \"subjectTerms\", \"dataType\", \"abstract\", \"instructions\", \"contact\", \"tel\", \"email\", \"address\", \"ministry\" " + " from \"tb_source_metadata\"  )T1 " + " join (select * from T_ROLE_DATARIGHT where ROLEID = " + roleID + ")T2 on T1.\"id\" = T2.RIGHTID order by T1.\"dataTime\" desc nulls last,T1.\"serviceAccount\" desc)A  )where RN <=6";
//            String sql2 = "select * from (select A.*,ROWNUM RN from (SELECT T1.*  from (select \"id\", \"name\", \"department\",to_char(\"updateTime\",'yyyy-mm-dd')\"updateTime\", \"serviceAccount\"," + " \"visitAccount\", to_char(\"dataTime\",'yyyy-mm-dd')\"dataTime\", " + " \"location\", \"subjectTerms\", \"dataType\", \"abstract\", \"instructions\", \"contact\", \"tel\", \"email\", \"address\", \"ministry\" " + " from \"tb_source_metadata\" )T1 " + " join (select * from T_ROLE_DATARIGHT where ROLEID = " + roleID + ")T2 on T1.\"id\" = T2.RIGHTID order by T1.\"visitAccount\" desc,T1.\"serviceAccount\" desc)A )where RN <=5";
            String sql3 = "select * from (select A.*,ROWNUM RN from ("
            		+ " SELECT T1.*,T4.VISITCOUNT  from (select \"id\", \"name\", \"department\",to_char(\"updateTime\",'yyyy-mm-dd')\"updateTime\", \"serviceAccount\","
            		+ " to_char(\"dataTime\",'yyyy-mm-dd')\"dataTime\", " + " \"location\", \"subjectTerms\", \"dataType\", \"abstract\", \"instructions\", \"contact\", \"tel\", \"email\", \"address\", \"ministry\" " + " from \"tb_source_metadata\" )T1 "
            		+ " join (select * from T_ROLE_DATARIGHT where ROLEID = " + roleID + ")T2 on T1.\"id\" = T2.RIGHTID"
            		+ " left join (select sum(COUNT) VISITCOUNT,METADATAID from TB_VISITORDOWN_DAY where TYPE=1 group by METADATAID )  T4 on T1.\"id\"=T4.METADATAID"
            		+ " order by T4.\"VISITCOUNT\" desc,T1.\"serviceAccount\" desc"
            		+ " )A )where RN <=6";
            
            Map result = new HashMap();
            result.put("latest", getBySqlMapper.findRecords(sql1));
            result.put("hotest", getBySqlMapper.findRecords(sql3));
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:查询资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNews" )
    public EdatResult getNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String type = data.getString("type");//资讯ID
            int pageNumber = data.getInt("pageNumber");//资讯ID
            int pageSize = data.getInt("pageSize");//资讯ID
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where";
            if (type.equals("0")) {
                sql1 += "( type = '1' or type = '2' or type = '3' )";
            } else {
                if (type.equals("2")) {
                    HttpSession session = request.getSession(false);
                    int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
                    String regionCode = (String) session.getAttribute("regionCode");
                    if (!regionCode.equals("") && userLevel > 1) {
                        if (userLevel == 2) {
                            sql1 += " type = '2' and REGIONCODE like '" + regionCode.substring(0, 2) + "%'";
                        } else if (userLevel == 3) {
                            sql1 += " type = '2' and REGIONCODE like '" + regionCode.substring(0, 4) + "%'";
                        } else {
                            sql1 += " type = '2' and REGIONCODE = '" + regionCode + "'";
                        }
                    } else {
                        sql1 += " type = '" + type + "'";
                    }
                } else {
                    sql1 += " type = '" + type + "'";
                }
            }
            sql1 += " and state='0' and checkState = '0' order by TOP asc,WRITEDATE desc,UPDATETIME desc )T1) where RN >" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (int i = 0; i < list.size(); i++) {
                Map map = list.get(i);
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                map1.put("url", map.get("SOURCE_URL") == null ? "" : map.get("SOURCE_URL").toString());
                if (map.get("CONTENT") == null) {
                    map1.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    map1.put("content", content);
                }
                if (type.equals("0") && i == 0) {
                    String fileNumber = map.get("FILENUMBER") == null ? "" : map.get("FILENUMBER").toString();
                    List<Map> pics = new ArrayList<>();
                    if (!fileNumber.equals("")) {
                        String sql11 = "select ID,FILENAME,URL from tbNewsFile where FILENUMBER = '" + fileNumber + "' and fileType = '1' and state='0'";
                        pics = getBySqlMapper.findRecords(sql11);
                    }
                    map1.put("pics", pics);
                }
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
     * @Description:根据关键词查询资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsByKeyword" )
    public Map getNewsByKeyword(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String keyword = data.getString("keyword");//资讯ID
            int pageNumber = data.getInt("pageNumber");//资讯ID
            int pageSize = data.getInt("pageSize");//资讯ID
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");

            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0'";
            String sql2 = "select count(*) from  tbNews where state='0' and checkState = '0' and TYPE in ('1','2','3') ";
            if (!keyword.equals("")) {
                sql1 += " and KEYWORD like '%" + keyword + "%'";
                sql2 += " and KEYWORD like '%" + keyword + "%'";
            }
            sql1 += " and TYPE in ('1','2','3')  order by TOP asc,WRITEDATE desc,UPDATETIME desc )T1) where RN >" + (pageNumber - 1) * pageSize + " and RN<=" + pageNumber * pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (int i = 0; i < list.size(); i++) {
                Map map = list.get(i);
                String[] arr = map.get("KEYWORD").toString().split(",|，");
                if (Arrays.asList(arr).contains(keyword)) {
                    Map map1 = new HashMap();
                    map1.put("id", map.get("ID").toString());
                    map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                    map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                    map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                    map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                    map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                    map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                    map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                    if (map.get("CONTENT") == null) {
                        map1.put("content", "");
                    } else {
                        CLOB clob = (CLOB) map.get("CONTENT");
                        String content = clob.getSubString(1, (int) clob.length());
                        map1.put("content", content);
                    }
                    result.add(map1);
                }
            }
            Map map = new HashMap();
            int total = getBySqlMapper.findrows(sql2);
            if (total % pageSize > 0) {
                map.put("total", total / pageSize + 1);
            } else {
                map.put("total", total / pageSize);
            }
            map.put("rows", result);
            map.put("page", pageNumber);
            return map;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据关键词查询资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsByKey" )
    public Map getNewsByKey(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String keyword = data.getString("keyword");//关键词
            String newsType = data.getString("newsType");//资讯类型
            String ministryType = data.getString("ministryType");//部委
            int pageNumber = data.getInt("pageNumber");//
            int pageSize = data.getInt("pageSize");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");

            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0'";
            String sql2 = "select count(*) from  tbNews where state='0' and checkState = '0' ";
            String sql3 = "";
            if (!newsType.equals("")) {
                sql3 += " and TYPE = '" + newsType + "'";
                if (!ministryType.equals("")) {
                    sql3 += " and MINISTRY = '" + newsType + "'";
                }
            } else {
                sql3 += " and TYPE in ('1','2','3') ";
            }
            if (!keyword.equals("")) {
//                sql3 += " and KEYWORD like '%" + keyword + "%'";
                sql3 += " and (KEYWORD = '" + keyword + "' or KEYWORD like '" + keyword + ",%' or KEYWORD like '%," + keyword + "' or KEYWORD like '%," + keyword + ",%')";
            }
            sql1 += sql3;
            sql2 += sql3;
            sql1 += "   order by TOP asc,WRITEDATE desc ,UPDATETIME desc)T1) where RN >" + (pageNumber - 1) * pageSize + " and RN<=" + pageNumber * pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (int i = 0; i < list.size(); i++) {
                Map map = list.get(i);
                String[] arr = map.get("KEYWORD").toString().split(",|，");

//                if (Arrays.asList(arr).contains(keyword)) {
                    Map map1 = new HashMap();
                    map1.put("id", map.get("ID").toString());
                    map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                    map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                    map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                    map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                    map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                    map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                    map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                    if (map.get("CONTENT") == null) {
                        map1.put("content", "");
                    } else {
                        CLOB clob = (CLOB) map.get("CONTENT");
                        String content = clob.getSubString(1, (int) clob.length());
                        map1.put("content", content);
                    }
                    result.add(map1);
//                }
            }
            Map map = new HashMap();
            int total = getBySqlMapper.findrows(sql2);
            if (total % pageSize > 0) {
                map.put("total", total / pageSize + 1);
            } else {
                map.put("total", total / pageSize);
            }
            map.put("rows", result);
            map.put("page", pageNumber);
            return map;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据部委查询资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsByMinistry" )
    public Map getNewsByMinistry(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ministry = data.getString("ministry");//部委
            int pageNumber = data.getInt("pageNumber");//资讯ID
            int pageSize = data.getInt("pageSize");//资讯ID
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
            String sql = "select \"id\" from \"tb_ministry_dict\" where \"name\" = '" + ministry + "'";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            int minis = 0;
            if (list1.size() > 0) {
                minis = Integer.parseInt(list1.get(0).get("id").toString());
            }
            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0' and TYPE = '1' ";
            String sql2 = "select count(*) from  tbNews where state='0' and checkState = '0' and TYPE = '1' ";
            if (!ministry.equals("")) {
                sql1 += " and MINISTRY = '" + minis + "'";
                sql2 += " and MINISTRY = '" + minis + "'";
            }
            sql1 += "  order by TOP asc,WRITEDATE desc ,UPDATETIME desc)T1) where RN >" + (pageNumber - 1) * pageSize + " and RN<=" + pageNumber * pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (int i = 0; i < list.size(); i++) {
                Map map = list.get(i);
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                result.add(map1);
            }
            Map map = new HashMap();
            int total = getBySqlMapper.findrows(sql2);
            if (total % pageSize > 0) {
                map.put("total", total / pageSize + 1);
            } else {
                map.put("total", total / pageSize);
            }
            map.put("rows", result);
            map.put("page", pageNumber);
            return map;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:根据部委查询资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsByMinis" )
    public Map getNewsByMinis(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String ministry = data.getString("ministry");//部委
            String startTime = data.getString("startTime");//开始时间
            String endTime = data.getString("endTime");//结束时间
            String keyword = data.getString("keyword");//关键词
            int pageNumber = data.getInt("pageNumber");
            int pageSize = data.getInt("pageSize");
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");

            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0' and TYPE = '1' ";
            String sql2 = "select count(*) from  tbNews where state='0' and checkState = '0' and TYPE = '1' ";
            String sql3 = "";
            if (!ministry.equals("")) {
                String sql = "select \"id\" from \"tb_ministry_dict\" where \"name\" = '" + ministry + "'";
                List<Map> list1 = getBySqlMapper.findRecords(sql);
                int minis = 0;
                if (list1.size() > 0) {
                    minis = Integer.parseInt(list1.get(0).get("id").toString());
                }
                sql3 += " and MINISTRY = '" + minis + "'";
            }
            if (!keyword.equals("")) {
                sql3 += " and KEYWORD like '%" + keyword + "%'";
            }
            if (!startTime.equals("")) {
                sql3 += " and WRITEDATE >= to_date('" + startTime + "','yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sql3 += " and WRITEDATE <(to_date('" + endTime + "','yyyy-mm-dd HH24:mi:ss')+1)";
            }
            sql1 += sql3;
            sql2 += sql3;
            sql1 += "  order by TOP asc,WRITEDATE desc,UPDATETIME desc )T1) where RN >" + (pageNumber - 1) * pageSize + " and RN<=" + pageNumber * pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (int i = 0; i < list.size(); i++) {
                Map map = list.get(i);
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                result.add(map1);
            }
            Map map = new HashMap();
            int total = getBySqlMapper.findrows(sql2);
            if (total % pageSize > 0) {
                map.put("total", total / pageSize + 1);
            } else {
                map.put("total", total / pageSize);
            }
            map.put("rows", result);
            map.put("page", pageNumber);
            return map;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:根据城市查询资讯
     * @Date:11:06 2017/11/22
     */
    @RequestMapping( "getNewsByCity" )
    public Map getNewsByCity(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
       /*     int status = Check.CheckRight(request, "2");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String city = data.getString("city");//省份
            String startTime = data.getString("startTime");//开始时间
            String endTime = data.getString("endTime");//结束时间
            String keyword = data.getString("keyword");//关键词
            int pageNumber = data.getInt("pageNumber");//
            int pageSize = data.getInt("pageSize");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");

            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0' and TYPE = '2' ";
            String sql2 = "select count(*) from  tbNews where state='0' and checkState = '0' and TYPE = '2' ";
            String sql3 = "";
            if (!keyword.equals("")) {
                sql3 += " and KEYWORD like '%" + keyword + "%'";
            }
            if (!startTime.equals("")) {
                sql3 += " and WRITEDATE >= to_date('" + startTime + "','yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sql3 += " and WRITEDATE <(to_date('" + endTime + "','yyyy-mm-dd HH24:mi:ss')+1)";
            }
            if (!city.equals("")) {
                String sql = "select * from \"tb_city\" where \"name\" = '" + city + "'";
                List<Map> list1 = getBySqlMapper.findRecords(sql);
                if (list1.size() > 0) {
                    String code = list1.get(0).get("code").toString();
                    if (code.indexOf("0000") != -1) {
                        code = code.substring(0, 2);
                    } else if (code.indexOf("00") != -1) {
                        code = code.substring(0, 4);
                    }
                    sql3 += " and REGIONCODE  like '" + code + "%'";
                } else {
                    return null;
                }
            }
            sql1 += sql3;
            sql2 += sql3;
            sql1 += "  order by TOP asc,WRITEDATE desc,UPDATETIME desc)T1) where RN >" + (pageNumber - 1) * pageSize + " and RN<=" + pageNumber * pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (int i = 0; i < list.size(); i++) {
                Map map = list.get(i);
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                result.add(map1);
            }
            Map map = new HashMap();
            int total = getBySqlMapper.findrows(sql2);
            map.put("total", Math.ceil(total / (pageSize*1.0)));
            map.put("rows", result);
            map.put("page", pageNumber - 1);
            return map;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:资讯列表（bootstraptable用）
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsList" )
    public Map getNewsList(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));//页码
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));//每页条数
            String name = RegUtil.checkParam(request.getParameter("title"));//标题
            String type = request.getParameter("type");//类型
            String state = request.getParameter("state");//审核状态 0通过，1不通过 -1未审核
            String top = request.getParameter("top");//置顶状态
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews T2  where not EXISTS  (select * from TBNEWS T3  where T3.TYPE = '9' and T2.id = T3.id ) and T2.state='0' ";
            String sql3 = "select count(*) from tbNews T2 where not EXISTS  (select * from TBNEWS T3  where T3.TYPE = '9' and T2.id = T3.id ) and T2.state='0'";
            String sql2 = "";
            if (!type.equals("")) {
                sql2 += " and T2.type = '" + type + "'";
            }
            if (!state.equals("")) {
                if (state.equals("-1")) {
                    sql2 += " and T2.CHECKSTATE is null ";
                } else {
                    sql2 += " and T2.CHECKSTATE = '" + state + "'";
                }
            }
            if (!name.equals("")) {
                sql2 += " and T2.title like '%" + name.trim() + "%'";
            }
            if(top != null && !"".equals(top)){
            	sql2 += " and T2.TOP = '" + top + "'";
            }
            sql1 += sql2;
            sql3 += sql2;
            sql1 += " order by T2.CHECKSTATE desc,T2.TOP asc,to_char(T2.WRITEDATE,'yyyy-mm-dd HH24:mi:ss')  desc ,T2.UPDATETIME desc)T1) where RN >" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                if (map.get("CONTENT") == null) {
                    map1.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    map1.put("content", content);
                }
                map1.put("checkStatus", map.get("CHECKSTATE") == null ? "" : map.get("CHECKSTATE").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                result.add(map1);
            }
            Map fina = new HashMap();
            fina.put("rows", result);
            fina.put("total", getBySqlMapper.findrows(sql3));
            fina.put("page", pageNumber / pageSize);
            return fina;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:舆情资讯类型
     * @Date:10:20 2017/10/17
     */
    @RequestMapping( "getNetworkNewsTypes" )
    public EdatResult getNetworkNewsTypes(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql = "select distinct \"DICT_type\" from \"tb_network_news\" where \"newsType\" = '土壤资讯'   and \"DICT_type\" is not null";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Set set = new HashSet();
            for (Map map : list) {
                String[] arr = map.get("DICT_type").toString().split(",|，");
                for (String str : arr) {
                    set.add(str);
                }
            }
            set.add("其他");
            return EdatResult.ok(set);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:舆情列表（bootstraptable用）
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNetWordNewsList" )
    public Map getNetWordNewsList(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));//页码
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));//每页条数
            String name = request.getParameter("title");//标题
            String type = request.getParameter("type");//类型
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' ";
            String sql3 = "select count(*) from tbNews where state='0'";
            if (!type.equals("")) {
                sql1 += " and type = '" + type + "'";
                sql3 += " and type = '" + type + "'";
            }
            if (!name.equals("")) {
                sql1 += " and title like '" + name + "%'";
                sql3 += " and title like '" + name + "%'";
            }
            sql1 += " order by TOP asc, WRITEDATE desc,UPDATETIME desc )T1) where RN >" + pageNumber + " and RN<=" + (pageNumber + pageSize);
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                if (map.get("CONTENT") == null) {
                    map1.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    map1.put("content", content);
                }
                map1.put("checkStatus", map.get("state") == null ? "" : map.get("state").toString());
                result.add(map1);
            }
            Map fina = new HashMap();
            fina.put("rows", result);
            fina.put("total", getBySqlMapper.findrows(sql3));
            fina.put("page", pageNumber / pageSize);
            return fina;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:资讯列表（bootstraptable用）
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsList1" )
    public Map getNewsList1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageNumber = data.getInt("pageNumber");//页码
            int pageSize = data.getInt("pageSize");//每页条数
            String type = data.getString("type");//
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0'";
            String sql3 = "select count(*) from tbNews where state='0' and checkState = '0'";
            if (!type.equals("")) {
                if (type.equals("2") && userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 4);
                    }
                    sql1 += " and type = '" + type + "' and REGIONCODE like '" + regionCode + "%'";
                    sql3 += " and type = '" + type + "' and REGIONCODE like '" + regionCode + "%'";
                } else {
                    sql1 += " and type = '" + type + "'";
                    sql3 += " and type = '" + type + "'";
                }
            }
            sql1 += " order by TOP asc, WRITEDATE desc,UPDATETIME desc )T1) where RN >" + (pageNumber - 1) * pageSize + " and RN<=" + pageNumber * pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
                map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
                map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                map1.put("url", map.get("SOURCE_URL") == null ? "" : map.get("SOURCE_URL").toString());
                map1.put("writeDate", map.get("WRITEDATE") == null ? "" : sf.format(sf.parse(map.get("WRITEDATE").toString())));
                map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
                if (map.get("CONTENT") == null) {
                    map1.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    map1.put("content", content);
                }
                result.add(map1);
            }
            Map fina = new HashMap();
            fina.put("rows", result);
            fina.put("total", Math.ceil((double) getBySqlMapper.findrows(sql3) / pageSize));
            fina.put("page", pageNumber);
            return fina;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @Author:renqiang
     * @Description:访问量榜单
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getTopHitsNews" )
    public EdatResult getTopHitsNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            int pageSize = data.getInt("pageSize");//每页条数
            String type = data.getString("type");//资讯类型
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql1 = "select * from (select T1.*,ROWNUM RN from(select * from tbNews where state='0' and checkState = '0'";
            if (!type.equals("")) {
                if (type.equals("2") && userLevel > 1 && !regionCode.equals("")) {
                    if (userLevel == 2) {
                        regionCode = regionCode.substring(0, 2);
                    } else if (userLevel == 3) {
                        regionCode = regionCode.substring(0, 3);
                    }
                    sql1 += " and type = '" + type + "' and REGIONCODE like '" + regionCode + "%'";
                } else {
                    sql1 += " and type = '" + type + "'";
                }
            }
            sql1 += " order by HITS desc,TOP asc,WRITEDATE desc,UPDATETIME desc )T1) where RN<=" + pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            for (Map map : list) {
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("number", map.get("HITS") == null ? "0" : map.get("HITS").toString());
                map1.put("type", map.get("TYPE") == null ? "0" : map.get("TYPE").toString());
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
     * @Description:资讯详情
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsDetail" )
    public EdatResult getNewsDetail(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsID = data.getString("newsID");//资讯ID
            SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String sql1 = "select * from (select \"ID\", \"TITLE\",  decode(\"TYPE\",'null',0, nvl( TYPE,0)) \"TYPE\", \"AUTHOR\", \"SOURCE\", \"COMMENT\", \"FILENUMBER\", \"EDITOR\"," + "to_char(WRITEDATE,'yyyy-mm-dd')\"WRITEDATE\", \"UPDATETIME\", " + "\"MARK\", \"STATE\", \"TOP\", \"CONTENT\", \"HITS\", \"CHECKSTATE\", \"REGIONCODE\", \"CHECKER\", \"SOURCETYPE\", \"KEYWORD\", \"SOURCE_URL\"," + " \"MINISTRY\", \"DOMAIN\", \"TITLESIMHASH\", \"CONTENTSIMHASH\" from tbNews where ID = " + newsID + ")T0 left join tbNewsType T1 on TYPE = T1.ID";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            Map map = list.get(0);
            Map map1 = new HashMap();
            map1.put("id", map.get("ID").toString());
            map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
            map1.put("typeName", map.get("TYPENAME") == null ? "" : map.get("TYPENAME").toString());
            map1.put("author", map.get("AUTHOR") == null ? "" : map.get("AUTHOR").toString());
            map1.put("source", map.get("SOURCE") == null ? "" : map.get("SOURCE").toString());
            map1.put("type", map.get("TYPE") == null ? "" : map.get("TYPE").toString());
            map1.put("ministry", map.get("MINISTRY") == null ? "" : map.get("TYPE").toString());
            map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
            map1.put("comment", map.get("COMMENT") == null ? "" : map.get("COMMENT").toString());
            map1.put("url", map.get("SOURCE_URL") == null ? "" : map.get("SOURCE_URL").toString());
            map1.put("sourceType", map.get("SOURCETYPE") == null ? "" : map.get("SOURCETYPE").toString());
            map1.put("keyword", map.get("KEYWORD") == null ? "" : map.get("KEYWORD").toString());
            map1.put("checker", map.get("CHECKER") == null ? "" : map.get("CHECKER").toString());
            map1.put("ministry", map.get("MINISTRY") == null ? "" : map.get("MINISTRY").toString());
            map1.put("regionCode", map.get("REGIONCODE") == null ? "" : map.get("REGIONCODE").toString());
            String fileNumber = map.get("FILENUMBER") == null ? "" : map.get("FILENUMBER").toString();
            List<Map> pics = new ArrayList<>();
            List<Map> files = new ArrayList<>();
            if (!fileNumber.equals("")) {
                String sql11 = "select ID,FILENAME,URL from tbNewsFile where FILENUMBER = '" + fileNumber + "' and fileType = '1' and state='0'";
                pics = getBySqlMapper.findRecords(sql11);
                String sql12 = "select ID,FILENAME,URL from tbNewsFile where FILENUMBER = '" + fileNumber + "' and fileType = '2' and state='0'";
                files = getBySqlMapper.findRecords(sql12);
            }
            map1.put("pics", pics);
            map1.put("files", files);
            map1.put("writeDate", map.get("WRITEDATE") == null ? "" : map.get("WRITEDATE").toString());
            map1.put("updatetime", map.get("UPDATETIME") == null ? "" : map.get("UPDATETIME").toString());
            if (map.get("CONTENT") == null) {
                map1.put("content", "");
            } else {
                CLOB clob = (CLOB) map.get("CONTENT");
                String content = clob.getSubString(1, (int) clob.length());
                map1.put("content", content);
            }
            return EdatResult.ok(map1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:获取图片资讯
     * @Date:9:59 2017/11/7
     */
    @RequestMapping( "getPics" )
    public EdatResult getPics(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,1");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql1 = "select * from tbNews where CHECKSTATE = '0' and TYPE = '8' and  state='0' ORDER BY TOP asc ,WRITEDATE desc,UPDATETIME desc";
            List<Map> list = getBySqlMapper.findRecords(sql1);
            List<Map> result = new ArrayList<>();
            int num = 0;
            for (Map map : list) {
                if (num > 5) {
                    break;
                }
                Map map1 = new HashMap();
                map1.put("id", map.get("ID").toString());
                map1.put("title", map.get("TITLE") == null ? "" : map.get("TITLE").toString());
                map1.put("top", map.get("TOP") == null ? "" : map.get("TOP").toString());
                String fileNumber = map.get("FILENUMBER") == null ? "" : map.get("FILENUMBER").toString();
                List<Map> pics = new ArrayList<>();
                if (!fileNumber.equals("")) {
                    String sql11 = "select ID,FILENAME,URL from tbNewsFile where FILENUMBER = '" + fileNumber + "' and fileType = '1' and state='0'";
                    pics = getBySqlMapper.findRecords(sql11);
                    if (pics.size() > 0) {
                        map1.put("pics", pics);
                        result.add(map1);
                        num++;
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
     * @Description:访问一次新闻
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "hitNews" )
    public EdatResult hitNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsID = data.getString("newsID");//
            String sql12 = "update tbNews set HITS= NVL(HITS, 0)+1 where ID = " + newsID;
            getBySqlMapper.update(sql12);
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:添加信息类型
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "addNewsType" )
    public EdatResult addNewsType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userID = (String) session.getAttribute("userID");//用户ID
            String typeName = data.getString("typeName");//类型名称
            String desc = data.getString("desc");//类型描述
            String sql = "select * from tbNewsType where typeName = '" + typeName + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            if (list.size() > 0) {
                return EdatResult.build(1, "已存在该类型");
            }
            String sql1 = "insert into tbNewsType(ID,TYPENAME,EDITOR,UPDATETIME,MARK,STATE) values(NEWSTYPE_SEQ.nextval,'" + typeName + "','" + userID + "',sysdate,'" + desc + "','0')";
            getBySqlMapper.insert(sql1);
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:审核通过资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "passNews" )
    public EdatResult passNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");/*iD，逗号隔开*/
            String[] arr = newsIDs.split(",");
            for (String id : arr) {
            	//验证数据
                String sql1 = "select * from  tbNews  where id = " + id;
                List<Map> list = getBySqlMapper.findRecords(sql1);
                if (list.get(0).get("TYPE") == null) {
                    return EdatResult.build(1, "未选择资讯类型");
                }
                if (list.get(0).get("TYPE").toString().equals("1") && list.get(0).get("MINISTRY") == null) {
                    return EdatResult.build(1, "部委动态未选择部委");
                }
                if (list.get(0).get("TYPE").toString().equals("2") && list.get(0).get("REGIONCODE") == null) {
                    return EdatResult.build(1, "地方动态未选择行政区划");
                }
            }
            for (String newsID : arr) {
                String sql1 = "select * from  tbNews  where id = " + newsID;
                List<Map> list = getBySqlMapper.findRecords(sql1);
                //资讯类型
                String type = list.get(0).get("TYPE") == null ? "" : list.get(0).get("TYPE").toString();
                //关键词
                String keyword = list.get(0).get("KEYWORD") == null ? "" : list.get(0).get("KEYWORD").toString();
                //处理关键词表数据tb_keyword
                if (type.equals("1")) {
                	//部委
                    String ministry = list.get(0).get("MINISTRY") == null ? "" : list.get(0).get("MINISTRY").toString();
                    if (!keyword.equals("")) {
                        String[] arr1 = keyword.split(",|，");
                        for (String str : arr1) {
                            if (!str.equals("")) {
                                String sql12 = "MERGE INTO \"tb_keyword\" T1 USING (SELECT 1 FROM dual) T2 ON ( T1.\"word\" = '" + str.trim() + "' AND T1.\"news_type\" ='" + type + "' AND  T1.\"ministry_type\" = " + ministry + ") " + "WHEN MATCHED THEN UPDATE SET T1.\"num\" = T1.\"num\"+1 " + "WHEN NOT MATCHED THEN INSERT (\"word\", \"num\", \"news_type\",\"ministry_type\")" + "VALUES('" + str.trim() + "', 1,'" + type + "'," + ministry + ")";
                                getBySqlMapper.insert(sql12);
                            }
                        }
                    }
                } else if (type.equals("2") || type.equals("3")) {
                    String[] arr1 = keyword.split(",|，");
                    for (String str : arr1) {
                        if (!str.equals("")) {
                            String sql12 = "MERGE INTO \"tb_keyword\" T1 USING (SELECT 1 FROM dual) T2 ON ( T1.\"word\" = '" + str.trim() + "' AND T1.\"news_type\" ='" + type + "') " + "WHEN MATCHED THEN UPDATE SET T1.\"num\" = T1.\"num\"+1 " + "WHEN NOT MATCHED THEN INSERT (\"word\", \"num\", \"news_type\")" + "VALUES('" + str.trim() + "', 1,'" + type + "')";
                            getBySqlMapper.insert(sql12);
                        }
                    }
                }
                String sql = "update tbNews set checkState='0'  where id = " + newsID;
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "审核通过资讯[ID:" + newsID + "]");
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:审核不通过资讯
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "rejectNews" )
    public EdatResult rejectNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");/*舆情iD，逗号隔开*/
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql = "update tbNews set checkState='1',top = '0' where id = " + newsID;
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "审核不通过资讯[ID:" + newsID + "]");
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * @Description:取消置顶 选择资讯
     */
    @RequestMapping( "cancelTopNews" )
    public EdatResult cancelTopNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");/*舆情iD，逗号隔开*/
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql = "update tbNews set top = '1' where id = " + newsID;
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "取消置顶资讯[ID:" + newsID + "]");
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    
    /**
     * @Description:置顶选择资讯
     */
    @RequestMapping( "setupTopNews" )
    public EdatResult setupTopNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");/*舆情iD，逗号隔开*/
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql = "update tbNews set top = '0' where id = " + newsID;
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "置顶资讯[ID:" + newsID + "]");
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /**
     * @Author:renqiang
     * @Description:修改信息类型
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "modifyNewsType" )
    public EdatResult modifyNewsType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            HttpSession session = request.getSession();
            String userName = (String) session.getAttribute("loginName");//用户ID
            String typeID = data.getString("typeID");//信息类型ID
            String typeName = data.getString("typeName");//类型名称
            String desc = data.getString("desc");//类型描述
            String sql = "update tbNewsType set TYPENAME = '" + typeName + "',MARK = '" + desc + "',EDITOR='" + userName + "',UPDATETIME = sysdate where ID = " + typeID;
            getBySqlMapper.update(sql);
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:删除信息类型
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "deleteNewsType" )
    public EdatResult deleteNewsType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String typeID = data.getString("typeID");//用户ID

            String sql = "delete from tbNewsType where ID = " + typeID;
            getBySqlMapper.delete(sql);
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Description:查询所有信息类型
     * @Date:17:20 2017/10/11
     */
    @RequestMapping( "getNewsType" )
    public EdatResult getNewsType(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String sql = "select ID,TYPENAME,EDITOR,to_char(UPDATETIME,'yyyy-mm-dd HH24:mi:ss')UPDATETIME,MARK from  tbNewsType where state = '0' order by ID asc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }


    /*文件上传*/
    @RequestMapping( "uploadFile" )
    @Transactional( rollbackFor = Exception.class )
    public EdatResult uploadFile(@RequestParam( "file" ) MultipartFile file, HttpServletRequest request, HttpServletResponse response) throws Exception {
    	
    	DateFormat df1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS");
        ClientUtil.SetCharsetAndHeader(request, response);
        String type = request.getParameter("type");
        
        LogFileUtil.appendSystemLog(type+"--"+df1.format(new Date())+"：进入方法",true);
        
        String picNumber = request.getParameter("picNumber");
        Date date = new Date();
        SimpleDateFormat sf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        if (picNumber.equals("")) {
            picNumber = sf.format(date) + "_" + new Random().nextInt(1000);//时间戳+随机数
        }
        SimpleDateFormat dd = new SimpleDateFormat("yyyyMMdd");
        String dir = request.getSession().getServletContext().getRealPath("/");
        dir = dir.substring(0, dir.substring(0, dir.length() - 1).lastIndexOf("\\") + 1);
        if (!file.isEmpty()) {
            String filename_hout = file.getOriginalFilename();
            String pic = type + "_" + sf.format(date);
            //String pic = filename_hout.substring(0, filename_hout.lastIndexOf("."));
            String fileExt = filename_hout.substring(filename_hout.lastIndexOf(".") + 1).toLowerCase();
            if (type.equals("1")) {
                if (!Arrays.asList(extensionPermit).contains(fileExt)) {
                    return EdatResult.build(1, "格式错误");
                }
            }
            String savePath = "Files/" + type + "/" + dd.format(date);
            File uploadDir = new File(dir + savePath);
            if (!uploadDir.isDirectory()) {
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
            }
            savePath += "/";
            File dirFile = new File(dir + savePath);
            if (!dirFile.exists()) {
                dirFile.mkdirs();
            }
            SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            try {
                File uploadedFile = new File(dir + savePath, pic + "." + fileExt);
                byte[] bytes = file.getBytes();
//                BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(uploadedFile));
//                stream.write(bytes);
//                stream.close();
                //20180928 更改上传文件方法
                LogFileUtil.appendSystemLog(type+"--"+df1.format(new Date())+"：开始上传文件");
                file.transferTo(uploadedFile);
                LogFileUtil.appendSystemLog(type+"--"+df1.format(new Date())+"：上传文件结束");
                
                File f = new File(dir + savePath + pic + "." + fileExt);
                if (f.exists() && f.isFile()) {
//                    if (f.length() > 10240) {//
                    	//先删除已经存在的文件和数据库记录
                    	String seSql = "select * from tbNewsFile where FILENUMBER='"+picNumber+"' and FILETYPE='"+type+"'";
                    	List<Map> seList  = getBySqlMapper.findRecords(seSql);
                    	for (Map map : seList) {
                    		if(map.containsKey("URL")){
                    			String picUrl = map.get("URL").toString();
                    			File picFile = new File(dir + picUrl);
                    			if(picFile.exists()){
                    				picFile.delete();
                    			}
                    		}
						}
                    	//删除数据库记录
                    	String delSql = "delete from tbNewsFile where FILENUMBER='"+picNumber+"' and FILETYPE='"+type+"'";
                    	getBySqlMapper.delete(delSql);
                    	
                    	
                        String url = "/" + savePath + pic + "." + fileExt;
                        String sql = "insert into tbNewsFile(ID,FILENUMBER,URL,FILENAME,UPDATETIME,FILETYPE,STATE) values(NEWSFILE_SEQ.nextval,'" + picNumber + "','" + url + "','" + filename_hout + "',sysdate,'" + type + "','0')";
                        getBySqlMapper.insert(sql);
                        Map map = new HashMap();
                        map.put("number", picNumber);
                        
                        LogFileUtil.appendSystemLog(type+"--"+df1.format(new Date())+"：方法结束");
                        return EdatResult.ok(map);
//                    } else {
//                        return EdatResult.build(1, "文件损坏");
//                    }
                } else {
                    return EdatResult.build(1, "文件不存在");
                }
            } catch (Exception e) {
                e.printStackTrace();
                return EdatResult.build(1, "失败");
            }
        } else {
            return EdatResult.build(1, "没有文件");
        }
    }

    /**
     * @Author:renqiang
     * @Description:舆情预警
     * @Date:15:23 2017/11/01
     */
    @RequestMapping( "getNetworkData" )
    public Map getNetworkData(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,7");
            if (status != 0) {
                Map map = new HashMap();
                map.put("status", status);
                return map;
            }
            int pageSize = Integer.parseInt(request.getParameter("pageSize"));
            int pageNumber = Integer.parseInt(request.getParameter("pageNumber"));
            String title = RegUtil.checkParam(request.getParameter("title"));//污染企业名称
            String source = RegUtil.checkParam(request.getParameter("source"));//分类
            String state = request.getParameter("state").trim();//分类
            String sql = "select * from (select T1.*,ROWNUM RN from (select  \"newsid\", \"url\",  \"title\", \"content\"," + " \"source\",  to_char(\"time\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\"," + " \"summary\",  \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\"," + " \"DICT_type\", \"mainContentHtml\", \"state\" from \"tb_network_news\" where (\"state\" = '0' or \"state\" = '1' or \"state\" is null) and   \"newsType\" = '土壤舆情'  ";
            String sql1 = "select count(*) from \"tb_network_news\" where (\"state\" = '0' or \"state\" = '1' or \"state\" is null) and \"newsType\" = '土壤舆情' ";
            String sql2 = "";
            if (!state.equals("")) {
                if (state.equals("-1")) {
                    sql2 += " and \"state\" is null ";
                } else {
                    sql2 += " and \"state\" = '" + state + "'";
                }
            }
            if (!title.equals("")) {
                sql2 += " and \"title\" like '%" + title + "%'";
            }
            if (!source.equals("")) {
                sql2 += " and \"source\" like '%" + source + "%'";
            }
            sql += sql2;
            sql1 += sql2;
            sql += " order by  \"state\" desc ,\"time\" desc)T1 ) where RN>" + pageNumber + " and RN <=" + (pageNumber + pageSize);
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
                if (map.get("state") == null) {
                    map.put("status", "");
                } else {
                    map.put("status", map.get("state").toString());
                }
                if (map.get("DICT_type") == null) {
                    map.put("DICT_type", "");
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
     * @Author:renqiang
     * @Param:
     * @Description:舆情详情
     * @Date:15:38 2017/11/1
     */
    @RequestMapping( "getNetworkNewsDetail" )
    public EdatResult getNetworkNewsDetail(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "2,3,4,5,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsID = data.getString("newsID");
            String sql = "select \"newsid\",\"url\",\"title\",\"content\",\"source\",\"chinaRegion1\",\"chinaRegion2\",\"chinaRegion3\"," + "to_char(\"time\",'yyyy-mm-dd HH24:mi:ss')\"fetchTime\",\"summary\",\"newsType\"" + ",\"domain\",\"DICT_type\",\"mainContentHtml\",\"lon\",\"lat\" from \"tb_network_news\" where \"newsid\"='" + newsID + "'";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map map = list.get(0);
            if (map.get("content") == null) {
                map.put("content", "");
            } else {
                CLOB clob = (CLOB) map.get("content");
                String content = clob.getSubString(1, (int) clob.length());
                map.put("content", content);
            }
            if (map.get("state") == null) {
                map.put("state", "");
            }
            if (map.get("chinaRegion1") == null) {
                map.put("chinaRegion1", "");
            }
            if (map.get("chinaRegion3") == null) {
                map.put("chinaRegion3", "");
            }
            if (map.get("chinaRegion2") == null) {
                map.put("chinaRegion2", "");
            }
            if (map.get("DICT_type") == null) {
                map.put("DICT_type", "");
            }
            if (map.get("lon") == null) {
                map.put("lon", "");
            }
            if (map.get("lat") == null) {
                map.put("lat", "");
            }
            return EdatResult.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:修改舆情
     * @Date:15:38 2017/11/1
     */
    @RequestMapping( "moidfyNetworkNews" )
    public EdatResult moidfyNetworkNewsl(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsID = data.getString("newsID");
            String source = data.getString("source").trim();
            String content = data.getString("content");
            String time = data.getString("time");
            String url = data.getString("url").trim();
            String title = data.getString("title").trim();
            String summary = data.getString("summary");
            String chinaRegion1 = data.getString("chinaRegion1");
            String chinaRegion2 = data.getString("chinaRegion2");
            String chinaRegion3 = data.getString("chinaRegion3");
            String lon = data.getString("lon");
            String lat = data.getString("lat");
            String type = data.getString("type");
            Statement stmt = null;
            ResultSet rs = null;
            Connection conn = null;
            CallableStatement cstmt = null;
            try {
                Class.forName(driver);
                conn = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
                CallableStatement proc = null; //创建执行存储过程的对象
                proc = conn.prepareCall("{ call UPDATENETWORKNEWS(?,?,?,?,?,?,?,?,?,?,?,?,?) }"); //设置存储过程 call为关键字.
                proc.setString(1, url);//
                proc.setString(2, title);//
                CLOB clob = new CLOB((OracleConnection) conn);
                clob = oracle.sql.CLOB.createTemporary((OracleConnection) conn, true, 1);
                clob.setString(1, content);
                proc.setClob(3, clob);//
                proc.setString(4, source);//
                proc.setString(5, time);//
                proc.setString(6, summary);//
                proc.setString(7, chinaRegion1);//
                proc.setString(8, chinaRegion2);//
                proc.setString(9, chinaRegion3);//
                proc.setString(10, type);//
                proc.setString(11, newsID);//
                proc.setString(12, lon);//
                proc.setString(13, lat);//
                proc.execute();//执行
                logToDb.addLog(request, "修改舆情资讯[ID:" + newsID + "]");
                return EdatResult.ok();
            } catch (SQLException ex2) {
                ex2.printStackTrace();
                return EdatResult.build(1, "fail");
            } catch (Exception ex2) {
                ex2.printStackTrace();
                return EdatResult.build(1, "fail");
            } finally {
                try {
                    if (rs != null) {
                        rs.close();
                        if (stmt != null) {
                            stmt.close();
                        }
                        if (conn != null) {
                            conn.close();
                        }
                    }
                } catch (SQLException ex1) {
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:批量审核通过舆情
     * @Date:15:38 2017/11/1
     */
    @RequestMapping( "passNetworkNews" )
    public EdatResult passNetworkNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");/*舆情iD，逗号隔开*/
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql = "update \"tb_network_news\" set \"state\" = '0'  where \"newsid\"='" + newsID + "'";
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "审核通过舆情[ID:" + newsID + "]");
            }

            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:批量审核不通过舆情
     * @Date:15:38 2017/11/1
     */
    @RequestMapping( "rejectNetworkNews" )
    public EdatResult rejectNetworkNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql = "update \"tb_network_news\" set \"state\" = '1'  where \"newsid\"='" + newsID + "'";
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "审核不通过舆情[ID" + newsID + "]");
            }
            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:批量删除舆情
     * @Date:15:38 2017/11/1
     */
    @RequestMapping( "deleteNetworkNews" )
    public EdatResult deleteNetworkNews(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsIDs = data.getString("newsIDs");
            String[] arr = newsIDs.split(",");
            for (String newsID : arr) {
                String sql = "update \"tb_network_news\" set \"state\" = '2' where \"newsid\"='" + newsID + "'";
                getBySqlMapper.update(sql);
                logToDb.addLog(request, "删除舆情[ID:" + newsID + "]");
            }

            return EdatResult.ok();
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * 工作推进的行政区划code 名称 以及该行政区划的条数查询
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getGZTJ" )
    public EdatResult getGZTJ(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select T2.\"code\" as \"province\", T2.\"name\" as \"name\",T1.\"count\" from" + " (select \"SUBSTR\"(REGIONCODE, 0, 2) CODE,COUNT(1) as \"count\" from \"TBNEWS\" where 1 = 1 group by \"SUBSTR\"(REGIONCODE, 0, 2) )" + " T1 left join \"tb_city\" T2 on  RPAD(T1.CODE,6,0) = T2.\"code\" where T2.\"level\" = 0  order by T1.\"count\" desc";
            List<Map> list = getBySqlMapper.findRecords(sql);

            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * 工作推进的行政区划code 名称 以及该行政区划的条数查询
     *
     * @param request
     * @param response
     * @return
     */
    @RequestMapping( "getGZTJOfProvince" )
    public EdatResult getGZTJOfProvince(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String provinceCode = data.getString("provinceCode");
            String sql = "select T2.\"code\" as \"province\", T2.\"name\" as \"name\",T1.\"count\" from" + " (select \"SUBSTR\"(REGIONCODE, 0, 4) CODE,COUNT(1) as \"count\" from \"TBNEWS\" where 1 = 1 and \"REGIONCODE\" like '" + provinceCode.substring(0, 1) + "%' group by \"SUBSTR\"(REGIONCODE, 0, 4) )" + " T1 left join \"tb_city\" T2 on  RPAD(T1.CODE,6,0) = T2.\"code\" where T2.\"level\" = 1  order by T1.\"count\" desc";
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
     * @Description:更新关键词表 项目启动时执行一次
     * @Date:14:32 2017/11/9
     */
  /*  @Scheduled(fixedRate = 999999999)*/
/*    @Scheduled(cron = "0 0 0 * * ?")*/
/*    @PostConstruct*/
    public void getKeywords() {
        try {
            System.out.println("开始初始化更新关键词表");
            long t1 = System.currentTimeMillis();
            String sql7 = "truncate table \"tb_keyword\"";
            getBySqlMapper.delete(sql7);
            for (int type = 1; type < 4; type++) {
                if (type == 1) {
                    String sql0 = "select count(*) from \"tb_ministry_dict\"";
                    int total = getBySqlMapper.findrows(sql0);
                    for (int ministry = 0; ministry <= total; ministry++) {
                        String sql = "";
                        if (ministry == 0) {
                            sql = "select KEYWORD from TBNEWS where STATE = '0' and CHECKSTATE = '0' and TYPE = '1' and MINISTRY is null and KEYWORD is not null";
                        } else {
                            sql = "select KEYWORD from TBNEWS where STATE = '0' and CHECKSTATE = '0' and TYPE = '1' and MINISTRY = '" + ministry + "' and KEYWORD is not null";
                        }
                        List<Map> list = getBySqlMapper.findRecords(sql);
                        if (list.size() < 1) {
                            continue;
                        }
                        Map result = new HashMap();
                        for (Map map : list) {
                            String key = map.get("KEYWORD").toString();
                            String[] arr = key.split(",|，");
                            for (int i = 0; i < arr.length; i++) {
                                if (result.containsKey(arr[i].trim())) {
                                    result.put(arr[i].trim(), Integer.parseInt(result.get(arr[i]).toString()) + 1);
                                } else {
                                    result.put(arr[i].trim(), 1);
                                }
                            }
                        }
                        Set<Map> mapSet = result.entrySet();
                        Iterator it = mapSet.iterator();
                        List<Map> list3 = new ArrayList<>();
                        while (it.hasNext()) {
                            Map.Entry<String, String> entry = (Map.Entry<String, String>) it.next();
                            Map map = new HashMap();
                            map.put("name", entry.getKey());
                            map.put("num", entry.getValue());
                            list3.add(map);
                        }
                        if (ministry == 0) {
                            for (Map map : list3) {
                                if (map.get("name") != null && !map.get("name").toString().equals("")) {
                                    String sql2 = "INSERT into \"tb_keyword\"(\"word\", \"num\", \"news_type\")" + "VALUES('" + map.get("name").toString() + "', " + map.get("num").toString() + ",1)";
                                    getBySqlMapper.insert(sql2);
                                }
                            }
                        } else {
                            for (Map map : list3) {
                                if (map.get("name") != null && !map.get("name").toString().equals("")) {
                                    String sql2 = "INSERT into \"tb_keyword\"(\"word\", \"num\", \"news_type\",\"ministry_type\")" + "VALUES('" + map.get("name").toString() + "', " + map.get("num").toString() + ",1," + ministry + ")";
                                    getBySqlMapper.insert(sql2);
                                }
                            }
                        }
                    }
                } else {
                    String sql = "select KEYWORD from TBNEWS where STATE = '0' and CHECKSTATE = '0' and TYPE = '" + type + "' and KEYWORD is not null";
                    List<Map> list = getBySqlMapper.findRecords(sql);
                    if (list.size() < 1) {
                        continue;
                    }
                    Map result = new HashMap();
                    for (Map map : list) {
                        String key = map.get("KEYWORD").toString();
                        String[] arr = key.split(",|，");
                        for (int i = 0; i < arr.length; i++) {
                            if (result.containsKey(arr[i])) {
                                result.put(arr[i], Integer.parseInt(result.get(arr[i]).toString()) + 1);
                            } else {
                                result.put(arr[i], 1);
                            }
                        }
                    }
                    Set<Map> mapSet = result.entrySet();
                    Iterator it = mapSet.iterator();
                    List<Map> list3 = new ArrayList<>();
                    while (it.hasNext()) {
                        Map.Entry<String, String> entry = (Map.Entry<String, String>) it.next();
                        Map map = new HashMap();
                        map.put("name", entry.getKey());
                        map.put("num", entry.getValue());
                        list3.add(map);
                    }
                    for (Map map : list3) {
                        if (map.get("name") != null && !map.get("name").toString().equals("")) {
                            String sql2 = "INSERT into \"tb_keyword\"(\"word\", \"num\", \"news_type\")" + "VALUES('" + map.get("name").toString() + "', " + map.get("num").toString() + ", " + type + ")";
                            getBySqlMapper.insert(sql2);
                        }
                    }
                }
            }
            long t2 = System.currentTimeMillis();
            System.out.println("初始化关键词表完成,耗时：" + (t2 - t1) + "ms");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:获取热门关键词
     * @Date:14:32 2017/11/9
     */
    @RequestMapping( "getTopKeywords" )
    public EdatResult getTopKeywords(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsType = data.getString("newsType");//
            String ministryType = data.getString("ministryType");//
            String pageSize = data.getString("pageSize");
            String sql = " ";
            if (!newsType.equals("")) {
                if (ministryType.equals("")) {
                    sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\" where  \"num\" is not null  and \"news_type\" = " + newsType;
                } else {
                    sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\" where  \"num\" is not null  and \"news_type\" = " + newsType + " and " + " \"ministry_type\" = " + ministryType;
                }
            } else {
                sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from(select * from (select SUM(\"num\")\"num\",\"word\"  from \"tb_keyword\" group by \"word\" ) where 1=1";
            }
            if (data.has("keyword") && !!data.getString("keyword").equals("")) {
                sql += " and \"word\" like '%" + data.getString("keyword") + "%'";
            }
            sql += " order By \"num\" desc)T1) where RN <=" + pageSize;
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
     * @Description:获取热门关键词(资讯统计饼图)
     * @Date:14:32 2017/11/9
     */
    @RequestMapping( "getTopKeywords2" )
    public EdatResult getTopKeywords2(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsType = data.getString("newsType");//
            String ministryType = data.getString("ministryType");//
            String pageSize = data.getString("pageSize");
            String sql = " ";
            if (!newsType.equals("")) {
                if (ministryType.equals("")) {
                    sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\"  T3 where not EXISTS(select * from  " + " \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\") and" + "  \"num\" is not null  and \"news_type\" = " + newsType;
                } else {
                    sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\" T3 where not EXISTS(select * from  " + " \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\")" + " and \"num\" is not null  and \"news_type\" = " + newsType + " and " + " \"ministry_type\" = " + ministryType;
                }
            } else {
                sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from(select * from (select SUM(\"num\")\"num\",\"word\"  from" + " \"tb_keyword\" T3 where not EXISTS(select * from  \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\")" + " group by \"word\" ) where 1=1";
            }
            if (data.has("keyword") && !!data.getString("keyword").equals("")) {
                sql += " and \"word\" like '%" + data.getString("keyword") + "%'";
            }
            sql += " order By \"num\" desc)T1) where RN <=" + pageSize;
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
     * @Description:获取热门关键词(资讯统计饼图)
     * @Date:14:32 2017/11/9
     */
    @RequestMapping( "getTopKeywords1" )
    public EdatResult getTopKeywords1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsType = data.getString("newsType");//
            String ministryType = data.getString("ministryType");//
            String pageSize = data.getString("pageSize");
            String sql = " ";
            if (!newsType.equals("")) {
                if (ministryType.equals("")) {
//                    sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\"  T3 where not EXISTS(select * from  " + " \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\") and" + "  \"num\" is not null  and \"news_type\" = " + newsType;
                	sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select \"word\",sum(\"num\") \"num\" from \"tb_keyword\"  T3 where not EXISTS(select * from  " + " \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\") and" + "  \"num\" is not null  and \"news_type\" = " + newsType + "group by \"word\"";
                } else {
                    sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\" T3 where not EXISTS(select * from  " + " \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\")" + " and \"num\" is not null  and \"news_type\" = " + newsType + " and " + " \"ministry_type\" = " + ministryType;
                }
            } else {
                sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from(select * from (select SUM(\"num\")\"num\",\"word\"  from" + " \"tb_keyword\" T3 where not EXISTS(select * from  \"tb_keyword\" T2 where \"news_type\" = 1 and \"ministry_type\" is null and T3.\"id\"=T2.\"id\")" + " group by \"word\" ) where 1=1";
            }
            if (data.has("keyword") && !!data.getString("keyword").equals("")) {
                sql += " and \"word\" like '%" + data.getString("keyword") + "%'";
            }
            sql += " order By \"num\" desc)T1) where RN <=" + pageSize;
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
     * @Description:获取热门关键词
     * @Date:14:32 2017/11/9
     */
    @RequestMapping( "getKeywords" )
    public EdatResult getKeywords1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String newsType = data.getString("newsType");//
            String pageSize = data.getString("pageSize");
            String sql = "";
            if (!newsType.equals("")) {
                sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from (select * from \"tb_keyword\" where  \"num\" is not null  and \"news_type\" = " + newsType;
            } else {
                sql += "select \"word\" \"name\",\"num\" \"value\" from (select T1.*,ROWNUM RN from(select * from (select SUM(\"num\")\"num\",\"word\"  from \"tb_keyword\" group by \"word\" ) where 1=1";
            }
            if (data.has("keyword") && !data.getString("keyword").equals("")) {
                sql += " and \"word\" like '%" + data.getString("keyword") + "%'";
            }
            sql += " order By \"num\" desc)T1) where RN <=" + pageSize;
            List<Map> list = getBySqlMapper.findRecords(sql);
            List list1 = new ArrayList<>();
            for (Map map : list) {
                list1.add(map.get("name").toString());
            }
            return EdatResult.ok(list1);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:根据部委统计资讯
     * @Date:17:29 2017/11/10
     */
    @RequestMapping( "staNewsBybuwei" )
    public EdatResult staNewsBybuwei(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getString("startTime");
            String endTime = data.getString("endTime");
            String keyword = data.getString("keyword");
            String sql = "select nvl(T1.NUM,0) NUM,T2.\"name\" TYPE from (select count(*) NUM,MINISTRY from TBNEWS where   TYPE = '1'  and state='0' and checkState = '0' and MINISTRY is not null";
            if (!keyword.equals("")) {
                sql += " and KEYWORD like '%" + keyword + "%'";
            }
            if (!startTime.equals("")) {
                sql += " and WRITEDATE >= to_date('" + startTime + "','yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sql += " and WRITEDATE <(to_date('" + endTime + "','yyyy-mm-dd HH24:mi:ss')+1)";
            }
            sql += " group by MINISTRY )T1 right JOIN \"tb_ministry_dict\" T2 on T1.MINISTRY = T2.\"id\" ORDER BY NUM desc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            List list1 = new ArrayList();
            List list2 = new ArrayList();
            for (Map map : list) {
                list1.add(map.get("NUM").toString());
                list2.add(map.get("TYPE").toString());
            }
            result.put("values", list1);
            result.put("names", list2);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:根据部委统计资讯,按部委排序
     * @Date:17:29 2017/11/10
     */
    @RequestMapping( "staNewsBybuwei1" )
    public EdatResult staNewsBybuwei1(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getString("startTime");
            String endTime = data.getString("endTime");
            String keyword = data.getString("keyword");
            String sql = "select nvl(T1.NUM,0) NUM,T2.\"name\" TYPE from (select count(*) NUM,MINISTRY from TBNEWS where   TYPE = '1'  and state='0' and checkState = '0' and MINISTRY is not null";
            if (!keyword.equals("")) {
                sql += " and KEYWORD like '%" + keyword + "%'";
            }
            if (!startTime.equals("")) {
                sql += " and WRITEDATE >= to_date('" + startTime + "','yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sql += " and WRITEDATE <(to_date('" + endTime + "','yyyy-mm-dd HH24:mi:ss')+1)";
            }
            sql += " group by MINISTRY )T1 right JOIN \"tb_ministry_dict\" T2 on T1.MINISTRY = T2.\"id\" ORDER BY T2.\"ordernum\"";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            List list1 = new ArrayList();
            List list2 = new ArrayList();
            for (Map map : list) {
                list1.add(map.get("NUM").toString());
                list2.add(map.get("TYPE").toString());
            }
            result.put("values", list1);
            result.put("names", list2);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:地方统计
     * @Date:10:08 2017/11/13
     */
    @RequestMapping( "getCityRank" )
    public EdatResult getCityRank(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String code = data.getString("code");
            String startTime = data.getString("startTime");
            String endTime = data.getString("endTime");
            String keyword = data.getString("keyword");
            HttpSession session = request.getSession();
            int userLevel = Integer.parseInt((String) session.getAttribute("userLevel"));
            String regionCode = (String) session.getAttribute("regionCode");
            String sql = "";
            if (!keyword.equals("")) {
                sql += " and KEYWORD like '%" + keyword + "%'";
            }
            if (!startTime.equals("")) {
                sql += " and WRITEDATE >= to_date('" + startTime + "','yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sql += " and WRITEDATE <(to_date('" + endTime + "','yyyy-mm-dd HH24:mi:ss')+1)";
            }
            if (userLevel > 1 && !regionCode.equals("")) {
                if (userLevel == 2) {
                    regionCode = regionCode.substring(0, 2);
                } else if (userLevel == 3) {
                    regionCode = regionCode.substring(0, 4);
                }
                sql += " and REGIONCODE like '" + regionCode + "%'";
            }
            String sql1 = "";
            if (code.equals("")) {
                sql1 = "SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,\"SUBSTR\"(REGIONCODE, 0, 2) CODE from TBNEWS where  TYPE = '2' and state='0' and checkState = '0' and" + " REGIONCODE IS NOT NULL " + sql + " GROUP BY \"SUBSTR\"(REGIONCODE, 0, 2) )T1 LEFT JOIN " + " \"tb_city\" T2 on RPAD(T1.CODE,6,0)  =  T2.\"code\"  ORDER BY SUM DESC";
            } else {
                if (code.indexOf("0000") != -1) {
                    String tem = code.substring(0, 2);
                    sql1 = "SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,\"SUBSTR\"(REGIONCODE, 0, 4) CODE from TBNEWS where  TYPE = '2' and state='0' and checkState = '0' and " + " SUBSTR(REGIONCODE,0,2 ) = '" + tem + "' and REGIONCODE != '" + code + "' " + sql + " GROUP BY \"SUBSTR\"(REGIONCODE, 0, 4) )T1  JOIN " + " \"tb_city\" T2 on RPAD(T1.CODE,6,0)  =  T2.\"code\" and T2.\"name\" is not null  ORDER BY SUM DESC";
                } else if (code.indexOf("00") != -1) {
                    String tem = code.substring(0, 4);
                    sql1 = "SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,REGIONCODE CODE from TBNEWS where TYPE = '2' and  state='0' and checkState = '0'   and " + " \"SUBSTR\"(REGIONCODE, 0, 4) = '" + tem + "' " + sql + " GROUP BY REGIONCODE )T1  JOIN " + " \"tb_city\" T2 on T1.CODE  =  T2.\"code\" and T2.\"name\" is not null  ORDER BY SUM DESC";
                } else {
                    sql1 = "SELECT T1.*,T2.\"name\" FROM (select count(*) SUM,REGIONCODE CODE from TBNEWS where TYPE = '2' and  state='0' and checkState = '0'   and " + " REGIONCODE = '" + code + "' " + sql + " GROUP BY REGIONCODE )T1  JOIN " + " \"tb_city\" T2 on T1.CODE  =  T2.\"code\" and T2.\"name\" is not null  ORDER BY SUM DESC";
                }
            }
            List<Map> list = getBySqlMapper.findRecords(sql1);
            Map result = new HashMap();
            List list1 = new ArrayList();
            List list2 = new ArrayList();
            for (Map map : list) {
                if (map.get("name") != null) {
                    list1.add(map.get("name").toString());
                    list2.add(map.get("SUM") == null ? "0" : map.get("SUM").toString());
                }
            }
            result.put("names", list1);
            result.put("values", list2);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:szz
     * @Description:按日期统计资讯动态数量
     * @Date:2018/1/28
     */
    @RequestMapping( "staNewsByDate" )
    public EdatResult staNewsByDate(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getString("startTime");
            String endTime = data.getString("endTime");
            String keyword = data.getString("keyword");
            String sql = "select to_char(WRITEDATE,'yyyy-mm-dd') as newsdate,count(0) as newsnum from TBNEWS where  state='0' and checkState = '0' ";
            if (!keyword.equals("")) {
                sql += " and KEYWORD like '%" + keyword + "%'";
            }
            if (!startTime.equals("")) {
                sql += " and WRITEDATE >= to_date('" + startTime + "','yyyy-mm-dd HH24:mi:ss')";
            }
            if (!endTime.equals("")) {
                sql += " and WRITEDATE <(to_date('" + endTime + "','yyyy-mm-dd HH24:mi:ss')+1)";
            }
            sql += " group by to_char(WRITEDATE,'yyyy-mm-dd') order by to_char(WRITEDATE,'yyyy-mm-dd') asc";
            List<Map> list = getBySqlMapper.findRecords(sql);
            Map result = new HashMap();
            List list1 = new ArrayList();
            List list2 = new ArrayList();
            for (Map map : list) {
                list1.add(map.get("NEWSDATE").toString());
                list2.add(map.get("NEWSNUM").toString());
            }
            result.put("date", list1);
            result.put("num", list2);
            return EdatResult.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:获取所有部委
     * @Date:11:07 2017/11/13
     */
    @RequestMapping( "getMinistry" )
    public EdatResult getMinistry(HttpServletRequest request, HttpServletResponse response) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "1,2,5,7");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String sql = "select * from \"tb_ministry_dict\"";
            return EdatResult.ok(getBySqlMapper.findRecords(sql));
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:百度富文本编辑器：图片上传
     * @Date:14:18 2017/11/23
     */
    @RequestMapping( value = "/uploadimage" )
    public Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> rs = new HashMap<String, Object>();
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            MultipartHttpServletRequest mReq = null;
            MultipartFile file = null;
            String fileName = "";
            // 原始文件名   UEDITOR创建页面元素时的alt和title属性
            String originalFileName = "";
            mReq = (MultipartHttpServletRequest) request;
            // 从config.json中取得上传文件的ID
            file = mReq.getFile("upfile");
            SimpleDateFormat sf = new SimpleDateFormat("HHmmssSSS");
            SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");

            if (!file.isEmpty()) {
                // 取得文件的原始文件名称
                fileName = file.getOriginalFilename();
                originalFileName = fileName;
                String ext = (FilenameUtils.getExtension(file.getOriginalFilename())).toLowerCase();
                String storePath = "";
                Date date = new Date();
                if ("jpg".equals(ext) || "png".equals(ext) || "jpeg".equals(ext) || "bmp".equals(ext)) {
                    storePath = "/Files/3/" + df.format(date) + "/";
                } else {
                    storePath = "/Files/4/" + df.format(date) + "/";
                }
                //将图片和视频保存在本地服务器
                //    String pathRoot = request.getSession().getServletContext().getRealPath("");
                String dir = request.getSession().getServletContext().getRealPath("/");
                dir = dir.substring(0, dir.substring(0, dir.length() - 1).lastIndexOf("\\") + 1);
                String path = dir + "/" + storePath;
                File dirFile = new File(path);
                if (!dirFile.exists()) {
                    dirFile.mkdirs();
                }
                fileName = sf.format(date) + (int) (Math.random() * 10) + "_" + fileName;
                file.transferTo(new File(path + fileName));
                //String doMain = readProperties.getFileDomain();
                String httpImgPath = storePath + fileName;
                rs.put("state", "SUCCESS");// UEDITOR的规则:不为SUCCESS则显示state的内容
                rs.put("url", httpImgPath);         //能访问到你现在图片的路径
                rs.put("title", originalFileName);
                rs.put("original", originalFileName);
            }
        } catch (Exception e) {
            e.printStackTrace();
            rs.put("state", "文件上传失败!"); //在此处写上错误提示信息，这样当错误的时候就会显示此信息
            rs.put("url", "");
            rs.put("title", "");
            rs.put("original", "");
        }
        return rs;
    }

    /**
     * @Author:renqiang
     * @Param:
     * @Description:更新历史舆情数据
     * @Date:17:08 2017/12/4
     */
    @RequestMapping( "updateNetworks" )
    public void getMongoDBUpdate() {
        System.out.println("================ 开始更新舆情历史数据  ================");
        DateFormat dft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        long t1 = System.currentTimeMillis();
        try {
            MongoClient mongoClient = new MongoClient("183.174.228.5", 1241);
            //连接到数据库
            MongoDatabase mongoDatabase = mongoClient.getDatabase("cnnews");
            System.out.println(dft.format(new Date()) + " Connect MongoDB Successfully！");
            //获取集合 参数为“集合名称”
            MongoCollection<Document> mongoCollection = mongoDatabase.getCollection("HuanbaoDocs_turang");
            FindIterable<Document> findIterable = mongoCollection.find();
            MongoCursor<Document> mongoCursor = findIterable.iterator();
            while (mongoCursor.hasNext()) {
                Document doc = mongoCursor.next();
                if (doc == null || doc.get("_id") == null) {
                    continue;
                }
                //获取数据信息
                String newsType = "";
                String id = doc.get("_id").toString();
                String title = doc.get("title") == null ? "" : doc.get("title").toString();
                /*土壤资讯入库tbnews*/
                if (newsType.equals("土壤资讯")) {
                    String sql1 = "select * from tbnews where \"newsid\" = '" + id + "'";
                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    /*根据newsid排重*/
                    if (list.size() < 1) {
                        String sql2 = "select * from tbnews where AUTHOR ='spider' and TITLE='" + title + "' and \"newsid\" is null";
                        List<Map> list1 = getBySqlMapper.findRecords(sql2);
                        /*给已有数据挂上newsid*/
                        if (list1.size() > 0) {
                            String sql3 = "update tbnews set \"newsid\" = '" + id + "' where AUTHOR ='spider' and TITLE='" + title + "'";
                            getBySqlMapper.update(sql3);
                        }
                    }
                }
            }
            long t2 = System.currentTimeMillis();
            System.out.println("================ 更新舆情数据结束  ================");
            System.out.println("耗时：" + (t2 - t1) + "ms");
        } catch (Exception e) {
            e.printStackTrace();
            // System.err.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }

    @RequestMapping( "putRegion" )
    public void putRegion() {

        String sql = "select * from \"tb_network_news\" where \"insertTime\" = TO_DATE('2017-12-07 00:00:00', 'yyyy-MM-dd HH24:mi:ss')";
        List<Map> list = getBySqlMapper.findRecords(sql);
        for (Map map : list) {
            if (map.get("chinaRegion1") != null) {
                String[] arr = map.get("chinaRegion1").toString().replaceAll(" ", "").split("、");
                String region = "";
                for (String tem : arr) {
                    String[] arr1 = tem.split("省");
                    String tem1 = "";
                    if (arr1.length > 0) {
                        tem1 = arr1[0];
                    }
                    String sql1 = "select * from \"tb_city\" where \"name\" like '%" + tem1.substring(0, 2) + "%' ";
                    List<Map> list1 = getBySqlMapper.findRecords(sql1);
                    if (list1.size() > 0) {
                        region += list1.get(0).get("code").toString() + "_" + list1.get(0).get("name").toString() + ",";
                    } else {
                        region += tem + ",";
                    }
                }
                if (region.length() > 0) {
                    region = region.substring(0, region.length() - 1);
                }
                String sql2 = "update \"tb_network_news\" set \"chinaRegion1\" = '" + region + "' where \"newsid\" = '" + map.get("newsid").toString() + "'";
                getBySqlMapper.update(sql2);
            }
        }
    }

    @RequestMapping( "exportFile" )
    public EdatResult exportFile(HttpServletRequest request, HttpServletResponse response) {

        try {
            ClientUtil.SetCharsetAndHeader(request, response);
           /* int status = Check.CheckRight(request, "1,2");
            if (status != 0) {
            }*/
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String startTime = data.getString("startTime");
            String endTime = data.getString("endTime");
           // String num = data.getString("num");
            String title = RegUtil.checkParam(data.getString("title"));
            String source =  RegUtil.checkParam(data.getString("source"));
            String status = data.getString("status");
            String sql = "select \"newsid\", \"url\", \"urlhash\", \"title\", \"content\", \"source\", \"time\", \"fetchTime\", "
                    + "\"summary\", \"newsType\", \"domain\", \"chinaRegion1\", \"chinaRegion2\", \"chinaRegion3\",\"DICT_type\","
                    + " \"mainContentHtml\", \"encoding\", \"codePage\", \"state\", \"titlesimhash\", \"contentsimhash\",  \"lon\","
                    + " \"lat\" from \"tb_network_news\" where  \"newsType\" = '土壤舆情'";
            String sel = "";
            if (!startTime.equals("")) {
                sel += " and \"time\" >= to_timestamp('"+startTime+"','yyyy-mm-dd hh24:mi:ss.ff6')";
            }
            if (!endTime.equals("")) {
                sel += " and \"time\" < to_timestamp('"+endTime+"','yyyy-mm-dd hh24:mi:ss.ff6')+1";
            }
            if (!title.equals("")) {
                sel += " and \"title\" like '%" + title + "%'";
            }
            if (!source.equals("")) {
                sel += " and \"source\" like '%" +  source + "%'";
            }
            if (!status.equals("")) {
                if (status.equals("-1")) {
                    sel += " and \"state\" is null";
                } else {
                    sel += " and \"state\" =" + status;
                }
            }else{
                sel += " and (\"state\" is null or \"state\"='1' or \"state\" ='0' )";
            }
            List<Map> list1 = getBySqlMapper.findRecords(sql + sel + " order by \"time\" desc");
            for(Map map:list1){
                if (map.get("content") == null) {
                    map.put("content", "");
                } else {
                    CLOB clob = (CLOB) map.get("content");
                    String content = clob.getSubString(1, (int) clob.length());
                    map.put("content", content);
                }
                String state = map.get("state")==null?"":map.get("state").toString();
                switch (state){
                    case "0":
                        state="已通过";
                        break;
                    case "1":
                        state="未通过";
                        break;
                    default:
                        state="未审核";
                        break;
                }
                map.put("state",state);
            }
            String[] heasers = {"舆情ID", "地址", "标题", "正文", "来源",  "抓取时间", "摘要",
                    "类型", "域名", "省", "市", "县", "DICT_土壤资讯分类",
                    "审核状态", "经度", "纬度"};
            String[] fields = {"newsid", "url", "title", "content", "source", "time",  "summary",
                    "newsType", "domain", "chinaRegion1", "chinaRegion2", "chinaRegion3", "DICT_type",
                    "state",  "lon", "lat"};
            String path= XSSFExcelUtils.exportDataToExcel(list1, fields, heasers, "舆情数据",urlUtil.geturl());
            if(null!=path){
                return EdatResult.ok(path);
            }
            return EdatResult.build(1,"fail");
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1,"fail");
        }

    }

    @RequestMapping( "getRegion" )
    public EdatResult getRegion(HttpServletRequest request, HttpServletResponse response) {

        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            Map result = new HashMap();
            String sql="select \"code\",\"name\" from \"tb_city\" where \"level\" = 0 order by \"code\" asc";
            String sql1="select \"code\",\"name\" from \"tb_city\" where \"level\" = 1 order by \"code\" asc";
            String sql2="select \"code\",\"name\" from \"tb_city\" where \"level\" = 2 order by \"code\" asc";
            result.put("province",getBySqlMapper.findRecords(sql));
            result.put("city",getBySqlMapper.findRecords(sql1));
            result.put("country",getBySqlMapper.findRecords(sql2));
            return EdatResult.ok(result);
        }catch (Exception e){
            e.printStackTrace();
            return EdatResult.build(1,"fail");
        }
    }
}
