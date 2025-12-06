import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Google } from "@/components/icons/google";
import { authClient } from "@/lib/auth-client";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/(auth)/sign-in")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Sign In | Streamline",
      },
    ],
  }),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function RouteComponent() {
  const router = useRouter();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (data: SignInFormValues) => {
    await authClient.signIn.email(data, {
      onRequest: () => {
        setLoading(true);
      },
      onResponse: () => {
        setLoading(false);
      },
      onSuccess: () => {
        router.navigate({ to: "/" });
      },
      onError: (ctx) => {
        toast.error(ctx.error.message);
      },
    });
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social(
      { provider: "google" },
      {
        onRequest: () => {
          setGoogleLoading(true);
        },
        onResponse: () => {
          setGoogleLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <Card className="w-full max-w-sm relative">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your workspace</CardDescription>
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
                  disabled={isAnyLoading}
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="inline-flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder="Enter your password"
                  aria-invalid={fieldState.invalid}
                  disabled={isAnyLoading}
                  autoComplete="current-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            type="submit"
            className="w-full relative"
            disabled={isAnyLoading}
          >
            {form.formState.isSubmitting && <Spinner />}
            Sign In
          </Button>
        </form>
      </CardContent>
      <FieldSeparator className="mx-6 bg-card">Or continue with</FieldSeparator>
      <CardFooter className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isAnyLoading}
          className="w-full relative"
        >
          {googleLoading ? <Spinner /> : <Google />}
          Continue with Google
        </Button>
      </CardFooter>
      <p className="text-sm text-muted-foreground text-center">
        Don't have an account?{" "}
        <Link to="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
