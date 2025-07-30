import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  User,
  NewsArticle,
  Comment,
  RSSSource,
  AIPolishTask,
  CrawlTask,
  ScheduleRule,
  Statistics,
  SystemSettings,
  Notification,
  LoadingState,
  ErrorState,
  SupportedLanguage
} from '../types';

// 应用状态接口
interface AppState {
  // 用户相关
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // 新闻相关
  news: NewsArticle[];
  currentNews: NewsArticle | null;
  
  // 评论相关
  comments: Comment[];
  
  // RSS源相关
  rssSources: RSSSource[];
  
  // AI任务相关
  aiTasks: AIPolishTask[];
  crawlTasks: CrawlTask[];
  scheduleRules: ScheduleRule[];
  
  // 统计数据
  statistics: Statistics | null;
  
  // 系统设置
  settings: SystemSettings | null;
  
  // UI状态
  currentLanguage: SupportedLanguage;
  notifications: Notification[];
  loading: LoadingState;
  errors: ErrorState;
  
  // 侧边栏状态
  sidebarOpen: boolean;
}

// 动作类型
type AppAction =
  // 用户动作
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  
  // 新闻动作
  | { type: 'SET_NEWS'; payload: NewsArticle[] }
  | { type: 'ADD_NEWS'; payload: NewsArticle }
  | { type: 'UPDATE_NEWS'; payload: NewsArticle }
  | { type: 'DELETE_NEWS'; payload: string }
  | { type: 'SET_CURRENT_NEWS'; payload: NewsArticle | null }
  
  // 评论动作
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: string }
  
  // RSS源动作
  | { type: 'SET_RSS_SOURCES'; payload: RSSSource[] }
  | { type: 'ADD_RSS_SOURCE'; payload: RSSSource }
  | { type: 'UPDATE_RSS_SOURCE'; payload: RSSSource }
  | { type: 'DELETE_RSS_SOURCE'; payload: string }
  
  // AI任务动作
  | { type: 'SET_AI_TASKS'; payload: AIPolishTask[] }
  | { type: 'ADD_AI_TASK'; payload: AIPolishTask }
  | { type: 'UPDATE_AI_TASK'; payload: AIPolishTask }
  | { type: 'DELETE_AI_TASK'; payload: string }
  
  // 采集任务动作
  | { type: 'SET_CRAWL_TASKS'; payload: CrawlTask[] }
  | { type: 'ADD_CRAWL_TASK'; payload: CrawlTask }
  | { type: 'UPDATE_CRAWL_TASK'; payload: CrawlTask }
  | { type: 'DELETE_CRAWL_TASK'; payload: string }
  
  // 定时规则动作
  | { type: 'SET_SCHEDULE_RULES'; payload: ScheduleRule[] }
  | { type: 'ADD_SCHEDULE_RULE'; payload: ScheduleRule }
  | { type: 'UPDATE_SCHEDULE_RULE'; payload: ScheduleRule }
  | { type: 'DELETE_SCHEDULE_RULE'; payload: string }
  
  // 统计数据动作
  | { type: 'SET_STATISTICS'; payload: Statistics }
  
  // 系统设置动作
  | { type: 'SET_SETTINGS'; payload: SystemSettings }
  
  // UI动作
  | { type: 'SET_LANGUAGE'; payload: SupportedLanguage }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_LOADING'; payload: { key: string; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: string; value: string | null } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean };

// 初始状态
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  news: [],
  currentNews: null,
  comments: [],
  rssSources: [],
  aiTasks: [],
  crawlTasks: [],
  scheduleRules: [],
  statistics: null,
  settings: null,
  currentLanguage: 'zh',
  notifications: [],
  loading: {},
  errors: {},
  sidebarOpen: true,
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 用户相关
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    // 新闻相关
    case 'SET_NEWS':
      return { ...state, news: action.payload };
    case 'ADD_NEWS':
      return { ...state, news: [action.payload, ...state.news] };
    case 'UPDATE_NEWS':
      return {
        ...state,
        news: state.news.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
        currentNews: state.currentNews?.id === action.payload.id ? action.payload : state.currentNews
      };
    case 'DELETE_NEWS':
      return {
        ...state,
        news: state.news.filter(item => item.id !== action.payload),
        currentNews: state.currentNews?.id === action.payload ? null : state.currentNews
      };
    case 'SET_CURRENT_NEWS':
      return { ...state, currentNews: action.payload };
    
    // 评论相关
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'ADD_COMMENT':
      return { ...state, comments: [action.payload, ...state.comments] };
    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(item => item.id !== action.payload)
      };
    
    // RSS源相关
    case 'SET_RSS_SOURCES':
      return { ...state, rssSources: action.payload };
    case 'ADD_RSS_SOURCE':
      return { ...state, rssSources: [action.payload, ...state.rssSources] };
    case 'UPDATE_RSS_SOURCE':
      return {
        ...state,
        rssSources: state.rssSources.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_RSS_SOURCE':
      return {
        ...state,
        rssSources: state.rssSources.filter(item => item.id !== action.payload)
      };
    
    // AI任务相关
    case 'SET_AI_TASKS':
      return { ...state, aiTasks: action.payload };
    case 'ADD_AI_TASK':
      return { ...state, aiTasks: [action.payload, ...state.aiTasks] };
    case 'UPDATE_AI_TASK':
      return {
        ...state,
        aiTasks: state.aiTasks.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_AI_TASK':
      return {
        ...state,
        aiTasks: state.aiTasks.filter(item => item.id !== action.payload)
      };
    
    // 采集任务相关
    case 'SET_CRAWL_TASKS':
      return { ...state, crawlTasks: action.payload };
    case 'ADD_CRAWL_TASK':
      return { ...state, crawlTasks: [action.payload, ...state.crawlTasks] };
    case 'UPDATE_CRAWL_TASK':
      return {
        ...state,
        crawlTasks: state.crawlTasks.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_CRAWL_TASK':
      return {
        ...state,
        crawlTasks: state.crawlTasks.filter(item => item.id !== action.payload)
      };
    
    // 定时规则相关
    case 'SET_SCHEDULE_RULES':
      return { ...state, scheduleRules: action.payload };
    case 'ADD_SCHEDULE_RULE':
      return { ...state, scheduleRules: [action.payload, ...state.scheduleRules] };
    case 'UPDATE_SCHEDULE_RULE':
      return {
        ...state,
        scheduleRules: state.scheduleRules.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_SCHEDULE_RULE':
      return {
        ...state,
        scheduleRules: state.scheduleRules.filter(item => item.id !== action.payload)
      };
    
    // 统计数据
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    
    // 系统设置
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    // UI相关
    case 'SET_LANGUAGE':
      return { ...state, currentLanguage: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(item => item.id !== action.payload)
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value }
      };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    
    default:
      return state;
  }
}

// Context接口
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // 便捷方法
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, value: boolean) => void;
  setError: (key: string, error: string | null) => void;
  toggleSidebar: () => void;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 便捷方法
  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);
  
  const setAuthenticated = useCallback((authenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: authenticated });
  }, []);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  }, []);
  
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);
  
  const setLoading = useCallback((key: string, value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);
  
  const setError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value: error } });
  }, []);
  
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);
  
  const value: AppContextType = {
    state,
    dispatch,
    setUser,
    setAuthenticated,
    addNotification,
    removeNotification,
    setLoading,
    setError,
    toggleSidebar,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
