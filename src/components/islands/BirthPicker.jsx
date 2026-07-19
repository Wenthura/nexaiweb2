import { useRef, useState, useEffect } from 'react';

// Fast typed birth date — DD / MM / YYYY with auto-advance + numeric keypad on
// mobile. No long dropdown lists. Emits { date:'YYYY-MM-DD', time } when valid.
const NOW_Y = new Date().getFullYear();
const num = (v) => v.replace(/\D/g, '');

export default function BirthPicker({ label, value, onChange }) {
  const init = (value.date || '').split('-');
  const [d, setD] = useState(init[2] || '');
  const [m, setM] = useState(init[1] || '');
  const [y, setY] = useState(init[0] || '');
  const time = value.time || '12:00';
  const mRef = useRef(null), yRef = useRef(null);

  const build = (dd, mm, yy) => {
    const D = +dd, M = +mm, Y = +yy;
    return (D >= 1 && D <= 31 && M >= 1 && M <= 12 && Y >= 1920 && Y <= NOW_Y)
      ? `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}` : '';
  };

  useEffect(() => { onChange({ date: build(d, m, y), time }); /* eslint-disable-next-line */ }, [d, m, y]);

  return (
    <div className="pc-birth">
      {label && <span className="pc-birth__label">{label}</span>}
      <div className="pc-birth__row">
        <div className="pc-birth__date">
          <input className="pc-birth__num pc-birth__num--d" inputMode="numeric" maxLength={2} placeholder="DD" value={d}
            onChange={(e) => { const v = num(e.target.value).slice(0, 2); setD(v); if (v.length === 2 && mRef.current) mRef.current.focus(); }} aria-label="Day" />
          <span className="pc-birth__sep">/</span>
          <input ref={mRef} className="pc-birth__num pc-birth__num--m" inputMode="numeric" maxLength={2} placeholder="MM" value={m}
            onChange={(e) => { const v = num(e.target.value).slice(0, 2); setM(v); if (v.length === 2 && yRef.current) yRef.current.focus(); }} aria-label="Month" />
          <span className="pc-birth__sep">/</span>
          <input ref={yRef} className="pc-birth__num pc-birth__num--y" inputMode="numeric" maxLength={4} placeholder="YYYY" value={y}
            onChange={(e) => setY(num(e.target.value).slice(0, 4))} aria-label="Year" />
        </div>
        <input type="time" className="pc-birth__time" value={time} onChange={(e) => onChange({ date: build(d, m, y), time: e.target.value })} aria-label="Birth time" />
      </div>
    </div>
  );
}
