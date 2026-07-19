// Client-side Vedic (sidereal) basics — accurate enough for a Rashi/Nakshatra
// preview. The full chart (houses, lagna, dashas, navamsha) lives in the app.
import * as Astronomy from 'astronomy-engine';

export const RASHIS = [
  { en: 'Mesha (Aries)', si: 'මේෂ' }, { en: 'Vrishabha (Taurus)', si: 'වෘෂභ' },
  { en: 'Mithuna (Gemini)', si: 'මිථුන' }, { en: 'Karka (Cancer)', si: 'කටක' },
  { en: 'Simha (Leo)', si: 'සිංහ' }, { en: 'Kanya (Virgo)', si: 'කන්‍යා' },
  { en: 'Tula (Libra)', si: 'තුලා' }, { en: 'Vrischika (Scorpio)', si: 'වෘශ්චික' },
  { en: 'Dhanu (Sagittarius)', si: 'ධනු' }, { en: 'Makara (Capricorn)', si: 'මකර' },
  { en: 'Kumbha (Aquarius)', si: 'කුම්භ' }, { en: 'Meena (Pisces)', si: 'මීන' },
];

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

const norm360 = (x) => ((x % 360) + 360) % 360;

// Lahiri ayanamsa (arc-seconds rate ~50.288"/yr, ~23.853° at J2000)
function ayanamsa(time) {
  const yearsFromJ2000 = time.ut / 365.25;
  return 23.853 + yearsFromJ2000 * (50.288 / 3600);
}

// birth: { year, month(1-12), day, hour(0-23), minute, tzMinutes } — tzMinutes = local offset from UTC (Sri Lanka = 330)
export function computeChart(birth) {
  const utcMs = Date.UTC(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute)
    - birth.tzMinutes * 60000;
  const time = Astronomy.MakeTime(new Date(utcMs));
  const ay = ayanamsa(time);

  const moonTrop = Astronomy.EclipticGeoMoon(time).lon;
  const sunTrop = Astronomy.SunPosition(time).elon;
  const moonSid = norm360(moonTrop - ay);
  const sunSid = norm360(sunTrop - ay);

  const nakSize = 360 / 27;        // 13°20'
  const nakIndex = Math.floor(moonSid / nakSize);
  const pada = Math.floor((moonSid % nakSize) / (nakSize / 4)) + 1;

  return {
    moonSid, sunSid,
    rashiIndex: Math.floor(moonSid / 30),
    rashi: RASHIS[Math.floor(moonSid / 30)],
    sunRashiIndex: Math.floor(sunSid / 30),
    sunRashi: RASHIS[Math.floor(sunSid / 30)],
    nakIndex,
    nakshatra: NAKSHATRAS[nakIndex],
    pada,
  };
}

/* ── Full D1 Rashi chart (all nine grahas) — offline fallback for the
      shareable chart when the live API isn't reachable ──────────────────── */
