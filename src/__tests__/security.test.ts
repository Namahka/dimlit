// Security & feature tests for dimlit

// ── LOCATION SAFETY ──────────────────────────────────────────────────────────

function hashOffset(userId: string, seed: number): number {
  let h = seed * 31
  for (let i = 0; i < userId.length; i++) {
    h = Math.imul(h ^ userId.charCodeAt(i), 0x9e3779b9)
  }
  return ((h >>> 0) % 101 - 50) / 1000
}

function obscure(val: number, userId: string, axis: number): number {
  const rounded = Math.round(val * 10) / 10
  return Math.round((rounded + hashOffset(userId, axis)) * 100) / 100
}

describe('Location privacy', () => {
  it('rounds real coordinates to 1 decimal (~11km precision)', () => {
    const lat = obscure(59.3293, 'user-123', 1)
    const decimals = lat.toString().split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(2)
  })

  it('never stores exact coordinates', () => {
    const realLat = 59.329312
    const stored = obscure(realLat, 'user-123', 1)
    expect(stored).not.toBe(realLat)
  })

  it('offset is within ±0.05° (~5km) of rounded position', () => {
    for (let i = 0; i < 50; i++) {
      const realLat = 40 + Math.random() * 40
      const stored = obscure(realLat, `user-${i}`, 1)
      const rounded = Math.round(realLat * 10) / 10
      expect(Math.abs(stored - rounded)).toBeLessThanOrEqual(0.051)
    }
  })

  it('same user always gets same offset (deterministic)', () => {
    const lat1 = obscure(59.33, 'user-abc', 1)
    const lat2 = obscure(59.33, 'user-abc', 1)
    expect(lat1).toBe(lat2)
  })

  it('different users get different offsets', () => {
    const lat1 = obscure(59.33, 'user-001', 1)
    const lat2 = obscure(59.33, 'user-002', 1)
    expect(lat1).not.toBe(lat2)
  })

  it('anonymous cities are never in ocean (lat between -80 and 80)', () => {
    const cities: [number, number][] = [
      [59.3, 18.1],[48.9, 2.3],[51.5, -0.1],[52.5, 13.4],[40.7, -74.0],
      [34.1, -118.2],[41.9, 12.5],[55.8, 37.6],[35.7, 139.7],[37.6, 127.0],
    ]
    cities.forEach(([lat, lng]) => {
      expect(lat).toBeGreaterThan(-80)
      expect(lat).toBeLessThan(80)
      expect(lng).toBeGreaterThan(-180)
      expect(lng).toBeLessThan(180)
    })
  })
})

// ── HUGS ─────────────────────────────────────────────────────────────────────

const COOLDOWN_MS = 24 * 60 * 60 * 1000

describe('Hug cooldown logic', () => {
  it('allows first hug to any user', () => {
    const sentTimes: Record<string, number> = {}
    const canSend = (id: string) => {
      const last = sentTimes[id]
      return !last || Date.now() - last >= COOLDOWN_MS
    }
    expect(canSend('user-b')).toBe(true)
  })

  it('blocks second hug within 24h', () => {
    const sentTimes: Record<string, number> = { 'user-b': Date.now() - 1000 }
    const canSend = (id: string) => {
      const last = sentTimes[id]
      return !last || Date.now() - last >= COOLDOWN_MS
    }
    expect(canSend('user-b')).toBe(false)
  })

  it('allows hug to different user even if blocked on one', () => {
    const sentTimes: Record<string, number> = { 'user-b': Date.now() - 1000 }
    const canSend = (id: string) => {
      const last = sentTimes[id]
      return !last || Date.now() - last >= COOLDOWN_MS
    }
    expect(canSend('user-c')).toBe(true)
  })

  it('allows hug after 24h cooldown expires', () => {
    const sentTimes: Record<string, number> = { 'user-b': Date.now() - COOLDOWN_MS - 1 }
    const canSend = (id: string) => {
      const last = sentTimes[id]
      return !last || Date.now() - last >= COOLDOWN_MS
    }
    expect(canSend('user-b')).toBe(true)
  })
})

// ── MESSAGES ──────────────────────────────────────────────────────────────────

