// lock.jsx — Screen II: the four-wheel A–Z combination lock + the "@" sigil.
// The "@" tells players to write to the address (also faint on every screen);
// the auto-reply hands them the code. Setting the wheels to I-F-I-F unlocks it.
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lkNorm = (i) => ((i % 26) + 26) % 26;

function LockWheel({ value, onChange, locked, t }) {
  const STEP = 38;
  const ref = React.useRef(null);
  const drag = React.useRef(null);
  const [dy, setDy] = React.useState(0);

  const down = (e) => {
    if (locked) return;
    e.preventDefault();
    drag.current = { y0: e.clientY, start: value };
    try { ref.current.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const move = (e) => {
    if (!drag.current) return;
    const d = e.clientY - drag.current.y0;
    const steps = Math.round(d / STEP);
    const nv = lkNorm(drag.current.start - steps);
    if (nv !== value) { window.buzz && window.buzz(6); }
    onChange(nv);
    setDy(d - steps * STEP);
  };
  const up = (e) => {
    if (!drag.current) return;
    drag.current = null;
    setDy(0);
    try { ref.current.releasePointerCapture(e.pointerId); } catch (err) {}
  };
  const step = (dir) => { if (locked) return; window.buzz && window.buzz(6); onChange(lkNorm(value + dir)); };

  return (
    <div className="lk-wheel">
      <button className="lk-chev" disabled={locked} onClick={() => step(-1)} aria-label="upp">
        <svg viewBox="0 0 14 8" width="13" height="8"><path d="M1 7L7 1l6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div ref={ref} className="lk-reel" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ touchAction: 'none', cursor: locked ? 'default' : 'grab' }}>
        {[-2, -1, 0, 1, 2].map((k) => {
          const dist = Math.abs(k);
          return (
            <span key={k} className="lk-letter" style={{
              transform: `translate(-50%, calc(-50% + ${k * STEP + dy}px))`,
              opacity: dist === 0 ? 1 : (dist === 1 ? 0.32 : 0.1),
              color: t.numeral,
            }}>{ALPHA[lkNorm(value + k)]}</span>
          );
        })}
        <span className="lk-glow" style={{ boxShadow: locked ? `inset 0 0 0 1.5px ${t.label}, 0 0 18px ${t.label}55` : 'none' }} />
      </div>
      <button className="lk-chev" disabled={locked} onClick={() => step(1)} aria-label="niður">
        <svg viewBox="0 0 14 8" width="13" height="8"><path d="M1 1l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

function LockScreen({ onAdvance }) {
  const t = (window.THEMES && window.THEMES.nouveau) || {};
  const [vals, setVals] = React.useState([0, 0, 0, 0]); // A A A A
  const target = [8, 5, 8, 5];                            // I F I F
  const solved = vals.join() === target.join();
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (solved) {
      window.chime && window.chime();
      window.buzz && window.buzz([12, 40, 12]);
      const id = setTimeout(() => setRevealed(true), 360);
      return () => clearTimeout(id);
    }
  }, [solved]);

  const setI = (i, v) => setVals((a) => { const b = a.slice(); b[i] = v; return b; });

  return (
    <div className="cs-screen" style={{ background: 'radial-gradient(120% 90% at 50% 16%, #173029 0%, #0e1c19 55%, #060d0b 100%)' }}>
      <div className="cs-grain" />
      <div className="cs-vig" />

      <div className="cs-head">
        <span className="cs-rule" />
        <span className="cs-chapter" style={{ color: t.label }}>II</span>
        <span className="cs-rule" />
      </div>

      <div className="lk-stage">
        {/* the @ sigil */}
        <div className="lk-at">
          <span className="lk-at-char" style={{ color: t.label }}>@</span>
        </div>

        {/* brass combination lock */}
        <div className="lk-plate">
          {vals.map((v, i) => (
            <LockWheel key={i} value={v} onChange={(nv) => setI(i, nv)} locked={solved} t={t} />
          ))}
        </div>

        <button className={'cs-win-go lk-go' + (revealed ? ' is-on' : '')}
          style={{ borderColor: t.label, color: t.label }}
          onClick={onAdvance}>Áfram&nbsp;&nbsp;→</button>
      </div>

      <div className="cs-contact">salmons-volumes.8r@icloud.com</div>
    </div>
  );
}

Object.assign(window, { LockScreen, LockWheel });
