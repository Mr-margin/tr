package com.gistone.seimp.listener;

import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.gistone.seimp.runner.TestRedis;

/**
 * 监听Session
 * @Description: Session，销毁的时候，删除Redis中的登录信息
 * @author luowenbin
 * @date 2018年7月24日
 */
@WebListener
@SuppressWarnings("all")
public class UserSessionListener implements HttpSessionListener {

	//监听session创建
	@Override
	public void sessionCreated(HttpSessionEvent se) {
		//
		HttpSession session = se.getSession();
//		System.out.println(session.getMaxInactiveInterval());
		session.setMaxInactiveInterval(2*60*60);
//		session.setMaxInactiveInterval(1*60);
//		System.out.println(session.getMaxInactiveInterval());
	}

	//监听session销毁
	@Override
	public void sessionDestroyed(HttpSessionEvent se) {
		HttpSession session = se.getSession();
		//获取token
		Object tokenObj = session.getAttribute("token");
		if(tokenObj != null){
			String tokenStr = tokenObj.toString();
			//删除Redis中String
//			TestRedis testRedis = new TestRedis();
//	        testRedis.connectRedis();
//	        testRedis.delKey(tokenStr);
		}
	}

}
