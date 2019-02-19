package com.gistone.seimp.micro.grant;

import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import org.junit.Test;
import org.springframework.stereotype.Service;

import com.gistone.seimp.util.RestWebServiceUtil;

@SuppressWarnings("all")
@Service
public class GrantService {

	/**
	 * 权限推送
	 * @throws Exception
	 */
	@Test
	public void test1() throws Exception{
		Map param = new HashMap();
		param.put("APPKEY", "ZWXX");
		param.put("APPNAME", "PORTAL");
		param.put("UUID", "afds_afd1_dfa1_dfas");
		param.put("LOGNAME", "zhangsan");
		param.put("USERNAME", "张三");
		param.put("GRANT", "起草");
		param.put("CREATETIME", "2018-01-01");
		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.55:9080/GrantService/rest/grant/putData", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
	
	/**
	 * 权限删除
	 * @throws Exception
	 */
	@Test
	public void test2() throws Exception{
		Map param = new HashMap();
		param.put("APPKEY", "ZWXX");
		param.put("UUID", "afds_afd1_dfa1_dfas");
		param.put("LOGNAME", "zhangsan");
		param.put("GRANT", "起草");
 		String result = RestWebServiceUtil.getUploadInformation("http://10.100.249.55:9080/GrantService/rest/grant/delData", JSONObject.fromObject(param).toString());
		System.err.println(result);
	}
}
