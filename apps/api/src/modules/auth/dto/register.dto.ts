import { 
  IsEmail, 
  IsString, 
  IsEnum, 
  IsBoolean, 
  IsOptional, 
  MinLength, 
  MaxLength,
  Matches,
  ValidateNested,
  IsObject
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../entities/user.entity'

export class CompanyInfoDto {
  @ApiProperty({
    description: '公司名称',
    example: 'YXLP Trading Co.',
  })
  @IsString({ message: '公司名称必须是字符串' })
  name: string

  @ApiProperty({
    description: '公司注册号',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '公司注册号必须是字符串' })
  registrationNumber?: string

  @ApiProperty({
    description: '行业类型',
    example: '服装贸易',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '行业类型必须是字符串' })
  industry?: string

  @ApiProperty({
    description: '公司网站',
    example: 'https://www.yxlp.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '公司网站必须是字符串' })
  website?: string

  @ApiProperty({
    description: '公司描述',
    example: '专业的服装出口贸易公司',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '公司描述必须是字符串' })
  description?: string
}

export class RegisterDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string

  @ApiProperty({
    description: '用户密码',
    example: 'Password123!',
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
    description: '确认密码',
    example: 'Password123!',
  })
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword: string

  @ApiProperty({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole, { message: '请选择有效的用户角色' })
  role: UserRole

  @ApiProperty({
    description: '名字',
    example: 'John',
  })
  @IsString({ message: '名字必须是字符串' })
  @MaxLength(50, { message: '名字不能超过50个字符' })
  firstName: string

  @ApiProperty({
    description: '姓氏',
    example: 'Doe',
  })
  @IsString({ message: '姓氏必须是字符串' })
  @MaxLength(50, { message: '姓氏不能超过50个字符' })
  lastName: string

  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @MaxLength(30, { message: '用户名不能超过30个字符' })
  username?: string

  @ApiProperty({
    description: '手机号码',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '手机号码必须是字符串' })
  phone?: string

  @ApiProperty({
    description: '国家',
    example: 'US',
  })
  @IsString({ message: '国家必须是字符串' })
  country: string

  @ApiProperty({
    description: '语言',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString({ message: '语言必须是字符串' })
  language?: string

  @ApiProperty({
    description: '是否接受服务条款',
    example: true,
  })
  @IsBoolean({ message: '必须接受服务条款' })
  acceptTerms: boolean

  @ApiProperty({
    description: '公司信息（经销商必填）',
    type: CompanyInfoDto,
    required: false,
  })
  @IsOptional()
  @IsObject({ message: '公司信息必须是对象' })
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company?: CompanyInfoDto
}
