/**
 * Formats a number with standard number formatting (commas for thousands)
 * @param num The number to format
 * @param decimals Number of decimal places (default: 2)
 */
export const formatNumber = (num: number, decimals = 2): string => {
  // For very small numbers, show more decimal places
  if (num > 0 && num < 0.01) {
    return num.toFixed(4);
  } else if (num > 0 && num < 0.001) {
    return num.toFixed(6); // Even more precision for extremely small numbers
  }
  
  // For regular numbers, use a consistent decimal format
  const formatted = num.toFixed(decimals);
  
  // If it ends with zeros after decimal point, trim them
  if (formatted.includes('.')) {
    return formatted.replace(/\.?0+$/, '');
  }
  
  return formatted;
};

/**
 * Formats a number with abbreviated suffixes (K, M, B, T) for larger numbers
 * @param num The number to format
 */
export const formatCompactNumber = (num: number): string => {
  if (num === 0) return "0";
  
  // For very small numbers, show more decimal places
  if (num > 0 && num < 0.01) {
    return formatNumber(num, 4);
  } else if (num > 0 && num < 0.001) {
    return formatNumber(num, 6);
  }
  
  if (num < 1000) {
    return formatNumber(num, 2);
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const suffix = suffixes[Math.min(magnitude, suffixes.length - 1)];
  const scaled = num / Math.pow(1000, magnitude);
  
  // Use 1 decimal place for K, 2 for M and beyond
  const decimals = magnitude === 1 ? 1 : 2;
  return `${formatNumber(scaled, decimals)}${suffix}`;
};

/**
 * Formats a number as a data size (bytes, KB, MB, etc.)
 * @param bytes The number of bytes to format
 */
export const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  
  // For very small values, show more decimal places
  if (bytes < 1 && bytes > 0) {
    return `${formatNumber(bytes, 3)} B`;
  }
  
  if (bytes < 1024) {
    return `${formatNumber(bytes, 1)} B`;
  }
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const magnitude = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, magnitude);
  
  // Use appropriate decimal places based on unit size
  let decimals = 0;
  if (magnitude === 1) decimals = 1;      // KB with 1 decimal
  else if (magnitude === 2) decimals = 2; // MB with 2 decimals
  else decimals = 3;                      // GB+ with 3 decimals
  
  return `${formatNumber(value, decimals)} ${units[magnitude]}`;
}; 