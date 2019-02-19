package com.gistone.seimp.filter;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.Set;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.gistone.seimp.util.CheckSensitiveStringUtil;
import com.gistone.seimp.util.LogFileUtil;

@WebFilter(urlPatterns = "/*")  
public class MyFilter implements Filter {  
    @Override  
    public void init(FilterConfig filterConfig) throws ServletException {  
  
    }  
  
    @Override  
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
    	HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        
        String url=httpServletRequest.getRequestURI();
        
        
        
        //.html,.js,.css 不需要过滤
        if(url.indexOf(".") != -1 && url.indexOf(".do") == -1){
        	filterChain.doFilter(request, response);
        }else{
        	//过滤参数
//        	if(url.indexOf("getPollutionLandStructureData") == -1 && url.indexOf("addNews") == -1){
//        		filterChain.doFilter(request, response);
//        	}else{
        	if(url.contains("modifyNews") || url.contains("modifyNewsAndPass") || url.contains("addNews")){
        		filterChain.doFilter(request, response);
        	}else{
        		//遍历所有参数
        		
        		Map<String, String[]> parameterMap = httpServletRequest.getParameterMap();
        		Set<String> mapKeySet = parameterMap.keySet();
        		for (String keyStr : mapKeySet) {
					String[] parameterArr = parameterMap.get(keyStr);
					for (String parameterStr : parameterArr) {
						if(CheckSensitiveStringUtil.inputTextValue(parameterStr)){
							response.getWriter().print("{\"status\":\"4\"}");
							return;
						}
					}
				}
        		
        		
        		filterChain.doFilter(request, response);
					
        	}
        }
    }  
  
    @Override  
    public void destroy() {  
  
    }  
}  
