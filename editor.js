/* MandoMaker: A rewrite */
"use strict";

var mandoa = {
	"Helmet"   :	"Buy'ce",
	"Neck"     :	"Ghet'bur",
	"Shoulder" :	"Bes'mabur",
	"Chest"    :	"Hal'cabur",
	"Heart"    :	"Kar'ta Beskar",
	"Abdomen"  :	"Sahr'tas",
	"Gauntlet" :	"Kom'rk",
	"Groin"    :	"Ven'cabur",
	"Thighs"   :	"Motun'bur",
	"Knees"    :	"Bes'lovik",
	"Shins"    :	"Tadun'bur",
	"Ankles"   :	"Cetar'bur",
	"Boots"    :	"Cetare",
	"Hands"    :	"Gaane"
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

function ColorPicker (affectedObject, parent) {
	var buttonID = sanitize(affectedObject.id) + "Color";

	var wrapper = DOMNode("div", {class: "color-wrapper"}, parent);

	var b = DOMNode("button", {class: "color-picker", id: buttonID}, wrapper);
	var l = DOMNode("label", {class: "color-label"}, wrapper);
	l.setAttribute("for", buttonID);
	var p = DOMNode("p", {class: "name"}, l);
	p.innerHTML = prettify(affectedObject.id);
	var c = DOMNode("p", {class: "color"}, l);

	var input = Picker.attach(b, c, affectedObject);
	var redirect = redirectTo(b);
	affectedObject.addEventListener("click", function() {
		if (event.defaultPrevented)
			return;
		redirect();
		event.preventDefault();
	});
	input("#FFFFFF")
	return wrapper;
}

function Checkbox (textNode, parent, on) {
	var id = parent.id + "Sync";
	var label = DOMNode("label", {id: id, class: "pseudo-checkbox group-title"}, parent);
	if (textNode.innerHTML) {
		label.appendChild(textNode);
		textNode.className = "title-text";
	} else {
		var labeltext = DOMNode("h3", {class: "title-text"}, label);
		labeltext.innerHTML = textNode;
	}
	var check = DOMNode("input", {type: "checkbox"}, label);
	check.checked = on;
	DOMNode("span", {class: "slider"}, label);
	return check;
}

function ArmorComponent (SVGNode, parent) {
	var cl = SVGNode.getAttribute("class");
	if (cl == "option")
		return;
	switch (SVGNode.tagName.toLowerCase()) {
		case "g":
			return ArmorGroup(SVGNode, parent);
		case "path":
		case "rect":
			return ColorPicker(SVGNode, parent);
		default:
			return true;
	}
}

function ApplianceSelect (SVGParent, optionsParent) {
	var options = SVGParent.querySelectorAll("#" + SVGParent.id + "> .option");
	if (!options || options.length == 0)
		return;
	var wrapper = DOMNode("div", {class: "select-wrapper"}, optionsParent);
	var select = DOMNode("select", {class: "component-select"}, wrapper);
	for (var i = 0; i < options.length; i++) {
		var fullName = options[i].id;
		var name = prettify(fullName);

		/* Create an option in the select, and a hidable color list */
		var opt = DOMNode("option", {class: "component-option", label: name, value: fullName}, select);
		opt.innerHTML = name;

		var san = sanitize(fullName);
		var col = DOMNode("div", {id: san + "Colors", class: "color-list"}, optionsParent);
		if (i === 0) {
			col.style.display = "";
			options[i].style.visibility = "visible";
		} else {
			col.style.display = "none";
		}

		var ch = options[i].children;
		if (!ch.length)
			ch = [options[i]];
		for (var j = 0; j < ch.length; j++)
			ArmorComponent(ch[j], col);
	}
	var colors = optionsParent.getElementsByClassName("color-list");
	var root = SVGParent.getRootNode();
	select.addEventListener("change", function() {
		for (var i = 0; i < options.length; i++)
			options[i].style.visibility = ""
		var on = root.getElementById(this.value);
		if (on)
			on.style.visibility = "visible";
		var id = sanitize(this.value) + "Colors"
		for (var i = 0; i < colors.length; i++)
			colors[i].style.display = "none";
		on = find(id);
		if (on)
			on.style.display = "";
	});
	return select;
}

function ArmorGroup (SVGNode, parent) {
	var ch = SVGNode.children;
	var unnamedChildren = true;
	for (var i = 0; i < ch.length; i++)
		unnamedChildren &= !(ch[i].id);
	if (unnamedChildren) {
		return ColorPicker(SVGNode, parent);
	}
	var optName = sanitize(SVGNode.id) + "Options";
	var list = DOMNode("div", {id: optName, class: "color-list"}, parent);

	var san = prettify(SVGNode.id);
	var title = DOMNode("h3", {class: "group-title"}, list);
	title.innerHTML = san;
	var mandoaTerm = mandoa[san];
	if (mandoaTerm) {
		var c = DOMNode("i", {}, title);
		c.innerHTML = "(" + mandoaTerm + ")";
	}

	var cls = SVGNode.getAttribute("class");
	var off = SVGNode.dataset.default === "off";
	if (cls === "optional") {
		var check = Checkbox(title, list, !off);
		check.addEventListener("change", function() {
			var display = this.checked ? "" : "none";
			SVGNode.style.display = display;
			wrapper.style.display = display;
		});
	}

	var wrapper = DOMNode("div", {class: "component-wrapper"}, list);
	for (var i = 0; i < ch.length; i++)
		ArmorComponent(ch[i], wrapper);
	ApplianceSelect(SVGNode, wrapper);
	if (off) {
		SVGNode.style.display = "none";
		wrapper.style.display = "none";
	}
	return list;
}

function ArmorPiece (g, fullName, list) {
	var sanitized = sanitize(fullName);
	var id = sanitized + "Options";
	var sync = find(id + "Sync");
	var wrap, synced;
	if (!sync) {
		sync = Checkbox("Sync Colors", list);
		wrap = DOMNode("div", {class: "color-list"}, list);
		var picker = ColorPicker(g, wrap);
		picker.style.display = "inline-block";
		synced = picker.firstElementChild;
	} else {
		wrap = sync.nextElementSibling;
		synced = wrap.getElementsByTagName("button")[0];
		var colorLabel = wrap.getElementsByClassName("color")[0];
		Picker.attach(synced, colorLabel, g);
		sync = sync.getElementsByTagName("input")[0];
	}
	wrap.style.display = "none"

	var radio = find(sanitized + "Style");
	g.addEventListener("click", redirectTo(radio));
	radio.onchange = switchToArmorPiece(list, fullName);

	var ch = g.children;
	for (var i = 0; i < ch.length; i++) {
		if (ch[i].getAttribute("class") === "optional")
			continue;
		ArmorComponent(ch[i], list);
	}
	for (var i = 0; i < ch.length; i++) {
		if (ch[i].getAttribute("class") !== "optional")
			continue;
		ArmorComponent(ch[i], list);
	}

	var buttons = list.getElementsByClassName("color-picker");
	var styled = g.querySelectorAll("[style]");
	sync.addEventListener("change", function() {
		console.log(this);
		if (this.checked) {
			console.log("Show");
			list.classList.add("synchronized");
			wrap.style.display = "block";
			for (var i = 0; i < styled.length; i++)
				styled[i].style.fill = "";
		} else {
			console.log("Hide");
			list.classList.remove("synchronized");
			wrap.style.display = "none";
			for (var i = 0; i < buttons.length; i++)
				buttons[i].style.background = synced.style.background;
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
	var types = document.getElementsByClassName("armor-types");
	var typeName = now.id.replace("Options","Types");
	var type = find(typeName);
	return function() {
		var components = p.children;
		for (var i = 0; i < components.length; i++)
			components[i].classList.remove("selected");
		now.classList.add("selected");
		sel.innerHTML = this.value;
		for (var i = 0; i < types.length; i++)
			types[i].classList.remove("selected");
		var title = find("variants");
		if (!type)
			return title.style.display = "none";
		title.style.display = "";
		type.classList.add("selected");
	}
}

function switchToArmorVariant (groupName, variantName) {
	var sanitized = sanitize(groupName);
	var radio = find(sanitized + "Style");
	var old = find(groupName + "_Current");
	var parent = old.parentNode;

	var id = sanitize(groupName) + "Options";
	var list = find(id);
	list.innerHTML = "";
	list.className = "option-list selected";
	loadSVG (groupName + "_" + variantName, function(n) {
		parent.replaceChild(n, old);
		n.id = groupName + "_Current";
		ArmorPiece(n, groupName, list);
		radio.checked = false;
		radio.click();
	});
}

function toggleOptions () {
	find("options").classList.toggle("options-collapsed");
}

function encodeSVG (svg) {
	var san = svg.replace(/\s+/g," ").replace(/"/g,"'")
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

function setupMando (body) {
	function def (groupName) {
		loadSVG(groupName, function () { switchToArmorVariant(groupName, "Classic"); });
	}
	loadSVG(body, function (svg) {
		var main = find("editor");
		var old_svg = main.firstElementChild;
		if (old_svg)
			main.replaceChild(svg, old_svg);
		else
			main.appendChild(svg);

		function findLocal(st) {
			return svg.getElementById(st);
		}
		ArmorPiece(findLocal("Gauntlet"), "Upper Body", find("UpperBodyOptions"));
		def("Helmet");
		def("Upper-Body");
		def("Lower-Body");
		ArmorPiece(findLocal("Back"), "Accessories", find("AccessoriesOptions"));
		ArmorPiece(findLocal("Waist-Accessories"), "Accessories", find("AccessoriesOptions"));
		ArmorPiece(findLocal("Body"), "Flight Suit", find("FlightSuitOptions"));
		ArmorPiece(findLocal("Belts"), "Flight Suit", find("FlightSuitOptions"));
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
