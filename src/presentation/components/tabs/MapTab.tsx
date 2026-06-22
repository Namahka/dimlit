'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { DotMarker } from '../DotMarker'
import { HugNotification } from '../HugNotification'
import { useActiveUsers } from '../../hooks/useActiveUsers'
import { usePresence } from '../../hooks/usePresence'
import { useHugs } from '../../hooks/useHugs'
import type { User } from '../../../domain/entities/User'

function SetView({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coords, 11)
  }, [coords, map])
  return null
}

interface Props {
  user: User
  userCoords: [number, number] | null
  country: string
}

export function MapTab({ user, userCoords, country }: Props) {
  const presences = useActiveUsers(user.id)
  const { isReady, locationDenied, requestLocation } = usePresence(user)
  const { latestHug, sendHug, clearLatestHug } = useHugs(user.id)

  async function handleSendHug(toUserId: string) {
    await sendHug(toUserId, country)
  }

  return (
    <div className="bg-white min-h-full">
      {/* Active count pill */}
      <div className="px-4 pt-5 pb-3">
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-sm font-medium px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          {presences.length === 0
            ? "You're not alone in the dark"
            : presences.length === 1
            ? '1 person awake right now'
            : `${presences.length} people awake right now`}
        </div>
      </div>

      {/* Map card */}
      <div className="mx-4 rounded-3xl overflow-hidden border border-violet-100 shadow-sm" style={{ height: 320 }}>
        <MapContainer
          center={userCoords ?? [20, 0]}
          zoom={userCoords ? 11 : 3}
          minZoom={2}
          className="w-full h-full"
          style={{ background: '#1a1a2e' }}
          worldCopyJump
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          {userCoords && <SetView coords={userCoords} />}
          {isReady && presences.map((p) => (
            <DotMarker key={p.userId} presence={p} isCurrentUser={p.userId === user.id} onSendHug={handleSendHug} />
          ))}
        </MapContainer>
      </div>

      {locationDenied && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl">
          <p className="text-sm text-amber-700">Allow location to appear on the map.</p>
          <button onClick={requestLocation} className="text-xs font-medium text-white bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-full transition-colors">
            Allow
          </button>
        </div>
      )}

      {/* Who's here */}
      {presences.length > 0 && (
        <div className="px-4 mt-4">
          <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Awake now</p>
          <div className="flex flex-wrap gap-2">
            {presences.map((p) => (
              <span key={p.userId} className="text-xs bg-violet-50 border border-violet-100 text-violet-700 px-3 py-1 rounded-full">
                {p.username} · {p.country}
              </span>
            ))}
          </div>
        </div>
      )}

      <HugNotification hug={latestHug} onDismiss={clearLatestHug} />
    </div>
  )
}
