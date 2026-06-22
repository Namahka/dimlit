import type { Message } from '../entities/Message'

export interface IMessageRepository {
  addMessage(msg: Omit<Message, 'id'>): Promise<void>

  listenToMessages(callback: (messages: Message[]) => void): () => void
}
