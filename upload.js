"use strict";

function loadImage (input) {
	var files = input.files;
	if (files.length == 0)
		return;
	var main = find("editor");
	var theme = document.body.className;

	var reader = new FileReader();
	if (files[0].type.includes("svg")) {
		reader.onload = function () {
			D.Background = "data:image/svg+xml," + encodeSVG(this.result);
		}
		reader.readAsText(files[0]);
	} else {
		reader.onload = function() {
			D.Background = this.result;
		}
		reader.readAsDataURL(files[0]);
	}

	var reset = find("reset_wrapper");
	reset.style.display = "";
}

function recreateMando (svg) {
	var main = find("editor");
	var old_svg = main.firstElementChild;
	if (old_svg)
		main.replaceChild(svg, old_svg);
	else
		main.appendChild(svg);
	var scale = find("zoom");
	zoom(scale.value/100);
	variants = {};
	resetSettings();

	function findLocal(st) {
		return svg.getElementById(st);
	}
	var helmet = findLocal("Helmet_Current");
	S.build.All(helmet, "Helmet");
	variants["Helmet"] = helmet.getAttribute("class") || "Classic";

	/* Upper Body */
	var chest = findLocal("Chest_Current");
	S.build.All(chest, "UpperArmor");
	var variant = chest.getAttribute("class") || "Classic";
	variants["Chest"] = neutralize(variant);

	var subgroups = ["Shoulders","Biceps","Gauntlets"];
	for (var i = 0; i < subgroups.length; i++) {
		var cur = findLocal(subgroups[i] + "_Current");
		S.build.All(cur,"UpperArmor");
	}
	S.build.All(findLocal("Collar_Current"), "UpperArmor");
	S.build.All(findLocal("ChestAttachments_Current"), "UpperArmor");

	/* Lower Body */
	S.build.All(findLocal("Groin_Current"), "LowerArmor");
	S.build.All(findLocal("Waist_Current"), "LowerArmor");
	subgroups = ["Thighs", "Knees", "Shins", "Ankles", "Toes"];
	for (var i = 0; i < subgroups.length; i++) {
		var cur = findLocal(subgroups[i] + "_Current");
		S.build.All(cur,"LowerArmor");
	}

	/* Soft Parts */
	S.build.All(findLocal("Back"), "Back");
	S.build.All(findLocal("Front"), "Back");
	S.build.All(findLocal("Vest_Current"), "FlightSuit");
	var soft = findLocal("Soft-Parts_M") || findLocal("Soft-Parts_F");
	S.build.All(soft, "FlightSuit");
}

var translationTable = {
	"cape_long": {
		colors: ["FullCape"],
		settings: { "Cape_Option": "Full-Cape" }
	},
	"gloves_default": ["Basic_Right_Glove", "Basic_Left_Glove"],
	"shoes_default": ["Top_BasicBoot", "Main_BasicBoot", "Bottom_BasicBoot"],
	"pants_default": ["FlightSuit"],
	"top_default": ["Sleeves"],
	"knees_default": ["Basic_Knee_Left", "Basic_Knee_Right"],
	"thigh_default": {
		colors: ["Basic_Right_Thigh", null, "Basic_Left_Thigh"],
		settings: {
			"Left-Thigh_Option": "Basic_Thigh_Left",
			"Right-Thigh_Option": "Basic_Thigh_Right"
		}
	},
	"shins_default": {
		colors: ["Shin_Right_Basic", null, "Shin_Left_Basic"],
		settings: {
			"Left-Shin_Option": "Basic_Shin_Left",
			"Right-Shin_Option": "Basic_Shin_Right"
		}
	},
	"bootplate_default": {
		colors: ["Basic_Ankle_Left", null, "Basic_Ankle_Right"],
		settings: {
			"Left-Ankle_Option": "Basic_Ankle_Left",
			"Right-Ankle_Option": "Basic_Ankle_Right"
		}
	},
	"vest_default": ["Vest"],
	"neck_default": ["StandardNeckSeal"],
	"dome_default": ["Dome_Classic"],
	"side_default": ["EarCap_Right_Classic"],
	"visor_shine": ["Visor_Classic"],
	"face_default": ["Face_Classic"],
	"cheeks_default": [null, "Cheeks_Classic"],
	"viewfinder_default": {
		colors: ["Cover_Right_RangeFinder_Classic", "Shaft_Right_RangeFinder_Classic", "Finder_Right_RangeFinder_Classic"],
		settings: {"Range-Finder_Right_Classic": true}
	},
	"ears_default": ["EarCap_Left_Classic"],
	"eyes_default": [null, "Eyes_Classic"],
	"chest_default": ["Heart_Classic", "AbdomenPlate_Classic", "Chest_Right_Classic", "Chest_Left_Classic"],
	"diamond_cutout": ["Center_Heart_Classic"],
	"shoulders_default": ["Classic_Shoulder_Left", "Classic_Shoulder_Right"],
	"neckplate_default": ["NeckPlate_Classic"],
	"codpiece_default": ["Groin_Basic"],
	"belt_default": ["Main_BasicBelt"],
	"gauntlets_default": ["Base_Basic_Gauntlet_Right", "Top_Basic_Gauntlet_Right", "Base_Basic_Gauntlet_Left", "Top_Basic_Gauntlet_Left"]
}

