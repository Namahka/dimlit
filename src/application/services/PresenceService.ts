import { SetPresenceActive } from '../../domain/usecases/SetPresenceActive'
import { SetPresenceInactive } from '../../domain/usecases/SetPresenceInactive'
import { GetActivePresences } from '../../domain/usecases/GetActivePresences'
import type { IPresenceRepository } from '../../domain/repositories/IPresenceRepository'
import type { Presence } from '../../domain/entities/Presence'

const COORD_PRECISION = 1 // rounds to ~10 km

function round(val: number, precision: number): number {
  return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision)
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
      latitude: round(coords.latitude, COORD_PRECISION),
      longitude: round(coords.longitude, COORD_PRECISION),
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
