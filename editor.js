/* MandoMaker: A rewrite */
"use strict";

function find (st) {
	return document.getElementById(st);
}

function loadSVG (name, onload, args) {
	var local = find(name);
	if (local) {
		var copy = local.cloneNode(true);
		return onload(copy, args);
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "images/" + name + ".svg");
	xhr.onload = function () {
		if (this.status !== 200)
			return;
		var svg = this.responseXML.documentElement;
		svg.setAttribute("id", name);

		/* Assign classes based on ID components */
		var options = svg.querySelectorAll("[id*=Option]");
		for (var i = 0; i < options.length; i++)
			options[i].setAttribute("class", "option");
		var options = svg.querySelectorAll("[id*=Toggle]");
		for (var i = 0; i < options.length; i++) {
			options[i].setAttribute("class", "toggle");
			if (options[i].id.includes("Off"))
				options[i].style.display = "none";
		}

		/* Store it in the Vault for later use */
		var vault = find("vault");
		vault.appendChild(svg);
		var copy = svg.cloneNode(true);
		onload(copy, args);
	};
	xhr.send();
}

function makeIdentifier (str) {
	var clean = str.replace(/\W/g,"");
	var components = clean.split("_");
	return components[0];
}

function prettify (str) {
	var components = str.split("_");
	var shortName = components[0];
	return shortName.replace(/-/g, " ");
}

function syncGroup (id) {
	if (id.includes("Secondary"))
		return "Secondary";
	else if (id.includes("Accent"))
		return "Accents";
	return "Primary";
}

function DOMNode (type, props, parent) {
	var n = document.createElement(type);
	for (var p in props)
		n.setAttribute(p, props[p]);
	if (parent)
		parent.appendChild(n);
	return n;
}

function redirectClickTo(target) {
	return function () {
		target.click();
	}
}

function ColorPicker (affectedObject, parent) {
	var wrapper = DOMNode("div", {class: "color_wrapper"}, parent);

	var buttonID = makeIdentifier(affectedObject.id) + "Color";
	var cl = "color_picker " + syncGroup(affectedObject.id);
	var b = DOMNode("button", {class: cl, id: buttonID}, wrapper);

	var l = DOMNode("label", {class: "color_label hidden", for: buttonID}, wrapper);
	var p = DOMNode("p", {class: "name"}, l);
	p.innerText = prettify(affectedObject.id);
	var c = DOMNode("p", {class: "color"}, l);

	Picker.attach(b, c, affectedObject);
	return b;
}

function toggleSlide (slide) {
	slide.classList.toggle("selected");
	var folder = slide.parentNode.parentNode;
	folder.classList.toggle("overview");
}

function toggleSubslide (subslide, SVGNode) {
	return function () {
		if (this.checked) {
			subslide.style.display = "";
			SVGNode.style.display = "";
		} else {
			subslide.style.display = "none";
			SVGNode.style.display = "none";
		}
	}
}

function synchronize (category, div) {
	var folder_content = div.previousElementSibling;
	var colorPickers = folder_content.getElementsByClassName("color_picker");
	var syncedPickers = div.getElementsByTagName("button");
	if (event.target.checked) {
		div.setAttribute("class", "slide_content");
		div.style.display = "unset";
		folder_content.classList.add("synchronized");
	} else {
		div.setAttribute("class", "synchronized");
		folder_content.classList.remove("synchronized");
		for (var i = 0; i < colorPickers.length; i++) {
			var p = colorPickers[i];
			var idx = 0;
			if (p.classList.contains("Secondary"))
				idx = 1;
			else if (p.classList.contains("Accents"))
				idx = 2;
			p.style.background = syncedPickers[idx].style.background;
		}
	}
}

function prepareParent (SVGNode, parent) {
	var name = makeIdentifier(SVGNode.id);
	var globalList = find(name + "Colors");
	if (globalList) {
		parent = globalList;
		globalList.innerHTML = "";
		var p = DOMNode("p", {class: "option_name hidden"}, globalList);
		p.innerText = prettify(SVGNode.id) + " Options:";
	}
	if (SVGNode.getAttribute("class") === "toggle") {
		if (parent.children.length > 1) // 1 for option-name built before
			DOMNode("p", {class: "separator"}, parent);
		var p = DOMNode("label", {class: "pseudo_checkbox hidden"}, parent);
		var labelText = DOMNode("span", {class: "pseudo_label"}, p);
		labelText.innerText = prettify(SVGNode.id);
		var check = DOMNode("input", {type: "checkbox"}, p);
		DOMNode("span", {class: "slider"}, p);
		parent = DOMNode("div", {style: "display:none", class: "subslide"}, parent);

		var defaultOn = !SVGNode.id.includes("Off");
		var toggle = toggleSubslide(parent, SVGNode);
		check.checked = defaultOn;
		toggle.bind({checked: defaultOn})();
		check.addEventListener("change", toggle);
	}
	return parent;
}

