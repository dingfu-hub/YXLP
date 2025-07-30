import { Controller, Get, Post, Body, Param, Delete, Put, Res } from '@nestjs/common'
import { Response } from 'express'
import * as path from 'path'

interface CartItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  totalPrice: number
}

interface Cart {
  id: string
  items: CartItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

@Controller('demo/cart')
export class DemoController {
  private carts: Map<string, Cart> = new Map()

  @Get(':cartId')
  getCart(@Param('cartId') cartId: string) {
    const cart = this.carts.get(cartId)
    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      }
    }
    return {
      success: true,
      data: cart,
    }
  }

  @Post(':cartId/items')
  addToCart(
    @Param('cartId') cartId: string,
    @Body() item: { productId: string; productName: string; quantity: number; price: number }
  ) {
    let cart = this.carts.get(cartId)
    
    if (!cart) {
      cart = {
        id: cartId,
        items: [],
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.carts.set(cartId, cart)
    }

    const existingItem = cart.items.find(i => i.productId === item.productId)
    
    if (existingItem) {
      existingItem.quantity += item.quantity
      existingItem.totalPrice = existingItem.quantity * existingItem.price
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price,
      }
      cart.items.push(newItem)
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0)
    cart.updatedAt = new Date()

    return {
      success: true,
      data: cart,
      message: 'Item added to cart successfully',
    }
  }

  @Put(':cartId/items/:itemId')
  updateCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() update: { quantity: number }
  ) {
    const cart = this.carts.get(cartId)
    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      }
    }

    const item = cart.items.find(i => i.id === itemId)
    if (!item) {
      return {
        success: false,
        message: 'Item not found in cart',
      }
    }

    item.quantity = update.quantity
    item.totalPrice = item.quantity * item.price
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0)
    cart.updatedAt = new Date()

    return {
      success: true,
      data: cart,
      message: 'Cart item updated successfully',
    }
  }

  @Delete(':cartId/items/:itemId')
  removeFromCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string
  ) {
    const cart = this.carts.get(cartId)
    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      }
    }

    const itemIndex = cart.items.findIndex(i => i.id === itemId)
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Item not found in cart',
      }
    }

    cart.items.splice(itemIndex, 1)
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0)
    cart.updatedAt = new Date()

    return {
      success: true,
      data: cart,
      message: 'Item removed from cart successfully',
    }
  }

  @Delete(':cartId')
  clearCart(@Param('cartId') cartId: string) {
    const cart = this.carts.get(cartId)
    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      }
    }

    cart.items = []
    cart.totalAmount = 0
    cart.updatedAt = new Date()

    return {
      success: true,
      data: cart,
      message: 'Cart cleared successfully',
    }
  }

  @Get()
  getAllCarts() {
    return {
      success: true,
      data: Array.from(this.carts.values()),
    }
  }
}

@Controller()
export class StaticController {
  @Get()
  getDemo(@Res() res: Response) {
    res.sendFile(path.join(__dirname, '..', 'public', 'cart-demo.html'))
  }
}
