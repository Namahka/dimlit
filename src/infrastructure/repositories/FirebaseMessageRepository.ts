import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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
    username: (data.username as string | undefined) ?? 'Anonymous',
    text: data.text as string,
    country: data.country as string,
    createdAt,
    likes: (data.likes as string[] | undefined) ?? [],
  }
}

export class FirebaseMessageRepository implements IMessageRepository {
  async addMessage(msg: Omit<Message, 'id'>): Promise<void> {
    await addDoc(collection(db, 'messages'), {
      userId: msg.userId,
      username: msg.username,
      text: msg.text,
      country: msg.country,
      likes: [],
      createdAt: serverTimestamp(),
    })
  }

  async toggleLike(messageId: string, userId: string, liked: boolean): Promise<void> {
    const ref = doc(db, 'messages', messageId)
    await updateDoc(ref, {
      likes: liked ? arrayRemove(userId) : arrayUnion(userId),
    })
  }

  listenToMessages(callback: (messages: Message[]) => void): () => void {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(100))
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => toMessage(d.id, d.data() as Record<string, unknown>)))
    })
  }
}
