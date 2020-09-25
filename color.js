'use strict';

function Picker() {
	var domElement, _domH, _domSL, _domEdit, _domOkay
	var parent;

	function on(elem, event, func) {
		elem.addEventListener(event, func);
	}

	function _init(o, done) {
		function clamp(n, max, val) {
			return Math.max(max, Math.min(n, val));
		}

		function move(arg, event, n) {
			if (r |= n) {
				arg.preventDefault();
				var dimensions = o.getBoundingClientRect();
				var width = dimensions.width;
				var height = dimensions.height;
				var x = event.clientX;
				var y = event.clientY;
				var l = clamp(x - dimensions.left, 0, width);
				var lightness = clamp(y - dimensions.top, 0, height);
				done(l / width, lightness / height);
			}
		}

		function t(e, h) {
			if (1 === e.buttons) {
				move(e, e, h);
			} else {
				r = false;
			}
		}

		function i(e, n) {
			if (1 === e.touches.length) {
				move(e, e.touches[0], n);
			} else {
				r = false;
			}
		}
		var r = false;
		on(o, "mousedown", function(e) { t(e, true); });
		on(o, "touchstart", function(css) { i(css, true); });
		on(o, "mousemove", t);
		on(o, "touchmove", i);
		on(o, "mouseup", function() { r = false; });
		on(o, "touchend", function() { r = false; });
		on(o, "touchcancel", function() { r = false; });
	}

	function $(selector, el) {
		return (el || document).querySelector(selector);
	}

	String.prototype.startsWith = String.prototype.startsWith || function(obj) {
		return 0 === this.indexOf(obj);
	}

	String.prototype.padStart = String.prototype.padStart || function(l, f) {
		if (this.length >= l)
			return this;
		return f.repeat(l - this.length) + this;
	}

	var color = {
		get rgba() {
			if (this._rgba)
      				return this._rgba;
			return this._rgba = hslToRgb(this._hsla);
		},
		set rgba(value) {
			if (value == undefined)
				return;
			this._rgba = value;
			this._hsla = null;
		},
		get hsla () {
			if (this._hsla)
				return this._hsla;
			return this._hsla = rgbToHsl(this._rgba);
		},
		set hsla (value) {
			if (value == undefined)
				return;
			this._hsla = value;
			this._rgba = null;
		},
		get hex () {
			return "#" + this.rgba.map(function(e, l) {
				return l < 3 ? e.toString(16) : Math.round(255 * e).toString(16);
			}).map(function(_) {
				return _.padStart(2, "0");
			}).join("");
		},
      		set hex (value) {
			if (value == undefined)
				return;
	      		this.rgba = hexToRgb(value);
		},
		get hslString () {
			var ydata = [360, 100, 100];
			var units = ["", "%", "%", ""];
			var str = this.hsla;
			var t = this.hsla.slice(0, 3).map(function(a, i) {
				var res = a * ydata[i];
				return res.toFixed(3 === i ? 3 : 1).replace(/\.?0+$/, "") + units[i];
			});
			return "hsl(" + t + ")";
		},
		update: function(value) {
			if (!value)
				return;
			var string = value.toLowerCase();
			if (string.startsWith("hsl")) {
				var b = string.match(/([\-\d\.e]+)/g).map(Number);
				var position = b[0];
				var len = b[1];
				var output = b[2];
				position = position / 360;
				len = len / 100;
				output = output / 100;
				this.hsla = [position, len, output];
			} else if (string.startsWith("rgb")) {
				var p = string.match(/([\-\d\.e]+)/g);
				if (!p)
					return;
				var rooms = p.map(Number);
				var name = rooms[0];
				var the = rooms[1];
				var response = rooms[2];
				this.rgba = [name, the, response];
			} else if (string.startsWith("#")) {
				this.rgba = hexToRgb(string);
			} else {
				this.rgba = nameToRgb(string);
			}
		}
	}

	function rgbToHsl (y) {
		var r = y[0]/255;
		var g = y[1]/255;
		var b = y[2]/255;
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var h, s;
		var c = (max + min) / 2;
		if (max === min) {
			h = s = 0;
		} else {
			var d = max - min;
			switch (s = .5 < c ? d / (2 - max - min) : d / (max + min),
					max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
			}
			h = h / 6;
		}
		return [h, s, c];
	}

	function hexToRgb (url) {
		var searcher_name = (url.startsWith("#") ? url.slice(1) : url).replace(/^(\w{3})$/, "$1F").replace(/^(\w)(\w)(\w)(\w)$/, "$1$1$2$2$3$3$4$4").replace(/^(\w{6})$/, "$1FF");
		if (!searcher_name.match(/^([0-9a-fA-F]{8})$/)) {
			return undefined;
		}
		var r = searcher_name.match(/^(\w\w)(\w\w)(\w\w)(\w\w)$/).slice(1).map(
			function(id_local) {
				return parseInt(id_local, 16);
			}
		);
		r[3] = r[3] / 255;
		return r;
	}

	function nameToRgb (e) {
		var n={cb:"0f8ff",tqw:"aebd7",q:"-ffff",qmrn:"7fffd4",zr:"0ffff",bg:"5f5dc",bsq:"e4c4",bck:"---",nch:"ebcd",b:"--ff",bvt:"8a2be2",brwn:"a52a2a",brw:"deb887",ctb:"5f9ea0",hrt:"7fff-",chcT:"d2691e",cr:"7f50",rnw:"6495ed",crns:"8dc",crms:"dc143c",cn:"-ffff",Db:"--8b",Dcn:"-8b8b",Dgnr:"b8860b",Dgr:"a9a9a9",Dgrn:"-64-",Dkhk:"bdb76b",Dmgn:"8b-8b",Dvgr:"556b2f",Drng:"8c-",Drch:"9932cc",Dr:"8b--",Dsmn:"e9967a",Dsgr:"8fbc8f",DsTb:"483d8b",DsTg:"2f4f4f",Dtrq:"-ced1",Dvt:"94-d3",ppnk:"1493",pskb:"-bfff",mgr:"696969",grb:"1e90ff",rbrc:"b22222",rwht:"af0",stg:"228b22",chs:"-ff",gnsb:"dcdcdc",st:"8f8ff",g:"d7-",gnr:"daa520",gr:"808080",grn:"-8-0",grnw:"adff2f",hnw:"0fff0",htpn:"69b4",nnr:"cd5c5c",ng:"4b-82",vr:"0",khk:"0e68c",vnr:"e6e6fa",nrb:"0f5",wngr:"7cfc-",mnch:"acd",Lb:"add8e6",Lcr:"08080",Lcn:"e0ffff",Lgnr:"afad2",Lgr:"d3d3d3",Lgrn:"90ee90",Lpnk:"b6c1",Lsmn:"a07a",Lsgr:"20b2aa",Lskb:"87cefa",LsTg:"778899",Lstb:"b0c4de",Lw:"e0",m:"-ff-",mgrn:"32cd32",nn:"af0e6",mgnt:"-ff",mrn:"8--0",mqm:"66cdaa",mmb:"--cd",mmrc:"ba55d3",mmpr:"9370db",msg:"3cb371",mmsT:"7b68ee","":"-fa9a",mtr:"48d1cc",mmvt:"c71585",mnLb:"191970",ntc:"5fffa",mstr:"e4e1",mccs:"e4b5",vjw:"dead",nv:"--80",c:"df5e6",v:"808-0",vrb:"6b8e23",rng:"a5-",rngr:"45-",rch:"da70d6",pgnr:"eee8aa",pgrn:"98fb98",ptrq:"afeeee",pvtr:"db7093",ppwh:"efd5",pchp:"dab9",pr:"cd853f",pnk:"c0cb",pm:"dda0dd",pwrb:"b0e0e6",prp:"8-080",cc:"663399",r:"--",sbr:"bc8f8f",rb:"4169e1",sbrw:"8b4513",smn:"a8072",nbr:"4a460",sgrn:"2e8b57",ssh:"5ee",snn:"a0522d",svr:"c0c0c0",skb:"87ceeb",sTb:"6a5acd",sTgr:"708090",snw:"afa",n:"-ff7f",stb:"4682b4",tn:"d2b48c",t:"-8080",thst:"d8bfd8",tmT:"6347",trqs:"40e0d0",vt:"ee82ee",whT:"5deb3",wht:"",hts:"5f5f5",w:"-",wgrn:"9acd32"};
		var p = e.toLowerCase().replace("at", "T").replace(/[aeiouyldf]/g, "").replace("ght", "L").replace("rk", "D").slice(-5, 4);
		var b = n[p];
		if (p in n)
			return hexToRgb(n[p].replace(/\-/g, "00").padStart(6, "f"));
		return undefined;
	}

	function hslToRgb (f) {
		var i = f[0];
		var d = f[1];
		var c = f[2];
		var o, s, m;
		if (0 === d) {
			o = s = m = c;
		} else {
			var merge = function(c, b, a) {
				return a < 0 && (a = a + 1),
				       1 < a && (a = a - 1),
				       a < 1 / 6 ? c + 6 * (b - c) * a : a < .5 ? b : a < 2 / 3 ? c + (b - c) * (2 / 3 - a) * 6 : c;
			};
			var e = c < .5 ? c * (1 + d) : c + d - c * d;
			var f = 2 * c - e;
			o = merge(f, e, i + 1 / 3);
			s = merge(f, e, i);
			m = merge(f, e, i - 1 / 3);
		}
		return [255 * o, 255 * s, 255 * m].map(Math.round);
	}

	var touchstart = "mousedown";
	var TOKEN_CLOSE = "focusin";
	function closeHandler(event, that) {
		var r = false;
		var type = event.type;
		if (type === touchstart || type === TOKEN_CLOSE) {
			var since = (that.__containedEvent || 0) + 100;
			if (event.timeStamp > since) {
				r = true;
			}
		} else {
			event.preventDefault();
			event.stopPropagation();
			r = true;
		}
		if (r && _toggleDOM(false)) {
			parent.style.pointerEvents = "";
		}
	}

	function _setColor(that, value, fromEditor) {
		if (typeof value === "string")
			value = value.trim();
		if (value) {
			color.update(value);
			_setHSLA(that, fromEditor);
		}
	}

	function build(picker) {
		var wrapper = DOMNode("div", { class: "picker_wrapper" });
		domElement = wrapper;

		var palette = DOMNode("div", { class: "picker_palette" }, wrapper);
		var colors = ["#000", "#333", "#730", "#040", "#800", "#007", "#fff"]
			var that = picker;
		for (var i = 0; i < colors.length; i++) {
			var pal = DOMNode("button", {
class: "palette_icon",
style: "background:" + colors[i],
title: "Right-click to save the current color"
}, palette);
on(pal, "click", function() {
		_setColor(picker, this.style.background);
		});
on(pal, "contextmenu", function() {
		event.preventDefault();
		this.style.background = color.hex;
		});
}

		var main = DOMNode("div", { class: "picker_main" }, wrapper);
		_domH = DOMNode("div", { class: "picker_hue" }, main);
		DOMNode("div", { class: "picker_selector" }, _domH);
		_domSL = DOMNode("div", { class: "picker_sl" }, main);
		DOMNode("div", { class: "picker_selector" }, _domSL);

	var bottom = DOMNode("div", { class: "picker_bottom" }, wrapper);
	_domEdit = DOMNode("input", { class: "picker_editor", "type": "text", "aria-label": "Type a color code or Hex value" }, bottom);
	_domOkay = DOMNode("button", { class: "picker_done" }, bottom);
	_domOkay.innerHTML = "Ok";

	_init(_domH, function(data) {
			return _setHSLA(that, false, data);
			});
	_init(_domSL, function(data, value) {
			return _setHSLA(that, false, null, data, 1 - value);
			});
	on(_domEdit, "input", function() {
			_setColor(that, this.value, true);
			});
	function listener(event) {
		that.__containedEvent = event.timeStamp;
	}
	on(domElement, touchstart, listener);
	on(domElement, TOKEN_CLOSE, listener);
	function close(event) {
		closeHandler(event, that);
	}
	on(_domOkay, "click", close);
	on(window, touchstart, close);
	on(window, TOKEN_CLOSE, close);
	}

	function _setHSLA(that, fromEditor, el, label, err, patch) {
		var hsla = color.hsla;
		[el, label, err, patch].forEach(function(i, n) {
			if (i || 0 === i) {
				hsla[n] = i;
			}
		});
		color.hsla = hsla;
		_updateUI(fromEditor);
		if (that.onChange) {
			that.onChange(color);
		}
	}

	function _updateUI(fromEditor) {
		function setleft(context, args, min) {
			args.style.left = 100 * min + "%";
		}
		function setTop(exh, t, f) {
			t.style.top = 100 * f + "%";
		}
		var hslaColor = color.hsla;
		var colorName = "hsl(" + 360 * hslaColor[0] + ", 100%, 50%)";
		var hue = $(".picker_selector", _domH);
		setleft(0, hue, hslaColor[0]);
		var dot = $(".picker_selector", _domSL);
		setleft(0, dot, hslaColor[1]);
		setTop(0, dot, 1 - hslaColor[2]);
		_domSL.style.backgroundColor = _domH.style.color = colorName;
		_domSL.style.color = color.hslString;
		if (!fromEditor) {
			_domEdit.value = color.hex;
		}
	}

	function _toggleDOM(value) {
		if (!parent || !domElement) {
			return false;
		}
		var val = value ? "" : "none";
		domElement.style.display = val;
		return true;
	}

	this.onChange = null;
	this.open = function(p, color) {
		parent = p;
		_setColor(this, color);
		if (parent !== domElement.parentNode) {
			parent.appendChild(domElement);
		}
		_toggleDOM(true);
		parent.style.pointerEvents = "none";
	}
	build(this);
}

	var attachColorPicker = function() {
		var globalPicker ;
		return function (button, handler, aff) {
			var c = globalPicker || new Picker(button);
			globalPicker = c;
			button.addEventListener("click", function() {
					c.onChange = handler;
					c.open(button, aff.getAttribute("fill"));
					});
		}
	}()
