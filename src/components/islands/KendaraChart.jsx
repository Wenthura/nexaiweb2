import { useRef, useState, useEffect } from 'react';
import { LOGO_DATA } from '../../lib/logoData.js';
import { RASHIS } from '../../lib/jyotish.js';
import TarotCanvas from './TarotCanvas.jsx';

/* planet names, English & Sinhala, by graha key */
const PNAME = {
  sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter',
  venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu',
};
const PNAME_SI = {
  sun: 'රවි', moon: 'චන්ද්‍ර', mars: 'කුජ', mercury: 'බුධ', jupiter: 'ගුරු',
  venus: 'සිකුරු', saturn: 'ශනි', rahu: 'රාහු', ketu: 'කේතු',
};
/* zodiac emblem slug by rashiId (1 = Aries … 12 = Pisces) */
const ZSLUG = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
function signNames(rashiId) {
  const full = (RASHIS[(rashiId || 1) - 1] || {}).en || '';
  const m = full.match(/^(.*?)\s*\((.*?)\)/);
  return { vedic: m ? m[1] : full, english: m ? m[2] : '' };
}

/* Chart-first kendara card. The ornate gold frame is a real generated surface
   relit in WebGL with its normal / roughness / height maps (gold catches the
   moving light, same as the feature cards); the Sri Lankan chart is a clean
   transparent SVG laid over the empty centre. Export composites frame + chart. */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const FRAME_URL = `${BASE}/assets/cosmos/kframe.webp`;

const PCOLOR = {
  sun: '#fbbf24', moon: '#c7d2fe', mars: '#f87171', mercury: '#6ee7b7',
  jupiter: '#fbbf24', venus: '#f9a8d4', saturn: '#a5b4fc', rahu: '#94a3b8', ketu: '#c4b5fd',
};
const VW = 896, VH = 1152;                    // matches the frame image
const CS = 470, CX0 = 213, CY0 = 348;         // chart sits in the frame's clear centre
const t1 = CS / 3, t2 = (2 * CS) / 3;
const HCF = {
  1: [0.5, 0.167], 4: [0.167, 0.5], 7: [0.5, 0.833], 10: [0.833, 0.5],
  2: [0.111, 0.111], 3: [0.222, 0.222], 12: [0.889, 0.111], 11: [0.778, 0.222],
  6: [0.222, 0.778], 5: [0.111, 0.889], 9: [0.778, 0.778], 8: [0.889, 0.889],
};
const GOLD = 'rgba(245,210,120,0.85)', LINE = 'rgba(245,210,120,0.45)';

