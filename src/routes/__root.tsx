import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NotFound } from "@/components/not-found";
import { Error } from "@/components/error";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Toaster } from "@/components/ui/sonner";

interface MyRouterContext {
  queryClient: QueryClient;
}

const getSession = createServerFn({ method: "GET" }).handler(() =>
  auth.api.getSession({ headers: getRequestHeaders() })
);

// Auth routes that only unauthenticated users can access
const AUTH_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
];

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    const pathname = location.pathname;

    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    const isOnboardingRoute = pathname === "/onboarding";

    // If user is not signed in
    if (!session?.user) {
      // Allow access to auth routes only
      if (!isAuthRoute) {
        throw redirect({ to: "/sign-in" });
      }
    } else {
      // User is signed in
      const hasActiveOrganization = !!session.session?.activeOrganizationId;

      // Redirect signed-in users away from all auth routes
      if (isAuthRoute) {
        throw redirect({ to: hasActiveOrganization ? "/" : "/onboarding" });
      }

      // If signed in but no active organization, redirect to onboarding
      if (!hasActiveOrganization && !isOnboardingRoute) {
        throw redirect({ to: "/onboarding" });
      }

      // If signed in with active organization, don't allow access to onboarding
      if (hasActiveOrganization && isOnboardingRoute) {
        throw redirect({ to: "/" });
      }
    }

    return { user: session?.user!, session: session?.session! };
  },
  errorComponent: Error,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster richColors className="font-sans" />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
