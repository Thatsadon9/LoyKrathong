"use client";

import { useEffect, useRef } from "react";
import type { MyFloat } from "@/lib/types";
import { KrathongArt } from "./Krathong";
import { LanternArt } from "./Lantern";
import { KanokCorners, LockIcon } from "./Ornament";

const when = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" });

export default function MineDrawer({
  items,
  loading,
  onClose,
  onStart,
}: {
  items: MyFloat[];
  loading: boolean;
  onClose: () => void;
  onStart: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="sheet sheet--side"
      aria-labelledby="mine-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="panel panel--side">
        <KanokCorners />
        <div className="drawer-head">
          <h2 id="mine-title" className="panel-title">
            คำอธิษฐานของฉัน
          </h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="ปิด">
            ×
          </button>
        </div>
        <p className="privacy privacy--compact">
          <LockIcon />
          <span>เห็นได้เฉพาะคุณบนอุปกรณ์นี้ ถ้าล้างข้อมูลเบราว์เซอร์ รายการนี้จะหายไปจากหน้านี้</span>
        </p>

        {loading && items.length === 0 ? (
          <p className="drawer-empty">กำลังโหลด…</p>
        ) : items.length === 0 ? (
          <div className="drawer-empty">
            <p>ยังไม่มีคำอธิษฐาน ลอยกระทงใบแรกของคุณได้เลย</p>
            <button type="button" className="btn btn--gold" onClick={onStart}>
              ลอยกระทง
            </button>
          </div>
        ) : (
          <ul className="wish-list">
            {items.map((item) => (
              <li key={item.id} className="wish">
                <span className="wish-art">
                  {item.kind === "krathong" ? <KrathongArt style={item.style} /> : <LanternArt style={item.style} />}
                </span>
                <div className="wish-body">
                  <p className="wish-name">{item.name}</p>
                  <p className="wish-text">{item.wish}</p>
                  <p className="wish-meta">
                    {item.kind === "krathong" ? "ลอยกระทง" : "ปล่อยโคม"} เมื่อ {when.format(new Date(item.createdAt))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
