import React, { useState } from 'react';

const PHOTO_URL = 'https://images.unsplash.com/photo-';

const FALLBACKS = {
  plants: PHOTO_URL + '1459411552864-8cd36dfb7436?w=600&h=600&fit=crop',
  flowers: PHOTO_URL + '1490750967868-88aa4f44baee?w=600&h=600&fit=crop',
  vases: PHOTO_URL + '1578500494893-f760f0e48b2d?w=600&h=600&fit=crop',
  seeds: PHOTO_URL + '1416879595382-4da1acebcd36?w=600&h=600&fit=crop',
  tools: PHOTO_URL + '1592417817098-8fd3d9eb14a5?w=600&h=600&fit=crop',
  fertilizers: PHOTO_URL + '1585336763698-24f8a0e4e8e3?w=600&h=600&fit=crop',
  'pots-vases': PHOTO_URL + '1485955900006-10f4d324d411?w=600&h=600&fit=crop',
  'garden-tools': PHOTO_URL + '1416879595382-4da1acebcd36?w=600&h=600&fit=crop',
  'decorative-items': PHOTO_URL + '1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
  default: PHOTO_URL + '1459411552864-8cd36dfb7436?w=600&h=600&fit=crop',
};

function getFallbackUrl(category) {
  return FALLBACKS[category] || FALLBACKS.default;
}

export default function ImageWithFallback({ src, alt, category, style, imgStyle, fallbackSrc }) {
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const currentSrc = useFallback ? (fallbackSrc || getFallbackUrl(category)) : src;

  if (!src || (useFallback && fallbackFailed)) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1A3A2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#6B7280',
        ...style,
      }}>
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}>
      <img
        src={currentSrc}
        alt={alt || ''}
        onError={() => {
          if (!useFallback) {
            setUseFallback(true);
          } else {
            setFallbackFailed(true);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...imgStyle,
        }}
      />
    </div>
  );
}
