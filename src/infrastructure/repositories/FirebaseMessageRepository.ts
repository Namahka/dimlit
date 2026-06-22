import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/firebaseApp'
import type { IMessageRepository } from '../../domain/repositories/IMessageRepository'
import type { Message } from '../../domain/entities/Message'

function toMessage(id: string, data: Record<string, unknown>): Message {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt as string | number)

  return {
    id,
    userId: data.userId as string,
    text: data.text as string,
    country: data.country as string,
    createdAt,
  }
}

export class FirebaseMessageRepository implements IMessageRepository {
  async addMessage(msg: Omit<Message, 'id'>): Promise<void> {
    await addDoc(collection(db, 'messages'), {
      userId: msg.userId,
      text: msg.text,
      country: msg.country,
      createdAt: serverTimestamp(),
    })
  }

  listenToMessages(callback: (messages: Message[]) => void): () => void {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(100))
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => toMessage(d.id, d.data() as Record<string, unknown>)))
    })
  }
}
