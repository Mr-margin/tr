package com.gistone.seimp.micro.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gistone.seimp.util.RestWebServiceUtil;
 








import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONObject;

import org.junit.Test;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("all")
public class PortalLoginService {

	
	/**
	 * 登陆认证
	 * @throws Exception
	 */
	@Test
	public void test1() throws Exception{
		Map param = new HashMap();
		param.put("KEY", "TRHJPT");
		param.put("PASSWORD", "adfsdfsaffa");
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.24:9080/AuthService/rest/login", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
	
	/**
	 * 单点登录认证
	 * @throws Exception
	 */
	@Test
	public void test2() throws Exception{
		Map param = new HashMap();
		param.put("TOKEN", "T_kDKQXlnFP5b12N-v3af5QvQqMLbpCkbPBovaD6rWWJzyIkVrgNqHCA==0T");
		param.put("APPKEY", "TRHJPT");
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.24:9080/AuthService/rest/auth", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
	
	/**
	 * 微服务访问权限
	 * @throws Exception
	 */
	@Test
	public void test3() throws Exception{
		Map param = new HashMap();
		param.put("APPKEY", "PORTAL");
		param.put("SERVICE", "APP");
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.24:9080/AuthService/rest/access", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
	
	/**
	 * 单点登录认证
	 * @throws Exception
	 */
//	@Test
	public JSONObject auth(String token, String appkey) throws Exception{
		Map param = new HashMap();
		param.put("TOKEN", token);
		param.put("APPKEY", appkey);
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.24:9080/AuthService/rest/auth", JSONObject.fromObject(param).toString());
		if(result!= null && !"".equals(result)){
			return JSONObject.fromObject(result);
		}else{
			return new JSONObject();
		}
	}
}
