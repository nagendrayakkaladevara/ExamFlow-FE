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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentBulkImport } from '@/features/users/components/StudentBulkImport'
import { usersApi } from '@/features/users/api'
import { cn } from '@/lib/utils'
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

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
    <div className="rounded-lg border bg-background">
      <Form {...form}>
        <form
          className="divide-y"
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
          <div className="space-y-8 p-6">
            {submitError ? (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <FormSection
              title="Profile"
              description="Basic identity details for the new account."
            >
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
            </FormSection>

            <Separator />

            <FormSection
              title="Account"
              description="Sign-in email and platform role."
            >
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
                        <div className="grid gap-3 sm:grid-cols-2">
                          {roleOptions.map((option) => (
                            <label
                              key={option.value}
                              className={cn(
                                'flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors',
                                field.value === option.value
                                  ? 'border-foreground bg-muted/50'
                                  : 'border-border hover:bg-muted/30',
                              )}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                value={option.value}
                                checked={field.value === option.value}
                                onChange={() => field.onChange(option.value)}
                              />
                              <span className="text-sm font-medium">{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <Separator />

            <FormSection
              title="Security"
              description="Set an initial password. The user can change it after signing in."
            >
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
            </FormSection>
          </div>

          <div className="flex items-center justify-end bg-muted/20 px-6 py-4">
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
          </div>
        </form>
      </Form>
    </div>
  )
}

export function UserCreatePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'bulk' ? 'bulk' : 'single'

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Add user"
        description="Create one account or import many students from Excel."
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
