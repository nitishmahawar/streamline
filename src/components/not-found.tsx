import { Link } from "@tanstack/react-router";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const NotFound = () => {
  return (
    <Empty className="h-screen">
      <EmptyMedia variant="icon">
        <FileQuestion className="size-6" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Page Not Found</EmptyTitle>
        <EmptyDescription>
          The page you are looking for doesn't exist or has been moved.
        </EmptyDescription>
      </EmptyHeader>
      <Button asChild>
        <Link to="/">Go to Home</Link>
      </Button>
    </Empty>
  );
};
