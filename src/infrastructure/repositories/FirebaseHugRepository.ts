import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/firebaseApp'
import type { IHugRepository } from '../../domain/repositories/IHugRepository'
import type { Hug } from '../../domain/entities/Hug'

function toHug(id: string, data: Record<string, unknown>): Hug {
  // serverTimestamp() is null on the first optimistic write — fall back to now
  const sentAt =
    data.sentAt instanceof Timestamp
      ? data.sentAt.toDate()
      : data.sentAt
      ? new Date(data.sentAt as string | number)
      : new Date()

  return {
    id,
    fromUserId: data.fromUserId as string,
    toUserId: data.toUserId as string,
    fromUsername: (data.fromUsername as string | undefined) ?? data.fromCountry as string,
    fromCountry: data.fromCountry as string,
    sentAt,
  }
}

export class FirebaseHugRepository implements IHugRepository {
  async sendHug(hug: Omit<Hug, 'id'>): Promise<void> {
    await addDoc(collection(db, 'hugs'), {
      fromUserId: hug.fromUserId,
      toUserId: hug.toUserId,
      fromUsername: hug.fromUsername,
      fromCountry: hug.fromCountry,
      sentAt: serverTimestamp(),
    })
  }

  listenToHugsReceived(userId: string, callback: (hugs: Hug[]) => void): () => void {
    const q = query(collection(db, 'hugs'), where('toUserId', '==', userId))
    return onSnapshot(q, (snapshot) => {
      const hugs = snapshot.docs.map((d) => toHug(d.id, d.data() as Record<string, unknown>))
      callback(hugs)
    })
  }
}
