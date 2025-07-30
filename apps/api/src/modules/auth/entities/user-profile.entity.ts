import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm'
import { User } from './user.entity'

export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault?: boolean
}

export interface CompanyInfo {
  name: string
  registrationNumber?: string
  taxId?: string
  industry?: string
  website?: string
  description?: string
  address: Address
  contactPerson: {
    name: string
    title: string
    email: string
    phone: string
  }
}

export interface NotificationSettings {
  email: {
    marketing: boolean
    orderUpdates: boolean
    newsletter: boolean
    security: boolean
  }
  sms: {
    orderUpdates: boolean
    security: boolean
  }
  push: {
    orderUpdates: boolean
    marketing: boolean
  }
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts'
  dataSharing: boolean
  analytics: boolean
}

export interface UserPreferences {
  language: string
  currency: string
  timezone: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  theme: 'light' | 'dark' | 'auto'
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ nullable: true })
  displayName: string

  @Column({ nullable: true })
  avatar: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  dateOfBirth: Date

  @Column({
    type: 'varchar',
    nullable: true
  })
  gender: 'male' | 'female' | 'other'

  @Column({ default: 'en' })
  language: string

  @Column({ default: 'UTC' })
  timezone: string

  @Column()
  country: string

  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: Address) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => {
        if (!value) return null
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return null
          }
        }
        return value
      },
    }
  })
  address: Address

  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: CompanyInfo) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => {
        if (!value) return null
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return null
          }
        }
        return value
      },
    }
  })
  company: CompanyInfo

  @Column({
    type: 'text',
    default: '{"language":"en","currency":"USD","timezone":"UTC","notifications":{"email":{"marketing":true,"orderUpdates":true,"newsletter":false,"security":true},"sms":{"orderUpdates":true,"security":true},"push":{"orderUpdates":true,"marketing":false}},"privacy":{"profileVisibility":"private","dataSharing":false,"analytics":true},"theme":"auto"}',
    transformer: {
      to: (value: UserPreferences) => JSON.stringify(value),
      from: (value: string) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return {
              language: 'en',
              currency: 'USD',
              timezone: 'UTC',
              notifications: {
                email: { marketing: true, orderUpdates: true, newsletter: false, security: true },
                sms: { orderUpdates: true, security: true },
                push: { orderUpdates: true, marketing: false }
              },
              privacy: { profileVisibility: 'private', dataSharing: false, analytics: true },
              theme: 'auto'
            }
          }
        }
        return value
      },
    }
  })
  preferences: UserPreferences

  @OneToOne(() => User, (user) => user.profile)
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 获取完整名称
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  // 获取显示名称
  getDisplayName(): string {
    return this.displayName || this.getFullName()
  }

  // 检查是否有公司信息
  hasCompanyInfo(): boolean {
    return !!this.company?.name
  }

  // 获取主要地址
  getPrimaryAddress(): Address | null {
    if (this.address) {
      return this.address
    }
    if (this.company?.address) {
      return this.company.address
    }
    return null
  }

  // 更新偏好设置
  updatePreferences(newPreferences: Partial<UserPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...newPreferences,
    }
  }

  // 更新通知设置
  updateNotificationSettings(notifications: Partial<NotificationSettings>): void {
    this.preferences.notifications = {
      ...this.preferences.notifications,
      ...notifications,
    }
  }

  // 更新隐私设置
  updatePrivacySettings(privacy: Partial<PrivacySettings>): void {
    this.preferences.privacy = {
      ...this.preferences.privacy,
      ...privacy,
    }
  }
}
