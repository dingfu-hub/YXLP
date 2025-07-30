export default function SimpleTest() {
  return (
    <html>
      <head>
        <title>简单测试页面</title>
        <style>{`
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f0f0f0; 
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          }
          .success { 
            color: green; 
            font-weight: bold; 
          }
          .error { 
            color: red; 
            font-weight: bold; 
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🔍 简单测试页面</h1>
          <p className="success">✅ 如果你能看到这个页面，说明基础渲染正常</p>
          <p className="success">✅ HTML渲染正常</p>
          <p className="success">✅ CSS样式正常</p>
          <p className="success">✅ Next.js路由正常</p>
          
          <hr style={{margin: '20px 0'}} />
          
          <h2>测试信息</h2>
          <ul>
            <li>页面路径: /simple-test</li>
            <li>渲染时间: {new Date().toLocaleString()}</li>
            <li>用户代理: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server Side'}</li>
          </ul>
          
          <hr style={{margin: '20px 0'}} />
          
          <h2>下一步测试</h2>
          <p>如果这个页面能正常显示，请尝试访问：</p>
          <ul>
            <li><a href="/admin/diagnostic">诊断页面</a></li>
            <li><a href="/admin/test-page">React测试页面</a></li>
            <li><a href="/admin/news">新闻管理页面</a></li>
          </ul>
        </div>
      </body>
    </html>
  )
}
