// stereo.jsx — Screen V: a Magic Eye autostereogram. Relax your eyes to see the
// hidden 3D word, then type the passcode WOW.
function StereoScreen({ onAdvance }) {
  const t = (window.THEMES && window.THEMES.nouveau) || {};
  const TARGET = 'WOW';
  const [chars, setChars] = React.useState(['', '', '']);
  const cellRefs = React.useRef([]);
  const solved = chars.join('').toUpperCase() === TARGET;
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (solved) {
      window.chime && window.chime();
      window.buzz && window.buzz([12, 40, 12]);
      const id = setTimeout(() => setRevealed(true), 360);
      return () => clearTimeout(id);
    }
    setRevealed(false);
  }, [solved]);

  const onType = (i, raw) => {
    if (solved) return;
    const ch = (raw.replace(/[^a-zA-Z]/g, '').slice(-1) || '').toUpperCase();
    setChars((prev) => { const n = prev.slice(); n[i] = ch; return n; });
    window.buzz && window.buzz(5);
    if (ch && i < 2) cellRefs.current[i + 1] && cellRefs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) cellRefs.current[i - 1] && cellRefs.current[i - 1].focus();
  };

  return (
    <div className="cs-screen" style={{ background: 'radial-gradient(120% 90% at 50% 16%, #173029 0%, #0e1c19 55%, #060d0b 100%)' }}>
      <div className="cs-grain" />
      <div className="cs-vig" />

      <div className="cs-head">
        <span className="cs-rule" />
        <span className="cs-chapter" style={{ color: t.label }}>V</span>
        <span className="cs-rule" />
      </div>

      <div className="sv-stage">
        <div className="sv-img">
          <img src={window.STEREO_SRC || 'assets/stereo.png'} alt="" draggable="false" />
        </div>

        <div className="sv-pass">
          <span className="sv-label" style={{ color: t.label }}>Lykilorð</span>
          <div className="iv-cells">
            {chars.map((c, i) => (
              <input key={i} ref={(el) => (cellRefs.current[i] = el)} className={'iv-cell' + (solved ? ' is-set' : '')}
                value={c} maxLength={1} inputMode="text" autoComplete="off" spellCheck="false" disabled={solved}
                onChange={(e) => onType(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
                style={{ color: solved ? (t.label || '#caa24f') : '#f4ecd6', borderColor: solved ? t.label : 'rgba(202,162,79,.3)' }} />
            ))}
          </div>
        </div>

        <button className={'cs-win-go iv-go' + (revealed ? ' is-on' : '')}
          style={{ borderColor: t.label, color: t.label }}
          onClick={onAdvance}>Áfram&nbsp;&nbsp;→</button>
      </div>

      <div className="cs-contact">salmons-volumes.8r@icloud.com</div>
    </div>
  );
}

Object.assign(window, { StereoScreen });
