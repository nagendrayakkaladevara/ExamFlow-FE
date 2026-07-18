import { api } from '@/lib/api-client'
import type { UploadResult } from '@/types/domain'

export const uploadsApi = {
  uploadImage: (filename: string, contentType: string, dataBase64: string) =>
    api.post<UploadResult>('/uploads', { filename, contentType, dataBase64 }),
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Unable to read file.'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Unable to read file.'))
    reader.readAsDataURL(file)
  })
}
