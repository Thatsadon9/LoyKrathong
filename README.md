# ลอยกระทงออนไลน์

เว็บลอยกระทงและปล่อยโคมลอยออนไลน์ ฉากเป็นคืนวันเพ็ญเดือนสิบสอง มีแม่น้ำ วัด และเมืองริมน้ำ
ทุกคนเห็นกระทงและโคมของผู้ใช้คนอื่นลอยอยู่ แต่ผู้ใช้คนอื่นไม่เห็นชื่อและคำอธิษฐาน
ทุกรายการบันทึกลงตาราง `floats` และผู้ดูแลอ่านได้ทั้งหมดที่หน้า `/admin`

- Next.js 16 (App Router) + React 19
- Lakebase Postgres บน Neon ต่อผ่าน `pg` (node-postgres) และ `attachDatabasePool` ของ Vercel Fluid compute
- พร้อม deploy บน Vercel (`vercel.json` ตั้ง region `cle1` ให้อยู่ใกล้ฐานข้อมูลที่ `aws-us-east-2`)

## ความเป็นส่วนตัวทำงานอย่างไร

- เบราว์เซอร์สุ่ม token (UUID) เก็บใน `localStorage` แล้วส่งมาใน header `x-owner-token`
- ฐานข้อมูลเก็บเฉพาะ SHA-256 ของ token (`owner_hash`) ไม่เก็บ token จริง
- `GET /api/floats` (สาธารณะ) ส่งเฉพาะ `id`, `kind`, `style`, `createdAt` ไม่มีชื่อหรือคำอธิษฐาน
- `GET /api/floats/mine` ส่งชื่อและคำอธิษฐานเฉพาะรายการที่ `owner_hash` ตรงกับ token
- ถ้าผู้ใช้ล้างข้อมูลเบราว์เซอร์ จะดูคำอธิษฐานเดิมไม่ได้อีก (ข้อมูลยังอยู่ในฐานข้อมูล)
- จำกัด 6 รายการต่อนาที ต่อ token หรือต่อ IP (เก็บ IP แบบ hash)

## หน้าผู้ดูแล `/admin`

- อ่านกระทง โคม ชื่อ และคำอธิษฐานทั้งหมด กรองตามประเภทและค้นหาข้อความได้ แบ่งหน้าละ 40 รายการ
- ป้องกันด้วยรหัสผ่านใน env `ADMIN_PASSWORD` (ต้องยาวอย่างน้อย 12 ตัวอักษร ถ้าไม่ตั้ง หน้านี้จะ login ไม่ได้)
- Login แล้วได้ cookie `lk_admin` แบบ HttpOnly, SameSite=Strict, Path=/admin, Secure บน HTTPS อายุ 12 ชั่วโมง
  cookie ลงลายเซ็น HMAC ด้วย key ที่สร้างจากรหัสผ่าน ถ้าเปลี่ยนรหัสผ่าน ทุก session จะหลุดทันที
- ใส่รหัสผิดจะหน่วง 0.8 วินาที และหน้านี้ตั้ง `noindex` ไว้
- ไม่ต้อง migrate เพิ่ม ใช้ตาราง `floats` เดิม

## รันบนเครื่อง

```bash
npm install
neon env pull          # เขียน DATABASE_URL และ DATABASE_URL_UNPOOLED ลง .env.local
npm run db:migrate     # สร้างตาราง (ใช้ DATABASE_URL_UNPOOLED)
npm run dev
```

เปิด http://localhost:3000

## Deploy บน Vercel

ฐานข้อมูลบน branch `production` ของ Neon migrate แล้ว ต้องตั้งค่าบน Vercel 2 ตัว คือ `DATABASE_URL` และ `ADMIN_PASSWORD`

### ทางเลือก A: Vercel CLI

```bash
vercel login
vercel link
vercel env add DATABASE_URL production     # วางค่า DATABASE_URL (pooled) จาก .env.local
vercel env add ADMIN_PASSWORD production   # ตั้งรหัสใหม่ อย่าใช้ตัวเดียวกับใน .env.local
vercel deploy --prod
```

ถ้าต้องการ preview deployment ให้เพิ่มค่าเดียวกันใน environment `preview` ด้วย
หรือใช้ทางเลือก B เพื่อให้แต่ละ preview ได้ branch ฐานข้อมูลแยกกัน

### ทางเลือก B: Git + Neon integration

1. push โปรเจกต์ขึ้น GitHub แล้ว import ใน Vercel
2. ติดตั้ง Neon integration จาก Vercel Marketplace แล้วเลือก project `LoyKrathong`
   Neon จะใส่ `DATABASE_URL` ให้เอง
3. ทุกครั้งที่เพิ่มไฟล์ใน `db/migrations/` ให้รัน `npm run db:migrate` กับ branch นั้นก่อน deploy

## โครงสร้าง

```
db/migrations/        SQL migration (รันตามลำดับ ครั้งเดียวต่อไฟล์)
scripts/migrate.mjs   ตัวรัน migration
neon.ts               การตั้งค่า Neon (neon deploy)
src/app/api/floats/   API สาธารณะ + API ของเจ้าของ
src/app/admin/        หน้าผู้ดูแล + route login/logout
src/lib/admin.ts      ตรวจรหัสผ่านและ session ของผู้ดูแล
src/lib/              การเชื่อมฐานข้อมูล, query, validation
src/components/       ฉาก (ท้องฟ้า, เมือง, แม่น้ำ), กระทง, โคม, popup
```
