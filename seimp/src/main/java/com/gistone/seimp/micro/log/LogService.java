package com.gistone.seimp.micro.log;

import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import org.junit.Test;
import org.springframework.stereotype.Service;

import com.gistone.seimp.util.RestWebServiceUtil;

@Service
@SuppressWarnings("all")
public class LogService {

	/**
	 * 日志推送
	 * @throws Exception
	 */
	@Test
	public void test1() throws Exception{
		Map param = new HashMap();
		param.put("APPKEY", "TRHJPT");
		param.put("UUID", "f4f0-b32e-4119-9c8e-4440");
		param.put("USERNAME", "黄明祥");
		param.put("LOGNAME", "XXZX_HUANGMINGXIANG");
		param.put("APPNAME", "土壤系统");
		param.put("IP", "192.168.166.91");
		param.put("LOGTYPE", "1");
		param.put("LOGBODY", "登陆成功");
		param.put("CREATETIME", "2017-09-05 18:20:10");
		param.put("RID", "6460160024");
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.55:9080/LogService/rest/log/addData", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
	
	/**
	 * 日志删除
	 * @throws Exception
	 */
	@Test
	public void test2() throws Exception{
		Map param = new HashMap();
		param.put("APPKEY", "cs");
		param.put("RID", "122222222");
 		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.55:9080/LogService/rest/log/delData", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
	
	private String appkey = "TRHJPT";
	
	//推送日志
	public JSONObject addData(String UUID, String USERNAME, String LOGNAME, String IP, String LOGTYPE, String LOGBODY, String CREATETIME, String RID) throws Exception{
		Map param = new HashMap();
		param.put("APPKEY", appkey);
		param.put("UUID",  UUID);
		param.put("USERNAME", USERNAME);
		param.put("LOGNAME", LOGNAME);
		param.put("APPNAME", "土壤系统");
		param.put("IP", IP);
		param.put("LOGTYPE", LOGTYPE);
		param.put("LOGBODY", LOGBODY);
		param.put("CREATETIME", CREATETIME);
		param.put("RID", RID);
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.55:9080/LogService/rest/log/addData", JSONObject.fromObject(param).toString());
		return JSONObject.fromObject(result);
	}
}
