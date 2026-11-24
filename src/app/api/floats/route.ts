import { connection } from "next/server";
import {
  RateLimitError,
  createFloat,
  listPublicFeed,
  parseNewFloat,
  readIpHash,
  readOwnerHash,
} from "@/lib/floats";

/** Public river: krathongs and lanterns only, never names or wishes. */
export async function GET() {
  await connection();
  try {
    const feed = await listPublicFeed();
    return Response.json(feed, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("GET /api/floats failed", err);
    return Response.json({ error: "โหลดแม่น้ำไม่สำเร็จ ลองรีเฟรชอีกครั้ง" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ownerHash = readOwnerHash(request);
  if (!ownerHash) {
    return Response.json({ error: "ไม่พบรหัสอุปกรณ์ ลองรีเฟรชหน้าเว็บ" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const input = parseNewFloat(body);
  if (typeof input === "string") {
    return Response.json({ error: input }, { status: 400 });
  }

  try {
    const created = await createFloat(input, ownerHash, readIpHash(request));
    return Response.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return Response.json(
        { error: "ลอยถี่เกินไป พักสักครู่แล้วค่อยลองใหม่" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    console.error("POST /api/floats failed", err);
    return Response.json({ error: "บันทึกไม่สำเร็จ ลองอีกครั้ง" }, { status: 500 });
  }
}
