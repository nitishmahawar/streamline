import { auth } from "@/lib/auth";
import { ORPCError, os } from "@orpc/server";

export const publicProcedure = os;

export const protectedProcedure = os
  .$context<{ headers: Headers }>()
  .use(async ({ context, next }) => {
    const session = await auth.api.getSession({ headers: context.headers });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
    }

    return next({ context: { ...session } });
  });
