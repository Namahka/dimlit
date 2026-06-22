'use client'

import { useState, useEffect } from 'react'
import { FirebasePresenceRepository } from '../../infrastructure/repositories/FirebasePresenceRepository'
import { PresenceService } from '../../application/services/PresenceService'
import type { Presence } from '../../domain/entities/Presence'

const presenceRepo = new FirebasePresenceRepository()
const presenceService = new PresenceService(presenceRepo)

const DEMO_PRESENCES: Presence[] = []

export function useActiveUsers(userId: string | null) {
  const [realPresences, setRealPresences] = useState<Presence[]>([])

  useEffect(() => {
    if (!userId) return
    return presenceService.listenToActivePresences(setRealPresences)
  }, [userId])

  // Merge real presences with demo ones, excluding demo slots taken by real users
  const realIds = new Set(realPresences.map((p) => p.userId))
  const filteredDemo = DEMO_PRESENCES.filter((d) => !realIds.has(d.userId))

  return [...realPresences, ...filteredDemo]
}
