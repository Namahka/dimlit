import type { Message } from '../entities/Message'

export interface IMessageRepository {
  addMessage(msg: Omit<Message, 'id'>): Promise<void>
  toggleLike(messageId: string, userId: string, liked: boolean): Promise<void>
  listenToMessages(callback: (messages: Message[]) => void): () => void
}
