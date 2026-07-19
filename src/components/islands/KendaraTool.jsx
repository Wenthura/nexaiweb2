import { useState } from 'react';
import { previewKendara, birthString } from '../../lib/gcApi.js';
import { computeChart, computeRashiChart, RASHIS } from '../../lib/jyotish.js';
const shortSign = (s) => (s ? s.replace(/\s*\(.*/, '') : s);
import KendaraChart from './KendaraChart.jsx';
import BirthPicker from './BirthPicker.jsx';

const PLAY = 'https://play.google.com/store/apps/details?id=com.grahachara.app&pcampaignid=web_share';

const STR = {
  en: {
    title: 'Create your Kendara', sub: 'Free — your real chart to keep, share & download.',
    pickLabel: 'Your birth date & time', submit: 'Create my Kendara', loading: 'Casting your chart…',
    error: "Couldn't cast the chart right now — please try the app.",
    rLagna: 'Lagna', rLagnaAsc: 'Lagna (Ascendant)', rMoon: 'Moon sign (Rashi)', rSun: 'Sun sign', rNak: 'Nakshatra',
    lockedH: 'In the full kendara →',
    locked: ['Navamsha (marriage chart)', 'Dasha & antardasha timeline', 'House-by-house analysis', '25-year life predictions'],
    cta: 'Get your full Kendara — free on Google Play',
    note: 'Offline estimate. The app pinpoints your exact Lagna from your birthplace.',
  },
  si: {
    title: 'ඔබේ කේන්දරය සාදන්න', sub: 'නොමිලේ — තබා ගැනීමට, බෙදා ගැනීමට සහ බාගැනීමට ඔබේ නියම කේන්දරය.',
    pickLabel: 'ඔබේ උපන් දිනය සහ වේලාව', submit: 'මගේ කේන්දරය සාදන්න', loading: 'කේන්දරය සකසමින්…',
    error: 'දැන් කේන්දරය සෑදිය නොහැක — කරුණාකර යෙදුම උත්සාහ කරන්න.',
    rLagna: 'ලග්නය', rLagnaAsc: 'ලග්නය', rMoon: 'චන්ද්‍ර රාශිය', rSun: 'රවි රාශිය', rNak: 'නක්ෂත්‍රය',
    lockedH: 'සම්පූර්ණ කේන්දරයේ →',
    locked: ['නවාංශක (විවාහ කේන්දරය)', 'දශා සහ අන්තර්දශා කාලරේඛාව', 'භාව අනුව විශ්ලේෂණය', 'අවුරුදු 25 ජීවිත පලාපල'],
    cta: 'ඔබේ සම්පූර්ණ කේන්දරය ලබාගන්න — Google Play හි නොමිලේ',
    note: 'අන්තර්ජාලයෙන් තොර ඇස්තමේන්තුවක්. යෙදුම ඔබේ උපන් ස්ථානයෙන් නිශ්චිත ලග්නය සොයයි.',
  },
};

function parseBirth(date, time) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = (time || '12:00').split(':').map(Number);
  return { year: y, month: mo, day: d, hour: h, minute: mi, tzMinutes: 330 };
}
function prettyBirth(date, time) {
  const d = new Date(`${date}T${time || '12:00'}:00`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + (time || '12:00');
}

export default function KendaraTool({ lang = 'en' }) {
  const s = STR[lang] || STR.en;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [state, setState] = useState('idle');
  const [view, setView] = useState(null); // { rows, chart, meta, fallback }

  async function onSubmit(e) {
    e.preventDefault();
    if (!date) return;
    setState('loading');
    const birth = parseBirth(date, time);
    try {
      const d = await previewKendara(birthString(date, time));
      setView({
        fallback: false,
        rows: [
          [s.rLagna, d.lagna && (d.lagna.english || d.lagna.name), d.lagna && d.lagna.sinhala],
          [s.rMoon, d.moonSign && (d.moonSign.english || d.moonSign.name), d.moonSign && d.moonSign.sinhala],
          [s.rSun, d.sunSign && (d.sunSign.english || d.sunSign.name), d.sunSign && d.sunSign.sinhala],
          [s.rNak, d.nakshatra && `${d.nakshatra.name}${d.nakshatra.pada ? ` · pada ${d.nakshatra.pada}` : ''}`, d.nakshatra && d.nakshatra.sinhala],
        ],
        chart: { cells: d.rashiChart, lagnaRashiId: d.lagna && d.lagna.rashiId },
        meta: {
          birth: prettyBirth(date, time),
          lagna: d.lagna && (d.lagna.english || d.lagna.name),
          rashi: d.moonSign && (d.moonSign.english || d.moonSign.name),
          nakshatra: d.nakshatra && `${d.nakshatra.name}${d.nakshatra.pada ? ` (${d.nakshatra.pada})` : ''}`,
        },
      });
      setState('done');
    } catch (_) {
      try {
        const c = computeChart(birth);
        const rc = computeRashiChart(birth);
        const lagnaEn = shortSign(RASHIS[rc.lagnaRashiId - 1].en);
        setView({
          fallback: true,
          rows: [
            [s.rLagnaAsc, lagnaEn, RASHIS[rc.lagnaRashiId - 1].si],
            [s.rMoon, shortSign(c.rashi.en), c.rashi.si],
            [s.rSun, shortSign(c.sunRashi.en), c.sunRashi.si],
            [s.rNak, `${c.nakshatra} · pada ${c.pada}`, null],
          ],
          chart: { cells: rc.cells, lagnaRashiId: rc.lagnaRashiId },
          meta: {
            birth: prettyBirth(date, time),
            lagna: lagnaEn, rashi: shortSign(c.rashi.en), nakshatra: `${c.nakshatra} (${c.pada})`,
          },
        });
        setState('done');
      } catch { setState('error'); }
    }
  }

  return (
    <div className="pc-card pc-tool">
      <div className="pc-tool__head">
        <h3 className="pc-tool__title pc-gold-text">{s.title}</h3>
        <p className="pc-tool__sub">{s.sub}</p>
      </div>

      <form className="pc-tool__form" onSubmit={onSubmit}>
        <BirthPicker label={s.pickLabel} value={{ date, time }} onChange={(v) => { setDate(v.date); setTime(v.time); }} />
        <button className="pc-btn-gold" type="submit" disabled={state === 'loading' || !date}>
          {state === 'loading' ? s.loading : s.submit}
        </button>
      </form>

      {state === 'error' && <p className="pc-tool__err">{s.error}</p>}

      {state === 'done' && view && (
        <div className="pc-tool__result">
          <KendaraChart cells={view.chart.cells} lagnaRashiId={view.chart.lagnaRashiId} meta={view.meta} lang={lang} />

          <div className="pc-tool__rows">
            {view.rows.filter((r) => r[1]).map((r) => (
              <div className="pc-tool__row" key={r[0]}>
                <span className="pc-tool__k">{r[0]}</span>
                <span className="pc-tool__v">{r[1]}{r[2] ? <em lang="si"> · {r[2]}</em> : null}</span>
              </div>
            ))}
          </div>

          <div className="pc-tool__locked">
            <span className="pc-tool__locked-h">{s.lockedH}</span>
            <ul>{s.locked.map((li) => <li key={li}>{li}</li>)}</ul>
          </div>

          <a className="pc-btn-gold pc-tool__cta" href={PLAY} target="_blank" rel="noopener">{s.cta}</a>
          {view.fallback && <p className="pc-tool__note">{s.note}</p>}
        </div>
      )}
    </div>
  );
}
