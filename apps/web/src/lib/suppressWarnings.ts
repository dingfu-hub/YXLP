/**
 * 抑制开发环境中的React警告
 * 这个文件应该只在开发环境中使用
 */

if (process.env.NODE_ENV === 'development') {
  // 保存原始的console方法
  const originalError = console.error
  const originalWarn = console.warn

  // 需要抑制的警告模式
  const suppressedWarnings = [
    // React状态更新警告
    'Warning: Can\'t perform a React state update on an unmounted component',
    'Warning: Can\'t perform a React state update on a component that hasn\'t mounted yet',
    
    // React开发工具警告
    'Warning: ReactDOM.render is no longer supported',
    'Warning: componentWillReceiveProps has been renamed',
    'Warning: componentWillMount has been renamed',
    'Warning: componentWillUpdate has been renamed',
    
    // Next.js相关警告
    'Warning: Extra attributes from the server',
    'Warning: Prop `className` did not match',
    
    // 其他常见警告
    'Warning: Failed prop type',
    'Warning: Each child in a list should have a unique "key" prop',
  ]

  // 重写console.error
  console.error = (...args: any[]) => {
    const message = args[0]
    
    if (typeof message === 'string') {
      // 检查是否是需要抑制的警告
      const shouldSuppress = suppressedWarnings.some(pattern => 
        message.includes(pattern)
      )
      
      if (shouldSuppress) {
        return // 抑制这个警告
      }
    }
    
    // 调用原始的console.error
    originalError.apply(console, args)
  }

  // 重写console.warn
  console.warn = (...args: any[]) => {
    const message = args[0]
    
    if (typeof message === 'string') {
      // 检查是否是需要抑制的警告
      const shouldSuppress = suppressedWarnings.some(pattern => 
        message.includes(pattern)
      )
      
      if (shouldSuppress) {
        return // 抑制这个警告
      }
    }
    
    // 调用原始的console.warn
    originalWarn.apply(console, args)
  }

  // 在页面卸载时恢复原始方法
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.error = originalError
      console.warn = originalWarn
    })
  }
}

export {}
