import { type SupabaseClient, createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 環境変数が未設定の場合はnullとし、呼び出し側はlocalStorageにフォールバックする
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null
