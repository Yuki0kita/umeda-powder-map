import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Base,
  Button,
  Center,
  Checkbox,
  Cluster,
  FaAngleDownIcon,
  FilterDropdown,
  FormControl,
  Heading,
  MultiCombobox,
  NotificationBar,
  ResponseMessage,
  SearchInput,
  SegmentedControl,
  Sidebar,
  Stack,
  StatusLabel,
  Text,
} from 'smarthr-ui'
import { addReview, addUserSpot, fetchReviews, fetchUserSpots } from './api'
import {
  type Category,
  PRIORITY_CATEGORIES,
  SPOTS,
  type Spot,
  TAGS,
  type Tag,
} from './data'
import { MapView } from './MapView'
import { type NewSpotInput, ReviewFormDialog } from './ReviewFormDialog'
import { type Review, type UserSpotRecord } from './reviews'

// よくあるリスト: 後続コンテンツがないページは20件程度だが、モバイル想定のため5件+「さらに表示」
const PAGE_SIZE = 5
const MAX_RATING = 5
const DEFAULT_USER_SPOT_RATING = 3
const VENUE_ONLY_TAG: Tag = '施設利用者向け'
const NIGHT_CAUTION_TAG: Tag = '夜間注意'

type TagItem = { label: Tag; value: Tag }
const TAG_ITEMS: TagItem[] = TAGS.map((tag) => ({ label: tag, value: tag }))

// ha-maki.com のエリア/カテゴリ検索を踏襲した、件数付きのカテゴリ切り替え
const CATEGORY_GROUPS: { value: string; label: string; categories: Category[] | null }[] = [
  { value: 'all', label: 'すべて', categories: null },
  { value: 'station', label: '駅', categories: ['駅'] },
  { value: 'department', label: '百貨店', categories: ['百貨店'] },
  { value: 'mall', label: '商業施設', categories: ['商業施設'] },
  {
    value: 'entertainment',
    label: 'エンタメ',
    categories: ['劇場', 'イベント会場', 'ライブハウス', '映画館', '娯楽施設', '学校・ホール', 'サウナ'],
  },
  { value: 'shop', label: '店舗・飲食', categories: ['店舗', '飲食店'] },
  { value: 'outdoor', label: '公園・屋外', categories: ['公園・再開発エリア', '公園'] },
]

// 一般利用しやすい駅・百貨店・商業施設を優先し、同順位は評価が高い順に並べる
const sortSpots = (spots: Spot[]): Spot[] =>
  [...spots].sort((a, b) => {
    const priorityDiff =
      Number(!PRIORITY_CATEGORIES.includes(a.category)) -
      Number(!PRIORITY_CATEGORIES.includes(b.category))
    if (priorityDiff !== 0) return priorityDiff
    if (a.rating !== b.rating) return b.rating - a.rating
    return a.id.localeCompare(b.id)
  })

const ratingText = (rating: number): string =>
  '★'.repeat(rating) + '☆'.repeat(MAX_RATING - rating)

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' })

type FilterState = {
  tags: Tag[]
  excludeVenueOnly: boolean
}

const EMPTY_FILTER: FilterState = { tags: [], excludeVenueOnly: false }

type Notification = { type: 'success' | 'error'; message: string }

