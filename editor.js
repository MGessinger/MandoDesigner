/* MandoMaker: A rewrite */
"use strict";

var mandoa = {
	"Helmet": "Buy'ce",
	"Neck": "Ghet'bur",
	"Shoulder": "Bes'mabur",
	"Chest": "Hal'cabur",
	"Heart": "Kar'ta Beskar",
	"Abdomen": "Sahr'tas",
	"Gauntlet": "Kom'rk",
	"Groin": "Ven'cabur",
	"Thigh": "Motun'bur",
	"Knee": "Bes'lovik",
	"Shin": "Tadun'bur",
	"Ankle": "Cetar'bur"
}

function find (st) {
	return document.getElementById(st);
}

function sanitize (str) {
	return str.replace(/\W/g,"");
}

function prettify (str) {
	var shortName = str.split("_", 1)[0];
	return shortName.replace(/-/g, " ");
}

function DOMNode (type, props, parent) {
	var old = find(props.id);
	if (old) {
		var par = old.parentNode;
		par.removeChild(old);
	}
	var n = document.createElement(type);
	for (var p in props)
		n.setAttribute(p, props[p]);
	if (parent)
		parent.appendChild(n);
	return n;
}

function ColorList (groupName, total) {
	return DOMNode("div", {id: sanitize(groupName) + "Colors", class: "color-list"}, total);
}

function ColorPicker (affectedObject, parent) {
	var buttonID = sanitize(affectedObject.id) + "Color";

	var wrapper = DOMNode("div", {class: "color-wrapper"}, parent);

	var b = DOMNode("button", {class: "color-picker", id: buttonID}, wrapper);
	var l = DOMNode("label", {class: "color-label"}, wrapper);
	l.setAttribute("for", buttonID);
	var p = DOMNode("p", {class: "name"}, l);
	p.innerHTML = prettify(affectedObject.id);
	var c = DOMNode("p", {class: "color"}, l);

	var input = function (hex) {
		b.style.background = hex;
		affectedObject.style.fill = hex;
		c.innerHTML = hex;
	}
	Picker.attach(b, input);
	var redirect = redirectTo(b);
	affectedObject.addEventListener("click", function() {
		if (this.dataset.unsync === "true")
			return;
		redirect();
	});
	input("#FFFFFF")
	return wrapper;
}

function ArmorComponent (SVGNode, parent) {
	switch (SVGNode.tagName.toLowerCase()) {
		case "g":
			var cls = SVGNode.getAttribute("class");
			if (cls === "optional")
				return ArmorOptional(SVGNode, parent.parentNode);
			var san = prettify(SVGNode.id);
			var mandoaTerm = mandoa[san]
			if (mandoaTerm) {
				parent = DOMNode("div", {class: "separator"}, parent);
				var l = DOMNode("div", {class: "color-wrapper"}, parent);
				var n = DOMNode("p", {class: "name"}, l);
				n.innerHTML = prettify(SVGNode.id) + ":";
				var c = DOMNode("p", {class: "color"}, l);
				c.innerHTML = "(" + mandoaTerm + ")";
			}
			var namedChildren = SVGNode.firstElementChild.id;
			if (!namedChildren)
				return ColorPicker(SVGNode, parent);
			var ch = SVGNode.children;
			for (var i = 0; i < ch.length; i++)
				ArmorComponent(ch[i], parent);
			break;
		case "path":
		case "rect":
			if (!SVGNode.id)
				return false;
			return ColorPicker(SVGNode, parent);
		default:
			return true;
	}
}

function ApplianceSelect (SVGParent, optionsParent) {
	var options = SVGParent.getElementsByTagName("metadata");
	if (!options)
		return;
	var wrapper = DOMNode("div", {class: "select-wrapper"}, optionsParent);
	var select = DOMNode("select", {class: "component-select"}, wrapper);
	DOMNode("option", {class: "component-option", label: "None", value: "", selected: true}, select);
	for (; options.length != 0;) { /* As the components are replaced, the list shrinks. Thus, i must not be changed */
		var fullName = options[0].textContent;
		var component = find(fullName);
		var name = prettify(fullName);
		fullName += "_Real";

		SVGParent.replaceChild(component, options[0]);
		component.setAttribute("class","option");
		component.setAttribute("id", fullName);
		component.style.display = "none";
		var ch = component.children;
		if (!ch.length)
			ch = [component];

		DOMNode("option", {class: "component-option", label: name, value: fullName}, select);
		var col = ColorList(fullName, optionsParent);
		col.style.display = "none";
		for (var j = 0; j < ch.length; j++)
			ArmorComponent(ch[j], col);
	}
	var components = SVGParent.getElementsByClassName("option");
	var colors = optionsParent.getElementsByClassName("color-list");
	var root = SVGParent.getRootNode() || document;
	select.addEventListener("change", function() {
		for (var i = 0; i < components.length; i++)
			components[i].style.display = "none";
		var on = root.getElementById(this.value);
		if (on)
			on.style.display = "";
		var id = sanitize(this.value) + "Colors"
		for (var i = 0; i < colors.length; i++)
			colors[i].style.display = "none";
		on = root.getElementById(id);
		if (on)
			on.style.display = "";
	});
	return select;
}

