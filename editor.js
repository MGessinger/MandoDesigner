/* MandoMaker: A rewrite */
"use strict";

function find (st) {
	return document.getElementById(st);
}

function sanitize (str) {
	return str.replace(/\W/g,"");
}

function prettify (str) {
	var shortName = str.split("_")[0];
	return shortName.replace(/-/g, " ");
}

function DOMNode (type, props, parent) {
	var n = document.createElement(type);
	for (var p in props)
		n.setAttribute(p, props[p]);
	if (parent) {
		var old = parent.querySelector('#' + props["id"]);
		if (old) {
			n = old;
			n.innerHTML = "";
		}
		else
			parent.appendChild(n);
	}
	return n;
}

function loadSVGFromServer(name, onload) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "images/" + name + ".svg");
	xhr.onload = function () {
		if (this.status !== 200)
			return;
		var svg = this.responseXML.firstElementChild;
		var main = find("editor")
		main.appendChild(svg);
		if (onload)
			onload(svg);
	};
	xhr.send();
}

function ColorList (groupName, total) {
	return DOMNode("div", {id: sanitize(groupName) + "Colors", class: "color-list"}, total);
}

function ColorPicker (affectedObject, parent) {
	var wrapper = DOMNode("div", {class: "color-wrapper"}, parent);

	var buttonID = sanitize(affectedObject.id) + "Color";
	var b = DOMNode("button", {class: "color-picker", id: buttonID}, wrapper);
	var l = DOMNode("label", {class: "color-label", for: buttonID}, wrapper);

	var shortName = prettify(affectedObject.id);
	var input = function (hex) {
		b.style.background = hex;
		affectedObject.setAttribute("fill", hex);
		l.innerHTML = "<p class='name'>" + shortName + "<p class='color'>" + hex;
	}
	Picker.attach(b, input, affectedObject);
	affectedObject.addEventListener("click", redirectTo(b));
	input("#FFFFFF")
	return b;
}

function ArmorComponent (SVGNode, parent) {
	switch (SVGNode.tagName.toLowerCase()) {
		case "g":
			var cls = SVGNode.getAttribute("class");
			if (cls === "optional")
				return ArmorOptional(SVGNode, parent.parentNode);
			var ch = SVGNode.children;
			var namedChildren = 0;
			for (var i = 0; i < ch.length; i++)
				namedChildren += !!(ch[i].id);
			if (namedChildren && ch.length >= 2) {
				parent = DOMNode("div", {class: "separator"}, parent);
				DOMNode("p", {}, parent).innerHTML = prettify(SVGNode.id) + ":";
			}
			if (namedChildren != ch.length)
				ColorPicker(SVGNode, parent);
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
	var select = DOMNode("select", {class: "component-select"}, optionsParent);
	DOMNode("option", {class: "component-option", label: "None", value: "", selected: true}, select);
	for (; options.length != 0;) {
		var fullName = options[0].textContent;
		var name = prettify(fullName);
		var opt = DOMNode("option", {class: "component-option", label: name, value: fullName}, select);

		var component = find(fullName);
		SVGParent.replaceChild(component, options[0]);
		component.setAttribute("class","option");
		component.style.display = "none";
		var ch = component.children;
		if (!ch.length)
			ch = [component];
		var col = ColorList(fullName, optionsParent);
		col.style.display = "none";
		for (var j = 0; j < ch.length; j++)
			ArmorComponent(ch[j], col);
	}
	select.addEventListener("change", function() {
		var components = SVGParent.getElementsByClassName("option");
		for (var i = 0; i < components.length; i++)
			components[i].style.display = "none";
		var on = find(this.value);
		if (on)
			on.style.display = "";
		var colors = optionsParent.getElementsByClassName("color-list");
		var id = sanitize(this.value) + "Colors"
		for (var i = 0; i < colors.length; i++)
			colors[i].style.display = (colors[i].id === id) ? "" : "none";
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

	var children = g.children;
	if (!children.length)
		children = [g];

	var col = ColorList(fullName, list);
	for (var j = 0; j < children.length; j++)
		ArmorComponent(children[j], col);

	var sanitized = sanitize(fullName);
	var id = sanitized + "Style";
	var radio = find(sanitized + "Style");
	g.addEventListener("click", redirectTo(radio));
	radio.onchange = switchToArmorPiece(list, fullName);
}

function MandoMaker (svg) {
	var groups = svg.getElementsByTagName("title");
	var radios = find("parts-list");
	for (var i = 0; i < groups.length; i++) {
		var fullName = groups[i].innerHTML;
		ArmorGroup(groups[i].nextElementSibling, fullName);
	}

	var typeLists = document.getElementsByClassName("armor-types");
	for (var i = 0; i < typeLists.length; i++) {
		var ch = typeLists[i].children;
		var fullName = typeLists[i].dataset.armorType;
		var shortName = fullName.split(/\W/)[0];
		for (var j = 0; j < ch.length; j++) {
			ch[j].addEventListener("click", function () {
				var old = find(shortName);
				var newName = this.dataset.name;
				var n = find(newName).cloneNode(true);
				var parent = old.parentNode;
				parent.replaceChild(n, old);
				n.id = shortName;
				ArmorGroup(n, fullName);
			});
		}
	}
	var first = radios.firstElementChild;
	first.checked = false;
	first.click();
}

function redirectTo(target) {
	return function (event) {
		target.focus();
		target.click();
	}
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

function toggleOptions () {
	find("colors").classList.toggle("options-collapsed");
}

function setDownloader (bck) {
	var xml = new XMLSerializer();
	var svg = find("Mando");
	return function() {
		var background = bck.cloneNode(true);
		var copy = svg.cloneNode(true);
		background.appendChild(copy);
		var str = xml.serializeToString(background);
		var data = '<?xml version="1.0" encoding="UTF-8"?>' + str;
		this.setAttribute("href",'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(data));
		var self = this;
		setTimeout(function() {self.setAttribute("href", "#");});
	};
}

function setupStorage () {
	loadSVGFromServer('Full-Kit', MandoMaker);
	loadSVGFromServer('Helmets');
	var useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
	toggleColorScheme(useDarkMode);
	find("color-scheme-picker").checked = useDarkMode;
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
	var bck = find(bckName);
	var a = find("download");
	var main = find("editor");
	if (!bck)
		loadSVGFromServer(bckName, function(svg) {
			a.onclick = setDownloader(svg);
			var img = svg.getElementById("image");
			main.style.backgroundImage = "url(" + img.getAttribute("href") + ")";
		});
	else {
		a.onclick = setDownloader(bck);
		var img = bck.getElementById("image");
		main.style.backgroundImage = "url(" + img.getAttribute("href") + ")";
	}
	var use = find("title");
	use.setAttribute("href", titleName);
}

function loadImage (input) {
	var files = input.files;
	if (files.length == 0)
		return;
	var reader = new FileReader();
	reader.onloadend = function() {
		var res = this.result;
		var main = find("editor");
		main.style.backgroundImage = "url(" + res + ")";
		var bck = find("BackgroundLight") || find("BackgroundDark");
		var customBck = bck.cloneNode(true);
		customBck.id = "Custom";
		var img = customBck.getElementsByTagName("image")[0];
		img.setAttribute("href", res);
		find("download").onclick = setDownloader(customBck);
	}
	reader.readAsDataURL(files[0]);
}
