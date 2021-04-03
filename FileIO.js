"use strict";

function Uploader (queryString) {
	find("background_upload").addEventListener("change", function() {
		var files = this.files;
		if (files.length == 0)
			return;

		var reader = new FileReader();
		if (files[0].type.includes("svg")) {
			reader.onload = function () {
				Download.Background = "data:image/svg+xml," + encodeSVG(this.result);
			}
			reader.readAsText(files[0]);
		} else {
			reader.onload = function() {
				Download.Background = this.result;
			}
			reader.readAsDataURL(files[0]);
		}

		var reset = find("reset_wrapper");
		reset.style.display = "";
		this.value = "";
	});

	function parseMando (svg) {
		variants = {};
		resetSettings();

		var iter = document.createNodeIterator (
			svg,
			NodeFilter.SHOW_ELEMENT,
			{ acceptNode: function (node) {
					if (!node.id)
						return NodeFilter.FILTER_REJECT;
					if (!(node.style.fill || node.hasAttribute("class")))
						return NodeFilter.FILTER_SKIP;
					return NodeFilter.FILTER_ACCEPT;
				}
			}
		);

		var node;
		while (node = iter.nextNode()) {
			var id = node.id;
			if (node.style.fill) {
				var bn = buttonName(id) + "Color";
				settings[bn] = node.style.fill;
			}
			var cls = node.getAttribute("class");
			if (!cls)
				continue;
			var neutral = neutralize(id);
			if (cls == "toggle") {
				variants[neutral] = true;
			} else if (cls == "option") {
				var parent = node.parentNode;
				var parName = neutralize(parent.id) + "_Option";
				variants[parName] = neutral;
			} else if (id.includes("Current")) {
				var cat = id.replace("_Current", "");
				variants[cat] = neutralize(cls);
			}
		}
	}

	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	function dissectSVG () {
		svg.innerHTML = this.result;
		svg = svg.firstElementChild;

		var mando = svg.lastElementChild;
		var img = svg.getElementsByTagName("image")[0];
		if (!mando || !img)
			return;
		parseMando(mando);

		if (mando.id === "Female-Body") {
			var sex_radio = find("female");
			sex_radio.checked = true;
			S.set.Sex(true, true);
		} else {
			var sex_radio = find("male");
			sex_radio.checked = true;
			S.set.Sex(false, true);
		}

		Download.Background = img.getAttribute("href");
	}

	var reader = new FileReader();
	reader.onload = dissectSVG;
	find("reupload").addEventListener("input", function() {
		reader.readAsText(this.files[0]);
	});

	function readQueryString (st) {
		var settings = {};
		var regex = /(\w+)=([^&]*)&?/g;
		var matches;
		while (matches = regex.exec(st)) {
			settings[matches[1]] = unescape(matches[2]);
		}
		return settings;
	}

	function loadPreset (preset, female) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", preset);
		xhr.setRequestHeader("Cache-Control", "no-cache, max-age=10800");
		xhr.onload = function () {
			var xml = this.responseXML;
			if (this.status !== 200 || !xml)
				return S.set.Sex(female, false);
			var svg = xml.documentElement;
			find("female").checked = female;
			Upload(svg);
			S.set.Sex(female, true);
		};
		xhr.onerror = function () {
			S.set.Sex(female, false);
		};
		xhr.send();
	}

	var female = false;
	if (window.localStorage)
		female = (localStorage.getItem("female_sex") == "true");
	var options = readQueryString(queryString);
	if ("preset" in options) {
		female = +options["sex"];
		loadPreset(options["preset"], female);
	} else {
		if (!female) {
			var sex_radio = find("male");
			sex_radio.checked = true;
		} else {
			var sex_radio = find("female");
			sex_radio.checked = true;
		}
		S.set.Sex(female);
	}
	return parseMando;
}
var Upload = new Uploader(window.location.search);

