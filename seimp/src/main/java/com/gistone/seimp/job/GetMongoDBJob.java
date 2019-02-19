package com.gistone.seimp.job;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;

import oracle.jdbc.driver.OracleConnection;
import oracle.sql.CLOB;

import org.apache.poi.util.StringUtil;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.Reader;
import java.io.StringReader;
import java.sql.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import javax.sql.DataSource;

/**
 * 定时请求舆情数据
 *
 * @author szz
 * @create 2017/10/19
 */
@Configuration
@EnableScheduling //启用定时任务
public class GetMongoDBJob {
	
	@Autowired
	DataSource dataSource;

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    @Autowired
    private LogToDb logToDb;

    @Value( "${spring.datasource.driver-class-name}" )
    String driver;
    @Value( "${spring.datasource.url}" )
    String strUrl;
    @Value( "${spring.datasource.username}" )
    String databaseUserame;
    @Value( "${spring.datasource.password}" )
    String databasePwd;

   /* private static final String[] arr1 = {"有色金属", "贵金属", "冶炼", "铜矿", "铅锌", "镍钴", "锡", "锑", "铝", "金矿", "银矿", "钨钼矿", "稀土", "石油", "化工", "农药", "涂料", "油墨", "颜料", "染料", "塑料", "树脂", "合成纤维", "炸药", "化学", "助剂", "涤纶", "氨纶", "电镀", "金属制品", "制革", "皮革", "毛皮", "制皮", "焦化", "炼焦", "铬", "镉", "汞", "铅", "砷", "多环芳烃", "石油烃", "尾矿", "矸石", "氰化钠", "石膏", "煤灰", "赤泥", "炼渣", "石渣", "铬渣", "砷渣", "危险废物", "危废", "固体废物", "固废"};
    private static final String[] arr2 = {"耕地", "土地", "农田", "土壤", "地面"};*/

