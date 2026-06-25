'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Presence } from '../../../domain/entities/Presence'

function SetView({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.setView(coords, 10) }, [coords[0], coords[1], map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100)
    const t2 = setTimeout(() => map.invalidateSize(), 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [map])
  return null
}

function AutoClose({ trigger }: { trigger: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!trigger) return
    const t = setTimeout(() => map.closePopup(), 1500)
    return () => clearTimeout(t)
  }, [trigger, map])
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
          worldCopyJump={false}
          zoomControl={false}
          maxZoom={10}
          maxBounds={[[-85, -180], [85, 180]]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <InvalidateSize />
          {userCoords && <SetView coords={userCoords} />}
          <AutoClose trigger={sentTo.size > 0} />
          {presences.map((p) => (
            <CircleMarker
              key={p.userId}
              center={[p.latitude, p.longitude]}
              radius={p.userId === userId ? 6 : 5}
              pathOptions={{
                color: p.isAnonymous ? '#4ade80' : p.userId === userId ? '#e87c28' : '#e87c28',
                fillColor: p.isAnonymous ? '#4ade80' : p.userId === userId ? '#fbbf7a' : '#e87c28',
                fillOpacity: p.userId === userId ? 0.5 : 0.9,
                weight: p.userId === userId ? 3 : 2,
              }}
            >
              <Popup>
                <div className="flex flex-col gap-2 items-center text-sm min-w-[120px]">
                  {p.userId === userId ? (
                    <span className="text-xs" style={{ color: '#888' }}>You ({p.username})</span>
                  ) : (
                    <>
                      <span className="font-semibold text-xs" style={{ color: '#1a1a1a' }}>{p.username}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleHug(p.userId) }}
                        disabled={sentTo.has(p.userId)}
                        className="px-3 py-1.5 rounded-full text-xs text-white font-medium disabled:opacity-60"
                        style={{ background: '#e87c28' }}>
                        {sentTo.has(p.userId) ? '✓ Hug sent' : 'Send a hug'}
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
