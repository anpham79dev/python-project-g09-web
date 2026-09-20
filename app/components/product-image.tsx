'use client';

import React, { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Robust ProductImage component with graceful fallback placeholder.
 * Never breaks table layout or displays raw broken-image alt text.
 */
export default function ProductImage({
  src,
  alt = '',
  className = 'w-12 h-12 rounded-lg object-cover border border-[#E5E7EB]',
  fallbackClassName,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F4F6] text-gray-400 select-none overflow-hidden border border-[#E5E7EB] ${
          fallbackClassName || className
        }`}
        title={alt || 'Sản phẩm tiệm bánh'}
      >
        <svg
          className="w-1/2 h-1/2 text-gray-300 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Bread loaf SVG icon */}
          <path d="M19 10c0-3.866-3.582-7-8-7s-8 3.134-8 7c0 1.25.38 2.41 1.04 3.4L3 19h16l-1.04-5.6c.66-.99 1.04-2.15 1.04-3.4z" />
          <path d="M8 8s.5 2 2 2 2-2 2-2" />
          <path d="M12 8s.5 2 2 2 2-2 2-2" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
