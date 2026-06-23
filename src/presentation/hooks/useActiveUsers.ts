'use client'

import { useState, useEffect } from 'react'
import { FirebasePresenceRepository } from '../../infrastructure/repositories/FirebasePresenceRepository'
import { PresenceService } from '../../application/services/PresenceService'
import type { Presence } from '../../domain/entities/Presence'

const presenceRepo = new FirebasePresenceRepository()
const presenceService = new PresenceService(presenceRepo)

export function useActiveUsers(userId: string | null) {
  const [presences, setPresences] = useState<Presence[]>([])

  useEffect(() => {
    if (!userId) return
    return presenceService.listenToActivePresences((all) => {
      const cutoff = Date.now() - 10 * 60 * 1000 // disappear after 10 min inactivity
      setPresences(all.filter(p => p.lastSeen.getTime() > cutoff))
    })
  }, [userId])

  return presences
}
