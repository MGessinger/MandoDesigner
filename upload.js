"use strict";

function loadImage (input) {
	var files = input.files;
	if (files.length == 0)
		return;
	var main = find("editor");
	var theme = document.body.className;

	var customBck;
	if (theme.includes("dark"))
		customBck = find("BackgroundDark").cloneNode(true);
	else
		customBck = find("BackgroundLight").cloneNode(true);
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

	var reset = find("reset_wrapper");
	reset.style.display = "";
}

function recreateMando (svg) {
	var main = find("editor");
	var old_svg = main.firstElementChild;
	main.replaceChild(svg, old_svg);
	var scale = find("zoom");
	zoom(scale.value/100);
	variants = {};
	settings = {};

	function findLocal(st) {
		return svg.getElementById(st);
	}
	var helmet = findLocal("Helmet_Current");
	buildAllSettings(helmet, "Helmet");
	variants["Helmet"] = helmet.getAttribute("class");

	/* Upper Body */
	var chest = findLocal("Chest_Current");
	buildAllSettings(chest, "UpperArmor");
	variants["Chest"] = chest.getAttribute("Chest");
	var subgroups = ["Shoulders","Biceps","Gauntlets"];
	for (var i = 0; i < subgroups.length; i++) {
		var cur = findLocal(subgroups[i] + "_Current");
		buildAllSettings(cur,"UpperArmor");
	}

	/* Lower Body */
	buildAllSettings(findLocal("Groin_Current"), "LowerArmor");
	buildAllSettings(findLocal("Waist_Current"), "LowerArmor");
	subgroups = ["Thighs", "Knees", "Shins", "Ankles"];
	for (var i = 0; i < subgroups.length; i++) {
		var cur = findLocal(subgroups[i] + "_Current");
		buildAllSettings(cur,"LowerArmor");
	}
	buildAllSettings(findLocal("Back"), "Back");
	var soft = findLocal("Soft-Parts_M") || findLocal("Soft-Parts_F");
	buildAllSettings(soft, "FlightSuit");
}

var translationTable = {
	"gloves_default": ["Basic_Right_Glove", "Basic_Left_Glove"],
	"shoes_default": ["Top_BasicBoot", "Main_BasicBoot", "Bottom_BasicBoot"],
	"pants_default": ["FlightSuit"],
	"top_default": ["Sleeves"],
	"knees_default": ["Basic_Knee_Left", "Basic_Knee_Right"],
	"vest_default": ["Vest"],
	"neck_default": ["StandardNeckSeal"],
	"dome_default": ["Dome_Classic"],
	"side_default": ["EarCap_Right_Classic"],
	"visor_shine": ["Visor_Classic"],
	"face_default": ["Face_Classic"],
	"cheeks_default": [null, "Cheeks_Classic"],
	"viewfinder_default": ["Finder_Right_RangeFinder_Classic", "Shaft_Right_RangeFinder_Classic"],
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
		"Right-Earcap_Classic_Option": "Range-Finder_Right_Classic",
		"Left-Ankle_Option": "None_Ankle_Left",
		"Left-Shin_Option": "None_Shin_Left",
		"Left-Thigh_Option": "None_Thigh_Left",
		"Right-Ankle_Option": "None_Ankle_Right",
		"Right-Shin_Option": "None_Shin_Right",
		"Right-Thigh_Option": "None_Thigh_Right"
	};
	settings = {};
	function find (st) {
		return svg.getElementById(st);
	}

	var darks = svg.querySelectorAll("[class*=dark]");
	for (var i = 0; i < darks.length; i++) {
		var parent = darks[i].parentNode;
		parent.removeChild(darks[i]);
	}

	var lights = svg.querySelectorAll("[class*=light]");
	for (var i = 0; i < lights.length; i++) {
		var parent = lights[i].parentNode;
		parent.removeChild(lights[i]);
	}

	for (var name in translationTable) {
		var table = translationTable[name];
		var obj = find(name);
		if (!obj) {
			console.log(name);
			continue;
		}
		var ch = obj.children;
		for (var i = 0; i < table.length; i++) {
			if (!table[i])
				continue;
			var key = table[i] + "Color";
			settings[key] = ch[i].style.fill;
			console.log(key, ch[i].style.fill);
		}
	}
}

function reupload (input) {
	var files = input.files;
	if (!files || !files.length)
		return;
	var main = find("editor");
	var download = find("download");

	var reader = new FileReader();
	reader.onload = function () {
		var svg = DOMNode("svg");
		svg.innerHTML = this.result;
		svg = svg.firstElementChild;
		if (svg.id == "character") {
			translateMando(svg);
			setSex(false);
			return;
		}

		var mando = svg.getElementsByTagName("svg")[0];
		var img = svg.getElementsByTagName("image")[0];
		if (!mando || !img)
			return;

		var female = false;
		if (mando.id === "Male-Body") {
			var sex_radio = find("male");
			sex_radio.checked = true;
			localStorage.setItem("female_sex", false);
		} else {
			female = true;
			var sex_radio = find("female");
			sex_radio.checked = true;
			localStorage.setItem("female_sex", true);
		}

		var theme = find("color_scheme_picker");
		var light_mode = !svg.getElementById("titleLight");
		theme.checked = light_mode;
		setColorScheme(light_mode);

		main.style.backgroundImage = "url(" + img.getAttribute("href") + ")";
		recreateMando(mando, img);
		setSex(female);
		download.onclick = setDownloader(svg);
	};
	reader.readAsText(files[0]);
}
