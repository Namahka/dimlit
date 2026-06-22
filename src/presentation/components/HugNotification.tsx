'use client'

import { useEffect } from 'react'
import type { Hug } from '../../domain/entities/Hug'

interface Props {
  hug: Hug | null
  onDismiss: () => void
}

export function HugNotification({ hug, onDismiss }: Props) {
  useEffect(() => {
    if (!hug) return
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [hug, onDismiss])

  if (!hug) return null

  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-xl text-sm font-medium text-white select-none"
      style={{
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        boxShadow: '0 0 30px rgba(124,58,237,0.4)',
      }}
    >
      🤗 Someone from {hug.fromCountry} sent you a hug
    </div>
  )
}
