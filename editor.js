/* MandoCreator */
"use strict";
var Download, Change;

function find (st) {
	return document.getElementById(st);
}

function SVGVault () {
	var vault = {};
	function query (st) {
		for (var i in vault) {
			var svg = vault[i];
			if (svg.id === st)
				return svg;
			var local = svg.getElementById(st);
			if (local)
				return local;
		}
	}
	function finishUp (name, svg, onload, replace) {
		var ret = undefined;
		if (onload)
			ret = onload(svg);
		vault[name] = svg;
		if (replace) {
			var par = replace.parentNode;
			par.replaceChild(svg, replace);
		}
	}
	this.load = function (name, onload, replace) {
		var local = query(name);
		if (local)
			return finishUp(name, local, onload, replace);

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
					var ret = finishUp(name, svg, onload, replace);
					resolve(ret);
				}
			};
			xhr.send();
		});
	}
}
var Vault = new SVGVault();

function Builder (afterUpload) {
	var Picker = new PickerFactory(Change);
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
		"Back":		["Back", "Front"],
		"Helmet":	["Helmets"]
	}
	function findCategory (id) {
		for (var i in categories)
			if (categories[i].includes(id))
				return i;
		return "";
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

	var hax = { /* Store the location for all those parts, where it isn't apparent from the name */
		"Vest": "Suit",
	}
	var variantID = null;
	var swapFilter = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT,
		{ acceptNode: function (node) {
			if (node.getAttribute("class") == "swappable")
				return NodeFilter.FILTER_ACCEPT;
			variantID = node.id;
			return NodeFilter.FILTER_REJECT;
		} }
	);
	function attachSwapRadio (id, node) {
		var radio = find(id + "Radio");
		radio.addEventListener("change", function () {
			node.dataset.show = "true";
		});
	}
	function DOMParent (node) {
		/* Step 1: Find the parent in the DOM */
		var id = node.id;
		var san = id.split("_",1)[0];
		if (san in hax)
			id = san = hax[san];
		var parent = find(san + "Colors");
		if (!parent) return;
		/* Step 2: If the parent is empty, make a headline */
		variantID = node.id;
		swapFilter.currentNode = node;
		if (swapFilter.parentNode()) {
			parent = DOMNode("div", {class: "swapslide"}, parent);
			attachSwapRadio(variantID, parent);
		}
		if (parent.childElementCount == 0) {
			var par = DOMNode("h3", {class: "option_name hidden"}, parent);
			par.innerText = prettify(id) + " Options:";
		}
		return parent;
	}

	function prettify (str) {
		var components = str.split("_", 1)[0];
		return components.replace(/-/g, " ");
	}

	function ColorPicker (target, parent) {
		var wrapper = DOMNode("div", {class: "color_wrapper"}, parent);

		var buttonID = target.id + "Color";
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
		/* Step 1: Build all DOM components */
		if (parent.childElementCount != 0) {
			var prev = parent.lastElementChild;
			/* Build a (fancier) line-break */
			if (!prev.matches(".option_name"))
				DOMNode("hr", {}, parent);
		}
		var label = DOMNode("label", {class: "pseudo_checkbox hidden"}, parent);

		var span = DOMNode("span", {class: "pseudo_label"}, label);
		span.innerText = prettify(toggle.id);

		var id = toggle.id + "Toggle";
		var input = DOMNode("input", {type: "checkbox", id: id, class: "armor_toggle"}, label);
		var sp = DOMNode("span", {class: "slider"}, label);

		var subslide = DOMNode("div", {class: "subslide"}, parent);

		/* Step 2: Find the default value and attach an event handler */
		var defaultOn = (toggle.style.display !== "none");
		if (variants.hasItem(id))
			defaultOn = variants.getItem(id);
		var handler = function () {
			if (this.checked) {
				subslide.style.display = "";
				toggle.style.display = "";
			} else {
				subslide.style.display = "none";
				toggle.style.display = "none";
			}
			if (this.checked != defaultOn)
				variants.setItem(id, this.checked, "toggle");
			else
				variants.removeItem(id, "toggle");
		}
		input.addEventListener("change", handler);
		input.checked = !afterUpload && defaultOn;
		handler.bind(input)();
		return BuildManager(toggle, subslide);
	}

	function SelectChangeHandler (pairs, id) {
		return function (event) {
			if (!event.defaultPrevented)
				variants.setItem(id, this.value, "select");
			for (var i in pairs) {
				var p = pairs[i];
				if (p[0].id == this.value) {
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
		var id = name + "Select";
		var select = find(id);
		if (!select) {
			var wrapper = DOMNode("div", {class: "select_wrapper hidden"}, parent); /* For arrow placement */
			select = DOMNode("select", {id: id, class: "component_select"}, wrapper);
		}

		/* Step 2: Iterate over the options, creating an <option> and Controls for each one */
		var def = options[options.length-1].id;
		if (variants.hasItem(id))
			def = variants.getItem(id);
		var pairs = [];
		while (options.length) {
			var o = options.pop();
			var label = prettify(o.id);

			/* Step 2.1: Build an <option> and attach it to the <select> */
			var opt = DOMNode("option", {value: o.id, label: label}, select);
			opt.innerText = label;
			if (o.id == def)
				opt.selected = true;

			/* Step 2.2: Build Controls */
			var subParent = DOMNode("div", {id: o.id + "SubColors"});
			BuildManager(o, subParent);
			if (subParent.childElementCount > 0) {
				parent.appendChild(subParent);
				pairs.push([o,subParent]);
			}
		}

		/* Step 3: Simulate a change event, to trigger all the right handlers */
		var handler = SelectChangeHandler(pairs, id, def);
		select.addEventListener("change", handler);
		handler.bind(select)({defaultPrevented: true});
	}

	function CheckboxChangeHandler (id, sublist, node) {
		return function () {
			if (this.checked) {
				sublist.style.display = "";
				node.style.display = "inherit";
			} else {
				sublist.style.display = "none";
				node.style.display = "";
			}
			if (this.checked)
				variants.setItem(id, true, "toggle");
			else
				variants.removeItem(id, "toggle");
		}
	}
	function BuildCheckboxes (options, parent) {
		var icons_wrapper = DOMNode("div", {class: "checkbox_list hidden"}, parent);
		while (options.length) {
			var o = options.pop();
			var title = prettify(o.id);
			var id = o.id + "Toggle";

			/* Step 2.1: Build a checkbox hidden behind an icon */
			var input = DOMNode("input", {type: "checkbox", class: "checkbox", id: id}, icons_wrapper);
			var label = DOMNode("label", {for: id, class: "checkbox_label", title: title}, icons_wrapper);
			label.innerText = icons[title];

			/* Step 2.2: Build a sublist for all the colors to go in */
			var sublist = DOMNode("div", {id: o.id+"SubColors"}, parent);
			BuildManager(o, sublist);

			/* Step 2.3: Attach and event handler to the checkbox */
			var handler = CheckboxChangeHandler(id, sublist, o);
			input.addEventListener("change", handler);
			handler.bind(input)();
		}
	}

	function BuildManager (node, realParent) {
		/* Step 0.1: Check if the node needs treatment */
		var ch = node.children;
		if (!ch.length && node.tagName == "g")
			return;
		/* Step 0.2: Look for an appropriate DOM parent */
		var possibleParent = DOMParent(node);
		if (possibleParent)
			realParent = possibleParent;

		/* Step 1: Check if node has a named child. If not, build ColorPicker for this node! */
		var allNamed = (ch.length !== 0);
		for (var i = 0; i < ch.length; i++)
			allNamed &= (ch[i].id !== "");
		if (!allNamed)
			return ColorPicker(node, realParent);

		/* Step 2.1: Node has only named children
		 * -> map `BuildManager` over `ch`, but filter out .option and .toggle */
		var parent = document.createDocumentFragment();
		var options = [], toggles = [];
		var parcls = node.getAttribute("class");
		for (var i = 0; i < ch.length; i++) {
			var cls = ch[i].getAttribute("class");
			if (cls == "option")
				options.push(ch[i]);
			else if (cls == "toggle")
				toggles.push(ch[i]);
			else
				BuildManager(ch[i], parent);
			if (parcls == "swappable")
				attachSwapRadio(ch[i].id, ch[i]);
		}

		/* Step 2.2: Build controls for .option and .toggle */
		if (options.length) {
			if (node.id.includes("Ear"))
				BuildCheckboxes(options, parent);
			else
				BuildDropDown(options, node.id, parent);
		}
		while (toggles.length)
			BuildToggle(toggles.pop(), parent);

		/* Step 3: Put all controls in the DOM */
		if (realParent)
			realParent.appendChild(parent);
	}

	function setupSwapHandler (node, category) {
		var options = find(category + "Options");
		var slides = options.getElementsByClassName("swapslide");
		var ch = node.children;
		var typesList = options.getElementsByTagName("details")[0];
		typesList.addEventListener("change", function () {
			for (var i = 0; i < slides.length; i++) {
				if ("show" in slides[i].dataset) {
					slides[i].style.display = "block";
					delete slides[i].dataset.show;
				} else {
					slides[i].style.display = "";
				}
			}
			for (var j = 0; j < ch.length; j++) {
				if ("show" in ch[j].dataset) {
					ch[j].style.visibility = "visible";
					delete ch[j].dataset.show;
				} else {
					ch[j].style.visibility = "";
				}
			}
		})
	}

	this.setup = function (nodes) {
		for (var i = nodes.length-1; i >= 0; i--) {
			var category = findCategory(nodes[i].id);
			if (!category)
				continue;
			var radio = find(category + "Radio");
			nodes[i].addEventListener("click", redirectClickTo(radio));
			BuildManager(nodes[i]);
			if (nodes[i].getAttribute("class") == "swappable")
				setupSwapHandler(nodes[i], category);
		}
	}
	this.parent = DOMParent;
}
var Change = new ChangeHistory;

var Settings = {
	Sex: async function (female, upload) {
		var body;
		var settings = find("settings");
		if (female) {
			body = "Female_Master";
			settings.classList.remove("male");
			settings.classList.add("female");
		} else {
			body = "Male_Master";
			settings.classList.remove("female");
			settings.classList.add("male");
		}
		var slides = settings.getElementsByClassName("slide_content");
		for (var i = 0; i < slides.length; i++) {
			slides[i].innerHTML = "";
		}

		Change.track = false; /* Do not track any settings during setup  */
		var SVG = find("main").firstElementChild;
		var helmet;
		var body = Vault.load(body, function (body) {
			var Build = new Builder(upload);
			Build.setup(body.children);
			var h = body.getElementById("Helmets");
			helmet = Vault.load("Helmets", function (helmets) {
				helmets.setAttribute("class", "swappable");
				Build.setup([helmets], upload);
			}, h);
		}, SVG);

		localStorage.setItem("female_sex", female.toString());
		await body;
		zoom();
		SVG.scrollIntoView({inline: "center"});
		await helmet;
		Change.track = true;
	},
	DarkMode: function (darkMode, keepBck) {
		var className = "light_mode";
		var bckName = "LogoLight";
		var href = "assets/fog-reversed.jpg";
		if (darkMode) {
			className = "dark_mode";
			bckName = "LogoDark";
			href = "assets/fog-small.jpg";
		}
		Vault.load(bckName, function(logo) {
			Download.Logo = logo.cloneNode(true);
			if (!keepBck) {
				Download.Background = {type: "image/jpg", data: href};
				var reset = find("reset_wrapper");
				reset.style.display = "none";
			}
		}, find("title"));
		document.body.className = className;
		localStorage.setItem("dark_mode", darkMode.toString());
	}
}

function VariantsVault (asString) {
	var __vars = {
		"Helmets": "Helmet_Classic",
		"Chest": "Chest_Classic"
	};
	if (asString)
		__vars = JSON.parse(asString);

	this.hasItem = function (key) {
		return key in __vars;
	}
	this.setItem = function (key, value, type) {
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

function setupControlMenu () {
	/* Step 1: Settings and Controls */
	var controls = find("settings");
	if (window.innerWidth > 786) {
		controls.classList.remove("settings_collapsed");
	}

	var button = controls.firstElementChild;
	button.addEventListener("click", function () {
		controls.classList.toggle("settings_collapsed");
	});

	var slides = controls.getElementsByClassName("slide");
	for (var i = 0; i < slides.length; i++) {
		slides[i].addEventListener("click", toggleArmorSlide(slides[i]));
	}
}

function setupCaching () {
	function cache () {
		localStorage.setItem("settings", JSON.stringify(settings));
		localStorage.setItem("variants", variants.toString());
	}
	function uncache () {
		variants = new VariantsVault(localStorage.getItem("variants"));
		settings = resetSettings(true);
	}

	window.addEventListener("pagehide", cache);
	window.addEventListener("pageshow", uncache);
	document.addEventListener("visibilitychange", function() {
		if (document.visibilityState == "hidden")
			cache();
		else
			uncache();
	})
}

function setupDragAndDrop () {
	var main = find("main");
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

	var Upload = new Uploader(window.location.search, Download);
	setupControlMenu();
	setupDragAndDrop();
	setupCaching();
	var nsw = navigator.serviceWorker;
	if (!nsw)
		return;
	nsw.onmessage = function (event) {
		var form = find("reload");
		form.style.display = "";
	};
	//nsw.register("sw.js");
}

function openArmorFolder (category) {
	var now = find(category + "Options");
	var components = document.getElementsByClassName("folder");
	for (var i = 0; i < components.length; i++)
		components[i].classList.remove("selected");
	now.classList.add("selected");
}

function toggleArmorSlide (slide) {
	var button = slide.firstElementChild;
	var folder = slide.parentNode.parentNode;
	button.addEventListener("click", function(event) {
		event.preventDefault();
	});
	var allSlides = folder.getElementsByClassName("slide");
	return function (event) {
		if (event.defaultPrevented) {
			slide.classList.toggle("selected");
			folder.classList.toggle("overview");
		} else {
			for (var i = 0; i < allSlides.length; i++)
				allSlides[i].classList.remove("selected");
			slide.classList.add("selected");
			folder.classList.remove("overview");
		}
	}
}

function setSponsor (sponsor, href) {
	var link = find(sponsor);
	link.setAttribute("href", href);
	link.style.display = "";
	link.dataset.show = "true";

	var img = link.getElementsByTagName("img")[0];
	if (!img.hasAttribute("src"))
		img.setAttribute("src", "assets/" + sponsor + ".png");
	var parent = link.parentNode;
	var closer = parent.getElementsByClassName("close_sponsors")[0];
	closer.style.removeProperty("display");
	closer.dataset.show = "true";
}

function UpdateSponsor (category) {
	var parent = find(category + "Options");
	var logos = parent.getElementsByClassName("sponsor_link");
	for (var i = 0; i < logos.length; i++) {
		if (logos[i].dataset.show == "true")
			delete logos[i].dataset.show;
		else
			logos[i].style.display = "none";
	}
	var closer = parent.getElementsByClassName("close_sponsors")[0];
	if (closer.dataset.show == "true")
		delete closer.dataset.show;
	else
		closer.style.display = "none";
}

function zoom (scale) {
	if (!scale)
		scale = find("zoom").value;
	var SVG = find("main").firstElementChild;
	SVG.style.height = scale + "%";
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
	var conf = confirm("Do you want to reset all settings? You will lose all colors and all armor options. This cannot be undone.")
		if (!conf) return;
	variants = new VariantsVault;
	settings = resetSettings(false);
	var female = find("female").checked;
	Settings.Sex(female);
}
