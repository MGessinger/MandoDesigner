"use strict";

function loadImage (input) {
	var files = input.files;
	if (files.length == 0)
		return;
	var main = find("editor");
	var theme = document.body.className;

	var reader = new FileReader();
	if (files[0].type.includes("svg")) {
		reader.onload = function () {
			D.Background = "data:image/svg+xml," + encodeSVG(this.result);
		}
		reader.readAsText(files[0]);
	} else {
		reader.onload = function() {
			D.Background = this.result;
		}
		reader.readAsDataURL(files[0]);
	}

	var reset = find("reset_wrapper");
	reset.style.display = "";
}

function recreateMando (svg, suffix) {
	variants = {};
	resetSettings();

	var walker = document.createNodeIterator (
		svg,
		NodeFilter.SHOW_ELEMENT,
		{ acceptNode: function (node)
			{
				if (!node.id)
					return NodeFilter.FILTER_REJECT;
				return NodeFilter.FILTER_ACCEPT;
			}
		}
	);

	var node;
	while (node = walker.nextNode()) {
		var id = node.id;
		if (node.style.fill) {
			var bn = buttonName(id) + "Color";
			settings[bn] = node.style.fill;
		}
		var cls = node.getAttribute("class");
		var neutral = neutralize(id);
		if (cls == "toggle") {
			variants[neutral] = true;
		} else if (cls == "option") {
			var parent = node.parentNode;
			var parName = neutralize(parent.id) + "_Option";
			variants[parName] = neutral;
		} else if (!!cls && id.includes("Current")) {	/* Nonzero and not empty */
			var cat = id.replace("_Current", "");
			variants[cat] = neutralize(cls);
		}
	}
}

function reupload (input) {
	var files = input.files;
	if (!files || !files.length)
		return;
	var main = find("editor");

	var reader = new FileReader();
	reader.onload = function () {
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = this.result;
		svg = svg.firstElementChild;

		var mando = svg.lastElementChild;
		var img = svg.getElementsByTagName("image")[0];
		if (!mando || !img)
			return;

		var female = (mando.id === "Female-Body");
		if (female) {
			var sex_radio = find("female");
			sex_radio.checked = true;
			localStorage.setItem("female_sex", true);
		} else {
			var sex_radio = find("male");
			sex_radio.checked = true;
			localStorage.setItem("female_sex", false);
		}

		var theme = find("color_scheme_picker");
		var light_mode = !svg.getElementById("titleLight");
		theme.checked = light_mode;
		S.set.DarkMode(light_mode);

		recreateMando(mando, (female ? "_F" : "_M"));
		S.set.Sex(female, true);
		D.Background = img.getAttribute("href");
	};
	reader.readAsText(files[0]);
}
