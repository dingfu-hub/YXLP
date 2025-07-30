import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../entities/user.entity'

export class UserResponseDto {
  @ApiProperty({
    description: '用户ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
  })
  email: string

  @ApiProperty({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role: UserRole

  @ApiProperty({
    description: '用户资料',
    type: 'object',
  })
  profile: {
    firstName: string
    lastName: string
    displayName?: string
    avatar?: string
    language: string
    country: string
  }
}

export class TokensDto {
  @ApiProperty({
    description: '访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string

  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string

  @ApiProperty({
    description: '令牌过期时间（秒）',
    example: 3600,
  })
  expiresIn: number
}

export class AuthResponseDto {
  @ApiProperty({
    description: '用户信息',
    type: UserResponseDto,
  })
  user: UserResponseDto

  @ApiProperty({
    description: '认证令牌',
    type: TokensDto,
  })
  tokens: TokensDto
}

export class MessageResponseDto {
  @ApiProperty({
    description: '响应消息',
    example: '操作成功',
  })
  message: string

  @ApiProperty({
    description: '是否成功',
    example: true,
  })
  success: boolean
}
