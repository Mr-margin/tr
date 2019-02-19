package com.gistone.seimp.job;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.service.LogToDb;
import com.gistone.seimp.util.UrlsUtil;
import com.sun.org.apache.xalan.internal.xsltc.compiler.sym;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Author:renqiang
 * @Description: Created by soil-pc2 on 2018/4/13.
 */
@Configuration
@EnableScheduling //启用定时任务
public class GetEnterpriceData {
    @Autowired
    private GetBySqlMapper getBySqlMapper;
    @Autowired
    private LogToDb logToDb;
    @Autowired
    private UrlsUtil urlUtil;

    /*更新企业基本信息数据*/
//    @Scheduled(cron = "0 0 0 * * ?")===
    //@Scheduled(fixedDelay = 7200000)
//    @Scheduled(cron="0 * * * * ? ")
    public void getEnterpriceBaseData() {
        try {
            System.out.println("================ 开始更新企业基本信息数据  ================");
            logToDb.addSysLog("开始更新企业基本信息");
            int t=0;
            long t1 = System.currentTimeMillis();
            int page = 1;
            String sql2 = "SELECT \"MAX\"(ITEMENDTIME) ITEMENDTIME from ENTERPRICE_BASEINFO";
            List<Map> list = getBySqlMapper.findRecords(sql2);
            String startTime = "";
            if(list.size()>0&&list.get(0)!=null){
                startTime = list.get(0).get("ITEMENDTIME").toString();
            }
            JSONObject object = getEnterpriceBaseInfor(startTime,page);
            while (!object.isEmpty()&&object.getJSONArray("pageData").size()>0){
                t+=insertEnterpriceBaseData(object.getJSONArray("pageData"));
                
                //打印信息
                System.out.println("接收数据："+object.getJSONArray("pageData").size()+";;插入数据：" +t);
                
                object=getEnterpriceBaseInfor(startTime,++page);
            }
            long t2 = System.currentTimeMillis();
            logToDb.addSysLog("企业基本信息数据更新完成，共计用时" + (t2 - t1) / 1000 + "秒,插入"+t+"条数据");
            System.out.println("================ 更新企业基本信息数据完成,插入" + t + "条数据  ================");
        } catch (Exception e) {
            e.printStackTrace();
            logToDb.addSysLog("更新企业基本信息数据异常");
            System.out.println("================ 更新企业基本信息数据异常  ================");
        }
    }
    
    
    /*更新撤销、注销企业数据*/
//    @Scheduled(fixedDelay = 60 * 1000)
//    @Scheduled(cron = "0 0 0 * * ?")===
//    @Scheduled(cron="0 * * * * ? ")
    public void getEnterpriceUndoData() {
        try {
            System.out.println("================ 开始更新撤销、注销企业数据  ================");
            logToDb.addSysLog("开始更新撤销、注销企业数据");
            int t=0;
            long t1 = System.currentTimeMillis();
            String sql2 = "SELECT \"MAX\"(CREATETIME) CREATETIME from ENTERPRICE_UNDOINFO";
            List<Map> list = getBySqlMapper.findRecords(sql2);
            String startTime = "";
            if(list.size()>0&&list.get(0)!=null){
                startTime = list.get(0).get("CREATETIME").toString();
            }
            JSONArray array = getEnterpriceUndoInfor(startTime);
            System.out.println("接收数据条数" + array.size());
            t+=insertEnterpriceUndoData(array);
            long t2 = System.currentTimeMillis();
            logToDb.addSysLog("撤销、注销企业数据更新完成，共计用时" + (t2 - t1) / 1000 + "秒,插入"+t+"条数据");
            System.out.println("================ 更新撤销、注销企业数据完成,插入" + t + "条数据  ================");
        } catch (Exception e) {
            e.printStackTrace();
            logToDb.addSysLog("更新撤销、注销企业数据异常");
            System.out.println("================ 更新撤销、注销企业数据异常  ================");
        }
    }

    /*插入更新企业基本信息数据*/
    public int  insertEnterpriceBaseData(JSONArray array){
        int total=0;
        for(int i=0;i<array.size();i++){
        	JSONObject tem = array.getJSONObject(i);
            String id = tem.getString("DATAID").toString();
            String sql0="select 1 from ENTERPRICE_BASEINFO where DATAID = '"+id+"'";
            if(getBySqlMapper.findRecords(sql0).size()>0){
//                System.out.println(id);
                continue;
            }
            String sql= "INSERT INTO \"ENTERPRICE_BASEINFO\" (\"DATAID\", \"ENTERID\", \"XKZNUM\", \"DEVCOMPANY\", \"REGADDRESS\", \"PROVINCECODE\", \"PROVINCE\", " +
                    "\"CITYCODE\", \"CITY\", \"COUNTYCODE\", \"COUNTY\", \"HYID\", \"HYNAME\", \"OPERATIME\", \"ORGANCODE\", \"CREDITCODE\", \"VALITIMES\", \"FZTIME\"," +
                    " \"OPEADDRESS\", \"LONGITUDE\", \"LATITUDE\", \"ISSHORTPERMIT\", \"POSTCODE\", \"ISPARK\", \"INDUSTRIAL\", \"ZYWRWLBID\", \"AIRWRWID\", \"AIRWRWNAME\"," +
                    "\"WATERWRWID\", \"WATERWRWNAME\", \"WATEREMISSIONNAME\", \"ITEMTYPE\", \"ITEMENDTIME\" )  VALUES ('"+id+"','"+tem.getString("ENTERID")+"','"+
                    tem.getString("XKZNUM")+"','"+tem.getString("DEVCOMPANY")+"','"+tem.getString("REGADDRESS")+"','"+tem.getString("PROVINCECODE")+"','"+
                    tem.getString("PROVINCE")+"','"+tem.getString("CITYCODE")+"'" + ",'"+tem.getString("CITY")+"','"+tem.getString("COUNTYCODE")+"','"+
                    tem.getString("COUNTY")+"','"+tem.getString("HYID")+"','"+tem.getString("HYNAME")+"','"+tem.getString("OPERATIME")+"'" +
                    ",'"+tem.getString("ORGANCODE")+"','"+tem.getString("CREDITCODE")+"','"+tem.getString("VALITIMES")+"','"+tem.getString("FZTIME")+"','"+
                    tem.getString("OPEADDRESS")+"','"+tem.getString("LONGITUDE")+"'" + ",'"+tem.getString("LATITUDE")+"','"+tem.getString("ISSHORTPERMIT")+
                    "','"+tem.getString("POSTCODE")+"','"+tem.getString("ISPARK")+"','"+tem.getString("INDUSTRIAL")+"','"+tem.getString("ZYWRWLBID")+"'" +
                    ",'"+tem.getString("AIRWRWID")+"','"+tem.getString("AIRWRWNAME")+"','"+tem.getString("WATERWRWID")+"','"+tem.getString("WATERWRWNAME")+"','"+
                   tem.getString("WATEREMISSIONNAME") +"','"+tem.getString("ITEMTYPE")+"','"+tem.getString("ITEMENDTIME")+"') ";
            getBySqlMapper.insert(sql);
            total++;
        }
        return total;
    }

