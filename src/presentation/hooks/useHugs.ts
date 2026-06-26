'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../../infrastructure/firebase/firebaseApp'
import { FirebaseHugRepository } from '../../infrastructure/repositories/FirebaseHugRepository'
import { HugService } from '../../application/services/HugService'
import type { Hug } from '../../domain/entities/Hug'

const hugRepo = new FirebaseHugRepository()
const hugService = new HugService(hugRepo)

const COOLDOWN_MS = 24 * 60 * 60 * 1000

export function useHugs(userId: string | null) {
  const [latestHug, setLatestHug] = useState<Hug | null>(null)
  const [receivedHugs, setReceivedHugs] = useState<Hug[]>([])
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const [sentTimes, setSentTimes] = useState<Record<string, number>>({})
  const seenIds = useRef<Set<string>>(new Set())

  // Load sent hugs from Firestore on mount so 24h cooldown persists across sessions
  useEffect(() => {
    if (!userId) return
    const cutoff = new Date(Date.now() - COOLDOWN_MS)
    getDocs(query(
      collection(db, 'hugs'),
      where('fromUserId', '==', userId),
      where('sentAt', '>=', Timestamp.fromDate(cutoff))
    )).then(snap => {
      const toSet = new Set<string>()
      const times: Record<string, number> = {}
      snap.docs.forEach(d => {
        const toId = d.data().toUserId as string
        const sentAt = d.data().sentAt instanceof Timestamp
          ? d.data().sentAt.toDate().getTime() : Date.now()
        toSet.add(toId)
        times[toId] = sentAt
      })
      setSentTo(toSet)
      setSentTimes(times)
    }).catch(() => {})
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const process = (hugs: Hug[]) => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      const recent = hugs.filter(h => h.sentAt.getTime() > cutoff)
        .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      setReceivedHugs(recent)
      for (const hug of recent) {
        if (!seenIds.current.has(hug.id)) {
          seenIds.current.add(hug.id)
          if (Date.now() - hug.sentAt.getTime() < 5 * 60 * 1000) {
            setLatestHug(hug)
          }
        }
      }
    }
    return hugService.listen(userId, process)
  }, [userId])

  // 5: Can send hug — false if already sent within 24h this session
  function canSendHug(toUserId: string): boolean {
    const last = sentTimes[toUserId]
    return !last || Date.now() - last >= COOLDOWN_MS
  }

  // 1: Send hug — returns true if actually sent
  async function sendHug(toUserId: string, fromCountry: string, fromUsername = ''): Promise<boolean> {
    if (!userId) return false
    if (!canSendHug(toUserId)) return false
    try {
      await hugService.send(userId, toUserId, fromCountry, fromUsername)
      setSentTo(prev => new Set(prev).add(toUserId))
      setSentTimes(prev => ({ ...prev, [toUserId]: Date.now() }))
      return true
    } catch (e) {
      console.error('sendHug failed:', e)
      return false
    }
  }

  function clearLatestHug() { setLatestHug(null) }

  return { latestHug, receivedHugs, sendHug, canSendHug, sentTo, clearLatestHug }
}
