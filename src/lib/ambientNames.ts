import { hashString, seeded } from "./random";

/*
 * Display names for the decorative (ambient) krathongs and lanterns.
 * Invented nicknames and handles in the style Thai teenagers use: nicknames,
 * couples, class groups, and Latin handles. None refer to a real person.
 */
export const AMBIENT_NAMES = [
  // Nicknames
  "มายด์ 🌙",
  "ใบเตย",
  "ต้นกล้า",
  "น้ำหวาน ✨",
  "ปลายฟ้า",
  "ข้าวฟ่าง",
  "พลอยใส",
  "เฟิร์น 🌿",
  "มุกมุก",
  "ปั้นปั้น",
  "ส้มโอ 🍊",
  "ชมพู่",
  "ใบบัว",
  "เพลง 🎧",
  "จูนจูน",
  "แก้มใส",
  "มิ้นท์ๆ",
  "ข้าวหอม",
  "ฟ้าใส ☁️",
  "เอิร์ธ",
  "ภูมิ",
  "ไอซ์",
  "โอห์มมี่",
  "นนท์",
  "กัปตัน",
  "ปิ่นปิ่น",
  "ขนมจีน",
  "หมูกรอบ",
  "น้องหมีขี้เซา",
  "ครีมชีส",
  // Couples and friends
  "ต้น ❤ แพรว",
  "บีม & มายด์",
  "ภูมิ + ใบเตย",
  "เรา 2 คน 💕",
  "ไอซ์กับจูน",
  "แก๊ง ม.5/3",
  "ห้อง 6/2 ✌️",
  "ชมรมดนตรี 🎸",
  "แก๊งหอใน",
  "เด็กวิศวะปี 1",
  "สายรหัส 23",
  "บ้านเรา 🏠",
  // Handles
  "mild.ppw",
  "beam_tnk",
  "fahsai.c",
  "kaownah__",
  "ninnin.x",
  "bewbew_",
  "tonkla.s",
  "mook.mmk",
  "earth_ntp",
  "pangpond",
  "cream.chz",
  "minmin.27",
  "punpun._",
  "film.ptw",
  "namtan.t",
  "icezaa",
  "nutty.nn",
  "fernnie",
  "jeans.jss",
  "pimmy.p",
  "baitoey_",
  "nong.mint",
  "ohmmy_",
  "praew.pw",
  "khim.k",
  "aomsin__",
  "tarn.tt",
  "pookpik.",
  "yiwaa",
  "gift.gft",
  "sky.skw",
] as const;

// Fixed shuffle, so names don't repeat side by side and stay the same between visits.
const SHUFFLED: string[] = (() => {
  const list: string[] = [...AMBIENT_NAMES];
  const rand = seeded(hashString("ambient-names"));
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
})();

/** The n-th ambient name; unique until the list wraps around. */
export function ambientNameAt(n: number): string {
  return SHUFFLED[n % SHUFFLED.length];
}

/** Picks a fresh name for each live lantern. */
export function randomAmbientName(): string {
  return AMBIENT_NAMES[Math.floor(Math.random() * AMBIENT_NAMES.length)];
}
