import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { Public } from './decorators/public.decorator'
import { CurrentUser } from './decorators/current-user.decorator'
import { User } from './entities/user.entity'
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RefreshTokenDto,
  MessageResponseDto,
} from './dto'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 409,
    description: '邮箱已被注册',
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '邮箱或密码错误',
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '令牌刷新成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '刷新令牌无效或已过期',
  })
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '获取用户信息成功',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.authService.getProfile(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiOperation({ summary: '检查认证状态' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '认证状态检查成功',
  })
  async checkAuth(@CurrentUser() user: User) {
    return {
      authenticated: true,
      user: user.toSafeObject(),
    }
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '忘记密码' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: '重置密码邮件已发送',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(forgotPasswordDto)
    return {
      message: '如果该邮箱存在，重置密码链接已发送到您的邮箱',
      success: true,
    }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置密码' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: '密码重置成功',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '重置令牌无效或已过期',
  })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.resetPassword(resetPasswordDto)
    return {
      message: '密码重置成功，请使用新密码登录',
      success: true,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: '密码修改成功',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '当前密码错误',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.changePassword(user.id, changePasswordDto)
    return {
      message: '密码修改成功',
      success: true,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登出' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '登出成功',
    type: MessageResponseDto,
  })
  async logout(): Promise<MessageResponseDto> {
    // 在实际应用中，这里可以将令牌加入黑名单
    // 目前只是返回成功消息，客户端需要清除本地存储的令牌
    return {
      message: '登出成功',
      success: true,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登出所有设备' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '所有设备登出成功',
    type: MessageResponseDto,
  })
  async logoutAll(): Promise<MessageResponseDto> {
    // 在实际应用中，这里可以将用户的所有令牌加入黑名单
    // 或者更新用户的令牌版本号，使所有旧令牌失效
    return {
      message: '所有设备登出成功',
      success: true,
    }
  }
}
