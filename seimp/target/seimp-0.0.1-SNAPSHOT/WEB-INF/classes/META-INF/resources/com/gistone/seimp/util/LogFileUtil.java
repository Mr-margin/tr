package com.gistone.seimp.util;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.junit.Test;

public class LogFileUtil {
	
	static{
		createFile();
	}
	
	public static void  createFile(){
		try {
			File directory = new File("D:/log/");
			if(!directory.exists()){
				directory.mkdirs();
			}
			File file = new File("D:/log/portalLog.txt");
			if(!file.exists()){
				file.createNewFile();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		try {
			File directory = new File("D:/log/");
			if(!directory.exists()){
				directory.mkdirs();
			}
			File file = new File("D:/log/systemLog.txt");
			if(!file.exists()){
				file.createNewFile();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void appendLog(String message,boolean... isNewLine){
		createFile();
		//当前时间
		Date date = new Date();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String dateStr = df.format(date);
				
		BufferedWriter out = null;
		File file = new File("D:/log/portalLog.txt");
		try {
			out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true)));
			for (boolean b : isNewLine) {
				if(b){
					out.write("\r\n");
				}
			}
			out.write(dateStr + "：" + message+"\r\n");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				out.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

	}
	public static void appendSystemLog(String message,boolean... isNewLine){
		createFile();
		//当前时间
		Date date = new Date();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String dateStr = df.format(date);
				
		BufferedWriter out = null;
		File file = new File("D:/log/systemLog.txt");
		try {
			out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true)));
			for (boolean b : isNewLine) {
				if(b){
					out.write("\r\n");
				}
			}
			out.write(dateStr + "：" + message+"\r\n");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				out.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

	}
	
	@Test
	public void eee(){
		LogFileUtil.appendLog("s21231d");
	}
}
