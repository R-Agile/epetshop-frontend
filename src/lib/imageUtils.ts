/**
 * Converts various image URL formats to direct image URLs
 */
export function convertToDirectImageUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  
  const trimmedUrl = url.trim();
  
  // Convert Google Drive share links to direct download links
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Convert to: https://drive.google.com/uc?export=view&id=FILE_ID
  const driveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Convert Unsplash photo page to direct image (if possible, fallback to thumbnail)
  // Format: https://unsplash.com/photos/PHOTO_ID
  const unsplashMatch = trimmedUrl.match(/unsplash\.com\/photos\/([^/?]+)/);
  if (unsplashMatch) {
    const photoId = unsplashMatch[1];
    // Return Unsplash source URL (works for direct embedding)
    return `https://images.unsplash.com/photo-${photoId}?w=600&q=80`;
  }
  
  // Return URL as-is if it's already a direct image URL
  return trimmedUrl;
}

/**
 * Validates if a URL is likely a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Check if it's a Google Drive link
  if (trimmedUrl.includes('drive.google.com')) return true;
  
  // Check if it's an Unsplash link
  if (trimmedUrl.includes('unsplash.com')) return true;
  
  // Check if it's a direct image URL
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const hasImageExtension = imageExtensions.some(ext => trimmedUrl.includes(ext));
  
  // Check if it starts with http/https
  const hasProtocol = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
  
  // Common image hosting domains
  const imageHosts = ['imgur.com', 'cloudinary.com', 'amazonaws.com', 'cdn', 'images', 'photos'];
  const isImageHost = imageHosts.some(host => trimmedUrl.includes(host));
  
  return hasProtocol && (hasImageExtension || isImageHost);
}
