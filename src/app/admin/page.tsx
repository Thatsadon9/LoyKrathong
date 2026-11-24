import type { Metadata } from "next";
import { Suspense } from "react";
import SvgDefs from "@/components/SvgDefs";
import AdminView from "./AdminView";

export const metadata: Metadata = {
  title: "สมุดคำอธิษฐาน (ผู้ดูแล)",
  robots: { index: false, follow: false },
};

export default function AdminPage(props: PageProps<"/admin">) {
  return (
    <main className="admin">
      <SvgDefs />
      <Suspense fallback={<p className="admin-loading">กำลังเปิดสมุด…</p>}>
        <AdminView searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
