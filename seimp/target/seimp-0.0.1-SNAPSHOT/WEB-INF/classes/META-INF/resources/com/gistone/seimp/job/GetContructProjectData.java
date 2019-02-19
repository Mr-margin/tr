package com.gistone.seimp.job;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.RegUtil;
import com.gistone.seimp.util.UrlsUtil;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;

/**
 * Created by qiang on 2018/4/3.
 */
@Configuration
@EnableScheduling //启用定时任务
public class GetContructProjectData {
    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private LogToDb logToDb;
    @Autowired
    private UrlsUtil urlUtil;

//    @Scheduled(cron = "0 0 1 * * ?")===
    @SuppressWarnings("all")
//	@Scheduled(fixedDelay = 7200000)
    public void getContructData() {
        try {
            System.out.println("================ 开始更新建设项目数据  ================");
            logToDb.addSysLog("开始更新建设项目数据");
            JSONArray array = new JSONArray();
            String sql2 = "SELECT \"MAX\"(STORAGETIME) STORAGETIME from YZ_CONS";
            List<Map> list = getBySqlMapper.findRecords(sql2);
            String startTime = "";
            long t1 = System.currentTimeMillis();
            if (list.size() > 0 && list.get(0) != null && list.get(0).get("STORAGETIME") != null) {
                startTime = list.get(0).get("STORAGETIME").toString().substring(0, 10);
            }
            int page = 1;
            int total = 0;
            while ((array = getInfor(page++, startTime)).size() > 0) {
            	
            	System.out.println("接收数据：" + (5000 * (page - 1)));
            	
                for (int i = 0; i < array.size(); i++) {
                    JSONObject tem = array.getJSONObject(i);
                    
                    
                    
                    if (!tem.has("constructionId") || tem.getString("constructionId").equals("")) {
                        continue;
                    }
                    String constructionId = tem.getString("constructionId").trim();
                    String sql1 = "select 1 from \"YZ_CONS\" where \"CONSTRUCTIONID\" = '" + constructionId + "'";
                    if (getBySqlMapper.findRecords(sql1).size() > 0) {
                        continue;
                    }
                    String projectname = RegUtil.checkParam(tem.getOrDefault("projectname", "").toString());
                    String eiafiletype = RegUtil.checkParam(tem.getOrDefault("eiafiletype", "").toString());
                    String acceptancedate = RegUtil.checkParam(tem.getOrDefault("acceptancedate", "").toString());
                    String nationaleconomycode = RegUtil.checkParam(tem.getOrDefault("nationaleconomycode", "").toString());
                    String datasource = RegUtil.checkParam(tem.getOrDefault("datasource", "").toString());
                    String eiamanagetype = RegUtil.checkParam(tem.getOrDefault("eiamanagetype", "").toString());
                    String projectaddress = RegUtil.checkParam(tem.getOrDefault("projectaddress", "").toString());
                    String provincename = RegUtil.checkParam(tem.getOrDefault("provincename", "").toString());
                    String longitude = RegUtil.checkParam(tem.getOrDefault("longitude", "").toString());
                    String latitude = RegUtil.checkParam(tem.getOrDefault("latitude", "").toString());
                    String nationaleconomyname = RegUtil.checkParam(tem.getOrDefault("nationaleconomyname", "").toString());
                    String eiamanagename = RegUtil.checkParam(tem.getOrDefault("eiamanagename", "").toString());
                    String storageTime = RegUtil.checkParam(tem.getOrDefault("storageTime", "").toString());
                    String projectinvest = RegUtil.checkParam(tem.getOrDefault("projectinvest", "").toString());
                    String environinvest = RegUtil.checkParam(tem.getOrDefault("environinvest", "").toString());
                    String delmark = RegUtil.checkParam(tem.getOrDefault("delmark", "").toString());
                    String consreportPath = "";
                    if (tem.has("filePath")) {
                        JSONObject jsonObject = tem.getJSONObject("filePath");
                        if (jsonObject != null && jsonObject.getString("consreportPath") != null) {
                            consreportPath = RegUtil.checkParam(jsonObject.getOrDefault("consreportPath", "").toString());
                        }
                    }
                    String sql = " INSERT INTO \"YZ_CONS\" (\"CONSTRUCTIONID\", \"PROJECTNAME\", \"EIAFILETYPE\", \"ACCEPTANCEDATE\", \"NATIONALECONOMYCODE\","
                            + " \"DATASOURCE\",\"EIAMANAGETYPE\", \"PROJECTADDRESS\", \"PROJECTINVEST\", \"ENVIRONINVEST\", \"PROVINCENAME\", \"DELMARK\", \"LONGITUDE\", "
                            + "\"LATITUDE\", \"NATIONALECONOMYNAME\",\"EIAMANAGENAME\", \"STORAGETIME\", \"CONSREPORTPATH\",\"INSERTTIME\",\"ISDOWNLOADED\") VALUES " + "('" + constructionId + "','" + projectname + "', '" + eiafiletype + "','" + acceptancedate + "', '" + nationaleconomycode + "', '" + datasource + "', '" + eiamanagetype + "', '" + projectaddress + "', '" + projectinvest + "', '" + environinvest + "', '" + provincename + "','" + delmark + "', '" + longitude + "','" + latitude + "', '" + nationaleconomyname + "','" + eiamanagename + "', '" + storageTime + "', '" + consreportPath + "',sysdate,1)";
                    getBySqlMapper.insert(sql);
                    if (!consreportPath.equals("")&&consreportPath.length()>40) {
                        String[] urls = consreportPath.substring(40,consreportPath.length()).split("\\|");
                        String header="http://10.102.33.169:8080/ftp_downdload/";
                        for (String tem1 : urls) {
                            String sql11 = "INSERT INTO \"YZ_CONS_FILE\" (\"ID\", \"CONSTRUCTIONID\",  \"REMOTEURL\", \"UPDATETIME\", \"STATE\", \"FILENAME\") VALUES " +
                                    "(YZ_CONS_FILE_SEQ.nextval, '" + constructionId + "','" + header+tem1 + "',sysdate, 1, '" + getStrName(tem1) + "')";
                            getBySqlMapper.insert(sql11);
                        }
                    }
                    total++;
                }
            }
            long t2 = System.currentTimeMillis();
            logToDb.addSysLog("建设项目数据更新完成，共计用时" + (t2 - t1) / 1000 + "秒，更新数据" + total + "条");
            System.out.println("================ 更新建设项目数据完成,插入" + total + "条数据  ================");
        } catch (Exception e) {
            e.printStackTrace();
            logToDb.addSysLog("更新建设项目数据异常");
            System.out.println("================ 更新建设项目数据异常  ================");
        }
    }


