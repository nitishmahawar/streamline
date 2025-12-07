import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MembersTableSkeleton } from "./members-skeleton";
import { MemberActionsMenu } from "./member-actions-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Users } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
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

export const MembersTable = () => {
  const { session } = useRouteContext({ from: "__root__" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["organization", session?.activeOrganizationId],
    queryFn: async () => {
      const { data, error } =
        await authClient.organization.getFullOrganization();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!session?.activeOrganizationId,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <MembersTableSkeleton />;
  }

  if (error) {
    return (
      <Empty>
        <EmptyMedia>
          <Users className="size-8" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Error loading members</EmptyTitle>
          <EmptyDescription>{error.message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const members = (data?.members as Member[]) || [];
  const invitations = (data?.invitations as Invitation[]) || [];
  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );

  if (members.length === 0 && pendingInvitations.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <Users className="size-8" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No members yet</EmptyTitle>
          <EmptyDescription>
            Invite team members to start collaborating.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={member.user.image ?? ""}
                      alt={member.user.name}
                    />
                    <AvatarFallback>
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getRoleBadgeVariant(member.role)}
                  className="capitalize"
                >
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(member.createdAt)}
              </TableCell>
              <TableCell>
                <MemberActionsMenu member={member} />
              </TableCell>
            </TableRow>
          ))}
          {pendingInvitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {invitation.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-muted-foreground">
                      Pending invitation
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getRoleBadgeVariant(invitation.role)}
                  className="capitalize"
                >
                  {invitation.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-600"
                >
                  Pending
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell>
                <MemberActionsMenu invitation={invitation} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
