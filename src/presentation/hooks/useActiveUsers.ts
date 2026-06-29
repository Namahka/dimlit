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
    // Show all isActive: true — no time filter, presence disappears on logout/close
    return presenceService.listenToActivePresences(setPresences)
  }, [userId])

  return presences
}
