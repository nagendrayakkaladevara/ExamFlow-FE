import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { questionsApi } from '@/features/questions/api'
import { tagsApi } from '@/features/tags/api'
import { fileToBase64, uploadsApi } from '@/features/uploads/api'
import { queryKeys } from '@/config/query-keys'
import { ALLOWED_IMAGE_TYPES } from '@/config/constants'
import type { DifficultyLevel, QuestionType } from '@/types/enums'
import { isApiError } from '@/lib/errors'

interface OptionDraft {
  optionText: string
  isCorrect: boolean
}

export function QuestionFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [type, setType] = useState<QuestionType>('SINGLE_CHOICE')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [explanation, setExplanation] = useState('')
  const [defaultMarks, setDefaultMarks] = useState(1)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('EASY')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [correctText, setCorrectText] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [options, setOptions] = useState<OptionDraft[]>([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
  ])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageBlobKey, setImageBlobKey] = useState<string | null>(null)

  const questionQuery = useQuery({
    queryKey: [...queryKeys.questions.all, id],
    queryFn: () => questionsApi.get(id!),
    enabled: isEdit,
  })

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => tagsApi.list(),
  })

  useEffect(() => {
    if (!questionQuery.data) return
    const q = questionQuery.data
    setType(q.type)
    setTitle(q.title)
    setDescription(q.description)
    setExplanation(q.explanation ?? '')
    setDefaultMarks(q.defaultMarks)
    setDifficulty(q.difficulty)
    setSubject(q.subject ?? '')
    setTopic(q.topic ?? '')
    setCorrectText(q.correctText ?? '')
    setTagIds((q.tags ?? []).map((t) => t.id))
    setImageUrl(q.imageUrl)
    setImageBlobKey(q.imageBlobKey)
    if (q.options?.length) {
      setOptions(
        q.options.map((o) => ({ optionText: o.optionText, isCorrect: Boolean(o.isCorrect) })),
      )
    }
  }, [questionQuery.data])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file)
      return uploadsApi.uploadImage(file.name, file.type, base64)
    },
    onSuccess: (data) => {
      setImageUrl(data.url)
      setImageBlobKey(data.blobKey)
      toast.success('Image uploaded.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to upload image.')
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        type,
        title,
        description,
        explanation: explanation || null,
        defaultMarks,
        difficulty,
        subject: subject || null,
        topic: topic || null,
        correctText: type === 'FILL_BLANK' ? correctText : null,
        imageUrl,
        imageBlobKey,
        tagIds,
        options:
          type === 'FILL_BLANK'
            ? undefined
            : options.map((o, index) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
                sortOrder: index,
              })),
      }

      if (isEdit && id) {
        return questionsApi.update(id, body)
      }
      return questionsApi.create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
      toast.success(isEdit ? 'Question updated.' : 'Question created.')
      navigate('/lecturer/questions')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to save question.')
    },
  })

  if (isEdit && questionQuery.isLoading) return <Skeleton className="h-64 w-full" />
  if (questionQuery.error) {
    return <QueryError error={questionQuery.error} onRetry={() => questionQuery.refetch()} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={isEdit ? 'Edit question' : 'New question'}
        description="Build a reusable question for your assignments."
        actions={
          <Button variant="outline" asChild>
            <Link to="/lecturer/questions">Cancel</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
              >
                <option value="SINGLE_CHOICE">Single choice</option>
                <option value="MULTIPLE_CHOICE">Multiple choice</option>
                <option value="FILL_BLANK">Fill in the blank</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Difficulty</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Default marks</Label>
              <Input
                type="number"
                min={1}
                value={defaultMarks}
                onChange={(e) => setDefaultMarks(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {(tagsQuery.data ?? []).map((tag) => {
                const selected = tagIds.includes(tag.id)
                return (
                  <Button
                    key={tag.id}
                    type="button"
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() =>
                      setTagIds((prev) =>
                        selected ? prev.filter((t) => t !== tag.id) : [...prev, tag.id],
                      )
                    }
                  >
                    {tag.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {type === 'FILL_BLANK' ? (
            <div className="space-y-1">
              <Label>Correct answer</Label>
              <Input value={correctText} onChange={(e) => setCorrectText(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Answer options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option.optionText}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((o, i) =>
                          i === index ? { ...o, optionText: e.target.value } : o,
                        ),
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                  />
                  <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                    <input
                      type={type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                      checked={option.isCorrect}
                      name="correct-option"
                      onChange={() =>
                        setOptions((prev) =>
                          prev.map((o, i) => {
                            if (type === 'SINGLE_CHOICE') {
                              return { ...o, isCorrect: i === index }
                            }
                            return i === index ? { ...o, isCorrect: !o.isCorrect } : o
                          }),
                        )
                      }
                    />
                    Correct
                  </label>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOptions((prev) => [...prev, { optionText: '', isCorrect: false }])}
              >
                Add option
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <Input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadMutation.mutate(file)
              }}
            />
            {imageUrl ? (
              <img src={imageUrl} alt="Question" className="max-h-48 rounded-md border" />
            ) : null}
          </div>

          <div className="space-y-1">
            <Label>Explanation (optional)</Label>
            <textarea
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <Button
            type="button"
            disabled={!title.trim() || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create question'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
