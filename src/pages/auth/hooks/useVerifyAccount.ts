import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { authApiClient } from '@/api/auth/AuthApiClient'

export function useVerifyAccount(token: string | null) {
  const submittedToken = useRef<string | null>(null)
  const verification = useMutation({
    mutationFn: authApiClient.verifyAccount,
    retry: false,
  })
  const { mutate } = verification

  useEffect(() => {
    if (token && submittedToken.current !== token) {
      submittedToken.current = token
      mutate(token)
    }
  }, [token, mutate])

  return verification
}