function Downloader () {
	var editor = find("editor");
	var xml = new XMLSerializer();
	var img = new Image();
	var canvas = find("canvas");
	var canvasCtx = canvas.getContext('2d');
	var logoSVG, bckImgURI;

	function prepareForExport (svg) {
		var it = document.createNodeIterator(svg, NodeFilter.SHOW_ELEMENT,
			{ acceptNode: function (node) {
				if (node.hasAttribute("class"))
					return NodeFilter.FILTER_ACCEPT;
				return NodeFilter.FILTER_SKIP;
			} });
		var node;
		while (node = it.nextNode()) {
			var cls = node.getAttribute("class");
			if (cls == "option") {
				if (node.style.display == "inherit")
					continue;
			} else {
				if (node.style.display !== "none")
					continue;
			}
			var parent = node.parentNode;
			parent.removeChild(node);
		}
		return svg;
	}

	function encodeSVG (svg) {
		var san = svg.replace(/\s+/g," ").replace(/"/g,"'");
		return encodeURIComponent(san);
	}

	function SVGFromEditor () {
		var svg = editor.firstElementChild;
		var copy = svg.cloneNode(true);
		return prepareForExport(copy);
	}

	function svg2img(svg, width, height) {
		svg.setAttribute("width", width);
		svg.setAttribute("height", height);
		var copy = svg.cloneNode(true);
		prepareForExport(copy);
		var str = xml.serializeToString(copy);
		var svg64 = btoa(unescape(encodeSVG(str)));
		var b64start = 'data:image/svg+xml;base64,';
		var image64 = b64start + svg64;
		return image64;
	}

	function prepareCanvas (href) {
		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
		img.onload = function () {
			/* Background Image */
			canvas.width = this.width;
			canvas.height = this.height;
			canvasCtx.drawImage(this, 0, 0);
			bckImgURI = canvas.toDataURL('image/jpeg');
			/* Logo */
			img.onload = function () {
				canvasCtx.drawImage(this, 0, 0);
			};
			img.src = svg2img(logoSVG, canvas.width,canvas.height*0.07);
		};
		img.src = href;
	}

	function setAttributes (obj, atts) {
		for (var a in atts)
			obj.setAttribute(a, atts[a]);
	}

	return {
		set Logo (svg) {
			logoSVG = svg;
		},
		set Background (href) {
			prepareCanvas(href);
			editor.style.backgroundImage = "url(" + href + ")";
		},
		get Background () {
			var svgMain = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			setAttributes(svgMain, {
				"version": "1.1",
				"width": canvas.width,
				"height": canvas.height,
				"viewBox": [0, 0, canvas.width, canvas.height].join(" ")
			});
			var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
			setAttributes(image, {
				"width": "100%",
				"height": "100%",
				"href": bckImgURI
			});
			svgMain.appendChild(image);
			return svgMain;
		},
		attach: function (a, type) {
			var self = this;
			if (type === "svg") {
				a.onclick = function () {
					var bck = self.Background;
					var logo = logoSVG.cloneNode(true);
					bck.appendChild(logo);
					bck.appendChild(SVGFromEditor());
					var str = xml.serializeToString(bck);
					var document = "<?xml version='1.0' encoding='UTF-8'?>" + str;
					var URI = 'data:image/svg+xml;charset=UTF-8,' + encodeSVG(document);
					this.setAttribute("href", URI);
					setTimeout(function() {
						a.setAttribute("href", "#");
						unsavedChanges = false;
					}, 1000);
				};
			} else {
				var isSetUp = false;
				a.onclick = function (event) {
					if (isSetUp) {
						setTimeout(function() {
							a.setAttribute("href", "#");
							isSetUp = false;
							unsavedChanges = false;
						}, 5000);
						prepareCanvas(bckImgURI);
						return;
					}
					event.preventDefault();
					img.onload = function () {
						canvasCtx.drawImage(this, 0, 0);
						var imgData = canvas.toDataURL('image/jpeg');
						a.setAttribute("href", imgData);
						isSetUp = true;
						a.click();
					}
					img.src = svg2img(SVGFromEditor(), canvas.width, canvas.height);
				}
			}
		}
	};
}
var Download = new Downloader();
Download.attach(find("download_svg"), "svg");
Download.attach(find("download_jpeg"), "jpeg");
