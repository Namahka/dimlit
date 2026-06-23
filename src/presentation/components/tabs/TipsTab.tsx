'use client'

const tips = [
  { title: 'Box Breathing', quote: '"Breath control is the master key to regulating the autonomic nervous system — and box breathing is one of the most reliable tools we have."', source: 'Dr. Andrew Huberman, Stanford neuroscientist', how: 'Inhale 4 counts. Hold 4. Exhale 4. Hold 4. Repeat 4 times.' },
  { title: '5-4-3-2-1 Grounding', quote: '"Grounding techniques work by engaging the senses to interrupt the anxiety loop and bring you back to the present moment."', source: 'Dr. Bessel van der Kolk, The Body Keeps the Score (2014)', how: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.' },
  { title: 'Cold Water Reset', quote: '"Activating the dive reflex with cold water on the face is one of the fastest ways to reduce heart rate within seconds."', source: 'Marsha Linehan, developer of DBT', how: 'Splash cold water on your face or hold ice cubes. Hold your breath while doing it.' },
  { title: '4-7-8 Breathing', quote: '"4-7-8 breathing acts as a natural tranquilizer for the nervous system. The extended exhale activates the parasympathetic response."', source: 'Dr. Andrew Weil, University of Arizona', how: 'Inhale 4 counts. Hold 7. Exhale slowly for 8. Repeat 4 cycles.' },
  { title: 'Write It Down', quote: '"Expressive writing reduces intrusive thoughts about negative events and improves working memory."', source: 'Dr. James Pennebaker, University of Texas at Austin (1997)', how: "Write whatever is in your head without editing. You don't need to solve anything." },
  { title: 'Allow the Wakefulness', quote: '"The harder you try to sleep, the more awake you become. Sleep effort is the enemy of sleep."', source: 'Dr. Matthew Walker, Why We Sleep (2017)', how: "Tell yourself: 'I'm awake. That's okay. My body will rest when it's ready.'" },
  { title: 'Progressive Muscle Relaxation', quote: '"Systematic tension and release of muscle groups teaches the body to recognize and reduce physical tension associated with anxiety."', source: 'Dr. Edmund Jacobson, Progressive Relaxation (1929)', how: 'Tense each muscle group for 5 seconds, then release. Start at your feet, work up.' },
  { title: 'Name the Feeling', quote: '"Affect labeling — putting feelings into words — reduces the response in the amygdala and helps regulate emotional distress."', source: 'Dr. Matthew Lieberman, UCLA, NeuroImage Journal (2007)', how: 'Say out loud or write: "I feel anxious." Naming the emotion is enough to reduce its intensity.' },
]

export function TipsTab() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Tips for Regulating Anxiety</h2>
      </div>
      <div className="px-5 py-4 space-y-4 pb-10">
        {tips.map((tip) => (
          <div key={tip.title} className="px-4 py-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>{tip.title}</h3>
            <p className="text-sm leading-relaxed italic mb-2" style={{ color: 'var(--text-muted)' }}>{tip.quote}</p>
            <p className="text-xs mb-3" style={{ color: '#555' }}>— {tip.source}</p>
            <div className="rounded-xl px-3 py-2" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}><span className="font-medium" style={{ color: 'var(--text)' }}>How: </span>{tip.how}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
