'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { DotMarker } from './DotMarker'
import { ActiveCount } from './ActiveCount'
import { HugNotification } from './HugNotification'
import { LoginScreen } from './LoginScreen'
import { useActiveUsers } from '../hooks/useActiveUsers'
import { usePresence } from '../hooks/usePresence'
import { useHugs } from '../hooks/useHugs'
import { useAuth } from '../hooks/useAuth'

export function Map() {
  const { user, error: authError, signInWithGoogle, signInWithEmail, register, signOut } = useAuth()
  const presences = useActiveUsers(user?.id ?? null)
  const { country, isReady, locationDenied, requestLocation } = usePresence(user ?? null)
  const { latestHug, sendHug, clearLatestHug } = useHugs(user?.id ?? null)

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 text-sm">
        Laddar…
      </div>
    )
  }

  if (user === null) {
    return (
      <LoginScreen
        onGoogle={signInWithGoogle}
        onEmailSignIn={signInWithEmail}
        onRegister={register}
        error={authError}
      />
    )
  }

  async function handleSendHug(toUserId: string) {
    await sendHug(toUserId, country)
  }

  return (
    <div className="relative w-full h-full">
      <ActiveCount count={presences.length} />

      <button
        onClick={signOut}
        className="absolute top-4 right-4 z-[1000] text-xs text-slate-400 hover:text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
      >
        Logga ut
      </button>

      {locationDenied && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800 text-white px-5 py-3 rounded-2xl text-sm flex items-center gap-3 shadow-lg">
          <span>Din plats behövs för att synas på kartan.</span>
          <button
            onClick={requestLocation}
            className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            Tillåt plats
          </button>
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        className="w-full h-full"
        style={{ background: '#0f172a' }}
        worldCopyJump
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {isReady &&
          presences.map((p) => (
            <DotMarker
              key={p.userId}
              presence={p}
              isCurrentUser={p.userId === user.id}
              onSendHug={handleSendHug}
            />
          ))}
      </MapContainer>

      <HugNotification hug={latestHug} onDismiss={clearLatestHug} />
    </div>
  )
}
