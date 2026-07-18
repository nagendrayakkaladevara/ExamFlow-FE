import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { APP_NAME } from '@/config/constants'
import { useLoginMutation } from '@/features/auth/hooks'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { isApiError } from '@/lib/errors'
import {
  fadeIn,
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  motionTransition,
  scaleIn,
  staggerContainer,
} from '@/lib/motion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')
  const login = useLoginMutation(next)
  const reducedMotion = useReducedMotion()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const errorMessage =
    login.isError && isApiError(login.error)
      ? login.error.message
      : login.isError
        ? 'Unable to sign in. Please try again.'
        : null

  const itemTransition = motionTransition(reducedMotion ?? false, 0.25)
  const cardTransition = motionTransition(reducedMotion ?? false, 0.3, 0.1)

  return (
    <div className="flex min-h-svh">
      <motion.aside
        className="hidden w-1/2 flex-col justify-between border-r bg-background p-12 lg:flex"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.p
          className="text-sm font-semibold tracking-tight"
          variants={fadeInLeft}
          transition={itemTransition}
        >
          {APP_NAME}
        </motion.p>

        <motion.div
          className="max-w-md space-y-4"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-3xl font-semibold tracking-tight text-foreground"
            variants={fadeInLeft}
            transition={itemTransition}
          >
            Examinations designed for focus.
          </motion.h1>
          <motion.p
            className="text-base leading-relaxed text-muted-foreground"
            variants={fadeInLeft}
            transition={itemTransition}
          >
            A calm, professional platform for college assessments. Students stay
            focused. Lecturers work efficiently. Administrators maintain full
            oversight.
          </motion.p>
        </motion.div>

        <motion.p
          className="text-xs text-muted-foreground"
          variants={fadeIn}
          transition={motionTransition(reducedMotion ?? false, 0.25, 0.2)}
        >
          Student Assessment &amp; Learning Management Platform
        </motion.p>
      </motion.aside>

      <main className="flex flex-1 flex-col justify-center bg-muted/30 px-4 py-12 sm:px-8 lg:px-16">
        <motion.div
          className="mx-auto w-full max-w-sm"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="mb-8 space-y-2 lg:hidden"
            variants={fadeInUp}
            transition={itemTransition}
          >
            <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          </motion.div>

          <motion.div
            className="rounded-lg border bg-card p-8 shadow-sm"
            variants={scaleIn}
            transition={cardTransition}
          >
            <motion.div
              className="mb-8 hidden space-y-2 lg:block"
              variants={fadeInRight}
              transition={motionTransition(reducedMotion ?? false, 0.25, 0.15)}
            >
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account.
              </p>
            </motion.div>

            <motion.p
              className="mb-8 text-sm text-muted-foreground lg:hidden"
              variants={fadeInUp}
              transition={itemTransition}
            >
              Enter your credentials to access your account.
            </motion.p>

            <AnimatePresence mode="wait">
              {errorMessage ? (
                <motion.div
                  key="login-error"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={motionTransition(reducedMotion ?? false, 0.2)}
                  className="mb-6 overflow-hidden"
                >
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <Form {...form}>
              <motion.form
                className="space-y-6"
                onSubmit={form.handleSubmit((values) => login.mutate(values))}
                noValidate
                autoComplete="off"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} transition={itemTransition}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="off"
                            autoFocus
                            readOnly
                            placeholder="you@svecw.edu.in"
                            disabled={login.isPending}
                            onFocus={(e) => {
                              e.currentTarget.removeAttribute('readonly')
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={fadeInUp} transition={itemTransition}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            {...field}
                            autoComplete="off"
                            readOnly
                            disabled={login.isPending}
                            onFocus={(e) => {
                              e.currentTarget.removeAttribute('readonly')
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={fadeInUp} transition={itemTransition}>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={login.isPending}
                  >
                    {login.isPending ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden="true" />
                        Signing in
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </Form>
          </motion.div>

          <motion.p
            className="mt-8 text-center text-xs text-muted-foreground lg:hidden"
            variants={fadeIn}
            transition={motionTransition(reducedMotion ?? false, 0.25, 0.25)}
          >
            Student Assessment &amp; Learning Management Platform
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}
