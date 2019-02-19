package com.gistone.seimp.micro.receive;

import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import org.junit.Test;

import com.gistone.seimp.util.RestWebServiceUtil;

public class receiveUser {

	/**
	 * 单点登录认证
	 * @throws Exception
	 */
	@Test
	public void auth() throws Exception{
		String obj = "{\"TYPE\":\"1\",\"ID\":\"123456\",\"NAME\":\"张三\",\"SPELLNAME\":\"zhangsan\",\"MAIL\":\"zhangsan@126.com\",\"USERTYPE\":\"0\",\"TELEPHONE\":\"2207\",\"ADDRESS\":\"西楼201\",\"LOGNAME\":\"bgt_zhangsan\",\"MJ\":\"1\",\"STATE\":\"1\",\"FAX\":\"123456\",\"NICK\":\"zs\",\"POSITION\":\"处员\",\"UUID\":\"c066-96cf-4ad3-a917-0d66\",\"CODE\":\"rctb_123456\",\"MOBILE\":\"13411111111\",\"BIRTHYEAR\":\"1980\",\"BIRTHMONTH\":\"1\",\"NATION\":\"汉族\",\"POLITICAL\":\"群众\",\"EDUCATION\":\"本科\",\"DEGREE\":\"学士\",\"LEVEL\":\"0\", \"SEX\":\"1\",\"ORGANIZEIDS\":[{\"ID\":\"123\",\"ISMAIN\":\"1\",\"INDEX\":\"1\",\"MAINUNIT\":\"123\",\"UUID\":\" c066-96cf-4ad3-a917-0d69\",\"CODE\":\" rctb_654321\"}]}";
		String result = RestWebServiceUtil.getUploadInformation("http://localhost:9093/seimpWs/sync/user", obj);
		System.out.println(result);
		JSONObject d =  JSONObject.fromObject(result);
	}
}
