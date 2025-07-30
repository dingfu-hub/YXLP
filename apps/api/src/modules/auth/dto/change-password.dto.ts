import { IsString, MinLength, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'CurrentPassword123!',
  })
  @IsString({ message: '当前密码必须是字符串' })
  currentPassword: string

  @ApiProperty({
    description: '新密码',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: '密码必须包含大小写字母、数字和特殊字符' }
  )
  newPassword: string

  @ApiProperty({
    description: '确认新密码',
    example: 'NewPassword123!',
  })
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword: string
}
