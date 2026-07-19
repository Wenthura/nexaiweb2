// Grahachara public preview API — no auth (optionalAuth), CORS allows grahachara.com.
// These are the app's own free funnel endpoints: they return the "reveal" hook and
// deliberately withhold the paid payload (full chart, X/20 score, reports).
const API_BASE = 'https://api.grahachara.com';
const COLOMBO = { lat: 6.9271, lng: 79.8612 };

async function post(path, body, ms = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
    return j.data;
  } finally {
    clearTimeout(timer);
  }
}

export const previewKendara = (birthDate, lat = COLOMBO.lat, lng = COLOMBO.lng) =>
  post('/api/preview/kendara', { birthDate, lat, lng });

export const previewPorondam = (bride, groom) =>
  post('/api/preview/porondam', { bride, groom });

export async function previewToday(lat = COLOMBO.lat, lng = COLOMBO.lng, ms = 10000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(`${API_BASE}/api/preview/today?lat=${lat}&lng=${lng}`, { signal: ctrl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
    return j.data;
  } finally {
    clearTimeout(timer);
  }
}

// Build an ISO-ish local birth string the API understands (treated as Sri Lanka local time).
export function birthString(date, time) {
  if (!date) return null;
  return `${date}T${time || '12:00'}:00`;
}

export { COLOMBO, API_BASE };
