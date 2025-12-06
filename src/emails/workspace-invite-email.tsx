import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface WorkspaceInviteEmailProps {
  userName?: string;
  inviterName: string;
  workspaceName: string;
  inviteUrl: string;
  role?: string;
  unsubscribeUrl?: string;
}

const WorkspaceInviteEmail = ({
  userName,
  inviterName,
  workspaceName,
  inviteUrl,
  role = "member",
  unsubscribeUrl,
}: WorkspaceInviteEmailProps) => {
  const getRoleDescription = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "as an owner with full administrative privileges";
      case "admin":
        return "as an admin with management capabilities";
      case "member":
        return "as a team member";
      default:
        return `as a ${role}`;
    }
  };

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>You're invited to join {workspaceName} on Streamline</Preview>
        <Body className="bg-slate-50 font-sans py-[40px]">
          <Container className="mx-auto px-[20px] max-w-[580px]">
            <Section className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-[48px]">
              {/* Header */}
              <Section className="text-center mb-[32px]">
                <Heading className="text-slate-900 text-[24px] font-semibold leading-[32px] m-0 mb-[8px]">
                  {userName ? `Hi ${userName},` : ""} You're invited to join{" "}
                  {workspaceName}
                </Heading>
                <Text className="text-slate-600 text-[16px] leading-[24px] m-0">
                  {inviterName} has invited you to join {workspaceName} on
                  Streamline {getRoleDescription(role)}.
                </Text>
              </Section>

              {/* Workspace Info */}
              <Section className="bg-slate-50 rounded-[8px] p-[24px] mb-[32px]">
                <div className="text-center">
                  <Text className="text-slate-900 text-[18px] font-semibold leading-[24px] m-0 mb-[4px]">
                    {workspaceName}
                  </Text>
                  <Text className="text-slate-600 text-[14px] leading-[20px] m-0 capitalize">
                    Role: {role}
                  </Text>
                </div>
              </Section>

              {/* Accept Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={inviteUrl}
                  className="bg-slate-900 text-white px-[24px] py-[12px] rounded-[8px] text-[16px] font-medium no-underline box-border inline-block hover:bg-slate-800 transition-colors"
                >
                  Accept Invitation
                </Button>
              </Section>

              {/* Alternative Link */}
              <Section className="mb-[32px]">
                <Text className="text-slate-600 text-[14px] leading-[20px] m-0 text-center">
                  If the button doesn't work, copy and paste this link into your
                  browser:
                </Text>
                <Text className="text-slate-900 text-[14px] leading-[20px] m-0 mt-[8px] text-center break-all">
                  {inviteUrl}
                </Text>
              </Section>

              {/* Invitation Details */}
              <Section className="border-t border-slate-200 pt-[24px]">
                <Text className="text-slate-500 text-[14px] leading-[20px] m-0">
                  <strong>Invitation details:</strong>
                </Text>
                <ul className="text-slate-600 text-[14px] leading-[20px] mt-[8px] mb-0 pl-[20px]">
                  <li>Invited by: {inviterName}</li>
                  <li>Workspace: {workspaceName}</li>
                  <li>Role: {role}</li>
                  <li>This invitation will expire in 7 days</li>
                </ul>
              </Section>

              {/* Security Note */}
              <Section className="mt-[24px]">
                <Text className="text-slate-500 text-[14px] leading-[20px] m-0">
                  <strong>Security note:</strong> If you weren't expecting this
                  invitation, you can safely ignore this email.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="mt-[32px] text-center">
              <Text className="text-slate-500 text-[12px] leading-[16px] m-0">
                © {new Date().getFullYear()} Streamline. All rights reserved.
              </Text>
              {unsubscribeUrl && (
                <Text className="text-slate-500 text-[12px] leading-[16px] m-0 mt-[8px]">
                  <a href={unsubscribeUrl} className="text-slate-500 underline">
                    Unsubscribe
                  </a>
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WorkspaceInviteEmail;
