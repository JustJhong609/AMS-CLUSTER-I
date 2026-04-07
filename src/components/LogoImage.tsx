import React, { useState, useEffect } from 'react';

interface LogoImageProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoImage: React.FC<LogoImageProps> = ({
  src,
  alt = 'Logo',
  size = 48,
  className,
  style
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
      style={{
        ...style,
        borderRadius: '12px',
        objectFit: 'contain',
        opacity: imageLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        ...(imageError && { display: 'none' })
      }}
    />
  );
};

export default LogoImage;
