export const TAGS = [
  '駅近',
  '女性向け',
  '子連れ向け',
  'パウダー設備あり',
  '休憩しやすい',
  '穴場',
  '夜間注意',
  '施設利用者向け',
] as const
export type Tag = (typeof TAGS)[number]

export type Category =
  | '駅'
  | '百貨店'
  | '商業施設'
  | '公園・再開発エリア'
  | '劇場'
  | 'イベント会場'
  | 'ライブハウス'
  | '映画館'
  | '娯楽施設'
  | '学校・ホール'
  | 'サウナ'
  | '店舗'
  | '飲食店'
  | '公園'

// 口コミ由来のナレッジは「一般利用しやすい順」で駅・百貨店・商業施設を優先表示する
export const PRIORITY_CATEGORIES: Category[] = ['駅', '百貨店', '商業施設']

export type Spot = {
  id: string
  // 座標は投稿情報からの概算値。現地確認で更新する
  lat: number
  lng: number
  name: string
  category: Category
  rating: 1 | 2 | 3 | 4 | 5
  review: string
  note: string
  tags: Tag[]
}

const mapsUrl = (query: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const spotDetailUrl = (spot: Spot): string => mapsUrl(`${spot.name} 大阪 梅田`)

// 口コミナレッジ（2026-07時点の投稿要約。設備・状態は現地確認前の参考情報）
export const SPOTS: Spot[] = [
  {
    id: '001',
    lat: 34.7053,
    lng: 135.4988,
    name: '大阪メトロ 梅田駅',
    category: '駅',
    rating: 5,
    review: '改装後、明るく綺麗になったという投稿が複数。昔の地下鉄トイレとの差が大きいとの声。',
    note: '駅利用者向け。口コミ数多め。',
    tags: ['駅近'],
  },
  {
    id: '002',
    lat: 34.7017,
    lng: 135.5008,
    name: '大阪メトロ 東梅田駅',
    category: '駅',
    rating: 5,
    review: '緑の装飾があり、落ち着く雰囲気。綺麗で居心地がよいとの投稿。',
    note: '東梅田エリアの候補。',
    tags: ['駅近'],
  },
  {
    id: '003',
    lat: 34.7043,
    lng: 135.4997,
    name: '阪急大阪梅田駅',
    category: '駅',
    rating: 5,
    review: 'ウォシュレットあり、設備が整っていて綺麗との口コミ。駅トイレリフレッシュ工事にも言及あり。',
    note: '阪急利用者向け。',
    tags: ['駅近'],
  },
  {
    id: '004',
    lat: 34.7018,
    lng: 135.4946,
    name: 'JR大阪駅／梅田西口付近',
    category: '駅',
    rating: 5,
    review: '洋式が多目的トイレ仕様で「綺麗すぎる」との投稿。',
    note: 'JR利用者向け。',
    tags: ['駅近'],
  },
  {
    id: '005',
    lat: 34.7051,
    lng: 135.4983,
    name: '御堂筋線 梅田駅',
    category: '駅',
    rating: 4,
    review: '改装で綺麗になった一方、空間が狭くなったとの声あり。',
    note: '綺麗だが混雑・狭さに注意。',
    tags: ['駅近'],
  },
  {
    id: '006',
    lat: 34.702,
    lng: 135.4989,
    name: '阪急うめだ本店',
    category: '百貨店',
    rating: 5,
    review: 'トイレ・通路が広く清潔。百貨店らしい高級感があるとの口コミ。',
    note: '安心度が高い定番候補。',
    tags: [],
  },
  {
    id: '007',
    lat: 34.7014,
    lng: 135.4963,
    name: '大丸梅田店 14F',
    category: '百貨店',
    rating: 5,
    review: '休憩スペースあり、トイレが綺麗で安心感があるとの投稿。',
    note: '休憩目的にも相性がよい。',
    tags: ['休憩しやすい', '穴場'],
  },
  {
    id: '008',
    lat: 34.7062,
    lng: 135.4986,
    name: '阪急三番街 地下トイレ',
    category: '商業施設',
    rating: 4,
    review: '少し遠いが、綺麗で使いやすい。オムツ替え利用でも言及あり。',
    note: '子連れ向けメモ追加候補。',
    tags: ['子連れ向け'],
  },
  {
    id: '009',
    lat: 34.6996,
    lng: 135.4977,
    name: 'E-ma 3F',
    category: '商業施設',
    rating: 5,
    review: '改装直後でかなり綺麗。比較的人が少なく、女性向けパウダーコーナーありとの投稿。',
    note: '穴場・パウダー需要あり。',
    tags: ['女性向け', 'パウダー設備あり', '穴場'],
  },
  {
    id: '010',
    lat: 34.7013,
    lng: 135.493,
    name: 'KITTE大阪',
    category: '商業施設',
    rating: 5,
    review: 'フリースペース、スタバ、広く綺麗なトイレがあり「完璧」との口コミ。',
    note: '休憩・待ち合わせ向け。',
    tags: ['休憩しやすい'],
  },
  {
    id: '011',
    lat: 34.7048,
    lng: 135.4964,
    name: 'ヨドバシ梅田',
    category: '商業施設',
    rating: 4,
    review: 'モール経由で行きやすく、トイレも綺麗との口コミ。',
    note: '買い物導線上で便利。',
    tags: [],
  },
  {
    id: '012',
    lat: 34.7057,
    lng: 135.4925,
    name: 'グラングリーン大阪',
    category: '公園・再開発エリア',
    rating: 4,
    review: '公園は綺麗。公衆トイレは夜間閉鎖との投稿あり。',
    note: '利用可能時間を要確認。',
    tags: ['夜間注意'],
  },
  {
    id: '013',
    lat: 34.708,
    lng: 135.499,
    name: '梅田芸術劇場',
    category: '劇場',
    rating: 5,
    review: 'レトロでおしゃれな雰囲気。トイレの綺麗さに感動したとの口コミ。',
    note: '公演利用時向け。',
    tags: ['施設利用者向け'],
  },
  {
    id: '014',
    lat: 34.7078,
    lng: 135.5,
    name: 'SkyシアターMBS',
    category: '劇場',
    rating: 5,
    review: '新しく綺麗。トイレが多く、立地も良いとの投稿。',
    note: '劇場利用者に高評価。',
    tags: ['施設利用者向け'],
  },
  {
    id: '015',
    lat: 34.7043,
    lng: 135.4933,
    name: '梅田ステラホール',
    category: 'イベント会場',
    rating: 5,
    review: '女子トイレが綺麗で数も多い。駅から近く、子連れにも良いとの口コミ。',
    note: '女性・子連れ向け評価高い。',
    tags: ['女性向け', '子連れ向け'],
  },
  {
    id: '016',
    lat: 34.701,
    lng: 135.504,
    name: 'LIVE SPACE ODYSSEY',
    category: 'ライブハウス',
    rating: 5,
    review: '新店でおしゃれ。トイレ入口や内装にこだわりがあるとの口コミ。',
    note: '施設利用時限定。',
    tags: ['施設利用者向け'],
  },
  {
    id: '017',
    lat: 34.707,
    lng: 135.501,
    name: 'テアトル梅田',
    category: '映画館',
    rating: 4,
    review: '広くて綺麗。上映前後に使いやすいとの口コミ。',
    note: '映画利用者向け。',
    tags: ['施設利用者向け'],
  },
  {
    id: '018',
    lat: 34.6997,
    lng: 135.504,
    name: 'ウインズ梅田',
    category: '娯楽施設',
    rating: 5,
    review: '綺麗、広い、トイレも綺麗との投稿。女性や若い人も利用しやすい印象。',
    note: '競馬施設。利用者層に注意。',
    tags: [],
  },
  {
    id: '019',
    lat: 34.7085,
    lng: 135.498,
    name: '関西大学 梅田キャンパス 8F',
    category: '学校・ホール',
    rating: 4,
    review: 'シンプルで綺麗。大便器は広めで、手すり・背もたれあり。',
    note: '施設利用時限定の可能性。',
    tags: ['施設利用者向け'],
  },
  {
    id: '020',
    lat: 34.6989,
    lng: 135.5027,
    name: 'ニュージャパン梅田',
    category: 'サウナ',
    rating: 4,
    review: '改装後、洗い場とトイレが綺麗になり快適性が上がったとの投稿。',
    note: '利用者限定。',
    tags: ['施設利用者向け'],
  },
  {
    id: '021',
    lat: 34.6975,
    lng: 135.4995,
    name: '竜のしっぽ大阪梅田店',
    category: '店舗',
    rating: 4,
    review: 'トイレが非常に綺麗との投稿。',
    note: '店舗利用者向け。',
    tags: ['施設利用者向け'],
  },
  {
    id: '022',
    lat: 34.703,
    lng: 135.503,
    name: 'ヨルゴハンクゥノーム',
    category: '飲食店',
    rating: 4,
    review: '店内が綺麗。女子トイレにヘアアイロンありとの投稿。',
    note: '女性向け設備メモあり。',
    tags: ['女性向け', 'パウダー設備あり', '施設利用者向け'],
  },
  {
    id: '023',
    lat: 34.7005,
    lng: 135.501,
    name: 'A.rule 梅田',
    category: '店舗',
    rating: 4,
    review: '店内もトイレも綺麗との口コミ。',
    note: '店舗利用者向け。',
    tags: ['施設利用者向け'],
  },
  {
    id: '024',
    lat: 34.704,
    lng: 135.507,
    name: '246 LIVEHOUSE GABU周辺',
    category: 'ライブハウス',
    rating: 4,
    review: 'トイレが綺麗で面白いとの投稿。',
    note: '情報が古いため現地確認推奨。',
    tags: ['施設利用者向け'],
  },
  {
    id: '025',
    lat: 34.702,
    lng: 135.497,
    name: '梅田ベーオン',
    category: '店舗',
    rating: 4,
    review: 'トイレが綺麗との口コミ。',
    note: '情報が古いため現地確認推奨。',
    tags: ['施設利用者向け'],
  },
  {
    id: '026',
    lat: 34.7043,
    lng: 135.5115,
    name: '扇町公園',
    category: '公園',
    rating: 3,
    review: 'トイレが広く綺麗になったとの投稿。梅田からはやや東側。',
    note: '梅田中心部から距離あり。',
    tags: [],
  },
]

// 除外・保留データ。マップには表示しないが、再調査時の判断根拠として保持する
export const EXCLUDED_ENTRIES: { source: string; reason: string }[] = [
  { source: '大阪マルビル', reason: '閉館済みのため、現行マップからは除外' },
  { source: '梅田湖ロウバイパーク', reason: '群馬県の梅田であり、大阪梅田ではない' },
  { source: '甲子園', reason: '梅田周辺ではない' },
  { source: 'ホテル系投稿', reason: '宿泊者限定のため、一般利用マップには不向き' },
  { source: '政治的投稿', reason: '施設名が特定できない場合は参考情報止まり' },
  { source: '「中津〜梅田のトイレはどこも綺麗」', reason: '広域コメントのため施設データ化は保留' },
]
