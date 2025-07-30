import { NextRequest, NextResponse } from 'next/server';

// 仅在开发/测试环境中可用的API端点
export async function POST(request: NextRequest) {
  // 仅在非生产环境中允许
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    // 动态导入以避免在生产环境中加载
    const { clearTokenBlacklist } = await import('@/lib/jwt');
    
    // 清理token黑名单
    clearTokenBlacklist();
    
    return NextResponse.json({
      success: true,
      message: 'Token blacklist cleared'
    });
  } catch (error) {
    console.error('Clear blacklist error:', error);
    return NextResponse.json(
      { error: 'Failed to clear blacklist' },
      { status: 500 }
    );
  }
}
