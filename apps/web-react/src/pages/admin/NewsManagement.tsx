import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { NewsArticle, NewsStatus, NewsCategory, SupportedLanguage } from '../../types';
import { Table, TableColumn } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input, SearchInput } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Progress } from '../../components/ui/Progress';
import apiService from '../../services/api';

const NewsManagement: React.FC = () => {
  const { state, dispatch, addNotification, setLoading, setError } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<NewsStatus | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | ''>('');
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 模拟数据 - 实际应用中会从API获取
  const [newsList] = useState<NewsArticle[]>([
    {
      id: '1',
      title: {
        zh: '服装行业数字化转型的最新趋势',
        en: 'Latest Trends in Digital Transformation of Fashion Industry'
      },
      content: {
        zh: '随着科技的发展，服装行业正在经历前所未有的数字化转型...',
        en: 'With the development of technology, the fashion industry is experiencing unprecedented digital transformation...'
      },
      summary: {
        zh: '探讨服装行业数字化转型的最新趋势和发展方向',
        en: 'Exploring the latest trends and development directions of digital transformation in the fashion industry'
      },
      status: 'published',
      category: 'industry',
      author: '管理员',
      sourceType: 'manual',
      aiProcessed: true,
      aiModel: 'deepseek',
      polishedLanguages: ['zh', 'en'],
      qualityScore: 85,
      tags: ['数字化', '转型', '趋势'],
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: {
        zh: '如何提升内衣制造的质量控制',
        en: 'How to Improve Quality Control in Underwear Manufacturing'
      },
      content: {
        zh: '质量控制是内衣制造过程中的关键环节...',
        en: 'Quality control is a key link in the underwear manufacturing process...'
      },
      summary: {
        zh: '分析内衣制造中质量控制的重要性和实施方法',
        en: 'Analyzing the importance and implementation methods of quality control in underwear manufacturing'
      },
      status: 'draft',
      category: 'manufacturing',
      author: '编辑',
      sourceType: 'rss',
      aiProcessed: false,
      polishedLanguages: ['zh'],
      qualityScore: 78,
      tags: ['质量控制', '制造', '内衣'],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // 获取状态文本
  const getStatusText = (status: NewsStatus): string => {
    const statusMap: Record<NewsStatus, string> = {
      'draft': '草稿',
      'published': '已发布',
      'archived': '已归档'
    };
    return statusMap[status];
  };

  // 获取状态徽章样式
  const getStatusBadgeClass = (status: NewsStatus): string => {
    const classMap: Record<NewsStatus, string> = {
      'draft': 'bg-yellow-100 text-yellow-800',
      'published': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return classMap[status];
  };

  // 获取分类文本
  const getCategoryText = (category: NewsCategory): string => {
    const categoryMap: Record<NewsCategory, string> = {
      'industry': '行业动态',
      'technology': '技术分享',
      'business': '商业资讯',
      'fashion': '时尚趋势',
      'manufacturing': '制造工艺'
    };
    return categoryMap[category];
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 切换选择
  const toggleSelection = (newsId: string): void => {
    setSelectedNews(prev =>
      prev.includes(newsId)
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = (): void => {
    if (selectedNews.length === newsList.length) {
      setSelectedNews([]);
    } else {
      setSelectedNews(newsList.map(news => news.id));
    }
  };

  // 处理创建新闻
  const handleCreateNews = (): void => {
    setShowCreateModal(true);
  };

  // 处理编辑新闻
  const handleEditNews = (newsId: string): void => {
    addNotification({
      type: 'info',
      title: '功能开发中',
      message: `编辑新闻功能正在开发中: ${newsId}`
    });
  };

  // 处理删除新闻
  const handleDeleteNews = (newsId: string): void => {
    setDeleteNewsId(newsId);
    setShowDeleteDialog(true);
  };

  // 确认删除新闻
  const confirmDeleteNews = async (): Promise<void> => {
    if (!deleteNewsId) return;

    try {
      setLoading('deleteNews', true);
      // await apiService.deleteNews(deleteNewsId);

      addNotification({
        type: 'success',
        title: '删除成功',
        message: '新闻已成功删除'
      });

      setShowDeleteDialog(false);
      setDeleteNewsId(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: '删除失败',
        message: '删除新闻时发生错误，请重试'
      });
    } finally {
      setLoading('deleteNews', false);
    }
  };

  // 处理批量发布
  const handleBatchPublish = async (): Promise<void> => {
    if (selectedNews.length === 0) return;

    try {
      setLoading('batchPublish', true);
      // 批量发布逻辑

      addNotification({
        type: 'success',
        title: '发布成功',
        message: `已成功发布 ${selectedNews.length} 篇新闻`
      });

      setSelectedNews([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: '发布失败',
        message: '批量发布时发生错误，请重试'
      });
    } finally {
      setLoading('batchPublish', false);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async (): Promise<void> => {
    if (selectedNews.length === 0) return;

    try {
      setLoading('batchDelete', true);
      // 批量删除逻辑

      addNotification({
        type: 'success',
        title: '删除成功',
        message: `已成功删除 ${selectedNews.length} 篇新闻`
      });

      setSelectedNews([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: '删除失败',
        message: '批量删除时发生错误，请重试'
      });
    } finally {
      setLoading('batchDelete', false);
    }
  };

  // AI润色处理
  const handleAIPolish = (newsId: string): void => {
    addNotification({
      type: 'info',
      title: 'AI润色',
      message: `正在为新闻 ${newsId} 进行AI润色...`
    });
  };

  // 表格列定义
  const columns: TableColumn<NewsArticle>[] = [
    {
      key: 'selection',
      title: (
        <input
          type="checkbox"
          checked={selectedNews.length === newsList.length && newsList.length > 0}
          onChange={toggleSelectAll}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      ),
      width: 50,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedNews.includes(record.id)}
          onChange={() => toggleSelection(record.id)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      ),
    },
    {
      key: 'title',
      title: '标题',
      dataIndex: 'title',
      sortable: true,
      render: (title: NewsArticle['title'], record) => (
        <div>
          <div className="font-medium text-gray-900 truncate max-w-xs">
            {title.zh}
          </div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {title.en}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status: NewsStatus) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
          {getStatusText(status)}
        </span>
      ),
    },
    {
      key: 'category',
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (category: NewsCategory) => (
        <span className="text-sm text-gray-900">
          {getCategoryText(category)}
        </span>
      ),
    },
    {
      key: 'aiProcessed',
      title: 'AI处理',
      dataIndex: 'aiProcessed',
      width: 100,
      align: 'center',
      render: (aiProcessed: boolean, record) => (
        <div className="flex items-center justify-center">
          {aiProcessed ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ 已处理
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAIPolish(record.id)}
            >
              🤖 润色
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'qualityScore',
      title: '质量评分',
      dataIndex: 'qualityScore',
      width: 120,
      align: 'center',
      render: (score?: number) => (
        score ? (
          <div className="flex items-center justify-center">
            <Progress
              value={score}
              size="sm"
              variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
              className="w-16"
            />
            <span className="ml-2 text-sm text-gray-600">{score}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'author',
      title: '作者',
      dataIndex: 'author',
      width: 100,
    },
    {
      key: 'createdAt',
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      sortable: true,
      render: (date: string) => (
        <span className="text-sm text-gray-500">
          {formatDate(date)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditNews(record.id)}
          >
            ✏️ 编辑
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteNews(record.id)}
          >
            🗑️ 删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题和操作 */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              📰 新闻管理
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              管理服装行业新闻内容，支持AI润色和多语言翻译
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              onClick={handleCreateNews}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              }
            >
              创建新闻
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SearchInput
                label="搜索"
                placeholder="搜索标题或内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(value) => console.log('搜索:', value)}
                onClear={() => setSearchQuery('')}
              />

              <Select
                label="状态"
                placeholder="全部状态"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as NewsStatus | '')}
                options={[
                  { value: '', label: '全部状态' },
                  { value: 'draft', label: '草稿' },
                  { value: 'published', label: '已发布' },
                  { value: 'archived', label: '已归档' },
                ]}
              />

              <Select
                label="分类"
                placeholder="全部分类"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as NewsCategory | '')}
                options={[
                  { value: '', label: '全部分类' },
                  { value: 'industry', label: '行业动态' },
                  { value: 'technology', label: '技术分享' },
                  { value: 'business', label: '商业资讯' },
                  { value: 'fashion', label: '时尚趋势' },
                  { value: 'manufacturing', label: '制造工艺' },
                ]}
              />

              <div className="flex items-end">
                <Button
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  fullWidth
                >
                  搜索
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedNews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-blue-700">
                  已选择 {selectedNews.length} 篇新闻
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="success"
                  loading={state.loading.batchPublish}
                  onClick={handleBatchPublish}
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                >
                  批量发布
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  loading={state.loading.batchDelete}
                  onClick={handleBatchDelete}
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  批量删除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 新闻列表表格 */}
        <div className="bg-white shadow rounded-lg">
          <Table
            columns={columns}
            data={newsList}
            loading={state.loading.fetchNews}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: newsList.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条新闻`,
            }}
            size="middle"
            hoverable
            striped
            emptyText={
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无新闻</h3>
                <p className="mt-1 text-sm text-gray-500">开始创建您的第一篇新闻</p>
                <div className="mt-6">
                  <Button
                    onClick={handleCreateNews}
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    }
                  >
                    创建新闻
                  </Button>
                </div>
              </div>
            }
          />
        </div>

        {/* 创建新闻模态框 */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="创建新闻"
          size="lg"
        >
          <div className="p-6">
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">创建新闻功能</h3>
              <p className="mt-1 text-sm text-gray-500">
                新闻创建功能正在开发中，敬请期待...
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(false)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* 删除确认对话框 */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeleteNewsId(null);
          }}
          onConfirm={confirmDeleteNews}
          title="确认删除"
          message="确定要删除这篇新闻吗？此操作不可恢复。"
          confirmText="删除"
          cancelText="取消"
          type="error"
          loading={state.loading.deleteNews}
        />
      </div>
    </div>
  );
};

export default NewsManagement;
