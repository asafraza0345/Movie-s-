
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_DOWNLOAD') {
    const { movieId, assets, title } = event.data.payload;
    
    // Simulate background download
    handleDownload(movieId, assets, title);
  }
});

async function handleDownload(movieId, assets, title) {
  const cache = await caches.open('offline-videos');
  
  // Cache assets (images, metadata, etc)
  try {
    await cache.addAll(assets);
    
    // Notify clients that download is complete
    const allClients = await clients.matchAll();
    allClients.forEach(client => {
      client.postMessage({
        type: 'DOWNLOAD_COMPLETE',
        payload: { movieId, title }
      });
    });
  } catch (error) {
    console.error('Download failed for', title, error);
    const allClients = await clients.matchAll();
    allClients.forEach(client => {
      client.postMessage({
        type: 'DOWNLOAD_ERROR',
        payload: { movieId, title, error: error.message }
      });
    });
  }
}
