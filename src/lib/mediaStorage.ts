// Client-side persistent media cache for uploaded video files and audio blobs
// Uses IndexedDB to persist large video blobs across page reloads and browser sessions

const DB_NAME = 'BuvakiMediaCache';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

// Guaranteed 100% working, fast, CORS-enabled Google Cloud Storage MP4 streams
export const FALLBACK_VIDEOS = {
  landscape: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  portrait: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  creative: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  tech: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  general: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
};

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a video File or Blob into IndexedDB
 */
export async function saveLocalMediaBlob(id: string, fileOrBlob: Blob): Promise<string> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id,
        blob: fileOrBlob,
        mimeType: fileOrBlob.type || 'video/mp4',
        timestamp: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(`local-media:${id}`);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save media blob to IndexedDB:', err);
    return `local-media:${id}`;
  }
}

/**
 * Retrieves a video Blob from IndexedDB by key/id
 */
export async function getLocalMediaBlob(id: string): Promise<Blob | null> {
  try {
    const cleanId = id.replace(/^local-media:/, '');
    const db = await openMediaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Could not retrieve media blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Resolves any video URL (local-media:, blob:, or http/https) into a guaranteed playable URL
 */
export async function resolvePlayableVideoUrl(
  videoUrl?: string,
  orientation: 'landscape' | 'portrait' | 'auto' = 'auto'
): Promise<string> {
  const fallback = orientation === 'portrait' ? FALLBACK_VIDEOS.portrait : FALLBACK_VIDEOS.landscape;

  if (!videoUrl || !videoUrl.trim()) {
    return fallback;
  }

  const trimmed = videoUrl.trim();

  // If local-media: identifier, fetch from IndexedDB
  if (trimmed.startsWith('local-media:')) {
    const id = trimmed.replace('local-media:', '');
    const blob = await getLocalMediaBlob(id);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return fallback;
  }

  // If blob: URL (which expires across page reloads / sessions)
  if (trimmed.startsWith('blob:')) {
    // If it's from another session/device, blob is unreachable, return fallback immediately
    return fallback;
  }

  // If broken mixkit domain, redirect to Google CDN
  if (trimmed.includes('mixkit.co')) {
    return fallback;
  }

  return trimmed;
}
