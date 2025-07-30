'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

interface SearchSuggestion {
  query: string
  type: 'suggestion' | 'recent' | 'trending'
  count?: number
  trend?: string
}

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  showSuggestions?: boolean
  autoFocus?: boolean
}

export default function SearchBar({
  placeholder = 'Search products, brands, categories...',
  onSearch,
  className = '',
  showSuggestions = true,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Load trending searches
    fetchTrendingSearches()
  }, [])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        // 使用setTimeout确保在组件卸载后不会更新状态
        setTimeout(() => {
          setIsOpen(false)
        }, 0)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search/trending?limit=5')
      const data = await response.json()
      if (data.success) {
        setTrendingSearches(
          data.data.map((item: any) => ({
            query: item.query,
            type: 'trending' as const,
            trend: item.trend,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching trending searches:', error)
    }
  }

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/search/autocomplete?query=${encodeURIComponent(searchQuery)}&limit=8`)
      const suggestions = await response.json()
      
      if (Array.isArray(suggestions)) {
        setSuggestions(
          suggestions.map(suggestion => ({
            query: suggestion,
            type: 'suggestion' as const,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    // Debounce suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (showSuggestions) {
        fetchSuggestions(value)
      }
    }, 300)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (query.length >= 2) {
      fetchSuggestions(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [
      ...suggestions,
      ...recentSearches.slice(0, 3).map(q => ({ query: q, type: 'recent' as const })),
      ...trendingSearches,
    ]

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSearch(allSuggestions[selectedIndex].query)
        } else if (query.trim()) {
          handleSearch(query)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(q => q !== searchQuery),
    ].slice(0, 10)
    
    setRecentSearches(updatedRecent)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

    // Close dropdown
    setIsOpen(false)
    setSelectedIndex(-1)

    // Execute search
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }

    // Log analytics
    logSearchAnalytics(searchQuery)
  }

  const logSearchAnalytics = async (searchQuery: string) => {
    try {
      await fetch('/api/search/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          source: 'search_bar',
        }),
      })
    } catch (error) {
      console.error('Error logging search analytics:', error)
    }
  }

  const clearQuery = () => {
    setQuery('')
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const allSuggestions = [
    ...suggestions,
    ...(query.length < 2 ? recentSearches.slice(0, 3).map(q => ({ query: q, type: 'recent' as const })) : []),
    ...(query.length < 2 ? trendingSearches : []),
  ]

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearQuery}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Searching...
              </div>
            </div>
          )}

          {!isLoading && allSuggestions.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-center text-gray-500">
              No suggestions found
            </div>
          )}

          {!isLoading && allSuggestions.length === 0 && query.length < 2 && (
            <div className="px-4 py-3 text-center text-gray-500">
              Start typing to see suggestions
            </div>
          )}

          {!isLoading && allSuggestions.length > 0 && (
            <div>
              {/* Recent Searches */}
              {query.length < 2 && recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={`recent-${index}`}
                      onClick={() => handleSearch(search)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center ${
                        selectedIndex === suggestions.length + index ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Clock className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {query.length < 2 && trendingSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </div>
                  {trendingSearches.map((search, index) => (
                    <button
                      key={`trending-${index}`}
                      onClick={() => handleSearch(search.query)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        selectedIndex === suggestions.length + recentSearches.slice(0, 3).length + index ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-3" />
                        <span className="text-gray-700">{search.query}</span>
                      </div>
                      {search.trend && (
                        <span className="text-xs text-green-600 font-medium">{search.trend}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  {(recentSearches.length > 0 || trendingSearches.length > 0) && query.length < 2 && (
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Suggestions
                    </div>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSearch(suggestion.query)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center ${
                        selectedIndex === index ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{suggestion.query}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
