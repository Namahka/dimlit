'use client'

const tips = [
  { title: 'Box Breathing', description: 'Breathe in for 4 seconds. Hold for 4. Breathe out for 4. Hold for 4. Repeat 4 times.' },
  { title: '5-4-3-2-1 Grounding', description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.' },
  { title: 'Progressive Muscle Relaxation', description: 'Tense each muscle group for 5 seconds, then release. Start at your feet and work up to your face.' },
  { title: 'Cold Water Reset', description: 'Splash cold water on your face or hold an ice cube. This activates the dive reflex and slows your heart rate.' },
  { title: 'Write It Down', description: "Put your thoughts on paper. Anxiety lives in loops — writing externalizes them. You don't need to solve anything." },
  { title: 'Allow the Wakefulness', description: "Fighting being awake increases anxiety. Tell yourself: 'I'm awake, and that's okay. I'll rest when my body is ready.'" },
  { title: 'Body Scan', description: 'Lie still and slowly move your attention from your toes to the top of your head. Notice sensations without judging them.' },
  { title: '4-7-8 Breathing', description: 'Inhale for 4 counts, hold for 7, exhale slowly for 8. The long exhale activates the vagus nerve.' },
]

export function TipsTab() {
  return (
    <div style={{ background: '#faf7f0', minHeight: '100%' }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Tips for Anxious Nights</h2>
        <p className="text-sm text-stone-400 mt-0.5">Techniques that actually work at 3am.</p>
      </div>
      <div className="px-5 py-4 space-y-3 pb-10">
        {tips.map((tip) => (
          <div key={tip.title} className="px-4 py-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
            <h3 className="font-semibold text-sm text-stone-800 mb-1">{tip.title}</h3>
            <p className="text-sm leading-relaxed text-stone-500">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
