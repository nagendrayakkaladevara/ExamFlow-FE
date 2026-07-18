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
import { pollsApi } from '@/features/polls/api'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import { useAuthStore } from '@/features/auth/store'
import { useRoleBasePath } from '@/hooks/useRolePath'
import type { PollResultVisibility } from '@/types/enums'
import { isApiError } from '@/lib/errors'

export function PollFormPage() {
  const role = useAuthStore((s) => s.user!.role)
  const basePath = useRoleBasePath()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [publishAt, setPublishAt] = useState(toDatetimeLocalValue(new Date().toISOString()))
  const [expireAt, setExpireAt] = useState('')
  const [resultVisibility, setResultVisibility] = useState<PollResultVisibility>('AFTER_VOTE')
  const [audiences, setAudiences] = useState<AudienceValue[]>([])
  const [options, setOptions] = useState(['', ''])

  const mutation = useMutation({
    mutationFn: () =>
      pollsApi.create({
        title,
        description: description || null,
        publishAt: fromDatetimeLocalValue(publishAt),
        expireAt: fromDatetimeLocalValue(expireAt),
        resultVisibility,
        audiences,
        options: options.filter(Boolean).map((optionText, sortOrder) => ({ optionText, sortOrder })),
      }),
    onSuccess: (poll) => {
      toast.success('Poll created.')
      navigate(`${basePath}/polls/${poll.id}`)
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to create poll.')
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New poll"
        description="Ask a question and collect one vote per student."
        actions={
          <Button variant="outline" asChild>
            <Link to={`${basePath}/polls`}>Cancel</Link>
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
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Publish at</Label>
              <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Expires at</Label>
              <Input type="datetime-local" value={expireAt} onChange={(e) => setExpireAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Results visibility</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={resultVisibility}
              onChange={(e) => setResultVisibility(e.target.value as PollResultVisibility)}
            >
              <option value="AFTER_VOTE">After voting</option>
              <option value="AFTER_EXPIRY">After poll expires</option>
              <option value="NEVER">Admin only</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <Input
                key={index}
                value={option}
                placeholder={`Option ${index + 1}`}
                onChange={(e) =>
                  setOptions((prev) => prev.map((o, i) => (i === index ? e.target.value : o)))
                }
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOptions((prev) => [...prev, ''])}
            >
              Add option
            </Button>
          </div>
          <AudiencePicker role={role} value={audiences} onChange={setAudiences} />
          <Button
            type="button"
            disabled={
              !title.trim() ||
              !expireAt ||
              options.filter(Boolean).length < 2 ||
              audiences.length === 0 ||
              mutation.isPending
            }
            onClick={() => mutation.mutate()}
          >
            Create poll
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
