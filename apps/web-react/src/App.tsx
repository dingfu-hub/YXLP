import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import DistributorsPage from './pages/DistributorsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import NewsManagement from './pages/admin/NewsManagement';
import DataManagement from './pages/admin/DataManagement';
import { ToastContainer, useToast } from './components/ui/Toast';
import './App.css';

// 应用主组件
function AppContent() {
  const { notifications, removeNotification } = useToast();

  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            {/* 前台路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/distributors" element={<DistributorsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 后台路由 */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="news" element={<NewsManagement />} />
              <Route path="data" element={<DataManagement />} />
              <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">用户管理</h1><p className="text-gray-600 mt-2">用户管理功能开发中...</p></div>} />
              <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">数据分析</h1><p className="text-gray-600 mt-2">数据分析功能开发中...</p></div>} />
              <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">系统设置</h1><p className="text-gray-600 mt-2">系统设置功能开发中...</p></div>} />
            </Route>

            {/* 404 页面 */}
            <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900">404</h1><p className="text-gray-600 mt-2">页面未找到</p></div></div>} />
          </Routes>
        </div>
      </Router>

      {/* 全局通知 */}
      <ToastContainer
        notifications={notifications}
        onRemove={removeNotification}
        position="top-right"
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
