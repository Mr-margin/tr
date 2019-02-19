package com.gistone.seimp.controller;

import com.gistone.seimp.MyBatis.config.GetBySqlMapper;
import com.gistone.seimp.util.ClientUtil;
import com.gistone.seimp.util.EdatResult;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sun.security.krb5.Config;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author chendong  
 * @date 2018-05-16 14:18
 * @param   
 * @return  
 * @Description 天地图查询 接口
 */
@RestController
@RequestMapping( "tianditu" )
public class TiandituController {
    @Autowired
    private GetBySqlMapper getBySqlMapper;
    /**
     * @author chendong  
     * @date 2018-05-16 16:46
     * @param   
     * @return  
     * @Description  天地图一个点的反编译
     */
    @RequestMapping("getAddress")
    public EdatResult getAddress(HttpServletRequest request , HttpServletResponse response ){
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
//            String province = data.getString("province");
//            String lon = data.getString("lon");
//            String lat = data.getString("lat");

            String cg = urllRelated(name);
            List<Map> list = new ArrayList<>();
            Map map = new HashMap();
            if(!"失败".equals(cg)){
                JSONObject json = JSONObject.fromObject(cg);
                if (!"0".equals(json.get("count"))){
                    if ( json.has("pois")){
                        JSONArray  arr = json.getJSONArray("pois");
                        boolean statu = arr.getJSONObject(0).getString("name").contains(name);
                        if(statu){
                            map.put("status","成功");
                            map.put("lon",arr.getJSONObject(0).getString("lonlat").split(" ")[0]);
                            map.put("lat",arr.getJSONObject(0).getString("lonlat").split(" ")[1]);
                        } else {
                            map.put("status","名称不相符");
                            map.put("lon","");
                            map.put("lat","");
                        }
                    }
                } else {
                    map.put("status","未查询到");
                    map.put("lon","");
                    map.put("lat","");
                }
            } else {
                map.put("status","失败");
                map.put("lon","");
                map.put("lat","");
            }
            list.add(map);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }

    }
    //请求天地图接口得到返回值
    public static String urllRelated(String ss){
        try {
            URL url = new URL("http://www.tianditu.com/query.shtml?postStr={\"keyWord\":\""+ss+"\",\"level\":\"11\",\"mapBound\":\"116.04577,39.70307,116.77361,40.09583\",\"queryType\":\"1\",\"count\":\"1\",\"start\":\"0\"}&type=query");    // 把字符串转换为URL请求地址
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();// 打开连接
            connection.setRequestMethod("GET");
            connection.connect();// 连接会话
            // 获取输入流
            BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
            String line;
            StringBuilder sb = new StringBuilder();
            while ((line = br.readLine()) != null) {// 循环读取流
                sb.append(line);
            }
            br.close();// 关闭流
            connection.disconnect();// 断开连接
            return sb.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "失败";
        }
    }
    /**
     * @author chendong  
     * @date 2018-05-30 15:47
     * @param   
     * @return  
     * @Description 天地图附近搜索
     */
    @RequestMapping("tiandituFujin")
    public EdatResult tiandituFujin(HttpServletRequest request,HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            JSONObject data = JSONObject.fromObject(request.getParameter("data"));
            String name = data.getString("name");
            String juli = data.getString("juli");
            String  lon= data.getString("lon");
            String lat = data.getString("lat");
            String cg = fujin(name,juli,lon,lat);
            List<Map> list = new ArrayList<>();
            Map map = new HashMap();
            if(!"失败".equals(cg)){
                JSONObject json = JSONObject.fromObject(cg);
                if (!"0".equals(json.get("count"))){
                    if ( json.has("pois")){
                        JSONArray  arr = json.getJSONArray("pois");
                        map.put("status","成功");
                        map.put("name",name);
                        map.put("data",arr);
                    }
                } else {
                    map.put("status","未查询到");
                    map.put("name",name);
                    map.put("data","");
                }
            } else {
                map.put("status","失败");
                map.put("name",name);
                map.put("data","");
            }
            list.add(map);
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    //请求天地图接口得到返回值
    public static String fujin(String ss,String juli,String lon,String lat){
        try {
            String  str = "";
            URL url = new URL("http://www.tianditu.com/query.shtml?postStr={\"keyWord\":\""+ss+"\",\"level\":\"15\",\"mapBound\":\"116.40466,39.90684,116.45016,39.93138\",\"queryType\":\"3\",\"pointLonlat\":\""+lon+","+lat+"\",\"queryRadius\":\""+juli+"\",\"count\":\"20\",\"start\":\"0\"}&type=query");    // 把字符串转换为URL请求地址
            System.out.println(url);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();// 打开连接
            connection.setRequestMethod("GET");
            connection.connect();// 连接会话

            if (connection.getResponseCode() == 200){
                InputStream is = connection.getInputStream();
                String charset = "UTF-8";
                Pattern pattern = Pattern.compile("charset=\\S*");
                Matcher matcher = pattern.matcher(connection.getContentType());
                if (matcher.find()) {
                    charset = matcher.group().replace("charset=", "");
                }
                BufferedReader reader =new BufferedReader(new InputStreamReader(is, "GB2312"));
                String line;
                StringBuilder sb = new StringBuilder();
                while ((line = reader.readLine()) != null) {// 循环读取流
                    sb.append(line);
                }
                reader.close();// 关闭流
                is.close();// 关闭流
                connection.disconnect();// 断开连接
                str=sb.toString();
            }
//            // 获取输入流
//            BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
//            String line;
//            StringBuilder sb = new StringBuilder();
//            while ((line = br.readLine()) != null) {// 循环读取流
//                sb.append(line);
//            }

            System.out.println(str);

            return str;
        } catch (Exception e) {
            e.printStackTrace();
            return "失败";
        }
    }
    /**
     * @author chendong  
     * @date 2018-06-28 15:55
     * @param   
     * @return  
     * @Description 重点行业监管企业-添加经纬度
     */
    @RequestMapping("tianLonLat")
    public EdatResult tianLonLat(HttpServletRequest request , HttpServletResponse response ) {
        try {
            ClientUtil.SetCharsetAndHeader(request, response);
            int status = Check.CheckRight(request, "4");
            if (status != 0) {
                return EdatResult.build(status, "");
            }
            String  sql = "select * from  \"tb_key_industry_enterprise\" where \"enterpriseName\" is not null ";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            for( int i = 0 ; i < list.size(); i ++ ) {
                Map map = list.get(i);
                String cg = urllRelated(map.get("enterpriseName").toString());
                List<Map> list1 = new ArrayList<>();
                Map map1 = new HashMap();
                if(!"失败".equals(cg)){
                    JSONObject json = JSONObject.fromObject(cg);
                    if (!"0".equals(json.get("count"))){
                        if ( json.has("pois")){
                            JSONArray  arr = json.getJSONArray("pois");
                            boolean statu = arr.getJSONObject(0).getString("name").contains(map.get("enterpriseName").toString());
                            if(statu){
                                String  updateSql = " UPDATE  \"tb_key_industry_enterprise\" set \"longitude\"="+arr.getJSONObject(0).getString("lonlat").split(" ")[0]+",\"latitude\"="+arr.getJSONObject(0).getString("lonlat").split(" ")[1]+" where \"id\"="+map.get("id").toString()+" ";
                               this.getBySqlMapper.update(updateSql);
                            }
                        }
                    }
                }
            }
            return EdatResult.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return EdatResult.build(1, "fail");
        }
    }
    /**
     * @author chendong  
     * @date 2018-06-28 16:05
     * @param   
     * @return  
     * @Description 组织机构代码添加经纬度
    */
    @RequestMapping("zhongdainLonLat")
    public EdatResult zhongdainLonLat(HttpServletRequest request,HttpServletResponse response ) {

            String  sql = "select JGMC0 from  HUANGBEIFEN where JGMC0 is not null and LON is null GROUP BY JGMC0";
            List<Map> list = this.getBySqlMapper.findRecords(sql);
            System.out.println(list.get(0));
            for( int i = 0 ; i < list.size(); i ++ ) {

                Map map = list.get(i);
                String cg = urllRelated(map.get("JGMC0").toString());
                System.out.println(cg);
                List<Map> list1 = new ArrayList<>();
                Map map1 = new HashMap();
                if(!"失败".equals(cg)){
                    JSONObject json = JSONObject.fromObject(cg);
                    if (!"0".equals(json.get("count"))){
                        if ( json.has("pois")){
                            JSONArray  arr = json.getJSONArray("pois");
                            boolean statu = arr.getJSONObject(0).getString("name").contains(map.get("JGMC0").toString());
                            if(statu){
                                String  updateSql = " UPDATE  HUANGBEIFEN set LON="+arr.getJSONObject(0).getString("lonlat").split(" ")[0]+",LAT="+arr.getJSONObject(0).getString("lonlat").split(" ")[1]+" where JGMC0='"+map.get("JGMC0").toString()+"' ";
                                System.out.println(updateSql);
                                this.getBySqlMapper.update(updateSql);
                            }
                        }
                    }
                }
            }
            return EdatResult.ok("1111111111111111");

    }
}
