import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)/onboarding")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Create Workspace | Streamline",
      },
    ],
  }),
});

const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Workspace URL is required")
    .max(50, "Workspace URL must be less than 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Workspace URL must be lowercase letters, numbers, and hyphens only"
    ),
  metadata: z
    .object({
      description: z.string().optional(),
    })
    .optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

function RouteComponent() {
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      slug: "",
      metadata: {
        description: "",
      },
    },
  });

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
              resolve();
            },
            onError: (ctx: { error: { message: string } }) => {
              reject(
                new Error(ctx.error.message || "Failed to create workspace")
              );
            },
          }
        );
      });
    },
    onSuccess: () => {
      toast.success("Workspace created successfully!");
      router.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create workspace");
    },
  });

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Track if slug was manually edited
  const isSlugManuallyEdited = (
    currentSlug: string,
    currentName: string
  ): boolean => {
    const expectedSlug = generateSlug(currentName);
    return currentSlug !== expectedSlug && currentSlug !== "";
  };

  const handleNameChange = (value: string, previousName: string) => {
    const currentSlug = form.getValues("slug");
    // Only auto-update slug if it hasn't been manually edited
    if (!isSlugManuallyEdited(currentSlug, previousName)) {
      const newSlug = generateSlug(value);
      form.setValue("slug", newSlug);
    }
  };

  const onSubmit = (data: OnboardingFormValues) => {
    createWorkspaceMutation.mutate(data);
  };

  const isAnyLoading =
    createWorkspaceMutation.isPending || form.formState.isSubmitting;

  return (
    <Card className="w-full max-w-md relative">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create Your Workspace</CardTitle>
        <CardDescription>
          Set up your workspace to start collaborating with your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g., Acme Inc, My Team"
                  aria-invalid={fieldState.invalid}
                  disabled={isAnyLoading}
                  onChange={(e) => {
                    const previousName = field.value;
                    field.onChange(e);
                    handleNameChange(e.target.value, previousName);
                  }}
                />
                <FieldDescription>
                  The name of your organization or team
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Workspace URL</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g., acme-inc, my-team"
                  aria-invalid={fieldState.invalid}
                  disabled={isAnyLoading}
                />
                <FieldDescription>
                  A unique URL for your workspace. Only lowercase letters,
                  numbers, and hyphens.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="metadata.description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="workspace-description">
                  Description{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </FieldLabel>
                <Textarea
                  {...field}
                  id="workspace-description"
                  placeholder="Tell us about your workspace..."
                  className="resize-none"
                  rows={4}
                  aria-invalid={fieldState.invalid}
                  disabled={isAnyLoading}
                />
                <FieldDescription>
                  A brief description of your workspace
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isAnyLoading}>
              {isAnyLoading && <Spinner />}
              Create Workspace
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
