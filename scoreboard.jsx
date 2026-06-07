// scoreboard.jsx — the point breakdown ("Stigasöfnun"), shown in a pull-down
// available on every screen, plus the finale congratulations screen.
const SB_SPORTS = [
  ['Hlaupið og stökkvið í Bugðu', 'Myndband af einhverjum í hópnum að stökkva í Bugðu (má hlaupa heim í sturtu á eftir).', '50 st.'],
  ['Rauðavatnshringur', 'Krafa: skila þarf Timelapse-upptöku.', '40 st.'],
  ['Fimm körfuboltavíti í röð', 'Verða að vera fimm ofan í, í röð.', '30 st.'],
  ['Upphífingar', 'Per hverja löglega endurtekningu.', '3 st.'],
  ['Armbeygjur', 'Per hverja löglega endurtekningu.', '1 st.'],
  ['Halda bolta á lofti', 'Per hvert skipti sem boltanum er haldið uppi.', '0,5 st.'],
];
const SB_ARTS = [
  ['Frumsamin & myndskreytt barnabók', 'Metið út frá umbúnaði og metnaði.', 'Allt að 50 st.'],
  ['Frumsamin barnabók', 'Án myndskreytingar. Texti í forgrunni.', '35 st.'],
  ['Teiknimynd af umsjónarhópnum', 'Stig gefin eftir útfærslu og smáatriðum.', 'Allt að 30 st.'],
  ['Breyta barnabók í hljóðbók', 'Bók af safninu lesin inn af innlifun.', '1 st. / bls.'],
];
const SB_CLEAN = [
  ['Umsjónarrými fullkomlega frágengið', 'Allt hreint og klárt fyrir sumarið.', '50 st.'],
  ['Allir búnir að skila iPad', 'Gildir þegar síðasta tækinu er skilað.', '20 st.'],
  ['Allir búnir að tæma/hreinsa skáp', 'Engir inniskór eða dót skilið eftir.', '20 st.'],
  ['Allir búnir að teikna á loftplötu', 'Sameiginlegt listaverk hópsins. Gildir aðeins um 10. bekk.', '10 st.'],
];

function SbCard({ kicker, title, sub, items, children }) {
  return (
    <div className="sb-card">
      <span className="sb-kicker">{kicker}</span>
      <h4 className="sb-card-title">{title}</h4>
      <p className="sb-card-sub">{sub}</p>
      <ul className="sb-list">
        {items.map(([t, d, p], i) => (
          <li className="sb-item" key={i}>
            <div className="sb-it-info">
              <div className="sb-it-title">{t}</div>
              <div className="sb-it-desc">{d}</div>
            </div>
            <div className="sb-pts">{p}</div>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

// The full point breakdown — rendered inside the "Stigasöfnun" pull-down.
function PointsSheet() {
  const t = (window.THEMES && window.THEMES.nouveau) || {};
  return (
    <React.Fragment>
      <div className="sb-hero sb-hero-mini">
        <svg className="sb-crown" viewBox="0 0 64 48" width="90" fill="currentColor">
          <path d="M6 42 L10 14 L22 28 L32 8 L42 28 L54 14 L58 42 Z" />
          <rect x="6" y="42" width="52" height="5" rx="1" />
        </svg>
        <div className="sb-hero-body">
          <span className="sb-kicker sb-kicker-dark">Stóra áskorunin</span>
          <h2 className="sb-hero-title">Leynisíðu-afrekið</h2>
          <p className="sb-hero-desc">Klárið allar þrautirnar á þessari síðu (ekki stigaverkefnin hér fyrir neðan).</p>
        </div>
        <div className="sb-hero-pts">300<span>STIG</span></div>
      </div>

      <SbCard kicker="I" title="Íþróttir & hreyfing"
        sub="Stig fyrir styrk, tækni, úthald og einbeitingu." items={SB_SPORTS}>
        <div className="sb-chess">
          <span className="sb-chess-h" style={{ color: t.label }}>Chess.com áskoranir</span>
          <div className="sb-chess-row"><span>Sigra botta <em>(krafa: skjámynd)</em></span><span className="sb-chess-pts">Elo / 100</span></div>
          <div className="sb-chess-row"><span>Sigra leikmann úr öðrum umsjónarhóp</span><span className="sb-chess-pts">+10 st.</span></div>
        </div>
      </SbCard>

      <SbCard kicker="II" title="Listir & sköpun"
        sub="Stig fyrir skapandi verkefni og hugmyndaflug." items={SB_ARTS} />

      <SbCard kicker="III" title="Umgengni & skólaslit"
        sub="Samvinnustig — allir verða að leggjast á eitt." items={SB_CLEAN} />
    </React.Fragment>
  );
}

// Finale — only the grand achievement / victory.
function ScoreboardScreen() {
  const t = (window.THEMES && window.THEMES.nouveau) || {};
  return (
    <div className="cs-screen" style={{ background: 'radial-gradient(120% 90% at 50% 14%, #173029 0%, #0e1c19 55%, #060d0b 100%)' }}>
      <div className="cs-grain" />
      <div className="cs-vig" />

      <div className="cs-head">
        <span className="cs-rule" />
        <span className="cs-chapter" style={{ color: t.label }}>VI</span>
        <span className="cs-rule" />
      </div>

      <div className="fin-stage">
        <svg className="fin-crown" viewBox="0 0 64 48" width="96" fill="currentColor">
          <path d="M6 42 L10 14 L22 28 L32 8 L42 28 L54 14 L58 42 Z" />
          <rect x="6" y="42" width="52" height="5" rx="1" />
          <circle cx="10" cy="14" r="3" /><circle cx="32" cy="8" r="3" /><circle cx="54" cy="14" r="3" />
        </svg>
        <span className="fin-kicker" style={{ color: t.label }}>Stóra áskorunin</span>
        <h1 className="fin-title">Leynisíðu-afrekið</h1>
        <div className="fin-pts" style={{ color: t.label }}>300<span>stig</span></div>
        <div className="fin-rule" style={{ background: t.label }} />
        <p className="fin-congrats">Til hamingju.<br />Þið unnuð <strong>300 stig</strong>.</p>
      </div>

      <div className="cs-contact">salmons-volumes.8r@icloud.com</div>
    </div>
  );
}

Object.assign(window, { ScoreboardScreen, PointsSheet });
