'use client'

import { useState, useEffect } from 'react'
import { FirebasePresenceRepository } from '../../infrastructure/repositories/FirebasePresenceRepository'
import { PresenceService } from '../../application/services/PresenceService'
import type { Presence } from '../../domain/entities/Presence'

const presenceRepo = new FirebasePresenceRepository()
const presenceService = new PresenceService(presenceRepo)

const DEMO_PRESENCES: Presence[] = [
  { id: 'demo-1', userId: 'demo-1', username: 'Maya', country: 'SE', city: 'Bromma', latitude: 59.34, longitude: 17.94, isActive: true, lastSeen: new Date() },
  { id: 'demo-2', userId: 'demo-2', username: 'Erik', country: 'SE', city: 'Spånga', latitude: 59.38, longitude: 17.90, isActive: true, lastSeen: new Date() },
  { id: 'demo-3', userId: 'demo-3', username: 'Lena', country: 'SE', city: 'Vällingby', latitude: 59.36, longitude: 17.87, isActive: true, lastSeen: new Date() },
  { id: 'demo-4', userId: 'demo-4', username: 'Frida', country: 'SE', city: 'Kista', latitude: 59.40, longitude: 17.95, isActive: true, lastSeen: new Date() },
  { id: 'demo-5', userId: 'demo-5', username: 'Oscar', country: 'SE', city: 'Sundbyberg', latitude: 59.37, longitude: 17.97, isActive: true, lastSeen: new Date() },
  { id: 'demo-6', userId: 'demo-6', username: 'Saga', country: 'SE', city: 'Solna', latitude: 59.36, longitude: 18.00, isActive: true, lastSeen: new Date() },
  { id: 'demo-7', userId: 'demo-7', username: 'Nils', country: 'SE', city: 'Hässelby', latitude: 59.37, longitude: 17.84, isActive: true, lastSeen: new Date() },
  { id: 'demo-8', userId: 'demo-8', username: 'Elin', country: 'SE', city: 'Tensta', latitude: 59.39, longitude: 17.91, isActive: true, lastSeen: new Date() },
]

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
