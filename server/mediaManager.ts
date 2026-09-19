import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

export interface MediaRecord {
  mediaId: string;
  ownerId: string;
  ownerHandle?: string;
  postId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  type: 'video' | 'short' | 'long' | 'image';
  status: 'active' | 'archived';
}

const uploadsDir = path.join(process.cwd(), 'uploads');
const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
const registryFilePath = path.join(uploadsDir, 'media_registry.json');

// Ensure storage directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

// In-memory cache backed by persistent JSON file
let mediaRegistry: Map<string, MediaRecord> = new Map();

function loadRegistry() {
  try {
    if (fs.existsSync(registryFilePath)) {
      const data = fs.readFileSync(registryFilePath, 'utf8');
      const items: MediaRecord[] = JSON.parse(data);
      mediaRegistry = new Map(items.map((item) => [item.mediaId, item]));
    }
  } catch (err) {
    console.warn('Failed to load media registry file, initializing new registry:', err);
    mediaRegistry = new Map();
  }
}

function saveRegistry() {
  try {
    const list = Array.from(mediaRegistry.values());
    fs.writeFileSync(registryFilePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist media registry:', err);
  }
}

// Initial load
loadRegistry();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanName = `media_${timestamp}_${random}${ext}`;
    cb(null, cleanName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB
  },
  fileFilter: (req, file, cb) => {
    // Accept videos, images, and audio
    if (
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/') ||
      /\.(mp4|webm|mov|mkv|avi|m4v|png|jpe?g|webp|gif)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported media format. Please upload standard video, image, or audio files.'));
    }
  }
});

