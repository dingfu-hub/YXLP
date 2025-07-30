'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RegisterRequest, AuthResponse } from '@/types/auth'
import { UserRole } from '@/types/user'
// 临时导入，实际应该从客户端安全的方式获取
const PasswordStrength = {
  VERY_WEAK: 0,
  WEAK: 1,
  FAIR: 2,
  GOOD: 3,
  STRONG: 4,
  VERY_STRONG: 5
}

// 简化的密码验证函数
const validatePassword = (password: string) => {
  const errors = []
  const suggestions = []
  let score = 0

  if (password.length < 8) {
    errors.push('密码长度至少需要8个字符')
    suggestions.push('增加密码长度')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母')
    suggestions.push('添加大写字母')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母')
    suggestions.push('添加小写字母')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字')
    suggestions.push('添加数字')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符')
    suggestions.push('添加特殊字符')
  } else {
    score += 1
  }

  let strength = PasswordStrength.VERY_WEAK
  if (score >= 5) strength = PasswordStrength.VERY_STRONG
  else if (score >= 4) strength = PasswordStrength.STRONG
  else if (score >= 3) strength = PasswordStrength.GOOD
  else if (score >= 2) strength = PasswordStrength.FAIR
  else if (score >= 1) strength = PasswordStrength.WEAK

  return {
    isValid: errors.length === 0,
    strength,
    score,
    errors,
    suggestions
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.END_USER,
    acceptTerms: false,
    acceptPrivacy: false,
    marketingConsent: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<any>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // 实时验证密码强度
    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordStrength(validation)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = '邮箱是必填项'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    // 用户名验证
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!formData.username) {
      newErrors.username = '用户名是必填项'
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = '用户名必须是3-20个字符，只能包含字母、数字和下划线'
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '密码是必填项'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    // 姓名验证
    if (!formData.firstName) {
      newErrors.firstName = '名字是必填项'
    }
    if (!formData.lastName) {
      newErrors.lastName = '姓氏是必填项'
    }

    // 手机号验证（可选）
    if (formData.phone) {
      const phoneRegex = /^[+]?[\d\s\-()]+$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '手机号格式不正确'
      }
    }

    // 条款同意验证
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = '必须同意服务条款'
    }
    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = '必须同意隐私政策'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.data) {
        // 注册成功，保存令牌
        localStorage.setItem('accessToken', result.data.accessToken)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        // 跳转到验证邮箱页面或仪表板
        router.push('/auth/verify-email')
      } else {
        // 处理服务器错误
        if (result.error === 'EMAIL_EXISTS') {
          setErrors({ email: '该邮箱已被注册' })
        } else if (result.error === 'USERNAME_EXISTS') {
          setErrors({ username: '该用户名已被使用' })
        } else if (result.error === 'PHONE_EXISTS') {
          setErrors({ phone: '该手机号已被注册' })
        } else {
          setErrors({ general: result.message || '注册失败，请稍后重试' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: '网络错误，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = (strength: PasswordStrength): string => {
    const colors = {
      [PasswordStrength.VERY_WEAK]: 'bg-red-500',
      [PasswordStrength.WEAK]: 'bg-orange-500',
      [PasswordStrength.FAIR]: 'bg-yellow-500',
      [PasswordStrength.GOOD]: 'bg-blue-500',
      [PasswordStrength.STRONG]: 'bg-green-500',
      [PasswordStrength.VERY_STRONG]: 'bg-green-600'
    }
    return colors[strength] || 'bg-gray-300'
  }

  const getPasswordStrengthText = (strength: PasswordStrength): string => {
    const texts = {
      [PasswordStrength.VERY_WEAK]: '非常弱',
      [PasswordStrength.WEAK]: '弱',
      [PasswordStrength.FAIR]: '一般',
      [PasswordStrength.GOOD]: '良好',
      [PasswordStrength.STRONG]: '强',
      [PasswordStrength.VERY_STRONG]: '非常强'
    }
    return texts[strength] || ''
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">Y</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          创建您的账户
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          已有账户？{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            立即登录
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  名字 <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="名字"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  姓氏 <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="姓氏"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入邮箱地址"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="3-20个字符，字母数字下划线"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入手机号（可选）"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入密码"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              
              {/* 密码强度指示器 */}
              {passwordStrength && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.strength)}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {getPasswordStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        建议：{passwordStrength.suggestions[0]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请再次输入密码"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  我同意{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    服务条款
                  </Link>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

              <div className="flex items-start">
                <input
                  id="acceptPrivacy"
                  name="acceptPrivacy"
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="acceptPrivacy" className="ml-2 block text-sm text-gray-900">
                  我同意{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    隐私政策
                  </Link>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              {errors.acceptPrivacy && <p className="text-sm text-red-600">{errors.acceptPrivacy}</p>}

              <div className="flex items-start">
                <input
                  id="marketingConsent"
                  name="marketingConsent"
                  type="checkbox"
                  checked={formData.marketingConsent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
                  我同意接收营销邮件和推广信息
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '注册中...' : '创建账户'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
