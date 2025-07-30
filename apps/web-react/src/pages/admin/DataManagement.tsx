import React, { useState, useEffect } from 'react';
import DataService from '../../services/dataService';

interface DataStats {
  products: {
    total: number;
    inStock: number;
    outOfStock: number;
    featured: number;
    new: number;
  };
  categories: {
    total: number;
    featured: number;
  };
  customers: {
    total: number;
    active: number;
    verified: number;
    distributors: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    totalRevenue: number;
  };
}

const DataManagement: React.FC = () => {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [config, setConfig] = useState({
    products: 5000,
    customers: 1000,
    orders: 2000,
  });

  const dataService = DataService.getInstance();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statistics = await dataService.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      await dataService.regenerateData(config);
      await loadStats();
      alert('Test data regenerated successfully!');
    } catch (error) {
      console.error('Failed to regenerate data:', error);
      alert('Failed to regenerate data. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleExportData = () => {
    const data = dataService.getAllData();
    if (!data) {
      alert('No data available to export');
      return;
    }

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yxlp-test-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
      dataService.clearData();
      setStats(null);
      alert('All test data has been cleared.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Data Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Data
          </button>
          <button
            onClick={handleClearData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{stats.products.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Stock:</span>
                <span className="font-semibold text-green-600">{stats.products.inStock.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Out of Stock:</span>
                <span className="font-semibold text-red-600">{stats.products.outOfStock.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Featured:</span>
                <span className="font-semibold text-blue-600">{stats.products.featured.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New:</span>
                <span className="font-semibold text-purple-600">{stats.products.new.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Categories Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{stats.categories.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Featured:</span>
                <span className="font-semibold text-blue-600">{stats.categories.featured.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customers Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{stats.customers.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{stats.customers.active.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verified:</span>
                <span className="font-semibold text-blue-600">{stats.customers.verified.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distributors:</span>
                <span className="font-semibold text-purple-600">{stats.customers.distributors.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Orders Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{stats.orders.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-600">{stats.orders.pending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing:</span>
                <span className="font-semibold text-blue-600">{stats.orders.processing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipped:</span>
                <span className="font-semibold text-purple-600">{stats.orders.shipped.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivered:</span>
                <span className="font-semibold text-green-600">{stats.orders.delivered.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-semibold text-green-600">${stats.orders.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Generation Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Test Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Products
            </label>
            <input
              type="number"
              value={config.products}
              onChange={(e) => setConfig(prev => ({ ...prev, products: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="10000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Customers
            </label>
            <input
              type="number"
              value={config.customers}
              onChange={(e) => setConfig(prev => ({ ...prev, customers: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="5000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Orders
            </label>
            <input
              type="number"
              value={config.orders}
              onChange={(e) => setConfig(prev => ({ ...prev, orders: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="10000"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Generating large amounts of test data may take some time and will replace all existing data. 
                Make sure to export your current data if you want to keep it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            This will generate approximately {(config.products + config.customers + config.orders).toLocaleString()} records
          </div>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              regenerating
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {regenerating ? 'Generating...' : 'Generate Test Data'}
          </button>
        </div>

        {regenerating && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 text-sm">
                Generating test data... This may take a few moments.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Data Usage Information */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use Test Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Frontend Development</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Products are available on /products page</li>
              <li>• Categories can be browsed on /categories page</li>
              <li>• All data includes realistic images via placeholder API</li>
              <li>• Search and filtering functionality is fully implemented</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Structure</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Products include colors, sizes, materials, and ratings</li>
              <li>• Customers have realistic addresses and preferences</li>
              <li>• Orders contain multiple items with proper calculations</li>
              <li>• All data follows TypeScript interfaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
