# 游客模式实施计划

## 目标
退出登录后不跳转登录页，游客可自由浏览所有页面，需要登录操作时再提示。

## 变更清单

### 1. `src/router/index.ts` — 移除登录守卫

```typescript
// 删除 articles 和 article/:id 的 meta
// 修改前:
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/article/ArchiveView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('@/views/article/ArticleView.vue'),
    meta: { requiresAuth: true },
  }

// 修改后:
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/article/ArchiveView.vue'),
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('@/views/article/ArticleView.vue'),
  }

// 删除 beforeEach 中的守卫块
// 修改前:
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    if (token) {
      return '/home'
    }
    return true
  }

  if (to.meta.requiresAuth && !token) {   // ← 删除这整块
    return '/login'
  }

  return true
})

// 修改后:
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    if (token) {
      return '/home'
    }
    return true
  }

  return true
})
```

### 2. `src/components/AppHeader.vue` — 退出改跳转 + 游客显示登录入口

修改 logout 跳转目标:
```typescript
// 修改前:
function handleLogout() {
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

// 修改后:
function handleLogout() {
  userStore.logout()
  message.success('已退出登录')
  router.push('/home')
}
```

模板中根据登录态显示不同内容:
```html
<!-- 修改前 -->
<div class="header-actions">
  <n-button text @click="toggleTheme">
    {{ isDark ? '☀️' : '🌙' }}
  </n-button>
  <n-avatar
    round
    size="small"
    :src="userStore.userInfo?.avatar || undefined"
    class="user-avatar"
  />
  <n-button text type="info" @click="handleLogout">
    退出
  </n-button>
</div>

<!-- 修改后 -->
<div class="header-actions">
  <n-button text @click="toggleTheme">
    {{ isDark ? '☀️' : '🌙' }}
  </n-button>
  <template v-if="userStore.token">
    <n-avatar
      round
      size="small"
      :src="userStore.userInfo?.avatar || undefined"
      class="user-avatar"
    />
    <n-button text type="info" @click="handleLogout">
      退出
    </n-button>
  </template>
  <n-button v-else text type="primary" @click="router.push('/login')">
    登录
  </n-button>
</div>
```

### 3. `LoginView.vue` — 登录后跳回来源页（可选增强）

当前登录成功后固定跳 `/home`，改为跳回来源页：
```typescript
// handleLogin 成功处:
// 修改前:
router.push('/home')

// 修改后:
const redirect = (router.currentRoute.value.query.redirect as string) || '/home'
router.push(redirect)
```

同时在 header 的登录按钮传 redirect:
```typescript
router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
```
