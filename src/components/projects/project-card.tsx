import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  ListTodo,
  Tags,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProjectIcon } from "./project-constants";
import type { Project } from "@/orpc/router/projects";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive: (project: Project) => void;
}

export const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onArchive,
}: ProjectCardProps) => {
  const IconComponent = getProjectIcon(project.icon);

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {/* Color accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: project.color || "#6366f1" }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            className="flex items-center gap-2 min-w-0 flex-1"
          >
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: `${project.color}20` || "#6366f120" }}
            >
              <IconComponent
                className="size-4"
                style={{ color: project.color || "#6366f1" }}
              />
            </div>
            <CardTitle className="truncate text-base">{project.name}</CardTitle>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(project)}>
                <Archive />
                {project.isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(project)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ListTodo className="size-3.5" />
            <span>{project._count.tasks} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Tags className="size-3.5" />
            <span>{project._count.labels} labels</span>
          </div>
        </div>

        {project.isArchived && (
          <div className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Archived
          </div>
        )}
      </CardContent>
    </Card>
  );
};
