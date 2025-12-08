import { z } from "zod";

// Create Label Schema
export const createLabelSchema = z.object({
  name: z.string().min(1, { error: "Label name is required" }),
  color: z.string().optional(),
  projectId: z.string(),
});

// Update Label Schema
export const updateLabelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: "Label name is required" }).optional(),
  color: z.string().optional(),
});

// Get Label by ID Schema
export const getLabelByIdSchema = z.object({
  id: z.string(),
});

// Delete Label Schema
export const deleteLabelSchema = z.object({
  id: z.string(),
});

// Get Labels by Project Schema
export const getLabelsByProjectSchema = z.object({
  projectId: z.string(),
  search: z.string().optional(),
});

// Export types
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
export type GetLabelByIdInput = z.infer<typeof getLabelByIdSchema>;
export type DeleteLabelInput = z.infer<typeof deleteLabelSchema>;
export type GetLabelsByProjectInput = z.infer<typeof getLabelsByProjectSchema>;
