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

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

export const RemoveMemberDialog = ({
  open,
  onOpenChange,
  member,
}: RemoveMemberDialogProps) => {
  const { session } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!member) return;
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: member.userId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      queryClient.invalidateQueries({
        queryKey: ["organization", session?.activeOrganizationId],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  const handleRemove = () => {
    removeMutation.mutate();
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{member.user.name}</strong>{" "}
            ({member.user.email}) from the workspace? They will lose access to
            all workspace resources.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={removeMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {removeMutation.isPending && <Spinner />}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
