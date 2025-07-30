import { IsString, IsNumber, IsOptional, IsUUID, IsPositive, Min, IsObject, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class AddToCartDto {
  @IsUUID()
  productId: string

  @IsOptional()
  @IsUUID()
  variantId?: string

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsObject()
  customizations?: Record<string, any>
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity?: number

  @IsOptional()
  @IsObject()
  customizations?: Record<string, any>
}

export class CartItemResponseDto {
  id: string
  productId: string
  variantId?: string
  productName: string
  productSku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: Array<{
    name: string
    value: string
    price?: number
  }>
  createdAt: Date
  updatedAt: Date
}

export class CartResponseDto {
  id: string
  userId?: string
  sessionId?: string
  status: string
  items: CartItemResponseDto[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  itemCount: number
  uniqueItemCount: number
  isEmpty: boolean
  isGuest: boolean
  isRegistered: boolean
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
  expiresAt?: Date
  convertedAt?: Date
  convertedOrderId?: string
  createdAt: Date
  updatedAt: Date
}

export class ShippingAddressDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  address1?: string

  @IsOptional()
  @IsString()
  address2?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  postalCode?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class CartQueryDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  sessionId?: string

  @IsOptional()
  @IsString()
  status?: string
}
