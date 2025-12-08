import { projectsRouter } from "./projects";
import { labelsRouter } from "./lables";
import { tasksRouter } from "./tasks";
import { commentsRouter } from "./comments";

export const router = {
  projects: projectsRouter,
  labels: labelsRouter,
  tasks: tasksRouter,
  comments: commentsRouter,
};
