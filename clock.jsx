// clock.jsx — interactive "broken clock" puzzle, three Edwardian / art-nouveau
// dressings. Drag the hands; snap to the numerals; solve at 2:20 (hour on II,
// minute on IIII). Exports ClockScreen(variant) to window.
const { useState, useRef, useEffect, useCallback } = React;

const ROMAN = ['', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const norm = (d) => ((d % 360) + 360) % 360;
const pointAt = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    // soft two-note ship's bell
    [659.25, 987.77].forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(ac.destination);
      const t = ac.currentTime + i * 0.14;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.start(t); o.stop(t + 1.9);
    });
  } catch (e) {}
}

// ── color systems per variant ──────────────────────────────────────────────
const THEMES = {
  pocketwatch: {
    frame: 'pocketwatch',
    dial: '#f4ecd6', dialEdge: '#e7d9b8',
    numeral: '#27170d', minorTick: 'rgba(39,23,13,.45)', majorTick: '#27170d',
    hand: '#23324d', handHi: '#3a4f72', cap: '#c79a44', capCore: '#1c130a',
    caseOuter: '#9a6f33', caseMid: '#d8b25c', caseHi: '#f4e1a6', caseInner: '#7a521f',
    crack: 'rgba(35,20,10,.4)',
    label: '#caa24f',
  },
  carriage: {
    frame: 'plain',
    dial: '#efe7d2', dialEdge: '#ddceac',
    numeral: '#2a1c12', minorTick: 'rgba(42,28,18,.4)', majorTick: '#2a1c12',
    hand: '#1f140c', handHi: '#5a3c1e', cap: '#b8893c', capCore: '#1f140c',
    caseOuter: '#7c5421', caseMid: '#c79a44', caseHi: '#ecd29a', caseInner: '#5e3d18',
    crack: 'rgba(42,28,18,.38)',
    label: '#9c7327',
  },
  nouveau: {
    frame: 'nouveau',
    dial: '#14201d', dialEdge: '#0c1614',
    numeral: '#d8b25c', minorTick: 'rgba(216,178,92,.4)', majorTick: '#e7ca7c',
    hand: '#e7ca7c', handHi: '#f4e3ad', cap: '#d8b25c', capCore: '#0c1614',
    caseOuter: '#7a5a2a', caseMid: '#caa24f', caseHi: '#f0dca2', caseInner: '#5a3f1c',
    crack: 'rgba(216,178,92,.32)',
    label: '#caa24f',
  },
};

