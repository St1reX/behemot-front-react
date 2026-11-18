export const ACTIONS = {
  READ: 'READ',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]
