// Tests for pure utility functions

// --- timeAgo ---
function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

describe('timeAgo', () => {
  it('returns "just now" for recent timestamps', () => {
    expect(timeAgo(new Date(Date.now() - 30_000))).toBe('just now')
  })
  it('returns minutes for 1-59 min ago', () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60_000))).toBe('5m ago')
  })
  it('returns hours for 1-23h ago', () => {
    expect(timeAgo(new Date(Date.now() - 3 * 3600_000))).toBe('3h ago')
  })
  it('returns days for 24h+ ago', () => {
    expect(timeAgo(new Date(Date.now() - 2 * 86400_000))).toBe('2d ago')
  })
})

// --- Auth error messages ---
function getErr(e: unknown): string {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code ?? ''
    if (code === 'auth/email-already-in-use') return 'This email is already in use.'
    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') return 'Incorrect email or password.'
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
    if (code === 'auth/invalid-email') return 'Invalid email address.'
    if (code === 'auth/popup-closed-by-user') return ''
    return e.message
  }
  return 'Something went wrong.'
}

describe('getErr', () => {
  it('handles email already in use', () => {
    const err = Object.assign(new Error(''), { code: 'auth/email-already-in-use' })
    expect(getErr(err)).toBe('This email is already in use.')
  })
  it('handles wrong password', () => {
    const err = Object.assign(new Error(''), { code: 'auth/wrong-password' })
    expect(getErr(err)).toBe('Incorrect email or password.')
  })
  it('handles invalid credential', () => {
    const err = Object.assign(new Error(''), { code: 'auth/invalid-credential' })
    expect(getErr(err)).toBe('Incorrect email or password.')
  })
  it('handles popup closed silently', () => {
    const err = Object.assign(new Error(''), { code: 'auth/popup-closed-by-user' })
    expect(getErr(err)).toBe('')
  })
  it('handles unknown errors', () => {
    expect(getErr('something')).toBe('Something went wrong.')
  })
})

// --- Quiz scoring ---
function getScore(score: number, total: number): string {
  const pct = score / total
  if (pct >= 0.9) return 'Expert'
  if (pct >= 0.75) return 'Very Impressive'
  if (pct >= 0.5) return 'Solid Knowledge'
  if (pct >= 0.25) return 'Casual Fan'
  return 'Try again!'
}

describe('getScore', () => {
  it('returns Expert for 90%+', () => {
    expect(getScore(18, 20)).toBe('Expert')
    expect(getScore(20, 20)).toBe('Expert')
  })
  it('returns Very Impressive for 75-89%', () => {
    expect(getScore(15, 20)).toBe('Very Impressive')
  })
  it('returns Solid Knowledge for 50-74%', () => {
    expect(getScore(10, 20)).toBe('Solid Knowledge')
  })
  it('returns Casual Fan for 25-49%', () => {
    expect(getScore(5, 20)).toBe('Casual Fan')
  })
  it('returns Try again for <25%', () => {
    expect(getScore(4, 20)).toBe('Try again!')
  })
})

// --- Hug cooldown ---
const COOLDOWN_MS = 24 * 60 * 60 * 1000

function canSendHug(sentMap: Record<string, number>, toUserId: string): boolean {
  const last = sentMap[toUserId]
  return !last || Date.now() - last >= COOLDOWN_MS
}

describe('canSendHug cooldown', () => {
  it('allows sending when no previous hug', () => {
    expect(canSendHug({}, 'user-1')).toBe(true)
  })
  it('blocks within 24h', () => {
    const map = { 'user-1': Date.now() - 1000 }
    expect(canSendHug(map, 'user-1')).toBe(false)
  })
  it('allows after 24h', () => {
    const map = { 'user-1': Date.now() - COOLDOWN_MS - 1000 }
    expect(canSendHug(map, 'user-1')).toBe(true)
  })
  it('only blocks the specific user', () => {
    const map = { 'user-1': Date.now() - 1000 }
    expect(canSendHug(map, 'user-2')).toBe(true)
  })
})

