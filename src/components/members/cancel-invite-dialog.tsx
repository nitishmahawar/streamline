import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
}

interface CancelInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: Invitation | null;
}

export const CancelInviteDialog = ({
  open,
  onOpenChange,
  invitation,
}: CancelInviteDialogProps) => {
  const { session } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!invitation) return;
      const { error } = await authClient.organization.cancelInvitation({
        invitationId: invitation.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({
        queryKey: ["organization", session?.activeOrganizationId],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel invitation");
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  if (!invitation) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel invitation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel the invitation sent to{" "}
            <strong>{invitation.email}</strong>? They will no longer be able to
            join the workspace using this invitation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelMutation.isPending}>
            Keep invitation
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {cancelMutation.isPending && <Spinner />}
            Cancel invitation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
