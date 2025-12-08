import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export const Route = createFileRoute("/(dashboard)/projects/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Projects | Streamline",
      },
    ],
  }),
});

function RouteComponent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and organize tasks with Kanban boards.
          </p>
        </div>
        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>

      <ProjectsGrid onCreateClick={() => setCreateDialogOpen(true)} />
    </div>
  );
}
