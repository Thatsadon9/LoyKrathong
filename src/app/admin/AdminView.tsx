import Link from "next/link";
import { KRATHONG_STYLES, KrathongArt } from "@/components/Krathong";
import { LANTERN_STYLES, LanternArt } from "@/components/Lantern";
import { KanokCorners, LockIcon } from "@/components/Ornament";
import { adminConfigured, isAdmin } from "@/lib/admin";
import { adminStats, listForAdmin, type AdminFloat } from "@/lib/floats";
import type { FloatKind } from "@/lib/types";

const PAGE_SIZE = 40;

const when = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});

type Query = { kind?: FloatKind; q?: string; page?: number };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function href({ kind, q, page }: Query): string {
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  const s = params.toString();
  return s ? `/admin?${s}` : "/admin";
}

export default async function AdminView({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const sp = await searchParams;

  if (!(await isAdmin())) {
    return <LoginPanel error={first(sp.error)} configured={adminConfigured()} />;
  }

  const kindParam = first(sp.kind);
  const kind: FloatKind | undefined =
    kindParam === "krathong" || kindParam === "lantern" ? kindParam : undefined;
  const q = (first(sp.q) ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(first(sp.page) ?? "1", 10) || 1);

  let data: Awaited<ReturnType<typeof listForAdmin>>;
  let stats: Awaited<ReturnType<typeof adminStats>>;
  try {
    [data, stats] = await Promise.all([
      listForAdmin({ kind, q: q || undefined, page, pageSize: PAGE_SIZE }),
      adminStats(),
    ]);
  } catch (err) {
    console.error("admin page failed", err);
    return (
      <div className="admin-inner">
        <p className="form-error" role="alert">
          โหลดข้อมูลจากฐานข้อมูลไม่สำเร็จ ลองรีเฟรชอีกครั้ง
        </p>
      </div>
    );
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const tabs: { label: string; value?: FloatKind }[] = [
    { label: "ทั้งหมด" },
    { label: "กระทง", value: "krathong" },
    { label: "โคมลอย", value: "lantern" },
  ];

  return (
    <div className="admin-inner">
      <header className="admin-head">
        <div>
          <h1 className="admin-title">สมุดคำอธิษฐาน</h1>
          <p className="admin-sub">
            <LockIcon /> หน้านี้เปิดได้เฉพาะผู้ดูแลที่มีรหัสผ่าน
          </p>
        </div>
        <form method="post" action="/admin/logout">
          <button type="submit" className="btn btn--quiet">
            ออกจากระบบ
          </button>
        </form>
      </header>

      <dl className="admin-stats">
        <div>
          <dt>กระทง</dt>
          <dd>{stats.krathong.toLocaleString("th-TH")} ใบ</dd>
        </div>
        <div>
          <dt>โคมลอย</dt>
          <dd>{stats.lantern.toLocaleString("th-TH")} ดวง</dd>
        </div>
        <div>
          <dt>อุปกรณ์ที่ร่วมลอย</dt>
          <dd>{stats.devices.toLocaleString("th-TH")} เครื่อง</dd>
        </div>
        <div>
          <dt>วันนี้</dt>
          <dd>{stats.today.toLocaleString("th-TH")} รายการ</dd>
        </div>
      </dl>

      <div className="admin-tools">
        <nav className="admin-tabs" aria-label="กรองตามประเภท">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={href({ kind: t.value, q })}
              prefetch={false}
              aria-current={kind === t.value ? "page" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="admin-search" method="get" action="/admin" role="search">
          {kind && <input type="hidden" name="kind" value={kind} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="ค้นชื่อหรือคำอธิษฐาน"
            aria-label="ค้นชื่อหรือคำอธิษฐาน"
          />
          <button type="submit" className="btn btn--gold">
            ค้นหา
          </button>
        </form>
      </div>

      <p className="admin-count">
        {q ? `พบ ${data.total.toLocaleString("th-TH")} รายการที่ตรงกับ “${q}”` : `ทั้งหมด ${data.total.toLocaleString("th-TH")} รายการ`}
      </p>

      {data.items.length === 0 ? (
        <p className="admin-empty">
          {q || kind ? "ไม่พบรายการ ลองเปลี่ยนคำค้นหรือดูทั้งหมด" : "ยังไม่มีใครลอยกระทงหรือปล่อยโคม"}
        </p>
      ) : (
        <ol className="ledger">
          {data.items.map((item) => (
            <Entry key={item.id} item={item} />
          ))}
        </ol>
      )}

      {pages > 1 && (
        <nav className="admin-pages" aria-label="เปลี่ยนหน้า">
          {page > 1 ? (
            <Link href={href({ kind, q, page: page - 1 })} prefetch={false}>
              หน้าก่อน
            </Link>
          ) : (
            <span />
          )}
          <span>
            หน้า {page} จาก {pages}
          </span>
          {page < pages ? (
            <Link href={href({ kind, q, page: page + 1 })} prefetch={false}>
              หน้าถัดไป
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

function Entry({ item }: { item: AdminFloat }) {
  const krathong = item.kind === "krathong";
  const style = (krathong ? KRATHONG_STYLES : LANTERN_STYLES)[item.style]?.label ?? "";
  return (
    <li className="ledger-entry">
      <span className="ledger-art">
        {krathong ? <KrathongArt style={item.style} /> : <LanternArt style={item.style} />}
      </span>
      <div className="ledger-body">
        <p className="ledger-name">{item.name}</p>
        <p className="ledger-wish">{item.wish}</p>
        <p className="ledger-meta">
          <span>{krathong ? `กระทง${style}` : `โคม${style}`}</span>
          <time dateTime={item.createdAt}>{when.format(new Date(item.createdAt))}</time>
          <span title="รหัสอุปกรณ์แบบย่อ ใช้ดูว่ารายการไหนมาจากเครื่องเดียวกัน">อุปกรณ์ {item.device}</span>
        </p>
      </div>
    </li>
  );
}

function LoginPanel({ error, configured }: { error?: string; configured: boolean }) {
  return (
    <div className="admin-login">
      <form className="panel" method="post" action="/admin/login">
        <KanokCorners />
        <h1 className="panel-title">ผู้ดูแล</h1>
        <p className="panel-lede">ใส่รหัสผ่านผู้ดูแลเพื่อเปิดสมุดคำอธิษฐาน</p>
        {!configured ? (
          <p className="form-error" role="alert">
            ยังไม่ได้ตั้งค่า ADMIN_PASSWORD บนเซิร์ฟเวอร์ (ต้องยาวอย่างน้อย 12 ตัวอักษร)
          </p>
        ) : (
          error === "password" && (
            <p className="form-error" role="alert">
              รหัสผ่านไม่ถูกต้อง
            </p>
          )
        )}
        <div className="field">
          <div className="field-head">
            <label htmlFor="admin-password">รหัสผ่าน</label>
          </div>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div className="panel-actions">
          <button type="submit" className="btn btn--gold" disabled={!configured}>
            เข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
}
