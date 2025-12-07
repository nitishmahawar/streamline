import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { sendEmail } from "./resend";
import VerificationEmail from "@/emails/verification-email";
import ResetPasswordEmail from "@/emails/reset-password-email";
import WorkspaceInviteEmail from "@/emails/workspace-invite-email";
import { getUrl } from "./utils";

export const auth = betterAuth({
  appName: "Streamline",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your Streamline password",
          react: ResetPasswordEmail({
            userName: user.name,
            resetUrl: `${getUrl()}/reset-password?token=${token}`,
          }),
        });
      } catch (error) {
        console.error("Failed to send reset password email:", error);
      }
    },
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your Streamline account",
          react: VerificationEmail({
            userName: user.name,
            verificationUrl: url,
          }),
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
    autoSignInAfterVerification: true,
  },
  advanced: {
    database: { generateId: false },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await prisma.organization.findFirst({
            where: {
              members: { some: { userId: session.userId } },
            },
          });

          const organizationId = organization?.id || null;

          return {
            data: {
              ...session,
              activeOrganizationId: organizationId,
            },
          };
        },
      },
    },
  },
  plugins: [
    organization({
      sendInvitationEmail: async ({
        email,
        inviter,
        organization,
        invitation,
        role,
      }) => {
        try {
          await sendEmail({
            to: email,
            subject: `You're invited to join ${organization.name} on Streamline`,
            react: WorkspaceInviteEmail({
              inviterName: inviter.user.name,
              workspaceName: organization.name,
              inviteUrl: `${getUrl()}/accept-invitation?invite=${
                invitation.id
              }`,
              role: role,
            }),
          });
        } catch (error) {
          console.error("Failed to send workspace invitation email:", error);
        }
      },
      requireEmailVerificationOnInvitation: true,
    }),
  ],
});
