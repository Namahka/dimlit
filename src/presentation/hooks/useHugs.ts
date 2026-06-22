'use client'

import { useState, useEffect, useRef } from 'react'
import { FirebaseHugRepository } from '../../infrastructure/repositories/FirebaseHugRepository'
import { HugService } from '../../application/services/HugService'
import type { Hug } from '../../domain/entities/Hug'

const hugRepo = new FirebaseHugRepository()
const hugService = new HugService(hugRepo)

export function useHugs(userId: string | null) {
  const [latestHug, setLatestHug] = useState<Hug | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return

    const unsubscribe = hugService.listen(userId, (hugs) => {
      for (const hug of hugs) {
        if (!seenIds.current.has(hug.id)) {
          seenIds.current.add(hug.id)
          // Only surface hugs that arrived after the listener started (within last 30s)
          if (Date.now() - hug.sentAt.getTime() < 30_000) {
            setLatestHug(hug)
          }
        }
      }
    })

    return unsubscribe
  }, [userId])

  async function sendHug(toUserId: string, fromCountry: string) {
    if (!userId) return
    await hugService.send(userId, toUserId, fromCountry)
  }

  function clearLatestHug() {
    setLatestHug(null)
  }

  return { latestHug, sendHug, clearLatestHug }
}
