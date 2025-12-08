import { protectedProcedure } from "@/orpc";
import { prisma } from "@/lib/prisma";
import { InferRouterOutputs, ORPCError } from "@orpc/server";
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskByIdSchema,
  deleteTaskSchema,
  getTasksByProjectSchema,
  updateTaskPositionSchema,
  bulkUpdateTaskPositionsSchema,
  updateTaskAssigneesSchema,
  updateTaskLabelsSchema,
} from "./schema";

// Helper to get the next position for a task in a status column
const getNextPosition = async (projectId: string, status: string) => {
  const lastTask = await prisma.task.findFirst({
    where: { projectId, status: status as any },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (lastTask?.position ?? -1) + 1;
};

// Export the tasks router
export const tasksRouter = {
  // Create a new task
  create: protectedProcedure
    .input(createTaskSchema)
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { assigneeIds, labelIds, ...taskData } = input;

      // Verify project belongs to the organization
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          organizationId,
        },
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      // Get next position for the status
      const status = taskData.status || "TODO";
      const position = await getNextPosition(input.projectId, status);

      const task = await prisma.task.create({
        data: {
          ...taskData,
          status,
          position,
          createdById: userId,
          ...(assigneeIds?.length && {
            assignees: {
              create: assigneeIds.map((userId) => ({ userId })),
            },
          }),
          ...(labelIds?.length && {
            labels: {
              create: labelIds.map((labelId) => ({ labelId })),
            },
          }),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return task;
    }),

  // Get all tasks for a project
  list: protectedProcedure
    .input(getTasksByProjectSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { projectId, status, priority, search, assigneeId, labelId } =
        input;

      // Verify project belongs to the organization
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          organizationId,
        },
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          ...(status && { status }),
          ...(priority && { priority }),
          ...(search && {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(assigneeId && {
            assignees: {
              some: { userId: assigneeId },
            },
          }),
          ...(labelId && {
            labels: {
              some: { labelId },
            },
          }),
        },
        orderBy: [{ status: "asc" }, { position: "asc" }],
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return tasks;
    }),

  // Get task by ID
  get: protectedProcedure
    .input(getTaskByIdSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const task = await prisma.task.findFirst({
        where: {
          id: input.id,
          project: {
            organizationId,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          comments: {
            orderBy: { createdAt: "desc" },
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
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      if (!task) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      return task;
    }),

  // Update task
  update: protectedProcedure
    .input(updateTaskSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { id, isCompleted, ...updateData } = input;

      // Check if task exists and belongs to user's organization
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          project: {
            organizationId,
          },
        },
      });

      if (!existingTask) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          ...updateData,
          ...(isCompleted !== undefined && {
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
            status: isCompleted ? "DONE" : existingTask.status,
          }),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return task;
    }),

  // Update task position (for Kanban drag & drop)
  updatePosition: protectedProcedure
    .input(updateTaskPositionSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { id, status, position } = input;

      // Check if task exists and belongs to user's organization
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          project: {
            organizationId,
          },
        },
      });

      if (!existingTask) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          status,
          position,
          ...(status === "DONE" &&
            !existingTask.isCompleted && {
              isCompleted: true,
              completedAt: new Date(),
            }),
          ...(status !== "DONE" &&
            existingTask.isCompleted && {
              isCompleted: false,
              completedAt: null,
            }),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return task;
    }),

  // Bulk update task positions
  bulkUpdatePositions: protectedProcedure
    .input(bulkUpdateTaskPositionsSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { tasks } = input;

      // Verify all tasks belong to the organization
      const taskIds = tasks.map((t) => t.id);
      const existingTasks = await prisma.task.findMany({
        where: {
          id: { in: taskIds },
          project: {
            organizationId,
          },
        },
        select: { id: true },
      });

      if (existingTasks.length !== taskIds.length) {
        throw new ORPCError("NOT_FOUND", {
          message: "One or more tasks not found",
        });
      }

      // Update all tasks in a transaction
      await prisma.$transaction(
        tasks.map((task) =>
          prisma.task.update({
            where: { id: task.id },
            data: {
              status: task.status,
              position: task.position,
            },
          })
        )
      );

      return { success: true };
    }),

  // Update task assignees
  updateAssignees: protectedProcedure
    .input(updateTaskAssigneesSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { taskId, assigneeIds } = input;

      // Check if task exists and belongs to user's organization
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            organizationId,
          },
        },
      });

      if (!existingTask) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      // Delete all existing assignees and create new ones
      await prisma.taskAssignee.deleteMany({
        where: { taskId },
      });

      if (assigneeIds.length > 0) {
        await prisma.taskAssignee.createMany({
          data: assigneeIds.map((userId) => ({ taskId, userId })),
        });
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return task!;
    }),

  // Update task labels
  updateLabels: protectedProcedure
    .input(updateTaskLabelsSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { taskId, labelIds } = input;

      // Check if task exists and belongs to user's organization
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            organizationId,
          },
        },
      });

      if (!existingTask) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      // Delete all existing labels and create new ones
      await prisma.taskLabel.deleteMany({
        where: { taskId },
      });

      if (labelIds.length > 0) {
        await prisma.taskLabel.createMany({
          data: labelIds.map((labelId) => ({ taskId, labelId })),
        });
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return task!;
    }),

  // Delete task
  delete: protectedProcedure
    .input(deleteTaskSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Check if task exists and belongs to user's organization
      const existingTask = await prisma.task.findFirst({
        where: {
          id: input.id,
          project: {
            organizationId,
          },
        },
      });

      if (!existingTask) {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }

      await prisma.task.delete({
        where: { id: input.id },
      });

      return { success: true, id: input.id };
    }),
};

export type Task = InferRouterOutputs<typeof tasksRouter>["list"][number];
