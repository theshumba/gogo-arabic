/**
 * Service Worker Registration — Phase 72
 *
 * Registers the SW, listens for updates, and provides
 * a callback to notify the app when a new version is available.
 */

let swRegistration = null;

/**
 * Register the service worker and set up update detection
 * @param {Function} onUpdate - Called when a new SW version is waiting
 */
export function registerSW(onUpdate) {
  if (!('serviceWorker' in navigator)) return;

  // Never run the service worker in development. Its stale-while-revalidate JS
  // cache serves hashed Vite-optimizer chunks across dev-server restarts, which
  // mixes chunks from different optimizer generations and breaks React with
  // "Cannot read properties of null (reading 'useContext'/'useCallback')".
  // Proactively unregister any SW left over from a previous session and drop its
  // caches so existing dev environments self-heal on the next load.
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
    return;
  }

  window.addEventListener('load', async () => {
    try {
      // BASE_URL is '/' locally and '/gogo-arabic/' on GitHub Pages, so the SW
      // is registered at the correct scope on both.
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}sw.js`
      );
      swRegistration = registration;

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — notify the app
            if (onUpdate) onUpdate(registration);
          }
        });
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[SW] Registration failed:', err);
      }
    }
  });
}

/**
 * Tell the waiting SW to take over immediately
 */
export function applyUpdate() {
  if (!swRegistration?.waiting) return;
  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}
