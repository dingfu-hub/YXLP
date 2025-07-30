'use client'

import { allNewsArticles, newsCategories } from '@/data/news'

export default function TestDataPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">新闻数据测试</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">分类数据:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(newsCategories, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">新闻数据 (前3条):</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(allNewsArticles?.slice(0, 3) || [], null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">数据统计:</h2>
        <ul className="list-disc list-inside">
          <li>分类数量: {newsCategories?.length || 0}</li>
          <li>新闻数量: {allNewsArticles?.length || 0}</li>
          <li>数据类型: {typeof allNewsArticles}</li>
        </ul>
      </div>
    </div>
  )
}
