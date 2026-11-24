import { seeded } from "@/lib/random";

/*
 * Riverside skyline, drawn on a 1600 x 360 canvas whose bottom edge sits on the river.
 * The temple group stays between x 560 and 1060 so it survives cropping on phones.
 */

const GY = 334; // ground line of the riverbank
const GOLD = "#D8B15A";
const LIT = "#FFC970";
const FAR = "#272B60";
const MID = "#1F2254";
const MID_FACE = "#2A2C66";
const ROOF = "#3B2655";
const ROOF_FACE = "#2A1F4B";

function FarCity() {
  const rand = seeded(11);
  const blocks: { x: number; w: number; h: number; wins: [number, number][] }[] = [];
  let x = -10;
  while (x < 1610) {
    const w = 26 + rand() * 46;
    const nearTemple = x > 560 && x < 1080;
    const h = nearTemple ? 18 + rand() * 40 : 34 + rand() * 96;
    const wins: [number, number][] = [];
    for (let wx = x + 5; wx < x + w - 6; wx += 9) {
      for (let wy = GY - h + 8; wy < GY - 8; wy += 11) {
        if (rand() < 0.16) wins.push([wx, wy]);
      }
    }
    blocks.push({ x, w, h, wins });
    x += w + rand() * 4;
  }
  return (
    <g>
      {blocks.map((b) => (
        <rect key={`fb${b.x}`} x={b.x} y={GY - b.h} width={b.w} height={b.h} fill={FAR} />
      ))}
      <rect x={232} y={GY - 178} width={34} height={178} fill={FAR} />
      <rect x={244} y={GY - 196} width={10} height={20} fill={FAR} />
      <circle className="sky-blink" cx={249} cy={GY - 198} r={2.2} fill="#FF6B5A" />
      <rect x={1368} y={GY - 160} width={40} height={160} fill={FAR} />
      <circle className="sky-blink sky-blink--late" cx={1388} cy={GY - 163} r={2.2} fill="#FF6B5A" />
      <g fill="#FFD58A" opacity={0.5}>
        {blocks.flatMap((b) =>
          b.wins.map(([wx, wy]) => <rect key={`w${wx}-${wy}`} x={wx} y={wy} width={3} height={4} />),
        )}
      </g>
    </g>
  );
}

function Shophouses() {
  const rand = seeded(23);
  const units = Array.from({ length: 7 }, (_, i) => {
    const x = 86 + i * 54;
    const h = 72 + rand() * 14;
    return { x, h, upper: [rand() < 0.6, rand() < 0.5], shop: rand() < 0.65 };
  });
  return (
    <g>
      {units.map(({ x, h, upper, shop }) => (
        <g key={`sh${x}`}>
          <rect x={x} y={GY - h} width={52} height={h} fill={MID_FACE} />
          <rect x={x - 1} y={GY - h - 5} width={54} height={6} fill={MID} />
          <rect x={x + 7} y={GY - h + 12} width={13} height={18} fill={upper[0] ? LIT : MID} opacity={upper[0] ? 0.85 : 1} />
          <rect x={x + 32} y={GY - h + 12} width={13} height={18} fill={upper[1] ? LIT : MID} opacity={upper[1] ? 0.85 : 1} />
          <rect x={x + 2} y={GY - 40} width={48} height={4} fill={MID} />
          <rect x={x + 6} y={GY - 34} width={40} height={34} fill={shop ? "#FFB760" : "#232553"} opacity={shop ? 0.75 : 1} />
          {!shop &&
            [0, 6, 12, 18, 24].map((dy) => (
              <line key={dy} x1={x + 6} x2={x + 46} y1={GY - 30 + dy} y2={GY - 30 + dy} stroke="#2F3270" />
            ))}
        </g>
      ))}
    </g>
  );
}

