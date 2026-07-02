import React, { useState } from 'react';

const PHOTO_URL = 'https://images.unsplash.com/photo-';

const FALLBACKS = {
  plants: PHOTO_URL + '1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
  flowers: PHOTO_URL + '1518895949257-7621c3c786d7?w=600&h=600&fit=crop',
  vases: PHOTO_URL + '1581783898377-1c85bf937427?w=600&h=600&fit=crop',
  seeds: PHOTO_URL + '1460191269172-12c3ce6e8bfa?w=600&h=600&fit=crop',
  tools: PHOTO_URL + '1581783898377-1c85bf937427?w=600&h=600&fit=crop',
  fertilizers: PHOTO_URL + '1613143798921-c342c82c32e2?w=600&h=600&fit=crop',
  default: PHOTO_URL + '1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
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