// ── the dial face (interactive) ─────────────────────────────────────────────
function ClockFace({ t, solved, onChange }) {
  // viewBox + center per frame so decoration has room
  const FR = t.frame;
  const VB_W = FR === 'nouveau' ? 264 : 240;
  const VB_H = FR === 'pocketwatch' ? 290 : (FR === 'nouveau' ? 264 : 240);
  const C = VB_W / 2;
  const CY = FR === 'pocketwatch' ? 150 : VB_H / 2;
  const R_DIAL = 92;       // dial radius
  const R_CASE = 108;      // outer case radius

  const [hour, setHour] = useState(217);   // visibly "stopped / broken"
  const [minute, setMinute] = useState(286);
  const svgRef = useRef(null);
  const active = useRef(null);

  const isSolved = norm(hour) === 60 && norm(minute) === 120;
  useEffect(() => { if (isSolved) onChange && onChange(true); }, [isSolved]);

  const evtAngle = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    // SVG uses preserveAspectRatio xMidYMid meet, so map screen → viewBox via
    // the meet-scale and the rect centre (otherwise a non-square box distorts
    // angles and offsets the centre).
    const scale = Math.min(rect.width / VB_W, rect.height / VB_H);
    const cx = rect.left + rect.width / 2 + (C - VB_W / 2) * scale;
    const cy = rect.top + rect.height / 2 + (CY - VB_H / 2) * scale;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    return { deg: norm(Math.atan2(dx, -dy) * 180 / Math.PI), r: Math.hypot(dx, dy) / scale };
  };
  const snap = (d) => norm(Math.round(d / 30) * 30);

  const apply = (deg) => {
    const s = snap(deg);
    if (active.current === 'hour') setHour((p) => { if (p !== s) buzz(7); return s; });
    else setMinute((p) => { if (p !== s) buzz(7); return s; });
  };
  const onDown = (e) => {
    if (isSolved) return;
    const { deg, r } = evtAngle(e);
    if (r > R_CASE + 6) return;
    active.current = r < R_DIAL * 0.58 ? 'hour' : 'minute';
    try { svgRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    apply(deg);
  };
  const onMove = (e) => { if (active.current) apply(evtAngle(e).deg); };
  const onUp = (e) => { active.current = null; try { svgRef.current.releasePointerCapture(e.pointerId); } catch (err) {} };

  // numerals + ticks
  const numerals = [];
  for (let n = 1; n <= 12; n++) {
    const [x, y] = pointAt(C, CY, R_DIAL - 17, n * 30);
    numerals.push(
      <text key={'n' + n} x={x} y={y} fill={t.numeral} fontFamily="Cinzel, serif"
        fontSize="14.5" fontWeight="600" textAnchor="middle" dominantBaseline="central"
        style={{ letterSpacing: '.5px' }}>{ROMAN[n]}</text>
    );
  }
  const ticks = [];
  for (let m = 0; m < 60; m++) {
    const major = m % 5 === 0;
    const [x1, y1] = pointAt(C, CY, R_DIAL - 2, m * 6);
    const [x2, y2] = pointAt(C, CY, R_DIAL - (major ? 7 : 4), m * 6);
    ticks.push(<line key={'t' + m} x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={major ? t.majorTick : t.minorTick} strokeWidth={major ? 1.4 : 0.7} strokeLinecap="round" />);
  }

  // hand shapes (pointing up, rotated)
  const hourPath = `M ${C} ${CY + 16} L ${C - 3.4} ${CY + 2} L ${C - 2.4} ${CY - R_DIAL * 0.46}
    L ${C} ${CY - R_DIAL * 0.56} L ${C + 2.4} ${CY - R_DIAL * 0.46} L ${C + 3.4} ${CY + 2} Z`;
  const minPath = `M ${C} ${CY + 22} L ${C - 2.6} ${CY + 2} L ${C - 1.8} ${CY - R_DIAL * 0.74}
    L ${C} ${CY - R_DIAL * 0.84} L ${C + 1.8} ${CY - R_DIAL * 0.74} L ${C + 2.6} ${CY + 2} Z`;

  const gid = 'g' + t.frame;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: '100%', height: '100%', touchAction: 'none', cursor: isSolved ? 'default' : 'grab', display: 'block', overflow: 'visible' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <defs>
        <radialGradient id={gid + 'dial'} cx="42%" cy="36%" r="75%">
          <stop offset="0%" stopColor={t.dial} />
          <stop offset="100%" stopColor={t.dialEdge} />
        </radialGradient>
        <linearGradient id={gid + 'case'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.caseHi} />
          <stop offset="38%" stopColor={t.caseMid} />
          <stop offset="62%" stopColor={t.caseOuter} />
          <stop offset="100%" stopColor={t.caseHi} />
        </linearGradient>
        <radialGradient id={gid + 'glass'} cx="34%" cy="26%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,.5)" />
          <stop offset="42%" stopColor="rgba(255,255,255,.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={gid + 'sh'} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="rgba(0,0,0,.45)" />
        </filter>
      </defs>

      {/* ── frame decoration ── */}
      {FR === 'pocketwatch' && (
        <g fill={`url(#${gid}case)`} stroke={t.caseInner} strokeWidth="1">
          <rect x={C - 5} y="34" width="10" height="20" rx="3" />
          <circle cx={C} cy="26" r="13" fill="none" stroke={`url(#${gid}case)`} strokeWidth="6" />
          <circle cx={C} cy="44" r="7" />
        </g>
      )}
      {FR === 'nouveau' && (
        <g fill="none" stroke={`url(#${gid}case)`} strokeWidth="5" strokeLinecap="round" opacity="0.95">
          <path d="M40 40 C 8 92, 8 172, 44 222" />
          <path d="M224 40 C 256 92, 256 172, 220 222" />
          <path d="M40 40 C 92 6, 172 6, 224 40" />
          <path d="M44 222 C 92 256, 172 256, 220 222" />
          <circle cx="40" cy="40" r="6" fill={t.caseMid} stroke="none" />
          <circle cx="224" cy="40" r="6" fill={t.caseMid} stroke="none" />
          <circle cx="44" cy="222" r="6" fill={t.caseMid} stroke="none" />
          <circle cx="220" cy="222" r="6" fill={t.caseMid} stroke="none" />
        </g>
      )}

      {/* case ring */}
      <circle cx={C} cy={CY} r={R_CASE} fill={`url(#${gid}case)`} stroke={t.caseInner} strokeWidth="1.5" filter={`url(#${gid}sh)`} />
      <circle cx={C} cy={CY} r={R_CASE - 7} fill="none" stroke={t.caseInner} strokeWidth="1" opacity=".5" />
      {/* dial */}
      <circle cx={C} cy={CY} r={R_DIAL} fill={`url(#${gid}dial)`} stroke={t.dialEdge} strokeWidth="1" />

      {ticks}
      {numerals}

      {/* maker's mark */}
      <g style={{ transition: 'opacity .6s' }}>
        <text x={C} y={CY - 30} fill={t.label} fontFamily="Cinzel, serif" fontSize="7.2"
          fontWeight="600" textAnchor="middle" style={{ letterSpacing: '2.4px' }}>WHITE STAR LINE</text>
        {/* burgee: white star on red roundel */}
        <circle cx={C} cy={CY + 34} r="9.5" fill="#9c2b22" />
        <path d={starPath(C, CY + 34, 6.6, 2.8)} fill="#f4ecd6" />
      </g>

      {/* hands */}
      <g transform={`rotate(${hour} ${C} ${CY})`} style={{ transition: active.current ? 'none' : 'transform .25s cubic-bezier(.34,1.4,.5,1)' }}>
        <path d={hourPath} fill={t.hand} />
        <path d={hourPath} fill="none" stroke={t.handHi} strokeWidth=".5" opacity=".5" />
      </g>
      <g transform={`rotate(${minute} ${C} ${CY})`} style={{ transition: active.current ? 'none' : 'transform .25s cubic-bezier(.34,1.4,.5,1)' }}>
        <path d={minPath} fill={t.hand} />
        <path d={minPath} fill="none" stroke={t.handHi} strokeWidth=".5" opacity=".5" />
      </g>
      <circle cx={C} cy={CY} r="6.5" fill={t.cap} stroke={t.caseInner} strokeWidth=".6" />
      <circle cx={C} cy={CY} r="2.4" fill={t.capCore} />

      {/* crack — fades when solved */}
      <g stroke={t.crack} fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: solved ? 0 : 1, transition: 'opacity .8s ease' }}>
        <path d={`M ${C - 70} ${CY - 50} L ${C - 28} ${CY - 8} L ${C - 40} ${CY + 14} L ${C + 6} ${CY + 40} L ${C + 54} ${CY + 30}`} strokeWidth="1.1" />
        <path d={`M ${C - 28} ${CY - 8} L ${C + 18} ${CY - 26} L ${C + 60} ${CY - 44}`} strokeWidth=".8" />
        <path d={`M ${C + 6} ${CY + 40} L ${C + 2} ${CY + 70}`} strokeWidth=".6" />
      </g>

      {/* glass highlight */}
      <circle cx={C} cy={CY} r={R_DIAL} fill={`url(#${gid}glass)`} pointerEvents="none" />
    </svg>
  );
}