export const App = () => {
  const [keywordInput, setKeywordInput] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [pendingFilter, setPendingFilter] = useState<FilterState>(EMPTY_FILTER)
  const [appliedFilter, setAppliedFilter] = useState<FilterState>(EMPTY_FILTER)
  const [categoryGroup, setCategoryGroup] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [userSpots, setUserSpots] = useState<UserSpotRecord[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    Promise.all([fetchReviews(), fetchUserSpots()])
      .then(([fetchedReviews, fetchedSpots]) => {
        setReviews(fetchedReviews)
        setUserSpots(fetchedSpots)
      })
      .catch((error: unknown) => {
        console.error(error)
        setNotification({
          type: 'error',
          message: '投稿データの読み込みに失敗しました。時間をおいて再読み込みしてください。',
        })
      })
  }, [])

  const activeCategories = CATEGORY_GROUPS.find((g) => g.value === categoryGroup)?.categories ?? null

  // ユーザー投稿スポットの表示用メタ情報（評価=口コミ平均、要約=最新口コミ）を算出する
  const userSpotsAsSpots: Spot[] = useMemo(
    () =>
      userSpots.map((record) => {
        const spotReviews = reviews.filter((review) => review.spotId === record.id)
        const latest = spotReviews.reduce<Review | null>(
          (acc, review) => (!acc || review.createdAt > acc.createdAt ? review : acc),
          null,
        )
        const average = spotReviews.length
          ? Math.round(spotReviews.reduce((sum, review) => sum + review.rating, 0) / spotReviews.length)
          : DEFAULT_USER_SPOT_RATING
        return {
          ...record,
          rating: Math.min(MAX_RATING, Math.max(1, average)) as Spot['rating'],
          review: latest?.comment ?? '口コミ募集中。',
          note: 'ユーザー投稿スポット。現地確認前。',
          tags: [],
        }
      }),
    [userSpots, reviews],
  )

  const allSpots = useMemo(() => [...SPOTS, ...userSpotsAsSpots], [userSpotsAsSpots])

  const filteredSpots = useMemo(
    () =>
      sortSpots(
        allSpots.filter((spot) => {
          const matchesKeyword = [spot.name, spot.review, spot.note, spot.category].some((text) =>
            text.includes(appliedKeyword),
          )
          const matchesCategory = activeCategories === null || activeCategories.includes(spot.category)
          const matchesTags = appliedFilter.tags.every((tag) => spot.tags.includes(tag))
          const matchesVenueRule =
            !appliedFilter.excludeVenueOnly || !spot.tags.includes(VENUE_ONLY_TAG)
          return matchesKeyword && matchesCategory && matchesTags && matchesVenueRule
        }),
      ),
    [allSpots, appliedKeyword, appliedFilter, activeCategories],
  )
  const visibleSpots = filteredSpots.slice(0, visibleCount)

  const categoryOptions = useMemo(
    () =>
      CATEGORY_GROUPS.map((group) => {
        const count =
          group.categories === null
            ? allSpots.length
            : allSpots.filter((spot) => group.categories!.includes(spot.category)).length
        return { value: group.value, content: `${group.label}（${count}）` }
      }),
    [allSpots],
  )

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reviews],
  )

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAppliedKeyword(keywordInput.trim())
    setVisibleCount(PAGE_SIZE)
  }

  const handleSelectSpot = useCallback((id: string) => {
    setSelectedSpotId(id)
  }, [])

  const handleReviewSubmitted = async (
    input: Omit<Review, 'id' | 'createdAt' | 'spotId'>,
    target: { spotId: string } | { newSpot: NewSpotInput },
  ) => {
    setIsDialogOpen(false)
    try {
      let spotId: string
      let notificationText: string
      if ('newSpot' in target) {
        const { newSpot } = target
        const record = await addUserSpot({
          name: newSpot.name,
          category: newSpot.category,
          lat: newSpot.position.lat,
          lng: newSpot.position.lng,
        })
        setUserSpots((current) => [...current, record])
        spotId = record.id
        notificationText = `${record.name}を新規追加し、口コミを投稿しました。`
      } else {
        spotId = target.spotId
        const name = allSpots.find((spot) => spot.id === spotId)?.name ?? ''
        notificationText = `${name}の口コミを投稿しました。`
      }
      const review = await addReview({ ...input, spotId })
      setReviews((current) => [...current, review])
      setNotification({ type: 'success', message: notificationText })
      setSelectedSpotId(spotId)
    } catch (error) {
      console.error(error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : '投稿に失敗しました。',
      })
    }
  }

  const spotName = (spotId: string): string =>
    allSpots.find((spot) => spot.id === spotId)?.name ?? '不明な施設'

  const selectedTagItems = pendingFilter.tags.map((tag) => ({ label: tag, value: tag }))
  const isFiltered = appliedFilter.tags.length > 0 || appliedFilter.excludeVenueOnly

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <h1 className="site-title">ウメパウ</h1>
          <p className="site-tagline">梅田のキレイなトイレ&パウダールームマップ</p>
        </div>
      </header>
      <main className="app-container">
        <Stack gap={1.5}>
          <ResponseMessage status="info">
            掲載内容は口コミ投稿の要約です。設備・利用可否は現地の案内を確認してください。
          </ResponseMessage>

          {notification && (
            <NotificationBar
              type={notification.type}
              base="base"
              bold
              animate
              role={notification.type === 'error' ? 'alert' : 'status'}
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </NotificationBar>
          )}

          <Base padding={1}>
            <Stack gap={0.75}>
              <MapView spots={filteredSpots} selectedId={selectedSpotId} onSelect={handleSelectSpot} />
              <SegmentedControl
                options={categoryOptions}
                value={categoryGroup}
                size="S"
                onClickOption={(value) => {
                  setCategoryGroup(value)
                  setVisibleCount(PAGE_SIZE)
                }}
              />
            </Stack>
          </Base>

          <Sidebar gap={0.5} align="center" right>
            <Heading>スポット</Heading>
            <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
              口コミを投稿
            </Button>
          </Sidebar>

          <Base padding={1}>
            <Stack gap={1}>
              <Cluster gap={0.5} align="center">
                <form onSubmit={handleSearchSubmit}>
                  <SearchInput
                    name="keyword"
                    tooltipMessage="施設名・カテゴリ・口コミ内容で検索できます"
                    width="16em"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                  />
                </form>
                <FilterDropdown
                  filtered={isFiltered}
                  onApply={() => {
                    setAppliedFilter(pendingFilter)
                    setVisibleCount(PAGE_SIZE)
                  }}
                  onCancel={() => setPendingFilter(appliedFilter)}
                  onReset={() => setPendingFilter(EMPTY_FILTER)}
                >
                  <Stack gap={1} className="filter-panel">
                    <FormControl label="タグ">
                      <MultiCombobox
                        name="tags"
                        width="100%"
                        items={TAG_ITEMS}
                        selectedItems={selectedTagItems}
                        onSelect={(item) =>
                          setPendingFilter((f) => ({ ...f, tags: [...f.tags, item.value as Tag] }))
                        }
                        onDelete={(item) =>
                          setPendingFilter((f) => ({
                            ...f,
                            tags: f.tags.filter((tag) => tag !== item.value),
                          }))
                        }
                      />
                    </FormControl>
                    <Checkbox
                      name="excludeVenueOnly"
                      checked={pendingFilter.excludeVenueOnly}
                      onChange={() =>
                        setPendingFilter((f) => ({ ...f, excludeVenueOnly: !f.excludeVenueOnly }))
                      }
                    >
                      施設利用者向けの場所を除く
                    </Checkbox>
                  </Stack>
                </FilterDropdown>
              </Cluster>

              {visibleSpots.length === 0 ? (
                <Center>
                  <div className="empty-message">
                    <Text whiteSpace="pre-line">
                      {'該当するトイレ・パウダールームはありません。\n別の条件を試してください。'}
                    </Text>
                  </div>
                </Center>
              ) : (
                <ul className="spot-list">
                  {visibleSpots.map((spot) => (
                    <li key={spot.id}>
                      <button
                        type="button"
                        className={`spot-link${spot.id === selectedSpotId ? ' is-selected' : ''}`}
                        onClick={() => handleSelectSpot(spot.id)}
                      >
                        <Stack gap={0.25} align="start">
                          <Cluster gap={0.5} align="center">
                            <Text size="M" leading="NORMAL">
                              {spot.name}
                            </Text>
                            <Text
                              size="S"
                              color="TEXT_GREY"
                              aria-label={`評価 ${spot.rating}／${MAX_RATING}`}
                            >
                              {ratingText(spot.rating)}
                            </Text>
                            <StatusLabel type="grey">{spot.category}</StatusLabel>
                            {spot.tags.includes(NIGHT_CAUTION_TAG) && (
                              <StatusLabel type="warning">夜間注意</StatusLabel>
                            )}
                            {spot.tags.includes(VENUE_ONLY_TAG) && (
                              <StatusLabel type="blue">施設利用者向け</StatusLabel>
                            )}
                          </Cluster>
                          <Text size="S" leading="TIGHT" color="TEXT_GREY">
                            口コミ：{spot.review}
                          </Text>
                          <Text size="S" leading="TIGHT" color="TEXT_GREY">
                            メモ：{spot.note}
                            {spot.tags.length > 0 && `（タグ：${spot.tags.join('・')}）`}
                          </Text>
                        </Stack>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {filteredSpots.length > visibleCount && (
                <Button
                  variant="tertiary"
                  wide
                  prefix={<FaAngleDownIcon />}
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  さらに表示
                </Button>
              )}
            </Stack>
          </Base>

          <Stack gap={0.5}>
            <Heading>新着口コミ</Heading>
            <Base padding={1}>
              {sortedReviews.length === 0 ? (
                <Center>
                  <div className="empty-message">
                    <Text whiteSpace="pre-line">
                      {'口コミはまだありません。\n最初の口コミを投稿してみてください。'}
                    </Text>
                  </div>
                </Center>
              ) : (
                <ul className="spot-list">
                  {sortedReviews.map((review) => (
                    <li key={review.id}>
                      <div className="review-item">
                        <Stack gap={0.25} align="start">
                          <Cluster gap={0.5} align="center">
                            <Text size="M" leading="NORMAL">
                              {spotName(review.spotId)}
                            </Text>
                            <Text
                              size="S"
                              color="TEXT_GREY"
                              aria-label={`評価 ${review.rating}／${MAX_RATING}`}
                            >
                              {ratingText(review.rating)}
                            </Text>
                          </Cluster>
                          <Text size="S" leading="NORMAL">
                            {review.comment}
                          </Text>
                          <Text size="S" leading="TIGHT" color="TEXT_GREY">
                            {review.author}・{formatDate(review.createdAt)}
                          </Text>
                        </Stack>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Base>
          </Stack>
        </Stack>

        <ReviewFormDialog
          isOpen={isDialogOpen}
          spots={allSpots}
          defaultSpotId={selectedSpotId}
          onClose={() => setIsDialogOpen(false)}
          onSubmitted={handleReviewSubmitted}
        />
      </main>
    </>
  )
}
