// Decorative flowing contour lines (pure SVG, no runtime cost)
const PATHS = Array.from({ length: 14 }, (_, i) => {
  const y = 40 + i * 26;
  const a = 60 + i * 6;
  return `M -20 ${y} C 180 ${y - a}, 360 ${y + a}, 560 ${y - a / 3} S 900 ${y + a / 2}, 1040 ${y - a / 4}`;
});

export const LineArt = ({ className = "" }) => (
  <svg aria-hidden="true" viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" className={`line-art pointer-events-none ${className}`}>
    <defs>
      <linearGradient id="la-stroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C86230" stopOpacity="0" />
        <stop offset="0.45" stopColor="#C86230" stopOpacity="0.55" />
        <stop offset="1" stopColor="#E07B48" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    {PATHS.map((d, i) => (
      <path key={i} d={d} fill="none" stroke={i % 4 === 0 ? "url(#la-stroke)" : "rgba(255,255,255,0.07)"} strokeWidth={i % 4 === 0 ? 1.2 : 0.8} />
    ))}
    {[[560, 118], [760, 236], [880, 150]].map(([cx, cy]) => (
      <g key={cx}>
        <circle cx={cx} cy={cy} r="3" fill="#C86230" />
        <circle cx={cx} cy={cy} r="9" fill="none" stroke="#C86230" strokeOpacity="0.35" />
      </g>
    ))}
  </svg>
);
