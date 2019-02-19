package com.gistone.seimp.util;

import java.io.*;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.util.*;

import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * XSSF 操作Excel
 * ClassName: XSSFExcelUtils 
 * @Description: TODO
 * @author luowenbin
 * @date 2018年8月21日
 */
@SuppressWarnings({"all"})
public class XSSFExcelUtils {
	
	public static String writes(List<Map> list, Map<String, String> map, String name, String url, HttpServletResponse response) throws Exception {
        // 第一步，创建一个webbook，对应一个Excel文件
        HSSFWorkbook wb = new HSSFWorkbook();
        // 第二步，在webbook中添加一个sheet,对应Excel文件中的sheet
        HSSFSheet sheet = wb.createSheet(name);

        // 第三步，在sheet中添加表头第0行,注意老版本poi对Excel的行数列数有限制short
        HSSFRow row = sheet.createRow((int) 0);

        // 第四步，创建单元格，并设置值表头 设置表头居中
        HSSFCellStyle style = wb.createCellStyle();
        style.setAlignment(HSSFCellStyle.ALIGN_CENTER); // 创建一个居中格式

        style.setWrapText(true);
        HSSFCell cell = row.createCell((short) 0);
        int a = 1;
        List<String> namelist = new ArrayList();
        int maxt = 0;
        for (String names : map.keySet()) {
            if (map.get(names).toString().length() > maxt) {
                maxt = map.get(names).toString().length();

            }

            cell.setCellValue(map.get(names));
            cell.setCellStyle(style);
            cell = row.createCell((short) a);
            a++;
            namelist.add(names);
        }
//	        cell.setCellValue("学号");    
//	        cell.setCellStyle(style);    
//	        cell = row.createCell((short) 1);    
//	        cell.setCellValue("姓名");    
//	        cell.setCellStyle(style);    
//	        cell = row.createCell((short) 2);    
//	        cell.setCellValue("年龄");    
//	        cell.setCellStyle(style);    
//	        cell = row.createCell((short) 3);    
//	        cell.setCellValue("生日");    
//	        cell.setCellStyle(style);    

        // 第五步，写入实体数据 实际应用中这些数据从数据库得到，

        Map<Integer, Integer> widthmap = new HashMap();
        for (int i = 0; i < list.size(); i++) {
            int max = 0;
            row = sheet.createRow((int) i + 1);
            row.setRowStyle(style);
            for (int j = 0; j < namelist.size(); j++) {

                Map map2 = list.get(i);
                String names = namelist.get(j);

                //获取每列的最大宽度
                if (!widthmap.keySet().contains(j)) {
                	if(map2.get("names") != null){
                		widthmap.put(j, map2.get(names).toString().length());
                	}
                } else {
                    if (widthmap.get(j) < map2.get(names).toString().length()) {
                        widthmap.put(j, map2.get(names).toString().length());
                    }

                }
                if (list.size() - i == 1) {
                	if(widthmap.get(j) == null){
                		 sheet.setColumnWidth(j, maxt * 600);
                	}else{
	                    if (maxt < widthmap.get(j)) {
	                        sheet.setColumnWidth(j, widthmap.get(j) * 600);
	                    } else {
	                        sheet.setColumnWidth(j, maxt * 600);
	                    }
                	}
                }
                
                // 第四步，创建单元格，并设置值
                if (name.equals("实验室名录")) {
                    if (map.get(names).equals("监测领域范围(土壤重金属)") || map.get(names).equals("监测领域范围(土壤PAHs)") || map.get(names).equals("监测领域范围(农产品重金属)")) {
                        if (map2.get(names).toString().equals("0")) {

                            row.createCell((short) j).setCellValue("是");
                        } else {
                            row.createCell((short) j).setCellValue("否");
                        }

                    } else {
                        row.createCell((short) j).setCellValue(map2.get(names).toString());
                    }
                } else {
                	if(map2.get(names) !=null){
                		row.createCell((short) j).setCellValue(map2.get(names).toString());
                	}else{
                		row.createCell((short) j).setCellValue("");
                	}
                }
//	 	            row.createCell((short) 1).setCellValue(stu.getName());    
//	 	            row.createCell((short) 2).setCellValue((double) stu.getAge());    

            }

        }
        // 第六步，将文件存到指定位置


        OutputStream out = null;
        String fileName = name + ".xls";

        File dirFile = new File(url);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }
        url += name += ".xls";
        String fileurl = "Files/" + name;
        try {
            FileOutputStream fout = new FileOutputStream(url);
            wb.write(fout);
            fout.close();
            return fileurl;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }
    
    
    /**
     * 创建excel文件
     * @Description: TODO
     * @param @param list：数据集合
     * @param @param map：标题集合
     * @param @param name：文件名称
     * @param @param url：绝对路径地址
     * @param @param response：响应
     * @return String：返回值：文件相对路径  
     * @date 2018年6月15日
     */
	public static String writesNew(List<Map> list, Map<String, String> map, String name, String url, HttpServletResponse response) throws Exception {
		
		// 创建Excel的工作书册 Workbook,对应到一个excel文档
		SXSSFWorkbook wb = new SXSSFWorkbook(100); 
		wb.setCompressTempFiles(true);
        
		// 创建Excel的工作sheet,对应到一个excel文档的tab
		Sheet sh = wb.createSheet();

        // 第三步，在sheet中添加表头第0行,注意老版本poi对Excel的行数列数有限制short
		Row row = sh.createRow(0);
		
        // 第四步，创建单元格，并设置值表头 设置表头居中
		CellStyle cellStyle = wb.createCellStyle();
//        HSSFCellStyle style = wb.createCellStyle();
		cellStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER); // 创建一个居中格式
		cellStyle.setWrapText(true);
		Cell cell = row.createCell((short) 0);
        int a = 1;
        //记录列字段集合
        List<String> namelist = new ArrayList();
        int maxt = 0;
        //写入标题
        for (String names : map.keySet()) {
            if (map.get(names).toString().length() > maxt) {
                maxt = map.get(names).toString().length();
            }

            cell.setCellValue(map.get(names));
            cell.setCellStyle(cellStyle);
            cell = row.createCell((short) a);
            a++;
            namelist.add(names);
        }
        
