import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { QueryError } from '@/components/feedback/EmptyState'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { questionsApi, toQuestionPayload } from '@/features/questions/api'
import {
  difficultyOptions,
  questionFormSchema,
  questionTypeOptions,
  type QuestionFormValues,
} from '@/features/questions/schemas'
import { tagsApi } from '@/features/tags/api'
import { fileToBase64, uploadsApi } from '@/features/uploads/api'
import { queryKeys } from '@/config/query-keys'
import { ALLOWED_IMAGE_TYPES, UPLOAD_MAX_SIZE_BYTES } from '@/config/constants'
import { isApiError } from '@/lib/errors'
import { cn } from '@/lib/utils'

const formFooterClassName =
  'flex w-full min-w-0 flex-col gap-3 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:px-6'
const formFooterButtonClassName = 'min-h-11 w-full max-w-full sm:min-h-9 sm:w-auto'
const touchInputClassName = 'h-11 text-base sm:h-9 sm:text-sm'
const optionRowClassName =
  'flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4'
const optionActionsClassName =
  'flex w-full min-w-0 items-center gap-2 border-t border-border pt-3 sm:w-auto sm:border-0 sm:pt-0'
const touchIconButtonClassName = 'size-11 shrink-0 sm:size-8'

const defaultValues: QuestionFormValues = {
  type: 'SINGLE_CHOICE',
  title: '',
  description: '',
  defaultMarks: 1,
  difficulty: 'EASY',
  explanation: '',
  subject: '',
  topic: '',
  correctText: '',
  tagIds: [],
  options: [
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
  ],
  imageUrl: null,
  imageBlobKey: null,
}

function applyApiFieldErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<QuestionFormValues>>['setError'],
) {
  if (!isApiError(error) || !error.details || typeof error.details !== 'object') {
    return
  }

  const fieldErrors = (error.details as { fieldErrors?: Record<string, string[]> })
    .fieldErrors
  if (!fieldErrors) return

  for (const [name, messages] of Object.entries(fieldErrors)) {
    const message = messages[0]
    if (!message) continue
    setError(name as keyof QuestionFormValues, { message })
  }
}

