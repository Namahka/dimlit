'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../../infrastructure/firebase/firebaseApp'
import type { Hug } from '../../domain/entities/Hug'

function toHug(id: string, data: Record<string, unknown>): Hug {
  const sentAt = data.sentAt instanceof Timestamp
    ? data.sentAt.toDate()
    : data.sentAt ? new Date(data.sentAt as string | number) : new Date()
  return {
    id,
    fromUserId: data.fromUserId as string,
    toUserId: data.toUserId as string,
    fromUsername: (data.fromUsername as string | undefined) ?? (data.fromCountry as string),
    fromCountry: data.fromCountry as string,
    sentAt,
  }
}

const COOLDOWN = 24 * 60 * 60 * 1000

export function useHugs(userId: string | null) {
  const [latestHug, setLatestHug] = useState<Hug | null>(null)
  const [receivedHugs, setReceivedHugs] = useState<Hug[]>([])
  const [sentMap, setSentMap] = useState<Record<string, number>>({})
  const seenIds = useRef<Set<string>>(new Set())

  // Load sentMap from localStorage when userId is known
  useEffect(() => {
    if (!userId) return
    try {
      const stored = localStorage.getItem(`dimlit_sent_hugs_${userId}`)
      if (stored) setSentMap(JSON.parse(stored))
    } catch {}
  }, [userId])

  // Listen for received hugs
  useEffect(() => {
    if (!userId) return
    seenIds.current = new Set() // reset on userId change

    const q = query(collection(db, 'hugs'), where('toUserId', '==', userId))
    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now()
      const cutoff24h = now - 24 * 60 * 60 * 1000

      const hugs = snap.docs
        .map(d => toHug(d.id, d.data() as Record<string, unknown>))
        .filter(h => h.sentAt.getTime() > cutoff24h)
        .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())

      setReceivedHugs(hugs)

      // Check for new hugs to notify
      for (const hug of hugs) {
        if (!seenIds.current.has(hug.id)) {
          seenIds.current.add(hug.id)
          if (now - hug.sentAt.getTime() < 30_000) {
            setLatestHug(hug)
          }
        }
      }
    }, (err) => console.error('hugs listener error:', err))

    return unsub
  }, [userId])

  async function sendHug(toUserId: string, fromCountry: string, fromUsername = '') {
    if (!userId) return
    const lastSent = sentMap[toUserId]
    if (lastSent && Date.now() - lastSent < COOLDOWN) return

    await addDoc(collection(db, 'hugs'), {
      fromUserId: userId,
      toUserId,
      fromUsername,
      fromCountry,
      sentAt: serverTimestamp(),
    })

    setSentMap(prev => {
      const next = { ...prev, [toUserId]: Date.now() }
      localStorage.setItem(`dimlit_sent_hugs_${userId}`, JSON.stringify(next))
      return next
    })
  }

  function canSendHug(toUserId: string) {
    const last = sentMap[toUserId]
    return !last || Date.now() - last >= COOLDOWN
  }

  function clearLatestHug() { setLatestHug(null) }

  return { latestHug, receivedHugs, sendHug, canSendHug, clearLatestHug }
}
