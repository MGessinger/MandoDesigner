/* MandoCreator */
"use strict";
var variants = {};

function find (st) {
	return document.getElementById(st);
}

function SVGVault (vault) {
	function prepareSVGAttributes (svg) {
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
		vault.appendChild(svg);
	}

	this.query = function (st) {
		if (!st)
			return;
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
			return onload(copy, args);
		}
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "images/" + name + ".svg");
		xhr.setRequestHeader("Cache-Control", "no-cache, max-age=10800");
		xhr.onload = function () {
			var xml = this.responseXML;
			if (this.status !== 200 || !xml)
				return;
			var svg = xml.documentElement;
			svg.setAttribute("id", name);
			prepareSVGAttributes(svg);
			var copy = svg.cloneNode(true);
			onload(copy);
		};
		xhr.send();
	}
}
var Vault = new SVGVault(find("vault"));

function Settings (afterUpload) {
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

	function listName (str) {
		if (!str)
			return "";
		var clean = str.replace(/\W/g,"");
		var components = clean.split("_");
		return components[0];
	}

	function buttonName (str) {
		if (!str)
			return "";
		var clean = str.replace(/\W/g,"");
		return neutralize(clean);
	}

	function prepareParent (SVGNode, parent) {
		var name = listName(SVGNode.id);
		var side_name = name.match(/Right|Left/);
		var globalList = find(name + "Colors");
		if (globalList) {
			parent = globalList;
			parent.style.display = "";
			var ps = parent.getElementsByClassName("option_name");
			if (ps.length !== 1) {
				p = DOMNode("p", {class: "option_name hidden"});
				globalList.prepend(p);
				p.innerText = prettify(SVGNode.id) + " Options:";
				if (side_name)
					S.mirror(parent, p, side_name[0]);
			}
		}
		if (SVGNode.getAttribute("class") === "toggle") {
			if (parent.children.length > 1) // 1 for option-name built before
				DOMNode("p", {class: "separator"}, parent);

			var p = DOMNode("label", {class: "pseudo_checkbox hidden"}, parent);
			var labelText = DOMNode("span", {class: "pseudo_label"}, p);
			labelText.innerText = prettify(SVGNode.id);

			var checkID = buttonName(SVGNode.id) + "Toggle";
			var check = DOMNode("input", {type: "checkbox", class: "armor_toggle", id: checkID}, p);
			DOMNode("span", {class: "slider"}, p);
			parent = DOMNode("div", {style: "display:none", class: "subslide"}, parent);
			if (side_name)
				S.mirror(parent, p, side_name[0]);

			var defaultOn = !afterUpload && (SVGNode.style.display !== "none");
			var varName = neutralize(SVGNode.id);
			if (varName in variants)
				defaultOn = variants[varName];
			var toggle = S.toggle.Subslide(parent, SVGNode);
			check.checked = defaultOn;
			toggle.bind({checked: defaultOn})();
			check.addEventListener("change", toggle);
		}
		return parent;
	}

	function ColorPicker (affectedObject, parent) {
		var wrapper = DOMNode("div", {class: "color_wrapper"}, parent);

		var buttonID = buttonName(affectedObject.id) + "Color";
		var b = DOMNode("button", {class: "color_picker", id: buttonID}, wrapper);

		var label = DOMNode("label", {class: "color_label hidden", for: buttonID}, wrapper);
		var p = DOMNode("p", {class: "name"}, label);
		p.innerText = prettify(affectedObject.id);
		var c = DOMNode("p", {class: "color"}, label);

		Picker.attach(b, c, affectedObject);
		return b;
	}

	function getIcon (name) {
		var icons = {
			"Range Finder":	"\uE919",
			"Main Antenna":	"\uE918",
			"Sub Antenna":	"\uE91B",
			"Sensor Stalk":	"\uE91A",
			"Antenna":	"\uE91C",
			"Lear Cap":	"\uE91D"
		}
		return icons[name] || "";
	}

	this.build = {
		IO: function (SVGNode, category, parent) {
			if (!SVGNode.id)
				return;
			var p = ColorPicker(SVGNode, parent);
			var redirectToPicker = redirectClickTo(p);

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
				redirectToPicker();
			});
		},
		Dropdown: function (addons, category, parent, SVGName) {
			var select = find(SVGName + "Select");
			var useDefault = !select;
			if (!select) {
				var wrapper = DOMNode("div", {class: "select_wrapper hidden"}, parent);
				select = DOMNode("select", {class: "component_select", id: SVGName + "Select"}, wrapper);
			}

			var colors = [];
			for (var i = addons.length - 1; i >= 0; i--) {
				var fullName = addons[i].id;
				var name = prettify(fullName);
				var neutral = neutralize(fullName);

				/* Create an option in the select, and a hideable color list */
				var opt = DOMNode("option", {label: name, value: fullName}, select);
				opt.innerText = name;

				var san = listName(fullName);
				var col = DOMNode("div", {id: san + "SubColors"}, parent);
				if (variants[SVGName] == neutral) {
					addons[i].style.display = "inherit";
					useDefault = false;
					opt.selected = true;
				} else if (addons[i].style.display == "inherit") {
					useDefault = false;
					opt.selected = true;
					variants[SVGName] = neutralize(fullName);
				} else {
					addons[i].style.display = "";
					col.style.display = "none";
				}
				this.All(addons[i], category, col);
				colors.push(col);
			}
			if (useDefault) {
				addons[addons.length-1].style.display = "inherit";
				colors[0].style.display = "";
			}

			select.addEventListener("change", function() {
				variants[SVGName] = neutralize(this.value);
				for (var i = 0; i < addons.length; i++) {
					if (addons[i].id === this.value)
						addons[i].style.display = "inherit";
					else
						addons[i].style.display = "";
				}

				var id = listName(this.value) + "SubColors"
				for (var i = 0; i < colors.length; i++) {
					if (colors[i].id === id)
						colors[i].style.display = "";
					else
						colors[i].style.display = "none";
				}
			});
			return select;
		},
		Variant: function (category, pieceName, variantName) {
			var fullyQualifiedName = pieceName + "_" + variantName;
			var identifier = listName(pieceName);

			var wrapper = find(identifier + "_Current");
			var ref = Vault.query(fullyQualifiedName);
			if (!ref)
				return console.log(fullyQualifiedName);
			var node = ref.cloneNode(true);
			wrapper.appendChild(node);

			var parent = prepareParent(node);
			var SVGName = neutralize(fullyQualifiedName) + "_Option";
			this.Dropdown(node.children, category, parent, SVGName);
		},
		Checkbox: function (addons, category, parent) {
			var checkboxes = DOMNode("div", {class: "checkbox_list hidden"}, parent);
			for (var i = addons.length - 1; i >= 0; i--) {
				var fullName = addons[i].id;
				var name = prettify(fullName);
				var neutral = neutralize(fullName);
				var labelName = fullName + "_Check";

				var wrapper = DOMNode("div", {class: "checkbox_wrapper"}, checkboxes);
				var checkbox = DOMNode("input", {type: "checkbox", class: "checkbox", id: labelName}, wrapper);
				var label = DOMNode("label", {for: labelName, title: name, class: "checkbox_label"}, wrapper);
				label.innerText = getIcon(name);

				var san = listName(fullName);
				var col = DOMNode("div", {id: san + "SubColors"}, parent);
				if (variants[neutral]) {
					addons[i].style.display = "inherit";
					checkbox.checked = true;
				} else if (addons[i].style.display == "inherit") {
					variants[neutral] = true;
					checkbox.checked = true;
				} else {
					addons[i].style.display = "";
					col.style.display = "none";
				}
				this.All(addons[i], category, col);
				checkbox.addEventListener("change", S.toggle.Sublist(col, addons[i]));
			}
		},
		All: function (SVGNode, category, parent) {
			if (!SVGNode)
				return;
			parent = prepareParent(SVGNode, parent);
			var ch = SVGNode.children;
			for (var i = 0; i < ch.length; i++) {
				if (!ch[i].id && ch[i].tagName !== "title")
					return this.IO(SVGNode, category, parent);
			}
			if (!ch.length) {
				if (SVGNode.tagName === "g")
					return;
				return this.IO(SVGNode, category, parent);
			}
			var options = [];
			var toggle = [];
			for (var i = ch.length-1; i >= 0; i--) {
				var className = ch[i].getAttribute("class");
				if (className == "option")
					options.unshift(ch[i]);
				else if (className == "toggle")
					toggle.push(ch[i]);
				else
					this.All(ch[i], category, parent);
			}
			var SVGName = neutralize(SVGNode.id) + "_Option";
			if (options.length > 0) {
				if (/Earcap/.test(SVGName))
					this.Checkbox(options, category, parent);
				else
					this.Dropdown(options, category, parent, SVGName);
			}
			/* defer toggles to the very last */
			for (var i = 0; i < toggle.length; i++) 
				this.All(toggle[i], category, parent);
		}
	};
	this.toggle = {
		Slide: function (slide) {
			slide.classList.toggle("selected");
			var folder = slide.parentNode.parentNode;
			folder.classList.toggle("overview");
		},
		Subslide: function (subslide, SVGNode) {
			var varName = neutralize(SVGNode.id);
			return function () {
				if (this.checked) {
					subslide.style.display = "";
					SVGNode.style.display = "";
				} else {
					subslide.style.display = "none";
					SVGNode.style.display = "none";
				}
				variants[varName] = this.checked || false;
			}
		},
		Sublist: function (sublist, SVGNode) {
			var varName = neutralize(SVGNode.id);
			return function () {
				if (this.checked) {
					sublist.style.display = "";
					SVGNode.style.display = "inherit";
				} else {
					sublist.style.display = "none";
					SVGNode.style.display = "none";
				}
				variants[varName] = this.checked || false;
			}
		},
		Options: function () {
			find("settings").classList.toggle("settings_collapsed");
		}
	};
	this.set = {
		Sex: function (female, upload) {
			var body, sexSuffix;
			var settings = find("settings");
			if (female) {
				body = "Female-Body";
				sexSuffix = "F";
				settings.classList.remove("male");
				settings.classList.add("female");
			} else {
				body = "Male-Body";
				sexSuffix = "M";
				settings.classList.remove("female");
				settings.classList.add("male");
			}
			var slides = settings.getElementsByClassName("slide_content");
			for (var i = 0; i < slides.length; i++) {
				slides[i].innerHTML = "";
			}

			Vault.load(body, function (svg) {
				afterUpload = upload; /* Set to true, if this function was called after an upload */
				setupMando(svg, sexSuffix);
				afterUpload = false;
			});
			localStorage.setItem("female_sex", female.toString());
		},
		DarkMode: function (darkMode) {
			var className = "light_mode";
			var bckName = "BackgroundLight";
			var logoName = "#titleLight";
			if (darkMode) {
				className = "dark_mode";
				bckName = "BackgroundDark";
				logoName = "#titleDark";
			}
			document.body.className = className;
			var a = find("download");
			var main = find("editor");
			Vault.load(bckName, function(svg) {
				a.onclick = setDownloader(svg);
				var img = svg.getElementsByTagName("image")[0];
				var href = img.getAttribute("href");
				main.style.backgroundImage = "url(" + href + ")";
			});
			var use = find("title");
			use.setAttribute("href", logoName);
			var reset = find("reset_wrapper");
			reset.style.display = "none";
			localStorage.setItem("dark_mode", darkMode.toString());
		}
	}
	this.mirror = function (parent, paragraph, side) {
		var mirror = DOMNode("button", {class: "mirror_button", title: "Mirror Settings"}, paragraph);
		mirror.innerText = "\uE915";

		var otherSide = (side == "Right" ? "Left" : "Right");
		var editor = find("editor");
		mirror.addEventListener("click", function () {
			/* Mirror all the colors */
			showPicker = false;
			var buttons = parent.getElementsByClassName("color_picker");
			for (var i = 0; i < buttons.length; i++) {
				var mirrorImageName = buttons[i].id.replace(side, otherSide);
				var mirrorImage = find(mirrorImageName);
				if (!mirrorImage) /* Allow for asymmetric helmets */
					continue;
				mirrorImage.style.background = buttons[i].style.background;
				mirrorImage.click();
			}
			showPicker = true;
			/* Mirror all Checkboxes */
			var checks = parent.getElementsByTagName("input");
			for (var i = 0; i < checks.length; i++) {
				var mirrorImageName = checks[i].id.replace(side, otherSide);
				var mirrorImage = find(mirrorImageName);
				if (!mirrorImage)
					continue;
				if (mirrorImage.checked ^ checks[i].checked)
					mirrorImage.click();
			}
			/* Mirror the checkbox in paragraph itself (if present) */
			var top_check = paragraph.getElementsByTagName("input")[0];
			if (top_check) {
				var mirrorImageName = top_check.id.replace(side, otherSide);
				var mirrorImage = find(mirrorImageName);
				if (mirrorImage) {
					if (mirrorImage.checked ^ top_check.checked)
						mirrorImage.click();
				}
			}
			/* Mirror all selects */
			var selects = parent.getElementsByClassName("component_select");
			for (var i = 0; i < selects.length; i++) {
				var mirrorImageName = selects[i].id.replace(side, otherSide);
				var mirrorImage = find(mirrorImageName);
				if (!mirrorImage)
					continue;
				mirrorImage.value = selects[i].value.replace(side, otherSide);
				mirrorImage.dispatchEvent(new Event("change"));
			}
		});
	}
}
var S = new Settings(false);

