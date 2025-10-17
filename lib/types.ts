// CoinGecko API response types
export interface CryptoAsset {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap?: number
  total_volume?: number
}

// Detailed asset information
export interface AssetDetail {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_7d: number
  price_change_percentage_30d: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  high_24h: number
  low_24h: number
  description: string
  homepage: string
  blockchain_site: string
  categories: string[]
}

// Supabase Favorites table type
export interface Favorite {
  id: string
  asset_id: string
  created_at: string
}

// API Response types
export interface AssetsResponse {
  assets: CryptoAsset[]
}

export interface FavoritesResponse {
  favorites: Favorite[]
}

export interface ErrorResponse {
  error: string
}
