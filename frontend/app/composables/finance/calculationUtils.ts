
export function getNumberFields(obj:any): string[] {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).filter(key => {
    const value = obj[key];
    // Check if value is a number or a numeric string
    return (typeof value === 'number' && !isNaN(value)) ||
           (typeof value === 'string' && !isNaN(value) && value.trim() !== '' && !isNaN(parseFloat(value)));
  });
}
