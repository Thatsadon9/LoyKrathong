/** Gold flame-curl (kanok) corners for the lacquer panels. */
export function KanokCorners() {
  const path =
    "M3 37 C3 21 11 9 30 3 C22 9 19.5 15 21.5 21 C15.5 18.5 10.5 23 11.5 30 C8.5 28.5 5.5 31.5 6.5 37 Z";
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <svg key={c} className={`kanok kanok--${c}`} viewBox="0 0 40 40" aria-hidden="true">
          <path d={path} fill="currentColor" />
          <path d="M14 34 C14 26 18 22 24 21" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
        </svg>
      ))}
    </>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <rect x="4" y="9" width="12" height="9" rx="2" fill="currentColor" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  );
}
