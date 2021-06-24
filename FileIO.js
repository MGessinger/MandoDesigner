"use strict";

function Uploader (queryString, D) {
	var readerBck = new FileReader;
	var file;
	readerBck.onload = function() {
		D.Background = {type: file.type, data: this.result};
		file = null;
	}
	find("background_upload").addEventListener("change", function() {
		file = this.files[0];
		if (!file) return;

		if (file.type == "image/svg+xml")
			readerBck.readAsText(file);
		else
			readerBck.readAsDataURL(file);

		var reset = find("reset_wrapper");
		reset.style.display = "";
		this.value = "";
	});

	function parseMando (svg) {
		variants = {}
		settings = resetSettings(false);

		var iter = document.createNodeIterator(svg, NodeFilter.SHOW_ELEMENT,
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
				if (parName.includes("Earcap"))
					variants[neutral] = true;
				else
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
		var img = svg.firstElementChild;

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

		var logo = svg.getElementById("titleDark");
		S.set.DarkMode(true);
		if (img.tagName.toLowerCase() === "svg") {
			D.Background = { type: "image/svg+xml", data: encodeURIComponent(img.outerHTML) };
		} else {
			var href = img.getAttribute("href");
			var type = href.match(/^data:image\/\w+/)[0];
			if (!type)
				return;
			D.Background = { type: type.substring(5), data: href };
		}
	}

	var readerMando = new FileReader();
	readerMando.onload = dissectSVG;
	find("reupload").addEventListener("change", function() {
		readerMando.readAsText(this.files[0]);
		this.value = "";
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
			parseMando(svg);
			S.set.Sex(female, true);
		};
		xhr.onerror = function () {
			S.set.Sex(female, false);
		};
		xhr.send();
	}

	var female;
	var options = readQueryString(queryString);
	if ("sex" in options)
		female = +options["sex"];
	else
		female = (localStorage.getItem("female_sex") == "true");

	if ("preset" in options) {
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

function Downloader () {
	var editor = find("editor");
	var xml = new XMLSerializer();
	var img = new Image();
	var canvas = find("canvas");
	var canvasCtx = canvas.getContext('2d');
	var logoSVG, bckImgURI, bckSVG;

	function prepareForExport (svg) {
		var options = svg.getElementsByClassName("option");
		var i = 0;
		while (i < options.length) {
			if (options[i].style.display == "inherit") {
				i++;
				continue;
			}
			var parent = options[i].parentNode;
			parent.removeChild(options[i]);
		}
		var toggles = svg.getElementsByClassName("toggle");
		i = 0;
		while (i < toggles.length) {
			if (toggles[i].style.display !== "none") {
				i++;
				continue;
			}
			var parent = toggles[i].parentNode;
			parent.removeChild(toggles[i]);
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
		svg.setAttribute("width", width || 1000);
		svg.setAttribute("height", height || 700);
		var copy = svg.cloneNode(true);
		var str = xml.serializeToString(copy);
		var svgEnc = encodeSVG(str);
		var image64 = 'data:image/svg+xml,' + svgEnc;
		return image64;
	}

	function prepareCanvas (href) {
		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
		img.onload = function () {
			/* Background Image */
			canvas.width = this.width;
			canvas.height = this.height;
			canvasCtx.drawImage(this, 0, 0);
			if (!href.startsWith("data"))
				bckImgURI = canvas.toDataURL('image/jpeg');
			else
				bckImgURI = href
			/* Logo */
			img.onload = function () {
				canvasCtx.drawImage(this, 0, 0);
			};
			img.src = svg2img(logoSVG, canvas.width, Math.round(canvas.height*0.07));
		};
		img.src = href;
	}

	function SVGNode (type, atts, par) {
		var node = document.createElementNS("http://www.w3.org/2000/svg", type);
		for (var a in atts)
			node.setAttribute(a, atts[a]);
		if (par) par.appendChild(node);
		return node;
	}

	return {
		set Logo (svg) {
			logoSVG = svg;
		},
		set Background (bck) {
			var href;
			switch (bck.type) {
				case "image/svg+xml":
					href = "data:image/svg+xml," + encodeSVG(bck.data);
					bckSVG = bck.data;
					break;
				default:
					href = bck.data;
					bckSVG = null;
			}
			prepareCanvas(href);
			editor.style.backgroundImage = "url(\"" + href + "\")";
		},
		get Background () {
			var svgMain = SVGNode("svg", {
				"version": "1.1",
				"width": canvas.width,
				"height": canvas.height,
				"viewBox": [0, 0, canvas.width, canvas.height].join(" ")
			});
			if (bckSVG) {
				svgMain.innerHTML = bckSVG;
			} else {
				SVGNode("image", {
					"width": "100%",
					"height": "100%",
					"href": bckImgURI
				}, svgMain);
			}
			var logo = logoSVG.cloneNode(true);
			svgMain.appendChild(logo);
			var meta = SVGNode("metadata", {}, svgMain);
			meta.innerHTML = " <rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:rdfs='http://www.w3.org/2000/01/rdf-schema#' xmlns:dc='http://purl.org/dc/elements/1.1/'> <rdf:Description> <dc:creator>MandoCreator</dc:creator> <dc:publisher>https://www.mandocreator.com</dc:publisher> <dc:description>Your Beskar'gam design - created by MandoCreator</dc:description> <dc:format>image/svg+xml</dc:format> <dc:type>Image</dc:type> <dc:title>MandoCreator - Ner Berskar'gam</dc:title> <dc:date>" + (new Date).toISOString() + "</dc:date> </rdf:Description> </rdf:RDF>";
			return svgMain;
		},
		attach: function (a, type) {
			var blobURL;
			var isSetUp = false;
			a.addEventListener("click", function() {
				if (!isSetUp) return;
				setTimeout(function() {
					URL.revokeObjectURL(blobURL)
					isSetUp = false;
				}, 500);
			});
			a.setAttribute("type", type);
			if (type === "image/svg+xml") {
				var self = this;
				a.addEventListener("click", function () {
					var bck = self.Background;
					bck.appendChild(SVGFromEditor());
					var str = xml.serializeToString(bck);
					var document = "<?xml version='1.0' encoding='UTF-8'?>" + str;
					blobURL = URL.createObjectURL(new Blob([document]));
					this.setAttribute("href", blobURL);
				});
			} else {
				a.addEventListener("click", function (event) {
					if (isSetUp) {
						prepareCanvas(bckImgURI);
						return true;
					}
					event.preventDefault();
					img.onload = function () {
						canvasCtx.drawImage(this, 0, 0);
						canvas.toBlob(function (blob) {
							blobURL = URL.createObjectURL(blob);
							a.setAttribute("href", blobURL);
							isSetUp = true;
							a.click();
						}, "image/jpeg");
					}
					img.src = svg2img(SVGFromEditor(), canvas.width, canvas.height);
				});
			}
		}
	}
}
