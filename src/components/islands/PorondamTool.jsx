import { useState } from 'react';
import { previewPorondam, birthString } from '../../lib/gcApi.js';
import { computeChart, compatibility } from '../../lib/jyotish.js';
import BirthPicker from './BirthPicker.jsx';

const PLAY = 'https://play.google.com/store/apps/details?id=com.grahachara.app&pcampaignid=web_share';

const STR = {
  en: {
    title: 'Quick Porondam check', sub: 'A free peek at your first three porondam — the full match lives in the app.',
    p1: 'Partner one', p2: 'Partner two', submit: 'Check compatibility', loading: 'Matching charts…',
    error: "Couldn't check right now — please try the app.",
    scoreLabel: 'on your first three porondam',
    shown: 'The first three porondam', lockedHead: 'The rest of your porondam',
    inApp: 'In the app', more: 'and more',
    guideTitle: 'What the full reading unlocks',
    guide: 'Your complete 20-porondam score, every porondam explained in plain words, dosha remedies, and your most auspicious wedding dates — all from both full charts.',
    cta: 'See your full Porondam — free on Google Play',
    porName: { Nadi: 'Nadi', Gana: 'Gana', Bhakoot: 'Bhakoot' },
    porGuide: {
      Nadi: ['Different Nadi — harmonious for health & children', 'Same Nadi — a health & progeny point to review'],
      Gana: ['Temperaments align beautifully', 'Different temperaments — worth understanding'],
      Bhakoot: ['Rashi placement supports the bond', 'Rashi placement needs a closer look'],
    },
    locked: ['Dina', 'Yoni', 'Rasi', 'Vasya', 'Rajju', 'Vedha', 'Mahendra'],
  },
  si: {
    title: 'ඉක්මන් පොරොන්දම් පරීක්ෂාව', sub: 'ඔබේ මුල් පොරොන්දම් තුන නොමිලේ බලන්න — සම්පූර්ණ ගැළපීම යෙදුමේ.',
    p1: 'පළමු අය', p2: 'දෙවන අය', submit: 'ගැළපීම පරීක්ෂා කරන්න', loading: 'කේන්දර ගළපමින්…',
    error: 'දැන් පරීක්ෂා කළ නොහැක — කරුණාකර යෙදුම උත්සාහ කරන්න.',
    scoreLabel: 'මුල් පොරොන්දම් තුනෙන්',
    shown: 'මුල් පොරොන්දම් තුන', lockedHead: 'ඉතිරි පොරොන්දම්',
    inApp: 'යෙදුමේ', more: 'තවත්',
    guideTitle: 'සම්පූර්ණ පලාපලින් අගුළු හැරෙන දේ',
    guide: 'ඔබේ සම්පූර්ණ පොරොන්දම් 20 ලකුණු, සෑම පොරොන්දමක්ම සරලව පැහැදිලි කර, දෝෂ පිළියම් සහ වඩාත්ම සුබ විවාහ දින — කේන්දර දෙකෙන්ම.',
    cta: 'ඔබේ සම්පූර්ණ පොරොන්දම් බලන්න — Google Play හි නොමිලේ',
    porName: { Nadi: 'නාඩි', Gana: 'ගණ', Bhakoot: 'භකූට' },
    porGuide: {
      Nadi: ['වෙනස් නාඩි — සෞඛ්‍යයට හා දරුඵලයට හිතකරයි', 'එකම නාඩි — සෞඛ්‍යය හා දරුඵල සලකා බැලිය යුතුයි'],
      Gana: ['ගති ස්වභාව මනාව ගැළපේ', 'ගති ස්වභාව වෙනස් — තේරුම් ගැනීම වටී'],
      Bhakoot: ['රාශි පිහිටීම බැඳීමට හිතකරයි', 'රාශි පිහිටීම වඩාත් සැලකිල්ලක් ඉල්ලයි'],
    },
    locked: ['දින', 'යෝනි', 'රාශි', 'වශ්‍ය', 'රජ්ජු', 'වේධ', 'මහේන්ද්‍ර'],
  },
};

function toChart(date, time) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = (time || '12:00').split(':').map(Number);
  return computeChart({ year: y, month: mo, day: d, hour: h, minute: mi, tzMinutes: 330 });
}

