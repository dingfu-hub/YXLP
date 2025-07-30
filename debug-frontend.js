/**
 * 前端调试脚本 - 在浏览器控制台中运行
 * 用于测试导航栏二级菜单的点击功能
 */

console.log('🧪 开始前端导航栏调试...');

// 1. 检查页面基本信息
function checkPageInfo() {
    console.log('📄 页面信息:');
    console.log('  URL:', window.location.href);
    console.log('  标题:', document.title);
    console.log('  用户代理:', navigator.userAgent);
}

// 2. 检查React/Next.js错误
function checkReactErrors() {
    console.log('⚛️  检查React错误:');
    
    // 检查控制台错误
    const originalError = console.error;
    let errorCount = 0;
    
    console.error = function(...args) {
        errorCount++;
        console.log(`❌ 控制台错误 #${errorCount}:`, ...args);
        originalError.apply(console, args);
    };
    
    // 检查未捕获的异常
    window.addEventListener('error', (event) => {
        console.log('❌ 未捕获的JavaScript错误:', event.error);
    });
    
    // 检查Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
        console.log('❌ 未处理的Promise拒绝:', event.reason);
    });
}

// 3. 查找导航栏元素
function findNavigationElements() {
    console.log('🔍 查找导航栏元素:');
    
    // 查找侧边栏
    const sidebar = document.querySelector('[class*="sidebar"], [class*="nav"], aside');
    console.log('  侧边栏元素:', sidebar);
    
    // 查找新闻管理菜单
    const newsMenus = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('新闻管理')
    );
    console.log('  新闻管理菜单元素:', newsMenus);
    
    // 查找所有按钮
    const buttons = document.querySelectorAll('button');
    console.log(`  页面中共有 ${buttons.length} 个按钮`);
    
    // 查找包含"新闻"的按钮
    const newsButtons = Array.from(buttons).filter(btn => 
        btn.textContent && btn.textContent.includes('新闻')
    );
    console.log('  包含"新闻"的按钮:', newsButtons);
    
    return { sidebar, newsMenus, buttons, newsButtons };
}

// 4. 测试菜单点击功能
function testMenuClicks() {
    console.log('🖱️  测试菜单点击功能:');
    
    const elements = findNavigationElements();
    
    if (elements.newsButtons.length > 0) {
        const newsButton = elements.newsButtons[0];
        console.log('  找到新闻管理按钮:', newsButton);
        
        // 添加点击事件监听器
        newsButton.addEventListener('click', (event) => {
            console.log('✅ 新闻管理按钮被点击了!', event);
            console.log('  事件目标:', event.target);
            console.log('  事件类型:', event.type);
            console.log('  是否阻止默认行为:', event.defaultPrevented);
        });
        
        // 模拟点击
        console.log('  模拟点击新闻管理按钮...');
        newsButton.click();
        
        // 等待一段时间后检查二级菜单
        setTimeout(() => {
            console.log('  检查二级菜单是否出现...');
            
            const subMenus = document.querySelectorAll('a[href*="/admin/news/"]');
            console.log(`  发现 ${subMenus.length} 个二级菜单项:`, subMenus);
            
            if (subMenus.length > 0) {
                console.log('✅ 二级菜单已展开');
                
                // 测试点击第一个二级菜单项
                const firstSubMenu = subMenus[0];
                console.log('  测试点击第一个二级菜单项:', firstSubMenu);
                
                firstSubMenu.addEventListener('click', (event) => {
                    console.log('✅ 二级菜单项被点击了!', event);
                    console.log('  链接地址:', firstSubMenu.href);
                });
                
                firstSubMenu.click();
                
            } else {
                console.log('❌ 二级菜单未展开');
            }
        }, 1000);
        
    } else {
        console.log('❌ 未找到新闻管理按钮');
    }
}

// 5. 检查CSS样式问题
function checkStyles() {
    console.log('🎨 检查CSS样式:');
    
    const elements = findNavigationElements();
    
    if (elements.newsButtons.length > 0) {
        const newsButton = elements.newsButtons[0];
        const computedStyle = window.getComputedStyle(newsButton);
        
        console.log('  新闻管理按钮样式:');
        console.log('    display:', computedStyle.display);
        console.log('    visibility:', computedStyle.visibility);
        console.log('    opacity:', computedStyle.opacity);
        console.log('    pointer-events:', computedStyle.pointerEvents);
        console.log('    z-index:', computedStyle.zIndex);
        console.log('    position:', computedStyle.position);
    }
}

// 6. 检查事件监听器
function checkEventListeners() {
    console.log('👂 检查事件监听器:');
    
    const elements = findNavigationElements();
    
    if (elements.newsButtons.length > 0) {
        const newsButton = elements.newsButtons[0];
        
        // 检查是否有点击事件监听器
        const listeners = getEventListeners ? getEventListeners(newsButton) : null;
        console.log('  事件监听器:', listeners);
        
        // 检查onclick属性
        console.log('  onclick属性:', newsButton.onclick);
        
        // 检查React事件处理器（通过检查React fiber）
        const reactFiber = newsButton._reactInternalFiber || newsButton.__reactInternalInstance;
        if (reactFiber) {
            console.log('  React Fiber:', reactFiber);
            console.log('  React Props:', reactFiber.memoizedProps);
        }
    }
}

// 7. 主测试函数
function runFullTest() {
    console.log('🚀 开始完整的前端调试测试...\n');
    
    checkPageInfo();
    console.log('\n');
    
    checkReactErrors();
    console.log('\n');
    
    const elements = findNavigationElements();
    console.log('\n');
    
    checkStyles();
    console.log('\n');
    
    checkEventListeners();
    console.log('\n');
    
    testMenuClicks();
    
    console.log('\n✅ 前端调试测试完成');
    console.log('请查看上面的输出结果，特别注意任何错误信息');
}

// 导出函数供控制台使用
window.debugNavigation = {
    runFullTest,
    checkPageInfo,
    checkReactErrors,
    findNavigationElements,
    testMenuClicks,
    checkStyles,
    checkEventListeners
};

console.log('📋 调试函数已准备就绪！');
console.log('在浏览器控制台中运行以下命令:');
console.log('  debugNavigation.runFullTest() - 运行完整测试');
console.log('  debugNavigation.testMenuClicks() - 仅测试菜单点击');
console.log('  debugNavigation.findNavigationElements() - 查找导航元素');

// 自动运行基本检查
setTimeout(() => {
    console.log('\n🔄 自动运行基本检查...');
    checkPageInfo();
    findNavigationElements();
}, 1000);
