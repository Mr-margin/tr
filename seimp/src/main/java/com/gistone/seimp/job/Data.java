package com.gistone.seimp.job;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

/**
 * <p>
 * Java class for data complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within
 * this class.
 * 
 * <pre>
 * &lt;complexType name="data">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="address" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="aftdid" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="bianhao" type="{http://www.w3.org/2001/XMLSchema}float"/>
 *         &lt;element name="biemin" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="buildtime" type="{http://geoway.cn/}timestamp" minOccurs="0"/>
 *         &lt;element name="cun" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="dalei" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="datatype" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="district_code" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="district_code_str" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="er_district_code" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="exception_reporting" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="geometry" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="guid" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="guimo" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="gw_update_time" type="{http://geoway.cn/}timestamp" minOccurs="0"/>
 *         &lt;element name="gw_update_type" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="is_guimo" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="laiyuan" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="latitude" type="{http://www.w3.org/2001/XMLSchema}float"/>
 *         &lt;element name="link" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="longitude" type="{http://www.w3.org/2001/XMLSchema}float"/>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="oid" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="predid" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="production" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="remark" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="sheng" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="shi" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="survey_progress" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="survey_status" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="type" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="update_status" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="update_time" type="{http://geoway.cn/}timestamp" minOccurs="0"/>
 *         &lt;element name="xian" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="xiang" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "data", propOrder = { "address", "aftdid", "bianhao", "biemin",
		"buildtime", "cun", "dalei", "datatype", "districtCode",
		"districtCodeStr", "erDistrictCode", "exceptionReporting", "geometry",
		"guid", "guimo", "gwUpdateTime", "gwUpdateType", "isGuimo", "laiyuan",
		"latitude", "link", "longitude", "name", "oid", "predid", "production",
		"remark", "sheng", "shi", "surveyProgress", "surveyStatus", "type",
		"updateStatus", "updateTime", "xian", "xiang" })
public class Data {

	protected String address;
	protected int aftdid;
	protected float bianhao;
	protected String biemin;
	protected Timestamp buildtime;
	protected String cun;
	protected String dalei;
	protected String datatype;
	@XmlElement(name = "district_code")
	protected int districtCode;
	@XmlElement(name = "district_code_str")
	protected String districtCodeStr;
	@XmlElement(name = "er_district_code")
	protected int erDistrictCode;
	@XmlElement(name = "exception_reporting")
	protected int exceptionReporting;
	protected String geometry;
	protected String guid;
	protected String guimo;
	@XmlElement(name = "gw_update_time")
	protected Timestamp gwUpdateTime;
	@XmlElement(name = "gw_update_type")
	protected int gwUpdateType;
	@XmlElement(name = "is_guimo")
	protected int isGuimo;
	protected String laiyuan;
	protected float latitude;
	protected String link;
	protected float longitude;
	protected String name;
	protected int oid;
	protected int predid;
	protected int production;
	protected String remark;
	protected String sheng;
	protected String shi;
	@XmlElement(name = "survey_progress")
	protected int surveyProgress;
	@XmlElement(name = "survey_status")
	protected int surveyStatus;
	protected String type;
	@XmlElement(name = "update_status")
	protected int updateStatus;
	@XmlElement(name = "update_time")
	protected Timestamp updateTime;
	protected String xian;
	protected String xiang;

	/**
	 * Gets the value of the address property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * Sets the value of the address property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setAddress(String value) {
		this.address = value;
	}

	/**
	 * Gets the value of the aftdid property.
	 * 
	 */
	public int getAftdid() {
		return aftdid;
	}

	/**
	 * Sets the value of the aftdid property.
	 * 
	 */
	public void setAftdid(int value) {
		this.aftdid = value;
	}

	/**
	 * Gets the value of the bianhao property.
	 * 
	 */
	public float getBianhao() {
		return bianhao;
	}

	/**
	 * Sets the value of the bianhao property.
	 * 
	 */
	public void setBianhao(float value) {
		this.bianhao = value;
	}

	/**
	 * Gets the value of the biemin property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getBiemin() {
		return biemin;
	}

	/**
	 * Sets the value of the biemin property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setBiemin(String value) {
		this.biemin = value;
	}

	/**
	 * Gets the value of the buildtime property.
	 * 
	 * @return possible object is {@link Timestamp }
	 * 
	 */
	public Timestamp getBuildtime() {
		return buildtime;
	}

	/**
	 * Sets the value of the buildtime property.
	 * 
	 * @param value
	 *            allowed object is {@link Timestamp }
	 * 
	 */
	public void setBuildtime(Timestamp value) {
		this.buildtime = value;
	}

	/**
	 * Gets the value of the cun property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getCun() {
		return cun;
	}

	/**
	 * Sets the value of the cun property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setCun(String value) {
		this.cun = value;
	}

	/**
	 * Gets the value of the dalei property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getDalei() {
		return dalei;
	}

	/**
	 * Sets the value of the dalei property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setDalei(String value) {
		this.dalei = value;
	}

	/**
	 * Gets the value of the datatype property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getDatatype() {
		return datatype;
	}

	/**
	 * Sets the value of the datatype property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setDatatype(String value) {
		this.datatype = value;
	}

	/**
	 * Gets the value of the districtCode property.
	 * 
	 */
	public int getDistrictCode() {
		return districtCode;
	}

	/**
	 * Sets the value of the districtCode property.
	 * 
	 */
	public void setDistrictCode(int value) {
		this.districtCode = value;
	}

	/**
	 * Gets the value of the districtCodeStr property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getDistrictCodeStr() {
		return districtCodeStr;
	}

	/**
	 * Sets the value of the districtCodeStr property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setDistrictCodeStr(String value) {
		this.districtCodeStr = value;
	}

	/**
	 * Gets the value of the erDistrictCode property.
	 * 
	 */
	public int getErDistrictCode() {
		return erDistrictCode;
	}

	/**
	 * Sets the value of the erDistrictCode property.
	 * 
	 */
	public void setErDistrictCode(int value) {
		this.erDistrictCode = value;
	}

	/**
	 * Gets the value of the exceptionReporting property.
	 * 
	 */
	public int getExceptionReporting() {
		return exceptionReporting;
	}

	/**
	 * Sets the value of the exceptionReporting property.
	 * 
	 */
	public void setExceptionReporting(int value) {
		this.exceptionReporting = value;
	}

	/**
	 * Gets the value of the geometry property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getGeometry() {
		return geometry;
	}

	/**
	 * Sets the value of the geometry property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setGeometry(String value) {
		this.geometry = value;
	}

	/**
	 * Gets the value of the guid property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getGuid() {
		return guid;
	}

	/**
	 * Sets the value of the guid property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setGuid(String value) {
		this.guid = value;
	}

	/**
	 * Gets the value of the guimo property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getGuimo() {
		return guimo;
	}

	/**
	 * Sets the value of the guimo property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setGuimo(String value) {
		this.guimo = value;
	}

	/**
	 * Gets the value of the gwUpdateTime property.
	 * 
	 * @return possible object is {@link Timestamp }
	 * 
	 */
	public Timestamp getGwUpdateTime() {
		return gwUpdateTime;
	}

	/**
	 * Sets the value of the gwUpdateTime property.
	 * 
	 * @param value
	 *            allowed object is {@link Timestamp }
	 * 
	 */
	public void setGwUpdateTime(Timestamp value) {
		this.gwUpdateTime = value;
	}

	/**
	 * Gets the value of the gwUpdateType property.
	 * 
	 */
	public int getGwUpdateType() {
		return gwUpdateType;
	}

	/**
	 * Sets the value of the gwUpdateType property.
	 * 
	 */
	public void setGwUpdateType(int value) {
		this.gwUpdateType = value;
	}

	/**
	 * Gets the value of the isGuimo property.
	 * 
	 */
	public int getIsGuimo() {
		return isGuimo;
	}

	/**
	 * Sets the value of the isGuimo property.
	 * 
	 */
	public void setIsGuimo(int value) {
		this.isGuimo = value;
	}

	/**
	 * Gets the value of the laiyuan property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getLaiyuan() {
		return laiyuan;
	}

	/**
	 * Sets the value of the laiyuan property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setLaiyuan(String value) {
		this.laiyuan = value;
	}

	/**
	 * Gets the value of the latitude property.
	 * 
	 */
	public float getLatitude() {
		return latitude;
	}

	/**
	 * Sets the value of the latitude property.
	 * 
	 */
	public void setLatitude(float value) {
		this.latitude = value;
	}

	/**
	 * Gets the value of the link property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getLink() {
		return link;
	}

	/**
	 * Sets the value of the link property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setLink(String value) {
		this.link = value;
	}

	/**
	 * Gets the value of the longitude property.
	 * 
	 */
	public float getLongitude() {
		return longitude;
	}

	/**
	 * Sets the value of the longitude property.
	 * 
	 */
	public void setLongitude(float value) {
		this.longitude = value;
	}

	/**
	 * Gets the value of the name property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getName() {
		return name;
	}

	/**
	 * Sets the value of the name property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setName(String value) {
		this.name = value;
	}

	/**
	 * Gets the value of the oid property.
	 * 
	 */
	public int getOid() {
		return oid;
	}

	/**
	 * Sets the value of the oid property.
	 * 
	 */
	public void setOid(int value) {
		this.oid = value;
	}

	/**
	 * Gets the value of the predid property.
	 * 
	 */
	public int getPredid() {
		return predid;
	}

	/**
	 * Sets the value of the predid property.
	 * 
	 */
	public void setPredid(int value) {
		this.predid = value;
	}

	/**
	 * Gets the value of the production property.
	 * 
	 */
	public int getProduction() {
		return production;
	}

	/**
	 * Sets the value of the production property.
	 * 
	 */
	public void setProduction(int value) {
		this.production = value;
	}

	/**
	 * Gets the value of the remark property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getRemark() {
		return remark;
	}

	/**
	 * Sets the value of the remark property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setRemark(String value) {
		this.remark = value;
	}

	/**
	 * Gets the value of the sheng property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getSheng() {
		return sheng;
	}

	/**
	 * Sets the value of the sheng property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setSheng(String value) {
		this.sheng = value;
	}

	/**
	 * Gets the value of the shi property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getShi() {
		return shi;
	}

	/**
	 * Sets the value of the shi property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setShi(String value) {
		this.shi = value;
	}

	/**
	 * Gets the value of the surveyProgress property.
	 * 
	 */
	public int getSurveyProgress() {
		return surveyProgress;
	}

	/**
	 * Sets the value of the surveyProgress property.
	 * 
	 */
	public void setSurveyProgress(int value) {
		this.surveyProgress = value;
	}

	/**
	 * Gets the value of the surveyStatus property.
	 * 
	 */
	public int getSurveyStatus() {
		return surveyStatus;
	}

	/**
	 * Sets the value of the surveyStatus property.
	 * 
	 */
	public void setSurveyStatus(int value) {
		this.surveyStatus = value;
	}

	/**
	 * Gets the value of the type property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getType() {
		return type;
	}

	/**
	 * Sets the value of the type property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setType(String value) {
		this.type = value;
	}

	/**
	 * Gets the value of the updateStatus property.
	 * 
	 */
	public int getUpdateStatus() {
		return updateStatus;
	}

	/**
	 * Sets the value of the updateStatus property.
	 * 
	 */
	public void setUpdateStatus(int value) {
		this.updateStatus = value;
	}

	/**
	 * Gets the value of the updateTime property.
	 * 
	 * @return possible object is {@link Timestamp }
	 * 
	 */
	public Timestamp getUpdateTime() {
		return updateTime;
	}

	/**
	 * Sets the value of the updateTime property.
	 * 
	 * @param value
	 *            allowed object is {@link Timestamp }
	 * 
	 */
	public void setUpdateTime(Timestamp value) {
		this.updateTime = value;
	}

	/**
	 * Gets the value of the xian property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getXian() {
		return xian;
	}

	/**
	 * Sets the value of the xian property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setXian(String value) {
		this.xian = value;
	}

	/**
	 * Gets the value of the xiang property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getXiang() {
		return xiang;
	}

	/**
	 * Sets the value of the xiang property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setXiang(String value) {
		this.xiang = value;
	}

}
