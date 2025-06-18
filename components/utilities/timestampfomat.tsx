// import { isToday, isYesterday, parseISO } from 'date-fns';

// export const formatISTTime = (date: Date): string => {
//   return date.toLocaleTimeString('en-IN', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//     timeZone: 'Asia/Kolkata',
//   });
// };

// export const formatChatTimestamp = (isoString: string): string => {
//   const date = parseISO(isoString);

//   if (isToday(date)) {
//     return `Today at ${formatISTTime(date)}`;
//   }

//   if (isYesterday(date)) {
//     return `Yesterday at ${formatISTTime(date)}`;
//   }

//   const formattedDate = date.toLocaleDateString('en-IN', {
//     month: 'short',
//     day: 'numeric',
//     timeZone: 'Asia/Kolkata',
//   });

//   return `${formattedDate} at ${formatISTTime(date)}`;
// };


import { isToday, isYesterday } from 'date-fns';

// export const formatChatTimestamp = (isoString: string): string => {
//   const utcDate = new Date(isoString);

//   // Add 5 hours 30 minutes to convert UTC to IST
//   const istOffsetMs = 5.5 * 60 * 60 * 1000;
//   const istDate = new Date(utcDate.getTime() + istOffsetMs);

//   // Format time
//   const hours = istDate.getHours();
//   const minutes = istDate.getMinutes();
//   const formattedTime = `${(hours % 12 || 12).toString().padStart(2, '0')}:${minutes
//     .toString()
//     .padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;

//   if (isToday(istDate)) {
//     return `Today at ${formattedTime}`;
//   }

//   if (isYesterday(istDate)) {
//     return `Yesterday at ${formattedTime}`;
//   }

//   const day = istDate.getDate();
//   const month = istDate.toLocaleString('default', { month: 'short' });

//   return `${day} ${month} at ${formattedTime}`;
// };

  
//import { isToday, isYesterday } from 'date-fns';

//import { isToday, isYesterday } from 'date-fns';

// export const formatChatTimestamp = (input: string | Date): string => {
//   const date = new Date(input);

//   // Format time in device's local time zone
//   const formatter = new Intl.DateTimeFormat(undefined, {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//   });

//   const formattedTime = formatter.format(date);

//   if (isToday(date)) return `Today at ${formattedTime}`;
//   if (isYesterday(date)) return `Yesterday at ${formattedTime}`;

//   const day = date.getDate();
//   const month = date.toLocaleString(undefined, { month: 'short' });

//   return `${day} ${month} at ${formattedTime}`;
// };


//import { isToday, isYesterday } from 'date-fns';

/**
 * Formats a timestamp for chat messages based on the device's local time zone
 * 
 * @param input - ISO string or Date object representing the timestamp (assumed to be in UTC)
 * @returns Formatted string like "Today at 2:30 PM", "Yesterday at 5:45 PM", or "15 May at 10:30 AM"
 */
export const formatChatTimestamp = (input: string | Date | undefined | null): string => {
  // Handle undefined or null input
  if (!input) {
    console.warn('No timestamp provided to formatChatTimestamp');
    return 'Invalid date';
  }

  // Ensure we have a valid Date object
  let date: Date;
  
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    // For string inputs, ensure proper parsing
    // If the string doesn't have timezone info, it's assumed to be UTC
    if (input.endsWith('Z') || input.includes('+')) {
      // ISO string already has timezone info
      date = new Date(input);
    } else {
      // Add UTC indicator if missing
      date = new Date(input + 'Z');
    }
  } else {
    console.error('Invalid input type provided to formatChatTimestamp:', typeof input);
    return 'Invalid date';
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date provided to formatChatTimestamp:', input);
    return 'Invalid date';
  }
  
  // Format time in the device's local time zone
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  
  const formattedTime = timeFormatter.format(date);
  
  // We need to check "today" and "yesterday" based on the device's local time
  const localToday = new Date();
  localToday.setHours(0, 0, 0, 0);
  
  const localYesterday = new Date(localToday);
  localYesterday.setDate(localYesterday.getDate() - 1);
  
  const dateStartOfDay = new Date(date);
  dateStartOfDay.setHours(0, 0, 0, 0);
  
  // Check if the date matches today or yesterday in local time
  if (dateStartOfDay.getTime() === localToday.getTime()) {
    return `Today at ${formattedTime}`;
  }
  
  if (dateStartOfDay.getTime() === localYesterday.getTime()) {
    return `Yesterday at ${formattedTime}`;
  }
  
  // Format date for other cases
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  });
  
  const formattedDate = dateFormatter.format(date);
  
  return `${formattedDate} at ${formattedTime}`;
};

// Example usage:
// const utcString = "2023-12-25T12:00:00"; // UTC time from backend
// console.log(formatChatTimestamp(utcString)); // Will show in IST (UTC+5:30)
// console.log(formatChatTimestamp(new Date())); // Current time in local timezone

// Example usage:
// const now = new Date();
// console.log(formatChatTimestamp(now)); // Today at 5:30 PM
// console.log(formatChatTimestamp(new Date(now.getTime() - 86400000))); // Yesterday at 5:30 PM
// console.log(formatChatTimestamp('2023-12-25T12:00:00Z')); // 25 Dec at 5:30 PM (depending on your time zone)
