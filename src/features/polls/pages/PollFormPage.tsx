import { Link, useNavigate } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { AudiencePicker } from '@/components/shared/AudiencePicker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { pollsApi } from '@/features/polls/api'
import {
  pollFormSchema,
  pollResultVisibilityOptions,
  type PollFormValues,
} from '@/features/polls/schemas'
import { useAuthStore } from '@/features/auth/store'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import { isApiError } from '@/lib/errors'
import { useRoleBasePath } from '@/hooks/useRolePath'
import { useState } from 'react'

const formFooterClassName =
  'flex w-full min-w-0 flex-col gap-3 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:px-6'
const formFooterButtonClassName = 'min-h-11 w-full max-w-full sm:min-h-9 sm:w-auto'

const defaultValues: PollFormValues = {
  title: '',
  description: '',
  publishAt: toDatetimeLocalValue(new Date().toISOString()),
  expireAt: '',
  resultVisibility: 'AFTER_VOTE',
  audiences: [],
  options: [{ optionText: '' }, { optionText: '' }],
}

export function PollFormPage() {
  const role = useAuthStore((s) => s.user!.role)
  const basePath = useRoleBasePath()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  const mutation = useMutation({
    mutationFn: (values: PollFormValues) =>
      pollsApi.create({
        title: values.title,
        description: values.description || null,
        publishAt: fromDatetimeLocalValue(values.publishAt),
        expireAt: fromDatetimeLocalValue(values.expireAt),
        resultVisibility: values.resultVisibility,
        audiences: values.audiences,
        options: values.options
          .filter((option) => option.optionText.trim())
          .map((option, sortOrder) => ({ optionText: option.optionText.trim(), sortOrder })),
      }),
    onSuccess: (poll) => {
      toast.success('Poll created.')
      navigate(`${basePath}/polls/${poll.id}`)
    },
    onError: (error) => {
      const message = isApiError(error) ? error.message : 'Unable to create poll.'
      setSubmitError(message)
      toast.error(message)
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

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (values) => {
                setSubmitError(null)
                mutation.mutate(values)
              },
              () => {
                setSubmitError('Please fix the highlighted fields below.')
              },
            )}
          >
            <CardContent className="space-y-0 px-4 pt-4 sm:px-6 sm:pt-6">
              {submitError ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <FieldGroup className="gap-6">
                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Poll details</FieldLegend>
                    <FieldDescription>
                      Add a clear title and optional description for your poll.
                    </FieldDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Which topic should we cover next?" {...field} />
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
                            placeholder="Optional context for voters."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional supporting details for the poll.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Schedule</FieldLegend>
                    <FieldDescription>
                      Set when the poll goes live and when voting closes.
                    </FieldDescription>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="publishAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publish at</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expireAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires at</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="resultVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Results visibility</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pollResultVisibilityOptions.map((option) => (
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
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Options</FieldLegend>
                    <FieldDescription>Add at least two choices for voters.</FieldDescription>
                  </div>

                  <div className="space-y-3">
                    {fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name={`options.${index}.optionText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index > 0 ? 'sr-only' : undefined}>
                              Option {index + 1}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    {typeof form.formState.errors.options?.message === 'string' ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.options.message}
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ optionText: '' })}
                    >
                      <Plus className="size-4" />
                      Add option
                    </Button>
                  </div>
                </FieldSet>

                <FieldSeparator />

                <FieldSet className="gap-4">
                  <div className="space-y-1">
                    <FieldLegend variant="legend">Audience</FieldLegend>
                    <FieldDescription>
                      Choose who can see and vote on this poll.
                    </FieldDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="audiences"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <AudiencePicker
                            role={role}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldSet>
              </FieldGroup>
            </CardContent>

            <CardFooter className={formFooterClassName}>
              <Button
                type="submit"
                className={formFooterButtonClassName}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create poll'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
