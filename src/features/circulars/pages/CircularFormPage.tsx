import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AudiencePicker, type AudienceValue } from '@/components/shared/AudiencePicker'
import { circularsApi } from '@/features/circulars/api'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { isApiError } from '@/lib/errors'

export function CircularFormPage() {
  const role = useAuthStore((s) => s.user!.role)
  const basePath = useRoleBasePath()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [publishAt, setPublishAt] = useState(toDatetimeLocalValue(new Date().toISOString()))
  const [audiences, setAudiences] = useState<AudienceValue[]>([])

  const mutation = useMutation({
    mutationFn: () =>
      circularsApi.create({
        title,
        description,
        publishAt: fromDatetimeLocalValue(publishAt),
        audiences,
      }),
    onSuccess: (circular) => {
      toast.success('Circular created.')
      navigate(`${basePath}/circulars/${circular.id}`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to create circular.')
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New circular"
        description="Publish an announcement to your audience."
        actions={
          <Button variant="outline" asChild>
            <Link to={`${basePath}/circulars`}>Cancel</Link>
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
            <textarea
              className="flex min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Publish at</Label>
            <Input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
          </div>
          <AudiencePicker role={role} value={audiences} onChange={setAudiences} />
          <Button
            type="button"
            disabled={!title.trim() || !description.trim() || audiences.length === 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Publish circular
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
