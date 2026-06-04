self.addEventListener('push', function(event) {
  const data = event.data?.json() ?? {};
  
  const title = data.title || 'Pengingat Pemilihan ITH';
  const options = {
    body: data.body || 'Ada pemilihan yang belum Anda ikuti.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: data.url || '/dashboard' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
