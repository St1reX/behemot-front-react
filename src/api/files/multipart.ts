export type MultipartPayload = Record<string, unknown>

export interface MultipartOptions {
  fileFields?: Record<string, string>
  jsonFields?: readonly string[]
}

export function createMultipartFormData(payload: MultipartPayload, options: MultipartOptions = {}): FormData {
  const formData = new FormData()

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    const fieldName = options.fileFields?.[key] ?? key

    if (options.jsonFields?.includes(key)) {
      formData.append(fieldName, JSON.stringify(value))
    } else if (value instanceof Blob) {
      formData.append(fieldName, value)
    } else if (Array.isArray(value)) {
      for (const file of value) {
        if (!(file instanceof Blob)) throw new TypeError(`Pole ${key} wymaga plików lub konfiguracji jsonFields.`)
        formData.append(fieldName, file)
      }
    } else if (value !== null && typeof value !== 'object') {
      formData.append(fieldName, String(value))
    } else if (value !== null) {
      throw new TypeError(`Pole ${key} wymaga konfiguracji jsonFields.`)
    }
  }

  return formData
}
