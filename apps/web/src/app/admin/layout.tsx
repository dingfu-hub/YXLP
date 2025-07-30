'use client'

import { AdminProvider } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <AdminProvider key="admin-provider">
        <AdminLayout>
          {children}
        </AdminLayout>
      </AdminProvider>
    </ErrorBoundary>
  )
}
