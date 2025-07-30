'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  fallbackText?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

/**
 * 带有回退机制的图片组件
 * 当图片加载失败时，会显示占位图片或文本
 */
export default function ImageWithFallback({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fallbackSrc,
  fallbackText,
  priority = false,
  fill = false,
  sizes,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // 生成占位图片URL
  const generatePlaceholder = (w: number, h: number, text?: string) => {
    const placeholderText = text || alt || `${w}×${h}`
    return `/api/placeholder/${w}x${h}?text=${encodeURIComponent(placeholderText)}&bg=f3f4f6&color=6b7280`
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // 尝试使用自定义回退图片
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc)
      } else {
        // 使用占位图片
        setImgSrc(generatePlaceholder(width, height, fallbackText))
      }
    }
  }

  const handleLoad = () => {
    setHasError(false)
  }

  // 如果使用fill属性
  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        {...props}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      priority={priority}
      sizes={sizes}
      {...props}
    />
  )
}

/**
 * 简化的占位图片组件
 */
export function PlaceholderImage({
  width = 400,
  height = 300,
  text,
  className = '',
  bgColor = 'f3f4f6',
  textColor = '6b7280',
}: {
  width?: number
  height?: number
  text?: string
  className?: string
  bgColor?: string
  textColor?: string
}) {
  const placeholderText = text || `${width}×${height}`
  const src = `/api/placeholder/${width}x${height}?text=${encodeURIComponent(placeholderText)}&bg=${bgColor}&color=${textColor}`

  return (
    <Image
      src={src}
      alt={placeholderText}
      width={width}
      height={height}
      className={className}
    />
  )
}

/**
 * 产品图片组件
 */
export function ProductImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  productName,
}: {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  productName?: string
}) {
  const fallbackText = productName || alt || '产品图片'
  const imageSrc = src || `/api/placeholder/${width}x${height}?text=${encodeURIComponent(fallbackText)}&bg=f8fafc&color=475569`

  return (
    <ImageWithFallback
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fallbackText={fallbackText}
    />
  )
}
