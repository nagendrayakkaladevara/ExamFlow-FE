import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { AudiencePicker, type AudienceValue } from '@/components/shared/AudiencePicker'
import { circularsApi } from '@/features/circulars/api'
import { fileToBase64, uploadsApi } from '@/features/uploads/api'
import { ALLOWED_IMAGE_TYPES, UPLOAD_MAX_SIZE_BYTES } from '@/config/constants'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { isApiError } from '@/lib/errors'

export function CircularFormPage() {
  const { id: editId } = useParams()
  const isEdit = Boolean(editId)
  const role = useAuthStore((s) => s.user!.role)
  const basePath = useRoleBasePath()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [publishAt, setPublishAt] = useState(toDatetimeLocalValue(new Date().toISOString()))
  const [audiences, setAudiences] = useState<AudienceValue[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [coverImageBlobKey, setCoverImageBlobKey] = useState<string | null>(null)

  const circularQuery = useQuery({
    queryKey: [...['circulars'], editId],
    queryFn: () => circularsApi.get(editId!),
    enabled: isEdit && Boolean(editId),
  })

  useEffect(() => {
    if (!circularQuery.data) return
    const circular = circularQuery.data
    setTitle(circular.title)
    setDescription(circular.description)
    setPublishAt(toDatetimeLocalValue(circular.publishAt))
    setCoverImageUrl(circular.coverImageUrl)
    setCoverImageBlobKey(null)
  }, [circularQuery.data])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        throw new Error('Use a PNG, JPEG, or WebP image.')
      }
      if (file.size > UPLOAD_MAX_SIZE_BYTES) {
        throw new Error('Image must be 5 MB or smaller.')
      }
      const base64 = await fileToBase64(file)
      return uploadsApi.uploadImage(file.name, file.type, base64)
    },
    onSuccess: (data) => {
      setCoverImageUrl(data.url)
      setCoverImageBlobKey(data.blobKey)
      toast.success('Cover image uploaded.')
    },
    onError: (error) => {
      toast.error(
        isApiError(error) ? error.message : error instanceof Error ? error.message : 'Unable to upload image.',
      )
    },
  })

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title,
        description,
        publishAt: fromDatetimeLocalValue(publishAt),
        ...(coverImageUrl ? { coverImageUrl } : {}),
        ...(coverImageBlobKey ? { coverImageBlobKey } : {}),
        ...(isEdit ? {} : { audiences }),
      }

      return isEdit && editId
        ? circularsApi.update(editId, payload)
        : circularsApi.create({ ...payload, audiences })
    },
    onSuccess: (circular) => {
      toast.success(isEdit ? 'Circular updated.' : 'Circular created.')
      navigate(`${basePath}/circulars/${circular.id}`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to save circular.')
    },
  })

  if (isEdit && circularQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (isEdit && circularQuery.error) {
    return <QueryError error={circularQuery.error} onRetry={() => circularQuery.refetch()} />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit circular' : 'New circular'}
        description="Publish an announcement to your audience."
        actions={
          <Button variant="outline" asChild>
            <Link to={isEdit ? `${basePath}/circulars/${editId}` : `${basePath}/circulars`}>
              Cancel
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              className="min-h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Cover image</Label>
            <Input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              disabled={uploadMutation.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadMutation.mutate(file)
              }}
            />
            {uploadMutation.isPending ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </p>
            ) : null}
            {coverImageUrl ? (
              <div className="space-y-2">
                <img src={coverImageUrl} alt="" className="max-h-48 rounded-md border" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCoverImageUrl(null)
                    setCoverImageBlobKey(null)
                  }}
                >
                  <X className="size-4" />
                  Remove cover
                </Button>
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label>Publish at</Label>
            <Input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
          </div>
          {!isEdit ? (
            <AudiencePicker role={role} value={audiences} onChange={setAudiences} />
          ) : null}
          <Button
            type="button"
            disabled={
              !title.trim() ||
              !description.trim() ||
              (!isEdit && audiences.length === 0) ||
              mutation.isPending ||
              uploadMutation.isPending
            }
            onClick={() => mutation.mutate()}
          >
            {isEdit ? 'Save changes' : 'Publish circular'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
