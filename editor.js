/* MandoMaker: A rewrite */
"use strict";

function find (st) {
	return document.getElementById(st);
}

function DOMNode (type, props, parent) {
	var n = document.createElement(type);
	for (var p in props)
		n.setAttribute(p, props[p]);
	if (parent)
		parent.appendChild(n);
	return n;
}

function ColorList (groupName, total) {
	return DOMNode("div", {id: groupName + "Colors", class: "color-list"}, total);
}

function OptionsList (groupName) {
	var total = DOMNode("div", {id: groupName + "Options", class: "option-list"}, find("colors"));
	var h = DOMNode("p", {class: "option-name"}, total);
	h.innerText = groupName + " Options:";
	return total;
}

function ColorPicker (affectedObject, parent) {
	var wrapper = DOMNode("div", {class: "color-wrapper"}, parent);

	var buttonID = affectedObject.id + "Color";
	var b = DOMNode("button", {class: "color-picker", id: buttonID}, wrapper);
	var l = DOMNode("label", {class: "color-label", for: buttonID}, wrapper);

	var shortName = affectedObject.id.split("_")[0];
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
			if (SVGNode.className.baseVal === "optional")
				return ArmorOptional(SVGNode, parent.parentNode);
			/* Fall-Through */
		case "path":
			return ColorPicker(SVGNode, parent);
		default:
			return;
	}
}

function ApplianceSelect (SVGNode, parent) {
	var select = DOMNode("select", {class: "component-select"}, parent);
	DOMNode("option", {class: "component-option", label: "No device", value: "", selected: true}, select);
	var desc = SVGNode.firstElementChild;
	var opts = desc.textContent.split(",");
	for (var i = 0; i < opts.length; i++) {
		var name = opts[i].split("_")[0];
		var opt = DOMNode("option", {class: "component-option", label: name, value: opts[i]}, select);

		var component = find(opts[i]);
		var ch = component.children;
		if (ch.length === 0)
			ch = [component];
		var col = ColorList(opts[i], parent);
		col.style.display = "none";
		for (var j = 0; j < ch.length; j++)
			ArmorComponent(ch[j], col);
	}
	select.addEventListener("change", function() {
		SVGNode.setAttribute("href", "#" + this.value);
		var colors = parent.getElementsByClassName("color-list");
		var id = this.value + "Colors"
		for (var i = 0; i < colors.length; i++)
			colors[i].style.display = (colors[i].id === id) ? "" : "none";
	});
	return select;
}

function ArmorOptional (SVGNode, parent) {
	var optName = SVGNode.id.replace(/\W/g,"") + "Options";
	var list = DOMNode("div", {id: optName, class: "component-list"}, parent);

	var d = DOMNode("div", {class: "component-check"}, list);
	var l = SVGNode.id + "Checked";
	var check = DOMNode("input", {type: "checkbox", id: l, checked: "true"}, d);
	var label = DOMNode("label", {for: l}, d);
	label.innerHTML = SVGNode.id.replace(/&/g," ");

	var ch = SVGNode.children;
	var wrapper = DOMNode("div", {class: "component-wrapper"}, list);
	for (var i = 0; i < ch.length; i++)
		ArmorComponent(ch[i], wrapper);
	ApplianceSelect(SVGNode.querySelector("use"), wrapper);

	check.addEventListener("change", function() {
		var display = this.checked ? "" : "none";
		SVGNode.style.display = display;
		wrapper.style.display = display;
	});
}

function ArmorGroup (g, fullname, radios, list) {
	var children = g.children;
	if (children.length === 0)
		children = [g];
	var sanitizedName = fullname.replace(/\W/g,"");

	var col = ColorList(sanitizedName, list);
	for (var j = 0; j < children.length; j++)
		ArmorComponent(children[j], col);

	var id = sanitizedName + "Style";
	var radio = find(sanitizedName + "Style");
	if (!radio) {
		radio = DOMNode("input", {type: "radio", name: radios.id, id: id}, radios);
		var label = DOMNode("label", {class: "armor-label", for: id}, radios);
		label.innerHTML = fullname.split("_")[0];
	}
	g.addEventListener("click", redirectTo(radio));
	return radio;
}

function MandoMaker (svg, bucketVariant) {
	if (bucketVariant) {
		var bucket = find(bucketVariant);
		var oldBucket = svg.replaceChild(bucket, svg.firstElementChild);
		find("Vault").appendChild(oldBucket);
	}
	var groups = svg.getElementsByTagName("title");
	var radios = find("parts-list");
	for (var i = 0; i < groups.length; i++) {
		var fullName = groups[i].innerHTML;
		var sanitizedName = fullName.split(/\W/)[0];
		var list = OptionsList(sanitizedName);
		var radio = ArmorGroup(groups[i].parentNode, fullName, radios, list);
		radio.addEventListener("input", pickArmorPiece(list, sanitizedName));
	}

	find("download").addEventListener("click", function() {
		var background = find("Background").cloneNode(true);
		var copy = svg.cloneNode(true);
		background.appendChild(copy);
		var logo = find("title").cloneNode(true);
		background.appendChild(logo);
		var str = (new XMLSerializer).serializeToString(background);
		var data = '<?xml version="1.0" encoding="UTF-8"?>' + str;
		this.setAttribute("href",'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(data));
	});

	var first = radios.querySelector("input");
	first.checked = false;
	first.click();
}

function redirectTo(target) {
	return function (event) {
		target.focus();
		target.click();
	}
}

function pickArmorPiece (list, name) {
	var now = find(name + "Options");
	var sel = find("selection-name");
	var p = list.parentNode;
	return function() {
		var components = p.children;
		for (var i = 0; i < components.length; i++)
			components[i].classList.remove("selected");
		now.classList.add("selected");
		sel.innerHTML = this.nextElementSibling.firstChild.data;
	}
}

function toggleOptions () {
	find("colors").classList.toggle("options-collapsed");
}
