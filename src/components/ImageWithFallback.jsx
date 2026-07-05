import React, { useState } from 'react';

const PEX = 'https://images.pexels.com/photos/';
const pex = (id) => `${PEX}${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`;

const FALLBACKS = {
  plants: pex(10176334),
  flowers: pex(1393437),
  vases: pex(2543299),
  seeds: pex(772571),
  tools: pex(6764325),
  fertilizers: pex(25974981),
  'pots-vases': pex(1605255),
  'garden-tools': pex(6764325),
  'decorative-items': pex(1124960),
  default: pex(10176334),
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
