import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'

export interface JwtPayload {
  sub: string // user id
  email: string
  role: string
  iat: number
  exp: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub)
    
    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用')
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('用户账户已被禁用')
    }

    return user
  }
}
