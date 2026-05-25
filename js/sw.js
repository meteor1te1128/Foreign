// sw.js — Service Worker 已停用，此文件用于注销旧版本
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
