# Simple Cart Test

Write-Host "Testing Cart API..." -ForegroundColor Green

# Get cart
$response = Invoke-RestMethod -Uri "http://localhost:3001/cart/find-or-create?sessionId=simple-test" -Method GET
$cart = $response.data
Write-Host "Cart ID: $($cart.id)"

# Add item with simple data
$body = @{
    productId = "550e8400-e29b-41d4-a716-446655440000"
    quantity = 2
} | ConvertTo-Json

Write-Host "Adding item to cart..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/cart/$($cart.id)/items" -Method POST -Body $body -ContentType "application/json"
    $updatedCart = $response.data
    Write-Host "Success! Item count: $($updatedCart.itemCount)"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
