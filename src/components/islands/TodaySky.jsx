import { useEffect, useState } from 'react';
import { computeToday } from '../../lib/jyotish.js';

const PLAY = 'https://play.google.com/store/apps/details?id=com.grahachara.app&pcampaignid=web_share';
const fmt = (d) => (d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);
const range = (r) => (r ? `${fmt(r.start)} – ${fmt(r.end)}` : null);

const STR = {
  en: {
    eyebrow: "Today's Sky", title: 'Plan your day by the stars',
    rahu: 'Rahu Kalaya', yama: 'Yama Ganda', sunrise: 'Sunrise', sunset: 'Sunset', moonStar: "Moon's Star",
    avoid: 'avoid new beginnings', inaus: 'inauspicious hour', colombo: 'Colombo', todayNak: 'today’s nakshatra',
    cta: "Get today's subha nakath & rahu kalaya for your exact city",
    note: 'Auspicious times shown for Colombo. The app tunes every calculation to your own location.',
    locale: 'en-GB',
  },
  si: {
    eyebrow: 'අද අහස', title: 'තරු අනුව ඔබේ දවස සැලසුම් කරන්න',
    rahu: 'රාහු කාලය', yama: 'යමගණ්ඩය', sunrise: 'හිරු උදාව', sunset: 'හිරු බැසීම', moonStar: 'සඳුගේ නැකත',
    avoid: 'අලුත් දේ ආරම්භ නොකරන්න', inaus: 'අසුබ පැය', colombo: 'කොළඹ', todayNak: 'අද නැකත',
    cta: 'ඔබේ නිශ්චිත නගරයට අද සුබ නැකත සහ රාහු කාලය ලබාගන්න',
    note: 'සුබ වේලාවන් කොළඹට. යෙදුම සෑම ගණනයක්ම ඔබේ ස්ථානයට ගළපයි.',
    locale: 'si-LK',
  },
};

export default function TodaySky({ lang = 'en' }) {
  const s = STR[lang] || STR.en;
  const [t, setT] = useState(null);
  useEffect(() => { try { setT(computeToday()); } catch (_) {} }, []);

  const today = new Date().toLocaleDateString(s.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const cards = t ? [
    { k: s.rahu, v: range(t.rahu), sub: s.avoid, warn: true },
    { k: s.yama, v: range(t.yama), sub: s.inaus, warn: true },
    { k: s.sunrise, v: fmt(t.sunrise), sub: s.colombo },
    { k: s.sunset, v: fmt(t.sunset) },
    { k: s.moonStar, v: t.nakshatra, sub: s.todayNak },
  ].filter((c) => c.v) : [];

  return (
    <div className="pc-sky">
      <div className="pc-sky__head">
        <div className="pc-flourish" style={{ maxWidth: 260, margin: '0 auto 12px' }}>{s.eyebrow}</div>
        <h2 className="pc-section__title pc-gold-text">{s.title}</h2>
        <p className="pc-sky__date">{today}</p>
      </div>

      <div className="pc-sky__grid">
        {cards.map((c) => (
          <div className={`pc-card pc-sky__card${c.warn ? ' pc-sky__card--warn' : ''}`} key={c.k}>
            <span className="pc-sky__k">{c.k}</span>
            <span className={`pc-sky__v${c.warn ? '' : ' pc-gold-text'}`}>{c.v}</span>
            {c.sub && <span className="pc-sky__si">{c.sub}</span>}
          </div>
        ))}
      </div>

      <a className="pc-btn-gold pc-sky__cta" href={PLAY} target="_blank" rel="noopener">{s.cta}</a>
      <p className="pc-sky__note">{s.note}</p>
    </div>
  );
}
