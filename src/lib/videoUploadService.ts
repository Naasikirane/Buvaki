/**
 * Service for uploading videos and media to Firebase Cloud Storage (pistabish.firebasestorage.app)
 * with robust server fallback and referential integrity.
 */

import { uploadToFirebaseStorage } from './firebase';

export interface UploadResult {
  success: boolean;
  url: string;
  streamUrl?: string;
  mediaId: string;
  filename: string;
  size: number;
  mimeType: string;
  storageProvider?: 'firebase_cloud_storage' | 'server_vault';
  error?: string;
}

export async function uploadMediaFile(
  file: File | Blob,
  ownerId: string,
  userHandle: string = '',
  type: 'video' | 'short' | 'long' | 'image' = 'video',
  originalFileName?: string,
  onProgress?: (percentage: number) => void
): Promise<UploadResult> {
  // 1. PRIMARY: Upload directly to Firebase Cloud Storage bucket (pistabish.firebasestorage.app)
  try {
    const fbResult = await uploadToFirebaseStorage(file, ownerId, type, onProgress);
    if (fbResult && fbResult.url) {
      const mediaId = `fb_media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return {
        success: true,
        url: fbResult.url,
        streamUrl: fbResult.url,
        mediaId,
        filename: fbResult.path,
        size: file.size,
        mimeType: file.type || 'video/mp4',
        storageProvider: 'firebase_cloud_storage',
      };
    }
  } catch (fbErr) {
    console.warn('[VideoUploadService] Firebase Cloud Storage direct upload notice, using resilient server fallback:', fbErr);
  }

  // 2. FALLBACK: Resilient server media vault
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    const fileName = originalFileName || (file instanceof File ? file.name : `media_${Date.now()}.mp4`);
    formData.append('file', file, fileName);
    formData.append('userId', ownerId);
    formData.append('userHandle', userHandle);
    formData.append('type', type);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.url,
            streamUrl: response.streamUrl,
            mediaId: response.mediaId,
            filename: response.filename,
            size: response.size,
            mimeType: response.mimeType,
            storageProvider: 'server_vault',
          });
        } catch {
          resolve({
            success: false,
            url: '',
            mediaId: '',
            filename: '',
            size: 0,
            mimeType: '',
            error: 'Failed to parse upload response',
          });
        }
      } else {
        let errMsg = `Upload failed with status ${xhr.status}`;
        try {
          const errRes = JSON.parse(xhr.responseText);
          if (errRes.error) errMsg = errRes.error;
        } catch {}
        resolve({
          success: false,
          url: '',
          mediaId: '',
          filename: '',
          size: 0,
          mimeType: '',
          error: errMsg,
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        url: '',
        mediaId: '',
        filename: '',
        size: 0,
        mimeType: '',
        error: 'Network connection error during media upload',
      });
    });

    xhr.open('POST', '/api/media/upload');
    xhr.send(formData);
  });
}

/**
 * Links a media asset to a published post/short/video on the backend
 */
export async function claimMediaOwnership(
  mediaId: string,
  postId: string,
  ownerId: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/media/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, postId, ownerId }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.warn('Failed to claim media asset:', err);
    return false;
  }
}

/**
 * Checks and auto-repairs any potentially corrupted or missing video source for a user's post
 */
export async function verifyMediaIntegrity(
  userId: string,
  postId: string,
  videoUrl?: string
): Promise<{ valid: boolean; repairedUrl?: string }> {
  try {
    const res = await fetch('/api/media/verify-integrity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId, videoUrl }),
    });
    const data = await res.json();
    if (data.valid && data.url) {
      return { valid: true, repairedUrl: data.url };
    }
    return { valid: data.valid || false };
  } catch (err) {
    console.warn('Media integrity check error:', err);
    return { valid: true }; // Fallback to optimistic
  }
}
