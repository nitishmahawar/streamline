import { protectedProcedure } from "@/orpc";
import { prisma } from "@/lib/prisma";
import { InferRouterOutputs, ORPCError } from "@orpc/server";
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectByIdSchema,
  getProjectBySlugSchema,
  deleteProjectSchema,
  getProjectsSchema,
  archiveProjectSchema,
} from "./schema";

// Export the projects router
export const projectsRouter = {
  // Create a new project
  create: protectedProcedure
    .input(createProjectSchema)
    .handler(async ({ input, context }) => {
      const userId = context.user.id;
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Check if slug already exists in this organization
      const existingProject = await prisma.project.findFirst({
        where: {
          organizationId,
          slug: input.slug,
        },
      });

      if (existingProject) {
        throw new ORPCError("CONFLICT", {
          message:
            "A project with this slug already exists in this organization",
        });
      }

      const project = await prisma.project.create({
        data: {
          ...input,
          organizationId,
          createdById: userId,
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
          _count: {
            select: {
              tasks: true,
              labels: true,
            },
          },
        },
      });

      return project;
    }),

  // Get all projects for the active organization
  list: protectedProcedure
    .input(getProjectsSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { search, includeArchived } = input;

      const projects = await prisma.project.findMany({
        where: {
          organizationId,
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(!includeArchived && { isArchived: false }),
        },
        orderBy: {
          createdAt: "desc",
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
          _count: {
            select: {
              tasks: true,
              labels: true,
            },
          },
        },
      });

      return projects;
    }),

  // Get project by ID
  get: protectedProcedure
    .input(getProjectByIdSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const project = await prisma.project.findFirst({
        where: {
          id: input.id,
          organizationId,
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
          tasks: {
            orderBy: {
              position: "asc",
            },
            include: {
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
            },
          },
          labels: {
            orderBy: {
              name: "asc",
            },
          },
          _count: {
            select: {
              tasks: true,
              labels: true,
            },
          },
        },
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      return project;
    }),

  // Get project by slug
  getBySlug: protectedProcedure
    .input(getProjectBySlugSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const project = await prisma.project.findFirst({
        where: {
          slug: input.slug,
          organizationId,
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
          tasks: {
            orderBy: {
              position: "asc",
            },
            include: {
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
            },
          },
          labels: {
            orderBy: {
              name: "asc",
            },
          },
          _count: {
            select: {
              tasks: true,
              labels: true,
            },
          },
        },
      });

      if (!project) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      return project;
    }),

  // Update project
  update: protectedProcedure
    .input(updateProjectSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      const { id, ...updateData } = input;

      // Check if project exists and belongs to the organization
      const existingProject = await prisma.project.findFirst({
        where: {
          id,
          organizationId,
        },
      });

      if (!existingProject) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      // If updating slug, check for duplicates
      if (updateData.slug && updateData.slug !== existingProject.slug) {
        const slugExists = await prisma.project.findFirst({
          where: {
            organizationId,
            slug: updateData.slug,
            id: { not: id },
          },
        });

        if (slugExists) {
          throw new ORPCError("CONFLICT", {
            message:
              "A project with this slug already exists in this organization",
          });
        }
      }

      const project = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              labels: true,
            },
          },
        },
      });

      return project;
    }),

  // Archive/Unarchive project
  archive: protectedProcedure
    .input(archiveProjectSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Check if project exists and belongs to the organization
      const existingProject = await prisma.project.findFirst({
        where: {
          id: input.id,
          organizationId,
        },
      });

      if (!existingProject) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      const project = await prisma.project.update({
        where: { id: input.id },
        data: { isArchived: input.isArchived },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              labels: true,
            },
          },
        },
      });

      return project;
    }),

  // Delete project
  delete: protectedProcedure
    .input(deleteProjectSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.activeOrganizationId;

      if (!organizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization selected",
        });
      }

      // Check if project exists and belongs to the organization
      const existingProject = await prisma.project.findFirst({
        where: {
          id: input.id,
          organizationId,
        },
      });

      if (!existingProject) {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }

      await prisma.project.delete({
        where: { id: input.id },
      });

      return { success: true, id: input.id };
    }),
};

export type Project = InferRouterOutputs<typeof projectsRouter>["list"][number];
