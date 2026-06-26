'use client'

import { useEffect, useRef, useState } from 'react'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../infrastructure/firebase/firebaseApp'
import { FirebasePresenceRepository } from '../../infrastructure/repositories/FirebasePresenceRepository'
import { PresenceService } from '../../application/services/PresenceService'
import type { User } from '../../domain/entities/User'

const presenceRepo = new FirebasePresenceRepository()
const presenceService = new PresenceService(presenceRepo)

async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
    const data = await res.json()
    return {
      country: data.address?.country_code?.toUpperCase() ?? 'Unknown',
      city: data.address?.city ?? data.address?.town ?? data.address?.village,
    }
  } catch { return { country: 'Unknown' } }
}

export function usePresence(user: User | null, locationEnabled: boolean | null = null) {
  const [country, setCountry] = useState('Unknown')
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const doneRef = useRef(false)

  function requestLocation() {
    setLocationDenied(false)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (doneRef.current || !user) return
        doneRef.current = true
        const { country: c, city } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        setCountry(c)
        setUserCoords([pos.coords.latitude, pos.coords.longitude])
        await presenceService.markActive(user.id, user.username, pos.coords, c, city)
        setIsReady(true)
        cleanupRef.current = () => presenceService.markInactive(user.id)
      },
      () => setLocationDenied(true),
      { timeout: 10000 }
    )
  }

  async function markAnonymous() {
    if (!user || doneRef.current) return
    doneRef.current = true
    // Pick a random city to land on (not in water)
    const cities: [number, number][] = [
      [59.3, 18.1],[48.9, 2.3],[51.5, -0.1],[52.5, 13.4],[40.7, -74.0],
      [34.1, -118.2],[41.9, 12.5],[55.8, 37.6],[35.7, 139.7],[37.6, 127.0],
      [39.9, 116.4],[28.6, 77.2],[19.1, 72.9],[-23.5, -46.6],[-33.9, 151.2],
      [43.7, -79.4],[45.5, -73.6],[64.1, -21.9],[59.9, 10.8],[57.7, 12.0],
      [60.2, 25.0],[56.0, 12.6],[55.7, 12.6],[53.4, -2.2],[53.8, -1.5],
      [48.2, 16.4],[47.4, 19.1],[50.1, 14.4],[52.2, 21.0],[44.4, 26.1],
      [41.0, 29.0],[37.0, -122.0],[47.6, -122.3],[29.8, -95.4],[25.8, -80.2],
      [33.4, -112.1],[41.5, -81.7],[43.0, -76.2],[45.5, -122.7],[49.3, -123.1],
    ]
    const [lat, lng] = cities[Math.floor(Math.random() * cities.length)]
    setUserCoords([lat, lng]) // center map immediately
    setIsReady(true)
    cleanupRef.current = () => presenceService.markInactive(user.id)
    setDoc(doc(db, 'presences', user.id), {
      userId: user.id, username: 'Anonymous', isAnonymous: true,
      latitude: lat, longitude: lng, country: 'Unknown',
      isActive: true, lastSeen: serverTimestamp(),
    }).catch(() => {})
  }

  useEffect(() => {
    if (!user || locationEnabled === null) return
    doneRef.current = false
    if (locationEnabled) {
      requestLocation()
    } else {
      markAnonymous()
    }

    // Heartbeat: keep lastSeen fresh so 5-min filter works
    const heartbeat = setInterval(() => {
      updateDoc(doc(db, 'presences', user.id), {
        lastSeen: serverTimestamp(),
        isAnonymous: !locationEnabled,
        username: locationEnabled ? user.username : 'Anonymous',
      }).catch(() => {})
    }, 2 * 60 * 1000)

    const handleUnload = () => presenceService.markInactive(user.id)
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('beforeunload', handleUnload)
      cleanupRef.current?.()
      doneRef.current = false
    }
  }, [user?.id, locationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { country, userCoords, isReady, locationDenied, requestLocation }
}