        sh.getRow(0);

        // 第五步，写入实体数据 实际应用中这些数据从数据库得到，
        //记录每列的最大宽度
        Map<Integer, Integer> widthmap = new HashMap();
        //遍历数据库数据
        for (int i = 0; i < list.size(); i++) {
            int max = 0;
            row = sh.createRow((int) i + 1);
            row.setRowStyle(cellStyle);
            //遍历列集合
            for (int j = 0; j < namelist.size(); j++) {

                Map map2 = list.get(i);
                String names = namelist.get(j);

                //获取每列的最大宽度
                if (!widthmap.keySet().contains(j)) {
                	//记录最大宽度集合中没有
                	if(map2.get(names) != null){
                		widthmap.put(j, map2.get(names).toString().length());
                	}
                } else {
                	//记录最大宽度集合中已经有这个列的数据
                	if(map2.get(names)!=null){
                		if (widthmap.get(j) < map2.get(names).toString().length()) {
                			widthmap.put(j, map2.get(names).toString().length());
                		}
                	}
                }
                
                //最后一条数据
                if (list.size() - i == 1) {
                	if(widthmap.get(j) == null){
                		 sh.setColumnWidth(j, maxt * 500);
                	}else{
	                    if (maxt < widthmap.get(j)) {
	                    	Integer widhth = widthmap.get(j)*500;
	                    	 if(widhth < 255*256){
	                    		 sh.setColumnWidth(j, widhth);    
	                         }else{
	                        	 sh.setColumnWidth(j, 6000);
	                         }
//	                        sheet.setColumnWidth(j, widthmap.get(j) * 500);
	                    } else {
	                    	sh.setColumnWidth(j, maxt * 500);
	                    }
                	}
                }
                
                // 第四步，创建单元格，并设置值
                
                	if(map2.get(names) !=null){
                		row.createCell((short) j).setCellValue(map2.get(names).toString());
                	}else{
                		row.createCell((short) j).setCellValue("");
                	}

            }
            sh.getRow(i+1);
        }
        // 第六步，将文件存到指定位置


//        String fileName = name + ".xls";

        url += "excelL/";
        File dirFile = new File(url);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }
        
        url += name += "_" + System.currentTimeMillis() + ".xlsx";
        String fileurl = "Files/excelL/" + name;
        try {
            FileOutputStream fout = new FileOutputStream(url);
            wb.write(fout);
            fout.close();
            wb.dispose();
            return fileurl;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }

    public static HSSFCellStyle getCellStyle(HSSFWorkbook workbook) {
        HSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);
        style.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
        style.setBorderBottom(HSSFCellStyle.BORDER_THIN);
        style.setBorderTop(HSSFCellStyle.BORDER_THIN);
        style.setLeftBorderColor(HSSFCellStyle.BORDER_THIN);
        style.setRightBorderColor(HSSFCellStyle.BORDER_THIN);
        style.setAlignment(HSSFCellStyle.ALIGN_CENTER);

        return style;
    }

    public static HSSFFont getFont(HSSFWorkbook workbook) {
        HSSFFont font = workbook.createFont();
        font.setColor(HSSFColor.WHITE.index);
        font.setFontHeightInPoints((short) 12);
        font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
        return font;
    }

    public static String exportDataToExcel(List<Map> list, String[] fields, String[] headers, String title, String url) {
        try {
        	 XSSFWorkbook wb = new XSSFWorkbook();
            //生成一个表格
            XSSFSheet sheet = wb.createSheet(title);
            //设置表格默认列宽15个字节
            sheet.setDefaultColumnWidth(15);
            //生成一个样式
//            HSSFCellStyle style = getCellStyle(wb);
            //生成一个字体
//            HSSFFont font = getFont(wb);
            //把字体应用到当前样式
//            style.setFont(font);

            //生成表格标题
            XSSFRow row = sheet.createRow(0);
            row.setHeight((short) 300);
            XSSFCell cell  = null;

            for (int i = 0; i < headers.length; i++) {
                cell = row.createCell(i);
//                cell.setCellStyle(style);
//                HSSFRichTextString text = new HSSFRichTextString(headers[i]);
                cell.setCellValue(headers[i]);
            }

            //将数据放入sheet中
            for (int i = 0; i < list.size(); i++) {
                row = sheet.createRow(i + 1);
                Map map = list.get(i);
                for (int j = 0; j < fields.length; j++) {
                    cell = row.createCell(j);
                    String field = fields[j];
                    Object value = map.get(field);
                    if (null == value) value = "";
                    String valueStr = value.toString();
                    if(valueStr.length()>32000){
                    	valueStr = valueStr.substring(0, 32000) + "...";
                    }
                    cell.setCellValue(valueStr);
                }
            }
            File dirFile = new File(url + "/export/");
            if (!dirFile.exists()) {
                dirFile.mkdirs();
            }
            String fileName = System.currentTimeMillis() + ".xlsx";
            url += "/export/" + fileName;
            FileOutputStream fout = new FileOutputStream(url);
            try {
                String fileurl = "Files/export/" + fileName;

                wb.write(fout);
                return fileurl;
            } catch (Exception e) {
                return null;
            } finally {
                fout.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}