export function QuestionFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  const questionType = form.watch('type')
  const imageUrl = form.watch('imageUrl')

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
    form.reset({
      type: q.type === 'FILL_BLANK' || q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE'
        ? q.type
        : 'SINGLE_CHOICE',
      title: q.title,
      description: q.description,
      defaultMarks: q.defaultMarks,
      difficulty: q.difficulty,
      explanation: q.explanation ?? '',
      subject: q.subject ?? '',
      topic: q.topic ?? '',
      correctText: q.correctText ?? '',
      tagIds: (q.tags ?? []).map((tag) => tag.id),
      options:
        q.options?.length
          ? q.options.map((option) => ({
              optionText: option.optionText,
              isCorrect: Boolean(option.isCorrect),
            }))
          : defaultValues.options,
      imageUrl: q.imageUrl,
      imageBlobKey: q.imageBlobKey,
    })
  }, [questionQuery.data, form])

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
      form.setValue('imageUrl', data.url, { shouldDirty: true })
      form.setValue('imageBlobKey', data.blobKey, { shouldDirty: true })
      toast.success('Image uploaded.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : error instanceof Error ? error.message : 'Unable to upload image.')
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (values: QuestionFormValues) => {
      const body = toQuestionPayload(values)
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
      const message = isApiError(error) ? error.message : 'Unable to save question.'
      setSubmitError(message)
      applyApiFieldErrors(error, form.setError)
      toast.error(message)
    },
  })

  function handleTypeChange(nextType: QuestionFormValues['type']) {
    const previous = form.getValues('type')
    form.setValue('type', nextType, { shouldValidate: true })

    if (nextType === 'FILL_BLANK') {
      return
    }

    if (previous === 'FILL_BLANK' || form.getValues('options').length === 0) {
      replace([
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
      ])
      return
    }

    if (nextType === 'SINGLE_CHOICE') {
      const options = form.getValues('options')
      const firstCorrectIndex = options.findIndex((option) => option.isCorrect)
      replace(
        options.map((option, index) => ({
          ...option,
          isCorrect: index === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0),
        })),
      )
    }
  }

  function clearImage() {
    form.setValue('imageUrl', null, { shouldDirty: true })
    form.setValue('imageBlobKey', null, { shouldDirty: true })
  }

  if (isEdit && questionQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-0">
        <Skeleton className="h-10 w-48 max-w-full sm:w-64" />
        <Skeleton className="h-72 w-full sm:h-96" />
      </div>
    )
  }

  if (questionQuery.error) {
    return <QueryError error={questionQuery.error} onRetry={() => questionQuery.refetch()} />
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-4 sm:space-y-8 sm:pb-0">
      <PageHeader
        title={isEdit ? 'Edit question' : 'New question'}
        description={
          isEdit
            ? 'Update this question in your bank.'
            : 'Create a reusable question for your assignments.'
        }
        actions={
          <Button
            variant="secondary"
            className={cn(formFooterButtonClassName, 'hidden sm:inline-flex')}
            asChild
          >
            <Link to="/lecturer/questions">Cancel</Link>
          </Button>
        }
      />

      <Card className="w-full min-w-0 gap-0 overflow-hidden py-0 shadow-sm">
        <Form {...form}>
          <form
            className="min-w-0"
            onSubmit={form.handleSubmit(
              (values) => {
                setSubmitError(null)
                saveMutation.mutate(values)
              },
              () => {
                setSubmitError('Please fix the highlighted fields below.')
              },
            )}
          >
            <CardContent className="min-w-0 space-y-0 px-4 pt-4 sm:px-6 sm:pt-6">
              {submitError ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <FieldGroup className="gap-6 sm:gap-7">
                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Question type</FieldLegend>
                    <FieldDescription>
                      Choose how students will answer. Descriptive questions are not available yet.
                    </FieldDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            className="grid gap-3"
                            value={field.value}
                            onValueChange={(value) =>
                              handleTypeChange(value as QuestionFormValues['type'])
                            }
                          >
                            {questionTypeOptions.map((option) => (
                              <FieldLabel
                                key={option.value}
                                htmlFor={`type-${option.value}`}
                                className="[&>[data-slot=field]]:p-3 sm:[&>[data-slot=field]]:p-4"
                              >
                                <Field orientation="horizontal" className="items-start gap-3">
                                  <FieldContent className="min-w-0 flex-1">
                                    <FieldTitle>{option.label}</FieldTitle>
                                    <FieldDescription className="text-pretty">
                                      {option.description}
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`type-${option.value}`}
                                    className="mt-1"
                                  />
                                </Field>
                              </FieldLabel>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Content</FieldLegend>
                    <FieldDescription>
                      Title and description shown to students during the assignment.
                    </FieldDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What is 2 + 2?"
                            maxLength={255}
                            className={touchInputClassName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Choose the correct answer."
                            className="min-h-24 text-base sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Supporting instructions or stem text for the question.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="defaultMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default marks</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              step={1}
                              className={touchInputClassName}
                              value={Number.isNaN(field.value) ? '' : field.value}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ''
                                    ? Number.NaN
                                    : Number(event.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                className="h-11 w-full min-h-11 text-base data-[size=default]:h-11 sm:h-9 sm:min-h-9 sm:text-sm sm:data-[size=default]:h-9"
                              >
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {difficultyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Answer</FieldLegend>
                    <FieldDescription>
                      {questionType === 'FILL_BLANK'
                        ? 'Enter the accepted text answer. Matching is handled by the server.'
                        : questionType === 'SINGLE_CHOICE'
                          ? 'Mark exactly one option as correct.'
                          : 'Mark one or more options as correct.'}
                    </FieldDescription>
                  </div>

                  {questionType === 'FILL_BLANK' ? (
                    <FormField
                      control={form.control}
                      name="correctText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correct answer</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Paris"
                              className={touchInputClassName}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-3">
                      {questionType === 'SINGLE_CHOICE' ? (
                        <RadioGroup
                          value={String(
                            form.watch('options').findIndex((option) => option.isCorrect),
                          )}
                          onValueChange={(value) => {
                            const selected = Number(value)
                            replace(
                              form.getValues('options').map((option, i) => ({
                                ...option,
                                isCorrect: i === selected,
                              })),
                            )
                          }}
                          className="gap-3"
                        >
                          {fields.map((item, index) => (
                            <div key={item.id} className={optionRowClassName}>
                              <FormField
                                control={form.control}
                                name={`options.${index}.optionText`}
                                render={({ field }) => (
                                  <FormItem className="min-w-0 flex-1 space-y-1">
                                    <FormLabel className="sr-only">
                                      Option {index + 1}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={`Option ${index + 1}`}
                                        className={touchInputClassName}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className={optionActionsClassName}>
                                <FormLabel
                                  htmlFor={`correct-${index}`}
                                  className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 font-normal"
                                >
                                  <RadioGroupItem
                                    value={String(index)}
                                    id={`correct-${index}`}
                                  />
                                  Correct
                                </FormLabel>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={touchIconButtonClassName}
                                  disabled={fields.length <= 2}
                                  onClick={() => remove(index)}
                                  aria-label={`Remove option ${index + 1}`}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        fields.map((item, index) => (
                          <div key={item.id} className={optionRowClassName}>
                            <FormField
                              control={form.control}
                              name={`options.${index}.optionText`}
                              render={({ field }) => (
                                <FormItem className="min-w-0 flex-1 space-y-1">
                                  <FormLabel className="sr-only">
                                    Option {index + 1}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={`Option ${index + 1}`}
                                      className={touchInputClassName}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className={optionActionsClassName}>
                              <FormField
                                control={form.control}
                                name={`options.${index}.isCorrect`}
                                render={({ field }) => (
                                  <FormItem className="flex min-h-11 flex-1 flex-row items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) =>
                                          field.onChange(checked === true)
                                        }
                                        id={`correct-${index}`}
                                      />
                                    </FormControl>
                                    <FormLabel
                                      htmlFor={`correct-${index}`}
                                      className="font-normal"
                                    >
                                      Correct
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={touchIconButtonClassName}
                                disabled={fields.length <= 2}
                                onClick={() => remove(index)}
                                aria-label={`Remove option ${index + 1}`}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}

                      {form.formState.errors.options?.root?.message ||
                      typeof form.formState.errors.options?.message === 'string' ? (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.options?.root?.message ??
                            form.formState.errors.options?.message}
                        </p>
                      ) : null}

                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 w-full sm:min-h-8 sm:w-auto"
                        onClick={() => append({ optionText: '', isCorrect: false })}
                      >
                        <Plus />
                        Add option
                      </Button>
                    </div>
                  )}
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Classification</FieldLegend>
                    <FieldDescription>
                      Optional subject, topic, and tags to help find this question later.
                    </FieldDescription>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mathematics"
                              maxLength={150}
                              className={touchInputClassName}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Number theory"
                              maxLength={150}
                              className={touchInputClassName}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tagIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        {tagsQuery.isLoading ? (
                          <Skeleton className="h-11 w-full sm:h-9" />
                        ) : (tagsQuery.data ?? []).length === 0 ? (
                          <FormDescription>
                            No tags yet. Create tags from the tags page.
                          </FormDescription>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(tagsQuery.data ?? []).map((tag) => {
                              const selected = field.value.includes(tag.id)
                              return (
                                <Button
                                  key={tag.id}
                                  type="button"
                                  size="sm"
                                  className="min-h-11 px-3 sm:min-h-8"
                                  variant={selected ? 'default' : 'outline'}
                                  onClick={() => {
                                    field.onChange(
                                      selected
                                        ? field.value.filter((tagId) => tagId !== tag.id)
                                        : [...field.value, tag.id],
                                    )
                                  }}
                                >
                                  {tag.name}
                                </Button>
                              )
                            })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Optional details</FieldLegend>
                    <FieldDescription>
                      Explanation and image are optional. Upload an image only when needed.
                    </FieldDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Shown after grading, when results are available."
                            className="min-h-20 text-base sm:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormLabel>Image</FormLabel>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Input
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        disabled={uploadMutation.isPending}
                        className={cn(
                          'w-full max-w-full sm:max-w-md',
                          touchInputClassName,
                          'file:mr-3 file:h-8',
                        )}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) uploadMutation.mutate(file)
                          event.target.value = ''
                        }}
                      />
                      {uploadMutation.isPending ? (
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Uploading…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Upload className="size-3.5 shrink-0" />
                          PNG, JPEG, or WebP · max 5 MB
                        </span>
                      )}
                    </div>

                    {imageUrl ? (
                      <div className="space-y-3">
                        <img
                          src={imageUrl}
                          alt="Question"
                          className="h-auto max-h-56 w-full rounded-lg border border-border object-contain sm:max-h-48 sm:w-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-11 w-full sm:min-h-8 sm:w-auto"
                          onClick={clearImage}
                        >
                          <X />
                          Remove image
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </FieldSet>
              </FieldGroup>
            </CardContent>

            <CardFooter className={formFooterClassName}>
              <Button
                type="button"
                variant="secondary"
                className={cn(formFooterButtonClassName, 'sm:hidden')}
                asChild
              >
                <Link to="/lecturer/questions">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className={formFooterButtonClassName}
                disabled={saveMutation.isPending || uploadMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isEdit ? 'Saving…' : 'Creating…'}
                  </>
                ) : isEdit ? (
                  'Save changes'
                ) : (
                  'Create question'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
