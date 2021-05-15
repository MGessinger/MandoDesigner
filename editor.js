/* MandoCreator */
"use strict";
var Download, Upload, Change;

function find (st) {
	return document.getElementById(st);
}

function SVGVault (vault) {
	function prepareSVGAttributes (svg) {
		var iter = document.createNodeIterator(svg, NodeFilter.SHOW_ELEMENT,
			{ acceptNode: function (n) {
				return n.id ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			} } );
		var node;
		while (node = iter.nextNode()) {
			var id = node.id;
			var comp = id.match(/Option|Toggle/);
			if (!comp)
				continue;
			node.setAttribute("class", comp[0].toLowerCase());
			id = node.id = id.replace("_"+comp[0], "");
			if (id.includes("Off")) {
				node.id = id.replace("Off", "");
				node.style.display = "none";
			}
		}
		vault.appendChild(svg);
	}

	this.query = function (st) {
		var ch = vault.children;
		for (var i = 0; i < ch.length; i++) {
			var svg = ch[i];
			if (svg.id === st)
				return svg;
			var local = svg.getElementById(st);
			if (local)
				return local;
		}
	}
	this.load = function (name, onload) {
		var local = this.query(name);
		if (local) {
			var copy = local.cloneNode(true);
			return onload(copy);
		}
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "images/" + name + ".svg");
		xhr.setRequestHeader("Cache-Control", "no-cache, max-age=10800");
		xhr.responseType = 'document';
		return new Promise(function (resolve) {
			xhr.onload = function () {
				var xml = xhr.responseXML;
				if (xhr.status !== 200 || !xml) {
					resolve(undefined);
				} else {
					var svg = xml.documentElement;
					svg.setAttribute("id", name);
					prepareSVGAttributes(svg);
					onload(svg.cloneNode(true));
					resolve();
				}
			};
			xhr.send();
		});
	}
}
var Vault = new SVGVault(find("vault"));