function buildIOSettings (SVGNode, category, parent) {
	if (!SVGNode.id)
		return;
	var p = ColorPicker(SVGNode, parent);
	var redirectToPicker = redirectClickTo(p);

	var synced = find(category + syncGroup(SVGNode.id) + "Color");
	if (synced)
		Picker.attach(synced, null, SVGNode);

	var radio = find(category + "Settings");
	var redirectToRadio = redirectClickTo(radio);
	if (radio.checked)
		redirectToRadio();

	var folder = find(category + "Options");
	var folder_content = folder.getElementsByClassName("folder_content")[0];
	var slides = folder.getElementsByClassName("slide");
	SVGNode.addEventListener("click", function() {
		redirectToRadio();
		for (var i = 0; i < slides.length; i++) {
			if (slides[i].contains(p)) {
				var but = slides[i].firstElementChild;
				redirectClickTo(but)();
			}
		}
		if (folder_content.classList.contains("synchronized"))
			redirectClickTo(synced)();
		else
			redirectToPicker();
	});
}

function buildAddonSelect (options, category, parent) {
	var wrapper = DOMNode("div", {class: "select_wrapper hidden"}, parent);
	var select = DOMNode("select", {class: "component_select"}, wrapper);
	var colors = [];
	var last = options.length-1;
	for (var i = last; i >= 0; i--) {
		var fullName = options[i].id;
		var name = prettify(fullName);
		options[i].setAttribute("class", "option");

		/* Create an option in the select, and a hidable color list */
		var opt = DOMNode("option", {class: "component_option", label: name, value: fullName}, select);
		opt.innerText = name;

		var san = makeIdentifier(fullName);
		var col = DOMNode("div", {id: san + "SubColors"}, parent);
		colors.push(col);
		if (i === last) {
			options[i].style.visibility = "visible";
		} else {
			col.style.display = "none";
		}
		buildAllSettings(options[i], category, col);
	}
	select.addEventListener("change", function() {
		for (var i = 0; i < options.length; i++) {
			if (options[i].id === this.value)
				options[i].style.visibility = "visible";
			else
				options[i].style.visibility = "";
		}

		var id = makeIdentifier(this.value) + "SubColors"
		for (var i = 0; i < colors.length; i++) {
			if (colors[i].id === id)
				colors[i].style.display = "";
			else
				colors[i].style.display = "none";
		}
	});
	return select;
}

function buildAllSettings (SVGNode, category, parent) {
	parent = prepareParent(SVGNode, parent);
	var ch = SVGNode.children;
	var hasUnnamedChild = !ch.length;
	for (var i = 0; i < ch.length; i++)
		hasUnnamedChild |= !ch[i].id;
	if (hasUnnamedChild) {
		if (ch.length == 0 && SVGNode.tagName == "g")
			return;
		buildIOSettings(SVGNode, category, parent);
	} else {
		var options = [];
		var toggle = [];
		for (var i = 0; i < ch.length; i++) {
			var className = ch[i].getAttribute("class");
			if (className == "option")
				options.push(ch[i]);
			else if (className == "toggle")
				toggle.push(ch[i]);
			else
				buildAllSettings(ch[i], category, parent);
		}
		if (options.length > 0)
			buildAddonSelect(options, category, parent);
		/* defer toggles to the very last */
		for (var i = 0; i < toggle.length; i++) 
			buildAllSettings(toggle[i], category, parent);
	}
}

function buildVariableSettings (category, pieceName, variantName) {
	var fullyQualifiedName = pieceName + "_" + variantName;
	var identifier = makeIdentifier(pieceName);
	var wrapper = find(identifier + "_Current");
	var ref = find(fullyQualifiedName);
	var n = ref.cloneNode(true);
	wrapper.appendChild(n);

	var parent = prepareParent(n);
	buildAddonSelect(n.children, category, parent);
}

function onload () {
	var femaleSelector = find("female");
	setSex(femaleSelector.checked);
	var useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
	setColorScheme(useDarkMode);
	find("color_scheme_picker").checked = useDarkMode;
}

function openArmorFolder (category) {
	var now = find(category + "Options");
	var components = document.getElementsByClassName("folder");
	for (var i = 0; i < components.length; i++)
		components[i].classList.remove("selected");
	now.classList.add("selected");
	var slides = now.getElementsByClassName("slide");
	for (var i = 0; i < slides.length; i++)
		slides[i].classList.remove("selected");
	if (slides.length)
		now.classList.add("overview");
}

function switchToArmorVariant (category, pieceName, variantName) {
	var old = find(pieceName + "_Current");
	var parent = old.parentNode;
	var n = find(pieceName + "_" + variantName);
	n = n.cloneNode(true);
	n.id = pieceName + "_Current";
	parent.replaceChild(n, old);
	buildAllSettings(n, category);
}

function toggleOptions () {
	find("settings").classList.toggle("settings_collapsed");
}

