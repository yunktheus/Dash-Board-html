'use client'

import { useState, useCallback } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { getFirebaseStorage } from '@/lib/firebase'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, detectFileType } from '@/lib/utils'
import type { LibraryItemType } from '@/types'

interface UploadResult {
  url: string
  storagePath: string
  tipo: LibraryItemType
  originalName: string
}

export function useFileUpload(uid: string | undefined) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    (file: File): Promise<UploadResult> => {
      return new Promise((resolve, reject) => {
        setError(null)

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          const err = 'Tipo de arquivo não suportado.'
          setError(err)
          return reject(new Error(err))
        }
        if (file.size > MAX_FILE_SIZE) {
          const err = 'Arquivo muito grande (máximo 20 MB).'
          setError(err)
          return reject(new Error(err))
        }

        const storage = getFirebaseStorage()
        if (!storage || !uid) {
          const err = 'Firebase Storage não configurado ou usuário não autenticado.'
          setError(err)
          return reject(new Error(err))
        }

        const path = `users/${uid}/biblioteca/${Date.now()}_${file.name}`
        const storageRef = ref(storage, path)
        const task = uploadBytesResumable(storageRef, file)

        setUploading(true)
        setProgress(0)

        task.on(
          'state_changed',
          snapshot => {
            setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
          },
          err => {
            setUploading(false)
            setError(err.message)
            reject(err)
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref)
            setUploading(false)
            setProgress(100)
            resolve({
              url,
              storagePath: path,
              tipo: detectFileType(file.name),
              originalName: file.name,
            })
          }
        )
      })
    },
    [uid]
  )

  const remove = useCallback(async (storagePath: string) => {
    const storage = getFirebaseStorage()
    if (!storage) return
    try {
      await deleteObject(ref(storage, storagePath))
    } catch {}
  }, [])

  return { upload, remove, uploading, progress, error }
}
