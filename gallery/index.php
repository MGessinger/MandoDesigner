<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
		<meta name="description" content="Find inspiration for your next kit of Mandalorian Armor, also known as Beskar'gam. Pick one of several amazing, user-provided designs, and continue customizing it to your liking on MandoCreator." />

		<meta property="og:title" content="Mando Creator" />
		<meta property="og:description" content="Find inspiration for your next kit of Mandalorian Armor, also known as Beskar'gam. Pick one of several amazing, user-provided designs, and continue customizing it to your liking on MandoCreator." />
		<meta property="og:url" content="http://www.mandocreator.com/index.html" />
		<meta property="og:image" content="http://www.mandocreator.com/assets/header.jpg" />
		<meta name="twitter:title" content="Mando Creator" />
		<meta name="twitter:description" content="Find inspiration for your next kit of Mandalorian Armor, also known as Beskar'gam. Pick one of several amazing, user-provided designs, and continue customizing it to your liking on MandoCreator." />
		<meta name="twitter:image" content="http://www.mandocreator.com/assets/header.jpg" />
		<meta name="twitter:card" content="summary_large_image" />

		<meta name="keywords" content="Mando Creator,MandoCreator,Creator,Beskar'gam,Armor,Mandalorian,Mando,Design,Beskar" />
		<meta name="author" content="Foilrose Studio, Cin Vhetin" />
		<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png" />
		<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png" />
		<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png" />
		<link rel="manifest" href="mandocreator.manifest" />
		<link rel="mask-icon" href="assets/safari-pinned-tab.svg" color="#ab1f1f" />
		<meta name="msapplication-TileColor" content="#b91d47" />
		<meta name="theme-color" content="#ffffff" />
		<title>Mando Creator Gallery</title>
		<style>
			@font-face {
				font-family: 'icomoon';
				src: url('/fonts/icomoon.eot');
				src: url('/fonts/icomoon.eot#iefix') format('embedded-opentype'),
				     url('/fonts/icomoon.ttf') format('truetype'),
				     url('/fonts/icomoon.woff') format('woff'),
				     url('/fonts/icomoon.svg#icomoon') format('svg');
				font-weight: normal;
				font-style: normal;
				font-display: block;
			}
			@font-face {
				font-family: 'Raleway';
				src:	local("Raleway"),
					url('/fonts/Raleway.ttf') format('truetype');
				font-weight: normal;
				font-style: normal;
				font-display: block;
			}
			html {
				height: 100%;
				width: 100%;
			}
			body {
				height: 100%;
				margin: 0;
				background: url(/assets/fog-small.jpg) no-repeat center;
				background-color: #222;
				background-size: cover;
				font-family: 'icomoon', 'Raleway', Verdana, sans-serif;
				color: #DDD;
			}
			nav {
				position: absolute;
			}
			main {
				display: flex;
				height: 100%;
				align-items: baseline;
			}
			#secondary_left,
			#secondary_right {
				height: 75%;
				opacity: 50%;
				flex: 1 1 0;
				overflow: hidden;
			}
			#primary {
				height: 100%;
				flex: 0 1 25%;
				text-align: center;
			}
			svg {
				height: 100%;
				stroke: black;
				stroke-width: 2px;
				fill: none;
				fill-rule: evenodd;
				clip-rule: evenodd;
			}
			footer {
				position: fixed;
				bottom: 0;
				width: 100%;
				padding-bottom: 1em;
				text-align: center;
				font-size: x-large;
				white-space: nowrap;
			}
			.toggle_sex {
				opacity: 0;
				position: absolute;
			}
			.label_sex {
				margin: 0.5em 0.25em;
				padding: 0.25em;
				display: inline-block;
				border: #AAA solid 1px;
				border-radius: 0.25em;
				background: #555;
				cursor: pointer;
			}
			:checked + .label_sex {
				background: #AB1F1F;
			}
			button {
				border: none;
				cursor: pointer;
				color: inherit;
				font: inherit;
			}
			.next_armor {
				padding: 0 0.5em;
				background: none;
				font-size: 1.5em;
				vertical-align: bottom;
			}
			.next_armor:focus {
				color: #AB1F1F;
			}
			.main_button {
				margin: 0 0.5em;
				padding: 0.25em;
				background: #ab1f1f;
				border-radius: 0.25em;
			}
			.main_button:focus {
				background: #801717;
			}
		</style>
	</head>
	<script>
		"use strict";
		function find(st) {
			return document.getElementById(st);
		}
		function loadSVG (name) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "gallery/" + name);
			xhr.setRequestHeader("Cache-Control", "no-cache, max-age=10800");
			xhr.responseType = 'document';
			xhr.onload = function () {
				var xml = this.responseXML;
				if (xhr.status !== 200 || !xml)
					return;
				var svg = xml.documentElement;
				var vault = find("vault");
				vault.appendChild(svg);
			};
			xhr.send();
		}
		function loadSW() {
			loadSVG("wrapper_male.svg");
			loadSVG("wrapper_female.svg");
			var nsw = navigator["serviceWorker"];
			if (!nsw)
				return;
			nsw.register("../sw.js");
		}
	</script>
	<body onload="loadSW()">
		<nav style="height:3em"> <img height="100%" src="/images/Logo.svg" /> </nav>
		<main id="gallery">
			<span id="secondary_left" style="direction:rtl"></span>
			<span id="primary"></span>
			<span id="secondary_right">
			<?php
				$files = scandir("male");
				$count = count($files);
				if ($count <= 2)
					die("No images found in the gallery. Please contact the administrator of this site.");
				for ($i = 2; $i < $count; $i++) {
					$f = $files[$i];
					$n = str_replace(".svg", "", $f);
					echo "<svg viewBox='50 0 1700 3300'>";
					echo "<use alt='Armor Design titled $n' title='$n' href='#gallery/male/$f' />";
					echo "</svg>";
				}
			?>
			</span>
		</main>
		<footer>
			<form action="../index.html" method="GET">
				<input type="text" id="preset" name="preset" style="display:none" />
				<div>
					<input type="radio" id="male" class="toggle_sex" name="sex" value="0" checked onchange="Gallery.sex = false"
					/><label for="male" class="label_sex">&#xe901;</label
					><input type="radio" id="female" class="toggle_sex" name="sex" value="1" onchange="Gallery.sex = true"
					/><label for="female" class="label_sex">&#xe902;</label>
				</div>
				<button type="button" class="next_armor" onclick="Gallery.shift--">&#xe90b;</button
				><button type="submit" class="main_button">Customize</button
				><button type="button" class="next_armor" onclick="Gallery.shift++">&#xe90c;</button>
			</form>
		</footer>
		<div id="vault" style="display: none"></div>
	</body>
	<script>
		function ArmorGallery (isFemale) {
			var gallery = find("gallery");
			var all = gallery.getElementsByTagName("use");
			var primary = find("primary");
			var secondary = {
				"left": find("secondary_left"),
				"right": find("secondary_right")
			};
			var input = find("preset");
			var GallerySkeleton = {
				set sex (female) {
					var needle, replace;
					if (female) {
						needle = "male";
						replace = "female";
					} else {
						needle = "female";
						replace = "male";
					}
					for (var i = 0; i < all.length; i++) {
						var href = all[i].getAttribute("href");
						href = href.replace(needle, replace);
						all[i].setAttribute("href", href);
					}
				},
				get target () {
					return primary.firstElementChild;
				},
				set target (value) {
					primary.appendChild(value);
					var use = value.firstElementChild;
					if (!use)
						throw value;
					input.value = use.getAttribute("href").slice(1);
				},
				get shift () {
					return 0;
				},
				set shift (value) {
					var firstLeft = secondary.left.firstElementChild;
					var firstRight = secondary.right.firstElementChild;
					var current = this.target;
					if (value >= 0) {
						if (!firstRight)
							return;
						if (current)
							secondary.left.insertBefore(this.target, firstLeft);
						this.target = firstRight;
					} else {
						if (!firstLeft)
							return;
						if (current)
							secondary.right.insertBefore(this.target, firstRight);
						this.target = firstLeft;
					}
				}
			};
			GallerySkeleton.sex = isFemale;
			GallerySkeleton.shift = 1;
			return GallerySkeleton;
		}
		var female = find("female");
		var Gallery = new ArmorGallery(female.checked);
	</script>
</html>
