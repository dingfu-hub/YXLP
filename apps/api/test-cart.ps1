# Test Cart API

Write-Host "🛒 测试购物车 API" -ForegroundColor Green

# 1. 创建或获取购物车
Write-Host "`n1. 创建购物车..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3001/cart/find-or-create?sessionId=test-session" -Method GET
$cart = $response.data
Write-Host "购物车ID: $($cart.id)" -ForegroundColor Cyan

# 2. 添加商品到购物车
Write-Host "`n2. 添加商品到购物车..." -ForegroundColor Yellow
$addItemBody = @{
    productId = "550e8400-e29b-41d4-a716-446655440000"
    quantity = 2
    customizations = @{
        color = "red"
        size = "M"
    }
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/cart/$($cart.id)/items" -Method POST -Body $addItemBody -ContentType "application/json"
$cartWithItem = $response.data
Write-Host "商品已添加，购物车商品数量: $($cartWithItem.itemCount)" -ForegroundColor Cyan

# 3. 获取购物车详情
Write-Host "`n3. 获取购物车详情..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3001/cart/$($cart.id)" -Method GET
$cartDetails = $response.data
Write-Host "购物车总价: $($cartDetails.total)" -ForegroundColor Cyan
Write-Host "商品列表:" -ForegroundColor Cyan
foreach ($item in $cartDetails.items) {
    Write-Host "  - $($item.productName) x $($item.quantity) = $($item.totalPrice)" -ForegroundColor White
}

# 4. 更新商品数量
Write-Host "`n4. 更新商品数量..." -ForegroundColor Yellow
$updateItemBody = @{
    quantity = 5
} | ConvertTo-Json

$firstItemId = $cartDetails.items[0].id
$response = Invoke-RestMethod -Uri "http://localhost:3001/cart/$($cart.id)/items/$firstItemId" -Method PUT -Body $updateItemBody -ContentType "application/json"
$updatedCart = $response.data
Write-Host "商品数量已更新，新的商品数量: $($updatedCart.itemCount)" -ForegroundColor Cyan

# 5. 获取所有购物车
Write-Host "`n5. 获取所有购物车..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3001/cart" -Method GET
$allCarts = $response.data
Write-Host "总购物车数量: $($allCarts.Count)" -ForegroundColor Cyan

Write-Host "`nCart API test completed!" -ForegroundColor Green
