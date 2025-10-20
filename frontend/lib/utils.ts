import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format appointment time correctly without timezone conversion
 * PostgreSQL TIME type returns as "HH:MM:SS" string
 * @param timeValue - Time string from database (e.g., "11:00:00" or "2024-01-01T11:00:00.000Z")
 * @returns Formatted time string "HH:MM" (e.g., "11:00")
 */
export function formatAppointmentTime(timeValue: string | Date | null | undefined): string {
  if (!timeValue) return '--:--';
  
  // If it's already a simple time string (HH:MM:SS or HH:MM)
  if (typeof timeValue === 'string') {
    // Check if it's a simple time format (HH:MM:SS or HH:MM)
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeValue)) {
      return timeValue.substring(0, 5); // Return HH:MM
    }
    
    // If it's an ISO string or includes date, extract time part only
    // Handle formats like "1970-01-01T11:00:00.000Z" or "2024-01-01T11:00:00"
    const isoMatch = timeValue.match(/T(\d{2}:\d{2})/);
    if (isoMatch) {
      return isoMatch[1]; // Return the HH:MM part
    }
    
    // Try to parse as date and extract time
    try {
      const date = new Date(timeValue);
      if (!isNaN(date.getTime())) {
        // Use UTC methods to avoid timezone conversion
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch (e) {
      console.error('Error parsing time:', e);
    }
  }
  
  // If it's a Date object
  if (timeValue instanceof Date) {
    const hours = timeValue.getUTCHours().toString().padStart(2, '0');
    const minutes = timeValue.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  return '--:--';
}

/**
 * Format date consistently for SSR/CSR to avoid hydration mismatch
 * Uses UTC methods to ensure same output on server and client
 * @param dateValue - Date string or Date object
 * @param format - Format type: 'date', 'datetime', 'time'
 * @returns Formatted date string
 */
export function formatDateSafe(dateValue: string | Date | null | undefined, format: 'date' | 'datetime' | 'time' = 'date'): string {
  if (!dateValue) return 'N/A';
  
  let date: Date;
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    date = dateValue;
  }
  
  if (isNaN(date.getTime())) return 'N/A';
  
  // Use UTC methods to ensure consistent output
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
  switch (format) {
    case 'date':
      return `${day}/${month}/${year}`;
    case 'datetime':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'time':
      return `${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Get Vietnamese time period (sáng, chiều, tối) consistently
 * Uses UTC hours to avoid hydration mismatch
 * @param dateValue - Date string or Date object
 * @returns Vietnamese time period
 */
export function getVietnameseTimePeriod(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return 'N/A';
  
  let date: Date;
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    date = dateValue;
  }
  
  if (isNaN(date.getTime())) return 'N/A';
  
  // Use UTC hours to ensure consistent output
  const hours = date.getUTCHours();
  
  if (hours >= 5 && hours < 12) return 'sáng';
  if (hours >= 12 && hours < 18) return 'chiều';
  return 'tối';
}
