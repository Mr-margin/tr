package com.gistone.seimp.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

/**
 * @Author:renqiang
 * @Description: Created by soil-pc2 on 2017/10/16.
 */

public class Check {

	
	
    /**
     * @Author:renqiang
     * @Description:校验用户是否登录，是否有访问某模块的权限
     * @Date:17:20 2017/10/11
     */
    public static int CheckRight(HttpServletRequest request, String part) {
        HttpSession session = request.getSession();
        List rights = (List) session.getAttribute("rights");
        if (rights != null) {
        	if("".equals(part)){
        		return 0;
        	}
            String[] arr = part.split(",");
            int flag = 3;
            for (String tem : arr) {
                if (rights.contains(tem)) {
                    flag = 0;
                }
            }
            //没有权限
            return flag;
        }
        //未登录
        return 2;
    }
    

}
