-- ウメパウ 初期スキーマ: 口コミとユーザー投稿スポット
create table public.user_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  category text not null check (char_length(category) between 1 and 30),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null check (char_length(spot_id) between 1 and 50),
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 200),
  author text not null default '匿名' check (char_length(author) between 1 and 30),
  created_at timestamptz not null default now()
);

-- 認証なしの公開アプリのため、匿名ロールに読み取りと投稿のみ許可（更新・削除は不可）
alter table public.user_spots enable row level security;
alter table public.reviews enable row level security;

create policy "public read user_spots" on public.user_spots for select using (true);
create policy "public insert user_spots" on public.user_spots for insert with check (true);
create policy "public read reviews" on public.reviews for select using (true);
create policy "public insert reviews" on public.reviews for insert with check (true);
