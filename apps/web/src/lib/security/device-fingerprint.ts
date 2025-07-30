// 设备指纹识别系统

import crypto from 'crypto'
import { DeviceFingerprint } from '@/types/security'

// 设备指纹存储（生产环境应使用数据库）
const deviceFingerprints = new Map<string, DeviceFingerprint>()

// 客户端设备指纹收集器
export class DeviceFingerprintCollector {
  private components: Record<string, any> = {}

  // 收集设备指纹
  async collect(): Promise<string> {
    if (typeof window === 'undefined') {
      return 'server-side'
    }

    try {
      // 收集各种设备特征
      await this.collectBasicInfo()
      await this.collectScreenInfo()
      await this.collectTimezoneInfo()
      await this.collectLanguageInfo()
      await this.collectPluginInfo()
      await this.collectFontInfo()
      await this.collectCanvasFingerprint()
      await this.collectWebGLFingerprint()
      await this.collectAudioFingerprint()

      // 生成指纹哈希
      return this.generateFingerprint()
    } catch (error) {
      console.error('Device fingerprint collection failed:', error)
      return 'collection-failed'
    }
  }

  // 收集基本信息
  private async collectBasicInfo() {
    this.components.userAgent = navigator.userAgent
    this.components.platform = navigator.platform
    this.components.language = navigator.language
    this.components.languages = navigator.languages?.join(',') || ''
    this.components.cookieEnabled = navigator.cookieEnabled
    this.components.doNotTrack = navigator.doNotTrack
    this.components.hardwareConcurrency = navigator.hardwareConcurrency
    this.components.maxTouchPoints = navigator.maxTouchPoints
  }

  // 收集屏幕信息
  private async collectScreenInfo() {
    this.components.screen = {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    }

    this.components.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  // 收集时区信息
  private async collectTimezoneInfo() {
    this.components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    this.components.timezoneOffset = new Date().getTimezoneOffset()
  }

  // 收集语言信息
  private async collectLanguageInfo() {
    this.components.language = navigator.language
    this.components.languages = navigator.languages
  }

  // 收集插件信息
  private async collectPluginInfo() {
    const plugins: string[] = []
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i]
      plugins.push(`${plugin.name}:${plugin.version}`)
    }
    this.components.plugins = plugins.sort()
  }

  // 收集字体信息
  private async collectFontInfo() {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'SimSun', 'Microsoft YaHei'
    ]

    const availableFonts: string[] = []
    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    const baseFonts = ['monospace', 'sans-serif', 'serif']

    // 创建测试元素
    const span = document.createElement('span')
    span.style.fontSize = testSize
    span.style.position = 'absolute'
    span.style.left = '-9999px'
    span.style.top = '-9999px'
    span.style.visibility = 'hidden'
    span.innerHTML = testString
    document.body.appendChild(span)

    // 获取基础字体的尺寸
    const baseSizes: Record<string, { width: number; height: number }> = {}
    for (const baseFont of baseFonts) {
      span.style.fontFamily = baseFont
      baseSizes[baseFont] = {
        width: span.offsetWidth,
        height: span.offsetHeight
      }
    }

    // 测试每个字体
    for (const font of testFonts) {
      let detected = false
      for (const baseFont of baseFonts) {
        span.style.fontFamily = `${font}, ${baseFont}`
        const size = {
          width: span.offsetWidth,
          height: span.offsetHeight
        }
        
        if (size.width !== baseSizes[baseFont].width || size.height !== baseSizes[baseFont].height) {
          detected = true
          break
        }
      }
      
      if (detected) {
        availableFonts.push(font)
      }
    }

    document.body.removeChild(span)
    this.components.fonts = availableFonts.sort()
  }

  // 收集Canvas指纹
  private async collectCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        this.components.canvas = 'unsupported'
        return
      }

      canvas.width = 200
      canvas.height = 50

      // 绘制文本
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Device fingerprint 🔒', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Device fingerprint 🔒', 4, 17)

      // 绘制几何图形
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = 'rgb(255,0,255)'
      ctx.beginPath()
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgb(0,255,255)'
      ctx.beginPath()
      ctx.arc(100, 50, 50, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgb(255,255,0)'
      ctx.beginPath()
      ctx.arc(75, 100, 50, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.fill()

      this.components.canvas = canvas.toDataURL()
    } catch (error) {
      this.components.canvas = 'error'
    }
  }

  // 收集WebGL指纹
  private async collectWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) {
        this.components.webgl = 'unsupported'
        return
      }

      const webglInfo = {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        extensions: gl.getSupportedExtensions()?.sort() || []
      }

      this.components.webgl = JSON.stringify(webglInfo)
    } catch (error) {
      this.components.webgl = 'error'
    }
  }

  // 收集音频指纹
  private async collectAudioFingerprint() {
    try {
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        this.components.audio = 'unsupported'
        return
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const context = new AudioContext()
      
      const oscillator = context.createOscillator()
      const analyser = context.createAnalyser()
      const gain = context.createGain()
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1)

      gain.gain.value = 0
      oscillator.type = 'triangle'
      oscillator.frequency.value = 10000

      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gain)
      gain.connect(context.destination)

      oscillator.start(0)

      const audioData: number[] = []
      
      scriptProcessor.onaudioprocess = (event) => {
        const buffer = event.inputBuffer.getChannelData(0)
        for (let i = 0; i < buffer.length; i++) {
          audioData.push(buffer[i])
        }
        
        if (audioData.length >= 1000) {
          oscillator.stop()
          context.close()
          
          // 计算音频指纹
          const sum = audioData.reduce((a, b) => a + b, 0)
          this.components.audio = sum.toString()
        }
      }

      // 超时处理
      setTimeout(() => {
        if (audioData.length === 0) {
          this.components.audio = 'timeout'
          oscillator.stop()
          context.close()
        }
      }, 1000)

    } catch (error) {
      this.components.audio = 'error'
    }
  }

  // 生成设备指纹
  private generateFingerprint(): string {
    const fingerprintData = JSON.stringify(this.components, Object.keys(this.components).sort())
    return crypto.createHash('sha256').update(fingerprintData).digest('hex')
  }

  // 获取收集的组件
  getComponents(): Record<string, any> {
    return { ...this.components }
  }
}