function prettify (str) {
	if (!str)
		return "";
	var components = str.split("_");
	var shortName = components[0];
	return shortName.replace(/-/g, " ");
}

function neutralize (str) {
	if (!str)
		return "";
	return str.replace(/(_(M|F|Toggle(Off)?|Option))+($|_)/,"$4");
}

function onload () {
	var female = false;
	if (window.localStorage)
		female = (localStorage.getItem("female_sex") == "true");
	find("female").checked = female;
	S.set.Sex(female);
	var useDarkMode = localStorage.getItem("dark_mode");
	if (useDarkMode !== null)
		useDarkMode = (useDarkMode == "true");
	else
		useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
		
	S.set.DarkMode(useDarkMode);
	find("color_scheme_picker").checked = useDarkMode;
	find("kote").volume = 0.15;

	if (window.innerWidth < 786) {
		var settings = find("settings");
		settings.classList.add("settings_collapsed");
		var types = settings.getElementsByClassName("armor_types");
		for (var i = 0; i < types.length; i++)
			types[i].style.height = "12em";
	}

	window.addEventListener("beforeunload", function (event) {
		var message = "You should save your work. Do or do not, there is not try!";
		event.preventDefault();
		event.returnValue = message;
		return message;
	});
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

function switchToArmorVariant (category, pieceName, variantName, button) {
	var parent = find(category + "Options");
	var old_button = parent.getElementsByClassName("current_variant")[0];
	if (old_button)
		old_button.classList.remove("current_variant");

	variants[pieceName] = neutralize(variantName);

	if (!button)
		button = find(category + "_Variant_" + variantName);
	if (button)
		button.classList.add("current_variant");
	hideSponsors(parent);

	var old = find(pieceName + "_Current");
	var SVGparent = old.parentNode;
	var n = Vault.query(pieceName + "_" + variantName);
	n = n.cloneNode(true);
	n.id = pieceName + "_Current";
	n.setAttribute("class", variantName);
	SVGparent.replaceChild(n, old);

	var old_lists = parent.getElementsByClassName("replace");
	for (var i = 0; i < old_lists.length; i++) {
		old_lists[i].style.display = "none";
		old_lists[i].innerHTML = "";
	}

	S.build.All(n, category);
}

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
	if (!href)
		return;

	var link = find(sponsor);
	link.style.display = "";
	link.setAttribute("href", href);

	var parent = link.parentNode;
	var close = parent.getElementsByTagName("button")[0];
	close.style.display = "";

	var img = link.getElementsByTagName("img")[0];
	if (!img.hasAttribute("src"))
		img.setAttribute("src", "assets/" + sponsor + ".png");
}

