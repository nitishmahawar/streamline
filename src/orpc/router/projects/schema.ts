import { z } from "zod";

// Create Project Schema
export const createProjectSchema = z.object({
  name: z.string().min(1, { error: "Project name is required" }),
  description: z.string().optional(),
  slug: z.string().min(1, { error: "Project slug is required" }),
  color: z.string().optional(),
  icon: z.string().optional(),
});

// Update Project Schema
export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: "Project name is required" }).optional(),
  description: z.string().optional().nullable(),
  slug: z.string().min(1, { error: "Project slug is required" }).optional(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
});

// Get Project by ID Schema
export const getProjectByIdSchema = z.object({
  id: z.string(),
});

// Get Project by Slug Schema
export const getProjectBySlugSchema = z.object({
  slug: z.string(),
});

// Delete Project Schema
export const deleteProjectSchema = z.object({
  id: z.string(),
});

// Get All Projects Schema
export const getProjectsSchema = z.object({
  search: z.string().optional(),
  includeArchived: z.boolean().optional(),
});

// Archive Project Schema
export const archiveProjectSchema = z.object({
  id: z.string(),
  isArchived: z.boolean(),
});

// Export types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GetProjectByIdInput = z.infer<typeof getProjectByIdSchema>;
export type GetProjectBySlugInput = z.infer<typeof getProjectBySlugSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type GetProjectsInput = z.infer<typeof getProjectsSchema>;
export type ArchiveProjectInput = z.infer<typeof archiveProjectSchema>;
