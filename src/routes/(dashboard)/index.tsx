import { SidebarTrigger } from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SidebarTrigger />
    </div>
  );
}
