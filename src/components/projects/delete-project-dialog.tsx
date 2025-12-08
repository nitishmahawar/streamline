import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";
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
import { Spinner } from "@/components/ui/spinner";
import type { Project } from "@/orpc/router/projects";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteProjectDialog = ({
  project,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    orpc.projects.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Project deleted successfully!");
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.key() });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete project");
      },
    })
  );

  const handleDelete = () => {
    if (project) {
      deleteMutation.mutate({ id: project.id });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{project?.name}</span>
            ? This action cannot be undone. All tasks, labels, and comments
            associated with this project will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Spinner />}
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
