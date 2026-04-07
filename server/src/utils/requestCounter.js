/**
 * requestCounter.js
 * Simple in-memory request counter for health diagnostics.
 */

let count = 0;

export function incrementRequestCount() {
  count++;
}

export function getRequestCount() {
  return count;
}

/** Express middleware — call before routes to count all incoming requests */
export function requestCounterMiddleware(_req, _res, next) {
  count++;
  next();
}
