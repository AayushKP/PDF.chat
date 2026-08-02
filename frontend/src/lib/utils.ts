import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips uuid prefix from backend filenames if present
 * e.g. "f829d10e-848f-410a-9d29-a1b7e05a8b79_my_doc.pdf" -> "my_doc.pdf"
 */
export function formatFilename(filename: string): string {
  if (!filename) return "Untitled Document";
  const parts = filename.split("_");
  if (
    parts.length > 1 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      parts[0]
    )
  ) {
    return parts.slice(1).join("_");
  }
  return filename;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
