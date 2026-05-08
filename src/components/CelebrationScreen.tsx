import { useEffect, useState } from 'react'
import { getRandomPhrase } from '../utils/phrases'

interface Props {
  onClose: () => void
}

export default function CelebrationScreen({ onClose }: Props) {
  const [phrase] = useState(getRandomPhrase)

  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
      style={{
        background:
          'radial-gradient(ellipse at 50% 30%, #4f46e5 0%, #312e81 40%, #0f172a 100%)',
      }}
      onClick={onClose}
    >
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 px-8 text-center">
        {/* Big emoji */}
        <div className="animate-confetti text-8xl select-none">🎉</div>

        {/* Completion badge */}
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-sm">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold text-white/90">¡100% Completado!</span>
        </div>

        {/* Motivational phrase */}
        <h1 className="text-2xl font-bold leading-snug text-white drop-shadow-lg sm:text-3xl">
          {phrase}
        </h1>

        {/* Streak hint */}
        <p className="text-sm text-white/60">Toca para continuar</p>
      </div>
    </div>
  )
}
