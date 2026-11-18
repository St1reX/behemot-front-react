import axios from 'axios'
import { z } from 'zod'
import type { ApiValidationIssue } from './api.types'

const errorResponseSchema = z.object({
  error: z.object({
    name: z.string(),
    message: z.string().min(1),
    issues: z.array(z.object({ path: z.string(), message: z.string(), code: z.string() })).optional(),
  }),
})

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly issues: ApiValidationIssue[]

  constructor(message: string, options: {
    status?: number
    code?: string
    issues?: ApiValidationIssue[]
    cause?: unknown
  } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.issues = options.issues ?? []
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
          ? 'Serwer nie odpowiedział na czas. Spróbuj ponownie.'
          : 'Brak połączenia z serwerem. Sprawdź połączenie i spróbuj ponownie.',
        { cause: error },
      )
    }

    const result = errorResponseSchema.safeParse(error.response.data)
    if (result.success) {
      const { name, message, issues } = result.data.error
      return new ApiError(message, { status: error.response.status, code: name, issues, cause: error })
    }

    return new ApiError('Nie udało się wykonać żądania. Spróbuj ponownie później.', {
      status: error.response.status,
      cause: error,
    })
  }

  return new ApiError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.', { cause: error })
}
