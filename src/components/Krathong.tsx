import type { CSSProperties } from "react";

export const KRATHONG_STYLES = [
  { label: "ใบตอง", hint: "กระทงใบตองพับกลีบ ประดับบัวและดาวเรือง" },
  { label: "ขนมปัง", hint: "กระทงขนมปัง ปลาได้กิน ไม่เป็นขยะในน้ำ" },
  { label: "ดอกบัว", hint: "กลีบบัวบานบนใบบัว" },
] as const;

const CX = 60;
const RIM_Y = 66;
const RX = 44;
const RY = 9;

function rimY(x: number, front: boolean) {
  const k = Math.max(0, 1 - ((x - CX) / RX) ** 2);
  return RIM_Y + (front ? 1 : -1) * RY * Math.sqrt(k);
}

function petal(len: number, w: number) {
  return `M0 0 C ${-w} ${-len * 0.35}, ${-w * 0.6} ${-len * 0.85}, 0 ${-len} C ${w * 0.6} ${-len * 0.85}, ${w} ${-len * 0.35}, 0 0 Z`;
}

function pointedFold(x: number, y: number, h: number, w: number) {
  const lean = (x - CX) * 0.12;
  return `M${x - w / 2} ${y} L${x + lean} ${y - h} L${x + w / 2} ${y} Z`;
}

function roundFold(x: number, y: number, h: number, w: number) {
  const lean = (x - CX) * 0.1;
  return `M${x - w / 2} ${y} Q${x - w / 2 + lean} ${y - h}, ${x + lean} ${y - h - 1} Q${x + w / 2 + lean} ${y - h}, ${x + w / 2} ${y} Z`;
}

const BACK_XS = [22, 31, 40, 50, 60, 70, 80, 89, 98];
const FRONT_XS = [21, 31, 42, 53, 64, 75, 86, 97];

function Marigold({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#F2A230" />
      <circle cx={x} cy={y} r={r * 0.62} fill="#E68A1C" />
      <circle cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.28} fill="#FFC864" />
    </g>
  );
}

function Jasmine({ x, y }: { x: number; y: number }) {
  return (
    <g fill="#FBF6EA">
      <circle cx={x} cy={y} r={1.8} />
      <circle cx={x + 3.4} cy={y + 1} r={1.6} />
      <circle cx={x - 3.2} cy={y + 1.2} r={1.6} />
      <circle cx={x + 0.4} cy={y + 3} r={1.5} />
    </g>
  );
}

function Candle() {
  return (
    <g>
      <rect x={56.5} y={36} width={7} height={25} rx={1.6} fill="#F3E4C4" />
      <rect x={56.5} y={36} width={2.2} height={25} rx={1} fill="#D9C39C" />
      <path d="M57 37 q3 -2.5 6 0 v2.5 q-1 1.6 -1.6 0 q-1.4 2.2 -2.8 0 q-0.8 1.4 -1.6 0 Z" fill="#FFF7E2" />
      <line x1={60} y1={36} x2={60} y2={33} stroke="#3B2A1C" strokeWidth={0.9} />
      <path
        className="lk-flame"
        d="M60 16.5 C55.4 24.5 55.8 30.8 60 34.6 C64.2 30.8 64.6 24.5 60 16.5 Z"
        fill="url(#lk-flame)"
      />
    </g>
  );
}

function Incense() {
  const sticks: [number, number][] = [
    [74, 27],
    [79, 30],
    [70, 25],
  ];
  return (
    <g>
      {sticks.map(([x, y]) => (
        <g key={x}>
          <line x1={67} y1={60} x2={x} y2={y} stroke="#6E4428" strokeWidth={1.1} strokeLinecap="round" />
          <circle className="lk-ember" cx={x} cy={y} r={1.5} fill="#FF6A3D" />
        </g>
      ))}
    </g>
  );
}