export const GRAHA_ABBR = {
  sun: 'Su', moon: 'Mo', mercury: 'Me', venus: 'Ve', mars: 'Ma',
  jupiter: 'Ju', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

const GRAHAS = [
  { key: 'sun', name: 'Sun' }, { key: 'moon', name: 'Moon' },
  { key: 'mercury', name: 'Mercury' }, { key: 'venus', name: 'Venus' },
  { key: 'mars', name: 'Mars' }, { key: 'jupiter', name: 'Jupiter' },
  { key: 'saturn', name: 'Saturn' }, { key: 'rahu', name: 'Rahu' },
  { key: 'ketu', name: 'Ketu' },
];

// Sidereal ascendant longitude (default location: Colombo)
function ascendantSidereal(time, latDeg, lngDeg, ay) {
  const ramc = norm360(Astronomy.SiderealTime(time) * 15 + lngDeg);
  const eps = 23.4392911 * Math.PI / 180;
  const r = ramc * Math.PI / 180, phi = latDeg * Math.PI / 180;
  let asc = Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return norm360(norm360(asc * 180 / Math.PI) - ay);
}

// Returns { cells: [{rashiId, rashiEnglish, rashiSinhala, planets:[{key,name,degree}]}], lagnaRashiId }
export function computeRashiChart(birth) {
  const utcMs = Date.UTC(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute)
    - birth.tzMinutes * 60000;
  const time = Astronomy.MakeTime(new Date(utcMs));
  const ay = ayanamsa(time);
  const lat = birth.lat ?? 6.9271, lng = birth.lng ?? 79.8612;
  const lagnaRashiId = Math.floor(ascendantSidereal(time, lat, lng, ay) / 30) + 1;

  const trop = {
    sun: Astronomy.SunPosition(time).elon,
    moon: Astronomy.EclipticGeoMoon(time).lon,
    mercury: Astronomy.EclipticLongitude(Astronomy.Body.Mercury, time),
    venus: Astronomy.EclipticLongitude(Astronomy.Body.Venus, time),
    mars: Astronomy.EclipticLongitude(Astronomy.Body.Mars, time),
    jupiter: Astronomy.EclipticLongitude(Astronomy.Body.Jupiter, time),
    saturn: Astronomy.EclipticLongitude(Astronomy.Body.Saturn, time),
    rahu: norm360(125.04452 - 0.0529538083 * time.ut),
  };
  trop.ketu = norm360(trop.rahu + 180);

  const cells = RASHIS.map((r, i) => ({
    rashiId: i + 1, rashiEnglish: r.en.replace(/\s*\(.*/, ''), rashiSinhala: r.si, planets: [],
  }));
  for (const g of GRAHAS) {
    const sid = norm360(trop[g.key] - ay);
    const rid = Math.floor(sid / 30);
    cells[rid].planets.push({ key: g.key, name: g.name, degree: sid % 30 });
  }
  return { cells, lagnaRashiId };
}

/* ── Today's sky — computed client-side (accurate, no API needed) ─────── */
// Which of the 8 daytime parts each period falls in, by weekday (0=Sun..6=Sat)
const RK_IDX = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
const YG_IDX = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
const slot = (sr, dur, idx) => ({ start: new Date(sr.getTime() + (idx - 1) * dur), end: new Date(sr.getTime() + idx * dur) });

// Colombo default; pass geolocation lat/lng for the visitor's own city.
export function computeToday(lat = 6.9271, lng = 79.8612) {
  const now = new Date();
  const obs = new Astronomy.Observer(lat, lng, 0);
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  const t0 = Astronomy.MakeTime(d0);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, 1, t0, 1);
  const set = rise ? Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, rise, 1) : null;
  const sr = rise ? rise.date : null, ss = set ? set.date : null;
  const wd = now.getDay();
  let rahu = null, yama = null;
  if (sr && ss) { const dur = (ss - sr) / 8; rahu = slot(sr, dur, RK_IDX[wd]); yama = slot(sr, dur, YG_IDX[wd]); }
  const c = computeChart({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: now.getHours(), minute: now.getMinutes(), tzMinutes: -now.getTimezoneOffset() });
  return { sunrise: sr, sunset: ss, rahu, yama, nakshatra: c.nakshatra, moonRashi: c.rashi };
}

/* ── Daily reading per sign — faithful client port of the app's
      /api/horoscope/daily/:sign algorithm (moon-transit house + lucky) ──── */
const HOUSE_MEANINGS = {
  1: { area: 'Self & Personality', luck: 'high' }, 2: { area: 'Wealth & Family', luck: 'medium' },
  3: { area: 'Communication & Courage', luck: 'high' }, 4: { area: 'Home & Comfort', luck: 'medium' },
  5: { area: 'Romance & Creativity', luck: 'high' }, 6: { area: 'Health & Service', luck: 'low' },
  7: { area: 'Partnerships & Marriage', luck: 'high' }, 8: { area: 'Transformation & Occult', luck: 'low' },
  9: { area: 'Fortune & Spirituality', luck: 'high' }, 10: { area: 'Career & Status', luck: 'high' },
  11: { area: 'Gains & Aspirations', luck: 'high' }, 12: { area: 'Expenses & Liberation', luck: 'low' },
};
const DAILY_COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Gold', 'Silver', 'White', 'Pink', 'Maroon'];

