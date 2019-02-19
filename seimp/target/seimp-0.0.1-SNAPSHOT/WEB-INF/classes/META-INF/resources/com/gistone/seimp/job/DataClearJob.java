package com.gistone.seimp.job;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.UrlsUtil;
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

import java.io.File;
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
@SuppressWarnings("all")
public class DataClearJob {
	
	@Autowired
	DataSource dataSource;

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    @Autowired
    private LogToDb logToDb;

    @Autowired
	private UrlsUtil urlsUtil;
   


    /*定时更新元数据数量*/
//    @Scheduled( cron = "0 0 6 * * ?" )===
    @Scheduled( cron = "0 0 0 * * ?" )
//    @Scheduled( cron = "0 * * * * ?" )
//    @Scheduled( fixedDelay = 7200000 )
    public void dataFileClear() {
        try {
        	
        	//前一天时间
        	Calendar cal = Calendar.getInstance();
        	cal.add(Calendar.DAY_OF_YEAR, -1);
        	long yesterdayTime = cal.getTime().getTime();
        	
			String url = urlsUtil.geturl();
        	url += "excelL/";
        	File fileDir = new File(url);
        	if(fileDir.exists() && fileDir.isDirectory()){
        		File[] files = fileDir.listFiles();
        		for (File file : files) {
					if(file.isFile()){
						long lastModified = file.lastModified();
						if(yesterdayTime > lastModified){
							file.delete();
						}
						
					}
				}
        	}
        	
            System.out.println("================ 文件清理完成  ================");
        } catch (Exception e) {
              e.printStackTrace();
        }
    }


   
}