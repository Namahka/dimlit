'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Presence } from '../../../domain/entities/Presence'

function SetView({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.setView(coords, 11) }, [coords, map])
  return null
}

import { useState } from 'react'

interface Props {
  presences: Presence[]
  userId: string
  userCoords: [number, number] | null
  isReady: boolean
  onSendHug: (toUserId: string) => Promise<void>
}

export function MapCardInner({ presences, userId, userCoords, isReady, onSendHug }: Props) {
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())

  async function handleHug(toUserId: string) {
    await onSendHug(toUserId)
    setSentTo(prev => new Set(prev).add(toUserId))
  }
  return (
    // maxWidth + margin auto = only the map is centered, nothing else
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="overflow-hidden w-full" style={{ height: 480, border: '1px solid #d6d3cc', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          {userCoords && <SetView coords={userCoords} />}
          {presences.map((p) => (
            <CircleMarker
              key={p.userId}
              center={[p.latitude, p.longitude]}
              radius={p.userId === userId ? 10 : 8}
              pathOptions={{
                color: p.userId === userId ? '#a78bfa' : '#7c3aed',
                fillColor: p.userId === userId ? '#c4b5fd' : '#a78bfa',
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div className="flex flex-col gap-2 items-center text-sm min-w-[120px]">
                  {p.userId === userId ? (
                    <span className="text-gray-500 text-xs">You ({p.username})</span>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-800">{p.username}</span>
                      <span className="text-gray-400 text-xs">{p.city ?? p.country}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleHug(p.userId) }}
                        disabled={sentTo.has(p.userId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white font-medium disabled:opacity-60"
                        style={{ background: sentTo.has(p.userId) ? '#a78bfa' : '#7c3aed' }}>
                        {sentTo.has(p.userId) ? '✓ Hug sent' : '🤗 Send a hug'}
                      </button>
                    </>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
