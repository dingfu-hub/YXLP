import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

// 选择器大小类型
export type SelectSize = 'sm' | 'md' | 'lg';

// 选择器状态类型
export type SelectState = 'default' | 'error' | 'success' | 'warning';

// 选项类型
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// 选择器属性接口
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  state?: SelectState;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

// 选择器大小样式映射
const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

// 选择器状态样式映射
const stateStyles: Record<SelectState, string> = {
  default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
};

// 选择器组件
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorText,
      placeholder,
      options,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = state === 'error' || !!errorText;
    const displayText = errorText || helperText;

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium mb-1',
              hasError ? 'text-red-700' : 'text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        )}

        {/* 选择器容器 */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              // 基础样式
              'block w-full rounded-md border shadow-sm transition-colors duration-200',
              'focus:outline-none focus:ring-1',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              'appearance-none bg-white',
              
              // 大小样式
              sizeStyles[size],
              
              // 状态样式
              stateStyles[hasError ? 'error' : state],
              
              // 右侧箭头间距
              'pr-10',
              
              // 自定义样式
              className
            )}
            {...props}
          >
            {/* 占位符选项 */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {/* 选项列表 */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* 下拉箭头 */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className={cn(
                'h-5 w-5',
                hasError ? 'text-red-400' : 'text-gray-400'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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

Select.displayName = 'Select';

// 多选组件属性接口
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange' | 'multiple'> {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  maxSelections?: number;
}

// 多选组件
export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(
  (
    {
      value = [],
      onChange,
      maxSelections,
      options,
      placeholder = '请选择...',
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);

      // 检查最大选择数限制
      if (maxSelections && selectedOptions.length > maxSelections) {
        return;
      }

      onChange?.(selectedOptions);
    };

    // 将数组值转换为字符串，用于多选
    const selectValue = Array.isArray(value) ? value.join(',') : '';

    return (
      <Select
        ref={ref}
        multiple
        value={selectValue}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        className="min-h-[120px]"
        {...props}
      />
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

// 分组选择器组件
export interface GroupedSelectOption {
  label: string;
  options: SelectOption[];
}

export interface GroupedSelectProps extends Omit<SelectProps, 'options'> {
  options: GroupedSelectOption[];
}

export const GroupedSelect = forwardRef<HTMLSelectElement, GroupedSelectProps>(
  ({ options, placeholder, ...restProps }, ref) => {
    const {
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorText,
      fullWidth = false,
      disabled,
      className,
      id,
      ...selectProps
    } = restProps;

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-medium mb-1',
              state === 'error' || errorText ? 'text-red-700' : 'text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        )}

        {/* 选择器容器 */}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              // 基础样式
              'block w-full rounded-md border shadow-sm transition-colors duration-200',
              'focus:outline-none focus:ring-1',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              'appearance-none bg-white pr-10',

              // 大小样式
              sizeStyles[size],

              // 状态样式
              stateStyles[state === 'error' || errorText ? 'error' : state],

              // 自定义样式
              className
            )}
            {...selectProps}
          >
            {/* 占位符选项 */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {/* 分组选项 */}
            {options.map((group, groupIndex) => (
              <optgroup key={groupIndex} label={group.label}>
                {group.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* 下拉箭头 */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className={cn(
                'h-5 w-5',
                state === 'error' || errorText ? 'text-red-400' : 'text-gray-400'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* 帮助文本或错误文本 */}
        {(errorText || helperText) && (
          <p
            className={cn(
              'mt-1 text-sm',
              errorText ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);

GroupedSelect.displayName = 'GroupedSelect';

export default Select;
