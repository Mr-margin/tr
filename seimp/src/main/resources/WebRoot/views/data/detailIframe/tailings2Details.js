//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var XH = infoEntity.XH;
initPart4Content(XH);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(enterId) {
    ajaxPost("/seimp/shareExchange/tailings2/getTailingsDataByID",{
    	XH:XH
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.XH));
        	$("#pot_2").html(handleNullStr(item.XZQH));
        	$("#pot_3").html(handleNullStr(item.XZQHM));
        	$("#pot_4").html(handleNullStr(item.SFWWZK));
        	$("#pot_5").html(handleNullStr(item.WKKQYMC));
        	$("#pot_6").html(handleNullStr(item.WKKQYSFYCYM));
        	$("#pot_7").html(handleNullStr(item.WKKQYCYM));
        	$("#pot_8").html(handleNullStr(item.QYDM));
        	$("#pot_9").html(handleNullStr(item.FDDBR));
        	$("#pot_10").html(handleNullStr(item.LXDH));
        	$("#pot_11").html(handleNullStr(item.SSZYKZ));
        	$("#pot_12").html(handleNullStr(item.SSZYKZQTSM));
        	$("#pot_13").html(handleNullStr(item.SSFSKZ));
        	$("#pot_14").html(handleNullStr(item.SSFSKZQTSM));
        	$("#pot_15").html(handleNullStr(item.CXKGY));
        	$("#pot_16").html(handleNullStr(item.AQXKZBH));
        	$("#pot_17").html(handleNullStr(item.AQXKZFFDW));
        	$("#pot_18").html(handleNullStr(item.AQXKZBFSJ));
        	$("#pot_19").html(handleNullStr(item.PWXKZBH));
        	$("#pot_20").html(handleNullStr(item.PWXKZFFDW));
        	$("#pot_21").html(handleNullStr(item.PWXKZBFSJ));
        	$("#pot_22").html(handleNullStr(item.WKKMC));
        	$("#pot_23").html(handleNullStr(item.WKKSFYCYM));
        	$("#pot_24").html(handleNullStr(item.WKKCYM));
        	$("#pot_25").html(handleNullStr(getLon(item)));
        	$("#pot_26").html(handleNullStr(getLat(item)));
        	$("#pot_27").html(handleNullStr(item.GC));
        	$("#pot_28").html(handleNullStr(item.SZXZMC));
        	$("#pot_29").html(handleNullStr(item.SZCMC));
        	$("#pot_30").html(handleNullStr(item.XDFW));
        	$("#pot_31").html(handleNullStr(item.JCZXJL));
        	$("#pot_32").html(handleNullStr(item.WKKXS));
        	$("#pot_33").html(handleNullStr(item.WKKQTXS));
        	$("#pot_34").html(handleNullStr(item.WKRKXS));
        	$("#pot_35").html(handleNullStr(item.BTLX));
        	$("#pot_36").html(handleNullStr(item.WKKDB));
        	$("#pot_37").html(handleNullStr(item.AQDDJ));
        	$("#pot_38").html(handleNullStr(item.SWHDYY));
        	$("#pot_39").html(handleNullStr(item.SCZK));
        	$("#pot_40").html(handleNullStr(item.WKKKGJSRQ));
        	$("#pot_41").html(handleNullStr(item.WKKTRSYRQ));
        	$("#pot_42").html(handleNullStr(item.SJDZLD));
        	$("#pot_43").html(handleNullStr(item.FHBZ));
        	$("#pot_44").html(handleNullStr(item.SJZKR));
        	$("#pot_45").html(handleNullStr(item.SJKR));
        	$("#pot_46").html(handleNullStr(item.SJZBG));
        	$("#pot_47").html(handleNullStr(item.XZZBG));
        	$("#pot_48").html(handleNullStr(item.SJNPWL));
        	$("#pot_49").html(handleNullStr(item.SJSYNX));
        	$("#pot_50").html(handleNullStr(item.YSYNX));
        	$("#pot_51").html(handleNullStr(item.WKZYCF));
        	$("#pot_52").html(handleNullStr(item.WKFSCF));
        	$("#pot_53").html(handleNullStr(item.WKSZYCF));
        	$("#pot_54").html(handleNullStr(item.WKSFSCF));
        	$("#pot_55").html(handleNullStr(item.SJNWKRKL));
        	$("#pot_56").html(handleNullStr(item.WKSCSL));
        	$("#pot_57").html(handleNullStr(item.WKSHSLYPFL));
        	$("#pot_58").html(handleNullStr(item.WKSHYL));
        	$("#pot_59").html(handleNullStr(item.WKSSFS));
        	$("#pot_60").html(handleNullStr(item.SSJL));
        	$("#pot_61").html(handleNullStr(item.SFJXLHP));
        	$("#pot_62").html(handleNullStr(item.WJXHPYY));
        	$("#pot_63").html(handleNullStr(item.HJYXPJWJ));
        	$("#pot_64").html(handleNullStr(item.SFTGHBSTSYS));
        	$("#pot_65").html(handleNullStr(item.WTGYY));
        	$("#pot_66").html(handleNullStr(item.SFJXPWSBDJ));
        	$("#pot_67").html(handleNullStr(item.SFCQFSLCLCS));
        	$("#pot_68").html(handleNullStr(item.SFCQFYSCLCS));
        	$("#pot_69").html(handleNullStr(item.SFCQFLSCLCS));
        	$("#pot_70").html(handleNullStr(item.SFJSFHSS));
        	$("#pot_71").html(handleNullStr(item.PHFS));
        	$("#pot_72").html(handleNullStr(item.FHSSSFZC));
        	$("#pot_73").html(handleNullStr(item.CZWT));
        	$("#pot_74").html(handleNullStr(item.SFJYWKSHSLYCLSS));
        	$("#pot_75").html(handleNullStr(item.PFSFDB));
        	$("#pot_76").html(handleNullStr(item.WKKSFJZYZZ));
        	$("#pot_77").html(handleNullStr(item.WKKZBSFYHJMGD));
        	$("#pot_78").html(handleNullStr(item.JTQK1));
        	$("#pot_79").html(handleNullStr(item.SFCZYXGT));
        	$("#pot_80").html(handleNullStr(item.WKKXYSFYJM));
        	$("#pot_81").html(handleNullStr(item.JTQK2));
        	$("#pot_82").html(handleNullStr(item.WKKXYSFJYLYFKSS));
        	$("#pot_83").html(handleNullStr(item.JTQK3));
        	$("#pot_84").html(handleNullStr(item.SFPBHJYJRY));
        	$("#pot_85").html(handleNullStr(item.RS));
        	$("#pot_86").html(handleNullStr(item.SFCBHJYJWZ));
        	$("#pot_87").html(handleNullStr(item.YJWZQK));
        	$("#pot_88").html(handleNullStr(item.SFJSHJYJSS));
        	$("#pot_89").html(handleNullStr(item.YJSSQK));
        	$("#pot_90").html(handleNullStr(item.SFBZHJYJYA));
        	$("#pot_91").html(handleNullStr(item.HJYJYASFXHBBMBA));
        	$("#pot_92").html(handleNullStr(item.SFDQKZHJYJYL));
        	$("#pot_93").html(handleNullStr(item.SFPBHJJCSB));
        	$("#pot_94").html(handleNullStr(item.SFJXHJRCJC));
        	$("#pot_95").html(handleNullStr(item.JCZBX));
        	$("#pot_96").html(handleNullStr(item.ZBXNPJJCZ));
        	$("#pot_97").html(handleNullStr(item.JCPL));
        	$("#pot_98").html(handleNullStr(item.ZBSFYHJYJWZWBGYDW));
        	$("#pot_99").html(handleNullStr(item.SFFSTFHJSJ));
        	$("#pot_100").html(handleNullStr(item.TFHJSJCS));
        	$("#pot_101").html(handleNullStr(item.YWFXWTZGLSQK));
        	$("#pot_102").html(handleNullStr(item.JCZFXDZYWTJZGYQ));
        	$("#pot_103").html(handleNullStr(item.BJCDWFZRYJ));
        	$("#pot_104").html(handleNullStr(item.BZ));
        	$("#pot_105").html(handleNullStr(item.JCRY));
        	$("#pot_106").html(handleNullStr(item.JCSJ));

            
            
            console.log($(".table-left").height())
        	$(".table-right").height($(".table-left").height()-52);
            $(".table-right .qiye_map").height($(".table-left").height()-120);
        }
    });
    
}




//处理字符串为null的情况和没有值显示undefined的情况；
function handleNullStr(value){
	var result = "";
	if(value && value!="null"){
		result = value;		
	}
	return result;
}

function getLon(row){
	var result = "";
	if(row){
		if(row.ZXJD_D){
			result = parseFloat(row.ZXJD_D);
		}
		
		if(row.ZXJD_F){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXJD_F)/60).toFixed(4));
		}
		
		if(row.ZXJD_M){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXJD_M)/3600).toFixed(4));
		}
		
		if((result + "").length>8){
			result = (result + "").substr(0, (result+"").indexOf(".")+5);
		}
		
	}
	return result;
}

function getLat(row){
	var result = "";
	if(row){
		if(row.ZXWD_D){
			result = parseFloat(row.ZXWD_D);
		}
		
		if(row.ZXWD_F){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXWD_F)/60).toFixed(4));
		}
		
		if(row.ZXWD_M){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXWD_M)/3600).toFixed(4));
		}
		
		if((result + "").length>8){
			result = (result + "").substr(0, (result+"").indexOf(".")+5);
		}
		
	}
	return result;
}
