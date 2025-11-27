// shared helper utilities used by Sidebar and ImageMeasure
export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function polygonAreaPixels(points) {
  if (!points || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    sum += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(sum) / 2;
}

export function formatLength(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(3)} km`;
  return `${m.toFixed(3)} m`;
}
export function formatArea(m2) {
  if (m2 >= 1000000) return `${(m2 / 1000000).toFixed(3)} km²`;
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(3)} ha`;
  return `${m2.toFixed(3)} m²`;
}
