import { protectedProcedure } from "@/orpc";
import { prisma } from "@/lib/prisma";
import { InferRouterOutputs, ORPCError } from "@orpc/server";
import {
  createLabelSchema,
  updateLabelSchema,
  getLabelByIdSchema,
  deleteLabelSchema,
  getLabelsByProjectSchema,
} from "./schema";

// Export the labels router
export const labelsRouter = {
  // Create a new label
  create: protectedProcedure
    .input(createLabelSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

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

      // Check if label name already exists in this project
      const existingLabel = await prisma.label.findFirst({
        where: {
          projectId: input.projectId,
          name: input.name,
        },
      });

      if (existingLabel) {
        throw new ORPCError("CONFLICT", {
          message: "A label with this name already exists in this project",
        });
      }

      const label = await prisma.label.create({
        data: {
          name: input.name,
          color: input.color,
          projectId: input.projectId,
        },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      return label;
    }),

  // Get all labels for a project
  list: protectedProcedure
    .input(getLabelsByProjectSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { projectId, search } = input;

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

      const labels = await prisma.label.findMany({
        where: {
          projectId,
          ...(search && {
            name: { contains: search, mode: "insensitive" },
          }),
        },
        orderBy: {
          name: "asc",
        },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      return labels;
    }),

  // Get label by ID
  get: protectedProcedure
    .input(getLabelByIdSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const label = await prisma.label.findFirst({
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
          tasks: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  priority: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      if (!label) {
        throw new ORPCError("NOT_FOUND", { message: "Label not found" });
      }

      return label;
    }),

  // Update label
  update: protectedProcedure
    .input(updateLabelSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { id, ...updateData } = input;

      // Check if label exists and belongs to user's organization
      const existingLabel = await prisma.label.findFirst({
        where: {
          id,
          project: {
            organizationId,
          },
        },
      });

      if (!existingLabel) {
        throw new ORPCError("NOT_FOUND", { message: "Label not found" });
      }

      // If updating name, check for duplicates in the same project
      if (updateData.name && updateData.name !== existingLabel.name) {
        const nameExists = await prisma.label.findFirst({
          where: {
            projectId: existingLabel.projectId,
            name: updateData.name,
            id: { not: id },
          },
        });

        if (nameExists) {
          throw new ORPCError("CONFLICT", {
            message: "A label with this name already exists in this project",
          });
        }
      }

      const label = await prisma.label.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      return label;
    }),

  // Delete label
  delete: protectedProcedure
    .input(deleteLabelSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Check if label exists and belongs to user's organization
      const existingLabel = await prisma.label.findFirst({
        where: {
          id: input.id,
          project: {
            organizationId,
          },
        },
      });

      if (!existingLabel) {
        throw new ORPCError("NOT_FOUND", { message: "Label not found" });
      }

      await prisma.label.delete({
        where: { id: input.id },
      });

      return { success: true, id: input.id };
    }),
};

export type Label = InferRouterOutputs<typeof labelsRouter>["list"][number];
