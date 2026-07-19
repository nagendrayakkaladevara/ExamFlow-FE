import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { PasswordInput } from '@/components/ui/password-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentBulkImport } from '@/features/users/components/StudentBulkImport'
import { usersApi } from '@/features/users/api'
import { isApiError } from '@/lib/errors'

const createUserSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['LECTURER', 'STUDENT']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

type CreateUserValues = z.infer<typeof createUserSchema>

const roleOptions = [
  {
    value: 'STUDENT' as const,
    label: 'Student',
    description: 'Can take assignments, view results, and participate in polls.',
  },
  {
    value: 'LECTURER' as const,
    label: 'Lecturer',
    description: 'Can manage questions, assignments, and class content.',
  },
]

function SingleUserForm() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'STUDENT',
      firstName: '',
      lastName: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: CreateUserValues) => usersApi.create(values),
    onSuccess: (user) => {
      toast.success('User created.')
      navigate(`/admin/users/${user.id}`)
    },
    onError: (error) => {
      const message = isApiError(error) ? error.message : 'Unable to create user.'
      setSubmitError(message)
      toast.error(message)
    },
  })

  return (
    <Card className="gap-0 py-0 shadow-sm">
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
          <CardContent className="space-y-0 pt-6">
            {submitError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup>
              <FieldSet className="gap-4">
                <div className="space-y-1">
                  <FieldLegend variant="legend">Profile</FieldLegend>
                  <FieldDescription>
                    Basic identity details for the new account.
                  </FieldDescription>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input autoComplete="given-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input autoComplete="family-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FieldSet>

              <FieldSeparator />

              <FieldSet className="gap-4">
                <div className="space-y-1">
                  <FieldLegend variant="legend">Account</FieldLegend>
                  <FieldDescription>Sign-in email and platform role.</FieldDescription>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used as the username for signing in.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <RadioGroup
                            className="grid gap-3 sm:grid-cols-2"
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            {roleOptions.map((option) => (
                              <FieldLabel
                                key={option.value}
                                htmlFor={`role-${option.value}`}
                              >
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>{option.label}</FieldTitle>
                                    <FieldDescription>
                                      {option.description}
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`role-${option.value}`}
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
                </div>
              </FieldSet>

              <FieldSeparator />

              <FieldSet className="gap-4">
                <div className="space-y-1">
                  <FieldLegend variant="legend">Security</FieldLegend>
                  <FieldDescription>
                    Set an initial password. The user can change it after signing in.
                  </FieldDescription>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormDescription>Must be at least 8 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldSet>
            </FieldGroup>
          </CardContent>

          <CardFooter className="justify-end border-t bg-muted/20 py-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create user'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export function UserCreatePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'bulk' ? 'bulk' : 'single'

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Add user"
        description={
          activeTab === 'bulk'
            ? 'Import student accounts from an Excel spreadsheet in three steps.'
            : 'Create a single lecturer or student account.'
        }
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/users">Cancel</Link>
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setSearchParams(value === 'bulk' ? { tab: 'bulk' } : {})
        }}
      >
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="single">Single user</TabsTrigger>
          <TabsTrigger value="bulk">Bulk import students</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-6">
          <SingleUserForm />
        </TabsContent>
        <TabsContent value="bulk" className="mt-6">
          <StudentBulkImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
