import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={alt}
      >
        <SparklesIcon aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
