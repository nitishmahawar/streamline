import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Mail, UserPlus, ArrowRight, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const acceptInvitationSearchSchema = z.object({
  invite: z.string().default(''),
})

export const Route = createFileRoute('/(auth)/accept-invitation')({
  component: RouteComponent,
  validateSearch: acceptInvitationSearchSchema,
  head: () => ({
    meta: [
      {
        title: 'Accept Invitation | Baseline',
      },
    ],
  }),
})

function RouteComponent() {
  const { invite } = Route.useSearch()

  if (!invite) {
    return (
      <Alert variant="destructive" className="w-full max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Invitation</AlertTitle>
        <AlertDescription>
          The invitation link is invalid or has expired. Please contact the
          person who invited you for a new invitation.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="size-8 text-primary" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">You've been invited!</CardTitle>
          <CardDescription className="text-base">Join the team</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="size-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  You've been invited to join an organization on Baseline.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please sign in or create an account to accept this invitation.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invitation ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {invite}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to="/sign-in" search={{ invite }}>
              Sign in to accept invitation
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By accepting this invitation, you agree to join the organization and
          collaborate with the team.
        </p>
      </CardContent>
    </Card>
  )
}
