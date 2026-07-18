import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
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

function SingleUserForm() {
  const navigate = useNavigate()
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
      toast.error(isApiError(error) ? error.message : 'Unable to create user.')
    },
  })

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
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
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      {...field}
                    >
                      <option value="LECTURER">Lecturer</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                Create user
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/users">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function UserCreatePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'bulk' ? 'bulk' : 'single'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Add user"
        description="Create one account or import many students from Excel."
      />
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setSearchParams(value === 'bulk' ? { tab: 'bulk' } : {})
        }}
      >
        <TabsList>
          <TabsTrigger value="single">Single user</TabsTrigger>
          <TabsTrigger value="bulk">Bulk import students</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <SingleUserForm />
        </TabsContent>
        <TabsContent value="bulk">
          <StudentBulkImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
