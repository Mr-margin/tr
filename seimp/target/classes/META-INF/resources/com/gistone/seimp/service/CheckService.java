package com.gistone.seimp.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;

/**
 * 验证数据集下载权限
 * @author luowenbin
 * @date 2018年7月30日
 */
@Service
public class CheckService {

	@Autowired
    private GetBySqlMapper getBySqlMapper;
	
	/**
     * 验证数据集下载权限
     */
    public int CheckSeDownRight(HttpServletRequest request, Integer metadataID) {
        HttpSession session = request.getSession();
        Object roleIDObj = session.getAttribute("roleID");
        if(roleIDObj != null){
	        String roleID =  session.getAttribute("roleID").toString();
	        if (roleID!=null && roleID!="") {
	        	int flag = 5;
	            String sql = "select \"ID\",\"DOWNAUTH\" from T_ROLE_DATARIGHT where ROLEID='"+roleID+"' and RIGHTID='"+metadataID+"'";
	            List<Map> result = getBySqlMapper.findRecords(sql);
	            if(result.size()>0){
	            	Map map = result.get(0);
	            	if(map.containsKey("DOWNAUTH")){
	            		String downAuth = map.get("DOWNAUTH").toString();
	            		if("1".equals(downAuth)){
	            			//有下载权限
	            			flag = 0;
	            			return flag;
	            		}
	            	}
	            	
	            }
	            //没有下载权限
	            return flag;
	        }
        }
        //未登录
        return 2;
    }
    
    /**
     * 验证是否登录
     */
    public int checkIsLogin(HttpServletRequest request) {
        HttpSession session = request.getSession();
        Object isLoginObj = session.getAttribute("isLogin");
        if(isLoginObj!=null){
	        String isLogin =  session.getAttribute("isLogin").toString();
	        if (isLogin!=null && isLogin!="") {
	        	//已登录
	        	return 0;
	        }
        }
        //未登录
        return 2;
    }
    
    /**
     * 判断是否查看数据列表的权限
     */
    public  int CheckSelectAuth(HttpServletRequest request, String metaId){
    	HttpSession session = request.getSession();
    	String userID = session.getAttribute("userID").toString();//用户id
        String roleID = session.getAttribute("roleID").toString();//角色id
    	
    	String selSql = "select 1 from dual where EXISTS(select 1 from TB_ASK_AUTH where USERID = '"+userID+"' and METAID = '"+metaId+"') "
				+ " or EXISTS(select * from T_ROLE_DATARIGHT where ROLEID = '" + roleID + "' and SELECTAUTH='1')";
		List<Map> result = getBySqlMapper.findRecords(selSql);
		if(result.size()>0){
			return 0;
		}
    	return 3;
    }
}
