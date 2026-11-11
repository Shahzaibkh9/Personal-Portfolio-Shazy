/* Lightweight animated SVG illustrations for project cards */
export default function ProjectArt({ type }) {
  if (type === 'pos') {
    return (
      <svg viewBox="0 0 320 180" className="art art-pos" aria-hidden="true">
        <rect x="70" y="26" width="180" height="120" rx="12" className="a-panel" />
        <rect x="86" y="44" width="70" height="10" rx="5" className="a-line" />
        {[0, 1, 2].map((i) => (
          <g key={i} className="a-row" style={{ animationDelay: `${i * 0.4}s` }}>
            <rect x="86" y={66 + i * 22} width="96" height="12" rx="6" className="a-soft" />
            <rect x="196" y={66 + i * 22} width="38" height="12" rx="6" className="a-acc" />
          </g>
        ))}
        <rect x="238" y="104" width="64" height="44" rx="10" className="a-card" />
        <circle cx="256" cy="126" r="8" className="a-acc" />
        <rect x="268" y="120" width="24" height="5" rx="2.5" className="a-soft" />
        <rect x="268" y="129" width="16" height="5" rx="2.5" className="a-soft" />
        <g className="a-scooter">
          <circle cx="40" cy="146" r="9" className="a-line-s" />
          <circle cx="74" cy="146" r="9" className="a-line-s" />
          <path d="M40 146h20l10-22h10" className="a-line-s" />
        </g>
      </svg>
    )
  }
  if (type === 'wave') {
    return (
      <svg viewBox="0 0 320 180" className="art art-wave" aria-hidden="true">
        <circle cx="70" cy="90" r="34" className="a-panel" />
        <circle cx="70" cy="90" r="10" className="a-acc" />
        <circle cx="70" cy="90" r="22" className="a-ring" />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={124 + i * 8} y="60" width="4" height="60" rx="2" className="a-bar" style={{ animationDelay: `${(i * 97) % 900}ms` }} />
        ))}
        <text x="124" y="146" className="a-text">
          ● LIVE ON AIR
        </text>
      </svg>
    )
  }
  if (type === 'chart') {
    return (
      <svg viewBox="0 0 320 180" className="art art-chart" aria-hidden="true">
        <rect x="40" y="24" width="240" height="132" rx="12" className="a-panel" />
        {[46, 70, 58, 92, 80, 104].map((h, i) => (
          <rect key={i} x={64 + i * 34} y={140 - h} width="20" height={h} rx="5" className={i === 5 ? 'a-acc a-grow' : 'a-soft a-grow'} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
        <path d="M74 98 L108 78 L142 88 L176 54 L210 64 L244 36" className="a-trend" />
        <circle cx="244" cy="36" r="5" className="a-acc" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 320 180" className="art art-voice" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="160" cy="90" r="30" className="a-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <circle cx="160" cy="90" r="30" className="a-acc" />
      <rect x="153" y="72" width="14" height="26" rx="7" className="a-mic" />
      <path d="M146 92a14 14 0 0028 0M160 106v6" className="a-mic-line" />
      <rect x="28" y="40" width="88" height="26" rx="13" className="a-bubble" />
      <text x="40" y="57" className="a-text">Assalam-o-Alaikum!</text>
      <rect x="204" y="114" width="88" height="26" rx="13" className="a-bubble b2" />
      <text x="216" y="131" className="a-text">Order confirmed ✓</text>
    </svg>
  )
}
