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
}

function newColorPicker (affectedObject, parentName) {
	var parent = find(parentName);
	if (!parent) {
		var node = new DOMNode("div", {id: parentName, class: "option-list"}, find("colors"));
		parent = node.node;
	}

	var label = affectedObject.id + "Color";
	var p = new DOMNode("input", {type: "color", id: label, class: "color-picker"}, parent);
	var l = new DOMNode("label", {for: label, class: "color-label"}, parent);

	var oninput = function () {
		affectedObject.setAttribute("fill", p.node.value);
		l.node.innerHTML = affectedObject.id + "<br />" + p.node.value;
	}
	p.node.addEventListener("input", oninput);
	oninput()
}

function MandoMaker (svg) {
	var groups = svg.getElementsByTagName("title");
	for (var i = 0; i < groups.length; i++) {
		var name = groups[i].innerHTML + "Colors";
		var children = groups[i].parentNode.children;
		for (var j = 1; j < children.length; j++)
			newColorPicker(children[j], name);
	}
	var checked = find("parts-list").querySelector(":checked");
	pickArmorPiece(checked);
}

function pickArmorPiece (input) {
	var prev = find("colors").querySelector(".selected");
	if (prev)
		prev.classList.remove("selected");
	var name = input.id.replace("Style","Colors");
	var now = find(name);
	now.classList.add("selected");
	find("selection-name").innerHTML = input.nextElementSibling.innerText;
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
