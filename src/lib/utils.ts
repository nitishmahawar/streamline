import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.APP_URL || "http://localhost:3000";
};
