self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        // Include the URLs of your cached assets here
        'http://localhost:3400/resources/views/home.ejs',
        'http://localhost:3400/resources/css/styles.css',   // Example CSS file
        'http://localhost:3400/resources/js/app.js',       // Example JavaScript file
        'http://localhost:3400/resources/img/logo.png',    // Example image file
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

