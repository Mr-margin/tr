package com.gistone.seimp.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class CheckSensitiveStringUtil {

	/**
	 * 附件名称不包含;或 % 
	 * @param fileName
	 * @return
	 */
	public static Boolean uploadFileName(String fileName){
		if(fileName!=null&&fileName!=""){
			fileName = fileName.toLowerCase();
		}
		String regEx = "(.*;.*)|(.*%.*)";
		Pattern pattern = Pattern.compile(regEx);
		Matcher matcher = pattern.matcher(fileName);
		return matcher.find();
	}
	
	public static Boolean inputTextValue(String value){
		if(value!=null&&value!=""){
			value = value.toLowerCase();
		}
		
		/*String regEx1 = "(.*and.*)|(.*exec.*)|(.*count.*)|(.*chr.*)|(.*mid.*)|(.*master.*)|(.*or.*)|(.*truncate.*)|(.*char.*)|(.*declare.*)|(.*join.*)|"+
				"(.*&.*)|(.*;.*)|(.*[/$].*)|(.*%.*)|(.*@.*)|(.*\'.*)|(.*\".*)|(.*<.*)|(.*>.*)|(.*[/(].*)|(.*[/)].*)|(.*[/+].*)|(.*\r.*)|(.*\n.*)|(.*0x0d.*)|(.*0x0a.*)|(.*,.*)|(.*[/].*)|(.*\\|.*)|(.*\\\\.*)|"+
				"(.*insert.*)|(.*select.*)|(.*delete.*)|(.*update.*)|(.*create.*)|(.*drop.*)";*/
		
		String regEx1 = "(.*and([\\s]|$).*)|(.*exec([\\s]|$).*)|(.*count([\\s]|$).*)|(.*chr([\\s]|$).*)|(.*mid([\\s]|$).*)|(.*master([\\s]|$).*)|(.*or([\\s]|$).*)|(.*truncate([\\s]|$).*)|(.*char([\\s]|$).*)|(.*declare([\\s]|$).*)|(.*join([\\s]|$).*)|"+
				"(.*%([\\s]|$).*)|(.*insert([\\s]|$).*)|(.*select([\\s]|$).*)|(.*delete([\\s]|$).*)|(.*update([\\s]|$).*)|(.*create([\\s]|$).*)|(.*drop([\\s]|$).*)";
		
		
//		"(.*&.*)|(.*;.*)|(.*[/$].*)|(.*@.*)|(.*\'.*)|(.*\".*)|(.*<.*)|(.*>.*)|(.*[/(].*)|(.*[/)].*)|(.*[/+].*)|(.*\r.*)|(.*\n.*)|(.*0x0d.*)|(.*0x0a.*)|(.*[/].*)|(.*\\|.*)|(.*\\\\.*)|"+		
		Pattern pattern = Pattern.compile(regEx1);
		Matcher matcher = pattern.matcher(value);
		return matcher.find();
	}
	
	/**
	 * 不过滤换行
	 */
	public static Boolean inputTextValueNotR(String value){
		if(value!=null&&value!=""){
			value = value.toLowerCase();
		}
		String regEx = "(.*and.*)|(.*exec.*)|(.*count.*)|(.*chr.*)|(.*mid.*)|(.*master.*)|(.*or.*)|(.*truncate.*)|(.*char.*)|(.*declare.*)|(.*join.*)|(.*insert.*)|(.*select.*)|(.*delete.*)"+
				"|(.*update.*)|(.*create.*)|(.*drop.*)"+
				"(.*<.*)|(.*>.*)|(.*'.*)|(.*;.*)|(.*&.*)|(.*[$].*)|(.*%.*)|(.*\".*)|(.*\'.*)|(.*\".*)|(.*+.*)|(.*,.*)|(.*\r.*)"+
				"|(.*\n.*)|(.*//*.*)|(.*/*/.*)|(.*().*)|";
		String regEx1 = "(.*and.*)|(.*exec.*)|(.*count.*)|(.*chr.*)|(.*mid.*)|(.*master.*)|(.*or.*)|(.*truncate.*)|(.*char.*)|(.*declare.*)|(.*join.*)|"+
						"(.*&.*)|(.*;.*)|(.*[/$].*)|(.*%.*)|(.*@.*)|(.*\'.*)|(.*\".*)|(.*<.*)|(.*>.*)|(.*[/(].*)|(.*[/)].*)|(.*[/+].*)|(.*,.*)|(.*[/].*)|(.*\\|.*)|(.*\\\\.*)|"+
						"(.*insert.*)|(.*select.*)|(.*delete.*)|(.*update.*)|(.*create.*)|(.*drop.*)";
		
		Pattern pattern = Pattern.compile(regEx1);
		Matcher matcher = pattern.matcher(value);
		return matcher.find();
	}
	
}
