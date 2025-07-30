import React, { useState, useEffect } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  width?: number;
  height?: number;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackText,
  width,
  height 
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 真实图片资源映射 - 这里可以配置真实的图片URL
  const realImageMap: { [key: string]: string } = {
    // 产品图片
    'shirts': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    'pants': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
    'dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    'jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    'shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    'underwear': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop',
    'sportswear': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    
    // 公司相关图片
    'factory': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    'team': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
    'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    
    // 默认产品图片
    'product-default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
  };

  // 根据src内容智能匹配真实图片
  const getRealImageUrl = (originalSrc: string): string => {
    // 检查是否包含分类关键词
    for (const [key, url] of Object.entries(realImageMap)) {
      if (originalSrc.toLowerCase().includes(key.toLowerCase())) {
        return url;
      }
    }
    
    // 如果是产品图片，使用默认产品图片
    if (originalSrc.includes('product') || originalSrc.includes('placeholder')) {
      return realImageMap['product-default'];
    }
    
    // 返回原始URL
    return originalSrc;
  };

  // 生成本地占位符SVG
  const generatePlaceholderSVG = (width: number, height: number, text: string): string => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">
          ${text}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // 首先尝试真实图片
    const realImageUrl = getRealImageUrl(src);
    setImageSrc(realImageUrl);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // 降级到本地生成的占位符
    const displayWidth = width || 400;
    const displayHeight = height || 400;
    const displayText = fallbackText || alt || 'Image';
    
    setImageSrc(generatePlaceholderSVG(displayWidth, displayHeight, displayText));
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={width}
        height={height}
      />
      
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          {fallbackText || alt || 'Image unavailable'}
        </div>
      )}
    </div>
  );
};

export default Image;
