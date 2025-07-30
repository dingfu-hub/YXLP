import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Notification, NotificationType } from '../../types';

// Toast容器位置类型
export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

// Toast项属性接口
export interface ToastItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
  position: ToastPosition;
}

// Toast项组件
const ToastItem: React.FC<ToastItemProps> = ({ notification, onRemove, position }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 动画效果
  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 自动移除
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  // 类型样式映射
  const typeStyles: Record<NotificationType, { bg: string; border: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-green-50 border-green-200',
      border: 'border-green-500',
      icon: (
        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      border: 'border-red-500',
      icon: (
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      border: 'border-yellow-500',
      icon: (
        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      border: 'border-blue-500',
      icon: (
        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const currentStyle = typeStyles[notification.type];

  // 位置动画样式
  const getAnimationClass = () => {
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    const isTop = position.includes('top');
    
    if (isRemoving) {
      if (isLeft) return 'transform -translate-x-full opacity-0';
      if (isRight) return 'transform translate-x-full opacity-0';
      return 'transform scale-95 opacity-0';
    }
    
    if (!isVisible) {
      if (isLeft) return 'transform -translate-x-full opacity-0';
      if (isRight) return 'transform translate-x-full opacity-0';
      if (isTop) return 'transform -translate-y-2 opacity-0';
      return 'transform translate-y-2 opacity-0';
    }
    
    return 'transform translate-x-0 translate-y-0 opacity-100';
  };

  return (
    <div
      className={cn(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        'transition-all duration-300 ease-in-out',
        currentStyle.bg,
        getAnimationClass()
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentStyle.icon}
          </div>
          
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
            
            {/* 操作按钮 */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleRemove}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">关闭</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast容器属性接口
export interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  position?: ToastPosition;
  maxNotifications?: number;
}

// Toast容器组件
export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemove,
  position = 'top-right',
  maxNotifications = 5,
}) => {
  // 限制显示的通知数量
  const displayNotifications = notifications.slice(0, maxNotifications);

  // 位置样式映射
  const positionStyles: Record<ToastPosition, string> = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0',
  };

  if (displayNotifications.length === 0) return null;

  const toastContainer = (
    <div
      className={cn(
        'fixed z-50 p-6 pointer-events-none',
        positionStyles[position]
      )}
    >
      <div className="flex flex-col space-y-4">
        {displayNotifications.map((notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            position={position}
          />
        ))}
      </div>
    </div>
  );

  return createPortal(toastContainer, document.body);
};

// Toast Hook
export const useToast = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // 便捷方法
  const toast = {
    success: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),
    error: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, ...options }),
    warning: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    info: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options }),
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    toast,
  };
};

export { ToastItem };
export default ToastContainer;
