export function isPerfOverlayEnabled({ search = '' }) {
  return new URLSearchParams(search).has('perf');
}
