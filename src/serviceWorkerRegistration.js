/**
 * Registers the Equator service worker in production builds.
 *
 * The service worker caches static files (JS/CSS/images/fonts) so the browser
 * does not re-download the app shell every time the user navigates back to a
 * page. API responses are cached by the dedicated API cache layer instead.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/equator-sw.js")
      .catch((error) => {
        console.warn("[Equator SW] Registration failed:", error);
      });
  });
}
