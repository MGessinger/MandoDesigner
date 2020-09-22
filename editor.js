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
	this.node = n;
	return n;
}

function ColorPicker (affectedObject, parentName) {
	var parent = find(parentName + "Colors");
	if (!parent) {
		var total = new DOMNode("div", {id: parentName + "Options", class: "option-list"}, find("colors"));
		var h = new DOMNode("p", {class: "option-name"}, total);
		h.innerText = parentName + " Options:";
		parent = new DOMNode("div", {id: parentName + "Colors", class: "color-list"}, total);
	}

	var label = affectedObject.id + "Color";
	var p = new DOMNode("input", {type: "color", id: label, class: "color-picker", value: "#ffffff"}, parent);
	var l = new DOMNode("label", {for: label, class: "color-label"}, parent);

	var input = function () {
		affectedObject.setAttribute("fill", p.value);
		l.innerHTML = affectedObject.id + "<br />" + p.value;
	}
	p.addEventListener("input", input);
	affectedObject.addEventListener("click", redirectTo(p));
	input()
}

function ArmorGroup (name, fullname) {
	var id = name + "Style"
	var parent = find("parts-list");
	var i = new DOMNode("input", {type: "radio", name: "armorpiece", class: "hidden", id: id}, parent);
	i.addEventListener("input", pickArmorPiece);
	var l = new DOMNode("label", {class: "armor-label", for: id}, parent);
	l.innerHTML = fullname;
	return i;
}

function MandoMaker (svg) {
	var groups = svg.getElementsByTagName("title");
	for (var i = 0; i < groups.length; i++) {
		var g = groups[i].parentNode;
		var fullname = groups[i].innerHTML;
		var name = fullname.split(/\s/)[0];
		var children = g.children;

		var radio = new ArmorGroup(name, fullname);
		g.addEventListener("click", redirectTo(radio));
		for (var j = 1; j < children.length; j++)
			new ColorPicker(children[j], name);
	}
	var first = find("parts-list").querySelector("[type = 'radio']");
	first.click();
}

function redirectTo(target) {
	return function () {
		target.focus();
		target.click();
	}
}

function toggleOptions () {
	find("colors").classList.toggle("options-expanded");
}

function pickArmorPiece () {
	var prev = find("colors").querySelector(".selected");
	if (prev)
		prev.classList.remove("selected");
	var name = this.id.replace("Style","Options");
	var now = find(name);
	now.classList.add("selected");
	find("selection-name").innerHTML = this.nextElementSibling.innerText;
}

function save () {
	var so = find("Mando");
	if (so.attributes['xmlns'] === undefined) {
		so.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	}
	if (so.attributes['xmlns:xlink'] === undefined) {
		so.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	}
	var svg = '<?xml version="1.0" encoding="UTF-8"?>' + so.outerHTML;
	var prot = 'data:image/svg+xml;charset=UTF-8';
	event.target.href = prot + ',' + encodeURIComponent(svg);
}
