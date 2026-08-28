import { useMutation } from '@tanstack/react-query'
import { uploadComplexPhoto } from '@/features/storage/api'

export function useUploadComplexPhoto(complexId: string) {
  return useMutation({
    mutationFn: (file: File) => uploadComplexPhoto(complexId, file),
  })
}