function Palm({ x, h, lean }: { x: number; h: number; lean: number }) {
  const tx = x + lean;
  const ty = GY - h;
  const fronds = [-150, -120, -85, -55, -20, 15, 40];
  return (
    <g stroke="#161939" fill="none" strokeLinecap="round">
      <path d={`M${x} ${GY} Q${x + lean * 0.2} ${GY - h * 0.6} ${tx} ${ty}`} strokeWidth={4} />
      {fronds.map((a) => {
        const r = (a * Math.PI) / 180;
        const ex = tx + Math.cos(r) * 34;
        const ey = ty + Math.sin(r) * 18 + 16;
        const mx = tx + Math.cos(r) * 20;
        const my = ty + Math.sin(r) * 18 - 6;
        return <path key={a} d={`M${tx} ${ty} Q${mx} ${my} ${ex} ${ey}`} strokeWidth={3} />;
      })}
    </g>
  );
}

function Tree({ x, r }: { x: number; r: number }) {
  const rand = seeded(x);
  const blobs = Array.from({ length: 7 }, () => ({
    dx: (rand() - 0.5) * r * 1.8,
    dy: -r - rand() * r * 0.9,
    rr: r * (0.45 + rand() * 0.4),
  }));
  return (
    <g fill="#181B43">
      <rect x={x - 4} y={GY - r} width={8} height={r} />
      {blobs.map((b, i) => (
        <circle key={i} cx={x + b.dx} cy={GY + b.dy} r={b.rr} />
      ))}
    </g>
  );
}

function Prang({ cx }: { cx: number }) {
  const tiers: { yb: number; h: number; hw: number }[] = [];
  let y = GY - 38;
  for (let i = 0; i < 8; i++) {
    const hw = (66 * (1 - i * 0.105)) / 2;
    const h = 28 * (1 - i * 0.07);
    tiers.push({ yb: y, h, hw });
    y -= h;
  }
  const top = y;
  return (
    <g>
      <rect x={cx - 64} y={GY - 12} width={128} height={12} fill={MID_FACE} />
      <rect x={cx - 52} y={GY - 24} width={104} height={12} fill={MID_FACE} />
      <rect x={cx - 42} y={GY - 38} width={84} height={14} fill={MID_FACE} />
      <g stroke={GOLD} strokeOpacity={0.5} strokeWidth={1}>
        <line x1={cx - 64} x2={cx + 64} y1={GY - 12} y2={GY - 12} />
        <line x1={cx - 52} x2={cx + 52} y1={GY - 24} y2={GY - 24} />
        <line x1={cx - 42} x2={cx + 42} y1={GY - 38} y2={GY - 38} />
      </g>
      {tiers.map(({ yb, h, hw }) => {
        const yt = yb - h;
        return (
          <path
            key={yb}
            d={`M${cx - hw} ${yb} L${cx - hw * 0.94} ${yt + h * 0.35} Q${cx - hw * 0.86} ${yt} ${cx - hw * 0.55} ${yt} L${cx + hw * 0.55} ${yt} Q${cx + hw * 0.86} ${yt} ${cx + hw * 0.94} ${yt + h * 0.35} L${cx + hw} ${yb} Z`}
            fill={MID_FACE}
            stroke={GOLD}
            strokeOpacity={0.45}
            strokeWidth={0.9}
          />
        );
      })}
      <path d={`M${cx - 8} ${GY - 38} V${GY - 58} Q${cx} ${GY - 68} ${cx + 8} ${GY - 58} V${GY - 38} Z`} fill={LIT} opacity={0.9} />
      <ellipse cx={cx} cy={top - 6} rx={6} ry={8} fill={MID_FACE} stroke={GOLD} strokeOpacity={0.6} />
      <g stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" fill="none">
        <line x1={cx} y1={top - 14} x2={cx} y2={top - 48} />
        <path d={`M${cx - 6} ${top - 40} Q${cx - 6} ${top - 46} ${cx - 3} ${top - 47}`} />
        <path d={`M${cx + 6} ${top - 40} Q${cx + 6} ${top - 46} ${cx + 3} ${top - 47}`} />
        <line x1={cx - 6} y1={top - 40} x2={cx + 6} y2={top - 40} />
      </g>
    </g>
  );
}

