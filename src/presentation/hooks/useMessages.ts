'use client'

import { useState, useEffect } from 'react'
import { FirebaseMessageRepository } from '../../infrastructure/repositories/FirebaseMessageRepository'
import type { Message } from '../../domain/entities/Message'
import type { User } from '../../domain/entities/User'

const repo = new FirebaseMessageRepository()

export function useMessages(user: User | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    return repo.listenToMessages((all) => {
      const cutoff = Date.now() - 12 * 60 * 60 * 1000
      setMessages(all.filter(m => m.createdAt.getTime() > cutoff))
    })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addMessage(text: string, country: string) {
    if (!user || !text.trim()) return
    setSending(true)
    setSendError(null)
    try {
      await repo.addMessage({ userId: user.id, username: user.username, text: text.trim(), country, createdAt: new Date() } as Omit<import('../../domain/entities/Message').Message, 'id' | 'likes'>)
    } catch (e) {
      setSendError('Could not send — check Firestore rules.')
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  async function toggleLike(messageId: string, userId: string, liked: boolean) {
    await repo.toggleLike(messageId, userId, liked)
  }

  return { messages, sending, sendError, addMessage, toggleLike }
}
