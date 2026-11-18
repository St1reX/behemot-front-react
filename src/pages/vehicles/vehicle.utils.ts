import { isAxiosError } from 'axios'
import type { VehicleRecord } from '@/types/vehicles/vehicle.types'

export function getVehicleLabel(record: VehicleRecord): string {
  return record.type === 'generation'
    ? `${record.item.startProduction} – ${record.item.endProduction ?? 'obecnie'}`
    : record.item.name
}

const conflictMessages: Record<string, string> = {
  'Car brand name is already in use': 'Marka o tej nazwie już istnieje.',
  'Car model name is already in use for this car brand': 'Model o tej nazwie już istnieje w tej marce.',
  'Car generation years are already in use for this car model': 'Generacja o tych latach produkcji już istnieje w tym modelu.',
  'Car brand cannot be deleted because it is assigned to a car model': 'Nie można usunąć marki, która ma modele. Najpierw usuń jej modele.',
  'Car model cannot be deleted because it is assigned to a car generation': 'Nie można usunąć modelu, który ma generacje. Najpierw usuń jego generacje.',
  'Car generation cannot be deleted because it is assigned to a product fitment': 'Nie można usunąć generacji przypisanej do produktów.',
}

export function getVehicleErrorMessage(error: unknown): string {
  if (isAxiosError<{ error?: { message?: string } }>(error)) {
    const status = error.response?.status
    const message = error.response?.data?.error?.message
    if (message && conflictMessages[message]) return conflictMessages[message]
    if (status === 401) return 'Sesja wygasła. Zaloguj się ponownie.'
    if (status === 403) return 'Nie masz uprawnień do wykonania tej operacji.'
    if (status === 404) return 'Wybrany element już nie istnieje. Odśwież listę.'
    if (status === 409) return 'Nie można wykonać operacji z powodu istniejących powiązań lub powielonych danych.'
    if (status === 422) return 'Sprawdź poprawność danych formularza.'
  }
  return 'Nie udało się wykonać operacji. Spróbuj ponownie.'
}
