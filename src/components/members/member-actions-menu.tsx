import { useState } from "react";
import { MoreHorizontal, UserMinus, XCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { CancelInviteDialog } from "./cancel-invite-dialog";
import { LeaveOrganizationDialog } from "./leave-organization-dialog";
import { useRouteContext } from "@tanstack/react-router";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
}

interface MemberActionsMenuProps {
  member?: Member;
  invitation?: Invitation;
}

export const MemberActionsMenu = ({
  member,
  invitation,
}: MemberActionsMenuProps) => {
  const { user } = useRouteContext({ from: "__root__" });
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isCancelInviteDialogOpen, setIsCancelInviteDialogOpen] =
    useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // Check if current user is viewing their own membership
  const isCurrentUser = member?.userId === user?.id;
  const isOwner = member?.role === "owner";

  // If it's an invitation, show cancel option
  if (invitation) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsCancelInviteDialogOpen(true)}
            >
              <XCircle className="size-4" />
              Cancel invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CancelInviteDialog
          open={isCancelInviteDialogOpen}
          onOpenChange={setIsCancelInviteDialogOpen}
          invitation={invitation}
        />
      </>
    );
  }

  // If it's a member
  if (member) {
    // Owner cannot be removed or leave
    if (isOwner) {
      return null;
    }

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isCurrentUser ? (
              // Current user can leave the organization
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsLeaveDialogOpen(true)}
              >
                <LogOut className="size-4" />
                Leave organization
              </DropdownMenuItem>
            ) : (
              // Other users can be removed by admins/owners
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsRemoveDialogOpen(true)}
              >
                <UserMinus className="size-4" />
                Remove member
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <RemoveMemberDialog
          open={isRemoveDialogOpen}
          onOpenChange={setIsRemoveDialogOpen}
          member={member}
        />

        <LeaveOrganizationDialog
          open={isLeaveDialogOpen}
          onOpenChange={setIsLeaveDialogOpen}
        />
      </>
    );
  }

  return null;
};
