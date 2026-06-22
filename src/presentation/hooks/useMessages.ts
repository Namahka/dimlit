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
    return repo.listenToMessages(setMessages)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addMessage(text: string, country: string) {
    if (!user || !text.trim()) return
    setSending(true)
    setSendError(null)
    try {
      await repo.addMessage({ userId: user.id, text: text.trim(), country, createdAt: new Date() })
    } catch (e) {
      setSendError('Could not send — check Firestore rules.')
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  return { messages, sending, sendError, addMessage }
}
