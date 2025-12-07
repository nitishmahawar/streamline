import { createFileRoute } from "@tanstack/react-router";
import { MembersTable } from "@/components/members/members-table";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";

export const Route = createFileRoute("/(dashboard)/members")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Members | Streamline",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your workspace members and invitations.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <MembersTable />
    </div>
  );
}