function Builder (Change) {
	var Picker = new PickerFactory(Change);
	var afterUpload = false;
	var icons = {
		"Range Finder":	"\uE919",
		"Main Antenna":	"\uE918",
		"Sub Antenna":	"\uE91B",
		"Sensor Stalk":	"\uE91A",
		"Antenna":	"\uE91C",
		"Lear Cap":	"\uE91D"
	}
	var categories = {
		"Helmet":	["Helmet"],
		"UpperArmor":	["Biceps", "Chest", "ChestAttachments", "Collar", "Shoulders", "Gauntlets"],
		"LowerArmor":	["Shins", "Foot", "Knees", "Thighs", "Groin", "Waist"],
		"SoftParts":	["Boots", "Suit", "Sleeves", "Gloves", "Vest"],
		"Back":		["Back", "Front"]
	}
	function findCategory (id) {
		id = sanitize(id);
		for (var i in categories)
			if (categories[i].includes(id))
				return i;
		return "";
	}

	var hax = { /* Store the location for all those parts, where it isn't apparent from the name */
		"Vest": "SoftParts",
		"Suit": "SoftParts"
	}
	function DOMParent (node) {
		/* Step 1: Find the parent in the DOM */
		var san = sanitize(node.id);
		if (san in hax)
			san = hax[san];
		var parent = find(san + "Colors");
		/* Step 2: If the parent is empty, then make a headline */
		if (!parent)
			return;
		if (parent.childElementCount == 0) {
			var par = DOMNode("h3", {class: "option_name hidden"}, parent);
			par.innerText = prettify(node.id) + " Options:";
		}
		return parent;
	}

	function DOMNode (type, props, parent) {
		var n = document.createElement(type);
		for (var p in props)
			n.setAttribute(p, props[p]);
		if (parent)
			parent.appendChild(n);
		return n;
	}

	function redirectClickTo (target) {
		return function (event) {
			if (event.defaultPrecented)
				return;
			target.click();
		}
	}

	function prettify (str) {
		var components = str.split("_", 1)[0];
		return components.replace(/-/g, " ");
	}

	function ColorPicker (target, parent) {
		var wrapper = DOMNode("div", {class: "color_wrapper"}, parent);

		var buttonID = sanitize(target.id) + "Color";
		var b = DOMNode("button", {class: "color_picker", id: buttonID}, wrapper);

		var label = DOMNode("label", {class: "color_label hidden", for: buttonID}, wrapper);
		var p = DOMNode("p", {class: "name"}, label);
		p.innerText = prettify(target.id);
		var c = DOMNode("p", {class: "detail"}, label);

		Picker.attach(b, c, target);
		target.addEventListener("click", redirectClickTo(b));
		return b;
	}

	function BuildToggle (toggle, parent) {
	}

	function SelectChangeHandler (pairs, id) {
		return function () {
			console.log("Change");
			variants.setItem(id, this.value, "select");
			for (var i in pairs) {
				var p = pairs[i];
				if (sanitize(p[0].id) == this.value) {
					p[0].style.display = "inherit";
					p[1].style.display = "";
				} else {
					p[0].style.display = "";
					p[1].style.display = "none";
				}
			}
		}
	}

	function BuildDropDown (options, name, parent) {
		/* Step 1: Find or Build a <select>.
		 * It might already exist, such as in the case of Back and Front Capes */
		var id = sanitize(name) + "Select";
		var select = find(id);
		if (!select) {
			var wrapper = DOMNode("div", {class: "select_wrapper hidden"}, parent); /* For arrow placement */
			select = DOMNode("select", {id: id, class: "component_select"}, wrapper);
		}

		/* Step 2: Iterate over the options, creating an <option> and Controls for each one */
		var def = sanitize(options[options.length-1].id);
		if (variants.hasItem(id))
			def = variants.getItem(id);
		var pairs = [];
		while (options.length) {
			var o = options.pop();
			var label = prettify(o.id);
			var o_id = sanitize(o.id);

			/* Step 2.1: Build an <option> and attach it to the <select> */
			var opt = DOMNode("option", {value: o_id, label: label}, select);
			opt.innerText = label;

			/* Step 2.2: Build Controls */
			var subParent = DOMNode("div", {id: o_id + "SubColors"}, parent);
			BuildManager(o, subParent);
			if (sanitize(o.id) == def)
				select.value = o_id;
			pairs.push([o,subParent]);
		}

		/* Step 3: Simulate a change event, to trigger all the right handlers */
		var handler = SelectChangeHandler(pairs, id);
		select.addEventListener("change", handler);
		handler.bind({value: select.value})();
	}

	var main = find("editor");
	function BuildManager (node, realParent) {
		if (!node || !node.id) return;
		var parent = document.createDocumentFragment();
		var ch = node.children;

		/* Step 0: Find an appropriate DOM parent */
		var possibleParent = DOMParent(node);
		if (possibleParent)
			realParent = possibleParent;

		/* Step 1: Check if node has a named child. If not, build Color Picker for this node! */
		var hasNamedChild = false;
		for (var i = 0; i < ch.length; i++)
			hasNamedChild |= (ch[i].id !== "");
		if (!hasNamedChild) {
			if (!ch.length && node.tagName == "g")
				return;
			return ColorPicker(node, realParent);
		}

		/* Step 2: Node has named children
		 * -> map `BuildManager` over `ch`, but filter out .option and .toggle */
		var options = [], toggles = [];
		for (var i = 0; i < ch.length; i++) {
			var cls = ch[i].getAttribute("class");
			if (cls == "option")
				options.push(ch[i]);
			else if (cls == "toggle")
				toggles.push(ch[i]);
			else
				BuildManager(ch[i], parent);
		}

		/* Step 3: Build controls for .option and .toggle */
		if (options.length)
			BuildDropDown(options, node.id, parent);
		while (toggles.length) {
			var t = toggles.pop();
			BuildToggle(t, parent);
		}

		/* Finally, put all controls in the DOM */
		if (parent.childElementCount == 0)
			return;
		if (realParent)
			realParent.appendChild(parent);
	}
	async function setup (svg, suffix, upload) {
		afterUpload = upload; /* Set to true, if an upload just occurred */
		Change.track = false; /* Do not track any settings during setup  */

		main.replaceChild(svg, main.firstElementChild);

		var helmet = Vault.load("Helmets", function (h) {
			//svg.appendChild(h);
		});
		var ch = svg.children;
		for (var i = 0; i < ch.length; i++) {
			var id = ch[i].id;
			var category = findCategory(id);
			if (!category)
				continue;
			var radio = find(category + "Radio");
			ch[i].addEventListener("click", redirectClickTo(radio));
			BuildManager(ch[i]);
		}

		await helmet;
		afterUpload = false;
		Change.track = true;
	}
	return {Manager: BuildManager, setup: setup};
}
var Change = new ChangeHistory;
var Build = new Builder(Change);

