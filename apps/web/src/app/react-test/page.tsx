'use client'

import React from 'react'

export default function ReactTest() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 React功能测试</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>基础React功能</h2>
        <p>✅ React组件渲染正常</p>
        <p>✅ JSX语法正常</p>
        <p>✅ 'use client'指令正常</p>
      </div>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>React Hooks测试</h2>
        <p>计数器: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          点击增加 (+1)
        </button>
        <p>✅ useState Hook正常</p>
        <p>✅ 事件处理正常</p>
      </div>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>下一步测试</h2>
        <p>如果这个页面正常工作，问题可能在于：</p>
        <ul>
          <li>AdminContext组件</li>
          <li>Tailwind CSS</li>
          <li>复杂的业务组件</li>
        </ul>
        
        <div style={{ marginTop: '20px' }}>
          <a 
            href="/admin/diagnostic" 
            style={{ 
              background: '#28a745', 
              color: 'white', 
              padding: '10px 20px', 
              textDecoration: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            诊断页面
          </a>
          <a 
            href="/admin/news" 
            style={{ 
              background: '#dc3545', 
              color: 'white', 
              padding: '10px 20px', 
              textDecoration: 'none', 
              borderRadius: '4px'
            }}
          >
            新闻页面
          </a>
        </div>
      </div>
    </div>
  )
}
