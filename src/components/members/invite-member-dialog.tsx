import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const inviteSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
  role: z.enum(["member", "admin"], {
    error: "Please select a role",
  }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteMemberDialogProps {
  trigger?: React.ReactNode;
}

export const InviteMemberDialog = ({ trigger }: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const { session } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      const { error } = await authClient.organization.inviteMember({
        email: data.email,
        role: data.role,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      queryClient.invalidateQueries({
        queryKey: ["organization", session?.activeOrganizationId],
      });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const onSubmit = (data: InviteFormValues) => {
    inviteMutation.mutate(data);
  };

  const isLoading = inviteMutation.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Send an invitation to add a new member to your workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="colleague@example.com"
                  aria-invalid={fieldState.invalid}
                  disabled={isLoading}
                />
                <FieldDescription>
                  Enter the email address of the person you want to invite.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Admins can manage members and workspace settings.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
