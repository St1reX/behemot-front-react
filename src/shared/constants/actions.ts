export const ACTIONS = {
  READ: 'READ',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS]

export const ACTION_LABELS: Record<Action, string> = {
  CREATE: 'Dodanie',
  UPDATE: 'Zmiana',
  DELETE: 'Usunięcie',
  READ: 'Odczyt',
}

export function getActionLabel(action: string) {
  return ACTION_LABELS[action as Action] ?? action
}
