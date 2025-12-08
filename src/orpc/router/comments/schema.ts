import { z } from "zod";

// Create Comment Schema
export const createCommentSchema = z.object({
  content: z.string().min(1, { error: "Comment content is required" }),
  taskId: z.string(),
});

// Update Comment Schema
export const updateCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1, { error: "Comment content is required" }),
});

// Get Comment by ID Schema
export const getCommentByIdSchema = z.object({
  id: z.string(),
});

// Delete Comment Schema
export const deleteCommentSchema = z.object({
  id: z.string(),
});

// Get Comments by Task Schema
export const getCommentsByTaskSchema = z.object({
  taskId: z.string(),
});

// Export types
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type GetCommentByIdInput = z.infer<typeof getCommentByIdSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type GetCommentsByTaskInput = z.infer<typeof getCommentsByTaskSchema>;
