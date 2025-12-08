import { FolderKanban, Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

interface ProjectsEmptyProps {
  onCreateClick: () => void;
}

export const ProjectsEmpty = ({ onCreateClick }: ProjectsEmptyProps) => {
  return (
    <Empty className="min-h-[400px] border">
      <EmptyMedia variant="icon">
        <FolderKanban />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create your first project to start organizing tasks and collaborating
          with your team.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreateClick}>
          <Plus />
          Create Project
        </Button>
      </EmptyContent>
    </Empty>
  );
};