function LeafOrBread({ bread }: { bread: boolean }) {
  const body = bread ? "url(#lk-bread)" : "url(#lk-leaf)";
  const fold = bread ? "url(#lk-bread-fold)" : "url(#lk-leaf-fold)";
  const edge = bread ? "#FCE2B6" : "#A6D592";
  const foldPath = bread ? roundFold : pointedFold;
  return (
    <>
      <path d={`M16 ${RIM_Y} C21 83, 99 83, 104 ${RIM_Y} Z`} fill={body} />
      <ellipse cx={CX} cy={RIM_Y} rx={RX} ry={RY} fill={bread ? "#B27A42" : "#305B33"} />
      {BACK_XS.map((x) => (
        <path
          key={`b${x}`}
          d={foldPath(x, rimY(x, false) + 1, 15, 11)}
          fill={fold}
          stroke={edge}
          strokeOpacity={0.45}
          strokeWidth={0.6}
        />
      ))}
      <g transform="translate(60 62)">
        <path d={petal(28, 13)} transform="rotate(-34)" fill="url(#lk-lotus-deep)" />
        <path d={petal(28, 13)} transform="rotate(34)" fill="url(#lk-lotus-deep)" />
        <path d={petal(24, 11)} transform="rotate(-14)" fill="url(#lk-lotus)" />
        <path d={petal(24, 11)} transform="rotate(14)" fill="url(#lk-lotus)" />
      </g>
      {bread ? (
        <>
          <Marigold x={41} y={60} r={5.5} />
          <Jasmine x={50} y={61} />
          <Marigold x={79} y={60} r={5.5} />
          <Jasmine x={71} y={62} />
        </>
      ) : (
        <>
          <Marigold x={40} y={60} />
          <Marigold x={80} y={60} />
          <Jasmine x={49} y={62} />
        </>
      )}
      <Candle />
      <Incense />
      {FRONT_XS.map((x) => (
        <path
          key={`f${x}`}
          d={foldPath(x, rimY(x, true) + 1, 11, 11.5)}
          fill={fold}
          stroke={edge}
          strokeOpacity={0.5}
          strokeWidth={0.6}
        />
      ))}
      {bread && (
        <g fill="#7A4A22" opacity={0.55}>
          <circle cx={34} cy={76} r={0.9} />
          <circle cx={47} cy={79} r={0.8} />
          <circle cx={62} cy={80} r={0.9} />
          <circle cx={76} cy={78} r={0.8} />
          <circle cx={88} cy={75} r={0.9} />
        </g>
      )}
    </>
  );
}

function Lotus() {
  const outer = [-78, -56, -34, 34, 56, 78];
  return (
    <>
      <path d="M12 70 C14 80, 106 80, 108 70 C104 64, 16 64, 12 70 Z" fill="url(#lk-leaf)" />
      <path d="M60 70 L66 63" stroke="#1F3B23" strokeWidth={1.2} />
      <g transform="translate(60 67)">
        {outer.map((a) => (
          <path key={a} d={petal(34, 14)} transform={`rotate(${a})`} fill="url(#lk-lotus-deep)" />
        ))}
        {[-22, 0, 22].map((a) => (
          <path key={a} d={petal(36, 13)} transform={`rotate(${a})`} fill="url(#lk-lotus)" />
        ))}
      </g>
      <Marigold x={47} y={62} r={4.5} />
      <Marigold x={73} y={62} r={4.5} />
      <Candle />
      <Incense />
      <g fill="url(#lk-lotus)">
        <ellipse cx={40} cy={71} rx={11} ry={5.5} transform="rotate(-12 40 71)" />
        <ellipse cx={80} cy={71} rx={11} ry={5.5} transform="rotate(12 80 71)" />
        <ellipse cx={60} cy={74} rx={13} ry={6} />
      </g>
    </>
  );
}

export function KrathongArt({ style, className }: { style: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <circle cx={60} cy={30} r={40} fill="url(#lk-candle-glow)" className="lk-glow" />
      <ellipse cx={60} cy={90} rx={7} ry={11} fill="url(#lk-candle-glow)" className="lk-reflect" />
      <ellipse className="lk-ripple" cx={60} cy={79} rx={50} ry={4} fill="none" stroke="#FFD696" strokeOpacity={0.3} />
      {style === 2 ? <Lotus /> : <LeafOrBread bread={style === 1} />}
    </svg>
  );
}

export type KrathongPlacement = {
  depth: number;
  duration: number;
  delay: number;
  bob: number;
  bobDelay: number;
};

export function Krathong({
  style,
  placement,
  label,
  tagTone = "mine",
  tier = 1,
  fresh,
  onLaunched,
}: {
  style: number;
  placement: KrathongPlacement;
  label?: string;
  /** "mine" = the visitor's own (gold), "other" = someone else's (quiet). */
  tagTone?: "mine" | "other";
  /** 3 = first to be hidden on small screens. */
  tier?: number;
  fresh?: boolean;
  onLaunched?: () => void;
}) {
  const { depth, duration, delay, bob, bobDelay } = placement;
  const vars = {
    "--y": `${4 + depth * 76}%`,
    "--z": Math.round(depth * 100),
    "--scale": (0.38 + depth * 0.72).toFixed(3),
    "--dur": `${duration}s`,
    "--delay": `${delay}s`,
    "--bob": `${bob}s`,
    "--bob-delay": `${bobDelay}s`,
    "--dim": (0.55 + depth * 0.45).toFixed(3),
  } as CSSProperties;

  return (
    <div className="kt-track" style={vars} data-tier={tier} data-far={depth < 0.32 ? "" : undefined}>
      <div
        className={fresh ? "kt kt--launch" : "kt"}
        onAnimationEnd={(e) => {
          if (e.animationName.includes("kt-launch")) onLaunched?.();
        }}
      >
        {label && <span className={`float-tag float-tag--${tagTone}`}>{label}</span>}
        <div className="kt-bob">
          <KrathongArt style={style} className="kt-art" />
        </div>
      </div>
    </div>
  );
}
