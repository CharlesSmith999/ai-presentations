import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class lists, resolving conflicts (e.g. "p-2 p-4" -> "p-4")
 * the way shadcn/ui components expect. Every shadcn/ui component added
 * via the CLI imports this from the path configured in components.json
 * (`@/shared/utils/cn`), so it lives here rather than duplicated per
 * component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