function prepareForExport (svg) {
	svg.style.transform = "";
	var options = svg.getElementsByClassName("option");
	var i = 0;
	while (i < options.length) {
		if (options[i].style.display == "inherit") {
			i++;
			continue;
		}
		var parent = options[i].parentNode;
		parent.removeChild(options[i]);
	}
	var toggles = svg.getElementsByClassName("toggle");
	i = 0;
	while (i < toggles.length) {
		if (toggles[i].style.display !== "none") {
			i++;
			continue;
		}
		var parent = toggles[i].parentNode;
		parent.removeChild(toggles[i]);
	}
	return svg;
}

function encodeSVG (svg) {
	var san = svg.replace(/\s+/g," ").replace(/"/g,"'").replace(/_(M|F)/,"");
	return encodeURIComponent(san);
}

function setDownloader (bck) {
	var main = find("editor");
	var xml = new XMLSerializer();
	return function() {
		var background = bck.cloneNode(true);
		var svg = main.getElementsByTagName("svg")[0];
		var copy = svg.cloneNode(true);
		prepareForExport(copy);
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
	var variant = variants["Helmet"] || "Classic";
	Vault.load("Helmets", function() { switchToArmorVariant("Helmet", "Helmet", variant); });

	Vault.load("Upper-Armor_" + sexSuffix, function(svg) {
		var variant = variants["Chest"] || "Classic";
		switchToArmorVariant("UpperArmor", "Chest", variant + "_" + sexSuffix)
		var subgroups = ["Shoulder","Biceps","Gauntlets"];
		for (var i = 0; i < subgroups.length; i++) {
			S.build.Variant("UpperArmor", "Left-" + subgroups[i], sexSuffix);
			S.build.Variant("UpperArmor", "Right-" + subgroups[i], sexSuffix);
		}
		S.build.Variant("UpperArmor", "Collar", sexSuffix + "_ToggleOff");
		S.build.Variant("UpperArmor", "Chest-Attachments", sexSuffix);
	});

	Vault.load("Lower-Armor_" + sexSuffix, function(svg) {
		switchToArmorVariant("LowerArmor", "Waist", sexSuffix);
		S.build.Variant("LowerArmor", "Groin", sexSuffix);
		var subgroups = ["Thigh", "Knee", "Shin", "Ankle", "Toe"];
		for (var i = 0; i < subgroups.length; i++) {
			S.build.Variant("LowerArmor", "Left-" + subgroups[i], sexSuffix);
			S.build.Variant("LowerArmor", "Right-" + subgroups[i], sexSuffix);
		}
	});
	S.build.All(findLocal("Back_" + sexSuffix), "Back");
	S.build.All(findLocal("Front_" + sexSuffix), "Back");
	var parent = find("SoftPartsColors");
	S.build.All(findLocal("Vest_" + sexSuffix), "FlightSuit", parent);
	S.build.All(findLocal("Soft-Parts_" + sexSuffix), "FlightSuit", parent);
}

function displayForm (show, form) {
	form = form || find("contact");
	form.style.display = show ? "" : "none";
}

function zoom (scale) {
	var main = find("editor");
	var svg = main.children[0];
	svg.style.transform = "";
	var rect = svg.getBoundingClientRect()
	var t = (rect.height*scale - window.innerHeight)/2 + rect.top;
	svg.style.transform = "translateY(" + t + "px) scale(" + scale + ")";
}

function zoomInOut (step) {
	var scale = find("zoom");
	var val = parseInt(scale.value);
	scale.value = val + step;
	zoom(scale.value/100);
}

function showRoll () {
	var rickRoll = find("rickroll");
	rickRoll.setAttribute("src", "assets/Bucket_Astley.mp4");
	rickRoll.style.display = "";
}

function playKote () {
	var kote = find("kote");
	kote.setAttribute("src", "assets/Vode_an.mp3");
}