export default function PorondamTool({ lang = 'en' }) {
  const s = STR[lang] || STR.en;
  const [a, setA] = useState({ date: '', time: '12:00' });
  const [b, setB] = useState({ date: '', time: '12:00' });
  const [state, setState] = useState('idle');
  const [res, setRes] = useState(null);   // optional server archetype
  const [fb, setFb] = useState(null);     // the 3-porondam breakdown (always)

  async function onSubmit(e) {
    e.preventDefault();
    if (!a.date || !b.date) return;
    setState('loading'); setFb(null); setRes(null);
    let cfb = null;
    try { cfb = compatibility(toChart(a.date, a.time), toChart(b.date, b.time)); }
    catch { setState('error'); return; }
    try {
      const d = await previewPorondam(
        { birthDate: birthString(a.date, a.time) },
        { birthDate: birthString(b.date, b.time) },
      );
      setRes(d && d.en ? d.en : null);
    } catch (_) { /* offline — the 3-porondam breakdown still shows */ }
    setFb(cfb); setState('done');
  }

  const person = (label, val, set) => (
    <fieldset className="pc-tool__person">
      <legend>{label}</legend>
      <BirthPicker value={val} onChange={(v) => set(v)} />
    </fieldset>
  );

  return (
    <div className="pc-card pc-tool">
      <div className="pc-tool__head">
        <h3 className="pc-tool__title pc-gold-text">{s.title}</h3>
        <p className="pc-tool__sub">{s.sub}</p>
      </div>

      <form className="pc-tool__form pc-tool__form--couple" onSubmit={onSubmit}>
        {person(s.p1, a, setA)}
        {person(s.p2, b, setB)}
        <button className="pc-btn-gold" type="submit" disabled={state === 'loading'}>
          {state === 'loading' ? s.loading : s.submit}
        </button>
      </form>

      {state === 'error' && <p className="pc-tool__err">{s.error}</p>}

      {state === 'done' && fb && (
        <div className="pc-poro-result">
          {res && res.archetype && (
            <div className="pc-poro-arch">
              <span className="pc-poro-arch__band">{res.archetype.bandLabel}</span>
              <div className="pc-poro-arch__name pc-gold-text">{res.archetype.name}</div>
              {res.archetype.essence && <p className="pc-poro-arch__essence">{res.archetype.essence}</p>}
            </div>
          )}

          <div className="pc-poro-score">
            <div className="pc-poro-gauge" style={{ '--pct': fb.percent }}>
              <span>{fb.percent}<small>%</small></span>
            </div>
            <div className="pc-poro-score__txt">
              <div className="pc-poro-score__verdict pc-gold-text">{fb.verdict}</div>
              <div className="pc-poro-score__sub">{fb.got}/{fb.max} {s.scoreLabel}</div>
            </div>
          </div>

          <div className="pc-poro-group__label">{s.shown}</div>
          <ul className="pc-poro-list">
            {fb.checks.map((c) => (
              <li className={`pc-poro${c.ok ? ' is-ok' : ' is-warn'}`} key={c.name}>
                <span className="pc-poro__mark" aria-hidden="true">{c.ok ? '✓' : '!'}</span>
                <span className="pc-poro__body">
                  <span className="pc-poro__name">{s.porName[c.name] || c.name}<em>{c.got}/{c.max}</em></span>
                  <span className="pc-poro__note">{(s.porGuide[c.name] || ['', ''])[c.ok ? 0 : 1]}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="pc-poro-group__label">{s.lockedHead}</div>
          <ul className="pc-poro-list pc-poro-list--locked">
            {s.locked.map((name) => (
              <li className="pc-poro is-locked" key={name}>
                <span className="pc-poro__mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
                </span>
                <span className="pc-poro__body">
                  <span className="pc-poro__name">{name}</span>
                  <span className="pc-poro__note">{s.inApp}</span>
                </span>
              </li>
            ))}
            <li className="pc-poro is-locked pc-poro--more"><span className="pc-poro__body"><span className="pc-poro__name">+ {s.more}</span></span></li>
          </ul>

          <div className="pc-poro-guide">
            <span className="pc-poro-guide__title pc-gold-text">{s.guideTitle}</span>
            <p>{s.guide}</p>
          </div>

          <a className="pc-btn-gold pc-tool__cta" href={PLAY} target="_blank" rel="noopener">{s.cta}</a>
        </div>
      )}
    </div>
  );
}
