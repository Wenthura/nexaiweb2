import { useEffect, useState } from 'react';
import { dailyReading } from '../../lib/jyotish.js';
import { zodiac, zodiacSi } from '../../data/site.js';

const PLAY = 'https://play.google.com/store/apps/details?id=com.grahachara.app&pcampaignid=web_share';
const SWATCH = { Red: '#e06a5a', Orange: '#e0894a', Yellow: '#e6c84a', Green: '#6fb37a', Blue: '#6a8fd6', Indigo: '#6a5fb0', Violet: '#a06fd0', Gold: '#e2c25f', Silver: '#c9cdd8', White: '#eee9df', Pink: '#e090b0', Maroon: '#a05050' };
const MOOD = { Excellent: '#7dd3a8', Good: '#e2c25f', Challenging: '#e0894a' };

const STR = {
  en: {
    eyebrow: 'Your Daily Reading', pick: 'Pick your sign',
    pickSub: 'Get your reading today — then come back each morning for a fresh one.',
    todaySuffix: ', today', streak: (n) => `✦ ${n}-day streak — the sky remembers you`,
    today: 'Today', focus: 'Focus', also: 'Also touched', moonThrough: 'Moon travels through',
    luckyColour: 'Lucky colour', luckyNumbers: 'Lucky numbers',
    change: 'Change sign', cta: 'Get your reading from your real chart — not just your sign',
  },
  si: {
    eyebrow: 'ඔබේ දෛනික පලාපල', pick: 'ඔබේ රාශිය තෝරන්න',
    pickSub: 'අද ඔබේ පලාපල ලබාගන්න — ඉන්පසු සෑම උදෑසනකම අලුත් එකක් සඳහා නැවත එන්න.',
    todaySuffix: ', අද', streak: (n) => `✦ දින ${n}ක අඛණ්ඩතාව — අහස ඔබව මතක තබයි`,
    today: 'අද', focus: 'අවධානය', also: 'ස්පර්ශ වූ', moonThrough: 'සඳු ගමන් කරයි',
    luckyColour: 'වාසනාවන්ත වර්ණය', luckyNumbers: 'වාසනාවන්ත අංක',
    change: 'රාශිය වෙනස් කරන්න', cta: 'ඔබේ රාශියෙන් නොව ඔබේ නියම කේන්දරයෙන් පලාපල ලබාගන්න',
  },
};
const MOOD_SI = { Excellent: 'විශිෂ්ට', Good: 'හොඳ', Challenging: 'අභියෝගාත්මක' };
const COLOR_SI = { Red: 'රතු', Orange: 'තැඹිලි', Yellow: 'කහ', Green: 'කොළ', Blue: 'නිල්', Indigo: 'ඉන්දිගෝ', Violet: 'දම්', Gold: 'රන්වන්', Silver: 'රිදී', White: 'සුදු', Pink: 'රෝස', Maroon: 'මැරූන්' };
const AREA_SI = {
  'Self & Personality': 'ස්වයං සහ පෞරුෂය', 'Wealth & Family': 'ධනය සහ පවුල',
  'Communication & Courage': 'සන්නිවේදනය සහ ධෛර්යය', 'Home & Comfort': 'නිවස සහ සුවපහසුව',
  'Romance & Creativity': 'ආදරය සහ නිර්මාණශීලීත්වය', 'Health & Service': 'සෞඛ්‍යය සහ සේවය',
  'Partnerships & Marriage': 'හවුල්කාරිත්ව සහ විවාහය', 'Transformation & Occult': 'පරිවර්තනය සහ ගුප්ත',
  'Fortune & Spirituality': 'වාසනාව සහ අධ්‍යාත්මිකත්වය', 'Career & Status': 'රැකියාව සහ තත්ත්වය',
  'Gains & Aspirations': 'ලාභ සහ අභිලාෂ', 'Expenses & Liberation': 'වියදම් සහ මිදීම',
};

