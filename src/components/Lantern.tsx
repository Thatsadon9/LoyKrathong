import type { CSSProperties } from "react";

export const LANTERN_STYLES = [
  { label: "กระดาษสา", hint: "โคมสีนวลแบบดั้งเดิม" },
  { label: "แดง", hint: "โคมแดง ขอให้โชคดีมีชัย" },
  { label: "ทอง", hint: "โคมทอง ขอให้รุ่งเรือง" },
] as const;

export function LanternArt({ style, className }: { style: number; className?: string }) {
  const fill = `url(#lk-lantern-${Math.min(Math.max(style, 0), 2)})`;
  return (
    <svg viewBox="0 0 60 84" className={className} aria-hidden="true">
      <path d="M11 11 C11 3.5 49 3.5 49 11 L44.5 62 C43.5 66.5 16.5 66.5 15.5 62 Z" fill={fill} />
      <g stroke="#7A3514" strokeOpacity={0.18} strokeWidth={0.8} fill="none">
        <path d="M20.5 6.5 L23 64.5" />
        <path d="M30 5.2 L30 65.6" />
        <path d="M39.5 6.5 L37 64.5" />
      </g>
      <path d="M11 11 C11 3.5 49 3.5 49 11 C40 14 20 14 11 11 Z" fill="#FFFFFF" fillOpacity={0.14} />
      <ellipse cx={30} cy={63.5} rx={14.5} ry={2.6} fill="none" stroke="#5A2A12" strokeOpacity={0.6} strokeWidth={1.1} />
      <path d="M17 64 L30 70 L43 64" fill="none" stroke="#5A2A12" strokeOpacity={0.5} strokeWidth={0.7} />
      <ellipse className="lk-flame" cx={30} cy={70.5} rx={3} ry={4.2} fill="#FFF3C4" />
    </svg>
  );
}

export type LanternPlacement = {
  x: number;
  duration: number;
  delay: number;
  size: number;
  sway: number;
  wind: number;
};

export function Lantern({
  style,
  placement,
  label,
  tagTone = "mine",
  tier = 1,
  fresh,
}: {
  style: number;
  placement: LanternPlacement;
  label?: string;
  /** "mine" = the visitor's own (gold), "other" = someone else's (quiet). */
  tagTone?: "mine" | "other";
  /** 3 = first to be hidden on small screens. */
  tier?: number;
  fresh?: boolean;
}) {
  const { x, duration, delay, size, sway, wind } = placement;
  const vars = {
    "--x": `${x}%`,
    "--dur": `${duration}s`,
    "--delay": `${delay}s`,
    "--size": size.toFixed(3),
    "--sway": `${sway}s`,
    "--wind": `${wind}vw`,
  } as CSSProperties;

  return (
    <div className="ln-track" style={vars} data-tier={tier}>
      <div className={fresh ? "ln ln--fresh" : "ln"}>
        <div className="ln-sway">
          {label && <span className={`float-tag float-tag--${tagTone}`}>{label}</span>}
          <div className="ln-glow" />
          <LanternArt style={style} className="ln-art" />
        </div>
      </div>
    </div>
  );
}
