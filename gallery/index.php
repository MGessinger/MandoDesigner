<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
		<meta name="description" content="Find inspiration for your next kit of Mandalorian Armor, also known as Beskar'gam. Pick one of several amazing, user-provided designs, and continue customizing it to your liking on MandoCreator." />

		<meta property="og:title" content="MandoCreator Gallery" />
		<meta property="og:description" content="Find inspiration for your next kit of Mandalorian Armor, also known as Beskar'gam. Pick one of several amazing, user-provided designs, and continue customizing it to your liking on MandoCreator." />
		<meta property="og:url" content="http://www.mandocreator.com/index.html" />
		<meta property="og:image" content="http://www.mandocreator.com/assets/header.jpg" />
		<meta name="twitter:title" content="MandoCreator Gallery" />
		<meta name="twitter:description" content="Find inspiration for your next kit of Mandalorian Armor, also known as Beskar'gam. Pick one of several amazing, user-provided designs, and continue customizing it to your liking on MandoCreator." />
		<meta name="twitter:image" content="http://www.mandocreator.com/assets/header.jpg" />
		<meta name="twitter:card" content="summary_large_image" />

		<meta name="keywords" content="MandoCreator,Mando,Creator,Beskar'gam,Armor,Mandalorian,Design,Beskar,Gallery" />
		<meta name="author" content="Foilrose Studio, Cin Vhetin" />
		<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png" />
		<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png" />
		<link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png" />
		<link rel="manifest" href="../mandocreator.manifest" />
		<link rel="mask-icon" href="../assets/safari-pinned-tab.svg" color="#ab1f1f" />
		<meta name="msapplication-TileColor" content="#b91d47" />
		<meta name="theme-color" content="#ffffff" />
		<title>MandoCreator Gallery</title>
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
				background: url(../assets/fog-small.jpg) no-repeat center;
				background-color: #222;
				background-size: cover;
				font-family: 'icomoon', 'Raleway', Verdana, sans-serif;
				color: #DDD;
			}
			nav {
				position: absolute;
				height: 4em;
			}
			.return {
				display: block;
				color: inherit;
				text-decoration: none;
			}
			.icon {
				color: #AB1F1F;
				font-size: x-large;
				vertical-align: sub;
			}
			main {
				padding: 0 50%;
				height: 100%;
				overflow: auto hidden;
				white-space: nowrap;
				scroll-snap-type: x mandatory;
			}
			svg {
				height: 100%;
				opacity: 75%;
				scroll-snap-align: center;
				stroke: black;
				stroke-width: 2px;
				fill: none;
				fill-rule: evenodd;
			}
			.primary {
				opacity: 1;
			}
			footer {
				position: fixed;
				bottom: 0;
				width: 100%;
				padding-bottom: 1em;
				text-align: center;
				font-size: x-large;
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
			xhr.open("GET", "/gallery/" + name);
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
			var nsw = navigator.serviceWorker;
			if (!nsw)
				return;
			nsw.register("../sw.js");
		}
	</script>
	<body onload="loadSW()">
		<nav>
			<img height="100%" src="../images/LogoDark.svg" alt="MandoCreator Logo"/>
			<a class="return" href="../index.html"><span class="icon">&#xE90B;</span>Go Back</a>
		</nav>
		<main id="gallery">
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
			var svgs = gallery.children;
			var all = gallery.getElementsByTagName("use");
			var input = find("preset");

			var index = 0;
			var width = svgs[0].clientWidth;
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
					return gallery.getElementsByClassName("primary")[0];
				},
				set target (value) {
					var t = this.target;
					if (t === value)
						return;
					else if (t) {
						t.removeAttribute("class");
					}
					value.setAttribute("class", "primary");
					var use = value.firstElementChild;
					input.value = use.getAttribute("href").substring(1);
					if (!fromScroll) {
						var pos = (this.shift + 1/2)*width;
						gallery.scroll({left: pos, behavior: "smooth"});
					}
				},
				get shift () {
					return index;
				},
				set shift (value) {
					if (value < 0)
						value = 0;
					else if (value >= svgs.length)
						value = svgs.length - 1;
					index = value;
					this.target = svgs[this.shift];
				}
			};
			gallery.scroll(0,0);
			GallerySkeleton.sex = isFemale;
			GallerySkeleton.shift = 0;
			var fromScroll = false;
			gallery.addEventListener("scroll", function (event) {
				for (var i = 0; i < svgs.length; i++) {
					var rect = svgs[i].getBoundingClientRect();
					if (rect.left >= window.innerWidth/2) {
						fromScroll = true;
						GallerySkeleton.shift = i-1;
						fromScroll = false;
						break;
					}
				}
			});
			window.addEventListener("resize", function () {
				width = svgs[0].clientWidth;
			});
			return GallerySkeleton;
		}
		var female = find("female");
		var Gallery = new ArmorGallery(female.checked);
	</script>
</html>
