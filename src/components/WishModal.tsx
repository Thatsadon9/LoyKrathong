"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { LIMITS, type FloatKind } from "@/lib/types";
import { KRATHONG_STYLES, KrathongArt } from "./Krathong";
import { LANTERN_STYLES, LanternArt } from "./Lantern";
import { KanokCorners, LockIcon } from "./Ornament";

export type WishInput = { style: number; name: string; wish: string };

const COPY = {
  krathong: {
    title: "ลอยกระทง",
    lede: "เลือกกระทง ตั้งชื่อ แล้วฝากคำอธิษฐานไว้กับสายน้ำ",
    nameLabel: "ชื่อกระทง",
    wishPlaceholder: "ขอให้ครอบครัวแข็งแรง มีความสุขตลอดปี…",
    thing: "กระทง",
    submit: "ลอยกระทง",
    busy: "กำลังลอยกระทง…",
  },
  lantern: {
    title: "ปล่อยโคมลอย",
    lede: "เลือกโคม ตั้งชื่อ แล้วฝากคำอธิษฐานขึ้นไปกับแสงไฟ",
    nameLabel: "ชื่อโคม",
    wishPlaceholder: "ขอให้ปีหน้าได้ทำสิ่งที่รัก…",
    thing: "โคม",
    submit: "ปล่อยโคม",
    busy: "กำลังปล่อยโคม…",
  },
} as const;

export default function WishModal({
  kind,
  onClose,
  onSubmit,
}: {
  kind: FloatKind;
  onClose: () => void;
  onSubmit: (input: WishInput) => Promise<string | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [style, setStyle] = useState(0);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[kind];
  const styles = kind === "krathong" ? KRATHONG_STYLES : LANTERN_STYLES;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    // showModal() focuses the first control (a hidden radio); start on the name instead.
    nameRef.current?.focus();
    return () => dialog?.close();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(`ตั้งชื่อ${copy.thing}ก่อนนะ`);
    if (!wish.trim()) return setError("เขียนคำอธิษฐานก่อนนะ");
    setBusy(true);
    setError(null);
    const failure = await onSubmit({ style, name: name.trim(), wish: wish.trim() });
    setBusy(false);
    if (failure) setError(failure);
  }

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={`${id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onClose();
      }}
    >
      <form className="panel" onSubmit={handleSubmit} noValidate>
        <KanokCorners />
        <h2 id={`${id}-title`} className="panel-title">
          {copy.title}
        </h2>
        <p className="panel-lede">{copy.lede}</p>

        <fieldset className="style-picker">
          <legend>เลือกแบบ{copy.thing}</legend>
          <div className="style-options">
            {styles.map((s, i) => (
              <label key={s.label} className="style-option" title={s.hint}>
                <input
                  type="radio"
                  name="style"
                  value={i}
                  checked={style === i}
                  onChange={() => setStyle(i)}
                />
                <span className="style-art">
                  {kind === "krathong" ? <KrathongArt style={i} /> : <LanternArt style={i} />}
                </span>
                <span className="style-label">{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <div className="field-head">
            <label htmlFor={`${id}-name`}>{copy.nameLabel}</label>
            <span className="field-count">
              {name.length}/{LIMITS.name}
            </span>
          </div>
          <input
            ref={nameRef}
            id={`${id}-name`}
            autoComplete="off"
            maxLength={LIMITS.name}
            placeholder="เช่น กระทงของบ้านเรา"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <div className="field-head">
            <label htmlFor={`${id}-wish`}>คำอธิษฐาน</label>
            <span className="field-count">
              {wish.length}/{LIMITS.wish}
            </span>
          </div>
          <textarea
            id={`${id}-wish`}
            rows={4}
            maxLength={LIMITS.wish}
            placeholder={copy.wishPlaceholder}
            value={wish}
            onChange={(e) => setWish(e.target.value)}
          />
        </div>

        <p className="privacy">
          <LockIcon />
          <span>
            <strong>เป็นความลับ</strong> ชื่อและคำอธิษฐานนี้เห็นได้เฉพาะคุณบนอุปกรณ์นี้
            ผู้ใช้คนอื่นจะเห็นแค่{copy.thing}ที่{kind === "krathong" ? "ลอยอยู่บนแม่น้ำ" : "ลอยอยู่บนฟ้า"}{" "}
            โดยไม่เห็นชื่อหรือข้อความใด ๆ
          </span>
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="panel-actions">
          <button type="button" className="btn btn--quiet" onClick={onClose} disabled={busy}>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn--gold" disabled={busy}>
            {busy ? copy.busy : copy.submit}
          </button>
        </div>
      </form>
    </dialog>
  );
}
