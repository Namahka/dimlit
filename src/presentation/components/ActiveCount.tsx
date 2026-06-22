'use client'

export function ActiveCount({ count }: { count: number }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-5 py-2 rounded-full text-sm font-medium select-none bg-white/90 text-violet-700 border border-violet-200 backdrop-blur-sm shadow-sm">
      {count === 0 ? "You're not alone"
        : count === 1 ? '1 person is here with you'
        : `${count} people awake right now`}
    </div>
  )
}
