'use client'

import { useState, useEffect, useRef } from 'react'
import { FirebaseHugRepository } from '../../infrastructure/repositories/FirebaseHugRepository'
import { HugService } from '../../application/services/HugService'
import type { Hug } from '../../domain/entities/Hug'

const hugRepo = new FirebaseHugRepository()
const hugService = new HugService(hugRepo)

const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useHugs(userId: string | null) {
  const [latestHug, setLatestHug] = useState<Hug | null>(null)
  const [receivedHugs, setReceivedHugs] = useState<Hug[]>([])
  const storageKey = userId ? `dimlit_sent_hugs_${userId}` : null
  const [sentMap, setSentMap] = useState<Record<string, number>>(() => {
    if (!storageKey) return {}
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}') } catch { return {} }
  })
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    const unsubscribe = hugService.listen(userId, (hugs) => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      setReceivedHugs(hugs.filter(h => h.sentAt.getTime() > cutoff).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()))
      for (const hug of hugs) {
        if (!seenIds.current.has(hug.id)) {
          seenIds.current.add(hug.id)
          if (Date.now() - hug.sentAt.getTime() < 5 * 60 * 1000) {
            setLatestHug(hug)
          }
        }
      }
    })
    return unsubscribe
  }, [userId])

  async function sendHug(toUserId: string, fromCountry: string, fromUsername = '') {
    if (!userId) return
    const lastSent = sentMap[toUserId]
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) return
    await hugService.send(userId, toUserId, fromCountry, fromUsername)
    setSentMap(prev => {
      const next = { ...prev, [toUserId]: Date.now() }
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  function canSendHug(toUserId: string): boolean {
    const lastSent = sentMap[toUserId]
    return !lastSent || Date.now() - lastSent >= COOLDOWN_MS
  }

  function clearLatestHug() { setLatestHug(null) }

  return { latestHug, receivedHugs, sendHug, canSendHug, clearLatestHug }
}
