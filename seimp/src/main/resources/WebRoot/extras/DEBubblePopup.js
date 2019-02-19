define([
        "dojo/Evented",
        "dojo/on",
        "dojo/query",
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/_base/array",
        "dojo/dom-style",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dijit/_TemplatedMixin",
        "esri/domUtils",
        "esri/InfoWindowBase",
        "esri/geometry/ScreenPoint",
        "esri/geometry/screenUtils",
        "esri/geometry/webMercatorUtils",
        "dojo/text!./dextraPopup.html"
    ],
    function (Evented,
              on,
              query,
              declare,
              domConstruct,
              domAttr,
              array,
              domStyle,
              lang,
              domClass,
              _TemplatedMixin,
              domUtils,
              InfoWindowBase, ScreenPoint, screenUtils, webMercatorUtils, template) {
        var showMapPoint = null;
        return declare([InfoWindowBase, Evented, _TemplatedMixin], {

            templateString: template,
            _events: [],
            constructor: function (parameters) {
                lang.mixin(this, parameters);
            },
            _createInfoWindowInstance: function (map) {
                this.domNode = domConstruct.create("div", null, map.id + "_root");
                domClass.add(this.domNode, "dextra-bubble-pop");
                domStyle.set(this.domNode, {
                    width: "260px",
                });

                this.domNode.innerHTML = this.templateString;

                this._content = query("div.dextra-poi-info-window div.windowContent");
                this._title = query("div.dextra-poi-info-window div.windowTitle");
                //记录宽高
                this._windowWidth = "260";
                this._windowHeight = "150";
                //hide initial display
                domUtils.hide(this.domNode);
                this.isShowing = false;
            },

            setMap: function (map) {
                this.inherited(arguments);
                this._events = [];
                this._createInfoWindowInstance(map);
                this._events.push(map.on("pan", lang.hitch(this, function (evt) {
                    if (this.isShowing) {
                        this._showInfoWindow(evt.extent);
                    }
                })));

                this._events.push(map.on("zoom-start", lang.hitch(this, function (evt) {
                    this.hide();
                })));

                this._events.push(map.on("zoom-end", lang.hitch(this, function (evt) {
                    this._showInfoWindow(evt.extent);
                })));
            },

            unsetMap: function (map) {
                this.inherited(arguments);
                array.forEach(this._events, function (event) {
                    event.remove();
                });
            },
            setTitle: function (title) {
                this._title.forEach(function (node) {
                	node.innerHTML = title;
                });
            },

            setContent: function (content) {
                this._content.forEach(function (node) {
                    node.innerHTML = content;
                });
            },

            _showInfoWindow: function (extent) {
                if (showMapPoint == null)return;
                var showScreenPoint = screenUtils.toScreenGeometry(extent, this.map.width, this.map.height, showMapPoint);
                domStyle.set(this.domNode, {
                	 "left": (showScreenPoint.x +10) + "px",
                     "top": (showScreenPoint.y - this._windowHeight/2) + "px"
/*                     "left": (showScreenPoint.x - this._windowWidth/2) + "px",
                     "top": (showScreenPoint.y - this._windowHeight-30) + "px"
*/                });

                domUtils.show(this.domNode);
                this.isShowing = true;
                this.onShow();
            },

            show: function (location) {
                showMapPoint = location;
                if (webMercatorUtils.canProject(location, this.map)) {
                    showMapPoint = webMercatorUtils.project(location, this.map);
                }
                if (showMapPoint.spatialReference) {
                    var screenPoint = this.map.toScreen(showMapPoint);
                    domStyle.set(this.domNode, {
                    	"left": (screenPoint.x +10) + "px",
                        "top": (screenPoint.y - this._windowHeight/2) + "px"
/*                        "left": (screenPoint.x - this._windowWidth/2) + "px",
                        "top": (screenPoint.y - this._windowHeight-30) + "px"
*/                    });
                }

                //display the info window
                domUtils.show(this.domNode);
                this.isShowing = true;
                this.onShow();
            },
            hide: function () {
                if (this.isShowing) {
                    domUtils.hide(this.domNode);
                    this.isShowing = false;
                    this.onHide();
                }
            },
            resize: function (width, height) {
            	domStyle.set(this.domNode, {
                    "width": width + "px",
                    "height": height + "px"
                });
            	this._windowWidth=width;
            	this._windowHeight = height;
                
            },
            remove: function () {
                this.hide();
                showMapPoint = null;
            },
            destroy: function () {
                domConstruct.destroy(this.domNode);
            }
        });//--declare end
    });//--define end