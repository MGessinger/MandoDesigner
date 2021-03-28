"use strict";
const MAIN = "MCCachev01";
const IMGS = "Galleryv01";

self.addEventListener("install", function (event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open(MAIN)
		.then(c => c.addAll( [
			'index.html',
			'editor.js',
			"color.js",
			"stylesheet.css",
			"color.css"
		]))
	);
});

this.addEventListener('activate', function(event) {
	self.clients.matchAll({includeUncontrolled: true})
	.then(cls => cls[0].postMessage("NewVersion"));
	event.waitUntil(
		caches.keys()
		.then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== MAIN && key != IMGS)
					return caches.delete(key);
			}));
		})
	);
});

self.addEventListener('fetch', function(event) {
	var er = event.request;
	var url = er.url;
	event.respondWith(
		caches.match(er).then(r0 => {
			return r0 || fetch(er).then(r => {
				if (r.ok) {
					var clone = r.clone();
					if (url.endsWith("svg"))
						caches.open(IMGS).then(c => c.put(er, clone));
					else if (!url.includes("gallery"))
						caches.open(MAIN).then(c => c.put(er, clone));
				}
				return r;
			});
		})
	);
});
