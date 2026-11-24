import { connection } from "next/server";
import { listMine, readOwnerHash } from "@/lib/floats";

/** The visitor's own krathongs and lanterns, with names and wishes. */
export async function GET(request: Request) {
  await connection();
  const ownerHash = readOwnerHash(request);
  if (!ownerHash) {
    return Response.json({ error: "ไม่พบรหัสอุปกรณ์" }, { status: 400 });
  }
  try {
    const items = await listMine(ownerHash);
    return Response.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("GET /api/floats/mine failed", err);
    return Response.json({ error: "โหลดคำอธิษฐานไม่สำเร็จ" }, { status: 500 });
  }
}