   /* @Scheduled(cron = "0 0 0 * * ?")*/
//    @Scheduled( fixedDelay = 7200000 )
//    @Scheduled( fixedDelay = 4 * 60 * 60 * 1000 )===
    @SuppressWarnings("all")
//	@Scheduled( fixedDelay = 7200000 )
    public void getMongoDB() {
    	long startTime = System.currentTimeMillis(); //程序开始记录时间
    	System.out.println("================计时开始================");
    	logToDb.addSysLog("开始更新舆情数据 ");
        System.out.println("================ 开始更新舆情数据  ================");
        
        //先获取id集合
        //
        String sqlnews = "select \"newsid\" from tbnews  ";
        List<Map> listnews = getBySqlMapper.findRecords(sqlnews);
        List<String> newidList = new ArrayList<String>();
        for (Map map : listnews) {
        	if(map != null && map.get("newsid") != null){
        		newidList.add(map.get("newsid").toString());
        	}
		}
        String sqlnetwork = "select \"newsid\" from \"tb_network_news\"";
        List<Map> listnetwork = getBySqlMapper.findRecords(sqlnetwork);
        List<String> networkidList = new ArrayList<String>();
        for (Map map : listnetwork) {
        	if(map != null && map.get("newsid") != null){
        		networkidList.add(map.get("newsid").toString());
        	}
		}
        
        //查询时间
        String sqlTime = "select to_char(max(TIME), 'YYYY-MM-DD HH:MI:SS')  MAXTIME from (" +
        			" select max(UPDATETIME) TIME from TBNEWS where \"newsid\" is not NULL " +
        				" union all " +
        				" select max(\"fetchTime\") TIME from \"tb_network_news\" where \"newsid\" is not NULL)";
        List<Map> listTime = getBySqlMapper.findRecords(sqlTime);
        String maxTime = null;
        if(listTime.size() > 0){
        	if(listTime.get(0) != null && listTime.get(0).get("MAXTIME") !=null){
        		maxTime = listTime.get(0).get("MAXTIME").toString();
        	}
        }
        
        
//        maxTime = "2018-05-01 00:00:00";
        DateFormat dft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Statement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        long t1 = System.currentTimeMillis();
        int num1=0;
        int num2=0;
        try {
            MongoClient mongoClient = new MongoClient("183.174.228.5", 1241);
            //连接到数据库
            MongoDatabase mongoDatabase = mongoClient.getDatabase("cnnews");
            System.out.println(dft.format(new Date()) + " Connect MongoDB Successfully！");
            //获取集合 参数为“集合名称”
            MongoCollection<Document> mongoCollection = mongoDatabase.getCollection("HuanbaoDocs_turang");
            Class.forName(driver);
//            conn = DriverManager.getConnection(strUrl, databaseUserame, databasePwd);
            conn = dataSource.getConnection();
            CallableStatement proc = null; //创建执行存储过程的对象
            /**/
            //检索所有文档
            /**
             * 1. 获取迭代器FindIterable<Document> 
             * 2. 获取游标MongoCursor<Document> 
             * 3. 通过游标遍历检索出的文档集合 
             * */
            BasicDBObject gt = new BasicDBObject("$gte", dft.parse(maxTime));
            BasicDBObject queryObject = new BasicDBObject("time",gt);
            FindIterable<Document> findIterable = null;
            DBCursor cursor  = null;
            if(maxTime != null && !maxTime.equals("")){
            	findIterable = mongoCollection.find(queryObject).batchSize(30);
            }else{
            	findIterable = mongoCollection.find().batchSize(30);
            }
            MongoCursor<Document> mongoCursor = findIterable.iterator();
            int count = 0;
           
            
            while (mongoCursor.hasNext()) {
            	 count++;
//            	 System.out.println(count);
            	 
            	//遍历集合开始==
            	 Document doc = mongoCursor.next();
                
            	 
            	 
                if (doc == null || doc.get("_id") == null) {
                    continue;
                }
                //获取数据信息
                ArrayList<Document> docDatas = (ArrayList<Document>) doc.get("docDatas");
                String summary = "";
                String newsType = "";
                String domain = "";
                String chinaRegion1 = "";
                String chinaRegion2 = "";
                String chinaRegion3 = "";
                String DICT_type = "";
                if (docDatas != null && docDatas.size() > 0) {
                    for (int i = 0; i < docDatas.size(); i++) {
                        Document data = docDatas.get(i);
                        if ("Summary".equals(data.get("dname"))) {
                            summary = data.get("dvalues").toString();
                            summary = summary.substring(1, summary.length() - 1);
                        } else if ("NewsType".equals(data.get("dname"))) {
                            newsType = data.get("dvalues").toString();
                            newsType = newsType.substring(1, newsType.length() - 1);
                        } else if ("Domain".equals(data.get("dname"))) {
                            domain = data.get("dvalues").toString();
                            domain = domain.substring(1, domain.length() - 1);
                        } else if ("ChinaRegion1".equals(data.get("dname"))) {
                            chinaRegion1 = data.get("dvalues").toString();
                            chinaRegion1 = chinaRegion1.substring(1, chinaRegion1.length() - 1);
                        } else if ("ChinaRegion2".equals(data.get("dname"))) {
                            chinaRegion2 = data.get("dvalues").toString();
                            chinaRegion2 = chinaRegion2.substring(1, chinaRegion2.length() - 1);
                        } else if ("ChinaRegion3".equals(data.get("dname"))) {
                            chinaRegion3 = data.get("dvalues").toString();
                            chinaRegion3 = chinaRegion3.substring(1, chinaRegion3.length() - 1);
                        } else if ("DICT_土壤资讯分类".equals(data.get("dname"))) {
                            DICT_type = data.get("dvalues").toString();
                            DICT_type = DICT_type.substring(1, DICT_type.length() - 1);
                        }
                    }
                }
                String id = doc.get("_id").toString();
                //土壤资讯入库tbnews
                if (newsType.equals("土壤资讯")) {
//                    String sql1 = "select * from tbnews where \"newsid\" = '" + id + "'";
//                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    //根据newsid排重
                    if (!newidList.contains(id)) {
                        String time = doc.getDate("time") == null ? "" : dft.format(doc.getDate("time"));
                        String source = doc.get("source") == null ? "" : doc.get("source").toString();
                        String content = doc.get("content") == null ? "" : doc.get("content").toString();
                        String url = doc.get("url") == null ? "" : doc.get("url").toString();
                        String title = doc.get("title") == null ? "" : doc.get("title").toString();
                        DICT_type.replaceAll(" ", "");
                        String[] arr = DICT_type.split(",|，");
                        List list5 = new ArrayList();
                        for (int i = 0; i < arr.length; i++) {
                            String tem = arr[i].trim();
                            if (!tem.equals("")) {
                                list5.add(tem);
                            }
                        }
                        Set strSet = new HashSet<>();
                        strSet.addAll(list5);
                        String[] arr1 = (String[]) strSet.toArray(new String[strSet.size()]);
                        DICT_type = StringUtil.join(arr1, ",");
                            //未入库数据入库
                        proc = conn.prepareCall("{ call INSERTNEWSFROMNET(?,?,?,?,?,?,?,?,?,?,?)}");
                        proc.setString(1, title);//
                        proc.setString(2, "");//
                        proc.setString(3, source);//
                        proc.setString(4, "");//
                        proc.setString(5, time);//
//                        CLOB clob = new CLOB((OracleConnection) conn);
//                        clob = oracle.sql.CLOB.createTemporary((OracleConnection) conn, true, 1);
//                        clob.setString(1, content);
//                        proc.setClob(6, clob);
                        Reader clobReader = new StringReader(content);
                        proc.setCharacterStream(6, clobReader, content.length());
                        proc.setString(7, DICT_type);//
                        proc.setString(8, url);//
                        proc.setString(9, id);//
                        proc.setString(10, summary);//
                        proc.setString(11, domain);//
                        proc.execute();//执行
                        proc.close();
                        num1++;
                    }
                } else if (newsType.equals("土壤舆情")) {
//                    String sql1 = "select * from \"tb_network_news\" where \"newsid\" = '" + id + "'";
//                    List<Map> list = getBySqlMapper.findRecords(sql1);
                    //根据newsid排重
                	 if (!networkidList.contains(id)) {
                        String time = doc.getDate("time") == null ? "" : dft.format(doc.getDate("time"));
                        String source = doc.get("source") == null ? "" : doc.get("source").toString();
                        String content = doc.get("content") == null ? "" : doc.get("content").toString();
                        String url = doc.get("url") == null ? "" : doc.get("url").toString();
                        String title = doc.get("title") == null ? "" : doc.get("title").toString();
                        DICT_type.replaceAll(" ", "");
                        String[] arr = DICT_type.split(",|，");
                        List list5 = new ArrayList();
                        for (int i = 0; i < arr.length; i++) {
                            String tem = arr[i].trim();
                            if (!tem.equals("")) {
                                list5.add(tem);
                            }
                        }
                        Set strSet = new HashSet<>();
                        strSet.addAll(list5);
                        String[] arr1 = (String[]) strSet.toArray(new String[strSet.size()]);
                        DICT_type = StringUtil.join(arr1, ",");
                        proc = conn.prepareCall("{ call INSERTNETWORKNEWS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) }");
                        proc.setString(1, id);//
                        proc.setString(2, url);//
                        proc.setString(3, doc.get("urlHash") == null ? "" : doc.get("urlHash").toString());//
                        proc.setString(4, title);//
//                        CLOB clob = new CLOB((OracleConnection) conn);
//                        clob = oracle.sql.CLOB.createTemporary((OracleConnection) conn, true, 1);
//                        clob.setString(1, content);
//                        proc.setClob(5, clob);//
                        Reader clobReader = new StringReader(content);
                        proc.setCharacterStream(5, clobReader, content.length());
                        proc.setString(6, source);//
                        proc.setString(7, time);//
                        proc.setString(8, doc.getDate("fetchTime") == null ? "" : dft.format(doc.getDate("fetchTime")));//
                        proc.setString(9, summary);//
                        proc.setString(10, newsType);//
                        proc.setString(11, domain);//
                        proc.setString(12, chinaRegion1);//
                        proc.setString(13, chinaRegion2);//
                        proc.setString(14, chinaRegion3);//
                        proc.setString(15, DICT_type);//
                        proc.setString(16, doc.get("encoding") == null ? "" : doc.get("encoding").toString());//
                        proc.setString(17, doc.get("codePage") == null ? "" : doc.get("codePage").toString());//
                        proc.execute();
                        proc.close();
                        num2++;
                    }
                }
                
                
                
                
            }
            long t2 = System.currentTimeMillis();
            System.out.println("================ 更新舆情数据完成,耗时：" + (t2 - t1)/1000 + "s,更新资讯"+num1+"条，舆情"+num2+"条  ================");
            logToDb.addSysLog("更新舆情数据完成,耗时：" + (t2 - t1)/1000 + "s,更新资讯"+num1+"条，舆情"+num2+"条");
            
            long endTime   = System.currentTimeMillis(); //程序结束记录时间
        	long TotalTime = endTime - startTime;
        	System.err.println(TotalTime);
        } catch (SQLException ex2) {
        	
        	
            ex2.printStackTrace();
            System.out.println("================ 更新舆情数据异常 ================");
        } catch (Exception e) {
        	
        	
            e.printStackTrace();
            System.out.println("================ 更新舆情数据异常 ================");
        } finally {
        	System.out.println("================计时结束================");
        	long endTime   = System.currentTimeMillis(); //程序结束记录时间
        	long TotalTime = endTime - startTime;
        	System.err.println("计时时间=="+TotalTime);
        	
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
                ex1.printStackTrace();
            }
        }
    }


    /*定时更新元数据数量*/