// --- Message 12h filter ---
describe('message 12h filter', () => {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000
  const filterMessages = (msgs: { id: string; createdAt: Date }[]) =>
    msgs.filter(m => Date.now() - m.createdAt.getTime() < TWELVE_HOURS)

  it('keeps recent messages', () => {
    const msgs = [{ id: '1', createdAt: new Date(Date.now() - 1000) }]
    expect(filterMessages(msgs)).toHaveLength(1)
  })
  it('removes messages older than 12h', () => {
    const msgs = [{ id: '1', createdAt: new Date(Date.now() - TWELVE_HOURS - 1000) }]
    expect(filterMessages(msgs)).toHaveLength(0)
  })
  it('keeps mix correctly', () => {
    const msgs = [
      { id: '1', createdAt: new Date(Date.now() - 1000) },
      { id: '2', createdAt: new Date(Date.now() - TWELVE_HOURS - 1000) },
    ]
    expect(filterMessages(msgs)).toHaveLength(1)
    expect(filterMessages(msgs)[0].id).toBe('1')
  })
})

// --- Presence location obscuring ---
function hashOffset(userId: string, seed: number): number {
  let h = seed * 31
  for (let i = 0; i < userId.length; i++) {
    h = Math.imul(h ^ userId.charCodeAt(i), 0x9e3779b9)
  }
  return ((h >>> 0) % 101 - 50) / 1000
}

describe('hashOffset (location privacy)', () => {
  it('returns consistent value for same userId', () => {
    const a = hashOffset('user-abc', 1)
    const b = hashOffset('user-abc', 1)
    expect(a).toBe(b)
  })
  it('returns different values for different seeds', () => {
    const lat = hashOffset('user-abc', 1)
    const lng = hashOffset('user-abc', 2)
    expect(lat).not.toBe(lng)
  })
  it('returns different offsets for different users', () => {
    const a = hashOffset('user-1', 1)
    const b = hashOffset('user-2', 1)
    expect(a).not.toBe(b)
  })
  it('offset is within ±0.05 range', () => {
    for (let i = 0; i < 20; i++) {
      const offset = hashOffset(`user-${i}`, 1)
      expect(Math.abs(offset)).toBeLessThanOrEqual(0.05)
    }
  })
})

// --- Quiz answer distribution ---
import { popCultureQuestions } from '../presentation/components/tabs/quiz/popCultureQuiz'
import { tvSeriesQuestions } from '../presentation/components/tabs/quiz/tvSeriesQuiz'
import { movieQuestions } from '../presentation/components/tabs/quiz/movieQuiz'
import { celebrityQuestions } from '../presentation/components/tabs/quiz/celebrityQuiz'
import { gamingQuestions } from '../presentation/components/tabs/quiz/gamingQuiz'
import { ninetiesQuestions } from '../presentation/components/tabs/quiz/ninetiesQuiz'

const allQuizzes = [
  { name: 'Pop Culture', questions: popCultureQuestions },
  { name: 'TV Series', questions: tvSeriesQuestions },
  { name: 'Movies', questions: movieQuestions },
  { name: 'Celebrity', questions: celebrityQuestions },
  { name: 'Gaming', questions: gamingQuestions },
  { name: 'Nineties', questions: ninetiesQuestions },
]

describe('Quiz integrity', () => {
  allQuizzes.forEach(({ name, questions }) => {
    describe(name, () => {
      it('has exactly 20 questions', () => {
        expect(questions).toHaveLength(20)
      })
      it('all questions have 4 options', () => {
        questions.forEach((q, i) => {
          expect(q.options).toHaveLength(4), `Q${i + 1}`
        })
      })
      it('all correctIndex values are 0-3', () => {
        questions.forEach((q, i) => {
          expect(q.correctIndex).toBeGreaterThanOrEqual(0), `Q${i + 1}`
          expect(q.correctIndex).toBeLessThanOrEqual(3), `Q${i + 1}`
        })
      })
      it('has no duplicate questions', () => {
        const texts = questions.map(q => q.question)
        const unique = new Set(texts)
        expect(unique.size).toBe(questions.length)
      })
      it('answers are distributed across all positions', () => {
        const counts = [0, 0, 0, 0]
        questions.forEach(q => counts[q.correctIndex]++)
        counts.forEach(c => expect(c).toBeGreaterThan(0))
      })
    })
  })
})
