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

export function usePresence(user: User | null, locationEnabled = true) {
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
    const lat = Math.round((Math.random() * 160 - 80) * 10) / 10
    const lng = Math.round((Math.random() * 360 - 180) * 10) / 10
    await setDoc(doc(db, 'presences', user.id), {
      userId: user.id, username: 'Anonymous', isAnonymous: true,
      latitude: lat, longitude: lng, country: 'Unknown',
      isActive: true, lastSeen: serverTimestamp(),
    })
    setUserCoords([lat, lng])
    setIsReady(true)
    cleanupRef.current = () => presenceService.markInactive(user.id)
  }

  useEffect(() => {
    if (!user) return
    doneRef.current = false
    if (locationEnabled) {
      requestLocation()
    } else {
      markAnonymous()
    }

    // Keep lastSeen fresh every 2 minutes so the 30-min filter works
    const interval = setInterval(() => {
      updateDoc(doc(db, 'presences', user.id), { lastSeen: serverTimestamp() }).catch(() => {})
    }, 2 * 60 * 1000)

    return () => {
      clearInterval(interval)
      cleanupRef.current?.()
      doneRef.current = false
    }
  }, [user?.id, locationEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { country, userCoords, isReady, locationDenied, requestLocation }
}
