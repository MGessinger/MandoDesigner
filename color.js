'use strict';

var Picker = new function() {
	function on(elem, event, func) {
		elem.addEventListener(event, func);
	}

	String.prototype.startsWith = String.prototype.startsWith || function(obj) {
		return 0 === this.indexOf(obj);
	}

	String.prototype.padStart = String.prototype.padStart || function(l, f) {
		if (this.length >= l)
			return this;
		return f.repeat(l - this.length) + this;
	}

	function _init(o, done) {
		function clamp(n, min, max) {
			if (n > max)
				return max;
			else if (n < min)
				return min;
			return n;
		}

		function touch(event) {
			if (event.touches && 1 === event.touches.length)
				event = event.touches[0];
			else if (1 !== event.buttons)
				return;
			var dimensions = o.getBoundingClientRect();
			var width = dimensions.width;
			var height = dimensions.height;
			var l = clamp(event.clientX - dimensions.left, 0, width);
			var lightness = clamp(event.clientY - dimensions.top, 0, height);
			done(l / width, lightness / height);
		}

		on(o, "mousedown", touch);
		on(o, "touchstart", touch);
		on(o, "mousemove", touch);
		on(o, "touchmove", touch);
	}

	var color = {
		get rgb() {
			if (this._rgb)
				return this._rgb;
			return this._rgb = this.hslToRgb(this._hsl);
		},
		set rgb(value) {
			if (value == undefined)
				return;
			this._rgb = value;
			this._hsl = null;
		},
		get hsl () {
			if (this._hsl)
				return this._hsl;
			return this._hsl = this.rgbToHsl(this._rgb);
		},
		set hsl (value) {
			if (value == undefined)
				return;
			this._hsl = value;
			this._rgb = null;
		},
		get hex () {
			return "#" + this.rgb.map(function(e, l) {
				return l < 3 ? e.toString(16) : Math.round(255 * e).toString(16);
			}).map(function(_) {
				return _.padStart(2, "0");
			}).join("");
		},
		set hex (value) {
			if (value == undefined)
				return;
			this.rgb = this.hexToRgb(value);
		},
		get hslString () {
			var ydata = [360, 100, 100];
			var units = ["", "%", "%", ""];
			var str = this.hsl;
			var t = this.hsl.slice(0, 3).map(function(a, i) {
				var res = a * ydata[i];
				return res.toFixed(3 === i ? 3 : 1).replace(/\.?0+$/, "") + units[i];
			});
			return "hsl(" + t + ")";
		},
		update: function(value) {
			if (Array.isArray(value))
				return this.hsl = value;
			var string = value.toLowerCase();
			if (string.startsWith("hsl")) {
				var b = string.match(/([\-\d\.e]+)/g);
				if (!b)
					return undefined;
				b = b.map(Number);
				this.hsl = [b[0]/360, b[1]/100, b[2]/100];
			} else if (string.startsWith("rgb")) {
				var p = string.match(/\d{1,3}/g);
				if (!p)
					return undefined;
				this.rgb = p.slice(0,3).map(Number);
			} else if (string.startsWith("#")) {
				this.rgb = this.hexToRgb(string);
			} else {
				this.rgb = this.nameToRgb(string);
			}
		},
		rgbToHsl: function(y) {
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
		},
		hexToRgb: function (hex) {
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			if (result)
				result = result.slice(1).map(function(r) {return parseInt(r,16);});
			return result;
		},
		names: {cb:"0f8ff",tqw:"aebd7",q:"-ffff",qmrn:"7fffd4",zr:"0ffff",bg:"5f5dc",bsq:"e4c4",bck:"---",nch:"ebcd",b:"--ff",bvt:"8a2be2",brwn:"a52a2a",brw:"deb887",ctb:"5f9ea0",hrt:"7fff-",chcT:"d2691e",cr:"7f50",rnw:"6495ed",crns:"8dc",crms:"dc143c",cn:"-ffff",Db:"--8b",Dcn:"-8b8b",Dgnr:"b8860b",Dgr:"a9a9a9",Dgrn:"-64-",Dkhk:"bdb76b",Dmgn:"8b-8b",Dvgr:"556b2f",Drng:"8c-",Drch:"9932cc",Dr:"8b--",Dsmn:"e9967a",Dsgr:"8fbc8f",DsTb:"483d8b",DsTg:"2f4f4f",Dtrq:"-ced1",Dvt:"94-d3",ppnk:"1493",pskb:"-bfff",mgr:"696969",grb:"1e90ff",rbrc:"b22222",rwht:"af0",stg:"228b22",chs:"-ff",gnsb:"dcdcdc",st:"8f8ff",g:"d7-",gnr:"daa520",gr:"808080",grn:"-8-0",grnw:"adff2f",hnw:"0fff0",htpn:"69b4",nnr:"cd5c5c",ng:"4b-82",vr:"0",khk:"0e68c",vnr:"e6e6fa",nrb:"0f5",wngr:"7cfc-",mnch:"acd",Lb:"add8e6",Lcr:"08080",Lcn:"e0ffff",Lgnr:"afad2",Lgr:"d3d3d3",Lgrn:"90ee90",Lpnk:"b6c1",Lsmn:"a07a",Lsgr:"20b2aa",Lskb:"87cefa",LsTg:"778899",Lstb:"b0c4de",Lw:"e0",m:"-ff-",mgrn:"32cd32",nn:"af0e6",mgnt:"-ff",mrn:"8--0",mqm:"66cdaa",mmb:"--cd",mmrc:"ba55d3",mmpr:"9370db",msg:"3cb371",mmsT:"7b68ee","":"-fa9a",mtr:"48d1cc",mmvt:"c71585",mnLb:"191970",ntc:"5fffa",mstr:"e4e1",mccs:"e4b5",vjw:"dead",nv:"--80",c:"df5e6",v:"808-0",vrb:"6b8e23",rng:"a5-",rngr:"45-",rch:"da70d6",pgnr:"eee8aa",pgrn:"98fb98",ptrq:"afeeee",pvtr:"db7093",ppwh:"efd5",pchp:"dab9",pr:"cd853f",pnk:"c0cb",pm:"dda0dd",pwrb:"b0e0e6",prp:"8-080",cc:"663399",r:"--",sbr:"bc8f8f",rb:"4169e1",sbrw:"8b4513",smn:"a8072",nbr:"4a460",sgrn:"2e8b57",ssh:"5ee",snn:"a0522d",svr:"c0c0c0",skb:"87ceeb",sTb:"6a5acd",sTgr:"708090",snw:"afa",n:"-ff7f",stb:"4682b4",tn:"d2b48c",t:"-8080",thst:"d8bfd8",tmT:"6347",trqs:"40e0d0",vt:"ee82ee",whT:"5deb3",wht:"",hts:"5f5f5",w:"-",wgrn:"9acd32"},
		nameToRgb: function (e) {
			var p = e.toLowerCase().replace("at", "T").replace(/[aeiouyldf]/g, "").replace("ght", "L").replace("rk", "D").slice(-5, 4);
			var hex = this.names[p]
			if (!hex)
				return undefined;
			return this.hexToRgb(hex.replace(/\-/g, "00").padStart(6, "f"));
		},
		hslToRgb: function (f) {
			function merge(c, b, a) {
				if (a < 0) a++;
				else if (a > 1) a--;
      				return a < 1 / 6 ? c + 6 * (b - c) * a : a < .5 ? b : a < 2 / 3 ? c + (b - c) * (2 / 3 - a) * 6 : c;
			}
			var h = f[0], s = f[1], l = f[2];
			var r, g, b;
			if (0 === s) {
				r = g = b = l;
			} else {
				var e = l < .5 ? l * (1 + s) : l + s - l * s;
				var f = 2 * l - e;
				r = merge(f, e, h + 1 / 3);
				g = merge(f, e, h);
				b = merge(f, e, h - 1 / 3);
			}
			return [255 * r, 255 * g, 255 * b].map(Math.round);
		}
	}

	var PickerDOM = new function () {
		var wrapper = find("picker");
		wrapper.focus();
		on(wrapper, "click", function(event){event.stopPropagation();});
		var ch = wrapper.children;
		var colors = ["#000", "#333", "#730", "#040", "#800", "#007", "#fff"]
		for (var i = 0; i < colors.length; i++) {
			var pal = DOMNode("button", {
					class: "palette_icon",
					style: "background:" + colors[i],
					title: "Right-click to save the current color"
				}, ch[0]);
			on(pal, "click", function() { _setColor(this.style.background); });
			on(pal, "contextmenu", function(event) { event.preventDefault(); style.background = color.hex; });
		}

		var ch1 = ch[1].children;
		var hue = ch1[0], spectrum = ch1[1];
		var hueSelector = hue.firstElementChild;
		var colorSelector = spectrum.firstElementChild;

		var mainChildren = ch[2].children;
		var editor = mainChildren[0];
		on(editor, "input", function() { _setColor(this.value, true); });
		var Okay = mainChildren[1];
		on(Okay, "click", function() { PickerDOM.parent = null;});

		_init(hue, function(hue) { var c = color.hsl; c[0] = hue; return _setColor(c); });
		_init(spectrum, function(s, v) { var c = color.hsl; c[1] = s; c[2] = 1-v; return _setColor(c)});

		on(window, "mousedown", function (event) {
			if (!(wrapper.contains(event.target)))
				PickerDOM.parent = null;
		});
		on(window, "focusin", function (event) {
			if (!(wrapper.contains(event.target)))
				PickerDOM.parent = null;
		});

		function move(key, t, f) {
			t.style[key] = 100 * f + "%";
		}
		return {
			update: function (fromEditor) {
				var hslColor = color.hsl;
				var colorName = "hsl(" + 360 * hslColor[0] + ", 100%, 50%)";
				move("left",hueSelector, hslColor[0]);
				move("left",colorSelector, hslColor[1]);
				move("top",colorSelector, 1 - hslColor[2]);
				spectrum.style.backgroundColor = hue.style.color = colorName;
				spectrum.style.color = color.hslString;
				if (!fromEditor) {
					editor.value = color.hex;
				}
			},
			set parent (p) {
				if (!p)
					return wrapper.style.display = "none";
				wrapper.style.display = "";
				p.appendChild(wrapper);
			}
		}
	} ();

	function _setColor(value, fromEditor) {
		if (typeof value === "string")
			value = value.trim();
		if (!value)
			return;
		color.update(value);
		PickerDOM.update(fromEditor);
		if (onChange) {
			onChange(color.hex);
		}
	}

	var onChange = null;
	this.attach = function (button, handler, aff) {
		on(button, "click", function(event) {
			onChange = handler;
			_setColor(aff.getAttribute("fill"));
			PickerDOM.parent = button;
			event.preventDefault();
		});
	}
}()