function translateMando (svg) {
	variants = {
		"Left-Ankle_Option": "None_Ankle_Left",
		"Left-Shin_Option": "None_Shin_Left",
		"Left-Thigh_Option": "None_Thigh_Left",
		"Right-Ankle_Option": "None_Ankle_Right",
		"Right-Shin_Option": "None_Shin_Right",
		"Right-Thigh_Option": "None_Thigh_Right"
	};
	resetSettings();
	function find (st) {
		return svg.getElementById(st);
	}

	var classFilter = {
		acceptNode: function (node) {
			var cls = node.getAttribute("class");
			if (!cls)
				return NodeFilter.FILTER_SKIP;
			else if (/\d|light|dark/.test(cls))
				return NodeFilter.FILTER_REJECT;
			else
				return NodeFilter.FILTER_ACCEPT;
		}
	}

	var ch = svg.children;
	for (var i = 0; i < ch.length; i++) {
		var name = ch[i].id;
		var table = translationTable[name];
		if (!table)
			continue;

		if (table.settings) {
			for (var j in table.settings)
				variants[j] = table.settings[j];
			table = table.colors;
		}

		var iterator = document.createNodeIterator(ch[i], NodeFilter.SHOW_ELEMENT, classFilter);
		for (var j = 0; j < table.length; j++) {
			if (!table[j])
				continue;

			var node = iterator.nextNode();
			if (!node)
				break;

			var key = table[j] + "Color";
			settings[key] = node.style.fill;
		}
	}
}

function reupload (input) {
	var files = input.files;
	if (!files || !files.length)
		return;
	var main = find("editor");

	var reader = new FileReader();
	reader.onload = function () {
		var svg = document.createElement("svg");
		svg.innerHTML = this.result;
		svg = svg.firstElementChild;
		if (svg.id == "character") {
			translateMando(svg);
			S.set.Sex(false);
			return;
		}

		var mando = svg.getElementsByTagName("svg")[0];
		var img = svg.getElementsByTagName("image")[0];
		if (!mando || !img)
			return;

		var female = (mando.id === "Female-Body");
		if (female) {
			var sex_radio = find("female");
			sex_radio.checked = true;
			localStorage.setItem("female_sex", true);
		} else {
			var sex_radio = find("male");
			sex_radio.checked = true;
			localStorage.setItem("female_sex", false);
		}

		var theme = find("color_scheme_picker");
		var light_mode = !svg.getElementById("titleLight");
		theme.checked = light_mode;
		S.set.DarkMode(light_mode);

		main.style.backgroundImage = "url(" + img.getAttribute("href") + ")";
		recreateMando(mando);
		S.set.Sex(female, true);
		D.Background = svg;
	};
	reader.readAsText(files[0]);
}
