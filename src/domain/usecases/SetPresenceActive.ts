import type { IPresenceRepository } from '../repositories/IPresenceRepository'
import type { Presence } from '../entities/Presence'

export class SetPresenceActive {
  constructor(private readonly presenceRepo: IPresenceRepository) {}

  async execute(presence: Presence): Promise<void> {
    await this.presenceRepo.setActive(presence)
  }
}