var Settings = {
	Sex: function (female, upload) {
		var body, sexSuffix;
		var settings = find("settings");
		if (female) {
			body = "Female_Master";
			sexSuffix = "F";
			settings.classList.remove("male");
			settings.classList.add("female");
		} else {
			body = "Male_Master";
			sexSuffix = "M";
			settings.classList.remove("female");
			settings.classList.add("male");
		}
		var slides = settings.getElementsByClassName("slide_content");
		for (var i = 0; i < slides.length; i++) {
			slides[i].innerHTML = "";
		}

		Vault.load(body, function (svg) {
			Build.setup(svg, sexSuffix, upload);
			zoom(find("zoom").value);
			svg.scrollIntoView({inline: "center"});
		});
		localStorage.setItem("female_sex", female.toString());
	},
	DarkMode: function (darkMode, keepBck) {
		var className = "light_mode";
		var bckName = "LogoLight";
		var logoName = "#titleLight";
		var href = "assets/fog-reversed.jpg";
		if (darkMode) {
			className = "dark_mode";
			bckName = "LogoDark";
			logoName = "#titleDark";
			href = "assets/fog-small.jpg";
		}
		Vault.load(bckName, function(logo) {
			Download.Logo = logo;
			if (!keepBck) {
				Download.Background = {type: "image/jpg", data: href};
				var reset = find("reset_wrapper");
				reset.style.display = "none";
			}
		});
		document.body.className = className;
		var use = find("title");
		use.setAttribute("href", logoName);
		localStorage.setItem("dark_mode", darkMode.toString());
	}
}

function VariantsVault (asString) {
	var __vars = {
		"Helmet": "Classic",
		"Chest": "Classic"
	};
	if (asString)
		__vars = JSON.parse(asString);

	this.hasItem = function (key) {
		return key in __vars;
	}
	this.setItem = function (key, value, type) {
		if (value.replace !== undefined)
			value = sanitize(value);
		key = sanitize(key);
		if (value == __vars[key])
			return;
		var c = Change.format(type, __vars[key], value, key);
		if (!c)
			return;
		Change.push(c);
		__vars[key] = value;
	}
	this.getItem = function (key) {
		return __vars[key];
	}
	this.removeItem = function (key, type) {
		if (!(key in __vars))
			return;
		var c = Change.format(type, __vars[key], undefined, key);
		if (!c)
			return;
		Change.push(c);
		delete __vars[key];
	}
	this.toString = function () {
		return JSON.stringify(__vars);
	}
}
var variants = new VariantsVault(localStorage.getItem("variants"));

function sanitize (str) {
	str = str.replace(/\W/g,"");
	return str.replace(/(_M|_F)+($|_)/,"$2");
}

