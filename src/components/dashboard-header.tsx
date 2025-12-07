import React from "react";
import { SidebarTrigger } from "./ui/sidebar";

export const DashboardHeader = () => {
  return (
    <header className="border-b h-12 flex items-center justify-between px-4 md:px-6">
      <SidebarTrigger />
    </header>
  );
};
