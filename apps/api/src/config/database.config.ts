import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig = registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || 'data/yxlp.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // 开发环境自动同步
  logging: process.env.NODE_ENV === 'development',
}))
