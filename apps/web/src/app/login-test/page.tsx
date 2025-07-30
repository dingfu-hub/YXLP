'use client'

import React, { useState } from 'react'

export default function LoginTestPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('测试中...')
    
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      
      setResult(`
状态码: ${response.status}
响应: ${JSON.stringify(data, null, 2)}
      `)
    } catch (error) {
      setResult(`错误: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testMe = async () => {
    setLoading(true)
    setResult('测试中...')
    
    try {
      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()
      
      setResult(`
状态码: ${response.status}
响应: ${JSON.stringify(data, null, 2)}
      `)
    } catch (error) {
      setResult(`错误: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔐 登录API测试页面</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>登录测试</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <label>用户名:</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="输入用户名"
            style={{ 
              marginLeft: '10px', 
              padding: '5px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>密码:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            style={{ 
              marginLeft: '10px', 
              padding: '5px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={testLogin}
            disabled={loading}
            style={{ 
              background: '#007bff', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '测试中...' : '测试登录API'}
          </button>
          
          <button 
            onClick={testMe}
            disabled={loading}
            style={{ 
              background: '#28a745', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '测试中...' : '测试用户信息API'}
          </button>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          minHeight: '100px'
        }}>
          <h3>测试结果:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result || '点击按钮开始测试...'}
          </pre>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>快速测试</h2>
        <p>默认管理员账号测试:</p>
        <button 
          onClick={() => {
            setUsername('admin')
            setPassword('admin123')
            setTimeout(testLogin, 100)
          }}
          disabled={loading}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          使用默认账号测试
        </button>
      </div>
    </div>
  )
}
