'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import { HugButton } from './HugButton'
import type { Presence } from '../../domain/entities/Presence'

interface Props {
  presence: Presence
  isCurrentUser: boolean
  onSendHug: (toUserId: string) => void
}

export function DotMarker({ presence, isCurrentUser, onSendHug }: Props) {
  return (
    <CircleMarker
      center={[presence.latitude, presence.longitude]}
      radius={isCurrentUser ? 10 : 7}
      pathOptions={{
        color: isCurrentUser ? '#a78bfa' : '#7c3aed',
        fillColor: isCurrentUser ? '#c4b5fd' : '#a78bfa',
        fillOpacity: 0.9,
        weight: isCurrentUser ? 2.5 : 1.5,
      }}
    >
      {!isCurrentUser && (
        <Popup>
          <div className="flex flex-col gap-2 items-center text-sm min-w-[130px]">
            <span className="font-semibold text-gray-800">{presence.username}</span>
            <span className="text-gray-400 text-xs">
              {presence.city ? `${presence.city}, ${presence.country}` : presence.country}
            </span>
            <HugButton onSend={() => onSendHug(presence.userId)} />
          </div>
        </Popup>
      )}
      {isCurrentUser && (
        <Popup>
          <span className="text-sm text-gray-600">You ({presence.username})</span>
        </Popup>
      )}
    </CircleMarker>
  )
}
