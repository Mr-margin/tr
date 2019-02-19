package com.gistone.seimp.job;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

/**
 * 定时任务接受遥感核查的污染地块数据
 * @author Administrator
 *
 */
@Component
@Configuration
@EnableScheduling //启用定时任务
public class GetWurandikuaiData {
	
	@Autowired
	private GetBySqlMapper getBySqlMapper;
	
//	@Scheduled(cron="0 18 10 23 10 ?")
	public void GetData(){
		String sql1 = "insert ALL into \"tb_wurandikuai_yaoganhecha\" (\"OID\",\"GUID\",\"GEOMETRY\",\"NAME\",\"TYPE\",\"DISTRICT_CODE\",\"ADRESS\",\"SHENG\",\"SHI\",\"XIAN\",\"XIANG\",\"CUN\",\"LONGITUDE\",\"LATITUDE\",\"LAIYUAN\","
				+ "\"REMARK\",\"DALEI\",\"BIEMIN\",\"BIANHAO\",\"PREDID\",\"AFTDID\",\"PRODUCTION\",\"BUILDTIME\",\"LINK\",\"IS_GUIMO\",\"GUIMO\",\"SURVEY_STATUS\",\"SURVEY_PROGRESS\",\"EXCEPTION_REPORTING\","
				+ "\"ER_DISTRICT_CODE\",\"DISTRICT_CODE_STR\",\"GW_UPDATE_TIME\",\"GW_UPDATE_TYPE\",\"UPDATA_STATUS\") values ";
		String sql3 = " into \"tb_wurandikuai_yaoganhecha\" (\"OID\",\"GUID\",\"GEOMETRY\",\"NAME\",\"TYPE\",\"DISTRICT_CODE\",\"ADRESS\",\"SHENG\",\"SHI\",\"XIAN\",\"XIANG\",\"CUN\",\"LONGITUDE\",\"LATITUDE\",\"LAIYUAN\","
				+ "\"REMARK\",\"DALEI\",\"BIEMIN\",\"BIANHAO\",\"PREDID\",\"AFTDID\",\"PRODUCTION\",\"BUILDTIME\",\"LINK\",\"IS_GUIMO\",\"GUIMO\",\"SURVEY_STATUS\",\"SURVEY_PROGRESS\",\"EXCEPTION_REPORTING\","
				+ "\"ER_DISTRICT_CODE\",\"DISTRICT_CODE_STR\",\"GW_UPDATE_TIME\",\"GW_UPDATE_TYPE\",\"UPDATA_STATUS\") values ";
		StringBuilder sql2 = new StringBuilder();
		StringBuilder mysql = new StringBuilder();
		double count = 0;
		DataService service = new DataServiceService().getDataServicePort();
		List<Data> list = service.getData("2016-10-01", "2017-11-16");
		for(Data data:list){
			if(count==0){
				mysql.append(sql1);
			}else{
				mysql.append(sql3);
			}
			sql2.append("('").append(data.getOid()+"").append("',");
			sql2.append("'").append(data.getGuid()).append("',");
			sql2.append("'").append(data.getGeometry()).append("',");
			sql2.append("'").append(data.getName()).append("',");
			sql2.append("'").append(data.getType()).append("',");
			sql2.append("'").append(data.getDistrictCode()).append("',");
			sql2.append("'").append(data.getAddress()).append("',");
			sql2.append("'").append(data.getSheng()).append("',");
			sql2.append("'").append(data.getShi()).append("',");
			sql2.append("'").append(data.getXian()).append("',");
			sql2.append("'").append(data.getXiang()).append("',");
			sql2.append("'").append(data.getCun()).append("',");
			sql2.append("'").append(data.getLongitude()).append("',");
			sql2.append("'").append(data.getLatitude()).append("',");
			sql2.append("'").append(data.getLaiyuan()).append("',");
			sql2.append("'").append(data.getRemark()).append("',");
			sql2.append("'").append(data.getDalei()).append("',");
			sql2.append("'").append(data.getBiemin()).append("',");
			sql2.append("'").append(data.getBianhao()).append("',");
			sql2.append("'").append(data.getPredid()).append("',");
			sql2.append("'").append(data.getAftdid()).append("',");
			sql2.append("'").append(data.getProduction()).append("',");
			sql2.append("'").append(data.getBuildtime()).append("',");
			sql2.append("'").append(data.getLink()).append("',");
			sql2.append("'").append(data.getIsGuimo()).append("',");
			sql2.append("'").append(data.getGuimo()).append("',");
			sql2.append("'").append(data.getSurveyStatus()).append("',");
			sql2.append("'").append(data.getSurveyProgress()).append("',");
			sql2.append("'").append(data.getExceptionReporting()).append("',");
			sql2.append("'").append(data.getErDistrictCode()).append("',");
			sql2.append("'").append(data.getDistrictCodeStr()).append("',");
			sql2.append("'").append(data.getGwUpdateTime()).append("',");
			sql2.append("'").append(data.getGwUpdateType()).append("',");
			sql2.append("'").append(data.getUpdateStatus()).append("')");
			mysql.append(sql2);
			sql2.setLength(0);
			count++;
			if(count>50){
				getBySqlMapper.insert(mysql.toString()+" SELECT  1 FROM dual");
				count = 0;
				mysql.setLength(0);
			}
		}
		if(count>0){
			getBySqlMapper.insert(mysql.toString()+" SELECT  1 FROM dual");
			count = 0;
			mysql.setLength(0);
		}
		
	}


//	@Scheduled(cron="0 51 10 23 10 ?")
	public void getHttpData()throws Exception{
		// 拼凑get请求的URL字串，使用URLEncoder.encode对特殊和不可见字符进行编码
        String getURL = "http://10.10.120.146/wrdkpfmis/suspected/wrdkjbxxb/queryBasicInfo.do?token=123456";
        URL getUrl = new URL(getURL);
        // 根据拼凑的URL，打开连接，URL.openConnection函数会根据URL的类型，
        // 返回不同的URLConnection子类的对象，这里URL是一个http，因此实际返回的是HttpURLConnection
        HttpURLConnection connection = (HttpURLConnection) getUrl.openConnection();
        // 进行连接，但是实际上get request要在下一句的connection.getInputStream()函数中才会真正发到服务器
        connection.connect();
        // 取得输入流，并使用Reader读取
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "utf-8"));// 设置编码,否则中文乱码
        System.out.println("=============================");
        System.out.println("Contents of get request");
        System.out.println("=============================");
        String lines;
        StringBuilder data = new StringBuilder();
        while ((lines = reader.readLine()) != null) {
        	data.append(lines);
        }
        reader.close();
        // 断开连接
        connection.disconnect();
        
        //存储数据到数据库
        String sql1 = "insert all into \"tb_wurandikuai\" (Wrdkid,Cbdcid,Wrdkbm,province_code,city_code,country_code,xzbm,wrdkszxz,wrdkdz,sfzc,jcsj,hylb,hydm,zdmj,"
        		+ "lxrxm,Lxrdh,djzclx,qygm,yyqssj,yyjzsj,dkqs,syqdwmc,syqdwxr,syqdwlxdh,sfwygyy,dkghyt,dklyls,bz,wrdkzxjd,wrdkzxwd,ydwmc,Fddbr,Flag,Tsamp,"
        		+ "Frdb,Wryxxdcbid,Czyxsshq,Pmbztlj,zycpsjly,zycpqtsjly,zyyfclsjly,zyyfclqtsjly,zyzjcw,zyscgylctlj,zyscgymx,ccss,ydccqy,ccssszqyffcs,ccsssjly,"
        		+ "ccssqtsjly,ccqyfhcs,ccqysjly,ccqyqtsjly,gdxlcs,dxgdgxt,fszzywrwmc,fszlqwz,fszlqmj,fszlqwrhj,fszlqwrhjlj,fszlqfhcs,fszlsjly,fszlqtsjly,gtfwzc,"
        		+ "gtfwzcqfhcs,dknqtwrwhj,kqywzk,sgfsqk,sgfscs,wrqyclqk,gfzlsjly,gfzlqtsjly,yqymc,yyksrq,yyjsrq,wrsgfsqk,Dkszzt,Pollueted,Scjdbm,Xzqh,Fxjb) values ";
        String sql3 = " into \"tb_wurandikuai\" (Wrdkid,Cbdcid,Wrdkbm,province_code,city_code,country_code,xzbm,wrdkszxz,wrdkdz,sfzc,jcsj,hylb,hydm,zdmj,"
        		+ "lxrxm,Lxrdh,djzclx,qygm,yyqssj,yyjzsj,dkqs,syqdwmc,syqdwxr,syqdwlxdh,sfwygyy,dkghyt,dklyls,bz,wrdkzxjd,wrdkzxwd,ydwmc,Fddbr,Flag,Tsamp,"
        		+ "Frdb,Wryxxdcbid,Czyxsshq,Pmbztlj,zycpsjly,zycpqtsjly,zyyfclsjly,zyyfclqtsjly,zyzjcw,zyscgylctlj,zyscgymx,ccss,ydccqy,ccssszqyffcs,ccsssjly,"
        		+ "ccssqtsjly,ccqyfhcs,ccqysjly,ccqyqtsjly,gdxlcs,dxgdgxt,fszzywrwmc,fszlqwz,fszlqmj,fszlqwrhj,fszlqwrhjlj,fszlqfhcs,fszlsjly,fszlqtsjly,gtfwzc,"
        		+ "gtfwzcqfhcs,dknqtwrwhj,kqywzk,sgfsqk,sgfscs,wrqyclqk,gfzlsjly,gfzlqtsjly,yqymc,yyksrq,yyjsrq,wrsgfsqk,Dkszzt,Pollueted,Scjdbm,Xzqh,Fxjb) values ";
        StringBuilder sql2 = new StringBuilder();
        StringBuilder mysql = new StringBuilder();
        double count = 0;
        JSONArray array = new JSONArray(data.toString());
        if(array.length()>0){
        	for (int i = 0; i < array.length(); i++) {
        		if(count==0){
    				mysql.append(sql1);
    			}else{
    				mysql.append(sql3);
    			}
				JSONObject obj = (JSONObject)array.get(i);
				if(obj.has("wrdkid")){
					if(obj.get("wrdkid")=="null"){
						sql2.append("(").append(obj.get("wrdkid")).append(",");
					}else{
						sql2.append("('").append(obj.get("wrdkid")).append("',");
					}
				}else{
					sql2.append("('").append("',");
				}
				if(obj.has("cbdcid")){
					if(obj.get("cbdcid")=="null"){
						sql2.append("").append(obj.get("cbdcid")).append(",");
					}else{
						sql2.append("'").append(obj.get("cbdcid")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrdkbm")){
					if(obj.get("wrdkbm")=="null"){
						sql2.append("").append(obj.get("wrdkbm")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrdkbm")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("province_code")){
					if(obj.get("province_code")=="null"){
						sql2.append("").append(obj.get("province_code")).append(",");
					}else{
						sql2.append("'").append(obj.get("province_code")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("city_code")){
					if(obj.get("city_code")=="null"){
						sql2.append("").append(obj.get("city_code")).append(",");
					}else{
						sql2.append("'").append(obj.get("city_code")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("country_code")){
					if(obj.get("country_code")=="null"){
						sql2.append("").append(obj.get("country_code")).append(",");
					}else{
						sql2.append("'").append(obj.get("country_code")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("xzbm")){
					if(obj.get("xzbm")=="null"){
						sql2.append("").append(obj.get("xzbm")).append(",");
					}else{
						sql2.append("'").append(obj.get("xzbm")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrdkszxz")){
					if(obj.get("wrdkszxz")=="null"){
						sql2.append("").append(obj.get("wrdkszxz")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrdkszxz")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrdkdz")){
					if(obj.get("wrdkdz")=="null"){
						sql2.append("").append(obj.get("wrdkdz")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrdkdz")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("sfzc")){
					if(obj.get("sfzc")=="null"){
						sql2.append("").append(obj.get("sfzc")).append(",");
					}else{
						sql2.append("'").append(obj.get("sfzc")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("jcsj")){
					if(obj.get("jcsj")=="null"){
						sql2.append("").append(obj.get("jcsj")).append(",");
					}else{
						sql2.append("'").append(obj.get("jcsj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("hylb")){
					if(obj.get("hylb")=="null"){
						sql2.append("").append(obj.get("hylb")).append(",");
					}else{
						sql2.append("'").append(obj.get("hylb")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("hydm")){
					if(obj.get("hydm")=="null"){
						sql2.append("").append(obj.get("hydm")).append(",");
					}else{
						sql2.append("'").append(obj.get("hydm")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zdmj")){
					if(obj.get("zdmj")=="null"){
						sql2.append("").append(obj.get("zdmj")).append(",");
					}else{
						sql2.append("'").append(obj.get("zdmj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("lxrxm")){
					if(obj.get("lxrxm")=="null"){
						sql2.append("").append(obj.get("lxrxm")).append(",");
					}else{
						sql2.append("'").append(obj.get("lxrxm")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("lxrdh")){
					if(obj.get("lxrdh")=="null"){
						sql2.append("").append(obj.get("lxrdh")).append(",");
					}else{
						sql2.append("'").append(obj.get("lxrdh")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("djzclx")){
					if(obj.get("djzclx")=="null"){
						sql2.append("").append(obj.get("djzclx")).append(",");
					}else{
						sql2.append("'").append(obj.get("djzclx")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("qygm")){
					if(obj.get("qygm")=="null"){
						sql2.append("").append(obj.get("qygm")).append(",");
					}else{
						sql2.append("'").append(obj.get("qygm")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("yyqssj")){
					if(obj.get("yyqssj")=="null"){
						sql2.append("").append(obj.get("yyqssj")).append(",");
					}else{
						sql2.append("'").append(obj.get("yyqssj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("yyjzsj")){
					if(obj.get("yyjzsj")=="null"){
						sql2.append("").append(obj.get("yyjzsj")).append(",");
					}else{
						sql2.append("'").append(obj.get("yyjzsj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("dkqs")){
					if(obj.get("dkqs")=="null"){
						sql2.append("").append(obj.get("dkqs")).append(",");
					}else{
						sql2.append("'").append(obj.get("dkqs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("syqdwmc")){
					if(obj.get("syqdwmc")=="null"){
						sql2.append("").append(obj.get("syqdwmc")).append(",");
					}else{
						sql2.append("'").append(obj.get("syqdwmc")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("syqdwxr")){
					if(obj.get("syqdwxr")=="null"){
						sql2.append("").append(obj.get("syqdwxr")).append(",");
					}else{
						sql2.append("'").append(obj.get("syqdwxr")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("syqdwlxdh")){
					if(obj.get("syqdwlxdh")=="null"){
						sql2.append("").append(obj.get("syqdwlxdh")).append(",");
					}else{
						sql2.append("'").append(obj.get("syqdwlxdh")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("sfwygyy")){
					if(obj.get("sfwygyy")=="null"){
						sql2.append("").append(obj.get("sfwygyy")).append(",");
					}else{
						sql2.append("'").append(obj.get("sfwygyy")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("dkghyt")){
					if(obj.get("dkghyt")=="null"){
						sql2.append("").append(obj.get("dkghyt")).append(",");
					}else{
						sql2.append("'").append(obj.get("dkghyt")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("dklyls")){
					if(obj.get("dklyls")=="null"){
						sql2.append("").append(obj.get("dklyls")).append(",");
					}else{
						sql2.append("'").append(obj.get("dklyls")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("bz")){
					if(obj.get("bz")=="null"){
						sql2.append("").append(obj.get("bz")).append(",");
					}else{
						sql2.append("'").append(obj.get("bz")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrdkzxjd")){
					if(obj.get("wrdkzxjd")=="null"){
						sql2.append("").append(obj.get("wrdkzxjd")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrdkzxjd")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrdkzxwd")){
					if(obj.get("wrdkzxwd")=="null"){
						sql2.append("").append(obj.get("wrdkzxwd")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrdkzxwd")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ydwmc")){
					if(obj.get("ydwmc")=="null"){
						sql2.append("").append(obj.get("ydwmc")).append(",");
					}else{
						sql2.append("'").append(obj.get("ydwmc")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fddbr")){
					if(obj.get("fddbr")=="null"){
						sql2.append("").append(obj.get("fddbr")).append(",");
					}else{
						sql2.append("'").append(obj.get("fddbr")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("flag")){
					if(obj.get("flag")=="null"){
						sql2.append("").append(obj.get("flag")).append(",");
					}else{
						sql2.append("'").append(obj.get("flag")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("tsamp")){
					if(obj.get("tsamp")=="null"){
						sql2.append("").append(obj.get("tsamp")).append(",");
					}else{
						sql2.append("'").append(obj.get("tsamp")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("frdb")){
					if(obj.get("frdb")=="null"){
						sql2.append("").append(obj.get("frdb")).append(",");
					}else{
						sql2.append("'").append(obj.get("frdb")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wryxxdcbid")){
					if(obj.get("wryxxdcbid")=="null"){
						sql2.append("").append(obj.get("wryxxdcbid")).append(",");
					}else{
						sql2.append("'").append(obj.get("wryxxdcbid")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("czyxsshq")){
					if(obj.get("czyxsshq")=="null"){
						sql2.append("").append(obj.get("czyxsshq")).append(",");
					}else{
						sql2.append("'").append(obj.get("czyxsshq")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("pmbztlj")){
					if(obj.get("pmbztlj")=="null"){
						sql2.append("").append(obj.get("pmbztlj")).append(",");
					}else{
						sql2.append("'").append(obj.get("pmbztlj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zycpsjly")){
					if(obj.get("zycpsjly")=="null"){
						sql2.append("").append(obj.get("zycpsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("zycpsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zycpqtsjly")){
					if(obj.get("zycpqtsjly")=="null"){
						sql2.append("").append(obj.get("zycpqtsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("zycpqtsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zyyfclsjly")){
					if(obj.get("zyyfclsjly")=="null"){
						sql2.append("").append(obj.get("zyyfclsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("zyyfclsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zyyfclqtsjly")){
					if(obj.get("zyyfclqtsjly")=="null"){
						sql2.append("").append(obj.get("zyyfclqtsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("zyyfclqtsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zyzjcw")){
					if(obj.get("zyzjcw")=="null"){
						sql2.append("").append(obj.get("zyzjcw")).append(",");
					}else{
						sql2.append("'").append(obj.get("zyzjcw")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zyscgylctlj")){
					if(obj.get("zyscgylctlj")=="null"){
						sql2.append("").append(obj.get("zyscgylctlj")).append(",");
					}else{
						sql2.append("'").append(obj.get("zyscgylctlj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("zyscgymx")){
					if(obj.get("zyscgymx")=="null"){
						sql2.append("").append(obj.get("zyscgymx")).append(",");
					}else{
						sql2.append("'").append(obj.get("zyscgymx")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccss")){
					if(obj.get("ccss")=="null"){
						sql2.append("").append(obj.get("ccss")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccss")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ydccqy")){
					if(obj.get("ydccqy")=="null"){
						sql2.append("").append(obj.get("ydccqy")).append(",");
					}else{
						sql2.append("'").append(obj.get("ydccqy")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccssszqyffcs")){
					if(obj.get("ccssszqyffcs")=="null"){
						sql2.append("").append(obj.get("ccssszqyffcs")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccssszqyffcs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccsssjly")){
					if(obj.get("ccsssjly")=="null"){
						sql2.append("").append(obj.get("ccsssjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccsssjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccssqtsjly")){
					if(obj.get("ccssqtsjly")=="null"){
						sql2.append("").append(obj.get("ccssqtsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccssqtsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccqyfhcs")){
					if(obj.get("ccqyfhcs")=="null"){
						sql2.append("").append(obj.get("ccqyfhcs")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccqyfhcs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccqysjly")){
					if(obj.get("ccqysjly")=="null"){
						sql2.append("").append(obj.get("ccqysjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccqysjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("ccqyqtsjly")){
					if(obj.get("ccqyqtsjly")=="null"){
						sql2.append("").append(obj.get("ccqyqtsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("ccqyqtsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("gdxlcs")){
					if(obj.get("gdxlcs")=="null"){
						sql2.append("").append(obj.get("gdxlcs")).append(",");
					}else{
						sql2.append("'").append(obj.get("gdxlcs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("dxgdgxt")){
					if(obj.get("dxgdgxt")=="null"){
						sql2.append("").append(obj.get("dxgdgxt")).append(",");
					}else{
						sql2.append("'").append(obj.get("dxgdgxt")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszzywrwmc")){
					if(obj.get("fszzywrwmc")=="null"){
						sql2.append("").append(obj.get("fszzywrwmc")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszzywrwmc")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlqwz")){
					if(obj.get("fszlqwz")=="null"){
						sql2.append("").append(obj.get("fszlqwz")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlqwz")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlqmj")){
					if(obj.get("fszlqmj")=="null"){
						sql2.append("").append(obj.get("fszlqmj")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlqmj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlqwrhj")){
					if(obj.get("fszlqwrhj")=="null"){
						sql2.append("").append(obj.get("fszlqwrhj")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlqwrhj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlqwrhjlj")){
					if(obj.get("fszlqwrhjlj")=="null"){
						sql2.append("").append(obj.get("fszlqwrhjlj")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlqwrhjlj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlqfhcs")){
					if(obj.get("fszlqfhcs")=="null"){
						sql2.append("").append(obj.get("fszlqfhcs")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlqfhcs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlsjly")){
					if(obj.get("fszlsjly")=="null"){
						sql2.append("").append(obj.get("fszlsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fszlqtsjly")){
					if(obj.get("fszlqtsjly")=="null"){
						sql2.append("").append(obj.get("fszlqtsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("fszlqtsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("gtfwzc")){
					if(obj.get("gtfwzc")=="null"){
						sql2.append("").append(obj.get("gtfwzc")).append(",");
					}else{
						sql2.append("'").append(obj.get("gtfwzc")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("gtfwzcqfhcs")){
					if(obj.get("gtfwzcqfhcs")=="null"){
						sql2.append("").append(obj.get("gtfwzcqfhcs")).append(",");
					}else{
						sql2.append("'").append(obj.get("gtfwzcqfhcs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("dknqtwrwhj")){
					if(obj.get("dknqtwrwhj")=="null"){
						sql2.append("").append(obj.get("dknqtwrwhj")).append(",");
					}else{
						sql2.append("'").append(obj.get("dknqtwrwhj")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("kqywzk")){
					if(obj.get("kqywzk")=="null"){
						sql2.append("").append(obj.get("kqywzk")).append(",");
					}else{
						sql2.append("'").append(obj.get("kqywzk")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("sgfsqk")){
					if(obj.get("sgfsqk")=="null"){
						sql2.append("").append(obj.get("sgfsqk")).append(",");
					}else{
						sql2.append("'").append(obj.get("sgfsqk")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("sgfscs")){
					if(obj.get("sgfscs")=="null"){
						sql2.append("").append(obj.get("sgfscs")).append(",");
					}else{
						sql2.append("'").append(obj.get("sgfscs")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrqyclqk")){
					if(obj.get("wrqyclqk")=="null"){
						sql2.append("").append(obj.get("wrqyclqk")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrqyclqk")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("gfzlsjly")){
					if(obj.get("gfzlsjly")=="null"){
						sql2.append("").append(obj.get("gfzlsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("gfzlsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("gfzlqtsjly")){
					if(obj.get("gfzlqtsjly")=="null"){
						sql2.append("").append(obj.get("gfzlqtsjly")).append(",");
					}else{
						sql2.append("'").append(obj.get("gfzlqtsjly")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("yqymc")){
					if(obj.get("yqymc")=="null"){
						sql2.append("").append(obj.get("yqymc")).append(",");
					}else{
						sql2.append("'").append(obj.get("yqymc")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("yyksrq")){
					if(obj.get("yyksrq")=="null"){
						sql2.append("").append(obj.get("yyksrq")).append(",");
					}else{
						sql2.append("'").append(obj.get("yyksrq")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("yyjsrq")){
					if(obj.get("yyjsrq")=="null"){
						sql2.append("").append(obj.get("yyjsrq")).append(",");
					}else{
						sql2.append("'").append(obj.get("yyjsrq")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("wrsgfsqk")){
					if(obj.get("wrsgfsqk")=="null"){
						sql2.append("").append(obj.get("wrsgfsqk")).append(",");
					}else{
						sql2.append("'").append(obj.get("wrsgfsqk")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("dkszzt")){
					if(obj.get("dkszzt")=="null"){
						sql2.append("").append(obj.get("dkszzt")).append(",");
					}else{
						sql2.append("'").append(obj.get("dkszzt")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("pollueted")){
					if(obj.get("pollueted")=="null"){
						sql2.append("").append(obj.get("pollueted")).append(",");
					}else{
						sql2.append("'").append(obj.get("pollueted")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("scjdbm")){
					if(obj.get("scjdbm")=="null"){
						sql2.append("").append(obj.get("scjdbm")).append(",");
					}else{
						sql2.append("'").append(obj.get("scjdbm")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("xzqh")){
					if(obj.get("xzqh")=="null"){
						sql2.append("").append(obj.get("xzqh")).append(",");
					}else{
						sql2.append("'").append(obj.get("xzqh")).append("',");
					}
				}else{
					sql2.append("'',");
				}
				if(obj.has("fxjb")){
					if(obj.get("fxjb")=="null"){
						sql2.append("").append(obj.get("fxjb")).append(",");
					}else{
					sql2.append("'").append(obj.get("fxjb")).append("')");
					}
				}else{
					sql2.append("'')");
				}
				mysql.append(sql2);
				sql2.setLength(0);
				count++;
				if(count>50){
					getBySqlMapper.insert(mysql.toString()+" SELECT  1 FROM dual");
					count = 0;
					mysql.setLength(0);
				}
			}//--for end
        	if(count>0){
    			getBySqlMapper.insert(mysql.toString()+" SELECT  1 FROM dual");
    			count = 0;
    			mysql.setLength(0);
    		}
		}//--if end
        
        
	}
	
	
	
	
	
	
	@Test
	public void createTable(){
		String string = "Wrdkid: 污染地块ID:"+
				"Cbdcid: 初步调查ID:"+
				"Wrdkbm:污染地块编码:"+
				"province_code:省代码:"+
				"city_code: 市代码:"+
				"country_code: 县代码:"+
				"xzbm: 行政编码:"+
				"wrdkszxz:污染地块所在乡镇:"+
				"wrdkdz:污染地块备注:"+
				"sfzc: 是否在产:"+
				"jcsj: 建厂时间:"+
				"hylb: 行业类别:"+
				"hydm:行业代码:"+
				"zdmj: 占地面积:"+
				"lxrxm: 联系人姓名:"+
				"Lxrdh:联系人电话:"+
				"djzclx: 登记注册类型:"+
				"qygm:企业规模:"+
				"yyqssj: 运营起始时间:"+
				"yyjzsj: 运营截止时间:"+
				"dkqs:地块权属:"+
				"syqdwmc: 使用权单位名称:"+
				"syqdwxr: 使用权单位联系人:"+
				"syqdwlxdh: 使用权单位联系电话:"+
				"sfwygyy: 地块是否位于工业园区:"+
				"dkghyt: 地块规划用途:"+
				"dklyls: 地块利用历史:"+
				"bz:备注:"+
				"wrdkzxjd:污染地块中心经度:"+
				"wrdkzxwd: 污染地块中心纬度:"+
				"ydwmc: 原单位名称:"+
				"Fddbr: 法定代表人:"+
				"Flag: 法定代表人标识位:"+
				"Tsamp: 时间:"+
				"Frdb: 法人代表:"+
				"Wryxxdcbid:基本情况调查表ID:"+
				"Czyxsshq: 原企业存在以下设施或区域:"+
				"Pmbztlj:平面布置图路径:"+
				"zycpsjly: 主要产品数据来源:"+
				"zycpqtsjly: 主要产品其他数据来源:"+
				"zyyfclsjly: 主要原辅材料数据来源:"+
				"zyyfclqtsjly: 主要原辅材料其他数据来源:"+
				"zyzjcw: 主要中间产物:"+
				"zyscgylctlj: 主要生产工艺流程图路径:"+
				"zyscgymx: 主要生产工艺描述:"+
				"ccss: 储存设施:"+
				"ydccqy: 有毒存储区域:"+
				"ccssszqyffcs: 储存设施所在区域防护措施:"+
				"ccsssjly: 储存设施数据来源:"+
				"ccssqtsjly: 储存设施其他数据来源:"+
				"ccqyfhcs: 储存区域防护措施:"+
				"ccqysjly: 储存区域数据来源:"+
				"ccqyqtsjly: 储存区域其他数据来源:"+
				"gdxlcs: 管道泄漏次数:"+
				"dxgdgxt: 地下管道管线图:"+
				"fszzywrwmc: 废水中主要污染物名称:"+
				"fszlqwz: 废水治理区位置:"+
				"fszlqmj: 废水治理区面积:"+
				"fszlqwrhj: 废水治理区污染痕迹:"+
				"fszlqwrhjlj: 废水治理区污染痕迹照片路径:"+
				"fszlqfhcs: 废水治理区防护措施:"+
				"fszlsjly: 废水治理数据来源:"+
				"fszlqtsjly: 废水治理其他数据来源:"+
				"gtfwzc: 固体废物贮存:"+
				"gtfwzcqfhcs: 固废贮存区防护措施:"+
				"dknqtwrwhj: 地块内其他污染物痕迹:"+
				"kqywzk: 空气异味状况:"+
				"sgfsqk: 事故发生情况:"+
				"sgfscs: 事故发生次数:"+
				"wrqyclqk:  污染区域处理情况:"+
				"gfzlsjly: 固废治理数据来源:"+
				"gfzlqtsjly: 固废治理其他数据来源:"+
				"yqymc: 固废治理其他数据来源:"+
				"yyksrq: 固废治理其他数据来源:"+
				"yyjsrq: 固废治理其他数据来源:"+
				"wrsgfsqk: 固废治理其他数据来源:"+
				"Dkszzt: 地块所在状态:"+
				"Pollueted: 是否污染:"+
				"Scjdbm: 所处阶段编码(S0- 疑似地块 S1-初步调查 S2- 详细调查 S3- 风险评估 S4-风险管控 S5- 土壤修复与治理 S6- 土壤修复与治理评估):"+
				"Xzqh: 行政区划:"+
				"Fxjb: 风险级:";


		String[] split = string.split(":");
		String s1 = "";
		String s2 = "";
		for (int i = 0; i < split.length; i++) {
			if(i % 2==0){
				s1 += split[i]+"\r\n";
			}else{
				s2 += split[i].trim()+"\r\n";
			}
		}
		System.out.println(s1);
		System.out.println(s2);
		
		
		
		

	}
}
