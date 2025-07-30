import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cart, CartStatus } from './entities/cart.entity'
import { CartItem } from './entities/cart-item.entity'
import { AddToCartDto, UpdateCartItemDto, CartResponseDto, ShippingAddressDto } from './dto/cart.dto'

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name)

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async createCart(userId?: string, sessionId?: string): Promise<Cart> {
    const cart = this.cartRepository.create({
      userId,
      sessionId,
      status: CartStatus.ACTIVE,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 0,
      total: 0,
    })

    cart.setExpiration(30) // 30 days expiration
    return await this.cartRepository.save(cart)
  }

  async findOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { userId, status: CartStatus.ACTIVE },
        relations: ['items'],
      })
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({
        where: { sessionId, status: CartStatus.ACTIVE },
        relations: ['items'],
      })
    }

    if (!cart) {
      cart = await this.createCart(userId, sessionId)
    }

    return cart
  }

  async getCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    })

    if (!cart) {
      throw new NotFoundException('购物车不存在')
    }

    return cart
  }

  async addToCart(cartId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(cartId)

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      item => item.productId === dto.productId && item.variantId === dto.variantId
    )

    if (existingItem) {
      // Update quantity
      existingItem.quantity += dto.quantity
      existingItem.customization = dto.customizations || {}
      await this.cartItemRepository.save(existingItem)
    } else {
      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        productName: `Product ${dto.productId}`, // This would normally come from product service
        productSku: `SKU-${dto.productId}`,
        quantity: dto.quantity,
        unitPrice: 100, // This would normally come from product service
        customization: dto.customizations || {},
      })

      await this.cartItemRepository.save(cartItem)
      cart.items.push(cartItem)
    }

    // Update cart totals
    cart.updateTotals()
    await this.cartRepository.save(cart)

    return cart
  }

  async updateCartItem(cartId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(cartId)
    const item = cart.items.find(i => i.id === itemId)

    if (!item) {
      throw new NotFoundException('购物车商品不存在')
    }

    if (dto.quantity !== undefined) {
      item.updateQuantity(dto.quantity)
    }

    if (dto.customizations !== undefined) {
      item.customization = dto.customizations
    }

    await this.cartItemRepository.save(item)

    // Update cart totals
    cart.updateTotals()
    await this.cartRepository.save(cart)

    return cart
  }

  async removeFromCart(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(cartId)
    const itemIndex = cart.items.findIndex(i => i.id === itemId)

    if (itemIndex === -1) {
      throw new NotFoundException('购物车商品不存在')
    }

    // Remove item from database
    await this.cartItemRepository.delete(itemId)
    
    // Remove item from cart
    cart.items.splice(itemIndex, 1)

    // Update cart totals
    cart.updateTotals()
    await this.cartRepository.save(cart)

    return cart
  }

  async clearCart(cartId: string): Promise<Cart> {
    const cart = await this.getCart(cartId)

    // Remove all items
    await this.cartItemRepository.delete({ cartId })
    cart.clear()
    await this.cartRepository.save(cart)

    return cart
  }

  async updateShippingAddress(cartId: string, address: ShippingAddressDto): Promise<Cart> {
    const cart = await this.getCart(cartId)
    cart.setShippingAddress(address)
    return await this.cartRepository.save(cart)
  }

  async convertToOrder(cartId: string, orderId: string): Promise<Cart> {
    const cart = await this.getCart(cartId)
    cart.markAsConverted(orderId)
    return await this.cartRepository.save(cart)
  }

  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.find({
      relations: ['items'],
      order: { updatedAt: 'DESC' },
    })
  }

  async deleteCart(cartId: string): Promise<void> {
    const cart = await this.getCart(cartId)
    await this.cartRepository.remove(cart)
  }

  // Transform cart to response DTO
  transformToResponse(cart: Cart): CartResponseDto {
    return {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      status: cart.status,
      items: cart.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        customizations: item.customizations,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) || [],
      subtotal: cart.subtotal,
      taxAmount: cart.taxAmount,
      shippingAmount: cart.shippingAmount,
      discountAmount: cart.discountAmount,
      total: cart.total,
      itemCount: cart.itemCount,
      uniqueItemCount: cart.uniqueItemCount,
      isEmpty: cart.isEmpty,
      isGuest: cart.isGuest,
      isRegistered: cart.isRegistered,
      shippingAddress: cart.shippingAddress,
      expiresAt: cart.expiresAt,
      convertedAt: cart.convertedAt,
      convertedOrderId: cart.convertedOrderId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }
  }
}
