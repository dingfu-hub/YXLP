import { NextResponse } from 'next/server'
import { allNewsArticles, newsCategories } from '@/data/news'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        categories: newsCategories,
        articles: allNewsArticles?.slice(0, 3) || [],
        totalArticles: allNewsArticles?.length || 0,
        dataType: typeof allNewsArticles,
        isArray: Array.isArray(allNewsArticles)
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
