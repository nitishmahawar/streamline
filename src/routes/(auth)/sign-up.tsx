import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Google } from '@/components/icons/google'
import { authClient } from '@/lib/auth-client'
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
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Sign Up | Baseline',
      },
    ],
  }),
})

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    ),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

function RouteComponent() {
  const router = useRouter()
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const onSubmit = async (data: SignUpFormValues) => {
    await authClient.signUp.email(data, {
      onRequest: () => {
        setLoading(true)
      },
      onResponse: () => {
        setLoading(false)
      },
      onSuccess: () => {
        form.reset()
        toast.success(
          'Verification email sent! Please check your inbox and click the verification link to complete your registration.',
        )
        router.invalidate()
      },
      onError: (ctx) => {
        toast.error(ctx.error.message)
      },
    })
  }

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social(
      { provider: 'google' },
      {
        onRequest: () => {
          setGoogleLoading(true)
        },
        onResponse: () => {
          setGoogleLoading(false)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
      },
    )
  }

  const isAnyLoading = loading || googleLoading

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={isAnyLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      {...field}
                      disabled={isAnyLoading}
                    />
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
                    <PasswordInput
                      placeholder="Create a strong password"
                      {...field}
                      disabled={isAnyLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full relative"
              disabled={isAnyLoading}
            >
              {form.formState.isSubmitting && <Spinner />}
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-muted-foreground bg-card">
            Or continue with
          </span>
        </div>
      </div>
      <CardFooter className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={isAnyLoading}
          className="w-full relative"
        >
          {googleLoading ? <Spinner /> : <Google />}
          Continue with Google
        </Button>
      </CardFooter>
      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
