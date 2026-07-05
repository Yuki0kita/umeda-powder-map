import type { Spot } from './data'

export type Review = {
  id: string
  spotId: string
  rating: number
  comment: string
  author: string
  createdAt: string
}

// ユーザーが新規追加した施設の保存単位。表示用の評価・口コミ要約は口コミから算出する
export type UserSpotRecord = Pick<Spot, 'id' | 'name' | 'category' | 'lat' | 'lng'>

const REVIEWS_KEY = 'umeda-powder-map/reviews'
const USER_SPOTS_KEY = 'umeda-powder-map/user-spots'

export const loadReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    return raw ? (JSON.parse(raw) as Review[]) : []
  } catch (error) {
    console.error('口コミデータの読み込みに失敗しました', error)
    return []
  }
}

export const saveReviews = (reviews: Review[]): void => {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  } catch (error) {
    console.error('口コミデータの保存に失敗しました', error)
  }
}

export const loadUserSpots = (): UserSpotRecord[] => {
  try {
    const raw = localStorage.getItem(USER_SPOTS_KEY)
    return raw ? (JSON.parse(raw) as UserSpotRecord[]) : []
  } catch (error) {
    console.error('ユーザー追加施設の読み込みに失敗しました', error)
    return []
  }
}

export const saveUserSpots = (spots: UserSpotRecord[]): void => {
  try {
    localStorage.setItem(USER_SPOTS_KEY, JSON.stringify(spots))
  } catch (error) {
    console.error('ユーザー追加施設の保存に失敗しました', error)
  }
}
