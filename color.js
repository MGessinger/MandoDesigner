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
			var s = clamp(event.clientX - dimensions.left, 0, width);
			var l = clamp(event.clientY - dimensions.top, 0, height);
			done(s / width, l / height);
		}

		on(o, "mousedown", touch);
		on(o, "touchstart", touch);
		on(o, "mousemove", touch);
		on(o, "touchmove", touch);
	}

	function Color () {
		function hexToHsv(hex) {
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, "$1$1$2$2$3$3");
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			if (!result)
				return undefined;
			var y = result.slice(1).map(function(r) {return parseInt(r,16)/255;});
			var r = y[0], g = y[1], b = y[2];
			var max = Math.max(r, g, b), min = Math.min(r, g, b);
			var h, d = max - min;

			switch(max) {
				case min:
					h = 0; break;
				case r:
					h = (g - b) / d; break;
				case g:
					h = (b - r) / d + 2; break;
				case b:
					h = (r - g) / d + 4; break;
			}
			var s = max === 0 ? 0 : d/max;
			h /= 6;
			return [h, s, max];
		}

		var ctx = find("canvas").getContext("2d");
		function nameToHex (e) {
			ctx.fillStyle = e;
			var f = ctx.fillStyle;
			if (f === "#000000" && e != "black")
				f = undefined;
			return f;
		}

		function hsvToHex(f) {
			var h = f[0]*6, s = f[1], v = f[2];
			var f = h - Math.floor(h);

			var	p = v*(1-s),
				q = v*(1-s*f),
				t = v*(1-s*(1-f));
			var rgb;
			switch(Math.floor(h)) {
				case 1:
					rgb = [q,v,p]; break;
				case 2:
					rgb = [p,v,t]; break;
				case 3:
					rgb = [p,q,v]; break;
				case 4:
					rgb = [t,p,v]; break;
				case 5:
					rgb = [v,p,q]; break;
				default:
					rgb = [v,t,p]; break;
			}
			return "#" + rgb.map(function(x) {
				var e = Math.round(x*255);
				var p = e.toString(16);
				return p.padStart(2, "0");
			}).join("");
		}

		var _hsv, _hex;
		return {
			get hsv () {
				if (_hsv)
					return _hsv;
				return _hsv = hexToHsv(_hex);
			},
			set hsv (value) {
				if (value == undefined)
					return;
				_hsv = value;
				_hex = hsvToHex(value);
			},
			get hex () {
				if (_hex)
					return _hex;
				return _hex = hsvToHex(_hsv);
			},
			set hex (value) {
				if (value == undefined)
					return;
				_hex = value;
				_hsv = hexToHsv(_hex);
			},
			update: function(value) {
				if (Array.isArray(value))
					return this.hsv = value;
				var string = value.toLowerCase();
				if (string[0] == '#') {
					this.hex = string;
				} else if (string.startsWith("rgb")) {
					var p = string.match(/\d{1,3}/g);
					if (!p || p.length < 3)
						return;
					this.hex = "#" + p.slice(0,3).map(function(e, l) {
						var p = parseInt(e).toString(16);
						return p.padStart(2, "0");
					}).join("");
				} else {
					this.hex = nameToHex(string);
				}
			}
		}
	}

	function PickerDOM() {
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
			on(pal, "contextmenu", function(event) { event.preventDefault(); this.style.background = color.hex; });
		}

		var ch1 = ch[1].children;
		var hue = ch1[0], spectrum = ch1[1];
		var hueSelector = hue.firstElementChild;
		var colorSelector = spectrum.firstElementChild;

		var mainChildren = ch[2].children;
		var editor = mainChildren[0];
		on(editor, "input", function() { _setColor(this.value, true); });
		var Okay = mainChildren[1];
		on(Okay, "click", function() { DOM.parent = null;});

		_init(hue, function(hue) { var c = color.hsv; c[0] = hue; return _setColor(c); });
		_init(spectrum, function(s, v) { var c = color.hsv; c[1] = s; c[2] = 1-v; return _setColor(c)});

		on(window, "mousedown", function (event) {
			if (!(wrapper.contains(event.target)))
				DOM.parent = null;
		});
		on(window, "focusin", function (event) {
			if (!(wrapper.parentNode.contains(event.target)))
				DOM.parent = null;
		});

		function move(key, t, f) {
			t.style[key] = 100 * f + "%";
		}
		return {
			update: function (fromEditor) {
				var hsvColor = color.hsv;
				var colorName = "hsl(" + 360 * hsvColor[0] + ", 100%, 50%)";
				move("left",hueSelector, hsvColor[0]);
				move("left",colorSelector, hsvColor[1]);
				move("top",colorSelector, 1 - hsvColor[2]);
				spectrum.style.backgroundColor = hueSelector.style.background = colorName;
				colorSelector.style.background = color.hex;
				if (!fromEditor) {
					editor.value = color.hex;
				}
			},
			get parent () {
				return wrapper.style.display === "" && wrapper.parentNode;
			},
			set parent (p) {
				if (!p)
					return wrapper.style.display = "none";
				wrapper.style.display = "";
				p.appendChild(wrapper);
			}
		}
	}

	function _setColor(value, fromEditor) {
		if (typeof value === "string")
			value = value.trim();
		if (!value)
			return;
		color.update(value);
		DOM.update(fromEditor);
		if (onChange) {
			onChange(color.hex);
		}
	}

	var color = new Color();
	var DOM = new PickerDOM();
	var onChange = null;
	this.attach = function (button, handler, aff) {
		on(button, "click", function(event) {
			if (DOM.parent === this) {
				DOM.parent = null;
				return;
			}
			onChange = handler;
			_setColor(aff.getAttribute("fill"));
			DOM.parent = this;
		});
	}
}()
