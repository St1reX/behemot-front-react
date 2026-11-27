import type { AxiosResponse } from 'axios'

export type DownloadedFile = {
  blob: Blob
  filename: string
}

export function toDownloadedFile(response: AxiosResponse<Blob>, fallbackFilename: string): DownloadedFile {
  return {
    blob: response.data,
    filename: getDownloadFilename(response.headers['content-disposition']) ?? fallbackFilename,
  }
}

export function getDownloadFilename(contentDisposition: string | undefined): string | null {
  const encodedMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    try { return decodeURIComponent(encodedMatch[1]) } catch { /* Try the plain filename below. */ }
  }
  return contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? null
}

export function saveDownloadedFile(file: DownloadedFile): void {
  const url = URL.createObjectURL(file.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