    /*插入撤销、注销企业数据*/
    public int  insertEnterpriceUndoData(JSONArray array){
    	
    	System.err.println("###########  接收到数据：" + array.size());
    	
    	String sqlAllID = "select \"ENTERID\" from ENTERPRICE_UNDOINFO ";
    	List<Map> allIdMapList = getBySqlMapper.findRecords(sqlAllID);
    	List<String> allIdList = new ArrayList<String>();
    	for (Map idMap : allIdMapList) {
    		if(idMap != null && idMap.get("ENTERID") != null){
    			allIdList.add(idMap.get("ENTERID").toString());
    		}
		}
    	
        int total=0;
        int total1 = 0;
        for(int i=0;i<array.size();i++){
            JSONObject tem = array.getJSONObject(i);
            
        	//打印企业名称：
        	System.out.println(tem.getString("UNITNAME")  + "==" + tem.getString("XKZNUMBER")+ "==" + tem.getString("ISTYPE"));
            
            String id = tem.getString("ENTERID").toString();
//            String sql0="select 1 from ENTERPRICE_UNDOINFO where ENTERID = '"+id+"'";
//            if(getBySqlMapper.findRecords(sql0).size()>0){
//                System.out.println(id);
//                break;
//            }
            
            if(allIdList.contains(id)){
            	//数据库中已经有
            	String sql = "update \"ENTERPRICE_UNDOINFO\" set \"DELSTATUS\" = '0' where \"ENTERID\" = '"+id+"'";
            	getBySqlMapper.update(sql);
            	//从集合中删除该id
            	allIdList.remove(id);
            	total1++;
            }else{
            	String sql= "INSERT INTO \"ENTERPRICE_UNDOINFO\" (\"ENTERID\",\"UNITNAME\",  \"XKZNUMBER\", \"ZXTYPE\", \"ZXREASON\", \"ISTYPE\", \"CREATETIME\", \"DELSTATUS\" )  " +
                        "VALUES ('"+id+"','"+tem.getString("UNITNAME")+"','"+
                        tem.getString("XKZNUMBER")+"','"+tem.getString("ZXTYPE")+"','"+tem.getString("ZXREASON")+"','"+
                        tem.getString("ISTYPE")+"','"+tem.getString("CREATETIME")+"' , '0') ";
                getBySqlMapper.insert(sql);
                total++;
            }
        }
        
        for (String idOfDatabase : allIdList) {
        	//数据库中已经有
        	String sql = "update \"ENTERPRICE_UNDOINFO\" set \"DELSTATUS\" = '1' where \"ENTERID\" = '"+idOfDatabase+"'";
        	getBySqlMapper.update(sql);
		}
        
        System.out.println("########  插入数据：" + total);
        System.out.println("########  设置为1的数据：" + allIdList.size());
        System.out.println("########  设置为0的数据，数据库中已经有的数据：" + total1);
        
        return total;
    }

    /*请求*/
    public static JSONObject getEnterpriceBaseInfor(String startTime,int page) {
        try {
            System.out.println(startTime);
            //获取建设项目URL接口地
            String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getBaseInfo";
            String param="token=8e74444be0da48a3a47d3fd198cce6e8";
            param+="&pageno="+page+"&pagesize=1000";
            if (!startTime.equals("")) {
                param+="&begintime="+startTime;
            }
            String str = sendPost(address,param);
            
            System.out.println("str:" + str);
            
            byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
            
            System.out.println("parse:"+parseHexStr2Byte(str));
            System.out.println("byete:" + aesResult);
            System.out.println("new String:"+new String(aesResult));
            
            JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
            
            System.out.println("array:" + array.toString());
            
            JSONObject jsonObject = array.getJSONObject(0);
            return jsonObject.getJSONObject("result");
        } catch (Exception e) {
            e.printStackTrace();
            return  null;
        }
    }

    /*请求撤销、注销企业数据数据*/
    public static JSONArray getEnterpriceUndoInfor(String startTime) {
        try {
            System.out.println(startTime);
            //获取建设项目URL接口地
            String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getUndoInfo";
            String param="token=8e74444be0da48a3a47d3fd198cce6e8";
            if (!startTime.equals("")) {
            	//数据很少，暂时注释掉
//                param+="&begintime="+startTime;
            }
            String str = sendPost(address,param);
            byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
            JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
            JSONObject jsonObject = array.getJSONObject(0);
            return jsonObject.getJSONArray("result");
        } catch (Exception e) {
            e.printStackTrace();
            return  null;
        }
    }

