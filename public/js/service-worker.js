const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";


const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

self.addEventListener("install", function(event) {
    //install steps run
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Opened cache"); 
            return cache.addAll(urlsToCache); 
        })
    );
});

self.addEventListener("fetch", function(event) {

    if(event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone()); 
                    }
                    return response; 
                })

                .catch(err => {
                    return cache.match(event.request); 
                }); 
            }).catch(err => console.log(err))
        ); 
        return; 
    }
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request).then(function(response) {
                if (response) {
                    return response; 
                } else if (event.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/"); 
                }
            });
        })
    );
});