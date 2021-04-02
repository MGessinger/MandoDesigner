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

function recreateMando (svg, suffix) {
	var main = find("editor");
	var old_svg = main.firstElementChild;
	if (old_svg)
		main.replaceChild(svg, old_svg);
	else
		main.appendChild(svg);
	variants = {};
	resetSettings();

	function findLocal(st) {
		return svg.getElementById(st);
	}
	var helmet = findLocal("Helmet_Current");
	S.build.All(helmet, "Helmet");
	variants["Helmet"] = helmet.getAttribute("class") || "Classic";
	setVariantButton("Helmet", variants["Helmet"]);

	/* Upper Body */
	var chest = findLocal("Chest_Current");
	S.build.All(chest, "UpperArmor");
	var variant = chest.getAttribute("class") || "Classic";
	variants["Chest"] = neutralize(variant);
	setVariantButton("Chest", variants["Chest"]);

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
	S.build.All(findLocal("Back" + suffix), "Back");
	S.build.All(findLocal("Front" + suffix), "Back");
	S.build.All(findLocal("Vest_Current"), "FlightSuit");
	var soft = findLocal("Soft-Parts" + suffix);
	S.build.All(soft, "FlightSuit");
}

function reupload (input) {
	var files = input.files;
	if (!files || !files.length)
		return;
	var main = find("editor");

	var reader = new FileReader();
	reader.onload = function () {
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = this.result;
		svg = svg.firstElementChild;

		var mando = svg.lastElementChild;
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

		recreateMando(mando, (female ? "_F" : "_M"));
		S.set.Sex(female, true);
		D.Background = img.getAttribute("href");
	};
	reader.readAsText(files[0]);
}
