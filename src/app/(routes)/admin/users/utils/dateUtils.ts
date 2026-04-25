// Date utility functions to prevent SSR hydration mismatches
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Use ISO string split to ensure consistency between server and client
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format as YYYY-MM-DD HH:mm:ss for consistency
    const isoString = date.toISOString();
    const [datePart, timePart] = isoString.split('T');
    const timeWithoutMs = timePart.split('.')[0];
    
    return `${datePart} ${timeWithoutMs}`;
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return 'Invalid Date';
  }
};

export const formatLastLogin = (lastLogin: string | null): string => {
  if (!lastLogin || lastLogin === 'Never') return 'Never';
  return formatDateTime(lastLogin);
};