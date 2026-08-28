import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUploadComplexPhoto } from '@/features/storage/hooks'

export function ComplexPhotoUpload({
  complexId,
  coverImageUrl,
  onUploaded,
}: {
  complexId: string
  coverImageUrl: string | null | undefined
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadComplexPhoto(complexId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate(file, { onSuccess: onUploaded })
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Foto de portada</Label>
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="Portada del complejo"
          className="h-40 w-full rounded-xl object-cover"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? 'Subiendo...' : coverImageUrl ? 'Cambiar foto' : 'Subir foto'}
      </Button>
      {upload.isError && (
        <p className="text-sm text-destructive">{(upload.error as Error).message}</p>
      )}
    </div>
  )
}
