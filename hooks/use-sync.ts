'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { useStore } from '@/lib/store'
import type { AuthUser, SyncStatus, AppData } from '@/types'

const WORKSPACE_ID = 'workspace'
const DEBOUNCE_MS = 800

export function useSync(user: AuthUser | null) {
  const { state, dispatch } = useStore()
  const [status, setStatus] = useState<SyncStatus>('idle')
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHydrated = useRef(false)

  const getDocRef = useCallback(() => {
    if (!user) return null
    const db = getFirebaseDb()
    if (!db) return null
    return doc(db, 'users', user.uid, 'data', WORKSPACE_ID)
  }, [user])

  // On login: pull from Firestore once, then subscribe
  useEffect(() => {
    if (!user) {
      isHydrated.current = false
      setStatus('idle')
      return
    }

    const ref = getDocRef()
    if (!ref) return

    setStatus('syncing')

    const unsub = onSnapshot(
      ref,
      snapshot => {
        if (snapshot.exists() && !isHydrated.current) {
          const data = snapshot.data() as AppData
          dispatch({ type: 'HYDRATE', payload: data })
          isHydrated.current = true
        }
        setStatus('synced')
      },
      () => {
        setStatus('error')
      }
    )

    return () => {
      unsub()
      isHydrated.current = false
    }
  }, [user, getDocRef, dispatch])

  // Debounced push on state change (only after hydration)
  useEffect(() => {
    if (!user || !isHydrated.current) return

    if (pushTimer.current) clearTimeout(pushTimer.current)
    setStatus('syncing')

    pushTimer.current = setTimeout(async () => {
      const ref = getDocRef()
      if (!ref) return
      try {
        await setDoc(ref, { ...state, updatedAt: serverTimestamp() }, { merge: true })
        setStatus('synced')
      } catch {
        setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current)
    }
  }, [state, user, getDocRef])

  return { status }
}
