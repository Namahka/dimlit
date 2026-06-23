'use client'

import { useEffect, useRef, useState } from 'react'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../infrastructure/firebase/firebaseApp'
import { FirebasePresenceRepository } from '../../infrastructure/repositories/FirebasePresenceRepository'
import { PresenceService } from '../../application/services/PresenceService'
import type { User } from '../../domain/entities/User'

const presenceRepo = new FirebasePresenceRepository()
const presenceService = new PresenceService(presenceRepo)

async function reverseGeocode(lat: number, lng: number): Promise<{ country: string; city?: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
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
  const realCoordsRef = useRef<[number, number] | null>(null)
  const userRef = useRef(user)
  userRef.current = user

  async function markActive(geoCoords: GeolocationCoordinates) {
    const u = userRef.current
    if (!u || markedRef.current) return
    markedRef.current = true
    const { country: c, city } = await reverseGeocode(geoCoords.latitude, geoCoords.longitude)
    setCountry(c)
    realCoordsRef.current = [geoCoords.latitude, geoCoords.longitude]
    setUserCoords([geoCoords.latitude, geoCoords.longitude])
    await presenceService.markActive(u.id, u.username, geoCoords, c, city)
    setIsReady(true)
    cleanupRef.current = () => presenceService.markInactive(u.id)
  }

  function requestLocation() {
    setLocationDenied(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => markActive(pos.coords),
      () => setLocationDenied(true),
      { timeout: 10000 }
    )
  }

  // React immediately when toggle changes
  useEffect(() => {
    const u = userRef.current
    if (!u) return

    if (!locationEnabled) {
      // Random position anywhere on Earth
      const anonLat = Math.round((Math.random() * 160 - 80) * 10) / 10
      const anonLng = Math.round((Math.random() * 360 - 180) * 10) / 10
      setUserCoords([anonLat, anonLng])
      updateDoc(doc(db, 'presences', u.id), {
        username: 'Anonymous', isAnonymous: true,
        latitude: anonLat, longitude: anonLng,
      }).catch(() => {})
    } else if (markedRef.current && realCoordsRef.current) {
      const [lat, lng] = realCoordsRef.current
      setUserCoords([lat, lng])
      updateDoc(doc(db, 'presences', u.id), {
        username: u.username, isAnonymous: false,
        latitude: lat, longitude: lng,
      }).catch(() => {})
    }
  }, [locationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    markedRef.current = false
    if (locationEnabled) {
      requestLocation()
    } else {
      // Anonymous mode — use setDoc (creates or overwrites)
      const anonLat = Math.round((Math.random() * 160 - 80) * 10) / 10
      const anonLng = Math.round((Math.random() * 360 - 180) * 10) / 10
      markedRef.current = true
      setDoc(doc(db, 'presences', user.id), {
        userId: user.id, username: 'Anonymous', isAnonymous: true,
        latitude: anonLat, longitude: anonLng,
        country: 'Unknown', isActive: true, lastSeen: serverTimestamp(),
      }).then(() => {
        setIsReady(true)
        cleanupRef.current = () => presenceService.markInactive(user.id)
      }).catch(() => { markedRef.current = false })
    }
    return () => {
      cleanupRef.current?.()
      markedRef.current = false
    }
  }, [user?.id, locationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { country, userCoords, isReady, locationDenied, requestLocation }
}
