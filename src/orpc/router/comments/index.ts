import { protectedProcedure } from "@/orpc";
import { prisma } from "@/lib/prisma";
import { InferRouterOutputs, ORPCError } from "@orpc/server";
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentByIdSchema,
  deleteCommentSchema,
  getCommentsByTaskSchema,
} from "./schema";

// Export the comments router
export const commentsRouter = {
  // Create a new comment
  create: protectedProcedure
    .input(createCommentSchema)
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Verify task belongs to the organization
      const task = await prisma.task.findFirst({
        where: {
          id: input.taskId,
          project: {
            organizationId,
          },
        },
      });

      if (!task) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      const comment = await prisma.comment.create({
        data: {
          content: input.content,
          taskId: input.taskId,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return comment;
    }),

  // Get all comments for a task
  list: protectedProcedure
    .input(getCommentsByTaskSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { taskId } = input;

      // Verify task belongs to the organization
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            organizationId,
          },
        },
      });

      if (!task) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      const comments = await prisma.comment.findMany({
        where: {
          taskId,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return comments;
    }),

  // Get comment by ID
  get: protectedProcedure
    .input(getCommentByIdSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const comment = await prisma.comment.findFirst({
        where: {
          id: input.id,
          task: {
            project: {
              organizationId,
            },
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!comment) {
        throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
      }

      return comment;
    }),

  // Update comment (only author can update)
  update: protectedProcedure
    .input(updateCommentSchema)
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { id, content } = input;

      // Check if comment exists, belongs to organization, and user is the author
      const existingComment = await prisma.comment.findFirst({
        where: {
          id,
          task: {
            project: {
              organizationId,
            },
          },
        },
      });

      if (!existingComment) {
        throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
      }

      if (existingComment.authorId !== userId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You can only edit your own comments",
        });
      }

      const comment = await prisma.comment.update({
        where: { id },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return comment;
    }),

  // Delete comment (only author can delete)
  delete: protectedProcedure
    .input(deleteCommentSchema)
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Check if comment exists, belongs to organization, and user is the author
      const existingComment = await prisma.comment.findFirst({
        where: {
          id: input.id,
          task: {
            project: {
              organizationId,
            },
          },
        },
      });

      if (!existingComment) {
        throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
      }

      if (existingComment.authorId !== userId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You can only delete your own comments",
        });
      }

      await prisma.comment.delete({
        where: { id: input.id },
      });

      return { success: true, id: input.id };
    }),
};

export type Comment = InferRouterOutputs<typeof commentsRouter>["list"][number];
