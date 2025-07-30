/**
 * 语言选择器组件测试
 * 测试目标：验证语言切换功能、用户交互、状态管理
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '../LanguageSelector'
import { SupportedLanguage } from '@/types/news'

// Mock the i18n module
jest.mock('@/lib/i18n', () => ({
  SUPPORTED_LANGUAGES: {
    zh: { chineseName: '中文', englishName: 'Chinese', flag: '🇨🇳' },
    en: { chineseName: '英语', englishName: 'English', flag: '🇺🇸' },
    ja: { chineseName: '日语', englishName: 'Japanese', flag: '🇯🇵' },
    ko: { chineseName: '韩语', englishName: 'Korean', flag: '🇰🇷' },
  },
  formatLanguageName: (lang: string) => {
    const names: Record<string, string> = {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      ko: '한국어'
    }
    return names[lang] || lang
  }
}))

describe('LanguageSelector组件', () => {
  const mockOnLanguageChange = jest.fn()
  
  const defaultProps = {
    selectedLanguage: 'zh' as SupportedLanguage,
    onLanguageChange: mockOnLanguageChange
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该正确渲染语言选择器', () => {
      render(<LanguageSelector {...defaultProps} />)
      
      // Should show the selected language
      expect(screen.getByText('🇨🇳')).toBeInTheDocument()
      expect(screen.getByText('中文')).toBeInTheDocument()
    })

    it('应该显示下拉箭头', () => {
      render(<LanguageSelector {...defaultProps} />)
      
      // Should have a dropdown indicator
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('应该支持不同的尺寸', () => {
      const { rerender } = render(
        <LanguageSelector {...defaultProps} size="sm" />
      )
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('px-2', 'py-1', 'text-sm')
      
      rerender(<LanguageSelector {...defaultProps} size="lg" />)
      button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-3', 'text-base')
    })

    it('应该在禁用状态下正确显示', () => {
      render(<LanguageSelector {...defaultProps} disabled />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })
  })

  describe('用户交互', () => {
    it('应该在点击时打开下拉菜单', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Should show all available languages
      expect(screen.getByText('英语')).toBeInTheDocument()
      expect(screen.getByText('日语')).toBeInTheDocument()
      expect(screen.getByText('韩语')).toBeInTheDocument()
    })

    it('应该在选择语言时调用回调函数', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      // Open dropdown
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Select English
      const englishOption = screen.getByText('英语')
      await user.click(englishOption)
      
      expect(mockOnLanguageChange).toHaveBeenCalledWith('en')
    })

    it('应该在选择后关闭下拉菜单', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      // Open dropdown
      const button = screen.getByRole('button')
      await user.click(button)
      
      // Select a language
      const englishOption = screen.getByText('英语')
      await user.click(englishOption)
      
      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByText('英语')).not.toBeInTheDocument()
      })
    })

    it('应该支持键盘导航', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      const button = screen.getByRole('button')
      
      // Open with Enter key
      await user.type(button, '{enter}')
      expect(screen.getByText('英语')).toBeInTheDocument()
      
      // Navigate with arrow keys and select with Enter
      await user.type(button, '{arrowdown}{enter}')
      expect(mockOnLanguageChange).toHaveBeenCalled()
    })

    it('应该在点击外部时关闭下拉菜单', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <LanguageSelector {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      // Open dropdown
      const button = screen.getByRole('button')
      await user.click(button)
      expect(screen.getByText('英语')).toBeInTheDocument()
      
      // Click outside
      const outsideElement = screen.getByTestId('outside')
      await user.click(outsideElement)
      
      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByText('英语')).not.toBeInTheDocument()
      })
    })
  })

  describe('可访问性', () => {
    it('应该有正确的ARIA属性', () => {
      render(<LanguageSelector {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('应该在打开时更新ARIA状态', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('应该为选项提供正确的角色', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThan(0)
    })
  })

  describe('自定义配置', () => {
    it('应该支持自定义可用语言列表', () => {
      const customLanguages: SupportedLanguage[] = ['zh', 'en']
      render(
        <LanguageSelector 
          {...defaultProps} 
          availableLanguages={customLanguages}
        />
      )
      
      // Should only show specified languages when opened
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByText('英语')).toBeInTheDocument()
      expect(screen.queryByText('日语')).not.toBeInTheDocument()
      expect(screen.queryByText('韩语')).not.toBeInTheDocument()
    })

    it('应该支持显示"全部"选项', () => {
      render(<LanguageSelector {...defaultProps} showAllOption />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByText('全部语言')).toBeInTheDocument()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的选中语言', () => {
      const invalidLanguage = 'invalid' as SupportedLanguage
      
      // Should not crash with invalid language
      expect(() => {
        render(
          <LanguageSelector 
            selectedLanguage={invalidLanguage}
            onLanguageChange={mockOnLanguageChange}
          />
        )
      }).not.toThrow()
    })

    it('应该处理空的可用语言列表', () => {
      render(
        <LanguageSelector 
          {...defaultProps}
          availableLanguages={[]}
        />
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      // Should show empty state or handle gracefully
      expect(button).toBeInTheDocument()
    })
  })

  describe('性能测试', () => {
    it('应该不会在每次渲染时重新创建函数', () => {
      const { rerender } = render(<LanguageSelector {...defaultProps} />)
      
      // Get initial button reference
      const initialButton = screen.getByRole('button')
      
      // Re-render with same props
      rerender(<LanguageSelector {...defaultProps} />)
      
      // Button should be the same reference (React optimization)
      const rerenderedButton = screen.getByRole('button')
      expect(rerenderedButton).toBe(initialButton)
    })

    it('应该快速响应用户交互', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector {...defaultProps} />)
      
      const startTime = performance.now()
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      const endTime = performance.now()
      const interactionTime = endTime - startTime
      
      // Should respond within 100ms
      expect(interactionTime).toBeLessThan(100)
    })
  })
})