export default function DailyReading({ base = '', lang = 'en' }) {
  const si = lang === 'si';
  const s = STR[lang] || STR.en;
  const signs = si ? zodiacSi : zodiac;
  const signName = (rashi) => (si ? rashi.si : rashi.en.replace(/\s*\(.*/, ''));
  const tArea = (a) => (si ? AREA_SI[a] || a : a);
  const tColor = (c) => (si ? COLOR_SI[c] || c : c);
  const tMood = (m) => (si ? MOOD_SI[m] || m : m);
  const [signId, setSignId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [reading, setReading] = useState(null);

  useEffect(() => {
    let id = null;
    try { id = Number(localStorage.getItem('gc-rashi')) || null; } catch (_) {}
    if (id) setSignId(id);
    // streak
    try {
      const today = new Date().toISOString().split('T')[0];
      const raw = JSON.parse(localStorage.getItem('gc-streak') || '{}');
      const y = new Date(Date.now() - 864e5).toISOString().split('T')[0];
      let count = raw.count || 0;
      if (raw.last !== today) { count = raw.last === y ? count + 1 : 1; localStorage.setItem('gc-streak', JSON.stringify({ last: today, count })); }
      setStreak(count);
    } catch (_) {}
  }, []);

  useEffect(() => { if (signId) { try { setReading(dailyReading(signId)); } catch (_) {} } }, [signId]);

  const choose = (id) => { setSignId(id); try { localStorage.setItem('gc-rashi', String(id)); } catch (_) {} };

  if (!signId) {
    return (
      <div className="pc-daily">
        <div className="pc-section__head">
          <div className="pc-flourish" style={{ maxWidth: 260, margin: '0 auto 12px' }}>{s.eyebrow}</div>
          <h2 className="pc-section__title pc-gold-text">{s.pick}</h2>
          <p className="pc-section__sub">{s.pickSub}</p>
        </div>
        <div className="pc-daily__picker">
          {signs.map((z, i) => (
            <button className="pc-card pc-daily__sign" key={z.slug} onClick={() => choose(i + 1)} aria-label={z.name}>
              <img src={`${base}/assets/cosmos/z_${z.slug}.webp`} alt="" width="512" height="512" loading="lazy" />
              <span>{z.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const r = reading;
  return (
    <div className="pc-daily">
      <div className="pc-section__head">
        <div className="pc-flourish" style={{ maxWidth: 260, margin: '0 auto 12px' }}>{s.eyebrow}</div>
        <h2 className="pc-section__title pc-gold-text">{r ? signName(r.sign) : ''}{s.todaySuffix}</h2>
        {streak > 1 && <p className="pc-daily__streak">{s.streak(streak)}</p>}
      </div>

      {r && (
        <div className="pc-card pc-daily__card">
          <div className="pc-daily__overall" style={{ '--mood': MOOD[r.overall] }}>
            <span className="pc-daily__overall-k">{s.today}</span>
            <span className="pc-daily__overall-v">{tMood(r.overall)}</span>
          </div>
          <div className="pc-daily__rows">
            <div><span className="pc-daily__k">{s.focus}</span><span className="pc-daily__v pc-gold-text">{tArea(r.moonArea)}</span></div>
            <div><span className="pc-daily__k">{s.also}</span><span className="pc-daily__v">{tArea(r.sunArea)}</span></div>
            <div><span className="pc-daily__k">{s.moonThrough}</span><span className="pc-daily__v">{signName(r.moonIn)}</span></div>
            <div><span className="pc-daily__k">{s.luckyColour}</span><span className="pc-daily__v"><i className="pc-daily__swatch" style={{ background: SWATCH[r.luckyColor] || '#e2c25f' }}></i>{tColor(r.luckyColor)}</span></div>
            <div><span className="pc-daily__k">{s.luckyNumbers}</span><span className="pc-daily__v pc-gold-text">{r.luckyNumbers.join(' · ')}</span></div>
          </div>
        </div>
      )}

      <div className="pc-daily__foot">
        <button className="pc-daily__change" onClick={() => choose(null) || setSignId(null)}>{s.change}</button>
        <a className="pc-btn-gold" href={PLAY} target="_blank" rel="noopener">{s.cta}</a>
      </div>
    </div>
  );
}
