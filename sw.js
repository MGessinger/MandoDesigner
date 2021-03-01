"use strict";
const CACHE_NAME = "MandoCreatorCachev1";

self.addEventListener("install", function (event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(c => c.addAll( [
			'index.html',
			'editor.js',
			"upload.js",
			"color.js",
			"stylesheet.css",
			"color.css",
			"images/Helmets.svg"
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
				if (key !== CACHE_NAME)
					return caches.delete(key);
			}));
		})
	);
});

self.addEventListener('fetch', function(event) {
	var er = event.request;
	event.respondWith(
		caches.match(er).then(r0 => {
			return r0 || fetch(er).then(r => {
				if (r.ok) {
					var clone = r.clone();
					caches.open(CACHE_NAME).then(c => c.put(er, clone));
				}
				return r;
			});
		})
	);
});