function setupWindow () {
	if (window.innerWidth > 786) {
		var settings_menu = find("settings");
		settings_menu.classList.remove("settings_collapsed");
	}

	function cache () {
		localStorage.setItem("settings", JSON.stringify(settings));
		localStorage.setItem("variants", variants.toString());
	}

	window.addEventListener("pagehide", cache);
	document.addEventListener("visibilitychange", function() {
		switch (document.visibilityState) {
			case "hidden":
				cache();
				break;
			default:
				variants = new VariantsVault(localStorage.getItem("variants"));
				settings = resetSettings(true);
				break;
		}
	})

	var main = find("editor");
	var mv = { dragged: false, drag: false };
	main.addEventListener("mousedown", function (event) {
		if (event.buttons !== 1)
			return;
		mv = { drag: true, dragged: false };
	});
	main.addEventListener("mousemove", function (event) {
		if (!mv.drag)
			return;
		mv.dragged = true;
		this.style.cursor = 'grabbing';
		this.style.userSelect = 'none';
		this.scrollTop -= event.movementY;
		this.scrollLeft -= event.movementX;
	});
	main.addEventListener("mouseup", function () {
		this.style.removeProperty("cursor");
		this.style.removeProperty('user-select');
	});
	main.addEventListener("click", function (event) {
		if (mv.dragged)
			event.preventDefault();
		mv = { drag: false, dragged: false }
	}, true);
}

function onload () {
	var useDarkMode = localStorage.getItem("dark_mode");
	if (useDarkMode !== null)
		useDarkMode = (useDarkMode == "true");
	else
		useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
	Settings.DarkMode(useDarkMode);
	find("color_scheme_picker").checked = useDarkMode;
	find("kote").volume = 0.15;

	settings = resetSettings(true);

	Download = new Downloader;
	Download.attach(find("download_svg"), "image/svg+xml");
	Download.attach(find("download_jpeg"), "image/jpeg");

	Upload = new Uploader(window.location.search, Download);
	setupWindow();
	var nsw = navigator.serviceWorker;
	if (!nsw)
		return;
	nsw.onmessage = function (event) {
		displayForm(true, 'reload');
	};
	//nsw.register("sw.js");
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

var callback = null;
function hideSponsors (parent) {
	var logos = parent.getElementsByClassName("sponsor_link");
	for (var i = 0; i < logos.length; i++)
		logos[i].style.display = "none";
	var closer = parent.getElementsByClassName("close_sponsors")[0];
	if (!closer)
		return;
	closer.style.display = "none";
}

function setSponsor (sponsor, href) {
	var link = find(sponsor);
	link.setAttribute("href", href);

	var img = link.getElementsByTagName("img")[0];
	if (!img.hasAttribute("src"))
		img.setAttribute("src", "assets/" + sponsor + ".png");
	var parent = link.parentNode;
	var close = parent.getElementsByTagName("button")[0];
	callback = function () {
		link.style.removeProperty("display");
		close.style.removeProperty("display");
	}
}

function displayForm (visible, form) {
	if (!form.style)
		form = find(form);
	form.style.display = visible ? "" : "none";
}

function zoom (scale) {
	var main = find("editor");
	var svg = main.children[0];
	svg.style.height = scale + "%";
}

function zoomInOut (step) {
	var scale = find("zoom");
	var val = parseInt(scale.value);
	scale.value = val + step;
	zoom(scale.value);
}

function showRoll (type) {
	var rickRoll = find("rickroll");
	rickRoll.setAttribute("src", "assets/" + type + "Roll.mp4");
	rickRoll.style.removeProperty("display");
}

function playKote () {
	var kote = find("kote");
	kote.setAttribute("src", "assets/KOTE.mp3");
}

function reset () {
	if (!confirm("Do you want to reset all settings? You will lose all colors and all armor options. This cannot be undone."))
		return;
	variants = new VariantsVault;
	settings = resetSettings(false);
	var female = find("female").checked;
	Settings.Sex(female);
}
