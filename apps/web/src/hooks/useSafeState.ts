import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * 安全的状态Hook，防止在组件卸载后更新状态
 * 解决 "Warning: Can't perform a React state update on an unmounted component" 错误
 */
export function useSafeState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeSetState = useCallback((value: T | ((prevState: T) => T)) => {
    if (mountedRef.current) {
      setState(value)
    }
  }, [])

  return [state, safeSetState] as const
}

/**
 * 安全的异步操作Hook
 * 确保异步操作完成时组件仍然挂载
 */
export function useSafeAsync() {
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const result = await asyncFn()
      if (mountedRef.current && onSuccess) {
        onSuccess(result)
      }
      return result
    } catch (error) {
      if (mountedRef.current && onError) {
        onError(error as Error)
      }
      throw error
    }
  }, [])

  return { safeAsync, isMounted: () => mountedRef.current }
}

/**
 * 安全的定时器Hook
 * 自动清理定时器，防止内存泄漏
 */
export function useSafeTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(callback, delay)
    return timeoutRef.current
  }, [])

  const clearSafeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return { setSafeTimeout, clearSafeTimeout }
}

/**
 * 安全的间隔器Hook
 * 自动清理间隔器，防止内存泄漏
 */
export function useSafeInterval() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const setSafeInterval = useCallback((callback: () => void, delay: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(callback, delay)
    return intervalRef.current
  }, [])

  const clearSafeInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return { setSafeInterval, clearSafeInterval }
}
