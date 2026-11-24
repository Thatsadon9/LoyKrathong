"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ambientNameAt, randomAmbientName } from "@/lib/ambientNames";
import { seeded } from "@/lib/random";
import { OWNER_HEADER, type FloatKind, type MyFloat, type PublicFeed } from "@/lib/types";
import { Krathong, KrathongArt, type KrathongPlacement } from "./Krathong";
import { Lantern, LanternArt, type LanternPlacement } from "./Lantern";
import MineDrawer from "./MineDrawer";
import Sky from "./Sky";
import Skyline from "./Skyline";
import SvgDefs from "./SvgDefs";
import WishModal, { type WishInput } from "./WishModal";

const TOKEN_KEY = "loykrathong.owner";
const POLL_MS = 20_000;
const MAX_MINE_ON_SCENE = 12;

const streakRand = seeded(3);
const MOON_STREAKS = Array.from({ length: 16 }, (_, i) => {
  const w = 34 + streakRand() * 60 - i * 1.2;
  return {
    w,
    x: (100 - w) / 2 + (streakRand() - 0.5) * 18,
    o: 0.75 - i * 0.035,
    d: -streakRand() * 4,
  };
});

/*
 * Ambient scenery: decorative krathongs and lanterns drawn on every visit so the river
 * looks festive before (and alongside) real ones. They live only in the browser: they are
 * never stored, never counted, and never shown in /admin. As real ones arrive, fewer
 * ambient ones are drawn. Tier 3 is hidden on small screens to keep phones smooth.
 */
const AMBIENT = {
  krathong: { target: 38, min: 14 },
  lantern: { target: 30, min: 10 },
} as const;
/** Real totals are shown only once there are this many; below that the line stays wordy. */
const SHOW_TOTALS_FROM = 100;

function ambientStyle(r: () => number): number {
  const v = r();
  return v < 0.5 ? 0 : v < 0.75 ? 1 : 2;
}

const AMBIENT_KRATHONGS = Array.from({ length: AMBIENT.krathong.target }, (_, i) => {
  const id = `ambient-krathong-${i}`;
  // Name tags only on some of the nearer ones, so the river doesn't turn into a list.
  const tagged = i % 2 === 0 && krathongPlacement(id).depth > 0.45;
  return {
    id,
    style: ambientStyle(seeded(`${id}:style`)),
    tier: (i % 3) + 1,
    label: tagged ? ambientNameAt(i) : undefined,
  };
});

const AMBIENT_LANTERNS = Array.from({ length: AMBIENT.lantern.target }, (_, i) => {
  const id = `ambient-lantern-${i}`;
  return { id, style: ambientStyle(seeded(`${id}:style`)), tier: (i % 3) + 1 };
});

function ambientCount(kind: keyof typeof AMBIENT, real: number): number {
  const { target, min } = AMBIENT[kind];
  return Math.max(min, target - real);
}

type LiveLantern = { id: string; style: number; label: string; placement: LanternPlacement };

function krathongPlacement(id: string): KrathongPlacement {
  const r = seeded(id);
  const depth = 0.06 + r() * 0.88;
  const duration = Math.round(150 - depth * 70);
  return { depth, duration, delay: -r() * duration, bob: 3 + r() * 2.5, bobDelay: -r() * 5 };
}

function lanternPlacement(id: string, front: boolean): LanternPlacement {
  const r = seeded(id);
  const duration = front ? 70 + r() * 20 : 55 + r() * 45;
  return {
    x: front ? 18 + r() * 64 : 3 + r() * 90,
    duration,
    delay: -r() * duration,
    size: front ? 0.95 + r() * 0.2 : 0.4 + r() * 0.6,
    sway: 5 + r() * 4,
    wind: (r() - 0.35) * 12,
  };
}

async function fetchFeed(): Promise<PublicFeed> {
  const res = await fetch("/api/floats");
  if (!res.ok) throw new Error(`feed ${res.status}`);
  return res.json();
}

