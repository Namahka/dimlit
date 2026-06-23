import { SetPresenceActive } from '../../domain/usecases/SetPresenceActive'
import { SetPresenceInactive } from '../../domain/usecases/SetPresenceInactive'
import { GetActivePresences } from '../../domain/usecases/GetActivePresences'
import type { IPresenceRepository } from '../../domain/repositories/IPresenceRepository'
import type { Presence } from '../../domain/entities/Presence'

// Round to 1 decimal (~11km) for privacy, then add a small consistent
// per-user offset (±0.04°, ~4km) so nearby users don't stack on the same dot.
function hashOffset(userId: string, seed: number): number {
  let h = seed * 31
  for (let i = 0; i < userId.length; i++) {
    h = Math.imul(h ^ userId.charCodeAt(i), 0x9e3779b9)
  }
  return ((h >>> 0) % 101 - 50) / 1000 // range: -0.050 to +0.050 (~5km)
}

function obscure(val: number, userId: string, axis: number): number {
  const rounded = Math.round(val * 10) / 10
  return Math.round((rounded + hashOffset(userId, axis)) * 100) / 100
}

export class PresenceService {
  private readonly setActive: SetPresenceActive
  private readonly setInactive: SetPresenceInactive
  private readonly getActive: GetActivePresences

  constructor(private readonly presenceRepo: IPresenceRepository) {
    this.setActive = new SetPresenceActive(presenceRepo)
    this.setInactive = new SetPresenceInactive(presenceRepo)
    this.getActive = new GetActivePresences(presenceRepo)
  }

  async markActive(
    userId: string,
    username: string,
    coords: GeolocationCoordinates,
    country: string,
    city?: string
  ): Promise<void> {
    const presence: Presence = {
      id: userId,
      userId,
      username,
      country,
      city,
      latitude: obscure(coords.latitude, userId, 1),
      longitude: obscure(coords.longitude, userId, 2),
      isActive: true,
      lastSeen: new Date(),
    }
    await this.setActive.execute(presence)
  }

  async markInactive(userId: string): Promise<void> {
    await this.setInactive.execute(userId)
  }

  async getActivePresences(): Promise<Presence[]> {
    return this.getActive.execute()
  }

  listenToActivePresences(callback: (presences: Presence[]) => void): () => void {
    return this.presenceRepo.listenToActivePresences(callback)
  }
}
