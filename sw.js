// FinanDrive SW v12.3 2025-11-02T10:58:09.562990Z
self.addEventListener('install', (e)=>{ self.skipWaiting && self.skipWaiting(); });
self.addEventListener('activate', (e)=>{ self.clients && self.clients.claim && self.clients.claim(); });
