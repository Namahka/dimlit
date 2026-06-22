import type { IPresenceRepository } from '../repositories/IPresenceRepository'
import type { Presence } from '../entities/Presence'

export class GetActivePresences {
  constructor(private readonly presenceRepo: IPresenceRepository) {}

  async execute(): Promise<Presence[]> {
    return this.presenceRepo.getActivePresences()
  }
}