//    @Scheduled( cron = "0 0 6 * * ?" )===
//    @Scheduled( cron = "0 * * * * ?" )
//    @Scheduled( fixedDelay = 7200000 )
    public void refreshRecordNum() {
        try {
            System.out.println("================ 开始更新元数据数量  ================");
            String sql = "select \"id\",\"table_name\" from \"tb_source_metadata\" where \"table_name\" is not null";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            for (Map map : list1) {
            	System.err.println(map.get("table_name").toString());
                String sql0 = "SELECT COUNT(1) FROM User_Tables WHERE table_name = '" + map.get("table_name").toString() + "'";
                int flag = getBySqlMapper.findrows(sql0);
                if (flag == 1) {
                    String sql1 = "select count(1) from \"" + map.get("table_name").toString() + "\"";
                    int num = getBySqlMapper.findrows(sql1);
                    String modsql = "update \"tb_source_metadata\" set \"serviceAccount\" = " + num + " where \"id\" = " + map.get("id").toString();
                    getBySqlMapper.update(modsql);
                }
            }
            System.out.println("================ 更新元数据数量完成  ================");
        } catch (Exception e) {
              e.printStackTrace();
        }
    }


    /*定时12369数据打标，是否土壤相关SOIL_RELATED：1相关，0不相关，null未打标*/
   /* @Scheduled( cron = "0 0 4 * * ?" )*/
 /*   public void markNews() {
        try {
            System.out.println("================ 开始12369数据打标  ================");
            String sql = "select REPORT_ID,REPORT_CONTENT from YQ12369_DSJ_REPORTINFO where SOIL_RELATED IS NULL ";
            List<Map> list1 = getBySqlMapper.findRecords(sql);
            int flag;
            for (Map map : list1) {
                if (map.get("REPORT_CONTENT") != null) {
                    CLOB clob = (CLOB) map.get("REPORT_CONTENT");
                    String content = clob.getSubString(1, (int) clob.length());
                    if (mark(content)) {
                        flag = 1;
                    } else {
                        flag = 0;
                    }
                } else {
                    flag = 0;
                }
                String sql1 = "update YQ12369_DSJ_REPORTINFO set SOIL_RELATED = " + flag + " where  REPORT_ID = '" + map.get("REPORT_ID").toString() + "'";
                getBySqlMapper.update(sql1);
            }
            System.out.println("================ 12369数据打标完成  ================");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static boolean mark(String news) {
        try {
            for (String str : arr2) {
                if (news.contains(str)) {
                    for (String str1 : arr1) {
                        if (news.contains(str1)) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }*/
}