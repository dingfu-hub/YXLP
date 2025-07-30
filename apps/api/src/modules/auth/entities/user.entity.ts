import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import * as bcrypt from 'bcryptjs'
import { UserProfile } from './user-profile.entity'

export enum UserRole {
  ADMIN = 'admin',
  DISTRIBUTOR = 'distributor',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude()
  passwordHash: string

  @Column({
    type: 'varchar',
    default: UserRole.CUSTOMER,
  })
  role: UserRole

  @Column({
    type: 'varchar',
    default: UserStatus.PENDING,
  })
  status: UserStatus

  @Column({ nullable: true })
  emailVerifiedAt: Date

  @Column({ nullable: true })
  lastLoginAt: Date

  @Column({ nullable: true })
  passwordResetToken: string

  @Column({ nullable: true })
  passwordResetExpires: Date

  @Column({ nullable: true })
  emailVerificationToken: string

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  profile: UserProfile

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 密码加密
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
    }
  }

  // 验证密码
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }

  // 检查是否为管理员
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN
  }

  // 检查是否为经销商
  isDistributor(): boolean {
    return this.role === UserRole.DISTRIBUTOR
  }

  // 检查是否为客户
  isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER
  }

  // 检查是否激活
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE
  }

  // 检查邮箱是否已验证
  isEmailVerified(): boolean {
    return !!this.emailVerifiedAt
  }

  // 获取显示名称
  getDisplayName(): string {
    if (this.profile?.displayName) {
      return this.profile.displayName
    }
    if (this.profile?.firstName && this.profile?.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`
    }
    return this.email
  }

  // 获取完整名称
  getFullName(): string {
    if (this.profile?.firstName && this.profile?.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`
    }
    return this.email
  }

  // 转换为安全的用户对象（排除敏感信息）
  toSafeObject() {
    const { passwordHash, passwordResetToken, emailVerificationToken, ...safeUser } = this
    return safeUser
  }
}