function getToken(): string {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export default function LoyKrathong() {
  const [token, setToken] = useState<string | null>(null);
  const [feed, setFeed] = useState<PublicFeed | null>(null);
  const [mine, setMine] = useState<MyFloat[]>([]);
  const [mineLoading, setMineLoading] = useState(true);
  const [launching, setLaunching] = useState<Record<string, true>>({});
  const [overrides, setOverrides] = useState<Record<string, Partial<KrathongPlacement & LanternPlacement>>>({});
  const [modal, setModal] = useState<FloatKind | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [feedError, setFeedError] = useState(false);
  const [live, setLive] = useState<LiveLantern[]>([]);

  useEffect(() => {
    // Every so often someone on the bank releases a lantern, so the sky keeps changing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers = new Set<number>();
    let n = 0;
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const release = () => {
      if (document.visibilityState === "visible") {
        const id = `live-${n++}`;
        const duration = 50 + Math.random() * 12;
        const lantern: LiveLantern = {
          id,
          style: ambientStyle(Math.random),
          label: randomAmbientName(),
          placement: {
            x: 6 + Math.random() * 86,
            duration,
            delay: 0,
            size: 0.5 + Math.random() * 0.25,
            sway: 5 + Math.random() * 3,
            wind: (Math.random() - 0.35) * 10,
          },
        };
        setLive((list) => [...list.slice(-3), lantern]);
        later(() => setLive((list) => list.filter((l) => l.id !== id)), duration * 1000);
      }
      later(release, 9_000 + Math.random() * 14_000);
    };
    later(release, 2_500);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    // localStorage only exists in the browser, so the token is read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchFeed().then(
        (next) => {
          if (cancelled) return;
          setFeed((prev) => ({
            ...next,
            // The feed is cached for a few seconds; never let counts step backwards.
            totals: {
              krathong: Math.max(next.totals.krathong, prev?.totals.krathong ?? 0),
              lantern: Math.max(next.totals.lantern, prev?.totals.lantern ?? 0),
            },
          }));
          setFeedError(false);
        },
        () => !cancelled && setFeedError(true),
      );
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch("/api/floats/mine", { headers: { [OWNER_HEADER]: token } })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: MyFloat[] }) => {
        if (!cancelled) setMine((prev) => mergeMine(prev, data.items));
      })
      .catch(() => {})
      .finally(() => !cancelled && setMineLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const release = useCallback(
    async (kind: FloatKind, input: WishInput): Promise<string | null> => {
      if (!token) return "ยังโหลดไม่เสร็จ ลองอีกครั้ง";
      try {
        const res = await fetch("/api/floats", {
          method: "POST",
          headers: { "Content-Type": "application/json", [OWNER_HEADER]: token },
          body: JSON.stringify({ kind, ...input }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return data.error ?? "บันทึกไม่สำเร็จ ลองอีกครั้ง";

        const created = data as MyFloat;
        if (kind === "krathong") {
          const base = krathongPlacement(created.id);
          // Start mid-river, centred and above the buttons, so it is easy to watch.
          setOverrides((o) => ({ ...o, [created.id]: { depth: 0.42, delay: -0.54 * base.duration } }));
        } else {
          setOverrides((o) => ({ ...o, [created.id]: { delay: 0, x: 46 } }));
        }
        setLaunching((l) => ({ ...l, [created.id]: true }));
        setMine((prev) => mergeMine(prev, [created]));
        setFeed((prev) =>
          prev ? { ...prev, totals: { ...prev.totals, [kind]: prev.totals[kind] + 1 } } : prev,
        );
        setModal(null);
        setToast(
          kind === "krathong"
            ? `ลอยกระทง “${created.name}” แล้ว ขอให้สมหวังดังคำอธิษฐาน`
            : `ปล่อยโคม “${created.name}” แล้ว ขอให้สมหวังดังคำอธิษฐาน`,
        );
        return null;
      } catch {
        return "เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง";
      }
    },
    [token],
  );

  const krathongs = useMemo(() => {
    const mineIds = new Set(mine.map((m) => m.id));
    const own = mine
      .filter((m) => m.kind === "krathong")
      .slice(0, MAX_MINE_ON_SCENE)
      .map((m) => ({ id: m.id, style: m.style, label: m.name }));
    const others = (feed?.krathongs ?? [])
      .filter((f) => !mineIds.has(f.id))
      .map((f) => ({ id: f.id, style: f.style, label: undefined as string | undefined, tier: 1 }));
    const ambient = AMBIENT_KRATHONGS.slice(0, ambientCount("krathong", others.length + own.length)).map(
      (a) => ({ ...a, mine: false }),
    );
    return [
      ...ambient,
      ...others.map((k) => ({ ...k, mine: false })),
      ...own.map((k) => ({ ...k, tier: 1, mine: true })),
    ].map((k) => ({
      ...k,
      placement: { ...krathongPlacement(k.id), ...overrides[k.id] } as KrathongPlacement,
    }));
  }, [feed, mine, overrides]);

  const lanterns = useMemo(() => {
    const mineIds = new Set(mine.map((m) => m.id));
    const real = (feed?.lanterns ?? [])
      .filter((f) => !mineIds.has(f.id))
      .map((f) => ({ id: f.id, style: f.style, tier: 1 }));
    const ambient = AMBIENT_LANTERNS.slice(0, ambientCount("lantern", real.length));
    return [...ambient, ...real].map((l) => ({ ...l, placement: lanternPlacement(l.id, false) }));
  }, [feed, mine]);

  const myLanterns = useMemo(
    () =>
      mine
        .filter((m) => m.kind === "lantern")
        .slice(0, MAX_MINE_ON_SCENE)
        .map((m) => ({
          id: m.id,
          style: m.style,
          label: m.name,
          placement: { ...lanternPlacement(m.id, true), ...overrides[m.id] } as LanternPlacement,
        })),
    [mine, overrides],
  );

  const totals = feed?.totals;
  const status =
    !totals && feedError
      ? "โหลดแม่น้ำไม่สำเร็จ ลองรีเฟรชอีกครั้ง"
      : totals && totals.krathong + totals.lantern >= SHOW_TOTALS_FROM
        ? `ลอยกระทงแล้ว ${totals.krathong.toLocaleString("th-TH")} ใบ ปล่อยโคมแล้ว ${totals.lantern.toLocaleString("th-TH")} ดวง`
        : "คืนนี้สายน้ำเต็มไปด้วยแสงเทียน ร่วมลอยกระทงของคุณได้เลย";

  return (
    <main className="stage">
      <SvgDefs />
      <Sky />

      <div className="lantern-sky" aria-hidden="true">
        {lanterns.map((l) => (
          <Lantern key={l.id} style={l.style} placement={l.placement} tier={l.tier} />
        ))}
      </div>

      <div className="skyline-wrap" aria-hidden="true">
        <Skyline />
      </div>

      <div className="river" aria-hidden="true">
        <div className="river-glow" />
        <div className="moon-path">
          {MOON_STREAKS.map((s, i) => (
            <span
              key={i}
              style={{ width: `${s.w}%`, marginLeft: `${s.x}%`, opacity: s.o, animationDelay: `${s.d}s` }}
            />
          ))}
        </div>
        <svg className="waves" viewBox="0 0 1200 300" preserveAspectRatio="none">
          {[40, 95, 150, 205, 260].map((y, i) => (
            <path
              key={y}
              className={`wave wave--${i % 3}`}
              d={`M-200 ${y} q50 -6 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0`}
            />
          ))}
        </svg>
        {krathongs.map((k) => (
          <Krathong
            key={k.id}
            style={k.style}
            placement={k.placement}
            label={k.label}
            tagTone={k.mine ? "mine" : "other"}
            tier={k.tier}
            fresh={Boolean(launching[k.id])}
            onLaunched={() =>
              setLaunching((l) => {
                const next = { ...l };
                delete next[k.id];
                return next;
              })
            }
          />
        ))}
      </div>

      <div className="lantern-front" aria-hidden="true">
        {live.map((l) => (
          <Lantern key={l.id} style={l.style} placement={l.placement} label={l.label} tagTone="other" fresh />
        ))}
        {myLanterns.map((l) => (
          <Lantern key={l.id} style={l.style} placement={l.placement} label={l.label} fresh={Boolean(launching[l.id])} />
        ))}
      </div>

      <header className="masthead">
        <h1 className="title">ลอยกระทง</h1>
        <p className="subtitle">คืนวันเพ็ญเดือนสิบสอง ฝากคำอธิษฐานไว้กับสายน้ำและแสงโคม</p>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </header>

      <button type="button" className="mine-button" onClick={() => setDrawer(true)}>
        คำอธิษฐานของฉัน
        {mine.length > 0 && <span className="mine-count">{mine.length.toLocaleString("th-TH")}</span>}
      </button>

      <nav className="pier" aria-label="ลอยกระทงหรือปล่อยโคม">
        <button type="button" className="pier-button" onClick={() => setModal("krathong")}>
          <KrathongArt style={0} className="pier-art" />
          <span>ลอยกระทง</span>
        </button>
        <button type="button" className="pier-button" onClick={() => setModal("lantern")}>
          <LanternArt style={0} className="pier-art pier-art--lantern" />
          <span>ปล่อยโคมลอย</span>
        </button>
      </nav>

      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}

      {modal && (
        <WishModal
          key={modal}
          kind={modal}
          onClose={() => setModal(null)}
          onSubmit={(input) => release(modal, input)}
        />
      )}

      {drawer && (
        <MineDrawer
          items={mine}
          loading={mineLoading}
          onClose={() => setDrawer(false)}
          onStart={() => {
            setDrawer(false);
            setModal("krathong");
          }}
        />
      )}
    </main>
  );
}

function mergeMine(prev: MyFloat[], incoming: MyFloat[]): MyFloat[] {
  const byId = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
