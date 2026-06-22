import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { ref, onDisconnect, set, onValue } from 'firebase/database'
import { db, rtdb } from '../firebase/firebaseApp'
import type { IPresenceRepository } from '../../domain/repositories/IPresenceRepository'
import type { Presence } from '../../domain/entities/Presence'

function toPresence(id: string, data: Record<string, unknown>): Presence {
  const lastSeen =
    data.lastSeen instanceof Timestamp
      ? data.lastSeen.toDate()
      : new Date(data.lastSeen as string | number)

  return {
    id,
    userId: data.userId as string,
    username: (data.username as string | undefined) ?? 'Anonym',
    country: data.country as string,
    city: data.city as string | undefined,
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    isActive: data.isActive as boolean,
    lastSeen,
  }
}

export class FirebasePresenceRepository implements IPresenceRepository {
  async setActive(presence: Presence): Promise<void> {
    const docRef = doc(db, 'presences', presence.userId)
    console.log('[presence] writing active for', presence.userId, presence.username)
    await setDoc(docRef, {
      userId: presence.userId,
      username: presence.username,
      country: presence.country,
      city: presence.city ?? null,
      latitude: presence.latitude,
      longitude: presence.longitude,
      isActive: true,
      lastSeen: serverTimestamp(),
    })

    const statusRef = ref(rtdb, `/status/${presence.userId}`)
    await set(statusRef, { state: 'online', lastSeen: Date.now() })
    await onDisconnect(statusRef).set({ state: 'offline', lastSeen: Date.now() })

    onValue(statusRef, async (snapshot) => {
      const val = snapshot.val()
      if (val?.state === 'offline') {
        try {
          await updateDoc(doc(db, 'presences', presence.userId), { isActive: false })
        } catch {
          // doc might not exist yet; ignore
        }
      }
    })
  }

  async setInactive(userId: string): Promise<void> {
    const docRef = doc(db, 'presences', userId)
    await updateDoc(docRef, { isActive: false, lastSeen: serverTimestamp() })
  }

  async getActivePresences(): Promise<Presence[]> {
    const q = query(collection(db, 'presences'), where('isActive', '==', true))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => toPresence(d.id, d.data() as Record<string, unknown>))
  }

  listenToActivePresences(callback: (presences: Presence[]) => void): () => void {
    const q = query(collection(db, 'presences'), where('isActive', '==', true))
    return onSnapshot(q, (snapshot) => {
      const presences = snapshot.docs.map((d) =>
        toPresence(d.id, d.data() as Record<string, unknown>)
      )
      callback(presences)
    })
  }
}
