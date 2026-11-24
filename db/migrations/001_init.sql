-- Krathongs and lanterns released by visitors.
-- name and wish are private: only the owner (by owner_hash) can read them back.
create table if not exists floats (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('krathong', 'lantern')),
  style       smallint not null default 0 check (style between 0 and 2),
  name        text not null check (char_length(name) between 1 and 40),
  wish        text not null check (char_length(wish) between 1 and 500),
  owner_hash  text not null,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index if not exists floats_kind_created_idx on floats (kind, created_at desc);
create index if not exists floats_owner_created_idx on floats (owner_hash, created_at desc);
create index if not exists floats_ip_created_idx on floats (ip_hash, created_at desc);
