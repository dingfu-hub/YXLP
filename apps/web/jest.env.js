// Environment variables for testing
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.ADMIN_DEFAULT_PASSWORD = 'test-admin-password'

// Mock external API endpoints
process.env.MOCK_EXTERNAL_APIS = 'true'

// Database configuration for testing
process.env.DATABASE_URL = 'sqlite::memory:'
process.env.TEST_DATABASE = 'true'

// Disable external services in tests
process.env.DISABLE_SCHEDULER = 'true'
process.env.DISABLE_EXTERNAL_CRAWLING = 'true'
process.env.DISABLE_AI_PROCESSING = 'true'

// Test-specific configurations
process.env.TEST_TIMEOUT = '10000'
process.env.LOG_LEVEL = 'error' // Reduce log noise in tests
