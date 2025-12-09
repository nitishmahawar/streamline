---
trigger: always_on
---

# Streamline Project Rules

## Stack Overview

- **Framework**: TanStack Start (SSR) + Vite + React 19
- **Styling**: Tailwind CSS v4 with `tw-animate-css`
- **API**: ORPC (typed RPC) with TanStack Query
- **Database**: Prisma ORM with Neon PostgreSQL
- **Auth**: better-auth with organization plugin
- **UI Components**: shadcn/ui (Radix-based)
- **Forms**: react-hook-form + Zod v4
- **Package Manager**: pnpm

## File Naming Conventions

- Use **kebab-case** for all file names: `create-project-dialog.tsx`
- Component files use `.tsx`, utilities use `.ts`
- Route files follow TanStack Router conventions: `(group)/route.tsx`, `$param.tsx`

## Code Style

- **Arrow functions** over regular functions
- **Interfaces** over types
- Single quotes in imports, double quotes in JSX
- No semicolons (project uses no-semi style)

## Component Patterns

### Dialog Components

```tsx
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"

interface DialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const ExampleDialog = ({ trigger, open: controlledOpen, onOpenChange }: DialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const form = useForm({ resolver: zodResolver(schema), defaultValues: {...} })

  // Use Controller + Field pattern
  <Controller
    name="fieldName"
    control={form.control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>Label</FieldLabel>
        <Input {...field} id={field.name} aria-invalid={fieldState.invalid} disabled={isLoading} />
        <FieldDescription>Helper text</FieldDescription>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
}
```

### Form Field Components

Use `Field` system from `@/components/ui/field`:

- `Field` - Container with `data-invalid` attribute
- `FieldLabel` - Label with proper styling
- `FieldDescription` - Helper text below input
- `FieldError` - Error display with `errors` prop accepting array

### Auto-generating Slugs

```tsx
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const isSlugManuallyEdited = (
  currentSlug: string,
  currentName: string
): boolean => {
  const expectedSlug = generateSlug(currentName);
  return currentSlug !== expectedSlug && currentSlug !== "";
};

const handleNameChange = (value: string, previousName: string) => {
  if (!isSlugManuallyEdited(form.getValues("slug"), previousName)) {
    form.setValue("slug", generateSlug(value));
  }
};
```

## ORPC Patterns

### Router Definition

```tsx
// src/orpc/router/feature/index.ts
import { protectedProcedure } from "@/orpc";
import { prisma } from "@/lib/prisma";
import { ORPCError } from "@orpc/server";
import { createSchema, updateSchema } from "./schema";

export const featureRouter = {
  create: protectedProcedure
    .input(createSchema)
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization",
        });
      }

      return prisma.model.create({ data: { ...input, organizationId } });
    }),
};
```

### Schema Definition

```tsx
// src/orpc/router/feature/schema.ts
import { z } from "zod";

export const createSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }).max(100),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional(),
});

export type CreateInput = z.infer<typeof createSchema>;
```

### Client Usage

```tsx
import { orpc } from "@/orpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Queries
const { data, isPending } = useQuery(orpc.feature.list.queryOptions());

// Mutations
const mutation = useMutation(
  orpc.feature.create.mutationOptions({
    onSuccess: () => {
      toast.success("Created!");
      queryClient.invalidateQueries({ queryKey: orpc.feature.list.key() });
    },
    onError: (error) => toast.error(error.message),
  })
);
```

## Authentication

```tsx
import { authClient } from "@/lib/auth-client";
import { useRouteContext } from "@tanstack/react-router";

// Get user/session
const { user, session } = useRouteContext({ from: "__root__" });

// Auth client hooks
const { data: organizations } = authClient.useListOrganizations();

// Organization operations
await authClient.organization.create({ name, slug });
await authClient.organization.setActive({ organizationId });
await authClient.signOut();
```

## UI Components

### Import Patterns

```tsx
// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Field components for forms
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

// Icons
import { Plus, Trash2, Settings } from "lucide-react";
```

### Common UI Patterns

- Use `Spinner` from `@/components/ui/spinner` for loading states
- Use `Skeleton` for loading placeholders
- Use `toast` from `sonner` for notifications
- Use `cn()` from `@/lib/utils` for className merging

## Route Structure

```
src/routes/
├── __root.tsx              # Root layout with providers
├── (auth)/                 # Auth routes (sign-in, sign-up, etc.)
│   ├── route.tsx           # Auth layout
│   └── sign-in.tsx
├── (dashboard)/            # Protected dashboard routes
│   ├── route.tsx           # Dashboard layout with sidebar
│   ├── index.tsx           # Dashboard home
│   ├── projects/
│   │   ├── index.tsx       # Projects list
│   │   └── $projectId.tsx  # Project detail
│   └── members.tsx
└── api.*.ts                # API routes
```

## Workspace/Organization

- The app uses "workspace" as user-facing term for organizations
- Use `session.activeOrganizationId` for organization-scoped queries
- Always validate activeOrganizationId exists before org-scoped operations

## Color & Icon Pickers

For project colors/icons, use constants from:

```tsx
import {
  PROJECT_COLORS,
  PROJECT_ICONS,
  getProjectIcon,
} from "@/components/projects/project-constants";
```
