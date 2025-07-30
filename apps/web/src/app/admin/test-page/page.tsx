'use client'

import React from 'react'

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">测试页面</h1>
      <p>如果你能看到这个页面，说明基础渲染是正常的。</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
        <p>✅ React渲染正常</p>
        <p>✅ Tailwind CSS加载正常</p>
        <p>✅ 路由工作正常</p>
      </div>
    </div>
  )
}
