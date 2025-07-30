/**
 * 测试菜单过滤逻辑
 */

// 模拟Permission枚举
const Permission = {
  NEWS_VIEW: 'news:view',
  NEWS_CREATE: 'news:create',
  NEWS_UPDATE: 'news:update',
  NEWS_DELETE: 'news:delete'
};

// 模拟菜单配置
const SIDEBAR_MENU = [
  {
    id: 'news',
    label: '新闻管理',
    icon: 'NewspaperIcon',
    href: '/admin/news',
    permissions: [Permission.NEWS_VIEW],
    children: [
      {
        id: 'news-list',
        label: '新闻列表',
        icon: 'ListBulletIcon',
        href: '/admin/news',
        permissions: [Permission.NEWS_VIEW]
      },
      {
        id: 'news-sources',
        label: 'RSS源管理',
        icon: 'RssIcon',
        href: '/admin/news/sources',
        permissions: [Permission.NEWS_CREATE]
      },
      {
        id: 'news-collect',
        label: '新闻采集',
        icon: 'CloudArrowDownIcon',
        href: '/admin/news/collect',
        permissions: [Permission.NEWS_CREATE]
      }
    ]
  }
];

// 模拟权限检查函数
function hasAnyPermission(userPermissions, requiredPermissions) {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

// 模拟菜单过滤函数
function filterMenuByPermissions(menu, userPermissions) {
  return menu.filter(item => {
    // 如果没有权限要求，则显示
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    // 检查是否有权限
    const hasAccess = hasAnyPermission(userPermissions, item.permissions);
    
    // 如果有子菜单，递归过滤
    if (item.children) {
      item.children = filterMenuByPermissions(item.children, userPermissions);
    }
    
    return hasAccess;
  });
}

// 测试不同权限组合
function testMenuFiltering() {
  console.log('🧪 测试菜单过滤逻辑...\n');
  
  const testCases = [
    {
      name: '超级管理员 - 所有权限',
      permissions: ['news:view', 'news:create', 'news:update', 'news:delete']
    },
    {
      name: '只有查看权限',
      permissions: ['news:view']
    },
    {
      name: '只有创建权限',
      permissions: ['news:create']
    },
    {
      name: '没有任何权限',
      permissions: []
    },
    {
      name: '有创建和更新权限，但没有查看权限',
      permissions: ['news:create', 'news:update']
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   权限: [${testCase.permissions.join(', ')}]`);
    
    const filteredMenu = filterMenuByPermissions(JSON.parse(JSON.stringify(SIDEBAR_MENU)), testCase.permissions);
    
    if (filteredMenu.length === 0) {
      console.log('   结果: ❌ 新闻管理菜单被完全隐藏');
    } else {
      const newsMenu = filteredMenu[0];
      console.log(`   结果: ✅ 新闻管理菜单显示，有 ${newsMenu.children ? newsMenu.children.length : 0} 个子菜单`);
      
      if (newsMenu.children && newsMenu.children.length > 0) {
        newsMenu.children.forEach(child => {
          console.log(`     - ${child.label} (${child.href})`);
        });
      }
    }
    console.log('');
  });
  
  // 分析问题
  console.log('🔍 问题分析:');
  console.log('当前的filterMenuByPermissions函数有一个逻辑问题:');
  console.log('1. 如果父菜单没有权限，整个菜单项(包括子菜单)都会被过滤掉');
  console.log('2. 即使用户有子菜单的权限，也无法访问');
  console.log('3. 这导致了"有创建权限但没有查看权限"的用户看不到新闻管理菜单');
  
  console.log('\n💡 建议的修复方案:');
  console.log('修改过滤逻辑，如果用户有任何子菜单的权限，就显示父菜单');
}

// 修复后的菜单过滤函数
function filterMenuByPermissionsFixed(menu, userPermissions) {
  return menu.filter(item => {
    // 如果没有权限要求，则显示
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    // 检查父菜单权限
    const hasParentAccess = hasAnyPermission(userPermissions, item.permissions);
    
    // 如果有子菜单，递归过滤
    let filteredChildren = [];
    if (item.children) {
      filteredChildren = filterMenuByPermissionsFixed(item.children, userPermissions);
      item.children = filteredChildren;
    }
    
    // 如果有父菜单权限，或者有任何子菜单权限，就显示
    return hasParentAccess || (filteredChildren && filteredChildren.length > 0);
  });
}

// 测试修复后的函数
function testFixedMenuFiltering() {
  console.log('\n🔧 测试修复后的菜单过滤逻辑...\n');
  
  const testCases = [
    {
      name: '有创建和更新权限，但没有查看权限',
      permissions: ['news:create', 'news:update']
    },
    {
      name: '只有创建权限',
      permissions: ['news:create']
    },
    {
      name: '没有任何权限',
      permissions: []
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   权限: [${testCase.permissions.join(', ')}]`);
    
    const filteredMenu = filterMenuByPermissionsFixed(JSON.parse(JSON.stringify(SIDEBAR_MENU)), testCase.permissions);
    
    if (filteredMenu.length === 0) {
      console.log('   结果: ❌ 新闻管理菜单被完全隐藏');
    } else {
      const newsMenu = filteredMenu[0];
      console.log(`   结果: ✅ 新闻管理菜单显示，有 ${newsMenu.children ? newsMenu.children.length : 0} 个子菜单`);
      
      if (newsMenu.children && newsMenu.children.length > 0) {
        newsMenu.children.forEach(child => {
          console.log(`     - ${child.label} (${child.href})`);
        });
      }
    }
    console.log('');
  });
}

// 运行测试
testMenuFiltering();
testFixedMenuFiltering();
