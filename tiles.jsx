// tiles.jsx — Screen III: anagram rack. The letters of LOKI ODIN GNARLS,
// rearrangeable by drag, reshufflable by button. Spell NORDLINGASKOLI to pass.
// Three fixed rows (4 / 4 / 6) so the start reads LOKI·ODIN·GNARLS and the
// solution reads NORD·LING·ASKOLI top-to-bottom, left-to-right.

const AN_LETTERS = ['L', 'O', 'K', 'I', 'O', 'D', 'I', 'N', 'G', 'N', 'A', 'R', 'L', 'S'];
const AN_TARGET = 'NORDLINGASKOLI';
const AN_TW = 44, AN_TH = 50, AN_GAP = 8, AN_GY = 12;
const AN_ROWS = [4, 4, 6];

// precompute the 14 slot centres
const AN_SLOTS = (() => {
  const maxW = 6 * AN_TW + 5 * AN_GAP;            // widest row defines the rack
  const out = [];
  let idx = 0;
  AN_ROWS.forEach((count, r) => {
    const rowW = count * AN_TW + (count - 1) * AN_GAP;
    const startX = (maxW - rowW) / 2;
    for (let j = 0; j < count; j++) {
      out[idx++] = { x: startX + j * (AN_TW + AN_GAP) + AN_TW / 2, y: r * (AN_TH + AN_GY) + AN_TH / 2 };
    }
  });
  return out;
})();
const AN_W = 6 * AN_TW + 5 * AN_GAP;
const AN_H = AN_ROWS.length * AN_TH + (AN_ROWS.length - 1) * AN_GY;

function AnagramScreen({ onAdvance }) {
  const t = (window.THEMES && window.THEMES.nouveau) || {};
  const [order, setOrder] = React.useState(() => AN_LETTERS.map((_, i) => i));
  const [dragId, setDragId] = React.useState(null);
  const [pointer, setPointer] = React.useState({ x: 0, y: 0 });
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragIdRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const word = order.map((id) => AN_LETTERS[id]).join('');
  const solved = word === AN_TARGET;
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

  const shuffle = () => {
    if (solved) return;
    window.buzz && window.buzz(6);
    setOrder((prev) => {
      let a;
      do {
        a = prev.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      } while (a.map((id) => AN_LETTERS[id]).join('') === AN_TARGET);
      return a;
    });
  };

  const onDown = (e, id) => {
    if (solved) return;
    e.preventDefault();
    const tr = e.currentTarget.getBoundingClientRect();
    const cont = containerRef.current.getBoundingClientRect();
    const off = { x: e.clientX - tr.left, y: e.clientY - tr.top };
    setOffset(off);
    dragIdRef.current = id;
    setDragId(id);
    setPointer({ x: e.clientX - cont.left, y: e.clientY - cont.top });
    window.buzz && window.buzz(5);

    const move = (ev) => {
      const c = containerRef.current.getBoundingClientRect();
      const px = ev.clientX - c.left, py = ev.clientY - c.top;
      setPointer({ x: px, y: py });
      let ni = 0, best = Infinity;
      AN_SLOTS.forEach((s, idx) => { const d = (s.x - px) ** 2 + (s.y - py) ** 2; if (d < best) { best = d; ni = idx; } });
      setOrder((prev) => {
        const without = prev.filter((x) => x !== id);
        if (without.length === prev.length) return prev;
        if (without[ni] === id) return prev;
        without.splice(ni, 0, id);
        return without;
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      dragIdRef.current = null;
      setDragId(null);
      window.buzz && window.buzz(5);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="cs-screen" style={{ background: 'radial-gradient(120% 90% at 50% 16%, #173029 0%, #0e1c19 55%, #060d0b 100%)' }}>
      <div className="cs-grain" />
      <div className="cs-vig" />

      <div className="cs-head">
        <span className="cs-rule" />
        <span className="cs-chapter" style={{ color: t.label }}>III</span>
        <span className="cs-rule" />
      </div>

      <div className="an-stage">
        <div ref={containerRef} className="an-rack" style={{ width: AN_W, height: AN_H }}>
          {order.map((id) => {
            const isDrag = id === dragId;
            const pos = order.indexOf(id);
            const s = AN_SLOTS[pos];
            const x = isDrag ? pointer.x - offset.x : s.x - AN_TW / 2;
            const y = isDrag ? pointer.y - offset.y : s.y - AN_TH / 2;
            return (
              <div key={id} className={'an-tile' + (isDrag ? ' is-drag' : '') + (solved ? ' is-set' : '')}
                onPointerDown={(e) => onDown(e, id)}
                style={{
                  width: AN_TW, height: AN_TH,
                  transform: `translate3d(${x}px, ${y}px, 0)` + (isDrag ? ' scale(1.08)' : ''),
                  transition: isDrag ? 'none' : 'transform .22s cubic-bezier(.2,.8,.3,1), box-shadow .2s',
                  zIndex: isDrag ? 20 : 1,
                  cursor: solved ? 'default' : 'grab',
                  '--ink': solved ? (t.label || '#caa24f') : '#23324d',
                }}>
                {AN_LETTERS[id]}
              </div>
            );
          })}
        </div>

        <button className="an-shuffle" disabled={solved} onClick={shuffle} style={{ borderColor: t.label, color: t.label }}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h2.5L11 12h3M14 12l-2-2M14 12l-2 2" /><path d="M2 12h2.5L7 9M11 4h3M14 4l-2-2M14 4l-2 2" />
          </svg>
          Stokka
        </button>

        <button className={'cs-win-go an-go' + (revealed ? ' is-on' : '')}
          style={{ borderColor: t.label, color: t.label }}
          onClick={onAdvance}>Áfram&nbsp;&nbsp;→</button>
      </div>

      <div className="cs-contact">salmons-volumes.8r@icloud.com</div>
    </div>
  );
}

Object.assign(window, { AnagramScreen });