    public static JSONArray getInfor(int page, String startTime) {
        String str = "";
        JSONArray array = new JSONArray();
        try {
            //获取建设项目URL接口地
            String endpointAddress = "http://10.102.33.164:8080/EIAITM/services/yzZbinfo/yzZbInterface/qcconsProject?";
            if (!startTime.equals("")) {
                endpointAddress += "beginStorageTime=" + startTime + "+00:00:00&";
            }
            endpointAddress += "pageReg=" + page + "&rowsReg=5000";
            URL url = new URL(endpointAddress);
            InputStream in = url.openStream();
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(in, "utf-8"));
            String s = "";
            String xml = "";
            StringBuilder sb = new StringBuilder();
            while ((s = bufferedReader.readLine()) != null) {
                sb.append(s);
            }
            xml = sb.toString();
            xml=xml.substring(131,xml.length()-34);
            xml = xml.replaceAll("<", "&lt;");
            xml = xml.replaceAll(">", "&gt;");
            xml = xml.replaceAll("&", "&amp;");
     /*       Document doc = DocumentHelper.parseText(xml);
            Element elementRoot = doc.getRootElement();
            str = elementRoot.element("PROJECTLIST").getText();
            str=str.substring(13,str.length()-6);
            System.out.println(str);*/
            array = JSONArray.fromObject(xml);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return array;
    }

