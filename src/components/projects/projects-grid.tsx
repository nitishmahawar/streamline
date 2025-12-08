import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";
import { ProjectCard } from "./project-card";
import { ProjectsSkeleton } from "./projects-skeleton";
import { ProjectsEmpty } from "./projects-empty";
import { CreateProjectDialog } from "./create-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import type { Project } from "@/orpc/router/projects";

interface ProjectsGridProps {
  onCreateClick?: () => void;
}

export const ProjectsGrid = ({ onCreateClick }: ProjectsGridProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery(
    orpc.projects.list.queryOptions({
      input: {},
    })
  );

  const archiveMutation = useMutation(
    orpc.projects.archive.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success(
          variables.isArchived
            ? "Project archived successfully!"
            : "Project unarchived successfully!"
        );
        queryClient.invalidateQueries({ queryKey: orpc.projects.list.key() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update project");
      },
    })
  );

  const handleEdit = (project: Project) => {
    setEditProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeleteProject(project);
  };

  const handleArchive = (project: Project) => {
    archiveMutation.mutate({
      id: project.id,
      isArchived: !project.isArchived,
    });
  };

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      setCreateDialogOpen(true);
    }
  };

  if (isLoading) {
    return <ProjectsSkeleton />;
  }

  if (!projects || projects.length === 0) {
    return <ProjectsEmpty onCreateClick={handleCreateClick} />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
          />
        ))}
      </div>

      <EditProjectDialog
        project={editProject}
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
      />

      <DeleteProjectDialog
        project={deleteProject}
        open={!!deleteProject}
        onOpenChange={(open) => !open && setDeleteProject(null)}
      />
    </>
  );
};