export function dailyReading(rashiId) {
  const now = new Date();
  const c = computeChart({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: now.getHours(), minute: now.getMinutes(), tzMinutes: -now.getTimezoneOffset() });
  const moonId = c.rashiIndex + 1, sunId = c.sunRashiIndex + 1;
  const md = ((moonId - rashiId + 12) % 12) + 1, sd = ((sunId - rashiId + 12) % 12) + 1;
  const moonH = HOUSE_MEANINGS[md], sunH = HOUSE_MEANINGS[sd];
  const overall = (moonH.luck === 'high' && sunH.luck === 'high') ? 'Excellent'
    : (moonH.luck === 'high' || sunH.luck === 'high') ? 'Good' : 'Challenging';
  return {
    date: now.toISOString().split('T')[0],
    sign: RASHIS[rashiId - 1],
    moonIn: RASHIS[moonId - 1],
    moonArea: moonH.area, sunArea: sunH.area, overall,
    luckyNumbers: [...new Set([(rashiId * 3 + now.getDate()) % 9 + 1, (rashiId * 7 + now.getDate()) % 9 + 1])],
    luckyColor: DAILY_COLORS[(rashiId + now.getDay()) % DAILY_COLORS.length],
  };
}

/* ── Porondam / compatibility preview: Nadi, Gana, Bhakoot ────────────── */
const NADI = { // 0 Aadi, 1 Madhya, 2 Antya
  0: 0, 5: 0, 6: 0, 11: 0, 12: 0, 17: 0, 18: 0, 23: 0, 24: 0,
  1: 1, 4: 1, 7: 1, 10: 1, 13: 1, 16: 1, 19: 1, 22: 1, 25: 1,
  2: 2, 3: 2, 8: 2, 9: 2, 14: 2, 15: 2, 20: 2, 21: 2, 26: 2,
};
const GANA = { // 0 Deva, 1 Manushya, 2 Rakshasa
  0: 0, 4: 0, 6: 0, 7: 0, 12: 0, 14: 0, 16: 0, 21: 0, 26: 0,
  1: 1, 3: 1, 5: 1, 10: 1, 11: 1, 19: 1, 20: 1, 24: 1, 25: 1,
  2: 2, 8: 2, 9: 2, 13: 2, 15: 2, 17: 2, 18: 2, 22: 2, 23: 2,
};
const GANA_NAMES = ['Deva', 'Manushya', 'Rakshasa'];
// symmetric points out of 6
const GANA_POINTS = [
  [6, 5, 1],
  [5, 6, 0],
  [1, 0, 6],
];

export function compatibility(aChart, bChart) {
  const an = aChart.nakIndex, bn = bChart.nakIndex;
  const ar = aChart.rashiIndex, br = bChart.rashiIndex;

  // Nadi (8): different nadi is good, same is dosha
  const nadiSame = NADI[an] === NADI[bn];
  const nadi = { name: 'Nadi', got: nadiSame ? 0 : 8, max: 8, ok: !nadiSame,
    note: nadiSame ? 'Same Nadi — health/progeny caution' : 'Different Nadi — harmonious' };

  // Gana (6)
  const gpts = GANA_POINTS[GANA[an]][GANA[bn]];
  const gana = { name: 'Gana', got: gpts, max: 6, ok: gpts >= 5,
    note: `${GANA_NAMES[GANA[an]]} · ${GANA_NAMES[GANA[bn]]} — temperament match` };

  // Bhakoot / Rashi (7): dosha pairs 2-12, 6-8, 5-9
  const c1 = ((br - ar + 12) % 12) + 1;
  const c2 = ((ar - br + 12) % 12) + 1;
  const pair = [Math.min(c1, c2), Math.max(c1, c2)].join('-');
  const bhakootDosha = ['2-12', '6-8', '5-9'].includes(pair);
  const bhakoot = { name: 'Bhakoot', got: bhakootDosha ? 0 : 7, max: 7, ok: !bhakootDosha,
    note: bhakootDosha ? 'Rashi placement caution' : 'Rashi placement supportive' };

  const checks = [nadi, gana, bhakoot];
  const got = checks.reduce((s, c) => s + c.got, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const percent = Math.round((got / max) * 100);
  let verdict;
  if (percent >= 75) verdict = 'Strong match';
  else if (percent >= 50) verdict = 'Promising — worth a full reading';
  else verdict = 'Needs a closer look';

  return { checks, got, max, percent, verdict };
}
