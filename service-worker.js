self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        // Include the URLs of your cached assets here
        'https://starfish-app-nki4g.ondigitalocean.app//resources/views/home.ejs',
        'https://starfish-app-nki4g.ondigitalocean.app//resources/css/styles.css',   // Example CSS file
        'https://starfish-app-nki4g.ondigitalocean.app//resources/js/app.js',       // Example JavaScript file
        'https://starfish-app-nki4g.ondigitalocean.app//resources/img/logo.png',    // Example image file
        // Add more URLs as needed
      ])
      .catch((error) => {
        console.error('Failed to cache resources', error)
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

