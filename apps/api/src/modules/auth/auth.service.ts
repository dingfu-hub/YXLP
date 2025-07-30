import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

import { User, UserRole, UserStatus } from './entities/user.entity'
import { UserProfile } from './entities/user-profile.entity'
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 用户注册
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const {
      email,
      password,
      confirmPassword,
      role,
      firstName,
      lastName,
      username,
      phone,
      country,
      language = 'en',
      acceptTerms,
      company,
    } = registerDto

    // 验证密码确认
    if (password !== confirmPassword) {
      throw new BadRequestException('密码和确认密码不匹配')
    }

    // 验证服务条款
    if (!acceptTerms) {
      throw new BadRequestException('必须接受服务条款')
    }

    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册')
    }

    // 检查用户名是否已存在（如果提供）
    if (username) {
      const existingUsername = await this.userRepository.findOne({
        where: { profile: { displayName: username } },
      })

      if (existingUsername) {
        throw new ConflictException('该用户名已被使用')
      }
    }

    // 创建用户资料
    const userProfile = this.userProfileRepository.create({
      firstName,
      lastName,
      displayName: username,
      phone,
      language,
      country,
      company,
    })

    // 创建用户
    const user = this.userRepository.create({
      email,
      passwordHash: password, // 将在实体的 @BeforeInsert 中自动加密
      role,
      status: UserStatus.ACTIVE, // 暂时设为激活状态，生产环境需要邮箱验证
      profile: userProfile,
      emailVerificationToken: uuidv4(),
    })

    // 保存用户
    const savedUser = await this.userRepository.save(user)

    // 生成令牌
    const tokens = await this.generateTokens(savedUser)

    // 返回认证响应
    return this.buildAuthResponse(savedUser, tokens)
  }

  // 用户登录
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, rememberMe } = loginDto

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    })

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // 检查用户状态
    if (!user.isActive()) {
      throw new UnauthorizedException('账户已被禁用，请联系管理员')
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date()
    await this.userRepository.save(user)

    // 生成令牌
    const tokens = await this.generateTokens(user, rememberMe)

    // 返回认证响应
    return this.buildAuthResponse(user, tokens)
  }

  // 刷新令牌
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })

      const user = await this.validateUserById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('用户不存在')
      }

      const tokens = await this.generateTokens(user)
      return this.buildAuthResponse(user, tokens)
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效或已过期')
    }
  }

  // 根据ID验证用户
  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    })
  }

  // 获取用户资料
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return user
  }

  // 忘记密码
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto

    const user = await this.userRepository.findOne({ where: { email } })
    if (!user) {
      // 为了安全，不透露用户是否存在
      return
    }

    // 生成重置令牌
    const resetToken = uuidv4()
    const resetExpires = new Date(Date.now() + 3600000) // 1小时后过期

    user.passwordResetToken = resetToken
    user.passwordResetExpires = resetExpires

    await this.userRepository.save(user)

    // TODO: 发送重置密码邮件
    console.log(`Password reset token for ${email}: ${resetToken}`)
  }

  // 重置密码
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password, confirmPassword } = resetPasswordDto

    if (password !== confirmPassword) {
      throw new BadRequestException('密码和确认密码不匹配')
    }

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    })

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('重置令牌无效或已过期')
    }

    // 更新密码
    user.passwordHash = password // 将在实体的 @BeforeUpdate 中自动加密
    user.passwordResetToken = null
    user.passwordResetExpires = null

    await this.userRepository.save(user)
  }

  // 修改密码
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('新密码和确认密码不匹配')
    }

    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 验证当前密码
    const isCurrentPasswordValid = await user.validatePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码错误')
    }

    // 更新密码
    user.passwordHash = newPassword // 将在实体的 @BeforeUpdate 中自动加密
    await this.userRepository.save(user)
  }

  // 生成JWT令牌
  private async generateTokens(user: User, rememberMe = false) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessTokenExpiry = rememberMe ? '30d' : '1h'
    const refreshTokenExpiry = rememberMe ? '90d' : '7d'

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry,
      }),
    ])

    return {
      accessToken,
      refreshToken,
      expiresIn: rememberMe ? 30 * 24 * 3600 : 3600, // 秒
    }
  }

  // 构建认证响应
  private buildAuthResponse(user: User, tokens: any): AuthResponseDto {
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          displayName: user.profile.displayName,
          avatar: user.profile.avatar,
          language: user.profile.language,
          country: user.profile.country,
        },
      },
      tokens,
    }
  }
}
