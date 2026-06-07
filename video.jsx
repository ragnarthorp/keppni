// video.jsx — Screen IV: the reference video (drop-down modal) + the "?" briefing
// + a 5-letter passcode. Send a "Trickshot" video to Salómón, get the code,
// type GOODY to pass.
const IV_VIDEO_ID = 'HvDo82kaxck';

function VideoScreen({ onAdvance, active }) {
  const t = (window.THEMES && window.THEMES.nouveau) || {};
  const [modal, setModal] = React.useState(true);   // auto-opens on entry
  const [started, setStarted] = React.useState(false);
  // stop the clip if the player navigates away from this screen / closes it
  React.useEffect(() => { if (!active) setModal(false); }, [active]);
  React.useEffect(() => { if (!modal) setStarted(false); }, [modal]);
  const [brief, setBrief] = React.useState(false);
  const [chars, setChars] = React.useState(['', '', '', '', '']);
  const cellRefs = React.useRef([]);
  const value = chars.join('');
  const solved = value.toUpperCase() === 'GOODY';
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

  // pause/stop playback by unmounting the iframe whenever the modal closes

  const onType = (i, raw) => {
    if (solved) return;
    const ch = (raw.replace(/[^a-zA-Z]/g, '').slice(-1) || '').toUpperCase();
    setChars((prev) => { const n = prev.slice(); n[i] = ch; return n; });
    window.buzz && window.buzz(5);
    if (ch && i < 4) cellRefs.current[i + 1] && cellRefs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) { cellRefs.current[i - 1] && cellRefs.current[i - 1].focus(); }
  };

  return (
    <div className="cs-screen" style={{ background: 'radial-gradient(120% 90% at 50% 16%, #173029 0%, #0e1c19 55%, #060d0b 100%)' }}>
      <div className="cs-grain" />
      <div className="cs-vig" />

      <div className="cs-head">
        <span className="cs-rule" />
        <span className="cs-chapter" style={{ color: t.label }}>IV</span>
        <span className="cs-rule" />
      </div>

      <div className="iv-stage">
        {/* reopen the reference video */}
        <button className="iv-reopen" style={{ borderColor: t.label, color: t.label }} onClick={() => setModal(true)}>
          <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><path d="M2 1l8 5-8 5z" /></svg>
          Sýnishorn
        </button>

        {/* the "?" — click to reveal the briefing */}
        <button className={'lk-at iv-q' + (brief ? ' is-open' : '')} onClick={() => setBrief(true)} aria-label="vísbending">
          <span className="lk-at-char" style={{ color: t.label }}>?</span>
        </button>

        {/* briefing */}
        <div className={'iv-brief' + (brief ? ' is-on' : '')}>
          <p>Umsjónarhópurinn hefur <em>eina klukkustund</em> til að skipuleggja, æfa, kvikmynda og klippa myndband í þessum stíl.</p>
          <p>Þegar myndbandið er tilbúið sendið þið tölvupóst með orðinu <strong style={{ color: t.label }}>Trickshot</strong> á „Salómón“. Þið fáið svo kóðann.</p>
          <div className="iv-cells">
            {chars.map((c, i) => (
              <input key={i} ref={(el) => (cellRefs.current[i] = el)} className={'iv-cell' + (solved ? ' is-set' : '')}
                value={c} maxLength={1} inputMode="text" autoComplete="off" spellCheck="false"
                disabled={solved}
                onChange={(e) => onType(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
                style={{ color: solved ? (t.label || '#caa24f') : '#f4ecd6', borderColor: solved ? t.label : 'rgba(202,162,79,.3)' }} />
            ))}
          </div>
        </div>

        <button className={'cs-win-go iv-go' + (revealed ? ' is-on' : '')}
          style={{ borderColor: t.label, color: t.label }}
          onClick={onAdvance}>Áfram&nbsp;&nbsp;→</button>
      </div>

      {/* faint contact, every screen */}
      <div className="cs-contact">salmons-volumes.8r@icloud.com</div>

      {/* drop-down video modal */}
      <div className={'iv-modal' + (modal ? ' is-on' : '')} onClick={() => setModal(false)}>
        <div className="iv-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="iv-dialog-bar">
            <span className="iv-dialog-title" style={{ color: t.label }}>Sýnishorn</span>
            <button className="iv-close" onClick={() => setModal(false)} aria-label="loka">×</button>
          </div>
          <div className="iv-player">
            <div className="iv-frame">
              {started ? (
                <iframe className="iv-yt"
                  src={`https://www.youtube-nocookie.com/embed/${IV_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title="Sýnishorn" frameBorder="0" allowFullScreen
                  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
              ) : (
                <button className="iv-thumb" onClick={() => setStarted(true)}
                  style={{ backgroundImage: `url(https://img.youtube.com/vi/${IV_VIDEO_ID}/hqdefault.jpg)` }}>
                  <span className="iv-play"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5l11 7-11 7z" /></svg></span>
                </button>
              )}
            </div>
            <a className="iv-yt-link" href={`https://youtu.be/${IV_VIDEO_ID}`} target="_blank" rel="noopener noreferrer" style={{ color: t.label }}>
              Opna á YouTube&nbsp;↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VideoScreen });
