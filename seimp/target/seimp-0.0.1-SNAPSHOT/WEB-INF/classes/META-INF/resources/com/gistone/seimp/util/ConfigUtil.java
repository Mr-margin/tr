package com.gistone.seimp.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
@Configuration
@PropertySource(value = "classpath:/config.properties")
/**
 * 路径帮助类
 * 
 * @author WangShanxi
 */
public class ConfigUtil {

	
	@Value("${RunningStatus}")
	private String RunningStatus;
	
	@Value("${webAppName}")
	private String webAppName;
	
	
	public String getRunningStatus() {
		return RunningStatus;
	}
	
	public String getWebAppName() {
		return webAppName;
	}
	
	
}
