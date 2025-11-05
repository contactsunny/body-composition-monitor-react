/**
 * Format a timestamp (in seconds) to "dd MMM YYYY" format
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string (e.g., "15 Jan 2025")
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Get formatted date from timestamp (similar to Swift's getFormattedDateFromTimestamp)
 * Uses medium date style with current timezone, no time component
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string in medium style (e.g., "Jan 5, 2024")
 */
export const getFormattedDateFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp (seconds) to milliseconds
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium', // Medium date style (e.g., "Jan 5, 2024")
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Current timezone
  });
  
  return dateFormatter.format(date);
};