// 服务端设备指纹管理器
export class DeviceFingerprintManager {
  // 记录设备指纹
  recordFingerprint(
    fingerprint: string,
    userId?: string,
    components?: Record<string, any>
  ): DeviceFingerprint {
    const existing = deviceFingerprints.get(fingerprint)
    const now = new Date()

    if (existing) {
      // 更新现有指纹
      existing.lastSeen = now
      existing.seenCount++
      if (userId && !existing.userId) {
        existing.userId = userId
      }
      return existing
    } else {
      // 创建新指纹
      const newFingerprint: DeviceFingerprint = {
        id: `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        fingerprint,
        components: components || {},
        riskScore: this.calculateRiskScore(components || {}),
        firstSeen: now,
        lastSeen: now,
        seenCount: 1,
        trusted: false,
        blocked: false
      }

      deviceFingerprints.set(fingerprint, newFingerprint)
      return newFingerprint
    }
  }

  // 获取设备指纹
  getFingerprint(fingerprint: string): DeviceFingerprint | undefined {
    return deviceFingerprints.get(fingerprint)
  }

  // 获取用户的所有设备指纹
  getUserFingerprints(userId: string): DeviceFingerprint[] {
    return Array.from(deviceFingerprints.values()).filter(fp => fp.userId === userId)
  }

  // 标记设备为可信
  trustDevice(fingerprint: string): boolean {
    const device = deviceFingerprints.get(fingerprint)
    if (device) {
      device.trusted = true
      return true
    }
    return false
  }

  // 阻止设备
  blockDevice(fingerprint: string): boolean {
    const device = deviceFingerprints.get(fingerprint)
    if (device) {
      device.blocked = true
      return true
    }
    return false
  }

  // 计算风险分数
  private calculateRiskScore(components: Record<string, any>): number {
    let score = 0

    // 检查是否是常见的自动化工具
    const userAgent = components.userAgent || ''
    if (userAgent.includes('HeadlessChrome') || 
        userAgent.includes('PhantomJS') || 
        userAgent.includes('Selenium')) {
      score += 0.8
    }

    // 检查屏幕分辨率是否异常
    const screen = components.screen || {}
    if (screen.width === 0 || screen.height === 0) {
      score += 0.5
    }

    // 检查插件数量
    const plugins = components.plugins || []
    if (plugins.length === 0) {
      score += 0.3
    }

    // 检查字体数量
    const fonts = components.fonts || []
    if (fonts.length < 5) {
      score += 0.2
    }

    // 检查Canvas支持
    if (components.canvas === 'unsupported' || components.canvas === 'error') {
      score += 0.3
    }

    return Math.min(score, 1.0)
  }

  // 获取设备指纹统计
  getStats(): Record<string, any> {
    const allFingerprints = Array.from(deviceFingerprints.values())
    
    return {
      totalDevices: allFingerprints.length,
      trustedDevices: allFingerprints.filter(fp => fp.trusted).length,
      blockedDevices: allFingerprints.filter(fp => fp.blocked).length,
      highRiskDevices: allFingerprints.filter(fp => fp.riskScore > 0.7).length,
      uniqueUsers: new Set(allFingerprints.map(fp => fp.userId).filter(Boolean)).size
    }
  }

  // 清理旧的设备指纹
  cleanup(daysOld: number = 90): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    let cleaned = 0

    for (const [fingerprint, device] of deviceFingerprints.entries()) {
      if (device.lastSeen < cutoffDate && !device.trusted) {
        deviceFingerprints.delete(fingerprint)
        cleaned++
      }
    }

    return cleaned
  }
}

// 创建全局设备指纹管理器实例
export const deviceFingerprintManager = new DeviceFingerprintManager()

// 客户端设备指纹收集函数
export async function collectDeviceFingerprint(): Promise<string> {
  const collector = new DeviceFingerprintCollector()
  return await collector.collect()
}
