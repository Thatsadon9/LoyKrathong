import "server-only";
import { createHash } from "node:crypto";
import { getPool } from "./db";
import {
  LIMITS,
  OWNER_HEADER,
  STYLE_COUNT,
  type FloatKind,
  type MyFloat,
  type PublicFeed,
  type PublicFloat,
} from "./types";

const FEED_KRATHONGS = 60;
const FEED_LANTERNS = 40;
const MINE_LIMIT = 100;
const RATE_PER_MINUTE = 6;

type Row = {
  id: string;
  kind: FloatKind;
  style: number;
  name?: string;
  wish?: string;
  created_at: Date;
};

export class RateLimitError extends Error {}

function hash(value: string): string {
  return createHash("sha256").update(`loykrathong:${value}`).digest("hex");
}

/** Owner tokens are random UUIDs kept in the visitor's browser. */
export function readOwnerHash(request: Request): string | null {
  const token = request.headers.get(OWNER_HEADER)?.trim();
  if (!token || !/^[A-Za-z0-9_-]{16,128}$/.test(token)) return null;
  return hash(token);
}

export function readIpHash(request: Request): string | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();
  return ip ? hash(`ip:${ip}`) : null;
}

function toPublic(row: Row): PublicFloat {
  return {
    id: row.id,
    kind: row.kind,
    style: row.style,
    createdAt: row.created_at.toISOString(),
  };
}

function toMine(row: Row): MyFloat {
  return { ...toPublic(row), name: row.name ?? "", wish: row.wish ?? "" };
}

export async function listPublicFeed(): Promise<PublicFeed> {
  const pool = getPool();
  const [feed, totals] = await Promise.all([
    pool.query<Row>(
      `(select id, kind, style, created_at from floats
          where kind = 'krathong' order by created_at desc limit $1)
       union all
       (select id, kind, style, created_at from floats
          where kind = 'lantern' order by created_at desc limit $2)`,
      [FEED_KRATHONGS, FEED_LANTERNS],
    ),
    pool.query<{ kind: FloatKind; n: number }>(
      `select kind, count(*)::int as n from floats group by kind`,
    ),
  ]);

  const result: PublicFeed = { krathongs: [], lanterns: [], totals: { krathong: 0, lantern: 0 } };
  for (const row of feed.rows) {
    (row.kind === "krathong" ? result.krathongs : result.lanterns).push(toPublic(row));
  }
  for (const { kind, n } of totals.rows) result.totals[kind] = n;
  return result;
}

export async function listMine(ownerHash: string): Promise<MyFloat[]> {
  const { rows } = await getPool().query<Row>(
    `select id, kind, style, name, wish, created_at from floats
      where owner_hash = $1 order by created_at desc limit $2`,
    [ownerHash, MINE_LIMIT],
  );
  return rows.map(toMine);
}

export type NewFloat = { kind: FloatKind; style: number; name: string; wish: string };

/** Returns the parsed input, or a Thai error message for the visitor. */
export function parseNewFloat(body: unknown): NewFloat | string {
  if (!body || typeof body !== "object") return "ข้อมูลไม่ถูกต้อง";
  const b = body as Record<string, unknown>;

  const kind = b.kind;
  if (kind !== "krathong" && kind !== "lantern") return "ไม่รู้จักประเภทนี้";

  const style = Number(b.style ?? 0);
  if (!Number.isInteger(style) || style < 0 || style >= STYLE_COUNT) return "ไม่รู้จักแบบนี้";

  const name = typeof b.name === "string" ? b.name.trim().replace(/\s+/g, " ") : "";
  if (!name) return "ตั้งชื่อก่อนนะ";
  if ([...name].length > LIMITS.name) return `ชื่อยาวได้ไม่เกิน ${LIMITS.name} ตัวอักษร`;

  const wish = typeof b.wish === "string" ? b.wish.trim() : "";
  if (!wish) return "เขียนคำอธิษฐานก่อนนะ";
  if ([...wish].length > LIMITS.wish) return `คำอธิษฐานยาวได้ไม่เกิน ${LIMITS.wish} ตัวอักษร`;

  return { kind, style, name, wish };
}

export async function createFloat(
  input: NewFloat,
  ownerHash: string,
  ipHash: string | null,
): Promise<MyFloat> {
  const pool = getPool();
  const recent = await pool.query<{ n: number }>(
    `select count(*)::int as n from floats
      where created_at > now() - interval '1 minute'
        and (owner_hash = $1 or ip_hash = $2)`,
    [ownerHash, ipHash],
  );
  if ((recent.rows[0]?.n ?? 0) >= RATE_PER_MINUTE) throw new RateLimitError();

  const { rows } = await pool.query<Row>(
    `insert into floats (kind, style, name, wish, owner_hash, ip_hash)
     values ($1, $2, $3, $4, $5, $6)
     returning id, kind, style, name, wish, created_at`,
    [input.kind, input.style, input.name, input.wish, ownerHash, ipHash],
  );
  return toMine(rows[0]);
}

// ---------- Admin only: full records, including names and wishes ----------

export type AdminFloat = MyFloat & { device: string };

export type AdminFilter = { kind?: FloatKind; q?: string; page: number; pageSize: number };

export type AdminStats = {
  krathong: number;
  lantern: number;
  devices: number;
  today: number;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function listForAdmin(
  filter: AdminFilter,
): Promise<{ items: AdminFloat[]; total: number }> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.kind) {
    params.push(filter.kind);
    where.push(`kind = $${params.length}`);
  }
  if (filter.q) {
    params.push(`%${escapeLike(filter.q)}%`);
    where.push(`(name ilike $${params.length} or wish ilike $${params.length})`);
  }
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";

  const pool = getPool();
  const [rows, count] = await Promise.all([
    pool.query<Row & { owner_hash: string }>(
      `select id, kind, style, name, wish, owner_hash, created_at from floats
        ${whereSql}
        order by created_at desc
        limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, filter.pageSize, (filter.page - 1) * filter.pageSize],
    ),
    pool.query<{ n: number }>(`select count(*)::int as n from floats ${whereSql}`, params),
  ]);

  return {
    items: rows.rows.map((row) => ({ ...toMine(row), device: row.owner_hash.slice(0, 8) })),
    total: count.rows[0]?.n ?? 0,
  };
}

export async function adminStats(): Promise<AdminStats> {
  const { rows } = await getPool().query<AdminStats>(
    `select
       count(*) filter (where kind = 'krathong')::int as krathong,
       count(*) filter (where kind = 'lantern')::int as lantern,
       count(distinct owner_hash)::int as devices,
       count(*) filter (
         where created_at >= (date_trunc('day', now() at time zone 'Asia/Bangkok') at time zone 'Asia/Bangkok')
       )::int as today
     from floats`,
  );
  return rows[0];
}
