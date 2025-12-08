import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: ForgotPassword,
  head: () => ({
    meta: [
      {
        title: "Forgot Password | Streamline",
      },
    ],
  }),
});

function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    await authClient.requestPasswordReset(
      {
        email: data.email,
        redirectTo: "/reset-password",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onSuccess: () => {
          form.reset();
          router.navigate({ to: "/sign-in", replace: true });
          toast.success("Password reset instructions sent to your email");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot your password?</CardTitle>
        <CardDescription>
          No worries, we'll send you reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="Enter your email address"
                  aria-invalid={fieldState.invalid}
                  disabled={loading}
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" className="w-full relative" disabled={loading}>
            {form.formState.isSubmitting && <Spinner />}
            Send reset instructions
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Remember your password?{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
