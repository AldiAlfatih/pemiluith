import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirectImageUrl(url?: string | null): string {
  if (!url) return "";
  
  // Handle Google Drive links
  const gdriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }
  
  const gdriveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (gdriveOpenMatch && gdriveOpenMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gdriveOpenMatch[1]}`;
  }

  return url;
}
