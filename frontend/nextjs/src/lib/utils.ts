import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define a function to check if the file type is valid
export const isValidFileType = (fileName: string): boolean => {
  const validExtensions = ['.jpg', '.png']; // Add more valid extensions as needed
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(fileExtension);
};

// placeholder image in base64
export const profilePlaceholderImage = "data:image/png;base64,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"; 