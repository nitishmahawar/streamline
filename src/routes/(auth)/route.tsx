import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";

export const Route = createFileRoute("/(auth)")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  const showBackground = ["/sign-in", "/sign-up", "/onboarding"].includes(
    location.pathname
  );

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 relative">
      {/* Diagonal Fade Center Grid Background */}
      {showBackground && (
        <div
          className="absolute inset-0 z-0 dark:invert"
          style={{
            backgroundImage: `
          linear-gradient(to right, #d1d5db 1px, transparent 1px),
          linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
        `,
            backgroundSize: "32px 32px",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
          }}
        />
      )}
      <Image
        layout="fullWidth"
        src="/logo-word.svg"
        alt="logo"
        className="h-7 w-auto dark:invert"
      />
      <Outlet />
    </div>
  );
}