export function setupMediaRoutes(app: express.Express) {
  const sampleVideosDir = path.join(process.cwd(), 'public', 'sample-videos');

  // Serve uploads statically from both possible locations
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }));
  app.use('/uploads', express.static(publicUploadsDir, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }));
  app.use('/sample-videos', express.static(sampleVideosDir, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }));

  // 1. VIDEO STREAMING ENDPOINT with HTTP 206 Partial Content support
  app.get('/api/media/stream/:filename', (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      let filePath = path.join(uploadsDir, filename);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(publicUploadsDir, filename);
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(sampleVideosDir, filename);
      }
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Media file not found on server' });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      const ext = path.extname(filename).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.m4v': 'video/mp4',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
      };
      const contentType = mimeMap[ext] || 'video/mp4';

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        if (start >= fileSize) {
          res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
          return;
        }

        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (err: any) {
      console.error('Error streaming media:', err);
      res.status(500).json({ error: 'Failed to stream media file' });
    }
  });

  // 2. MEDIA UPLOAD ENDPOINT: Enforces owner linkage
  app.post('/api/media/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No media file provided for upload' });
      }

      const { userId, userHandle, type, postId } = req.body;
      const ownerId = userId || 'anonymous_user';
      const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const filename = req.file.filename;
      const relativeUrl = `/uploads/${filename}`;

      // Duplicate to public/uploads so static client dev server or direct link finds it
      try {
        const targetCopy = path.join(publicUploadsDir, filename);
        fs.copyFileSync(req.file.path, targetCopy);
      } catch (copyErr) {
        // Non-blocking
        console.warn('Could not mirror upload to public/uploads:', copyErr);
      }

      const record: MediaRecord = {
        mediaId,
        ownerId,
        ownerHandle: userHandle || '',
        postId: postId || undefined,
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype || 'video/mp4',
        size: req.file.size,
        url: relativeUrl,
        createdAt: new Date().toISOString(),
        type: (type as any) || 'video',
        status: 'active',
      };

      mediaRegistry.set(mediaId, record);
      saveRegistry();

      console.log(`[MediaManager] Saved and registered media ${mediaId} (${filename}, ${req.file.size} bytes) for owner ${ownerId}`);

      return res.json({
        success: true,
        mediaId,
        url: relativeUrl,
        streamUrl: `/api/media/stream/${filename}`,
        ownerId,
        filename,
        mimeType: record.mimeType,
        size: record.size,
        createdAt: record.createdAt,
      });
    } catch (err: any) {
      console.error('Media upload error:', err);
      return res.status(500).json({ error: err.message || 'Failed to upload media file' });
    }
  });

  // 3. CLAIM POST & MEDIA OWNERSHIP: Binds post to media asset securely
  app.post('/api/media/claim', (req, res) => {
    try {
      const { mediaId, postId, ownerId } = req.body;
      if (!mediaId || !postId || !ownerId) {
        return res.status(400).json({ error: 'mediaId, postId, and ownerId are required' });
      }

      const record = mediaRegistry.get(mediaId);
      if (!record) {
        return res.status(404).json({ error: 'Media record not found' });
      }

      // Verify owner
      if (record.ownerId !== ownerId && record.ownerId !== 'anonymous_user') {
        return res.status(403).json({ error: 'Ownership verification failed: caller is not the owner of this media asset' });
      }

      record.ownerId = ownerId;
      record.postId = postId;
      mediaRegistry.set(mediaId, record);
      saveRegistry();

      return res.json({
        success: true,
        message: 'Media ownership securely claimed and linked',
        record,
      });
    } catch (err: any) {
      console.error('Error claiming media:', err);
      return res.status(500).json({ error: 'Failed to claim media' });
    }
  });

  // 4. VERIFY INTEGRITY: Checks whether a user's post/video source is healthy or needs repair
  app.post('/api/media/verify-integrity', (req, res) => {
    try {
      const { userId, postId, videoUrl } = req.body;

      // 1. If videoUrl is an active upload
      if (videoUrl && (videoUrl.startsWith('/uploads/') || videoUrl.includes('/uploads/'))) {
        const filename = path.basename(videoUrl.split('?')[0]);
        const exists = fs.existsSync(path.join(uploadsDir, filename)) || fs.existsSync(path.join(publicUploadsDir, filename));
        if (exists) {
          return res.json({
            valid: true,
            status: 'intact',
            url: videoUrl,
          });
        }
      }

      // 2. If videoUrl is an external web url
      if (videoUrl && (videoUrl.startsWith('http://') || videoUrl.startsWith('https://'))) {
        if (videoUrl.includes('commondatastorage.googleapis.com') || videoUrl.includes('mixkit.co')) {
          const isPortrait = videoUrl.includes('portrait') || videoUrl.includes('short');
          return res.json({
            valid: true,
            repaired: true,
            status: 'repaired_from_sample',
            url: isPortrait ? '/sample-videos/portrait.mp4' : '/sample-videos/landscape.mp4',
          });
        }
        return res.json({
          valid: true,
          status: 'external_intact',
          url: videoUrl,
        });
      }

      // 3. If videoUrl was an expired local-media or blob or missing: search for owner's registered asset
      if (userId) {
        const userAssets = Array.from(mediaRegistry.values())
          .filter((item) => item.ownerId === userId && item.status === 'active')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Match by postId if available
        let matched = postId ? userAssets.find((a) => a.postId === postId) : undefined;
        
        // Otherwise match by most recent asset
        if (!matched && userAssets.length > 0) {
          matched = userAssets[0];
        }

        if (matched) {
          const filename = matched.filename;
          const exists = fs.existsSync(path.join(uploadsDir, filename)) || fs.existsSync(path.join(publicUploadsDir, filename));
          if (exists) {
            return res.json({
              valid: true,
              repaired: true,
              status: 'repaired_from_vault',
              url: matched.url,
              mediaId: matched.mediaId,
            });
          }
        }
      }

      return res.json({
        valid: false,
        status: 'unresolved',
        url: videoUrl || '',
      });
    } catch (err: any) {
      console.error('Integrity check error:', err);
      return res.status(500).json({ error: 'Integrity check failed' });
    }
  });

  // 5. GET ALL ASSETS FOR USER
  app.get('/api/media/user/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const userAssets = Array.from(mediaRegistry.values()).filter(
        (item) => item.ownerId === userId && item.status === 'active'
      );
      return res.json({
        success: true,
        count: userAssets.length,
        assets: userAssets,
      });
    } catch (err: any) {
      console.error('Failed to get user assets:', err);
      return res.status(500).json({ error: 'Failed to retrieve user assets' });
    }
  });

  // 6. DELETE MEDIA: Strictly verified by ownerId
  app.delete('/api/media/:mediaId', (req, res) => {
    try {
      const { mediaId } = req.params;
      const { userId } = req.body;

      const record = mediaRegistry.get(mediaId);
      if (!record) {
        return res.status(404).json({ error: 'Media asset not found' });
      }

      // Enforce strict referential protection
      if (record.ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this media asset' });
      }

      // Mark archived in registry
      record.status = 'archived';
      mediaRegistry.set(mediaId, record);
      saveRegistry();

      // Attempt file removal
      try {
        const p1 = path.join(uploadsDir, record.filename);
        if (fs.existsSync(p1)) fs.unlinkSync(p1);
        const p2 = path.join(publicUploadsDir, record.filename);
        if (fs.existsSync(p2)) fs.unlinkSync(p2);
      } catch (fErr) {
        console.warn('File unlinking error:', fErr);
      }

      return res.json({ success: true, message: 'Media asset removed successfully' });
    } catch (err: any) {
      console.error('Delete media error:', err);
      return res.status(500).json({ error: 'Failed to delete media asset' });
    }
  });
}
