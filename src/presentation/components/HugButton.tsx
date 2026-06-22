'use client'

interface Props {
  onSend: () => void
  disabled?: boolean
}

export function HugButton({ onSend, disabled }: Props) {
  return (
    <button
      onClick={onSend}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
    >
      <span>🤗</span>
      Send a hug
    </button>
  )
}
