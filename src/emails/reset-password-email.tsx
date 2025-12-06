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

interface ResetPasswordEmailProps {
  userName?: string;
  resetUrl: string;
  unsubscribeUrl?: string;
}

const ResetPasswordEmail = ({
  userName,
  resetUrl,
  unsubscribeUrl,
}: ResetPasswordEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Reset your Streamline password</Preview>
        <Body className="bg-slate-50 font-sans py-[40px]">
          <Container className="mx-auto px-[20px] max-w-[580px]">
            <Section className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-[48px]">
              {/* Header */}
              <Section className="text-center mb-[32px]">
                <Heading className="text-slate-900 text-[24px] font-semibold leading-[32px] m-0 mb-[8px]">
                  {userName ? `Hi ${userName},` : ""} Reset your password
                </Heading>
                <Text className="text-slate-600 text-[16px] leading-[24px] m-0">
                  We received a request to reset your Streamline password. Click
                  the button below to create a new password.
                </Text>
              </Section>

              {/* Reset Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={resetUrl}
                  className="bg-slate-900 text-white px-[24px] py-[12px] rounded-[8px] text-[16px] font-medium no-underline box-border inline-block hover:bg-slate-800 transition-colors"
                >
                  Reset Password
                </Button>
              </Section>

              {/* Alternative Link */}
              <Section className="mb-[32px]">
                <Text className="text-slate-600 text-[14px] leading-[20px] m-0 text-center">
                  If the button doesn't work, copy and paste this link into your
                  browser:
                </Text>
                <Text className="text-slate-900 text-[14px] leading-[20px] m-0 mt-[8px] text-center break-all">
                  {resetUrl}
                </Text>
              </Section>

              {/* Security Note */}
              <Section className="border-t border-slate-200 pt-[24px]">
                <Text className="text-slate-500 text-[14px] leading-[20px] m-0">
                  <strong>Security note:</strong> This password reset link will
                  expire in 1 hour. If you didn't request a password reset, you
                  can safely ignore this email. Your password will remain
                  unchanged.
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

export default ResetPasswordEmail;
