import { type FormEvent, useState } from 'react'
import {
  Cluster,
  ControlledFormDialog,
  Fieldset,
  FormControl,
  Input,
  RadioButton,
  RequiredLabel,
  Select,
  SingleCombobox,
  Text,
  Textarea,
} from 'smarthr-ui'
import { type Category, type Spot } from './data'
import { type LatLng, LocationPicker } from './LocationPicker'
import { type Review } from './reviews'

const RATING_OPTIONS = ['5', '4', '3', '2', '1'] as const
const DEFAULT_RATING = '5'
const COMMENT_MAX_LETTERS = 200
// 既存施設のIDと衝突しない、新規施設モードを表す予約値
const NEW_SPOT_VALUE = '__new__'

const CATEGORY_OPTIONS: { value: Category; label: string }[] = (
  [
    '駅',
    '百貨店',
    '商業施設',
    '公園・再開発エリア',
    '劇場',
    'イベント会場',
    'ライブハウス',
    '映画館',
    '娯楽施設',
    '学校・ホール',
    'サウナ',
    '店舗',
    '飲食店',
    '公園',
  ] as Category[]
).map((category) => ({ value: category, label: category }))

type SpotItem = { label: string; value: string }

export type NewSpotInput = {
  name: string
  category: Category
  position: LatLng
}

type Props = {
  isOpen: boolean
  spots: Spot[]
  defaultSpotId: string | null
  onClose: () => void
  onSubmitted: (review: Omit<Review, 'id' | 'createdAt' | 'spotId'>, target: { spotId: string } | { newSpot: NewSpotInput }) => void
}

export const ReviewFormDialog = ({ isOpen, spots, defaultSpotId, onClose, onSubmitted }: Props) => {
  const [spotItem, setSpotItem] = useState<SpotItem | null>(null)
  const [newSpotCategory, setNewSpotCategory] = useState<Category | ''>('')
  const [newSpotPosition, setNewSpotPosition] = useState<LatLng | null>(null)
  const [rating, setRating] = useState<string>(DEFAULT_RATING)
  const [comment, setComment] = useState('')
  const [author, setAuthor] = useState('')

  const spotItems: SpotItem[] = spots.map((spot) => ({ label: spot.name, value: spot.id }))
  const selectedSpotItem =
    spotItem ?? spotItems.find((item) => item.value === defaultSpotId) ?? null
  const isNewSpot = selectedSpotItem?.value === NEW_SPOT_VALUE
  const newSpotReady = newSpotCategory !== '' && newSpotPosition !== null
  const canSubmit =
    selectedSpotItem !== null && comment.trim().length > 0 && (!isNewSpot || newSpotReady)

  const resetForm = () => {
    setSpotItem(null)
    setNewSpotCategory('')
    setNewSpotPosition(null)
    setRating(DEFAULT_RATING)
    setComment('')
    setAuthor('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>, helpers: { close: () => void }) => {
    event.preventDefault()
    if (!canSubmit || !selectedSpotItem) return
    const review = {
      rating: Number(rating),
      comment: comment.trim(),
      author: author.trim() || '匿名',
    }
    if (isNewSpot) {
      if (!newSpotCategory || !newSpotPosition) return
      onSubmitted(review, {
        newSpot: {
          name: selectedSpotItem.label,
          category: newSpotCategory,
          position: newSpotPosition,
        },
      })
    } else {
      onSubmitted(review, { spotId: selectedSpotItem.value })
    }
    resetForm()
    helpers.close()
  }

  return (
    <ControlledFormDialog
      isOpen={isOpen}
      heading="口コミを投稿"
      actionButton={{ text: '投稿する', theme: 'primary', disabled: !canSubmit }}
      closeButton={{ text: 'キャンセル' }}
      onSubmit={handleSubmit}
      onClickClose={handleClose}
      onPressEscape={handleClose}
      size="M"
    >
      <div className="review-form">
        <FormControl
          label="施設"
          statusLabels={[<RequiredLabel key="required" />]}
          helpMessage="一覧にない場所は、施設名を入力して「追加」を選ぶと新規登録できます"
        >
          <SingleCombobox
            name="spotId"
            width="100%"
            items={spotItems}
            selectedItem={selectedSpotItem}
            creatable
            onSelect={(item) => setSpotItem(item as SpotItem)}
            onAdd={(label) => setSpotItem({ label, value: NEW_SPOT_VALUE })}
            onClear={() => setSpotItem(null)}
            dropdownHelpMessage="施設名で検索できます"
          />
        </FormControl>

        {isNewSpot && (
          <>
            <FormControl label="カテゴリ" statusLabels={[<RequiredLabel key="required" />]}>
              <Select
                name="newSpotCategory"
                width="16em"
                options={CATEGORY_OPTIONS}
                value={newSpotCategory}
                hasBlank
                blankLabel="選択してください"
                onChangeValue={(value) => setNewSpotCategory(value as Category)}
              />
            </FormControl>
            <FormControl
              label="場所"
              statusLabels={[<RequiredLabel key="required" />]}
              helpMessage="地図をクリックして施設の位置を指定してください"
            >
              <div>
                <LocationPicker value={newSpotPosition} onChange={setNewSpotPosition} />
                <Text size="S" color={newSpotPosition ? 'TEXT_GREY' : 'inherit'}>
                  {newSpotPosition
                    ? `指定済み（緯度 ${newSpotPosition.lat.toFixed(4)} / 経度 ${newSpotPosition.lng.toFixed(4)}）`
                    : '未指定'}
                </Text>
              </div>
            </FormControl>
          </>
        )}

        <Fieldset legend="評価">
          <Cluster gap={0.75}>
            {RATING_OPTIONS.map((value) => (
              <RadioButton
                key={value}
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
              >
                {'★'.repeat(Number(value))}
              </RadioButton>
            ))}
          </Cluster>
        </Fieldset>
        <FormControl
          label="口コミ"
          statusLabels={[<RequiredLabel key="required" />]}
          helpMessage="清潔さ・混雑・設備など気づいたことを書いてください"
        >
          <Textarea
            name="comment"
            width="100%"
            rows={3}
            maxLetters={COMMENT_MAX_LETTERS}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </FormControl>
        <FormControl label="ニックネーム" helpMessage="未入力の場合は「匿名」で表示します">
          <Input
            name="author"
            width="16em"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </FormControl>
      </div>
    </ControlledFormDialog>
  )
}
