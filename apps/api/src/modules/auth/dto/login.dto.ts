import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string

  @ApiProperty({
    description: '用户密码',
    example: 'password123',
  })
  @IsString({ message: '密码必须是字符串' })
  password: string

  @ApiProperty({
    description: '是否记住登录状态',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '记住我必须是布尔值' })
  rememberMe?: boolean
}
