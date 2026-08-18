// Helper utilities for media, YouTube embedding, device image processing, and video processing

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
 * Formats duration in seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats file size in readable format (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

/**
 * Extracts a representative thumbnail frame and duration from a video file or video element
 */
export function captureVideoFrame(
  fileOrUrl: File | string,
  seekTimeSeconds = 1.0
): Promise<{ thumbnailDataUrl: string; durationFormatted: string; durationSeconds: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let videoUrl = '';
    let isBlob = false;
    if (typeof fileOrUrl === 'string') {
      videoUrl = fileOrUrl;
    } else {
      videoUrl = URL.createObjectURL(fileOrUrl);
      isBlob = true;
    }

    video.src = videoUrl;

    const cleanup = () => {
      if (isBlob) {
        // do not revoke immediately if we want to keep it, but revoke if error
      }
    };

    video.onloadedmetadata = () => {
      const durationSeconds = video.duration || 0;
      const durationFormatted = formatDuration(durationSeconds);
      // Seek to target time or middle of short clips
      const targetSeek = Math.min(seekTimeSeconds, Math.max(0, durationSeconds / 2));
      video.currentTime = targetSeek;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxW = 1280;
        let w = video.videoWidth || 1280;
        let h = video.videoHeight || 720;

        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            thumbnailDataUrl,
            durationFormatted: formatDuration(video.duration || 0),
            durationSeconds: video.duration || 0,
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720
          });
        } else {
          resolve({
            thumbnailDataUrl: '',
            durationFormatted: formatDuration(video.duration || 0),
            durationSeconds: video.duration || 0,
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720
          });
        }
      } catch (err) {
        console.warn('Canvas video frame extraction error:', err);
        resolve({
          thumbnailDataUrl: '',
          durationFormatted: formatDuration(video.duration || 0),
          durationSeconds: video.duration || 0,
          width: video.videoWidth || 1280,
          height: video.videoHeight || 720
        });
      }
    };

    video.onerror = (e) => {
      cleanup();
      console.warn('Could not load video metadata for thumbnail extraction:', e);
      resolve({
        thumbnailDataUrl: '',
        durationFormatted: '15:00',
        durationSeconds: 900,
        width: 1920,
        height: 1080
      });
    };
  });
}

