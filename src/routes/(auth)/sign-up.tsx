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

export const Route = createFileRoute("/(auth)/sign-up")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Sign Up | Streamline",
      },
    ],
  }),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

function RouteComponent() {
  const router = useRouter();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (data: SignUpFormValues) => {
    await authClient.signUp.email(data, {
      onRequest: () => {
        setLoading(true);
      },
      onResponse: () => {
        setLoading(false);
      },
      onSuccess: () => {
        form.reset();
        toast.success(
          "Verification email sent! Please check your inbox and click the verification link to complete your registration."
        );
        router.invalidate();
      },
      onError: (ctx) => {
        toast.error(ctx.error.message);
      },
    });
  };

  const handleGoogleSignUp = async () => {
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
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Get started with your free account today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter your full name"
                  aria-invalid={fieldState.invalid}
                  disabled={isAnyLoading}
                  autoComplete="name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  placeholder="Create a strong password"
                  aria-invalid={fieldState.invalid}
                  disabled={isAnyLoading}
                  autoComplete="new-password"
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
            Sign Up
          </Button>
        </form>
      </CardContent>
      <FieldSeparator className="mx-6 bg-card">Or continue with</FieldSeparator>
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
        Already have an account?{" "}
        <Link to="/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
