'use client'

import { useEffect, useRef, useState } from 'react'
import { FirebasePresenceRepository } from '../../infrastructure/repositories/FirebasePresenceRepository'
import { PresenceService } from '../../application/services/PresenceService'
import type { User } from '../../domain/entities/User'

const presenceRepo = new FirebasePresenceRepository()
const presenceService = new PresenceService(presenceRepo)

async function reverseGeocode(lat: number, lng: number): Promise<{ country: string; city?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    )
    const data = await res.json()
    return {
      country: data.address?.country_code?.toUpperCase() ?? 'Unknown',
      city: data.address?.city ?? data.address?.town ?? data.address?.village,
    }
  } catch {
    return { country: 'Unknown' }
  }
}

export function usePresence(user: User | null, locationEnabled = true) {
  const [country, setCountry] = useState<string>('Unknown')
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const markedRef = useRef(false)
  const userCoordsRef = useRef<[number, number] | null>(null)

  async function markActive(geoCoords: GeolocationCoordinates) {
    if (!user || markedRef.current) return
    markedRef.current = true
    const { country: c, city } = await reverseGeocode(geoCoords.latitude, geoCoords.longitude)
    setCountry(c)
    setUserCoords([geoCoords.latitude, geoCoords.longitude])
    userCoordsRef.current = [geoCoords.latitude, geoCoords.longitude]
    await presenceService.markActive(user.id, user.username, geoCoords, c, city)
    setIsReady(true)
    cleanupRef.current = () => presenceService.markInactive(user.id)
  }

  function requestLocation() {
    setLocationDenied(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => markActive(pos.coords),
      () => setLocationDenied(true),
      { timeout: 10000 }
    )
  }

  // When locationEnabled changes, patch the presence doc
  useEffect(() => {
    if (!user || !markedRef.current) return
    import('firebase/firestore').then(({ doc, updateDoc }) => {
      import('../../infrastructure/firebase/firebaseApp').then(({ db }) => {
        if (!locationEnabled) {
          // Generate random offset from real position (±0.05°, ~5km)
          const realLat = userCoordsRef.current?.[0] ?? 0
          const realLng = userCoordsRef.current?.[1] ?? 0
          const anonLat = Math.round((realLat + (Math.random() * 0.1 - 0.05)) * 100) / 100
          const anonLng = Math.round((realLng + (Math.random() * 0.1 - 0.05)) * 100) / 100
          updateDoc(doc(db, 'presences', user.id), {
            username: 'Anonymous', isAnonymous: true,
            latitude: anonLat, longitude: anonLng,
          }).catch(() => {})
          setUserCoords([anonLat, anonLng])
        } else {
          const lat = userCoordsRef.current?.[0] ?? 0
          const lng = userCoordsRef.current?.[1] ?? 0
          updateDoc(doc(db, 'presences', user.id), {
            username: user.username, isAnonymous: false,
            latitude: lat, longitude: lng,
          }).catch(() => {})
        }
      })
    })
  }, [locationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    markedRef.current = false
    requestLocation()
    return () => {
      cleanupRef.current?.()
      markedRef.current = false
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { country, userCoords, isReady, locationDenied, requestLocation }
}
