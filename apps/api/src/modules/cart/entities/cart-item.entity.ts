import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Cart } from './cart.entity'

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  cartId: string

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart

  @Column()
  productId: string

  @Column({ nullable: true })
  variantId?: string

  @Column()
  productName: string

  @Column({ nullable: true })
  productSku?: string

  @Column('int')
  quantity: number

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number

  @Column('json', { nullable: true })
  customizations?: Array<{
    name: string
    value: string
    price?: number
  }>

  @Column({ nullable: true })
  reservedUntil?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Computed properties
  get totalPrice(): number {
    const customizationPrice = this.customizations?.reduce((sum, c) => sum + (c.price || 0), 0) || 0
    return (this.unitPrice + customizationPrice) * this.quantity
  }

  get hasCustomizations(): boolean {
    return this.customizations && this.customizations.length > 0
  }

  // Helper methods
  updateQuantity(newQuantity: number): void {
    this.quantity = Math.max(1, newQuantity)
  }

  addCustomization(name: string, value: string, price: number = 0): void {
    if (!this.customizations) {
      this.customizations = []
    }
    
    // Remove existing customization with same name
    this.customizations = this.customizations.filter(c => c.name !== name)
    
    // Add new customization
    this.customizations.push({ name, value, price })
  }

  removeCustomization(name: string): void {
    if (this.customizations) {
      this.customizations = this.customizations.filter(c => c.name !== name)
    }
  }

  reserveStock(minutes: number = 15): void {
    this.reservedUntil = new Date(Date.now() + minutes * 60 * 1000)
  }

  releaseReservation(): void {
    this.reservedUntil = null
  }

  updateTotalPrice(): void {
    // totalPrice is a computed getter, no need to set it manually
    // This method exists for compatibility but doesn't need to do anything
  }

  get customization(): Record<string, any> {
    // Compatibility getter for the service
    const result: Record<string, any> = {}
    this.customizations?.forEach(c => {
      result[c.name] = c.value
    })
    return result
  }

  set customization(value: Record<string, any>) {
    // Compatibility setter for the service
    this.customizations = Object.entries(value || {}).map(([name, val]) => ({
      name,
      value: String(val),
    }))
  }
}
