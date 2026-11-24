import { seeded } from "@/lib/random";

const rand = seeded(5);
const STARS = Array.from({ length: 150 }, (_, i) => ({
  i,
  x: rand() * 1000,
  y: rand() ** 1.5 * 560,
  r: 0.5 + rand() * 1.3,
  o: 0.35 + rand() * 0.6,
  twinkle: rand() < 0.22,
  delay: -rand() * 6,
}));

export default function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <svg className="stars" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        {STARS.map((s) => (
          <circle
            key={s.i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#FFF6E0"
            opacity={s.o}
            className={s.twinkle ? "sky-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          />
        ))}
      </svg>
      <div className="moon-halo" />
      <div className="moon" />
      <div className="horizon-glow" />
    </div>
  );
}
