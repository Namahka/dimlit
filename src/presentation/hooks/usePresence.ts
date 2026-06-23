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

  async function markActive(geoCoords: GeolocationCoordinates) {
    if (!user || markedRef.current) return
    markedRef.current = true
    const { country: c, city } = await reverseGeocode(geoCoords.latitude, geoCoords.longitude)
    setCountry(c)
    setUserCoords([geoCoords.latitude, geoCoords.longitude])
    await presenceService.markActive(user.id, user.username, geoCoords, c, city)
    setIsReady(true)
    cleanupRef.current = () => presenceService.markInactive(user.id)
  }

  async function markAnonymous(knownCoords?: GeolocationCoordinates) {
    if (!user || markedRef.current) return
    markedRef.current = true
    // If we have real coords, use them with offset. Otherwise random nearby Europe.
    const baseLat = knownCoords?.latitude ?? 52 + (Math.random() * 10 - 5)
    const baseLng = knownCoords?.longitude ?? 10 + (Math.random() * 20 - 10)
    const fallback = { latitude: baseLat, longitude: baseLng, accuracy: 0 } as GeolocationCoordinates
    await presenceService.markActive(user.id, 'Anonymous', fallback, 'Unknown', undefined, true)
    setIsReady(true)
    cleanupRef.current = () => presenceService.markInactive(user.id)
  }

  function requestLocation() {
    setLocationDenied(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => markActive(pos.coords),
      () => { setLocationDenied(true); markAnonymous() },
      { timeout: 10000 }
    )
  }

  useEffect(() => {
    if (!user) return
    markedRef.current = false
    if (locationEnabled) {
      requestLocation()
    } else {
      // If we already have real coords from a previous session, use them as base for anonymous placement
      navigator.geolocation.getCurrentPosition(
        (pos) => markAnonymous(pos.coords),
        () => markAnonymous(),
        { timeout: 5000, maximumAge: 60000 }
      )
    }
    return () => {
      cleanupRef.current?.()
      markedRef.current = false
    }
  }, [user?.id, locationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { country, userCoords, isReady, locationDenied, requestLocation }
}
