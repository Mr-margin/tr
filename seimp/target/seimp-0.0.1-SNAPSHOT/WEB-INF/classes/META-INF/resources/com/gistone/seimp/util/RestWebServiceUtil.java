package com.gistone.seimp.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ClientConnectionRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class RestWebServiceUtil {

	
	/**
	 * 发送put请求
	 * @param path
	 * @param obj
	 * @return
	 * @throws Exception
	 */
	public static String getUploadInformation(String  path,String obj) throws Exception {
        //创建连接
        URL url = new URL(path);
        HttpURLConnection connection ;
        StringBuffer sbuffer=null;
//        try {
        	//添加 请求内容
            connection= (HttpURLConnection) url.openConnection();
            //设置http连接属性
            connection.setDoOutput(true);// http正文内，因此需要设为true, 默认情况下是false;
            connection.setDoInput(true);// 设置是否从httpUrlConnection读入，默认情况下是true;
            connection.setRequestMethod("PUT"); // 可以根据需要 提交 GET、POST、DELETE、PUT等http提供的功能
            //connection.setUseCaches(false);//设置缓存，注意设置请求方法为post不能用缓存
            // connection.setInstanceFollowRedirects(true);

            connection.setRequestProperty("Host", "*******");  //设置请 求的服务器网址，域名，例如***.**.***.***
            connection.setRequestProperty("Content-Type", " application/json");//设定 请求格式 json，也可以设定xml格式的
            connection.setRequestProperty("Accept-Charset", "utf-8");  //设置编码语言
            connection.setRequestProperty("X-Auth-Token", "token");  //设置请求的token
            connection.setRequestProperty("Connection", "keep-alive");  //设置连接的状态
            connection.setRequestProperty("Transfer-Encoding", "chunked");//设置传输编码
            connection.setRequestProperty("Content-Length", obj.toString().getBytes().length + ""); //设置文件请求的长度  
            connection.setReadTimeout(10000);//设置读取超时时间          
            connection.setConnectTimeout(10000);//设置连接超时时间           
            connection.connect();            
            OutputStream out = connection.getOutputStream();//向对象输出流写出数据，这些数据将存到内存缓冲区中          
            out.write(obj.toString().getBytes("UTF-8"));//out.write(new String("测试数据").getBytes());                   
            out.flush();//刷新对象输出流，将任何字节都写入潜在的流中
            // 关闭流对象,此时，不能再向对象输出流写入任何数据，先前写入的数据存在于内存缓冲区中          
            out.close();           
            //读取响应           
            if (connection.getResponseCode()==200){
                // 从服务器获得一个输入流
            	InputStreamReader inputStream =new InputStreamReader(connection.getInputStream());
            	//调用HttpURLConnection连接对象的getInputStream()函数, 将内存缓冲区中封装好的完整的HTTP请求电文发送到服务端。
            	BufferedReader reader = new BufferedReader(inputStream);  
            	String lines;                
            	sbuffer= new StringBuffer("");  
		  		while ((lines = reader.readLine()) != null) {                
					lines = new String(lines.getBytes(), "utf-8");                    
					sbuffer.append(lines);                
				}                
				reader.close();         
		 	}else{
		 		System.out.println(connection.getResponseCode());
		 		System.out.println(connection.getResponseMessage());
		 		
		 		
		 		//Log.i(TAG,"请求失败"+connection.getResponseCode());    
        	}    
            //断开连接           
            connection.disconnect();
//        } catch (Exception e) {  
//         	 e.printStackTrace();     
//        }
        
        if(sbuffer != null){
        	return sbuffer.toString();
        }else{
        	return "";
        }
	}
	
	
}
