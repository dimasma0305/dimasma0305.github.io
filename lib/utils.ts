import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base path for the application
 * This should match the basePath from next.config.js
 */
export function getBasePath(): string {
  // In production, use the /blog base path
  // In development, use empty string
  return process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH || '' : ''
}

/**
 * Create a URL with the correct base path for fetch requests
 * @param path - The path to append to the base path (should start with /)
 * @returns The full path with base path included
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath()
  return `${basePath}${path}`
}
