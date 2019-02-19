package com.gistone.seimp.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;

@Service
public class VisitOrDownService {

	@Autowired
    private GetBySqlMapper getBySqlMapper;
	
	public void addData(String metadataID, String type, Map user) throws Exception{
		//时间
		Date date = new Date();
		String dateStr = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
		String dateDayStr = new SimpleDateFormat("yyyy-MM-dd").format(date) + " 00:00:00";
		
		//TB_VISITORDOWN_DAY
		//记录每天，单个数据集的访问次数或下载次数
		String sqlSelect = "select count(1) from TB_VISITORDOWN_DAY "
				+ "where METADATAID = " + metadataID + " and DAYDATE = to_date('" + dateDayStr + "','yyyy-mm-dd hh24:mi:ss')"
				+ " and TYPE = '" + type + "'" ;
		Integer count = getBySqlMapper.findrows(sqlSelect);
		if(count > 0){
			//如果数据库中 当前天的数据已经有了，则将次数加1
			String sqlUpdate = "update TB_VISITORDOWN_DAY set COUNT = COUNT + 1 "
					+ "where METADATAID = " + metadataID + " and DAYDATE = to_date('" + dateDayStr + "','yyyy-mm-dd hh24:mi:ss')"
					+ " and TYPE = '" + type + "'" ;
			getBySqlMapper.update(sqlUpdate);
		}else{
			//如果数据库中，当天的数据没有，则新加一条数据
			String sqlInsert = "insert into TB_VISITORDOWN_DAY (ID, METADATAID, COUNT, TYPE, DAYDATE) values "
					+ "(TB_VISITORDOWN_DAY_SEQ.nextval, " + metadataID + ", 1, '" + type + "', to_date('" + dateDayStr + "','yyyy-mm-dd hh24:mi:ss'))";
			getBySqlMapper.insert(sqlInsert);
		}
		
		//TB_VISITORDOWN
		String userID = "";
		if(user.get("userID") != null){
			userID = user.get("userID").toString();
		}
		String userIP = "";
		if(user.get("userIP") != null){
			userIP = user.get("userIP").toString();
		}
		//记录当前访问记录或者下载记录
		String sqlInsert = "insert into TB_VISITORDOWN (ID, METADATAID, TYPE, USERID, USERIP, DATETIME) values "
				+ "(TB_VISITORDOWN_SEQ.nextval, '" + metadataID + "', '" + type + "', '" + userID + "', '" + userIP + "',to_date('" + dateStr + "','yyyy-mm-dd hh24:mi:ss'))";
		getBySqlMapper.insert(sqlInsert);
		
		//记录当前数据集的总的访问次数
		if("1".equals(type)){
			String sql = "update \"tb_source_metadata\" set \"visitAccount\" = \"NVL\"(\"visitAccount\", 0)+1 where \"id\" =" + metadataID;
			getBySqlMapper.update(sql);
		}
		
	}
}