/* Composite the static frame + the transparent chart SVG into one PNG. */
function exportPng(svgEl, scale = 2) {
  return new Promise((resolve, reject) => {
    const xml = new XMLSerializer().serializeToString(svgEl);
    const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    const c = document.createElement('canvas'); c.width = VW * scale; c.height = VH * scale;
    const x = c.getContext('2d');
    const frame = new Image(); const over = new Image();
    let n = 0;
    const paint = () => {
      x.fillStyle = '#070812'; x.fillRect(0, 0, c.width, c.height);
      if (frame.complete && frame.naturalWidth) x.drawImage(frame, 0, 0, c.width, c.height);
      x.drawImage(over, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png');
    };
    const tick = () => { if (++n === 2) paint(); };
    frame.onload = tick; frame.onerror = tick;   // fall back to dark bg if frame missing
    over.onload = tick; over.onerror = reject;
    frame.src = FRAME_URL; over.src = svgUrl;
  });
}

const CSTR = {
  en: { subtitle: 'JANMA KENDARA', lagna: 'Lagna', rashi: 'Rashi', await: 'Your full reading awaits in the Grahachara app', foot: 'grahachara.com · Google Play', share: 'Share my chart', preparing: 'Preparing…', download: 'Download PNG', langLabel: 'Chart language' },
  si: { subtitle: 'ජන්ම කේන්දරය', lagna: 'ලග්නය', rashi: 'රාශිය', await: 'ඔබේ සම්පූර්ණ පලාපල Grahachara යෙදුමේ', foot: 'grahachara.com · Google Play', share: 'මගේ කේන්දරය බෙදන්න', preparing: 'සූදානම් වෙමින්…', download: 'PNG බාගන්න', langLabel: 'කේන්දර භාෂාව' },
};

export default function KendaraChart({ cells, lagnaRashiId, meta, lang = 'en' }) {
  const svgRef = useRef(null); const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [clang, setClang] = useState(lang);   // chart language (toggle)
  const [zImg, setZImg] = useState(null);      // lagna zodiac emblem, inlined for export
  const cstr = CSTR[clang] || CSTR.en;
  const lagId = lagnaRashiId || 1;

  useEffect(() => {
    let alive = true;
    const slug = ZSLUG[lagId - 1];
    fetch(`${BASE}/assets/cosmos/z_${slug}.webp`)
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }))
      .then((d) => { if (alive) setZImg(d); })
      .catch(() => { if (alive) setZImg(null); });
    return () => { alive = false; };
  }, [lagId]);

  const download = (blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'grahachara-kendara.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doDownload = async () => { setBusy(true); try { download(await exportPng(svgRef.current)); } catch (_) {} finally { setBusy(false); } };
  const doShare = async () => {
    setBusy(true);
    try {
      const blob = await exportPng(svgRef.current);
      const file = new File([blob], 'grahachara-kendara.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'My Grahachara Kendara', text: 'My Vedic birth chart · grahachara.com' });
      else download(blob);
    } catch (_) {} finally { setBusy(false); }
  };

  const pMap = clang === 'si' ? PNAME_SI : PNAME;
  const byRashi = {};
  (cells || []).forEach((c) => {
    byRashi[c.rashiId] = (c.planets || [])
      .filter((p) => { const k = (p.key || p.name || '').toLowerCase(); return k !== 'lagna' && k !== 'ascendant'; })
      .map((p) => { const k = (p.key || p.name || '').toLowerCase(); return { name: pMap[k] || p.name || '·', color: PCOLOR[k] || '#f5e6b0' }; });
  });
  const lag = lagId;
  const rf = (h) => ((lag - 1 + (h - 1)) % 12) + 1;
  const gx = (fx) => CX0 + fx * CS, gy = (fy) => CY0 + fy * CS;
  const sn = signNames(lag);
  const centerMain = clang === 'si' ? ((RASHIS[lag - 1] || {}).si || sn.vedic) : (sn.english || sn.vedic);
  const centerSub = cstr.lagna;
  const cx = CX0 + CS / 2, cy = CY0 + CS / 2;

  return (
    <div className="pc-chart">
      <div className="pc-chart__langrow">
        <span className="pc-chart__langlabel">{cstr.langLabel}</span>
        <div className="pc-lang" role="group" aria-label={cstr.langLabel}>
          <button type="button" className={`pc-lang__opt${clang === 'en' ? ' is-active' : ''}`} onClick={() => setClang('en')}>EN</button>
          <button type="button" className={`pc-lang__opt${clang === 'si' ? ' is-active' : ''}`} onClick={() => setClang('si')}>සිං</button>
        </div>
      </div>
      <div className="pc-kcard-wrap">
        <div className="pc-kcard pc-kcard--chart" ref={cardRef}>
          <div className="pc-kframe" aria-hidden="true"><TarotCanvas slug="kframe" base={BASE} alt="" /></div>
          <svg ref={svgRef} className="pc-chart__svg pc-chart__overlay" viewBox={`0 0 ${VW} ${VH}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Janma Kendara">
            <defs>
              <linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e29a" /><stop offset="0.55" stopColor="#e2c25f" /><stop offset="1" stopColor="#c8892f" /></linearGradient>
              <clipPath id="zclip"><circle cx={cx} cy={cy - 26} r="27" /></clipPath>
            </defs>

            {/* brand header — logo + wordmark (frame provides all border decoration) */}
            <image href={LOGO_DATA} xlinkHref={LOGO_DATA} x={VW / 2 - 34} y="66" width="68" height="68" />
            <text x={VW / 2} y="182" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fontWeight="700" letterSpacing="6" fill="url(#kg)">GRAHACHARA</text>
            <text x={VW / 2} y="210" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" letterSpacing={clang === 'si' ? '1' : '7'} fill="#cdb98a">{cstr.subtitle}</text>

            {/* ── the chart (the hero) ── */}
            <rect x={CX0} y={CY0} width={CS} height={CS} fill="rgba(7,8,20,0.55)" stroke={GOLD} strokeWidth="2.4" />
            <line x1={CX0 + t1} y1={CY0} x2={CX0 + t1} y2={CY0 + CS} stroke={GOLD} strokeWidth="1.6" />
            <line x1={CX0 + t2} y1={CY0} x2={CX0 + t2} y2={CY0 + CS} stroke={GOLD} strokeWidth="1.6" />
            <line x1={CX0} y1={CY0 + t1} x2={CX0 + CS} y2={CY0 + t1} stroke={GOLD} strokeWidth="1.6" />
            <line x1={CX0} y1={CY0 + t2} x2={CX0 + CS} y2={CY0 + t2} stroke={GOLD} strokeWidth="1.6" />
            <line x1={CX0} y1={CY0 + t1} x2={CX0 + t1} y2={CY0} stroke={LINE} strokeWidth="1.3" />
            <line x1={CX0 + t2} y1={CY0} x2={CX0 + CS} y2={CY0 + t1} stroke={LINE} strokeWidth="1.3" />
            <line x1={CX0} y1={CY0 + t2} x2={CX0 + t1} y2={CY0 + CS} stroke={LINE} strokeWidth="1.3" />
            <line x1={CX0 + t2} y1={CY0 + CS} x2={CX0 + CS} y2={CY0 + t2} stroke={LINE} strokeWidth="1.3" />
            {Object.keys(HCF).map((hStr) => {
              const h = Number(hStr); const [fx, fy] = HCF[h]; const x = gx(fx), y = gy(fy);
              const ps = byRashi[rf(h)] || [];
              return (
                <g key={h}>
                  <text x={x} y={y - ps.length * 10 - 5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="13" fill="rgba(245,210,120,0.5)">{h}</text>
                  {ps.map((p, i) => (
                    <text key={i} x={x} y={y + 6 + (i - (ps.length - 1) / 2) * 21} textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fontWeight="700" fill={p.color}>{p.name}</text>
                  ))}
                </g>
              );
            })}
            {/* centre medallion — lagna zodiac emblem + sign name */}
            <circle cx={cx} cy={cy} r="66" fill="rgba(7,8,20,0.62)" stroke={LINE} strokeWidth="1" />
            <circle cx={cx} cy={cy - 26} r="28" fill="none" stroke={LINE} strokeWidth="1" />
            {zImg
              ? <image href={zImg} xlinkHref={zImg} x={cx - 27} y={cy - 53} width="54" height="54" clipPath="url(#zclip)" />
              : <text x={cx} y={cy - 12} textAnchor="middle" fontFamily='"Segoe UI Symbol","Noto Sans Symbols2",serif' fontSize="40" fill="url(#kg)">{'♈♉♊♋♌♍♎♏♐♑♒♓'[lag - 1]}</text>}
            <text x={cx} y={cy + 22} textAnchor="middle" fontFamily="Georgia, serif" fontSize="26" fontWeight="700" fill="url(#kg)">{centerMain || meta?.lagna || '—'}</text>
            <text x={cx} y={cy + 46} textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" letterSpacing="1" fill="rgba(255,255,255,0.62)">{centerSub}</text>

            {/* footer */}
            <text x={VW / 2} y={CY0 + CS + 60} textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fill="#f0e6cf">{meta?.birth || ''}</text>
            <text x={VW / 2} y={CY0 + CS + 92} textAnchor="middle" fontFamily="Georgia, serif" fontSize="19" fill="#e2c25f">{cstr.rashi} {meta?.rashi || '—'} · {meta?.nakshatra || '—'}</text>
            <text x={VW / 2} y={CY0 + CS + 130} textAnchor="middle" fontFamily="Georgia, serif" fontSize="17" fill="#d9b45a">{cstr.await}</text>
            <text x={VW / 2} y={CY0 + CS + 154} textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" letterSpacing="2" fill="#a99f86">{cstr.foot}</text>
          </svg>
        </div>
      </div>

      <div className="pc-chart__actions">
        <button className="pc-btn-gold" onClick={doShare} disabled={busy}>{busy ? cstr.preparing : cstr.share}</button>
        <button className="pc-chart__dl" onClick={doDownload} disabled={busy}>{cstr.download}</button>
      </div>
    </div>
  );
}
