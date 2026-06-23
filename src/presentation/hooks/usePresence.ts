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

export function usePresence(user: User | null) {
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

  async function markAnonymous() {
    if (!user || markedRef.current) return
    markedRef.current = true
    // Random position spread across the globe
    const lat = (Math.random() * 140) - 70
    const lng = (Math.random() * 360) - 180
    const fallback = { latitude: lat, longitude: lng, accuracy: 0 } as GeolocationCoordinates
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
    const locationEnabled = localStorage.getItem('dimlit_location_enabled') !== '0'
    if (locationEnabled) {
      requestLocation()
    } else {
      markAnonymous()
    }
    return () => {
      cleanupRef.current?.()
      markedRef.current = false
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { country, userCoords, isReady, locationDenied, requestLocation }
}
