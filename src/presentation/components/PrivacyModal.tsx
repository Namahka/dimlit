'use client'

interface Props {
  onClose: () => void
}

export function PrivacyModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-y-auto max-h-[85vh] p-6 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Privacy</h2>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        {[
          {
            title: 'Sign in with Google',
            body: 'dimlit uses Google Sign-In. We never see or store your password. Google authenticates you and gives us a unique ID — that\'s it. No personal profile is visible to other users.'
          },
          {
            title: 'Location',
            body: 'If you allow location access, your position is randomized by up to 5 km before being stored. Your exact address is never stored or shared. If you decline, a random position is used and you appear as Anonymous.'
          },
          {
            title: 'What we store',
            body: 'We store your chosen username, approximate location while the app is open, messages you post, and hugs you send or receive. Messages are automatically deleted after 12 hours. Hugs disappear after 24 hours.'
          },
          {
            title: 'Who can see you',
            body: 'Other users see your username and approximate location on the map while you\'re active. No email, no exact location, no real name is ever shared.'
          },
          {
            title: 'Deleting your data',
            body: 'You can delete your account at any time in Settings. This permanently removes your profile and presence data. Messages you\'ve sent may remain briefly until they expire.'
          },
          {
            title: 'Third parties',
            body: 'We use Firebase (Google) for authentication and data storage, and Brevo for transactional emails. No data is sold or shared with advertisers.'
          },
        ].map(s => (
          <div key={s.title}>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
          </div>
        ))}

        <button onClick={onClose} className="w-full py-3 rounded-2xl text-white text-sm font-medium mt-2"
          style={{ background: 'var(--accent)' }}>Close</button>
      </div>
    </div>
  )
}
