import { Module } from '@nestjs/common'
import { DemoController, StaticController } from './demo.controller'

@Module({
  controllers: [DemoController, StaticController],
})
export class AppDemoModule {}
