export type FloatKind = "krathong" | "lantern";

/** What every visitor can see: no name, no wish. */
export type PublicFloat = {
  id: string;
  kind: FloatKind;
  style: number;
  createdAt: string;
};

/** What the owner sees for their own krathongs and lanterns. */
export type MyFloat = PublicFloat & {
  name: string;
  wish: string;
};

export type PublicFeed = {
  krathongs: PublicFloat[];
  lanterns: PublicFloat[];
  totals: Record<FloatKind, number>;
};

export const LIMITS = { name: 40, wish: 500 } as const;
export const STYLE_COUNT = 3;
export const OWNER_HEADER = "x-owner-token";
