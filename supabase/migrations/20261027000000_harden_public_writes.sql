-- 匿名書き込みの防御強化: 値域の厳格化・権限の明示的剥奪・投稿レート制限
-- 既存データが新制約に違反する場合は適用が失敗するため、適用前に検証すること

-- 1) 匿名ロールから更新・削除系の権限を明示的に剥奪（RLSに加えた多層防御）
revoke update, delete, truncate, references, trigger on public.user_spots from anon, authenticated;
revoke update, delete, truncate, references, trigger on public.reviews from anon, authenticated;

-- 2) 値域の厳格化: 空白のみの投稿・制御文字・想定外カテゴリ・梅田圏外の座標を拒否
alter table public.user_spots
  add constraint user_spots_name_not_blank check (btrim(name) <> '' and name !~ '[[:cntrl:]]'),
  add constraint user_spots_category_allowed check (category in (
    '駅', '百貨店', '商業施設', '公園・再開発エリア', '劇場', 'イベント会場', 'ライブハウス',
    '映画館', '娯楽施設', '学校・ホール', 'サウナ', '店舗', '飲食店', '公園'
  )),
  add constraint user_spots_umeda_area check (lat between 34.6 and 34.8 and lng between 135.4 and 135.6);

alter table public.reviews
  add constraint reviews_comment_not_blank check (btrim(comment) <> ''),
  add constraint reviews_author_not_blank check (btrim(author) <> '' and author !~ '[[:cntrl:]]'),
  -- 既存スポットは数字ID、ユーザー追加スポットはuuid
  add constraint reviews_spot_id_format check (
    spot_id ~ '^[0-9]{1,10}$'
    or spot_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

-- 3) 全体レート制限: 直近1分間の投稿件数が上限を超えたら拒否（無制限書き込みによる荒らし・容量枯渇対策）
create or replace function public.enforce_insert_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  max_per_minute constant integer := 30;
begin
  execute format('select count(*) from %I.%I where created_at > now() - interval ''1 minute''',
                 tg_table_schema, tg_table_name)
    into recent_count;
  if recent_count >= max_per_minute then
    raise exception 'rate limit exceeded' using errcode = 'P0001';
  end if;
  -- created_atはクライアント指定を許さずサーバー時刻に固定
  new.created_at := now();
  return new;
end;
$$;

revoke all on function public.enforce_insert_rate_limit() from public, anon, authenticated;

create trigger user_spots_rate_limit before insert on public.user_spots
  for each row execute function public.enforce_insert_rate_limit();
create trigger reviews_rate_limit before insert on public.reviews
  for each row execute function public.enforce_insert_rate_limit();

create index if not exists user_spots_created_at_idx on public.user_spots (created_at);
create index if not exists reviews_created_at_idx on public.reviews (created_at);
