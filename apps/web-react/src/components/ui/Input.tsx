import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

// 输入框大小类型
export type InputSize = 'sm' | 'md' | 'lg';

// 输入框状态类型
export type InputState = 'default' | 'error' | 'success' | 'warning';

// 输入框属性接口
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// 输入框大小样式映射
const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

// 输入框状态样式映射
const stateStyles: Record<InputState, string> = {
  default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
};

// 输入框组件
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = state === 'error' || !!errorText;
    const displayText = errorText || helperText;

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1',
              hasError ? 'text-red-700' : 'text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={cn('text-gray-400', hasError && 'text-red-400')}>
                {leftIcon}
              </span>
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              // 基础样式
              'block w-full rounded-md border shadow-sm transition-colors duration-200',
              'focus:outline-none focus:ring-1',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              
              // 大小样式
              sizeStyles[size],
              
              // 状态样式
              stateStyles[hasError ? 'error' : state],
              
              // 图标间距
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              // 自定义样式
              className
            )}
            {...props}
          />

          {/* 右侧图标 */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={cn('text-gray-400', hasError && 'text-red-400')}>
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* 帮助文本或错误文本 */}
        {displayText && (
          <p
            className={cn(
              'mt-1 text-sm',
              hasError ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {displayText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// 密码输入框组件
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    const eyeIcon = showPassword ? (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showPasswordToggle ? (
            <button
              type="button"
              onClick={togglePassword}
              className="hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {eyeIcon}
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// 搜索输入框组件
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, showClearButton = true, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState<string>(value?.toString() || '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(internalValue);
      }
    };

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    const searchIcon = (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );

    const clearIcon = (
      <button
        type="button"
        onClick={handleClear}
        className="hover:text-gray-600 focus:outline-none"
        tabIndex={-1}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );

    return (
      <Input
        ref={ref}
        type="search"
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        leftIcon={searchIcon}
        rightIcon={showClearButton && internalValue ? clearIcon : undefined}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default Input;
