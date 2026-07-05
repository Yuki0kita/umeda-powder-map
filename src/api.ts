import {
  type Review,
  type UserSpotRecord,
  loadReviews,
  loadUserSpots,
  saveReviews,
  saveUserSpots,
} from './reviews'
import { supabase } from './supabase'

// Supabase未設定時はlocalStorageに保存する（開発・オフライン用フォールバック）
export const isRemoteStorage = supabase !== null

type ReviewRow = {
  id: string
  spot_id: string
  rating: number
  comment: string
  author: string
  created_at: string
}

type UserSpotRow = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
}

const toReview = (row: ReviewRow): Review => ({
  id: row.id,
  spotId: row.spot_id,
  rating: row.rating,
  comment: row.comment,
  author: row.author,
  createdAt: row.created_at,
})

const toUserSpotRecord = (row: UserSpotRow): UserSpotRecord => ({
  id: row.id,
  name: row.name,
  category: row.category as UserSpotRecord['category'],
  lat: row.lat,
  lng: row.lng,
})

export const fetchReviews = async (): Promise<Review[]> => {
  if (!supabase) return loadReviews()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, spot_id, rating, comment, author, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`口コミの取得に失敗しました: ${error.message}`)
  return (data as ReviewRow[]).map(toReview)
}

export const addReview = async (input: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
  if (!supabase) {
    const review: Review = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    saveReviews([...loadReviews(), review])
    return review
  }
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      spot_id: input.spotId,
      rating: input.rating,
      comment: input.comment,
      author: input.author,
    })
    .select('id, spot_id, rating, comment, author, created_at')
    .single()
  if (error) throw new Error(`口コミの投稿に失敗しました: ${error.message}`)
  return toReview(data as ReviewRow)
}

export const fetchUserSpots = async (): Promise<UserSpotRecord[]> => {
  if (!supabase) return loadUserSpots()
  const { data, error } = await supabase
    .from('user_spots')
    .select('id, name, category, lat, lng')
    .order('created_at', { ascending: true })
  if (error) throw new Error(`スポットの取得に失敗しました: ${error.message}`)
  return (data as UserSpotRow[]).map(toUserSpotRecord)
}

export const addUserSpot = async (
  input: Omit<UserSpotRecord, 'id'>,
): Promise<UserSpotRecord> => {
  if (!supabase) {
    const record: UserSpotRecord = { ...input, id: `u-${crypto.randomUUID()}` }
    saveUserSpots([...loadUserSpots(), record])
    return record
  }
  const { data, error } = await supabase
    .from('user_spots')
    .insert({
      name: input.name,
      category: input.category,
      lat: input.lat,
      lng: input.lng,
    })
    .select('id, name, category, lat, lng')
    .single()
  if (error) throw new Error(`スポットの登録に失敗しました: ${error.message}`)
  return toUserSpotRecord(data as UserSpotRow)
}