    /**
     * post请求
     * @param url	接口地址
     * @param param	参数
     */
    public static String sendPost(String url, String param) {
        PrintWriter out = null;
        BufferedReader in = null;
        String result = "";
        try {
            URL realUrl = new URL(url);
            // 打开和URL之间的连接
            URLConnection conn = realUrl.openConnection();
            // 设置通用的请求属性
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 发送POST请求必须设置如下两行
            conn.setDoOutput(true);
            conn.setDoInput(true);
            // 获取URLConnection对象对应的输出流
            out = new PrintWriter(conn.getOutputStream());
            // 发送请求参数
            out.print(param);
            // flush输出流的缓冲
            out.flush();
            // 定义BufferedReader输入流来读取URL的响应
            in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
        } catch (Exception e) {
            System.out.println("发送 POST 请求出现异常！" + e);
            e.printStackTrace();
        }
        // 使用finally块来关闭输出流、输入流
        finally {
            try {
                if (out != null) {
                    out.close();
                }
                if (in != null) {
                    in.close();
                }
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
        return result;
    }

    /**
     * 解密方法
     *
     * @param content	AES加密过的内容（16进制）
     * @param password	加密时的密码
     * @return result	明文
     */
    public static byte[] decrypt(byte[] content, String password) {
        try {
            KeyGenerator kgen = KeyGenerator.getInstance("AES");
            SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
            random.setSeed(password.getBytes());
            kgen.init(128, random);

            SecretKey secretKey = kgen.generateKey();
            byte[] enCodeFormat = secretKey.getEncoded();
            SecretKeySpec key = new SecretKeySpec(enCodeFormat, "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] result = cipher.doFinal(content);
            return result;
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (NoSuchPaddingException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (IllegalBlockSizeException e) {
            e.printStackTrace();
        } catch (BadPaddingException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 将16进制转换为二进制
     *
     * @param hexStr
     * @return
     */
    public static byte[] parseHexStr2Byte(String hexStr) {
        if (hexStr.length() < 1){
            return null;
        }
        byte[] result = new byte[hexStr.length() / 2];
        for (int i = 0; i < hexStr.length() / 2; i++) {
            int high = Integer.parseInt(hexStr.substring(i * 2, i * 2 + 1), 16);
            int low = Integer.parseInt(hexStr.substring(i * 2 + 1, i * 2 + 2), 16);
            result[i] = (byte) (high * 16 + low);
        }
        return result;
    }
    
    
    /************2.2.主要产品及产能信息***********/
    /**
     * 更新数据
     * 主要产品及产能信息
     * 已建表
     */
//  @Scheduled(cron = "0 0 1 * * ?")===
//  @Scheduled(fixedDelay = 7200000)
//  @Scheduled(cron="0 * * * * ? ")
    public void getProductInfo() {
    	try {
    		System.out.println("================ 开始更新Enterprise 主要产品及产能信息 ================");
	        logToDb.addSysLog(" 开始更新Enterprise 主要产品及产能信息 ");
	        int insertCount = 0;
	        long timekeepingStart = System.currentTimeMillis();
	        
	        //查询基本信息表中没有主要产品及产能信息的数据
	        String sql1 = "select b.DATAID,p.ID from ENTERPRICE_BASEINFO b left join TB_ENTERPRISE_PRODUCTINFO p on b.DATAID=p.DATAID where p.ID is null";
	        List<Map> list1 = getBySqlMapper.findRecords(sql1);
	        for (Map map : list1) {
				if(map.get("DATAID")!=null && map.get("DATAID").toString()!=""){
					String dataId = map.get("DATAID").toString();
					
					//根据企业基本信息主键，获取主要产品及产能信息
					JSONArray array = getProductInfoData(dataId);
//					System.out.println(array.toString());
					//插入数据到数据库
					////==测试之后根据数据结构修改
					if(array!=null && !array.isEmpty() && array.size()>0){
						insertCount += insertProductInfo(array, dataId);
					}
				}
			}
	        
	        //记录时间和插入数据条数
	        long timekeepingEnd = System.currentTimeMillis();
	        logToDb.addSysLog("Enterprise 主要产品及产能信息更新数据完成，共计用时" + (timekeepingStart - timekeepingEnd) / 1000 + "秒,插入"+insertCount+"条数据");
	        System.out.println("================ Enterprise 主要产品及产能信息数据完成,插入" + insertCount + "条数据  ================");
    	} catch (Exception e) {
    		e.printStackTrace();
    		logToDb.addSysLog("更新Enterprise 主要产品及产能信息数据异常");
    		System.out.println("================ 更新Enterprise 主要产品及产能信息数据异常  ================");
    	}
    }
	  
    /**
     * 插入数据库到数据库
     * 主要产品及产能信息
     */
    public int  insertProductInfo(JSONArray array, String dataId){
    	////==测试之后根据数据结构，插入数据库。可能是数组，可能是对象，只有一条数据。
    	int insertCount = 0;
    	
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_PRODUCTINFO (ID, DATAID, PRODUCTNAME, CAPACITY, PRODUNITSNAME) values "; 
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_PRODUCTINFO_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(dataId);
			valuesStr.append("','").append(currObj.get("PRODUCTNAME"));
			valuesStr.append("','").append(currObj.get("CAPACITY"));
			valuesStr.append("','").append(currObj.get("PRODUNITSNAME"));
			valuesStr.append("')");
			
			
			//插入数据库
			String sql1 = sql + valuesStr.toString();
			getBySqlMapper.insert(sql1);
			
//			System.out.println("sql:" + sql1);
			
			valuesStr.setLength(0);
			//记录数据个数
			insertCount++;
		}
    	
    	
    	return insertCount;
    }
	    
	    
    /**
     * 发送请求，获取数据
     * 主要产品及产能信息
     */
    public static JSONArray getProductInfoData(String dataId) {
    	try {
	        //获取建设项目URL接口地
	        String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getProductInfo";
	        String param = "token=8e74444be0da48a3a47d3fd198cce6e8&dataid=" + dataId;
	        //发送请求获取数据
	        String str = sendPost(address,param);
	        
	        //解析返回数据
	        byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
	        JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
	        
//	        System.out.println("dataId:" + dataId);
//	        System.out.println("array:" + array.toString());
	        
	        JSONObject jsonObject = array.getJSONObject(0);
	        
	        //判断result是数组，还是null
	        JSONArray result = new JSONArray();
	        try{
	        	result = jsonObject.getJSONArray("result");
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
	        //返回空
	        return result;
    	} catch (Exception e) {
	        e.printStackTrace();
	        return  null;
    	}
    }
    
    /************2.3.主要原辅材料及燃料信息***********/
    /**
     * 更新数据
     * 主要原辅材料及燃料信息
     * 未建表
     */
//  @Scheduled(cron = "0 0 1 * * ?")===
  //@Scheduled(fixedDelay = 7200000)
//  @Scheduled(cron="0 * * * * ? ")
    public void getMaterialAndFuel() {
    	try {
    		System.out.println("================ 开始更新Enterprise 主要原辅材料及燃料信息 ================");
	        logToDb.addSysLog(" 开始更新Enterprise 主要原辅材料及燃料信息 ");
	        
	        Map<String,Integer> insertCountMap = new HashMap<String, Integer>();
	        insertCountMap.put("material", 0);
	        insertCountMap.put("poisonous", 0);
	        insertCountMap.put("fuel", 0);

	        long timekeepingStart = System.currentTimeMillis();
	        
	        //查询基本信息表中没有主要产品及产能信息的数据
	        String sql1 = "select b.DATAID,p.ID from ENTERPRICE_BASEINFO b left join TB_ENTERPRISE_PRODUCTINFO p on b.DATAID=p.DATAID where p.ID is null";
	        List<Map> list1 = getBySqlMapper.findRecords(sql1);
	        for (Map map : list1) {
				if(map.get("DATAID")!=null && map.get("DATAID").toString()!=""){
					String dataId = map.get("DATAID").toString();
					
					//根据企业基本信息主键，获取主要产品及产能信息
					JSONObject object = getMaterialAndFuelData(dataId);
					//插入数据到数据库
					////==测试之后根据数据结构修改
					if(!object.isEmpty() && object.size()>0){
						insertMaterialAndFuel(object, dataId, insertCountMap);
					}
				}
			}
	        
	        //记录时间和插入数据条数
	        long timekeepingEnd = System.currentTimeMillis();
	        logToDb.addSysLog("Enterprise 主要原辅材料及燃料信息更新数据完成，共计用时" + (timekeepingStart - timekeepingEnd) / 1000 + "秒"
	        		+ "，插入主要原辅材料数据："+(insertCountMap.get("material"))+"条，插入主要原辅材料-有毒有害成分数据："+(insertCountMap.get("poisonous"))+
	        		"条，插入燃料数据："+(insertCountMap.get("fuel"))+"条");
	        System.out.println("================ Enterprise 主要原辅材料及燃料信息数据完成"
	        		+ "，插入主要原辅材料数据："+(insertCountMap.get("material"))+"条，插入主要原辅材料-有毒有害成分数据："+(insertCountMap.get("poisonous"))+
	        		"条，插入燃料数据："+(insertCountMap.get("fuel"))+"条");
    	} catch (Exception e) {
    		e.printStackTrace();
    		logToDb.addSysLog("更新Enterprise 主要原辅材料及燃料信息数据异常");
    		System.out.println("================ 更新Enterprise 主要原辅材料及燃料信息数据异常  ================");
    	}
    }
	  
    /**
     * 插入数据库到数据库
     * 主要原辅材料及燃料信息
     */
    public int  insertMaterialAndFuel(JSONObject object, String dataId, Map<String,Integer> insertCountMap){
    	int insertCount = 0;
    	
    	//获取原辅料信息集合
//    	JSONArray meterialList = array.getJSONArray("MATERIALLIST");
    	JSONArray meterialList = new JSONArray();
    	try{
    		meterialList = object.getJSONArray("MATERIALLIST");
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	insertMaterialData(meterialList, dataId, insertCountMap);
    	
    	//获取燃料信息集合
    	JSONArray fuelList = new JSONArray();
    	try{
    		fuelList = object.getJSONArray("FUELLIST");
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	insertFuelData(fuelList, dataId, insertCountMap);
    	
    	return insertCount;
    }
    
    /**
     *	插入原辅料信息 
     */
    public void insertMaterialData(JSONArray array, String dataId, Map<String,Integer> insertCountMap) {
		for (int i = 0; i < array.size(); i++) {
			//当前原辅料信息对象
			JSONObject currObj = array.getJSONObject(i);
			StringBuilder valueStr = new StringBuilder(" ");
			valueStr.append("(TB_ENTERPRISE_MATERIAL_SEQ.nextval");
			valueStr.append(",'").append(dataId);
			valueStr.append("','").append(currObj.get("HYNAME").toString());//行业大类
			valueStr.append("','").append(currObj.get("DEVICENAME").toString());//种类
			valueStr.append("','").append(currObj.get("FUELNAME").toString());//名称
			valueStr.append("','").append(currObj.get("YEARMAX").toString());//年最大使用量
			valueStr.append("','").append(currObj.get("UNITSNAME").toString());//计量单位
			if(currObj.has("POISONOUS")){
				//行业类别1：电镀行业、制革行业、制药行业、水泥行业、钢铁行业、有色金属行业、氮肥行业、印染行业、服装制造行业、农药行业
				valueStr.append("')");
				String sql = "INSERT INTO TB_ENTERPRISE_MATERIAL (ID, DATAID, HYNAME, DEVICENAME, FUELNAME, YEARMAX, UNITSNAME) values ";
				String sql1 = sql + valueStr.toString();
				getBySqlMapper.insert(sql1);
				
				//获取ID最大值
				String sql2 = "select max(ID) from TB_ENTERPRISE_MATERIAL";
				Integer maxID = getBySqlMapper.findrows(sql2);
				valueStr.setLength(0);
				
				
				JSONArray poisonousArr = new JSONArray();
				try{
					poisonousArr = currObj.getJSONArray("POISONOUS");//有毒有害成分集合
		    	}catch(Exception e){
//		    		e.printStackTrace();
		    	}
				insertPoisonousData(poisonousArr, maxID, insertCountMap); 
			}else{
				//行业类别2：造纸行业、火电行业、炼焦行业、石化行业、平板玻璃行业、制糖行业、其他行业
				valueStr.append("','").append(currObj.get("POISON").toString());//有毒有害成分及占比
				valueStr.append("')");
				
				//插入数据
				String sql = "INSERT INTO TB_ENTERPRISE_MATERIAL (ID, DATAID, HYNAME, DEVICENAME, FUELNAME, YEARMAX, UNITSNAME, POISON) values ";
				String sql1 = sql + valueStr.toString();
				getBySqlMapper.insert(sql1);
				valueStr.setLength(0);
			}
			
			insertCountMap.put("material", insertCountMap.get("material")+1);
		}
		
	}
    
    /**
     *	插入原辅料信息--有毒有害成分 
     */
    public void insertPoisonousData(JSONArray array, Integer materialId, Map<String,Integer> insertCountMap){
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_MATERIAL_POISON (ID, MATERIALID, TAHNAME, PROPORTION) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_MAT_POISON_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(materialId);
			valuesStr.append("','").append(currObj.get("TAHNAME"));
			valuesStr.append("','").append(currObj.get("PROPORTION"));
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
	    	
	    	insertCountMap.put("poisonous", insertCountMap.get("poisonous")+1);
			
		}
    	
    	
    }
    
    /**
     *	插入燃料信息
     */
    public void insertFuelData(JSONArray array, String dataId, Map<String,Integer> insertCountMap){
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_FUEL (ID, DATAID, DEVICENAME, FUELNAME, YEARMAX) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_FUEL_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(dataId);
			valuesStr.append("','").append(currObj.get("DEVICENAME"));
			valuesStr.append("','").append(currObj.get("FUELNAME"));
			valuesStr.append("','").append(currObj.get("YEARMAX"));
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
	    	
	    	insertCountMap.put("fuel", insertCountMap.get("fuel")+1);
		}
    }
	    
	    
    /**
     * 发送请求，获取数据
     * 主要原辅材料及燃料信息
     */
    public static JSONObject getMaterialAndFuelData(String dataId) {
    	try {
	        //获取建设项目URL接口地
	        String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getMaterialAndFuel";
	        String param = "token=8e74444be0da48a3a47d3fd198cce6e8&dataid=" + dataId;
	        //发送请求获取数据
	        String str = sendPost(address,param);
	        //解析返回数据
	        byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
	        JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
	        
//	        System.out.println("arry:"+array.toString());
	        
	        JSONObject jsonObject = array.getJSONObject(0);
	        //判断result是数组，还是null
	        JSONObject result = new JSONObject();
	        try{
	        	result = jsonObject.getJSONObject("result");
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
	        //返回空
	        return result;
    	} catch (Exception e) {
	        e.printStackTrace();
	        return  null;
    	}
    }
    
    /************2.4.废水排放口基本情况信息***********/
    /**
     * 更新数据
     * 废水排放口基本情况信息
     * 未建表
     */
//  @Scheduled(cron = "0 0 1 * * ?")===
  //@Scheduled(fixedDelay = 7200000)
//    @Scheduled(cron="0 * * * * ? ")
    public void getWaterEmissionsInfo() {
    	try {
    		System.out.println("================ 开始更新Enterprise 废水排放口基本情况信息 ================");
	        logToDb.addSysLog(" 开始更新Enterprise 废水排放口基本情况信息 ");
	        
	        Map<String,Integer> insertCountMap = new HashMap<String, Integer>();
	        insertCountMap.put("directly", 0);
	        insertCountMap.put("indirectl", 0);
	        insertCountMap.put("pollu", 0);
	        
	        long timekeepingStart = System.currentTimeMillis();
	        
	        //查询基本信息表中没有主要产品及产能信息的数据
	        String sql1 = "select b.DATAID,p.ID from ENTERPRICE_BASEINFO b left join TB_ENTERPRISE_PRODUCTINFO p on b.DATAID=p.DATAID where p.ID is null";
	        List<Map> list1 = getBySqlMapper.findRecords(sql1);
	        for (Map map : list1) {
				if(map.get("DATAID")!=null && map.get("DATAID").toString()!=""){
					String dataId = map.get("DATAID").toString();
					
					//根据企业基本信息主键，获取主要产品及产能信息
					JSONObject object = getWaterEmissionsInfoData(dataId);
					//插入数据到数据库
					////==测试之后根据数据结构修改
					if(!object.isEmpty() && object.size()>0){
						insertWaterEmissionsInfo(object, dataId, insertCountMap);
					}
				}
			}
	        
	        //记录时间和插入数据条数
	        long timekeepingEnd = System.currentTimeMillis();
	        logToDb.addSysLog("Enterprise 废水排放口基本情况信息更新数据完成，共计用时" + (timekeepingStart - timekeepingEnd) / 1000 + "秒"
	        		+ "，插入直接排放口数据："+(insertCountMap.get("directly"))+"条，插入排放口数据："+(insertCountMap.get("indirectl"))+
	        		"条，插入间接排放口-收纳污水处理厂数据："+(insertCountMap.get("pollu"))+"条");
	        System.out.println("================ Enterprise 废水排放口基本情况信息数据完成"
	        		+ "，插入直接排放口数据："+(insertCountMap.get("directly"))+"条，插入排放口数据："+(insertCountMap.get("indirectl"))+
	        		"条，插入间接排放口-收纳污水处理厂数据："+(insertCountMap.get("pollu"))+"条");
    	} catch (Exception e) {
    		e.printStackTrace();
    		logToDb.addSysLog("更新Enterprise 废水排放口基本情况信息数据异常");
    		System.out.println("================ 更新Enterprise 废水排放口基本情况信息数据异常  ================");
    	}
    }
	  
    /**
     * 插入数据库到数据库
     * 废水排放口基本情况信息
     */
    public int  insertWaterEmissionsInfo(JSONObject object, String dataId, Map<String,Integer> insertCountMap){
    	////==测试之后根据数据结构，插入数据库。可能是数组，可能是对象，只有一条数据。
    	int insertCount = 0;
    	
    	//直接排放口
    	JSONArray directlyList = new JSONArray();
    	try{
    		directlyList = object.getJSONArray("DIRECTLYLIST");
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	insertDirectlyData(directlyList, dataId, insertCountMap);
    	
    	//间接排放口
    	JSONArray indirectList = new JSONArray();
    	try{
    		indirectList = object.getJSONArray("INDIRECTLIST");
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	insertIndirectData(indirectList, dataId, insertCountMap);
    	
    	return insertCount;
    }
	    
    /**
     * 插入直接排放口数据
     */
    public void insertDirectlyData(JSONArray array, String dataId, Map<String,Integer> insertCountMap){
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_DIRECTLY (ID, DATAID, XKDRAINCODE, DRAINNAME, "
    			+ "LONGITUDE, LATITUDE, PFQXNAME, PFFSNAME, EMISSIONTIME, SEWAGENAME,"
    			+ " FUNCTIONNAME, NATURELONGITUDE, NATURELATITUDE) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_DIRECTLY_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(dataId);
			valuesStr.append("','").append(currObj.get("XKDRAINCODE"));
			valuesStr.append("','").append(currObj.get("DRAINNAME"));
			valuesStr.append("','").append(currObj.get("LONGITUDE"));
			valuesStr.append("','").append(currObj.get("LATITUDE"));
			valuesStr.append("','").append(currObj.get("PFQXNAME"));
			valuesStr.append("','").append(currObj.get("PFFSNAME"));
			valuesStr.append("','").append(currObj.get("EMISSIONTIME"));
			valuesStr.append("','").append(currObj.get("SEWAGENAME"));
			valuesStr.append("','").append(currObj.get("FUNCTIONNAME"));
			valuesStr.append("','").append(currObj.get("NATURELONGITUDE"));
			valuesStr.append("','").append(currObj.get("NATURELATITUDE"));
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
	    	
	    	insertCountMap.put("directly", insertCountMap.get("directly")+1);
			
		}
    }
    
    /**
     * 插入间接排放口数据
     */
	public  void insertIndirectData(JSONArray array, String dataId, Map<String,Integer> insertCountMap){
		for (int i = 0; i < array.size(); i++) {
			//当前原辅料信息对象
			JSONObject currObj = array.getJSONObject(i);
			StringBuilder valueStr = new StringBuilder(" ");
			valueStr.append("(TB_ENTERPRISE_INDIRECT_SEQ.nextval");
			valueStr.append(",'").append(dataId);
			valueStr.append("','").append(currObj.get("XKDRAINCODE").toString());//排放口编号
			valueStr.append("','").append(currObj.get("DRAINNAME").toString());//排放口名称
			valueStr.append("','").append(currObj.get("LONGITUDE").toString());//排放口地理坐标经度
			valueStr.append("','").append(currObj.get("LATITUDE").toString());//排放口地理坐标纬度
			valueStr.append("','").append(currObj.get("PFQXNAME").toString());//排放去向
			valueStr.append("','").append(currObj.get("PFFSNAME").toString());//排放规律
			valueStr.append("','").append(currObj.get("EMISSIONTIME").toString());//间歇式排放时段
			valueStr.append("','").append(currObj.get("SEWAGENAME").toString());//受纳污水处理厂信息—名称
			valueStr.append("')");
			String sql = "INSERT INTO TB_ENTERPRISE_INDIRECT (ID, DATAID, XKDRAINCODE, DRAINNAME, LONGITUDE, LATITUDE, PFQXNAME, PFFSNAME, EMISSIONTIME, SEWAGENAME) values ";
			//插入数据
			String sql1 = sql + valueStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
			valueStr.setLength(0);
			
			//获取ID最大值
			String sql2 = "select max(ID) from TB_ENTERPRISE_INDIRECT";
			Integer maxID = getBySqlMapper.findrows(sql2);
			
			//有毒有害成分集合
			JSONArray pollutantsArr = new JSONArray();
	    	try{
	    		pollutantsArr = currObj.getJSONArray("POLLUTANTS");
	    	}catch(Exception e){
//	    		e.printStackTrace();
	    	}
			insertPolluData(pollutantsArr, maxID, insertCountMap); 
			
			insertCountMap.put("indirectl", insertCountMap.get("indirectl")+1);
			
		}
    }
    
    /**
     * 插入间接排放口-收纳污水处理厂数据
     */
	public  void insertPolluData(JSONArray array, Integer indirectID, Map<String,Integer> insertCountMap){
		//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_INDIRECTID_POLLU (ID, INDIRECTID, WRWID, WRWNAME, EMISSIONCON) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_IND_POLLU_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(indirectID);
			valuesStr.append("','").append(currObj.get("WRWID"));
			valuesStr.append("','").append(currObj.get("WRWNAME"));
			valuesStr.append("','").append(currObj.get("EMISSIONCON"));
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
	    	
	    	insertCountMap.put("pollu", insertCountMap.get("pollu")+1);
			
		}
    }
    
	    
    /**
     * 发送请求，获取数据
     * 废水排放口基本情况信息
     */
    public static JSONObject getWaterEmissionsInfoData(String dataId) {
    	try {
	        //获取建设项目URL接口地
	        String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getWaterEmissionsInfo";
	        String param = "token=8e74444be0da48a3a47d3fd198cce6e8&dataid=" + dataId;
	        //发送请求获取数据
	        String str = sendPost(address,param);
	        //解析返回数据
	        byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
	        JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
	        
//	        System.out.println("array:" + array);
	        
	        JSONObject jsonObject = array.getJSONObject(0);
	        //判断result是数组，还是null
	        JSONObject result = new JSONObject();
	        try{
	        	result = jsonObject.getJSONObject("result");
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
	        //返回空
	        return result;
    	} catch (Exception e) {
	        e.printStackTrace();
	        return  null;
    	}
    }
    
    /************2.5.固体废物排放信息***********/
    /**
     * 更新数据
     * 固体废物排放信息、
     * 已建表
     */
//  @Scheduled(cron = "0 0 1 * * ?")===
  //@Scheduled(fixedDelay = 7200000)
//    @Scheduled(cron="0 * * * * ? ")
    public void getSolidWaste() {
    	try {
    		System.out.println("================ 开始更新Enterprise 固体废物排放信息 ================");
	        logToDb.addSysLog(" 开始更新Enterprise 固体废物排放信息 ");
	        int insertCount = 0;
	        long timekeepingStart = System.currentTimeMillis();
	        
	        //查询基本信息表中没有主要产品及产能信息的数据
	        String sql1 = "select b.DATAID,p.ID from ENTERPRICE_BASEINFO b left join TB_ENTERPRISE_SOLIDWASTE p on b.DATAID=p.DATAID where p.ID is null";
	        List<Map> list1 = getBySqlMapper.findRecords(sql1);
	        for (Map map : list1) {
				if(map.get("DATAID")!=null && map.get("DATAID").toString()!=""){
					String dataId = map.get("DATAID").toString();
					
					//根据企业基本信息主键，获取主要产品及产能信息
					JSONArray object = getSolidWasteData(dataId);
					//插入数据到数据库
					////==测试之后根据数据结构修改
					if(!object.isEmpty() && object.size()>0){
						insertCount += insertSolidWaste(object, dataId);
					}
				}
			}
	        
	        //记录时间和插入数据条数
	        long timekeepingEnd = System.currentTimeMillis();
	        logToDb.addSysLog("Enterprise 固体废物排放信息更新数据完成，共计用时" + (timekeepingStart - timekeepingEnd) / 1000 + "秒,插入"+insertCount+"条数据");
	        System.out.println("================ Enterprise 固体废物排放信息数据完成,插入" + insertCount + "条数据  ================");
    	} catch (Exception e) {
    		e.printStackTrace();
    		logToDb.addSysLog("更新Enterprise 固体废物排放信息数据异常");
    		System.out.println("================ 更新Enterprise 固体废物排放信息数据异常  ================");
    	}
    }
	  
    /**
     * 插入数据库到数据库
     * 固体废物排放信息
     */
    public int  insertSolidWaste(JSONArray array, String dataId){
    	////==测试之后根据数据结构，插入数据库。可能是数组，可能是对象，只有一条数据。
    	int insertCount = 0;
    	
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_SOLIDWASTE (ID, DATAID, FWLY, FWMC, FWZLNAME, FWLBNAME, FWMS, FWSCL, FWCLFSNAME, FWZHLYCLL, FWCZL, FWCCL, FWPFL) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_SOLIDWASTE_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(dataId);
			valuesStr.append("','").append(currObj.get("FWLY"));
			valuesStr.append("','").append(currObj.get("FWMC"));
			valuesStr.append("','").append(currObj.get("FWZLNAME"));
			valuesStr.append("','").append(currObj.get("FWLBNAME"));
			valuesStr.append("','").append(currObj.get("FWMS"));
			valuesStr.append("','").append(currObj.get("FWSCL"));
			valuesStr.append("','").append(currObj.get("FWCLFSNAME"));
			valuesStr.append("','").append(currObj.get("FWZHLYCLL"));
			valuesStr.append("','").append(currObj.get("FWCZL"));
			valuesStr.append("','").append(currObj.get("FWCCL"));
			valuesStr.append("','").append(currObj.get("FWPFL"));
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
			
			//记录数据个数
			insertCount++;
		}
    	
    	return insertCount;
    	
    	////==测试之后，确定是对象
    	/*
    	JSONObject object = new JSONObject();
    	String sql = "INSERT INTO TB_ENTERPRISE_PRODUCTINFO (ID, DATAID, DATAID, CAPACITY, PRODUNITSNAME) values ";
    	StringBuilder valuesStr = new StringBuilder();
		valuesStr.append("(TB_ENTERPRISE_PRODUCTINFO_SEQ.nextval");
		valuesStr.append(",").append(dataId);
		valuesStr.append(",").append(currObj.get("FWLY"));
		valuesStr.append(",").append(currObj.get("FWMC"));
		valuesStr.append(",").append(currObj.get("FWZLNAME"));
		valuesStr.append(",").append(currObj.get("FWLBNAME"));
		valuesStr.append(",").append(currObj.get("FWMS"));
		valuesStr.append(",").append(currObj.get("FWSCL"));
		valuesStr.append(",").append(currObj.get("FWCLFSNAME"));
		valuesStr.append(",").append(currObj.get("FWZHLYCLL"));
		valuesStr.append(",").append(currObj.get("FWCZL"));
		valuesStr.append(",").append(currObj.get("FWCCL"));
		valuesStr.append(",").append(currObj.get("FWPFL"));
		valuesStr.append(")");
			
		//记录数据个数
		insertCount++;
    	sql += valuesStr.toString().substring(0, valuesStr.toString().length());
    	getBySqlMapper.insert(sql);
    	return insertCount;
    	*/
    }
	    
	    
    /**
     * 发送请求，获取数据
     * 固体废物排放信息
     */
    public static JSONArray getSolidWasteData(String dataId) {
    	try {
	        //获取建设项目URL接口地
	        String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getSolidWaste";
	        String param = "token=8e74444be0da48a3a47d3fd198cce6e8&dataid=" + dataId;
	        //发送请求获取数据
	        String str = sendPost(address,param);
	        //解析返回数据
	        byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
	        JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
	        
//	        System.out.println("array:" + array);
	        
	        JSONObject jsonObject = array.getJSONObject(0);
	        //判断result是数组，还是null
	        JSONArray result = new JSONArray();
	        try{
	        	result = jsonObject.getJSONArray("result");
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
	        //返回空
	        return result;
    	} catch (Exception e) {
	        e.printStackTrace();
	        return  null;
    	}
    }
    
    /************2.6.自行监测及记录信息***********/
    /**
     * 更新数据
     * 自行监测及记录信息
     * 已建表
     */
//  @Scheduled(cron = "0 0 1 * * ?")===
  //@Scheduled(fixedDelay = 7200000)
//  @Scheduled(cron="0 * * * * ? ")
    public void getMonitorInfo() {
    	try {
    		System.out.println("================ 开始更新Enterprise 自行监测及记录信息 ================");
	        logToDb.addSysLog(" 开始更新Enterprise 自行监测及记录信息 ");
	        int insertCount = 0;
	        long timekeepingStart = System.currentTimeMillis();
	        
	        //查询基本信息表中没有主要产品及产能信息的数据
	        String sql1 = "select b.DATAID,p.ID from ENTERPRICE_BASEINFO b left join TB_ENTERPRISE_MONITORINFO p on b.DATAID=p.DATAID where p.ID is null";
	        List<Map> list1 = getBySqlMapper.findRecords(sql1);
	        for (Map map : list1) {
				if(map.get("DATAID")!=null && map.get("DATAID").toString()!=""){
					String dataId = map.get("DATAID").toString();
					
					//根据企业基本信息主键，获取主要产品及产能信息
					JSONObject object = getMonitorInfoData(dataId);
					
					//1.废气污染源list集合
					JSONArray airList = new JSONArray();
			        try{
			        	airList = object.getJSONArray("AIRMONITOR");
			        }catch(Exception e){
			        	e.printStackTrace();
			        }
					//插入数据到数据库
					if(!airList.isEmpty() && airList.size()>0){
						insertCount += insertMonitorInfo(airList, dataId, "1");
					}
					
					//2.废水污染源list集合
					JSONArray waterList = new JSONArray();
			        try{
			        	waterList = object.getJSONArray("WATERMONITOR");
			        }catch(Exception e){
			        	e.printStackTrace();
			        }
					//插入数据到数据库
					if(!object.isEmpty() && object.size()>0){
						insertCount += insertMonitorInfo(waterList, dataId, "2");
					}
					
					//3.其他废气污染源list集合
					JSONArray airElse = new JSONArray();
			        try{
			        	airElse = object.getJSONArray("AIROTHERMONITOR");
			        }catch(Exception e){
			        	e.printStackTrace();
			        }
					//插入数据到数据库
					if(!airElse.isEmpty() && airElse.size()>0){
						insertCount += insertMonitorInfo(airElse, dataId, "3");
					}
					
					//4.其他废水污染源list集合
					JSONArray waterElse = new JSONArray();
			        try{
			        	waterElse = object.getJSONArray("WATEROTHERMONITOR");
			        }catch(Exception e){
			        	e.printStackTrace();
			        }
					//插入数据到数据库
					if(!waterElse.isEmpty() && waterElse.size()>0){
						insertCount += insertMonitorInfo(waterElse, dataId, "4");
					}
				}
			}
	        
	        //记录时间和插入数据条数
	        long timekeepingEnd = System.currentTimeMillis();
	        logToDb.addSysLog("Enterprise 自行监测及记录信息更新数据完成，共计用时" + (timekeepingStart - timekeepingEnd) / 1000 + "秒,插入"+insertCount+"条数据");
	        System.out.println("================ Enterprise 自行监测及记录信息数据完成,插入" + insertCount + "条数据  ================");
    	} catch (Exception e) {
    		e.printStackTrace();
    		logToDb.addSysLog("更新Enterprise 自行监测及记录信息数据异常");
    		System.out.println("================ 更新Enterprise 自行监测及记录信息数据异常  ================");
    	}
    }
	  
    /**
     * 插入数据库到数据库
     * 自行监测及记录信息
     */
    public int  insertMonitorInfo(JSONArray array, String dataId, String typeChar){
    	////==测试之后根据数据结构，插入数据库。可能是数组，可能是对象，只有一条数据。
    	int insertCount = 0;
    	
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_MONITORINFO (ID, DATAID, POLLNAME, XKDRAINCODE, DRAINNAME, MONCONTENT, WRWNAME, ISLINKSCODE, ISSAFE, TYPECHAR) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		valuesStr.append("(TB_ENTERPRISE_MONITORINFO_SEQ.nextval");
			JSONObject currObj = array.getJSONObject(i);
			valuesStr.append(",'").append(dataId);
			valuesStr.append("','").append(currObj.get("POLLNAME"));
			valuesStr.append("','").append(currObj.get("XKDRAINCODE"));
			valuesStr.append("','").append(currObj.get("DRAINNAME"));
			valuesStr.append("','").append(currObj.get("MONCONTENT"));
			valuesStr.append("','").append(currObj.get("WRWNAME"));
			valuesStr.append("','").append(currObj.get("ISLINKSCODE"));
			valuesStr.append("','").append(currObj.get("ISSAFE"));
			valuesStr.append("','").append(typeChar);
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
			
			
			//记录数据个数
			insertCount++;
		}
    	return insertCount;
    	
    	////==测试之后，确定是对象
    	/*
    	JSONObject object = new JSONObject();
    	String sql = "INSERT INTO TB_ENTERPRISE_PRODUCTINFO (ID, DATAID, DATAID, CAPACITY, PRODUNITSNAME) values ";
    	StringBuilder valuesStr = new StringBuilder();
		valuesStr.append("(TB_ENTERPRISE_PRODUCTINFO_SEQ.nextval");
		valuesStr.append(",").append(dataId);
		valuesStr.append(",").append(currObj.get("POLLNAME"));
		valuesStr.append(",").append(currObj.get("XKDRAINCODE"));
		valuesStr.append(",").append(currObj.get("DRAINNAME"));
		valuesStr.append(",").append(currObj.get("MONCONTENT"));
		valuesStr.append(",").append(currObj.get("WRWNAME"));
		valuesStr.append(",").append(currObj.get("ISLINKSCODE"));
		valuesStr.append(",").append(currObj.get("ISSAFE"));
		valuesStr.append(")");
			
		//记录数据个数
		insertCount++;
    	sql += valuesStr.toString().substring(0, valuesStr.toString().length());
    	getBySqlMapper.insert(sql);
    	return insertCount;
    	*/
    }
	    
	    
    /**
     * 发送请求，获取数据
     * 自行监测及记录信息
     */
    public static JSONObject getMonitorInfoData(String dataId) {
    	try {
	        //获取建设项目URL接口地
	        String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getMonitorInfo";
	        String param = "token=8e74444be0da48a3a47d3fd198cce6e8&dataid=" + dataId;
	        //发送请求获取数据
	        String str = sendPost(address,param);
	        //解析返回数据
	        byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
	        JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
	        
//	        System.out.println("array:" + array);
	        
	        JSONObject jsonObject = array.getJSONObject(0);
	        //判断result是数组，还是null
	        JSONObject result = new JSONObject();
	        try{
	        	result = jsonObject.getJSONObject("result");
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
	        //返回空
	        return result;
    	} catch (Exception e) {
	        e.printStackTrace();
	        return  null;
    	}
    }
    
    /************2.7.许可证变更、延续记录信息***********/
    /**
     * 更新数据
     * 许可证变更、延续记录信息
     * 已建表
     */
//  @Scheduled(cron = "0 0 0 * * ?")===
  //@Scheduled(fixedDelay = 7200000)
//  @Scheduled(cron="0 * * * * ? ")
    public void getApplyRecord() {
    	try {
    		System.out.println("================ 开始更新Enterprise 许可证变更、延续记录信息 ================");
	        logToDb.addSysLog(" 开始更新Enterprise 许可证变更、延续记录信息 ");
	        int insertCount = 0;
	        long timekeepingStart = System.currentTimeMillis();
	        
	        //查询办结时间最大值
	        String startTime = "";
	        int page = 1;
	        String sql1 = "SELECT \"MAX\"(ITEMENDTIME) ITEMENDTIME from TB_ENTERPRISE_APPLYRECORD";
            List<Map> list1 = getBySqlMapper.findRecords(sql1);
            if(list1.size()>0 && list1.get(0)!=null){
                startTime = list1.get(0).get("ITEMENDTIME").toString();
            }
            
            //获取数据
            JSONArray object = getApplyRecordData(startTime,page);
            if(object!=null && !object.isEmpty()){
            	insertCount += insertApplyRecord(object);
            }
            /*
            while (!object.isEmpty()&&object.size()>0){
            	//插入数据
            	insertCount += insertApplyRecord(object.getJSONArray("pageData"));
                //打印信息
                System.out.println("接收数据："+object.getJSONArray("pageData").size()+";;插入数据：" +insertCount);
                //获取下一页数据
                object=getApplyRecordData(startTime,++page);
            }
	        */
	        //记录时间和插入数据条数
	        long timekeepingEnd = System.currentTimeMillis();
	        logToDb.addSysLog("Enterprise 许可证变更、延续记录信息更新数据完成，共计用时" + (timekeepingStart - timekeepingEnd) / 1000 + "秒,插入"+insertCount+"条数据");
	        System.out.println("================ Enterprise 许可证变更、延续记录信息数据完成,插入" + insertCount + "条数据  ================");
    	} catch (Exception e) {
    		e.printStackTrace();
    		logToDb.addSysLog("更新Enterprise 自行监测及记录信息数据异常");
    		System.out.println("================ 更新Enterprise 自行监测及记录信息数据异常  ================");
    	}
    }
	  
    /**
     * 插入数据库到数据库
     * 许可证变更、延续记录信息
     */
    public int  insertApplyRecord(JSONArray array){
    	
    	int insertCount = 0;
    	//拼接sql字符串
    	String sql = "INSERT INTO TB_ENTERPRISE_APPLYRECORD (ID, DATAID, DEVCOMPANY, ENTERID, ITEMENDTIME, INFORMATION, XKZNUM, ITEMTYPE) values ";
    	StringBuilder valuesStr = new StringBuilder();
    	for (int i = 0; i < array.size(); i++) {
    		JSONObject currObj = array.getJSONObject(i);
    		String dataId = currObj.getString("DATAID");
    		
    		//根据数据主键查询数据库
    		String sql2 = "select count(1) from TB_ENTERPRISE_APPLYRECORD where DATAID = '" + dataId + "'";
    		Integer count = getBySqlMapper.findrows(sql2);
    		if(count > 0){
    			continue;
    		}
    		
    		valuesStr.append("(TB_ENTERPRISE_APPLYRECORD_SEQ.nextval");
			valuesStr.append(",'").append(dataId);
			valuesStr.append("','").append(currObj.get("DEVCOMPANY"));
			valuesStr.append("','").append(currObj.get("ENTERID"));
			valuesStr.append("','").append(currObj.get("ITEMENDTIME"));
			valuesStr.append("','").append(currObj.get("INFORMATION"));
			valuesStr.append("','").append(currObj.get("XKZNUM"));
			valuesStr.append("','").append(currObj.get("ITEMTYPE"));
			valuesStr.append("')");
			
			//插入数据
			String sql1 = sql + valuesStr.toString();
	    	//插入数据库
	    	getBySqlMapper.insert(sql1);
	    	
	    	//清空stringbuilder
	    	valuesStr.setLength(0);
			
			//记录数据个数
			insertCount++;
		}
    	return insertCount;
    }
	    
	    
    /**
     * 发送请求，获取数据
     * 许可证变更、延续记录信息
     */
    public static JSONArray getApplyRecordData(String startTime,int page) {
    	try {
	        //获取建设项目URL接口地
	        String address = "http://10.102.33.36:8080/permit/rest/pwxkTusiInfo/getApplyRecord";
	        String param = "token=8e74444be0da48a3a47d3fd198cce6e8";
	        if (!startTime.equals("")) {
                param+="&begintime="+startTime;
            }
	        
	        System.out.println("param:" + param);
	        
	        //发送请求获取数据
	        String str = sendPost(address,param);
	        //解析返回数据
	        byte[] aesResult = decrypt(parseHexStr2Byte(str), "0c8b864668694a7a8f030d8c8f289aff");
	        JSONArray array =JSONArray.fromObject(new String(aesResult, "utf-8"));
	        
//	        System.out.println("array:" + array);
	        
	        JSONObject jsonObject = array.getJSONObject(0);
	        //判断result是数组，还是null
	        JSONArray result = new JSONArray();
	        try{
	        	result = jsonObject.getJSONArray("result");
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
	        //返回空
	        return result;
    	} catch (Exception e) {
	        e.printStackTrace();
	        return  null;
    	}
    }
}
