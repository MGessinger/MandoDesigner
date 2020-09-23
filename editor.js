/* MandoMaker: A rewrite */
"use strict";

function find (st) {
	return document.getElementById(st);
}

function DOMNode (type, props, parent) {
	var n = document.createElement(type);
	for (var p in props)
		n.setAttribute(p, props[p]);
	parent.appendChild(n);
	return n;
}

function ColorList (groupName, total) {
	return DOMNode("div", {id: groupName + "Colors", class: "color-list"}, total);
}

function OptionsList (groupName) {
	var total = DOMNode("div", {id: groupName + "Options", class: "option-list"}, find("colors"));
	var h = DOMNode("p", {class: "option-name"}, total);
	var shortName = groupName.split(/ ?\(/)[0];
	h.innerText = shortName + " Options:";
	return total;
}

function ColorPicker (affectedObject, parent) {
	var wrapper = DOMNode("div", {class: "color-wrapper"}, parent);

	var label = affectedObject.id + "Color";
	var color = DOMNode("input", {type: "color", id: label, class: "color-picker", value: "#ffffff"}, wrapper);
	var l = DOMNode("label", {for: label, class: "color-label"}, wrapper);

	var input = function () {
		affectedObject.setAttribute("fill", color.value);
		l.innerHTML = affectedObject.id + "<br />" + color.value;
	}
	color.addEventListener("input", input);
	affectedObject.addEventListener("click", redirectTo(color));
	input()
	return color;
}

function ArmorComponent (SVGNode, parent, kwargs) {
	switch (SVGNode.tagName.toLowerCase()) {
		case "title":
			return;
		case "use":
			return ArmorOptional(SVGNode, parent);
		case "symbol":
			var radio = ArmorGroup(SVGNode, SVGNode.id, parent, kwargs.list, "component-label");
			radio.addEventListener("input", pickArmorComponent(kwargs.list, kwargs.use, SVGNode.id));
			return radio;
		default:
			return ColorPicker(SVGNode, parent.querySelector(".color-list"));
	}
}

function ArmorOptional (SVGNode, parent) {
	var list = DOMNode("div", {id: SVGNode.id + "Options", class: "component-list"}, parent);

	var d = DOMNode("div", {class: "component-check"}, list);
	var l = SVGNode.id + "Checked";
	var check = DOMNode("input", {type: "checkbox", id: l, checked: "true"}, d);
	var label = DOMNode("label", {for: l}, d);
	label.innerHTML = SVGNode.id;

	var radios = DOMNode("div", {id: SVGNode.id + "List", class: "component-radio"}, list);
	var ch = SVGNode.children;
	var subLists = [];
	for (var i = 0; i < ch.length; i++) {
		var groupName = ch[i].id;
		var subList = DOMNode("div", {id: groupName + "Options", class: "option-list"}, list);
		ArmorComponent(ch[i], radios, {list: subList, use: SVGNode});
		subLists.push(subList);
	}
	var first = radios.querySelector("input");
	first.click();

	check.addEventListener("click", function() {
		var href = SVGNode.getAttribute("href");
		var hide = "";
		if (this.checked)
			SVGNode.setAttribute("href", "#"+href);
		else {
			hide = "none";
			SVGNode.setAttribute("href", href.slice(1));
		}
		radios.style.display = hide;
		for (var i = 0; i < subLists.length; i++)
			subLists[i].style.display = hide;
	});
}

function ArmorGroup (g, fullname, radios, list, labelclass) {
	var children = g.children;
	var sanitizedName = fullname.replace(/\W/g,"");

	ColorList(sanitizedName, list);
	for (var j = 0; j < children.length; j++)
		ArmorComponent(children[j], list);

	var id = sanitizedName + "Style";
	var radio = find(sanitizedName + "Style");
	if (!radio) {
		radio = DOMNode("input", {type: "radio", name: radios.id, id: id}, radios);
		var label = DOMNode("label", {class: labelclass, for: id}, radios);
		label.innerHTML = fullname;
	}
	g.addEventListener("click", redirectTo(radio));
	return radio;
}

function MandoMaker (svg) {
	var groups = svg.getElementsByTagName("title");
	var radios = find("parts-list");
	for (var i = 0; i < groups.length; i++) {
		var fullname = groups[i].innerHTML;
		var sanitizedName = fullname.replace(/\W/g,"");
		var list = OptionsList(sanitizedName);
		var radio = ArmorGroup(groups[i].parentNode, groups[i].innerHTML, radios, list, "armor-label");
		radio.addEventListener("input", pickArmorPiece(list, sanitizedName));
	}

	find("download").addEventListener("click", function() {
		if (svg.attributes['xmlns'] === undefined) {
			svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		}
		if (svg.attributes['xmlns:xlink'] === undefined) {
			svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
		}
		var data = '<?xml version="1.0" encoding="UTF-8"?>' + svg.outerHTML;
		this.href = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(data);
	});

	var first = radios.querySelector("input");
	first.checked = false;
	first.click();
}

function redirectTo(target) {
	return function () {
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

function pickArmorComponent (list, use, name) {
	var now = find(name + "Options");
	var p = list.parentNode;
	return function() {
		var components = p.children;
		for (var i = 0; i < components.length; i++)
			components[i].classList.remove("selected");
		now.classList.add("selected");
		use.setAttribute("href", "#"+name);
	}
}

function toggleOptions () {
	find("colors").classList.toggle("options-expanded");
}
