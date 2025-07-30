import { IsString, MinLength, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDto {
  @ApiProperty({
    description: '重置令牌',
    example: 'abc123def456',
  })
  @IsString({ message: '重置令牌必须是字符串' })
  token: string

  @ApiProperty({
    description: '新密码',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: '密码必须包含大小写字母、数字和特殊字符' }
  )
  password: string

  @ApiProperty({
    description: '确认新密码',
    example: 'NewPassword123!',
  })
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword: string
}
