package com.gistone.seimp.service;

import java.util.List;
import java.util.Map;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.util.UserIPUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Created by qiang on 2018/3/26.
 */
@Component
public class LogToDb {

    @Autowired
    private GetBySqlMapper getBySqlMapper;

    /**
     * @Author:renqiang
     * @Description:添加日志
     * @Date:17:20 2017/10/11
     */
    public String addLog(HttpServletRequest request,
                       String mes) {
        try {
            HttpSession session = request.getSession();
            String userName = (String) session.getAttribute("loginName");
            if (userName == null) {
                return null;
            }
            
            //获取id
            String sql1 = "select LOG_SEQ.nextval \"currID\" from dual";
            List<Map> findRecords = getBySqlMapper.findRecords(sql1);
            String currID = findRecords.get(0).get("currID").toString();
            
            String loginIp = UserIPUtils.getIpAddress(request);
            String userID = (String) session.getAttribute("userID");
            String sql = "INSERT INTO \"tb_log\" (\"id\", \"time\", \"user_id\",\"user_name\", \"login_ip\", \"content\") VALUES ("+currID+", sysdate,"
                    + userID + ",'" + userName + "', '" + loginIp + "','" + mes + "')";
            getBySqlMapper.insert(sql);
            return currID;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public void addSysLog(
                       String mes) {
        try {
            String sql = "INSERT INTO \"tb_log\" (\"id\", \"time\", \"content\") VALUES (LOG_SEQ.nextval, sysdate,'" + mes + "')";
            getBySqlMapper.insert(sql);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    

}
