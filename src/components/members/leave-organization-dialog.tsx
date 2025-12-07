import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useRouteContext } from "@tanstack/react-router";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

interface LeaveOrganizationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const LeaveOrganizationDialog = ({
  open,
  onOpenChange,
  trigger,
}: LeaveOrganizationDialogProps) => {
  const { session } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const queryClient = useQueryClient();

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.organization.leave({
        organizationId: session?.activeOrganizationId!,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("You have left the organization");
      queryClient.invalidateQueries({
        queryKey: ["organization", session?.activeOrganizationId],
      });
      onOpenChange?.(false);
      router.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave organization");
    },
  });

  const handleLeave = () => {
    leaveMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave organization</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave this organization? You will lose
            access to all workspace resources and will need to be re-invited to
            rejoin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={leaveMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {leaveMutation.isPending && <Spinner />}
            Leave Organization
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
