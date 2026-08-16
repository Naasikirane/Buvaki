// Helper utilities for media, YouTube embedding, and device image processing

/**
 * Extracts YouTube video ID from various standard YouTube URL formats
 * (e.g. youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID)
 */
export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Returns privacy-friendly YouTube embed player URL if valid YouTube ID found
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

/**
 * Checks whether the URL is a YouTube link
 */
export function isYouTubeUrl(url?: string): boolean {
  return !!getYouTubeVideoId(url);
}

/**
 * Returns YouTube thumbnail URL
 */
export function getYouTubeThumbnailUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Reads an image file from device storage and returns a base64 data URL
 * Automatically scales down large mobile photos (e.g., > 4MB) for fast client storage
 */
export function processImageFile(file: File, maxDimension = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from device'));
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        reject(new Error('Empty file result'));
        return;
      }

      // If file is smaller than 800KB, resolve directly
      if (file.size < 800 * 1024) {
        resolve(result);
        return;
      }

      // If large photo from modern smartphone camera, resize on canvas
      const img = new Image();
      img.onerror = () => resolve(result); // Fallback to raw base64
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
