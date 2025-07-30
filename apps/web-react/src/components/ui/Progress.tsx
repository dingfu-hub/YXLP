import React from 'react';
import { cn } from '../../utils/cn';

// 进度条大小类型
export type ProgressSize = 'sm' | 'md' | 'lg';

// 进度条变体类型
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';

// 进度条属性接口
export interface ProgressProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
}

// 进度条大小样式映射
const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

// 进度条变体样式映射
const variantStyles: Record<ProgressVariant, string> = {
  default: 'bg-indigo-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

// 进度条组件
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
  animated = false,
  striped = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={cn('w-full', className)}>
      {/* 标签 */}
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {displayLabel}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* 进度条容器 */}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        {/* 进度条填充 */}
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantStyles[variant],
            striped && 'bg-stripes',
            animated && striped && 'animate-stripes'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={displayLabel}
        />
      </div>
    </div>
  );
};

// 圆形进度条属性接口
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

// 圆形进度条组件
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  label,
  className,
  animated = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const displayLabel = label || `${Math.round(percentage)}%`;

  const colorMap = {
    default: '#4F46E5', // indigo-600
    success: '#059669', // green-600
    warning: '#D97706', // yellow-600
    error: '#DC2626',   // red-600
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-out',
            animated && 'animate-pulse'
          )}
        />
      </svg>

      {/* 中心标签 */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {displayLabel}
          </span>
        </div>
      )}
    </div>
  );
};

// 步骤进度条属性接口
export interface StepProgressProps {
  steps: Array<{
    label: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
    error?: boolean;
  }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

// 步骤进度条组件
export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  className,
  orientation = 'horizontal',
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn('flex', isHorizontal ? 'flex-row' : 'flex-col', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div
            key={index}
            className={cn(
              'flex',
              isHorizontal ? 'flex-col items-center' : 'flex-row items-start',
              !isLast && (isHorizontal ? 'flex-1' : 'pb-4')
            )}
          >
            {/* 步骤指示器 */}
            <div className={cn('flex items-center', isHorizontal ? 'mb-2' : 'mr-4')}>
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium',
                  step.completed && 'bg-green-600 border-green-600 text-white',
                  step.current && !step.completed && 'bg-indigo-600 border-indigo-600 text-white',
                  step.error && 'bg-red-600 border-red-600 text-white',
                  !step.completed && !step.current && !step.error && 'bg-white border-gray-300 text-gray-500'
                )}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.error ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* 连接线 */}
              {!isLast && (
                <div
                  className={cn(
                    isHorizontal ? 'w-full h-0.5 ml-2' : 'w-0.5 h-8 mt-2',
                    step.completed ? 'bg-green-600' : 'bg-gray-300'
                  )}
                />
              )}
            </div>

            {/* 步骤内容 */}
            <div className={cn('text-center', isHorizontal ? 'max-w-xs' : 'flex-1')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  step.current ? 'text-indigo-600' : step.completed ? 'text-green-600' : step.error ? 'text-red-600' : 'text-gray-500'
                )}
              >
                {step.label}
              </p>
              
              {step.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Progress;