function teeth(ax: number, ay: number, bx: number, by: number, outward: 1 | -1, n = 12) {
  const len = Math.hypot(bx - ax, by - ay);
  const nx = (-(by - ay) / len) * outward;
  const ny = ((bx - ax) / len) * outward;
  const pts: string[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const t = i / (n * 2);
    const o = i % 2 === 1 ? 4.5 : 0;
    pts.push(`${(ax + (bx - ax) * t + nx * o).toFixed(1)},${(ay + (by - ay) * t + ny * o).toFixed(1)}`);
  }
  return pts.join(" ");
}

function Chofa({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <path
      d={`M${x} ${y} C${x + 3 * size} ${y - 12 * size} ${x - 4 * size} ${y - 24 * size} ${x - 13 * size} ${y - 21 * size}`}
      stroke={GOLD}
      strokeWidth={3 * size}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function HangHong({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  return (
    <path
      d={`M${x} ${y} q${-7 * dir} -1 ${-8 * dir} -10`}
      stroke={GOLD}
      strokeWidth={2.2}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function SideTiers({ cx }: { cx: number }) {
  const tiers = [
    { x1: 74, y1: 112, x2: 138, y2: 80 },
    { x1: 58, y1: 138, x2: 114, y2: 100 },
  ];
  return (
    <g>
      {tiers.map(({ x1, y1, x2, y2 }) =>
        ([-1, 1] as const).map((s) => (
          <g key={`${x1}${s}`}>
            <path
              d={`M${cx + s * x1} ${GY - y1} L${cx + s * x2} ${GY - y2} L${cx + s * x2} ${GY - y2 + 9} L${cx + s * x1} ${GY - y1 + 9} Z`}
              fill={ROOF}
            />
            <line
              x1={cx + s * x1}
              y1={GY - y1}
              x2={cx + s * x2}
              y2={GY - y2}
              stroke={GOLD}
              strokeWidth={1.6}
            />
            <HangHong x={cx + s * x2} y={GY - y2} dir={s === -1 ? 1 : -1} />
          </g>
        )),
      )}
    </g>
  );
}

function Gable({ cx, apex, base, half }: { cx: number; apex: number; base: number; half: number }) {
  const ax = cx;
  const ay = GY - apex;
  const by = GY - base;
  return (
    <g>
      <path d={`M${ax} ${ay} L${cx - half} ${by} L${cx + half} ${by} Z`} fill={ROOF} />
      <path
        d={`M${ax} ${ay + 12} L${cx - half + 14} ${by - 3} L${cx + half - 14} ${by - 3} Z`}
        fill={ROOF_FACE}
        stroke={GOLD}
        strokeOpacity={0.55}
        strokeWidth={0.9}
      />
      <path d={`M${cx - half} ${by} L${ax} ${ay} L${cx + half} ${by}`} stroke={GOLD} strokeWidth={2.4} fill="none" />
      <polyline points={teeth(ax, ay, cx - half, by, -1)} stroke={GOLD} strokeWidth={1.1} fill="none" />
      <polyline points={teeth(ax, ay, cx + half, by, 1)} stroke={GOLD} strokeWidth={1.1} fill="none" />
      <Chofa x={ax} y={ay} />
      <HangHong x={cx - half} y={by} dir={1} />
      <HangHong x={cx + half} y={by} dir={-1} />
    </g>
  );
}

function Ubosot({ cx }: { cx: number }) {
  return (
    <g>
      <rect x={cx - 138} y={GY - 6} width={276} height={6} fill="#23245A" />
      <rect x={cx - 128} y={GY - 14} width={256} height={9} fill="#2B2B64" />
      <path d={`M${cx - 24} ${GY} L${cx - 19} ${GY - 14} L${cx + 19} ${GY - 14} L${cx + 24} ${GY} Z`} fill="#35357A" />
      <rect x={cx - 92} y={GY - 82} width={184} height={68} fill="#2D2C69" />
      {[-74, -44, 44, 74].map((wx) => (
        <rect key={wx} x={cx + wx - 6} y={GY - 66} width={12} height={30} rx={5} fill={LIT} opacity={0.82} />
      ))}
      <path
        d={`M${cx - 15} ${GY - 14} V${GY - 50} Q${cx} ${GY - 66} ${cx + 15} ${GY - 50} V${GY - 14} Z`}
        fill="#FFD585"
      />
      {[-92, -60, 60, 92].map((px) => (
        <rect key={px} x={cx + px - 4.5} y={GY - 86} width={9} height={72} fill="#3A397F" />
      ))}
      <rect x={cx - 98} y={GY - 92} width={196} height={8} fill={ROOF} />
      <SideTiers cx={cx} />
      <rect x={cx - 76} y={GY - 124} width={152} height={34} fill="#25235A" />
      <Gable cx={cx} apex={252} base={148} half={54} />
      <Gable cx={cx} apex={232} base={122} half={74} />
      <circle cx={cx} cy={GY - 164} r={9} fill="none" stroke={GOLD} strokeWidth={1.3} />
      <circle cx={cx} cy={GY - 164} r={3} fill={GOLD} />
    </g>
  );
}

function GoldenChedi({ cx }: { cx: number }) {
  const by = GY - 48;
  const rings = Array.from({ length: 10 }, (_, i) => ({ w: 14 - i * 1.1, y: GY - 126 - (i + 1) * 5.5 }));
  return (
    <g>
      <ellipse cx={cx} cy={GY - 92} rx={96} ry={118} fill="url(#lk-candle-glow)" opacity={0.55} />
      <g fill="url(#lk-gold)">
        <rect x={cx - 56} y={GY - 10} width={112} height={10} />
        <rect x={cx - 47} y={GY - 20} width={94} height={10} />
        <rect x={cx - 39} y={GY - 30} width={78} height={10} />
        <rect x={cx - 33} y={GY - 36} width={66} height={6} rx={3} />
        <rect x={cx - 29} y={GY - 42} width={58} height={6} rx={3} />
        <rect x={cx - 25} y={by} width={50} height={6} rx={3} />
        <path d={`M${cx - 32} ${by} C${cx - 33} ${by - 36} ${cx - 18} ${by - 64} ${cx} ${by - 66} C${cx + 18} ${by - 64} ${cx + 33} ${by - 36} ${cx + 32} ${by} Z`} />
        <rect x={cx - 10} y={GY - 126} width={20} height={12} />
        {rings.map((r) => (
          <rect key={r.y} x={cx - r.w / 2} y={r.y} width={r.w} height={4.7} rx={1.5} />
        ))}
        <ellipse cx={cx} cy={GY - 187} rx={2.6} ry={6} />
      </g>
      <line x1={cx} y1={GY - 192} x2={cx} y2={GY - 214} stroke="#F3D488" strokeWidth={1.2} />
      <path d={`M${cx - 20} ${by - 6} C${cx - 18} ${by - 34} ${cx - 10} ${by - 52} ${cx - 2} ${by - 58}`} stroke="#FFF1C2" strokeOpacity={0.5} strokeWidth={2} fill="none" />
    </g>
  );
}

function ThaiHouse({ x }: { x: number }) {
  return (
    <g>
      {[-30, -12, 12, 30].map((dx) => (
        <line key={dx} x1={x + dx} x2={x + dx} y1={GY} y2={GY - 24} stroke={MID_FACE} strokeWidth={3} />
      ))}
      <rect x={x - 40} y={GY - 28} width={80} height={5} fill={MID_FACE} />
      <path d={`M${x - 33} ${GY - 24} L${x - 29} ${GY - 60} L${x + 29} ${GY - 60} L${x + 33} ${GY - 24} Z`} fill="#2A2B62" />
      {[-20, -10, 0, 10, 20].map((dx) => (
        <line key={dx} x1={x + dx} x2={x + dx * 0.95} y1={GY - 26} y2={GY - 58} stroke="#33357A" strokeWidth={1} />
      ))}
      <rect x={x - 9} y={GY - 52} width={18} height={18} fill={LIT} opacity={0.85} />
      <line x1={x} x2={x} y1={GY - 52} y2={GY - 34} stroke="#B4793A" strokeWidth={1} />
      <path d={`M${x} ${GY - 116} L${x - 46} ${GY - 56} L${x + 46} ${GY - 56} Z`} fill="#222558" />
      <path d={`M${x} ${GY - 104} L${x - 32} ${GY - 62} L${x + 32} ${GY - 62} Z`} fill="#2C2E68" />
      <path d={`M${x - 46} ${GY - 56} L${x} ${GY - 116} L${x + 46} ${GY - 56}`} stroke="#8F7442" strokeWidth={2} fill="none" />
      <path d={`M${x - 46} ${GY - 56} q-6 -1 -7 -9`} stroke="#8F7442" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M${x + 46} ${GY - 56} q6 -1 7 -9`} stroke="#8F7442" strokeWidth={2} fill="none" strokeLinecap="round" />
      <circle className="sky-twinkle" cx={x + 36} cy={GY - 36} r={3} fill="#FF9F5A" />
    </g>
  );
}

function Bank() {
  const posts = Array.from({ length: 10 }, (_, i) => 40 + i * 170);
  const top = GY - 34;
  const bulbs = ["#FFD27A", "#FF9F6B", "#FFE9B0", "#F7B7C8"];
  const lights: { x: number; y: number; c: string; i: number }[] = [];
  posts.slice(0, -1).forEach((p, s) => {
    const q = posts[s + 1];
    for (let i = 1; i < 10; i++) {
      const t = i / 10;
      lights.push({
        x: p + (q - p) * t,
        y: top + 3 + Math.sin(Math.PI * t) * 16,
        c: bulbs[(s + i) % bulbs.length],
        i: s * 10 + i,
      });
    }
  });
  return (
    <g>
      <rect x={0} y={GY} width={1600} height={30} fill="#141737" />
      <rect x={0} y={GY - 2} width={1600} height={3} fill="#2A2D66" />
      {posts.map((p) => (
        <g key={p}>
          <line x1={p} x2={p} y1={GY} y2={top} stroke="#2E3170" strokeWidth={3} />
          <circle cx={p} cy={top - 3} r={16} fill="url(#lk-candle-glow)" />
          <circle cx={p} cy={top - 3} r={4} fill="#FFE2A4" />
        </g>
      ))}
      <path
        d={posts
          .slice(0, -1)
          .map((p, s) => `M${p} ${top + 2} Q${(p + posts[s + 1]) / 2} ${top + 34} ${posts[s + 1]} ${top + 2}`)
          .join(" ")}
        stroke="#3A3D78"
        strokeWidth={0.8}
        fill="none"
      />
      {lights.map((l) => (
        <circle
          key={l.i}
          className={l.i % 3 === 0 ? "sky-twinkle" : undefined}
          style={{ animationDelay: `${(l.i % 7) * -0.6}s` }}
          cx={l.x}
          cy={l.y}
          r={2.1}
          fill={l.c}
        />
      ))}
    </g>
  );
}

export default function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 1600 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <FarCity />
      <Shophouses />
      <Palm x={478} h={120} lean={10} />
      <Tree x={540} r={34} />
      <Prang cx={655} />
      <Ubosot cx={830} />
      <GoldenChedi cx={1005} />
      <Tree x={1090} r={30} />
      <Palm x={1122} h={128} lean={-8} />
      <ThaiHouse x={1196} />
      <ThaiHouse x={1316} />
      <Palm x={1395} h={110} lean={9} />
      <ThaiHouse x={1470} />
      <Palm x={1560} h={124} lean={-10} />
      <Bank />
    </svg>
  );
}