function encodeSVG (svg) {
	var san = svg.replace(/\s+/g," ").replace(/"/g,"'");
	return encodeURIComponent(san);
}

function setDownloader (bck) {
	var main = find("editor");
	var xml = new XMLSerializer();
	return function() {
		var background = bck.cloneNode(true);
		var svg = main.getElementsByTagName("svg")[0];
		var copy = svg.cloneNode(true);
		background.appendChild(copy);
		var str = xml.serializeToString(background);
		var data = "<?xml version='1.0' encoding='UTF-8'?>" + str;
		this.setAttribute("href",'data:image/svg+xml;charset=UTF-8,' + encodeSVG(data));
		var self = this;
		setTimeout(function() {self.setAttribute("href", "#");});
	};
}

function setupMando (svg, sexSuffix) {
	var main = find("editor");
	var old_svg = main.firstElementChild;
	if (old_svg)
		main.replaceChild(svg, old_svg);
	else
		main.appendChild(svg);
	var scale = find("zoom");
	zoom(scale.value/100);

	function findLocal(st) {
		return svg.getElementById(st);
	}
	loadSVG("Helmets", function() { switchToArmorVariant("Helmet", "Helmet", "Classic"); });
	loadSVG("Upper-Armor_" + sexSuffix, function(svg) {
		switchToArmorVariant("UpperArmor", "Chest", "Classic_" + sexSuffix)
		var subgroups = ["Shoulder","Biceps","Gauntlets"];
		for (var i = 0; i < subgroups.length; i++) {
			buildVariableSettings("UpperArmor", "Left-" + subgroups[i], sexSuffix);
			buildVariableSettings("UpperArmor", "Right-" + subgroups[i], sexSuffix);
		}
	});
	loadSVG("Lower-Armor_" + sexSuffix, function(svg) {
		switchToArmorVariant("LowerArmor", "Waist", "M");
		buildVariableSettings("LowerArmor", "Groin", sexSuffix);
		var subgroups = ["Thigh", "Knee", "Shin", "Ankle"];
		for (var i = 0; i < subgroups.length; i++) {
			buildVariableSettings("LowerArmor", "Left-" + subgroups[i], sexSuffix);
			buildVariableSettings("LowerArmor", "Right-" + subgroups[i], sexSuffix);
		}
	});
	buildAllSettings(findLocal("Back"), "Back");
	buildAllSettings(findLocal("Soft-Parts"), "FlightSuit");
}

function setColorScheme (useDark) {
	var className = "light_mode";
	var bckName = "BackgroundLight";
	var logoName = "#titleLight";
	if (useDark) {
		className = "dark_mode";
		bckName = "BackgroundDark";
		logoName = "#titleDark";
	}
	document.body.className = className;
	var a = find("download");
	var main = find("editor");
	loadSVG(bckName, function(svg) {
		a.onclick = setDownloader(svg);
		var img = svg.getElementById("image");
		main.style.backgroundImage = "url(" + img.getAttribute("href") + ")";
	});
	var use = find("title");
	use.setAttribute("href", logoName);
}

function setSex (female) {
	var body, sexSuffix;
	var settings = find("settings");
	if (female) {
		body = "Female-Body";
		sexSuffix = "F";
		settings.className = "settings_column settings_collapsed female";
	} else {
		body = "Male-Body";
		sexSuffix = "M";
		settings.className = "settings_column settings_collapsed male";
	}
	loadSVG(body, setupMando, sexSuffix);
}

function loadImage (input) {
	var files = input.files;
	if (files.length == 0)
		return;
	var main = find("editor");
	var bck;
	var theme = document.body.className;
	if (theme.includes("dark"))
		bck = find("BackgroundDark");
	else
		bck = find("BackgroundLight");
	var customBck = bck.cloneNode(true);
	customBck.id = "Custom";
	var img = customBck.getElementsByTagName("image")[0];

	var reader = new FileReader();
	if (files[0].type.includes("svg")) {
		reader.onload = function () {
			var svg = DOMNode("svg");
			svg.innerHTML = this.result;
			var newSVG = svg.firstElementChild;
			customBck.replaceChild(newSVG, img);
			find("download").onclick = setDownloader(customBck);

			var href = 'url("data:image/svg+xml,' + encodeSVG(this.result) + '")';
			main.style.backgroundImage = href
		}
		reader.readAsText(files[0]);
	}
	else {
		reader.onload = function() {
			var res = this.result;
			main.style.backgroundImage = "url(" + res + ")";
			img.setAttribute("href", res);
			find("download").onclick = setDownloader(customBck);
		}
		reader.readAsDataURL(files[0]);
	}
}

function displayForm (show, form) {
	form = form || find("contact");
	form.style.display = show ? "" : "none";
}

function zoom (scale) {
	var main = find("editor");
	var svg = main.children[0];
	svg.removeAttribute("transform");
	var rect = svg.getBoundingClientRect()
	var t = (rect.height*scale - window.innerHeight)/2;
	svg.setAttribute("transform", "translate(0 " + t + ") scale(" + scale + ")");
}
