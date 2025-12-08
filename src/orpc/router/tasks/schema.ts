import { z } from "zod";

// Task Status Enum
export const taskStatusSchema = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
]);

// Task Priority Enum
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

// Create Task Schema
export const createTaskSchema = z.object({
  title: z.string().min(1, { error: "Task title is required" }),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  projectId: z.string(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
});

// Update Task Schema
export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { error: "Task title is required" }).optional(),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

// Get Task by ID Schema
export const getTaskByIdSchema = z.object({
  id: z.string(),
});

// Delete Task Schema
export const deleteTaskSchema = z.object({
  id: z.string(),
});

// Get Tasks by Project Schema
export const getTasksByProjectSchema = z.object({
  projectId: z.string(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().optional(),
  assigneeId: z.string().optional(),
  labelId: z.string().optional(),
});

// Update Task Position Schema (for drag & drop)
export const updateTaskPositionSchema = z.object({
  id: z.string(),
  status: taskStatusSchema,
  position: z.number().int().min(0),
});

// Bulk Update Task Positions Schema
export const bulkUpdateTaskPositionsSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      status: taskStatusSchema,
      position: z.number().int().min(0),
    })
  ),
});

// Assign/Unassign User Schema
export const updateTaskAssigneesSchema = z.object({
  taskId: z.string(),
  assigneeIds: z.array(z.string()),
});

// Update Task Labels Schema
export const updateTaskLabelsSchema = z.object({
  taskId: z.string(),
  labelIds: z.array(z.string()),
});

// Export types
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTaskByIdInput = z.infer<typeof getTaskByIdSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type GetTasksByProjectInput = z.infer<typeof getTasksByProjectSchema>;
export type UpdateTaskPositionInput = z.infer<typeof updateTaskPositionSchema>;
export type BulkUpdateTaskPositionsInput = z.infer<
  typeof bulkUpdateTaskPositionsSchema
>;
export type UpdateTaskAssigneesInput = z.infer<
  typeof updateTaskAssigneesSchema
>;
export type UpdateTaskLabelsInput = z.infer<typeof updateTaskLabelsSchema>;
