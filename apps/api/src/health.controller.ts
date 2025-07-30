import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YXLP API 服务器</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #fff; margin-bottom: 1rem; }
        .status { font-size: 1.2rem; margin-bottom: 2rem; }
        .endpoints {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
        .endpoint {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .endpoint:last-child { border-bottom: none; }
        .method {
            background: #4CAF50;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .method.post { background: #2196F3; }
        .method.put { background: #FF9800; }
        .method.delete { background: #f44336; }
        a {
            color: #fff;
            text-decoration: none;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            transition: all 0.3s;
        }
        a:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 2rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 YXLP API 服务器</h1>
        <div class="status">
            ✅ 服务器运行正常<br>
            📅 ${new Date().toLocaleString('zh-CN')}<br>
            🔢 版本: 1.0.0
        </div>

        <h2>📡 可用的 API 端点</h2>
        <div class="endpoints">
            <div class="endpoint">
                <span><span class="method">GET</span> /health</span>
                <a href="/health" target="_blank">测试</a>
            </div>
            <div class="endpoint">
                <span><span class="method">GET</span> /health/db</span>
                <a href="/health/db" target="_blank">测试</a>
            </div>
            <div class="endpoint">
                <span><span class="method">GET</span> /cart/find-or-create</span>
                <a href="/cart/find-or-create?sessionId=demo" target="_blank">测试</a>
            </div>
            <div class="endpoint">
                <span><span class="method post">POST</span> /cart/:cartId/items</span>
                <span>添加商品到购物车</span>
            </div>
            <div class="endpoint">
                <span><span class="method">GET</span> /cart</span>
                <a href="/cart" target="_blank">测试</a>
            </div>
        </div>

        <div class="footer">
            <p>🛒 YXLP 电商平台 API 服务</p>
            <p>基于 NestJS + TypeORM + SQLite</p>
        </div>
    </div>
</body>
</html>
    `
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  }
}

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'YXLP API',
      version: '1.0.0',
    }
  }

  @Get('db')
  checkDatabase() {
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    }
  }
}
