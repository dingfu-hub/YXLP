import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { CartItem } from './cart-item.entity'

export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  userId?: string

  @Column({ nullable: true })
  sessionId?: string

  @Column({
    type: 'varchar',
    default: CartStatus.ACTIVE,
  })
  status: CartStatus

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[]

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingAmount: number

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number

  @Column('json', { nullable: true })
  shippingAddress?: {
    firstName?: string
    lastName?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
  }

  @Column({ nullable: true })
  expiresAt?: Date

  @Column({ nullable: true })
  convertedAt?: Date

  @Column({ nullable: true })
  convertedOrderId?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Computed properties
  get itemCount(): number {
    return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  get uniqueItemCount(): number {
    return this.items?.length || 0
  }

  get isEmpty(): boolean {
    return this.itemCount === 0
  }

  get isGuest(): boolean {
    return !this.userId
  }

  get isRegistered(): boolean {
    return !!this.userId
  }

  // Helper methods
  calculateSubtotal(): number {
    return this.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0
  }

  calculateTotal(): number {
    return this.subtotal + this.taxAmount + this.shippingAmount - this.discountAmount
  }

  updateTotals(): void {
    this.subtotal = this.calculateSubtotal()
    this.total = this.calculateTotal()
  }

  setExpiration(days: number = 30): void {
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }

  setShippingAddress(address: Partial<Cart['shippingAddress']>): void {
    this.shippingAddress = { ...this.shippingAddress, ...address }
  }

  markAsConverted(orderId: string): void {
    this.status = CartStatus.CONVERTED
    this.convertedAt = new Date()
    this.convertedOrderId = orderId
  }

  clear(): void {
    this.items = []
    this.subtotal = 0
    this.taxAmount = 0
    this.discountAmount = 0
    this.total = 0
  }
}
