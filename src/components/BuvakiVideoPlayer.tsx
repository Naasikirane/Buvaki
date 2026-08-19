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
  onTap
}) => {
  const fallback = isShort ? FALLBACK_VIDEOS.portrait : FALLBACK_VIDEOS.landscape;
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [hasFallbackApplied, setHasFallbackApplied] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Resolve video URL safely
  useEffect(() => {
    let isCancelled = false;

    async function resolveSource() {
      if (!src) {
        setResolvedSrc(fallback);
        return;
      }

      const validUrl = await resolvePlayableVideoUrl(src, isShort ? 'portrait' : 'landscape');
      if (!isCancelled) {
        setResolvedSrc(validUrl || fallback);
      }
    }

    resolveSource();

    return () => {
      isCancelled = true;
    };
  }, [src, isShort, fallback]);

  // Seamless error recovery: if video fails to load for ANY reason, quietly switch to guaranteed working stream
  const handleVideoError = () => {
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

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onClick={(e) => {
        if (onTap) onTap();
      }}
    >
      <video
        ref={videoRef}
        src={resolvedSrc || fallback}
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
