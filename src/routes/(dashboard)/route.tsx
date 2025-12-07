import { Outlet, createFileRoute } from "@tanstack/react-router";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { NotFound } from "@/components/not-found";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export const Route = createFileRoute("/(dashboard)")({
  component: RouteComponent,
  notFoundComponent: NotFound,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <div className="space-y-4 pb-6 w-full">
        <DashboardHeader />
        <div className="px-4 md:px-6">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