function ArmorOptional (SVGNode, parent) {
	var optName = sanitize(SVGNode.id) + "Options";
	var list = DOMNode("div", {id: optName, class: "component-list"}, parent);

	var d = DOMNode("div", {class: "component-check"}, list);
	var l = SVGNode.id + "Checked";
	var check = DOMNode("input", {type: "checkbox", id: l, checked: "true"}, d);
	var label = DOMNode("label", {for: l, class: "color-label"}, d);
	label.innerHTML = prettify(SVGNode.id);

	var ch = SVGNode.children;
	var wrapper = DOMNode("div", {class: "component-wrapper"}, list);
	for (var i = 0; i < ch.length; i++)
		ArmorComponent(ch[i], wrapper);
	ApplianceSelect(SVGNode, wrapper);

	check.addEventListener("change", function() {
		var display = this.checked ? "" : "none";
		SVGNode.style.display = display;
		wrapper.style.display = display;
	});
}

function ArmorGroup (g, fullName) {
	var sanitized = sanitize(fullName);
	var list = DOMNode("div", {id: sanitized + "Options", class: "option-list"}, find("colors"));

	var check = DOMNode("div", {class: "component-check"}, list);
	var sync = DOMNode("input", {type: "checkbox", id: sanitized + "Sync"}, check);
	var label = DOMNode("label", {class: "color-label", for: sanitized + "Sync"}, check);
	label.innerHTML = "Sync Colors";
	g.dataset.unsync = "true";

	var radio = find(sanitized + "Style");
	g.addEventListener("click", redirectTo(radio));
	radio.onchange = switchToArmorPiece(list, fullName);

	var picker = ColorPicker(g, list);
	picker.style.display = "none";
	var synced = picker.firstElementChild;
	var col = ColorList(fullName, list);

	var children = g.children;
	for (var j = 0; j < children.length; j++)
		ArmorComponent(children[j], col);

	var buttons = list.getElementsByClassName("color-picker");
	sync.addEventListener("change", function() {
		if (this.checked) {
			g.setAttribute("class", "overrideFill");
			g.dataset.unsync = false;
			list.setAttribute("class", "option-list selected synchronized");
			picker.style.display = "unset";
		} else {
			g.setAttribute("class", "");
			g.dataset.unsync = true;
			list.setAttribute("class", "option-list selected");
			picker.style.display = "none";
			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.background = synced.style.background;
				buttons[i].click();
				buttons[i].click();
			}
		}
	});
}

function loadSVG (name, onload) {
	var local = find(name);
	if (local) {
		if (!onload)
			return;
		var copy = local.cloneNode(true);
		return onload(copy);
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "images/" + name + ".svg");
	xhr.onload = function () {
		if (this.status !== 200)
			return;
		var svg = this.responseXML.documentElement;
		svg.setAttribute("id", name);
		var parent = find("vault")
		parent.appendChild(svg);
		if (onload) {
			var copy = svg.cloneNode(true);
			onload(copy);
		}
	};
	xhr.send();
}

function redirectTo(target) {
	return function (event) {
		target.focus();
		target.click();
	}
}

function onload () {
	var femaleSelector = find("female");
	var body = femaleSelector.checked ? "Female-Body" : "Male-Body";
	setupMando(body);
	var useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
	toggleColorScheme(useDarkMode);
	find("color-scheme-picker").checked = useDarkMode;
}

function switchToArmorPiece (now) {
	var sel = find("selection-name");
	var p = now.parentNode;
	return function() {
		var components = p.children;
		for (var i = 0; i < components.length; i++)
			components[i].classList.remove("selected");
		now.classList.add("selected");
		sel.innerHTML = this.value;
	}
}

function switchToArmorVariant (groupName, variantName) {
	var sanitized = sanitize(groupName);
	var radio = find(sanitized + "Style");
	var old = find(groupName + "_Current");
	var parent = old.parentNode;
	loadSVG (groupName + "_" + variantName, function(n) {
		parent.replaceChild(n, old);
		n.id = groupName + "_Current";
		ArmorGroup(n, groupName);
		radio.checked = false;
		radio.click();
	});
}

function toggleOptions () {
	find("options").classList.toggle("options-collapsed");
}

function setDownloader (bck) {
	var xml = new XMLSerializer();
	return function() {
		var background = bck.cloneNode(true);
		var svg = find("Mando");
		var copy = svg.cloneNode(true);
		background.appendChild(copy);
		var str = xml.serializeToString(background);
		var data = '<?xml version="1.0" encoding="UTF-8"?>' + str;
		this.setAttribute("href",'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(data));
		var self = this;
		setTimeout(function() {self.setAttribute("href", "#");});
	};
}

function setupMando (body) {
	var def = function (groupName) {
		loadSVG(groupName, function () { switchToArmorVariant(groupName, "Classic"); });
	}
	loadSVG(body, function (svg) {
		var main = find("editor");
		var old_svg = main.firstElementChild;
		if (old_svg)
			main.replaceChild(svg, old_svg);
		else
			main.appendChild(svg);
		def("Helmet");
		def("Upper-Body");
	});
}

function toggleColorScheme (useDark) {
	var className = "light-mode"
	var bckName = "BackgroundLight";
	var titleName = "#titleLight";
	if (useDark) {
		className = "dark-mode";
		bckName = "BackgroundDark";
		titleName = "#titleDark";
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
	use.setAttribute("href", titleName);
}

function sanitizeSVG (svg) {
	var san = svg.replace(/\s+/g," ").replace(/"/g,"'")
	return encodeURIComponent(san);
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

			var href = 'url("data:image/svg+xml,' + sanitizeSVG(this.result) + '")';
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
