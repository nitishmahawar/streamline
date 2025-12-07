import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ErrorProps {
  error?: Error;
  reset?: () => void;
}

export const Error = ({ error, reset }: ErrorProps) => {
  const router = useRouter();

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      router.invalidate();
    }
  };

  return (
    <Empty className="h-screen">
      <EmptyMedia variant="icon">
        <AlertTriangle className="size-6" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Something Went Wrong</EmptyTitle>
        <EmptyDescription>
          {error?.message || "An unexpected error occurred. Please try again."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
};