    /*    @Scheduled(cron = "0 0 3 * * ?")*/
   // @Scheduled(fixedDelay = 7200000)
    public void downloadConsFiles() {
        System.out.println("================ 开始建设项目文件下载  ================");
        String dir = urlUtil.geturl() + "/YZ_CONS/";
        logToDb.addSysLog("开始建设项目文件下载");
        long t1=System.currentTimeMillis();
        String sql = "select ID,REMOTEURL from \"YZ_CONS_FILE\" where \"STATE\" = 1";
        List<Map> list = getBySqlMapper.findRecords(sql);
        int total=0;
        try {
            for (Map map : list) {
                String id = map.get("ID").toString();
                String url = map.get("REMOTEURL").toString();
                    try {
                        String url1 = downRemoteFile(url, dir);
                        if (!url1.equals("")) {
                            String sql1 = "UPDATE \"YZ_CONS_FILE\" SET \"URL\" = '"+url1+"', \"STATE\" = 0 ,\"UPDATETIME\" = sysdate WHERE  \"ID\" = "+id+"";
                            getBySqlMapper.insert(sql1);
                            total++;
                            if(total>100){
                                break;
                            }
                        }else {
                            System.out.println(url+":下载失败");
                            logToDb.addSysLog(url+":下载失败");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        System.out.println(url+":下载异常");
                        logToDb.addSysLog(url+":下载异常");
                    }
            }
            long t2 = System.currentTimeMillis();
            System.out.println("================ 建设项目文件下载完成,下载"+total+"个文件,耗时："+(t2-t1)/1000+"s  ================");
            logToDb.addSysLog("建设项目文件下载完成,下载"+total+"个文件,耗时："+(t2-t1)/1000+"s");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("================ 建设项目文件下载异常,下载"+total+"个文件  ================");
            logToDb.addSysLog("建设项目文件下载异常,下载"+total+"个文件");
        }
    }

    public static String downRemoteFile(String remoteFileUrl, String saveDir) {
        HttpURLConnection conn = null;
        OutputStream oputstream = null;
        InputStream iputstream = null;
        String fileName = getStrName(remoteFileUrl);
        try {
            // 创建保存文件的目录
            StringBuffer sb = new StringBuffer();
            for (int i = 0; i < remoteFileUrl.length(); i++) {
                char a = remoteFileUrl.charAt(i);
                if (a > 127) {//将中文UTF-8编码
                    sb.append(URLEncoder.encode(String.valueOf(a), "utf-8"));
                } else {
                    sb.append(String.valueOf(a));
                }
            }
            URL url = new URL(sb.toString());
            // 此时cnnection只是为一个连接对象,待连接中
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            // 设置是否要从 URL连接读取数据,默认为true
            conn.setDoInput(true);
            conn.setConnectTimeout(2000);
            // 建立连接
            // (请求未开始,直到connection.getInputStream()方法调用时才发起,以上各个参数设置需在此方法之前进行)
            conn.connect();
            // 连接发起请求,处理服务器响应 (从连接获取到输入流)
            iputstream = conn.getInputStream();
            File savePath = new File(saveDir);
            if (!savePath.exists()) {
                savePath.mkdirs();
            }
            // 创建保存的文件
            File file = new File(savePath + "/" + fileName);
            if (file != null && !file.exists()) {
                file.createNewFile();
            }
            // 创建文件输出流，用于保存下载的远程文件
            oputstream = new FileOutputStream(file);
            byte[] buffer = new byte[4 * 1024];
            int byteRead = -1;
            while ((byteRead = (iputstream.read(buffer))) != -1) {
                oputstream.write(buffer, 0, byteRead);
            }
            oputstream.flush();
            return "Files/YZ_CONS/" + fileName;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        } finally {
            try {
                //  重要且易忽略步骤 (关闭流,切记!)
                if (iputstream != null) {
                    iputstream.close();
                }
                if (oputstream != null) {
                    oputstream.close();
                }
                // 销毁连接
                if (conn != null) {
                    conn.disconnect();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        // 返回保存后的文件路径
    }

    public static String getStrName(String url) {
        String[] sarry = url.split("/");
        return sarry[sarry.length - 1];
    }
    
    /*******************接受审批登记表解析数据**********************/
//    @Scheduled(cron = "0 30 0 * * ?")===
    @SuppressWarnings("all")
//    @Scheduled(fixedDelay = 7200000)
    public void getBegFormData() {
        try {
            System.out.println("================ 开始更新建设项目审批登记表解析数据  ================");
            logToDb.addSysLog("开始更新建设项目审批登记表解析数据");
            JSONArray array = new JSONArray();
            String sql2 = "SELECT \"MAX\"(MODIFYTIMESTRREGFORM) MODIFYTIMESTRREGFORM from YZ_CONS_REGFORM";
            List<Map> list = getBySqlMapper.findRecords(sql2);
            String startTime = "";
            long t1 = System.currentTimeMillis();
            if (list.size() > 0 && list.get(0) != null && list.get(0).get("MODIFYTIMESTRREGFORM") != null) {
                startTime = list.get(0).get("MODIFYTIMESTRREGFORM").toString().substring(0, 10);
            }
            int page = 1;
            int total = 0;
            while ((array = getBegFormInfor(page++, startTime)).size() > 0) {
            	
            	System.out.println("接收数据：" + (5000 * (page - 1)));
            	
                for (int i = 0; i < array.size(); i++) {
                    JSONObject tem = array.getJSONObject(i);
                    
//                    System.out.println(tem);
                    
                    if (!tem.has("constructionId") || tem.getString("constructionId").equals("")) {
                        continue;
                    }
                    String constructionId = tem.getString("constructionId").trim();
                    String sql1 = "select 1 from \"YZ_CONS_REGFORM\" where \"CONSTRUCTIONID\" = '" + constructionId + "'";
                    if (getBySqlMapper.findRecords(sql1).size() > 0) {
                        continue;
                    }
                    
                    if(constructionId.equals("1ea1c3d66a3a45a09b02170618cad833")){
                    	int ii = 23;
                    }
                    
                    String projectnameregform = RegUtil.checkParam(tem.getOrDefault("projectnameRegform", "").toString());
                    String isnew = RegUtil.checkParam(tem.getOrDefault("isnew", "").toString());
                    String projectcode = RegUtil.checkParam(tem.getOrDefault("projectcode", "").toString());
                    String projectaddressregform = RegUtil.checkParam(tem.getOrDefault("projectaddressRegform", "").toString());
                    String projectscalecontent = RegUtil.checkParam(tem.getOrDefault("projectscalecontent", "").toString());
                    String creditcode = RegUtil.checkParam(tem.getOrDefault("creditcode", "").toString());
                    String plantime = RegUtil.checkParam(tem.getOrDefault("plantime", "").toString());
                    String projectlifecycle = RegUtil.checkParam(tem.getOrDefault("projectlifecycle", "").toString());
                    String predicttime = RegUtil.checkParam(tem.getOrDefault("predicttime", "").toString());
                    String nationaleconomycoderegform = RegUtil.checkParam(tem.getOrDefault("nationaleconomycodeRegform", "").toString());
                    String projectjsnatureregform = RegUtil.checkParam(tem.getOrDefault("projectjsnatureRegform", "").toString());
                    String licensenumber = RegUtil.checkParam(tem.getOrDefault("licensenumber", "").toString());
                    String applicationcategory = RegUtil.checkParam(tem.getOrDefault("applicationcategory", "").toString());
                    String longituderegform = RegUtil.checkParam(tem.getOrDefault("longitudeRegform", "").toString());
                    String beginlongitude = RegUtil.checkParam(tem.getOrDefault("beginlongitude", "").toString());
                    String endlongitude = RegUtil.checkParam(tem.getOrDefault("endlongitude", "").toString());
                    String latituderegform = RegUtil.checkParam(tem.getOrDefault("latitudeRegform", "").toString());
                    String beginlatitude = RegUtil.checkParam(tem.getOrDefault("beginlatitude", "").toString());
                    String endlatitude = RegUtil.checkParam(tem.getOrDefault("endlatitude", "").toString());
                    String eiamanagetyperegform = RegUtil.checkParam(tem.getOrDefault("eiamanagetypeRegform", "").toString());
                    String projectinvestregform = RegUtil.checkParam(tem.getOrDefault("projectinvestRegform", "").toString());
                    String environinvestregform = RegUtil.checkParam(tem.getOrDefault("environinvestRegform", "").toString());
                    String investproportion = RegUtil.checkParam(tem.getOrDefault("investproportion", "").toString());
                    String constructunitnameregform = RegUtil.checkParam(tem.getOrDefault("constructunitnameRegform", "").toString());
                    String constructunitaddress = RegUtil.checkParam(tem.getOrDefault("constructunitaddress", "").toString());
                    String fsexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("fsExistactualemispotency", "").toString());
                    String fsexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("fsExistallowemispotency", "").toString());
                    String fsthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("fsThisforecastemispotency", "").toString());
                    String fsoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("fsOveralnewoldabatement", "").toString());
                    String fsoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("fsOveralreplaceabatement", "").toString());
                    String fsoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("fsOveralforecastemistotal", "").toString());
                    String fsoveralemisabatement = RegUtil.checkParam(tem.getOrDefault("fsOveralemisabatement", "").toString());
                    String codexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("codExistactualemispotency", "").toString());
                    String codexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("codExistallowemispotency", "").toString());
                    String codthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("codThisforecastemispotency", "").toString());
                    String codoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("codOveralnewoldabatement", "").toString());
                    String codoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("codOveralreplaceabatement", "").toString());
                    String codoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("codOveralforecastemistotal", "").toString());
                    String codoveralemisabatement = RegUtil.checkParam(tem.getOrDefault("codOveralemisabatement", "").toString());
                    String zlexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("zlExistactualemispotency", "").toString());
                    String zlexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("zlExistallowemispotency", "").toString());
                    String zlthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("zlThisforecastemispotency", "").toString());
                    String zloveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("zlOveralnewoldabatement", "").toString());
                    String zloveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("zlOveralreplaceabatement", "").toString());
                    String zloveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("zlOveralforecastemistotal", "").toString());
                    String zloveralemisabatement = RegUtil.checkParam(tem.getOrDefault("zlOveralemisabatement", "").toString());
                    String zdexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("zdExistactualemispotency", "").toString());
                    String zdexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("zdExistallowemispotency", "").toString());
                    String zdthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("zdThisforecastemispotency", "").toString());
                    String zdoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("zdOveralnewoldabatement", "").toString());
                    String zdoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("zdOveralreplaceabatement", "").toString());
                    String zdoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("zdOveralforecastemistotal", "").toString());
                    String zdoveralemisabatement = RegUtil.checkParam(tem.getOrDefault("zdOveralemisabatement", "").toString());
                    String klwexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("klwExistactualemispotency", "").toString());
                    String klwexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("klwExistallowemispotency", "").toString());
                    String klwthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("klwThisforecastemispotency", "").toString());
                    String klwoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("klwOveralnewoldabatement", "").toString());
                    String klwoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("klwOveralreplaceabatement", "").toString());
                    String klwoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("klwOveralforecastemistotal", "").toString());
                    String klwoveralemisabatement = RegUtil.checkParam(tem.getOrDefault("klwOveralemisabatement", "").toString());
                    String hfxyjwexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("hfxyjwExistactualemispotency", "").toString());
                    String hfxyjwexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("hfxyjwExistallowemispotency", "").toString());
                    String hfxyjwthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("hfxyjwThisforecastemispotency", "").toString());
                    String hfxyjwoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("hfxyjwOveralnewoldabatement", "").toString());
                    String hfxyjwoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("hfxyjwOveralreplaceabatement", "").toString());
                    String hfxyjwoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("hfxyjwOveralforecastemistotal", "").toString());
                    String hfxyjwoveralemisabatement = RegUtil.checkParam(tem.getOrDefault("hfxyjwOveralemisabatement", "").toString());
                    String adexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("adExistactualemispotency", "").toString());
                    String adexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("adExistallowemispotency", "").toString());
                    String adthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("adThisforecastemispotency", "").toString());
                    String adoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("adOveralnewoldabatement", "").toString());
                    String adoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("adOveralreplaceabatement", "").toString());
                    String adoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("adOveralforecastemistotal", "").toString());
                    String adoveralemisabatementregform = RegUtil.checkParam(tem.getOrDefault("adOveralemisabatementRegform", "").toString());
                    String fqexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("fqExistactualemispotency", "").toString());
                    String fqexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("fqExistallowemispotency", "").toString());
                    String fqthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("fqThisforecastemispotency", "").toString());
                    String fqoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("fqOveralnewoldabatement", "").toString());
                    String fqoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("fqOveralreplaceabatement", "").toString());
                    String fqoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("fqOveralforecastemistotal", "").toString());
                    String fqoveralemisabatement = RegUtil.checkParam(tem.getOrDefault("fqOveralemisabatement", "").toString());
                    String eyhlexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("eyhlExistactualemispotency", "").toString());
                    String eyhlexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("eyhlExistallowemispotency", "").toString());
                    String eyhlthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("eyhlThisforecastemispotency", "").toString());
                    String eyhloveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("eyhlOveralnewoldabatement", "").toString());
                    String eyhloveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("eyhlOveralreplaceabatement", "").toString());
                    String eyhloveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("eyhlOveralforecastemistotal", "").toString());
                    String eyhloveralemisabatementregform = RegUtil.checkParam(tem.getOrDefault("eyhlOveralemisabatementRegform", "").toString());
                    String dyhwexistactualemispotency = RegUtil.checkParam(tem.getOrDefault("dyhwExistactualemispotency", "").toString());
                    String dyhwexistallowemispotency = RegUtil.checkParam(tem.getOrDefault("dyhwExistallowemispotency", "").toString());
                    String dyhwthisforecastemispotency = RegUtil.checkParam(tem.getOrDefault("dyhwThisforecastemispotency", "").toString());
                    String dyhwoveralnewoldabatement = RegUtil.checkParam(tem.getOrDefault("dyhwOveralnewoldabatement", "").toString());
                    String dyhwoveralreplaceabatement = RegUtil.checkParam(tem.getOrDefault("dyhwOveralreplaceabatement", "").toString());
                    String dyhwoveralforecastemistotal = RegUtil.checkParam(tem.getOrDefault("dyhwOveralforecastemistotal", "").toString());
                    String dyhwoveralemisabatementregform = RegUtil.checkParam(tem.getOrDefault("dyhwOveralemisabatementRegform", "").toString());
                    String emissionsway = RegUtil.checkParam(tem.getOrDefault("emissionsWay", "").toString());
                    String zrbhqname = RegUtil.checkParam(tem.getOrDefault("zrbhqName", "").toString());
                    String zrbhqlevelorkindcount = RegUtil.checkParam(tem.getOrDefault("zrbhqLevelorkindcount", "").toString());
                    String zrbhqprotectedobject = RegUtil.checkParam(tem.getOrDefault("zrbhqProtectedobject", "").toString());
                    String zrbhqinfluencesituation = RegUtil.checkParam(tem.getOrDefault("zrbhqInfluencesituation", "").toString());
                    String zrbhqistakeup = RegUtil.checkParam(tem.getOrDefault("zrbhqIstakeup", "").toString());
                    String zrbhqarea = RegUtil.checkParam(tem.getOrDefault("zrbhqArea", "").toString());
                    String zrbhqmeasures = RegUtil.checkParam(tem.getOrDefault("zrbhqMeasures", "").toString());
                    String dbsname = RegUtil.checkParam(tem.getOrDefault("dbsName", "").toString());
                    String dbslevelorkindcount = RegUtil.checkParam(tem.getOrDefault("dbsLevelorkindcount", "").toString());
                    String dbsprotectedobject = RegUtil.checkParam(tem.getOrDefault("dbsProtectedobject", "").toString());
                    String dbsinfluencesituation = RegUtil.checkParam(tem.getOrDefault("dbsInfluencesituation", "").toString());
                    String dbsistakeup = RegUtil.checkParam(tem.getOrDefault("dbsIstakeup", "").toString());
                    String dbsarea = RegUtil.checkParam(tem.getOrDefault("dbsArea", "").toString());
                    String dbsmeasures = RegUtil.checkParam(tem.getOrDefault("dbsMeasures", "").toString());
                    String dxsname = RegUtil.checkParam(tem.getOrDefault("dxsName", "").toString());
                    String dxslevelorkindcount = RegUtil.checkParam(tem.getOrDefault("dxsLevelorkindcount", "").toString());
                    String dxsprotectedobject = RegUtil.checkParam(tem.getOrDefault("dxsProtectedobject", "").toString());
                    String dxsinfluencesituation = RegUtil.checkParam(tem.getOrDefault("dxsInfluencesituation", "").toString());
                    String dxsistakeup = RegUtil.checkParam(tem.getOrDefault("dxsIstakeup", "").toString());
                    String dxsarea = RegUtil.checkParam(tem.getOrDefault("dxsArea", "").toString());
                    String dxsmeasures = RegUtil.checkParam(tem.getOrDefault("dxsMeasures", "").toString());
                    String fjmsqname = RegUtil.checkParam(tem.getOrDefault("fjmsqName", "").toString());
                    String fjmsqlevelorkindcount = RegUtil.checkParam(tem.getOrDefault("fjmsqLevelorkindcount", "").toString());
                    String fjmsqprotectedobject = RegUtil.checkParam(tem.getOrDefault("fjmsqProtectedobject", "").toString());
                    String fjmsqinfluencesituation = RegUtil.checkParam(tem.getOrDefault("fjmsqInfluencesituation", "").toString());
                    String fjmsqistakeup = RegUtil.checkParam(tem.getOrDefault("fjmsqIstakeup", "").toString());
                    String fjmsqarea = RegUtil.checkParam(tem.getOrDefault("fjmsqArea", "").toString());
                    String fjmsqmeasures = RegUtil.checkParam(tem.getOrDefault("fjmsqMeasures", "").toString());
                    String modifytimestrregform = RegUtil.checkParam(tem.getOrDefault("modifytimeStrRegform", "").toString());


                    
                    String sql = " INSERT INTO \"YZ_CONS_REGFORM\" (\"CONSTRUCTIONID\", \"PROJECTNAMEREGFORM\", \"ISNEW\", \"PROJECTCODE\", \"PROJECTADDRESSREGFORM\", " +
									"\"PROJECTSCALECONTENT\",\"CREDITCODE\", \"PLANTIME\", \"PROJECTLIFECYCLE\",\"PREDICTTIME\"," +
									"\"NATIONALECONOMYCODEREGFORM\", \"PROJECTJSNATUREREGFORM\", \"LICENSENUMBER\", \"APPLICATIONCATEGORY\", " +
									"\"LONGITUDEREGFORM\", \"BEGINLONGITUDE\", \"ENDLONGITUDE\",\"LATITUDEREGFORM\", \"BEGINLATITUDE\"," +
									"\"ENDLATITUDE\", \"EIAMANAGETYPEREGFORM\", \"PROJECTINVESTREGFORM\", \"ENVIRONINVESTREGFORM\", " +
									"\"INVESTPROPORTION\",\"CONSTRUCTUNITNAMEREGFORM\", \"CONSTRUCTUNITADDRESS\", \"FSEXISTACTUALEMISPOTENCY\", " +
									"\"FSEXISTALLOWEMISPOTENCY\", \"FSTHISFORECASTEMISPOTENCY\", \"FSOVERALNEWOLDABATEMENT\"," +
									"\"FSOVERALREPLACEABATEMENT\", \"FSOVERALFORECASTEMISTOTAL\", \"FSOVERALEMISABATEMENT\", " +
									"\"CODEXISTACTUALEMISPOTENCY\", \"CODEXISTALLOWEMISPOTENCY\", \"CODTHISFORECASTEMISPOTENCY\"," +
									"\"CODOVERALNEWOLDABATEMENT\", \"CODOVERALREPLACEABATEMENT\", \"CODOVERALFORECASTEMISTOTAL\"," +
									"\"CODOVERALEMISABATEMENT\", \"ZLEXISTACTUALEMISPOTENCY\", \"ZLEXISTALLOWEMISPOTENCY\"," +
									"\"ZLTHISFORECASTEMISPOTENCY\", \"ZLOVERALNEWOLDABATEMENT\", \"ZLOVERALREPLACEABATEMENT\"," +
									"\"ZLOVERALFORECASTEMISTOTAL\", \"ZLOVERALEMISABATEMENT\", \"ZDEXISTACTUALEMISPOTENCY\"," +
									"\"ZDEXISTALLOWEMISPOTENCY\", \"ZDTHISFORECASTEMISPOTENCY\", \"ZDOVERALNEWOLDABATEMENT\"," +
									"\"ZDOVERALREPLACEABATEMENT\", \"ZDOVERALFORECASTEMISTOTAL\", \"ZDOVERALEMISABATEMENT\"," +
									"\"KLWEXISTACTUALEMISPOTENCY\", \"KLWEXISTALLOWEMISPOTENCY\", \"KLWTHISFORECASTEMISPOTENCY\"," +
									"\"KLWOVERALNEWOLDABATEMENT\", \"KLWOVERALREPLACEABATEMENT\",\"KLWOVERALFORECASTEMISTOTAL\"," +
									"\"KLWOVERALEMISABATEMENT\", \"HFXYJWEXISTACTUALEMISPOTENCY\", \"HFXYJWEXISTALLOWEMISPOTENCY\"," +
									"\"HFXYJWTHISFORECASTEMISPOTENCY\",\"HFXYJWOVERALNEWOLDABATEMENT\", \"HFXYJWOVERALREPLACEABATEMENT\"," +
									"\"HFXYJWOVERALFORECASTEMISTOTAL\", \"HFXYJWOVERALEMISABATEMENT\", \"ADEXISTACTUALEMISPOTENCY\"," +
									"\"ADEXISTALLOWEMISPOTENCY\", \"ADTHISFORECASTEMISPOTENCY\", \"ADOVERALNEWOLDABATEMENT\"," +
									"\"ADOVERALREPLACEABATEMENT\", \"ADOVERALFORECASTEMISTOTAL\",\"ADOVERALEMISABATEMENTREGFORM\"," +
									"\"FQEXISTACTUALEMISPOTENCY\", \"FQEXISTALLOWEMISPOTENCY\", \"FQTHISFORECASTEMISPOTENCY\"," +
									"\"FQOVERALNEWOLDABATEMENT\",\"FQOVERALREPLACEABATEMENT\", \"FQOVERALFORECASTEMISTOTAL\", " +
									"\"FQOVERALEMISABATEMENT\", \"EYHLEXISTACTUALEMISPOTENCY\", \"EYHLEXISTALLOWEMISPOTENCY\"," +
									"\"EYHLTHISFORECASTEMISPOTENCY\", \"EYHLOVERALNEWOLDABATEMENT\", \"EYHLOVERALREPLACEABATEMENT\"," +
									"\"EYHLOVERALFORECASTEMISTOTAL\", \"EYHLOVERALEMISABATEMENTREGFORM\",\"DYHWEXISTACTUALEMISPOTENCY\"," +
									"\"DYHWEXISTALLOWEMISPOTENCY\", \"DYHWTHISFORECASTEMISPOTENCY\", \"DYHWOVERALNEWOLDABATEMENT\", " +
									"\"DYHWOVERALREPLACEABATEMENT\",\"DYHWOVERALFORECASTEMISTOTAL\", \"DYHWOVERALEMISABATEMENTREGFORM\"," +
									"\"EMISSIONSWAY\", \"ZRBHQNAME\", \"ZRBHQLEVELORKINDCOUNT\", \"ZRBHQPROTECTEDOBJECT\",\"ZRBHQINFLUENCESITUATION\", " +
									"\"ZRBHQISTAKEUP\", \"ZRBHQAREA\", \"ZRBHQMEASURES\", \"DBSNAME\", \"DBSLEVELORKINDCOUNT\", \"DBSPROTECTEDOBJECT\"," +
									"\"DBSINFLUENCESITUATION\",\"DBSISTAKEUP\", \"DBSAREA\", \"DBSMEASURES\", \"DXSNAME\", \"DXSLEVELORKINDCOUNT\"," +
									"\"DXSPROTECTEDOBJECT\", \"DXSINFLUENCESITUATION\", \"DXSISTAKEUP\", \"DXSAREA\",\"DXSMEASURES\", \"FJMSQNAME\"," +
									"\"FJMSQLEVELORKINDCOUNT\", \"FJMSQPROTECTEDOBJECT\", \"FJMSQINFLUENCESITUATION\", \"FJMSQISTAKEUP\"," +
									"\"FJMSQAREA\", \"FJMSQMEASURES\", \"INSERTTIME\",\"MODIFYTIMESTRREGFORM\") VALUES " + 
					
					"('" + constructionId + "', '" + projectnameregform + "', '" + isnew + "', '" + projectcode + "', '" + projectaddressregform + "', '" + projectscalecontent +
					"', '" + creditcode + "', '" + plantime + "', '" + projectlifecycle + "', '" + predicttime + "', '" + nationaleconomycoderegform + "', '" + projectjsnatureregform +
					"', '" + licensenumber + "', '" + applicationcategory + "', '" + longituderegform + "', '" + beginlongitude + "', '" + endlongitude + "', '" + latituderegform +
					"', '" + beginlatitude + "', '" + endlatitude + "', '" + eiamanagetyperegform + "', '" + projectinvestregform + "', '" + environinvestregform +
					"', '" + investproportion + "', '" + constructunitnameregform + "', '" + constructunitaddress + "', '" + fsexistactualemispotency +
					"', '" + fsexistallowemispotency + "', '" + fsthisforecastemispotency + "', '" + fsoveralnewoldabatement + "', '" + fsoveralreplaceabatement +
					"', '" + fsoveralforecastemistotal + "', '" + fsoveralemisabatement + "', '" + codexistactualemispotency + "', '" + codexistallowemispotency +
					"', '" + codthisforecastemispotency + "', '" + codoveralnewoldabatement + "', '" + codoveralreplaceabatement + "', '" + codoveralforecastemistotal +
					"', '" + codoveralemisabatement + "', '" + zlexistactualemispotency + "', '" + zlexistallowemispotency + "', '" + zlthisforecastemispotency +
					"', '" + zloveralnewoldabatement + "', '" + zloveralreplaceabatement + "', '" + zloveralforecastemistotal + "', '" + zloveralemisabatement +
					"', '" + zdexistactualemispotency + "', '" + zdexistallowemispotency + "', '" + zdthisforecastemispotency + "', '" + zdoveralnewoldabatement +
					"', '" + zdoveralreplaceabatement + "', '" + zdoveralforecastemistotal + "', '" + zdoveralemisabatement + "', '" + klwexistactualemispotency +
					"', '" + klwexistallowemispotency + "', '" + klwthisforecastemispotency + "', '" + klwoveralnewoldabatement + "', '" + klwoveralreplaceabatement +
					"', '" + klwoveralforecastemistotal + "', '" + klwoveralemisabatement + "', '" + hfxyjwexistactualemispotency + "', '" + hfxyjwexistallowemispotency +
					"', '" + hfxyjwthisforecastemispotency + "', '" + hfxyjwoveralnewoldabatement + "', '" + hfxyjwoveralreplaceabatement +
					"', '" + hfxyjwoveralforecastemistotal + "', '" + hfxyjwoveralemisabatement + "', '" + adexistactualemispotency + "', '" + adexistallowemispotency +
					"', '" + adthisforecastemispotency + "', '" + adoveralnewoldabatement + "', '" + adoveralreplaceabatement + "', '" + adoveralforecastemistotal +
					"', '" + adoveralemisabatementregform + "', '" + fqexistactualemispotency + "', '" + fqexistallowemispotency + "', '" + fqthisforecastemispotency +
					"', '" + fqoveralnewoldabatement + "', '" + fqoveralreplaceabatement + "', '" + fqoveralforecastemistotal + "', '" + fqoveralemisabatement +
					"', '" + eyhlexistactualemispotency + "', '" + eyhlexistallowemispotency + "', '" + eyhlthisforecastemispotency + "', '" + eyhloveralnewoldabatement +
					"', '" + eyhloveralreplaceabatement + "', '" + eyhloveralforecastemistotal + "', '" + eyhloveralemisabatementregform +
					"', '" + dyhwexistactualemispotency + "', '" + dyhwexistallowemispotency + "', '" + dyhwthisforecastemispotency + "', '" + dyhwoveralnewoldabatement +
					"', '" + dyhwoveralreplaceabatement + "', '" + dyhwoveralforecastemistotal + "', '" + dyhwoveralemisabatementregform + "', '" + emissionsway +
					"', '" + zrbhqname + "', '" + zrbhqlevelorkindcount + "', '" + zrbhqprotectedobject + "', '" + zrbhqinfluencesituation + "', '" + zrbhqistakeup +
					"', '" + zrbhqarea + "', '" + zrbhqmeasures + "', '" + dbsname + "', '" + dbslevelorkindcount + "', '" + dbsprotectedobject +
					"', '" + dbsinfluencesituation + "', '" + dbsistakeup + "', '" + dbsarea + "', '" + dbsmeasures + "', '" + dxsname +
					"', '" + dxslevelorkindcount + "', '" + dxsprotectedobject + "', '" + dxsinfluencesituation + "', '" + dxsistakeup + "', '" + dxsarea +
					"', '" + dxsmeasures + "', '" + fjmsqname + "', '" + fjmsqlevelorkindcount + "', '" + fjmsqprotectedobject + "', '" + fjmsqinfluencesituation +
					"', '" + fjmsqistakeup + "', '" + fjmsqarea + "', '" + fjmsqmeasures + "',sysdate,'"+modifytimestrregform+"')";
                    getBySqlMapper.insert(sql);
                    
                    total++;
                }
            }
            long t2 = System.currentTimeMillis();
            logToDb.addSysLog("建设项目审批登记表解析数据更新完成，共计用时" + (t2 - t1) / 1000 + "秒，更新数据" + total + "条");
            System.out.println("================ 更新建设项目审批登记表解析数据完成,插入" + total + "条数据  ================");
        } catch (Exception e) {
            e.printStackTrace();
            logToDb.addSysLog("更新建设项目审批登记表解析数据异常");
            System.out.println("================ 更新建设项目审批登记表解析数据异常  ================");
        }
    }


    public static JSONArray getBegFormInfor(int page, String startTime) {
    	String str = "";
        JSONArray array = new JSONArray();
        try {
            //获取建设项目URL接口地
            String endpointAddress = "http://10.102.33.164:8080/EIAITM/services/yzZbinfo/yzZbInterface/qcconsProject?";
            if (!startTime.equals("")) {
                endpointAddress += "regformBeginDate=" + startTime + "+00:00:00&";
            }
            endpointAddress += "pageReg=" + page + "&rowsReg=5000";
            URL url = new URL(endpointAddress);
            InputStream in = url.openStream();
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(in, "utf-8"));
            String s = "";
            String xml = "";
            StringBuilder sb = new StringBuilder();
            while ((s = bufferedReader.readLine()) != null) {
                sb.append(s);
            }
            xml = sb.toString();
            System.out.println("xml长度：" + xml.length());
            if(xml.length() < 300){
            	System.out.println(xml);
            }
            xml=xml.substring(131,xml.length()-34);
            if(xml.length() < 100){
            	System.out.println(xml);
            }
            xml = xml.replaceAll("<", "&lt;");
            xml = xml.replaceAll(">", "&gt;");
            xml = xml.replaceAll("&", "&amp;");
     /*       Document doc = DocumentHelper.parseText(xml);
            Element elementRoot = doc.getRootElement();
            str = elementRoot.element("PROJECTLIST").getText();
            str=str.substring(13,str.length()-6);
            System.out.println(str);*/
            array = JSONArray.fromObject(xml);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return array;
    }
}
