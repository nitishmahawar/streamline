import {
  Link,
  createFileRoute,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordSearch {
  token?: string;
  email?: string;
}

export const Route = createFileRoute("/(auth)/reset-password")({
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: (search.token as string) || undefined,
    email: (search.email as string) || undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "Reset Password | Streamline",
      },
    ],
  }),
});

function ResetPassword() {
  const router = useRouter();
  const { token } = useSearch({ from: "/(auth)/reset-password" });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: data.password,
        token,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onSuccess: () => {
          toast.success(
            "Password reset successful! You can now sign in with your new password."
          );
          router.navigate({ to: "/sign-in" });
        },
        onError: (ctx: { error: { message: string } }) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  if (tokenError) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Invalid Request</CardTitle>
          <CardDescription>{tokenError}</CardDescription>
        </CardHeader>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Request a new password reset link
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>
          Choose a strong password to secure your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder="Enter your new password"
                  aria-invalid={fieldState.invalid}
                  disabled={loading}
                  autoComplete="new-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder="Confirm your new password"
                  aria-invalid={fieldState.invalid}
                  disabled={loading}
                  autoComplete="new-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner />}
            Reset Password
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
