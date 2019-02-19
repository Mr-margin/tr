package com.gistone.seimp.job;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;

/**
 * This object contains factory methods for each Java content interface and Java
 * element interface generated in the com.gistone.seimp.job package.
 * <p>
 * An ObjectFactory allows you to programatically construct new instances of the
 * Java representation for XML content. The Java representation of XML content
 * can consist of schema derived interfaces and classes representing the binding
 * of schema type definitions, element declarations and model groups. Factory
 * methods for each of these are provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

	private final static QName _GetDataResponse_QNAME = new QName(
			"http://geoway.cn/", "getDataResponse");
	private final static QName _GetData_QNAME = new QName("http://geoway.cn/",
			"getData");

	/**
	 * Create a new ObjectFactory that can be used to create new instances of
	 * schema derived classes for package: com.gistone.seimp.job
	 * 
	 */
	public ObjectFactory() {
	}

	/**
	 * Create an instance of {@link GetData }
	 * 
	 */
	public GetData createGetData() {
		return new GetData();
	}

	/**
	 * Create an instance of {@link Timestamp }
	 * 
	 */
	public Timestamp createTimestamp() {
		return new Timestamp();
	}

	/**
	 * Create an instance of {@link GetDataResponse }
	 * 
	 */
	public GetDataResponse createGetDataResponse() {
		return new GetDataResponse();
	}

	/**
	 * Create an instance of {@link Data }
	 * 
	 */
	public Data createData() {
		return new Data();
	}

	/**
	 * Create an instance of {@link JAXBElement }{@code <}{@link GetDataResponse }
	 * {@code >}
	 * 
	 */
	@XmlElementDecl(namespace = "http://geoway.cn/", name = "getDataResponse")
	public JAXBElement<GetDataResponse> createGetDataResponse(
			GetDataResponse value) {
		return new JAXBElement<GetDataResponse>(_GetDataResponse_QNAME,
				GetDataResponse.class, null, value);
	}

	/**
	 * Create an instance of {@link JAXBElement }{@code <}{@link GetData }{@code >}
	 * 
	 */
	@XmlElementDecl(namespace = "http://geoway.cn/", name = "getData")
	public JAXBElement<GetData> createGetData(GetData value) {
		return new JAXBElement<GetData>(_GetData_QNAME, GetData.class, null,
				value);
	}

}
