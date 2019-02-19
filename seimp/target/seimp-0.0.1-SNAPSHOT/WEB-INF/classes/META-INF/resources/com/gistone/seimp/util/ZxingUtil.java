package com.gistone.seimp.util;

import java.io.File;
import java.nio.file.Path;
import java.util.Hashtable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

/**
 * 二维码
 * ClassName: ZxingUtil 
 * @Description: TODO
 * @author luowenbin
 * @date 2018年8月22日
 */
@SuppressWarnings("all")
public class ZxingUtil {
	
	
	
	
	public static void createZxing(String urlStr, String fileUrl){
		
		//生成文件夹
    	File file1 = new File(fileUrl);
    	File parentFile = file1.getParentFile();
    	if(!parentFile.exists()){
    		parentFile.mkdirs();
    	}
    	
		int width = 300;
		int height = 300;
		String format = "png";
		Hashtable hints=new Hashtable();
		hints.put(EncodeHintType.CHARACTER_SET, "utf-8");
		hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
		hints.put(EncodeHintType.MARGIN, 2);
		
		try {
			BitMatrix bitMatrix = new MultiFormatWriter().encode(urlStr, BarcodeFormat.QR_CODE, width, height, hints);
			Path file = new File(fileUrl).toPath();
			MatrixToImageWriter.writeToPath(bitMatrix, format, file);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
}
