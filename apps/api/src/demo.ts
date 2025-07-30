import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppDemoModule } from './app-demo.module'

async function bootstrap() {
  const app = await NestFactory.create(AppDemoModule)

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // 启用 CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🛒 购物车演示 API 运行在: http://localhost:${port}`)
  console.log(`📋 API 端点:`)
  console.log(`   GET    /demo/cart/:cartId          - 获取购物车`)
  console.log(`   POST   /demo/cart/:cartId/items    - 添加商品到购物车`)
  console.log(`   PUT    /demo/cart/:cartId/items/:itemId - 更新购物车商品`)
  console.log(`   DELETE /demo/cart/:cartId/items/:itemId - 删除购物车商品`)
  console.log(`   DELETE /demo/cart/:cartId          - 清空购物车`)
  console.log(`   GET    /demo/cart                 - 获取所有购物车`)
}
bootstrap()
