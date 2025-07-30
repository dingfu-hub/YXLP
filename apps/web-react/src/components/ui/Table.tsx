import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';

// 表格列定义
export interface TableColumn<T = any> {
  key: string;
  title: string | React.ReactNode;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

// 排序配置
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// 表格属性接口
export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => string);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
  emptyText?: React.ReactNode;
  onSort?: (sortConfig: SortConfig | null) => void;
}

// 表格组件
export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  onRow,
  pagination,
  scroll,
  size = 'middle',
  bordered = false,
  striped = false,
  hoverable = true,
  className,
  emptyText = '暂无数据',
  onSort,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // 获取行键
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] as string || index.toString();
  };

  // 处理排序
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    let newSortConfig: SortConfig | null = null;
    
    if (sortConfig?.key === column.key) {
      // 如果是同一列，切换排序方向或清除排序
      if (sortConfig.direction === 'asc') {
        newSortConfig = { key: column.key, direction: 'desc' };
      } else {
        newSortConfig = null; // 清除排序
      }
    } else {
      // 新列，默认升序
      newSortConfig = { key: column.key, direction: 'asc' };
    }

    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  // 排序后的数据
  const sortedData = useMemo(() => {
    if (!sortConfig || onSort) {
      // 如果有外部排序处理或没有排序配置，直接返回原数据
      return data;
    }

    const { key, direction } = sortConfig;
    const column = columns.find(col => col.key === key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.dataIndex ? a[column.dataIndex] : a[key];
      const bValue = column.dataIndex ? b[column.dataIndex] : b[key];

      if (aValue === bValue) return 0;
      
      const result = aValue > bValue ? 1 : -1;
      return direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig, columns, onSort]);

  // 大小样式映射
  const sizeStyles = {
    small: 'text-xs',
    middle: 'text-sm',
    large: 'text-base',
  };

  const cellPaddingStyles = {
    small: 'px-2 py-1',
    middle: 'px-4 py-2',
    large: 'px-6 py-3',
  };

  // 渲染表头
  const renderHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              'font-medium text-gray-900 border-b border-gray-200',
              cellPaddingStyles[size],
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.sortable && 'cursor-pointer select-none hover:bg-gray-100',
              bordered && 'border-r border-gray-200 last:border-r-0',
              column.className
            )}
            style={{ width: column.width }}
            onClick={() => handleSort(column)}
          >
            <div className="flex items-center justify-between">
              <span>{column.title}</span>
              
              {column.sortable && (
                <div className="ml-2 flex flex-col">
                  <svg
                    className={cn(
                      'h-3 w-3',
                      sortConfig?.key === column.key && sortConfig.direction === 'asc'
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                  </svg>
                  <svg
                    className={cn(
                      'h-3 w-3 -mt-1',
                      sortConfig?.key === column.key && sortConfig.direction === 'desc'
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // 渲染表体
  const renderBody = () => (
    <tbody className="bg-white divide-y divide-gray-200">
      {sortedData.map((record, index) => {
        const rowProps = onRow?.(record, index) || {};
        
        return (
          <tr
            key={getRowKey(record, index)}
            className={cn(
              striped && index % 2 === 1 && 'bg-gray-50',
              hoverable && 'hover:bg-gray-50',
              'transition-colors duration-150',
              rowProps.className
            )}
            {...rowProps}
          >
            {columns.map((column) => {
              const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
              const cellContent = column.render ? column.render(value, record, index) : value;

              return (
                <td
                  key={column.key}
                  className={cn(
                    'text-gray-900 whitespace-nowrap',
                    cellPaddingStyles[size],
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    bordered && 'border-r border-gray-200 last:border-r-0',
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {cellContent}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );

  // 渲染空状态
  const renderEmpty = () => (
    <tbody>
      <tr>
        <td
          colSpan={columns.length}
          className={cn('text-center text-gray-500', cellPaddingStyles[size])}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <div className="py-8">{emptyText}</div>
          )}
        </td>
      </tr>
    </tbody>
  );

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'overflow-auto',
          scroll?.x && 'overflow-x-auto',
          scroll?.y && 'overflow-y-auto'
        )}
        style={{
          maxWidth: scroll?.x,
          maxHeight: scroll?.y,
        }}
      >
        <table
          className={cn(
            'min-w-full divide-y divide-gray-200',
            sizeStyles[size],
            bordered && 'border border-gray-200'
          )}
        >
          {renderHeader()}
          {sortedData.length > 0 ? renderBody() : renderEmpty()}
        </table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="mt-4">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

// 分页组件属性接口
export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  className?: string;
}

// 分页组件
export const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  className,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    const newPage = Math.ceil((startIndex - 1) / newSize) + 1;
    onChange(newPage, newSize);
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // 显示的页码数量
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(showPages / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(totalPages, start + showPages - 1);
      
      if (end - start < showPages - 1) {
        start = Math.max(1, end - showPages + 1);
      }
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* 总数显示 */}
      <div className="text-sm text-gray-700">
        {showTotal ? (
          showTotal(total, [startIndex, endIndex])
        ) : (
          `显示 ${startIndex}-${endIndex} 条，共 ${total} 条`
        )}
      </div>

      {/* 分页控件 */}
      <div className="flex items-center space-x-2">
        {/* 页码大小选择器 */}
        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>
        )}

        {/* 页码按钮 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current <= 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={typeof page === 'string'}
              className={cn(
                'px-3 py-1 text-sm border rounded-md',
                typeof page === 'string'
                  ? 'border-transparent cursor-default'
                  : page === current
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              )}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current >= totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className="flex items-center space-x-2 text-sm">
            <span>跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <span>页</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
