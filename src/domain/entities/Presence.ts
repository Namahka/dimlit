export interface Presence {
  id: string
  userId: string
  username: string
  country: string
  city?: string
  latitude: number
  longitude: number
  isActive: boolean
  isAnonymous?: boolean
  lastSeen: Date
}
