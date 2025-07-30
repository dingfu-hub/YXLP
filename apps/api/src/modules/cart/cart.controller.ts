import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { CartService } from './cart.service'
import { AddToCartDto, UpdateCartItemDto, CartResponseDto, ShippingAddressDto, CartQueryDto } from './dto/cart.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCart(@Query() query: CartQueryDto): Promise<CartResponseDto> {
    const cart = await this.cartService.createCart(query.userId, query.sessionId)
    return this.cartService.transformToResponse(cart)
  }

  @Get('find-or-create')
  async findOrCreateCart(@Query() query: CartQueryDto): Promise<CartResponseDto> {
    const cart = await this.cartService.findOrCreateCart(query.userId, query.sessionId)
    return this.cartService.transformToResponse(cart)
  }

  @Get(':cartId')
  async getCart(@Param('cartId') cartId: string): Promise<CartResponseDto> {
    const cart = await this.cartService.getCart(cartId)
    return this.cartService.transformToResponse(cart)
  }

  @Post(':cartId/items')
  async addToCart(
    @Param('cartId') cartId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.addToCart(cartId, dto)
    return this.cartService.transformToResponse(cart)
  }

  @Put(':cartId/items/:itemId')
  async updateCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.updateCartItem(cartId, itemId, dto)
    return this.cartService.transformToResponse(cart)
  }

  @Delete(':cartId/items/:itemId')
  async removeFromCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.removeFromCart(cartId, itemId)
    return this.cartService.transformToResponse(cart)
  }

  @Delete(':cartId/clear')
  async clearCart(@Param('cartId') cartId: string): Promise<CartResponseDto> {
    const cart = await this.cartService.clearCart(cartId)
    return this.cartService.transformToResponse(cart)
  }

  @Put(':cartId/shipping-address')
  async updateShippingAddress(
    @Param('cartId') cartId: string,
    @Body() address: ShippingAddressDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.updateShippingAddress(cartId, address)
    return this.cartService.transformToResponse(cart)
  }

  @Post(':cartId/convert')
  async convertToOrder(
    @Param('cartId') cartId: string,
    @Body('orderId') orderId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.convertToOrder(cartId, orderId)
    return this.cartService.transformToResponse(cart)
  }

  @Get()
  async getAllCarts(): Promise<CartResponseDto[]> {
    const carts = await this.cartService.getAllCarts()
    return carts.map(cart => this.cartService.transformToResponse(cart))
  }

  @Delete(':cartId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@Param('cartId') cartId: string): Promise<void> {
    await this.cartService.deleteCart(cartId)
  }
}
