import React, { useState, useEffect, useRef } from 'react';
import { resolvePlayableVideoUrl, FALLBACK_VIDEOS } from '../lib/mediaStorage';

interface BuvakiVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  isShort?: boolean;
  isLong?: boolean;
  title?: string;
  onTap?: () => void;
}

function isYouTube(url?: string): boolean {
  if (!url) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))/i.test(url);
}

function getYouTubeEmbed(url?: string, autoPlay = false): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=${autoPlay ? 1 : 0}&rel=0` : null;
}

export const BuvakiVideoPlayer: React.FC<BuvakiVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  playsInline = true,
  isShort = false,
  title,
  onTap
}) => {
  const fallback = isShort ? FALLBACK_VIDEOS.portrait : FALLBACK_VIDEOS.landscape;

  // Determine synchronous initial src if possible to avoid empty/flickering initial states
  const getInitialSource = (): string => {
    if (!src || !src.trim()) return fallback;
    const trimmed = src.trim();
    if (
      trimmed.includes('gtv-videos-bucket') || 
      trimmed.includes('commondatastorage.googleapis.com') ||
      trimmed.includes('mixkit.co')
    ) {
      return fallback;
    }
    if (trimmed.startsWith('/') || trimmed.startsWith('blob:') || trimmed.startsWith('http')) {
      return trimmed;
    }
    return ''; // For local-media:, resolve asynchronously
  };

  const [resolvedSrc, setResolvedSrc] = useState<string>(getInitialSource);
  const [hasFallbackApplied, setHasFallbackApplied] = useState<boolean>(false);
  const [retryAttempted, setRetryAttempted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // If this is a YouTube URL, render embedded player
  if (isYouTube(src)) {
    const embedUrl = getYouTubeEmbed(src, autoPlay);
    if (embedUrl) {
      return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <iframe
            src={embedUrl}
            title={title || 'Video Player'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  // Resolve video URL asynchronously (especially for local-media: identifiers)
  useEffect(() => {
    let isCancelled = false;

    async function resolveSource() {
      if (!src || !src.trim()) {
        setResolvedSrc(fallback);
        return;
      }

      const trimmed = src.trim();
      if (
        trimmed.includes('gtv-videos-bucket') || 
        trimmed.includes('commondatastorage.googleapis.com') ||
        trimmed.includes('mixkit.co')
      ) {
        setResolvedSrc(fallback);
        return;
      }

      const validUrl = await resolvePlayableVideoUrl(trimmed, isShort ? 'portrait' : 'landscape');
      if (!isCancelled) {
        setResolvedSrc(validUrl || fallback);
      }
    }

    resolveSource();

    return () => {
      isCancelled = true;
    };
  }, [src, isShort, fallback]);

  // Robust video error recovery with automatic streaming endpoint switch and fallback
  const handleVideoError = () => {
    // 1. If it's a server upload, try the dedicated HTTP 206 streaming route
    if (!retryAttempted && resolvedSrc && (resolvedSrc.startsWith('/uploads/') || resolvedSrc.includes('/uploads/'))) {
      setRetryAttempted(true);
      const filename = resolvedSrc.split('/uploads/')[1];
      if (filename) {
        const streamEndpoint = `/api/media/stream/${filename}`;
        setResolvedSrc(streamEndpoint);
        if (videoRef.current) {
          videoRef.current.src = streamEndpoint;
          videoRef.current.load();
          if (autoPlay) {
            videoRef.current.play().catch(() => {});
          }
        }
        return;
      }
    }

    // 2. Only switch to fallback if primary attempts fail
    if (!hasFallbackApplied && resolvedSrc !== fallback) {
      setHasFallbackApplied(true);
      setResolvedSrc(fallback);
      if (videoRef.current) {
        videoRef.current.src = fallback;
        videoRef.current.load();
        if (autoPlay) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  };

  const activeSrc = resolvedSrc || fallback;

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onClick={() => {
        if (onTap) onTap();
      }}
    >
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        preload="metadata"
        onError={handleVideoError}
        className={`w-full h-full object-contain bg-black ${className}`}
      />
    </div>
  );
};
