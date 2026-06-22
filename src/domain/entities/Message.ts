export interface Message {
  id: string
  userId: string
  username: string
  text: string
  country: string
  createdAt: Date
  likes: string[] // array of userIds
}
