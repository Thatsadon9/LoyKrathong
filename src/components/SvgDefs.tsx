/** Shared gradients. Mounted once so every krathong and lantern can reference them. */
export default function SvgDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="lk-candle-glow">
          <stop offset="0%" stopColor="#FFD98A" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#FFB653" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFB653" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lk-flame" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#FFFBEA" />
          <stop offset="45%" stopColor="#FFD36B" />
          <stop offset="100%" stopColor="#FF8A2A" />
        </radialGradient>
        <linearGradient id="lk-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5E9A55" />
          <stop offset="100%" stopColor="#24432A" />
        </linearGradient>
        <linearGradient id="lk-leaf-fold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DB46D" />
          <stop offset="100%" stopColor="#3A6B3C" />
        </linearGradient>
        <linearGradient id="lk-bread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2AE6C" />
          <stop offset="100%" stopColor="#8E5A2C" />
        </linearGradient>
        <linearGradient id="lk-bread-fold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2C88C" />
          <stop offset="100%" stopColor="#B97A3F" />
        </linearGradient>
        <linearGradient id="lk-lotus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE0E7" />
          <stop offset="55%" stopColor="#F3A6BA" />
          <stop offset="100%" stopColor="#C9587C" />
        </linearGradient>
        <linearGradient id="lk-lotus-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7B9C9" />
          <stop offset="100%" stopColor="#A9416A" />
        </linearGradient>
        <linearGradient id="lk-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6D98C" />
          <stop offset="50%" stopColor="#C99A42" />
          <stop offset="100%" stopColor="#7C5722" />
        </linearGradient>
        <radialGradient id="lk-lantern-0" cx="50%" cy="78%" r="75%">
          <stop offset="0%" stopColor="#FFF6DA" />
          <stop offset="45%" stopColor="#FFD08A" />
          <stop offset="100%" stopColor="#E0823A" />
        </radialGradient>
        <radialGradient id="lk-lantern-1" cx="50%" cy="78%" r="75%">
          <stop offset="0%" stopColor="#FFE7C9" />
          <stop offset="45%" stopColor="#FF8E6A" />
          <stop offset="100%" stopColor="#B8302E" />
        </radialGradient>
        <radialGradient id="lk-lantern-2" cx="50%" cy="78%" r="75%">
          <stop offset="0%" stopColor="#FFF9D9" />
          <stop offset="45%" stopColor="#F5D06A" />
          <stop offset="100%" stopColor="#B7802A" />
        </radialGradient>
      </defs>
    </svg>
  );
}