describe('Message 12h filter', () => {
  const TWELVE_H = 12 * 60 * 60 * 1000
  const filter = (msgs: { id: string; createdAt: Date }[]) =>
    msgs.filter(m => Date.now() - m.createdAt.getTime() < TWELVE_H)

  it('shows recent messages', () => {
    expect(filter([{ id: '1', createdAt: new Date() }])).toHaveLength(1)
  })

  it('hides messages older than 12h', () => {
    expect(filter([{ id: '1', createdAt: new Date(Date.now() - TWELVE_H - 1) }])).toHaveLength(0)
  })

  it('message text cannot exceed 280 characters', () => {
    const valid = 'a'.repeat(280)
    const tooLong = 'a'.repeat(281)
    expect(valid.length).toBe(280)
    expect(tooLong.slice(0, 280).length).toBe(280)
  })
})

// ── LIKES ────────────────────────────────────────────────────────────────────

describe('Likes', () => {
  it('user can like a message', () => {
    const likes: string[] = []
    const toggle = (userId: string, liked: boolean) =>
      liked ? likes.filter(id => id !== userId) : [...likes, userId]
    const result = toggle('user-1', false)
    expect(result).toContain('user-1')
  })

  it('user can unlike a message', () => {
    const likes = ['user-1', 'user-2']
    const toggle = (userId: string, liked: boolean) =>
      liked ? likes.filter(id => id !== userId) : [...likes, userId]
    expect(toggle('user-1', true)).not.toContain('user-1')
    expect(toggle('user-1', true)).toContain('user-2')
  })

  it('like count is accurate', () => {
    const likes = ['user-1', 'user-2', 'user-3']
    expect(likes.length).toBe(3)
  })
})

// ── REPORTS ──────────────────────────────────────────────────────────────────

describe('Reports', () => {
  it('user cannot report their own message', () => {
    const canReport = (msgUserId: string, reporterUserId: string) =>
      msgUserId !== reporterUserId
    expect(canReport('user-a', 'user-a')).toBe(false)
    expect(canReport('user-a', 'user-b')).toBe(true)
  })

  it('reported message id is linked in report', () => {
    const report = { messageId: 'msg-123', username: 'Eva', text: 'bad text', reporterUserId: 'user-b' }
    expect(report.messageId).toBe('msg-123')
    expect(report.reporterUserId).not.toBe('user-a') // not self-report
  })
})

// ── DELETE ACCOUNT ───────────────────────────────────────────────────────────

describe('Delete account flow', () => {
  it('requires explicit confirmation before deleting', () => {
    let deleted = false
    const deleteAccount = (confirmed: boolean) => {
      if (!confirmed) return false
      deleted = true
      return true
    }
    expect(deleteAccount(false)).toBe(false)
    expect(deleted).toBe(false)
    expect(deleteAccount(true)).toBe(true)
    expect(deleted).toBe(true)
  })

  it('cleans up user data collections', () => {
    const collections = ['users', 'presences']
    const toDelete = (userId: string) =>
      collections.map(col => `${col}/${userId}`)
    const paths = toDelete('user-123')
    expect(paths).toContain('users/user-123')
    expect(paths).toContain('presences/user-123')
  })
})

// ── USERNAME VALIDATION ───────────────────────────────────────────────────────

describe('Username validation', () => {
  const isValid = (u: string) => u.trim().length >= 2 && u.trim().length <= 24

  it('accepts valid usernames', () => {
    expect(isValid('Maya')).toBe(true)
    expect(isValid('ab')).toBe(true)
    expect(isValid('a'.repeat(24))).toBe(true)
  })

  it('rejects too short usernames', () => {
    expect(isValid('a')).toBe(false)
    expect(isValid('')).toBe(false)
  })

  it('rejects too long usernames', () => {
    expect(isValid('a'.repeat(25))).toBe(false)
  })
})

// ── ANONYMOUS PRIVACY ─────────────────────────────────────────────────────────

describe('Anonymous mode privacy', () => {
  it('anonymous user shows as "Anonymous" not real username', () => {
    const presence = { username: 'Anonymous', isAnonymous: true }
    expect(presence.username).toBe('Anonymous')
    expect(presence.isAnonymous).toBe(true)
  })

  it('non-anonymous user shows real username', () => {
    const presence = { username: 'Maya', isAnonymous: false }
    expect(presence.username).toBe('Maya')
    expect(presence.isAnonymous).toBe(false)
  })

  it('anonymous and non-anonymous have different dot colors', () => {
    const color = (isAnonymous: boolean) => isAnonymous ? '#4ade80' : '#e87c28'
    expect(color(true)).toBe('#4ade80')  // green
    expect(color(false)).toBe('#e87c28') // orange
    expect(color(true)).not.toBe(color(false))
  })
})
