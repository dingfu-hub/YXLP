# 测试完整的认证流程

Write-Host "=== YXLP 认证系统测试 ===" -ForegroundColor Green

# 1. 登录获取token
Write-Host "`n1. 用户登录..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:3001/auth/login' -Method POST -ContentType 'application/json' -InFile 'test-login.json'
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "✅ 登录成功！" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. 使用token获取用户信息
Write-Host "`n2. 获取用户信息..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    $userResponse = Invoke-RestMethod -Uri 'http://localhost:3001/auth/me' -Method GET -Headers $headers
    Write-Host "✅ 获取用户信息成功！" -ForegroundColor Green
    Write-Host "用户: $($userResponse.data.profile.firstName) $($userResponse.data.profile.lastName)" -ForegroundColor Cyan
    Write-Host "邮箱: $($userResponse.data.email)" -ForegroundColor Cyan
    Write-Host "角色: $($userResponse.data.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 获取用户信息失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 检查认证状态
Write-Host "`n3. 检查认证状态..." -ForegroundColor Yellow
try {
    $checkResponse = Invoke-RestMethod -Uri 'http://localhost:3001/auth/check' -Method GET -Headers $headers
    Write-Host "✅ 认证状态检查成功！" -ForegroundColor Green
    Write-Host "认证状态: $($checkResponse.data.authenticated)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 认证状态检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green
