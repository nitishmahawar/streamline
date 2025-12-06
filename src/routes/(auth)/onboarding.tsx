import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/(auth)/onboarding')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Create Workspace | Baseline',
      },
    ],
  }),
})

const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Workspace URL is required')
    .max(50, 'Workspace URL must be less than 50 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Workspace URL must be lowercase letters, numbers, and hyphens only',
    ),
  metadata: z
    .object({
      description: z.string().optional(),
    })
    .optional(),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

function RouteComponent() {
  const router = useRouter()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      slug: '',
      metadata: {
        description: '',
      },
    },
  })

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      return new Promise<void>((resolve, reject) => {
        authClient.organization.create(
          {
            name: data.name,
            slug: data.slug,
            metadata: data.metadata,
          },
          {
            onSuccess: () => {
              resolve()
            },
            onError: (ctx) => {
              reject(
                new Error(ctx.error.message || 'Failed to create workspace'),
              )
            },
          },
        )
      })
    },
    onSuccess: () => {
      toast.success('Workspace created successfully!')
      router.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create workspace')
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const currentSlug = form.getValues('slug')
    if (!currentSlug || currentSlug === generateSlug(form.getValues('name'))) {
      const newSlug = generateSlug(value)
      form.setValue('slug', newSlug)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const onSubmit = (data: OnboardingFormValues) => {
    createWorkspaceMutation.mutate(data)
  }

  const isAnyLoading =
    createWorkspaceMutation.isPending || form.formState.isSubmitting

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create Your Workspace</CardTitle>
        <CardDescription>
          Set up your workspace to start collaborating with your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Acme Inc, My Team"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                      disabled={isAnyLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your organization or team
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., acme-inc, my-team"
                      {...field}
                      disabled={isAnyLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique URL for your workspace. Only lowercase letters,
                    numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your workspace..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={isAnyLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your workspace
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={isAnyLoading}>
                {isAnyLoading && <Spinner />}
                Create Workspace
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