function starPath(cx, cy, outer, inner) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * 36 - 90) * Math.PI / 180;
    d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(a)) + ' ' + (cy + r * Math.sin(a)) + ' ';
  }
  return d + 'Z';
}

// ── full phone screen ────────────────────────────────────────────────────────
function ClockScreen({ variant = 'pocketwatch', onAdvance }) {
  const t = THEMES[variant] || THEMES.pocketwatch;
  const [solved, setSolved] = useState(false);
  useEffect(() => { if (solved) { chime(); buzz([12, 40, 12]); } }, [solved]);

  const bg = {
    pocketwatch: 'radial-gradient(125% 90% at 50% 18%, #5a3520 0%, #341b0d 52%, #1d0f06 100%)',
    carriage: 'radial-gradient(120% 80% at 50% 0%, #3d2a1a 0%, #271a10 60%, #170e07 100%)',
    nouveau: 'radial-gradient(120% 90% at 50% 16%, #173029 0%, #0e1c19 55%, #060d0b 100%)',
  }[variant];

  return (
    <div className="cs-screen" style={{ background: bg }}>
      {/* grain / vignette */}
      <div className="cs-grain" />
      <div className="cs-vig" />

      {/* header — just a chapter mark, no spoiler */}
      <div className="cs-head">
        <span className="cs-rule" />
        <span className="cs-chapter" style={{ color: t.label }}>I</span>
        <span className="cs-rule" />
      </div>

      {/* clock stage */}
      <div className="cs-stage">
        <div className="cs-clock">
          <ClockFace t={t} solved={solved} onChange={setSolved} />
        </div>
      </div>

      {/* success */}
      <div className={'cs-win' + (solved ? ' is-on' : '')} style={{ '--ink': t.label }}>
        <div className="cs-win-inner">
          <div className="cs-win-time" style={{ color: t.label }}>2:20</div>
          <div className="cs-win-rule" style={{ background: t.label }} />
          <div className="cs-win-cap">R.M.S. TITANIC&nbsp;&nbsp;·&nbsp;&nbsp;15. APRÍL 1912</div>
          <button className="cs-win-go" style={{ borderColor: t.label, color: t.label }}
            onClick={onAdvance}>Áfram&nbsp;&nbsp;→</button>
        </div>
      </div>

      {/* faint hint contact, every screen */}
      <div className="cs-contact">salmons-volumes.8r@icloud.com</div>
    </div>
  );
}

Object.assign(window, { ClockScreen, ClockFace, THEMES, chime, buzz });
