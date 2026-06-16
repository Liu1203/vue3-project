import { createServer } from 'node:http'

const PORT = 3456

interface User {
  id: number
  name: string
  email: string
  avatar: string
}

interface Article {
  id: number
  title: string
  content: string
  category: string
  categoryColor: string
  tags: string[]
  date: string
}

interface Comment {
  id: number
  articleId: number
  author: string
  authorAvatar?: string
  content: string
  parentId: number | null
  createdAt: string
}

interface Thought {
  id: number
  content: string
  tags: string[]
  createdAt: string
}

const users: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
  { id: 2, name: '李四', email: 'lisi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
  { id: 3, name: '王五', email: 'wangwu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
  { id: 5, name: '孙七', email: 'sunqi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
  { id: 6, name: '周八', email: 'zhouba@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
  { id: 7, name: '吴九', email: 'wujiu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' },
  { id: 8, name: '郑十', email: 'zhengshi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8' },
  { id: 9, name: '陈一一', email: 'chenyiyi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9' },
  { id: 10, name: '林二二', email: 'liner@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10' },
]

const articles: Article[] = [
  { id: 1, title: '用 Vite + Vue 3 从零搭建一个前端项目', content: '# 用 Vite + Vue 3 从零搭建一个前端项目\n\n本文介绍如何从零开始搭建一个基于 Vite + Vue 3 的前端项目，包含路由、状态管理、UI 框架等最佳实践。', category: 'Vue', categoryColor: '#42b883', tags: ['Vite', 'Vue3', 'TypeScript'], date: '2026-04-15' },
  { id: 2, title: 'TypeScript 泛型完全指南（适合入门）', content: '# TypeScript 泛型完全指南\n\n泛型是 TypeScript 中最强大的特性之一，本文从基础到进阶全面讲解泛型的用法。', category: 'TypeScript', categoryColor: '#3178c6', tags: ['TypeScript', '泛型', '前端基础'], date: '2026-04-10' },
  { id: 3, title: '使用 MSW 实现前端的完美 Mock 方案', content: '# 使用 MSW 实现前端 Mock\n\nMSW (Mock Service Worker) 是一个优秀的 API Mock 工具，本文介绍如何在项目中使用 MSW。', category: '工具', categoryColor: '#e67e22', tags: ['MSW', 'Mock', '开发工具'], date: '2026-04-05' },
  { id: 4, title: 'AI 对前端开发的影响与展望', content: '# AI 与前端开发\n\nAI 正在深刻改变前端开发的方方面面，从代码补全到自动化测试，AI 辅助编程已成为趋势。\n\n2026 年，AI 编程助手已经成为开发者日常工具链中不可或缺的一部分。无论是 Cursor、GitHub Copilot 还是 OpenCode，都在大幅提升开发效率。', category: '前沿', categoryColor: '#9b59b6', tags: ['AI', '前端开发', '趋势'], date: '2026-04-01' },
  { id: 5, title: 'CSS Grid 布局实战指南', content: '# CSS Grid 布局\n\nCSS Grid 是现代的二维布局系统，本文通过实战案例带你掌握 Grid 布局的方方面面。', category: 'CSS', categoryColor: '#3498db', tags: ['CSS', 'Grid', '布局'], date: '2026-03-25' },
  { id: 6, title: '前端工程化最佳实践', content: '# 前端工程化\n\n工程化是现代前端开发的基石，从代码规范到自动化构建，每一个环节都值得重视。', category: '工程化', categoryColor: '#e74c3c', tags: ['工程化', '最佳实践', '开发规范'], date: '2026-03-20' },
  { id: 7, title: '前端性能优化的那些事儿', content: '# 前端性能优化\n\n性能优化是用户体验的重要保障，本文总结了前端性能优化的常见手段和最佳实践。', category: '性能', categoryColor: '#1abc9c', tags: ['性能', '优化', '用户体验'], date: '2026-03-15' },
  { id: 8, title: '前端安全指南：防止 XSS 和 CSRF 攻击', content: '# 前端安全指南\n\n安全问题不容忽视，XSS 和 CSRF 是最常见的前端安全威胁，本文介绍如何有效防御。', category: '安全', categoryColor: '#34495e', tags: ['安全', 'XSS', 'CSRF'], date: '2026-03-10' },
  { id: 9, title: 'OpenCode 配置完全指南：打造你的专属 AI 编程助手', content: '# OpenCode 配置指南\n\nOpenCode 是一个强大的 AI 编程助手，通过合理配置可以大幅提升开发效率。', category: '工具', categoryColor: '#e67e22', tags: ['OpenCode', 'AI', 'CLI', '配置'], date: '2026-06-11' },
]

const commentStore = new Map<number, Comment[]>()
const seedComments: Comment[] = [
  { id: 1, articleId: 1, author: '小明', content: '写得很详细，Vite 确实是目前最好的选择。想问一下你用的是 pnpm 还是 npm？', parentId: null, createdAt: '2026-04-15T10:30:00Z' },
  { id: 2, articleId: 1, author: '博主', authorAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg', content: '用的 pnpm，速度快很多，建议试试~', parentId: 1, createdAt: '2026-04-15T11:00:00Z' },
  { id: 3, articleId: 2, author: '小红', content: '泛型的 extends 约束那段写得特别好，终于理解了！', parentId: null, createdAt: '2026-04-11T08:15:00Z' },
  { id: 4, articleId: 9, author: '阿强', content: 'opencode.json 里的 permissions 配置是只对当前项目生效吗？', parentId: null, createdAt: '2026-06-11T15:20:00Z' },
  { id: 5, articleId: 9, author: '博主', authorAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg', content: '是的，opencode.json 是项目级配置，只对当前项目生效。全局配置放在 ~/.config/opencode/opencode.json。', parentId: 4, createdAt: '2026-06-11T16:00:00Z' },
  { id: 6, articleId: 9, author: '阿强', content: '明白了，那项目配置和全局配置可以同时使用吗？', parentId: 4, createdAt: '2026-06-11T16:30:00Z' },
]
for (const c of seedComments) {
  if (!commentStore.has(c.articleId)) commentStore.set(c.articleId, [])
  commentStore.get(c.articleId)!.push(c)
}

const thoughts: Thought[] = [
  { id: 1, content: '今天试了一下 Vue 3 的 Suspense，在异步组件加载场景下体验很好，配合 `<Suspense>` + `<template #fallback>` 可以优雅处理 loading 状态。', tags: ['Vue', '前端'], createdAt: '2026-06-12T14:30:00Z' },
  { id: 2, content: '最近在重读《深入理解 TypeScript》，对条件类型和 infer 关键字有了更深的理解。类型编程的本质其实就是类型层面的函数式编程。', tags: ['TypeScript', '读书'], createdAt: '2026-06-11T09:15:00Z' },
  { id: 3, content: 'CSS Container Queries 终于普及了！以后再也不用 Media Queries 在不同组件上下文里猜尺寸了，容器查询才是组件化时代的正确方案。', tags: ['CSS', '前端'], createdAt: '2026-06-10T16:45:00Z' },
  { id: 4, content: '看到一个观点：程序员最好的学习方式是写出来——写博客、写开源、写小工具。教是最好的学，深以为然。', tags: ['思考', '成长'], createdAt: '2026-06-09T20:00:00Z' },
  { id: 5, content: '推荐一个 Vite 插件：vite-plugin-inspect，可以查看每个模块的编译中间态，对调试构建流程非常有帮助。', tags: ['Vite', '工具'], createdAt: '2026-06-08T11:20:00Z' },
  { id: 6, content: '刚把项目从 Vue 3.4 升级到 3.5，defineProps 的响应式解构终于正式可用了！代码简洁很多，不用再写一堆 computed 来解构 props。', tags: ['Vue', '前端'], createdAt: '2026-06-07T10:00:00Z' },
  { id: 7, content: '读了一篇关于 Web 性能指标的文章，才发现 INP (Interaction to Next Paint) 已经成为 Core Web Vitals 之一了。对交互响应的要求越来越高。', tags: ['性能', 'Web'], createdAt: '2026-06-06T15:30:00Z' },
  { id: 8, content: '用了几天 Cursor IDE，AI 辅助编程确实能提高效率。但感觉关键还是人要清楚自己要写什么，AI 更擅长补全和重构。', tags: ['AI', '工具'], createdAt: '2026-06-05T08:45:00Z' },
  { id: 9, content: 'Vue 3 的 Teleport 真是个好东西 —— 用在对话框和弹出层场景，不用再担心 z-index 和父容器 overflow:hidden 的问题了。', tags: ['Vue', '前端'], createdAt: '2026-06-04T17:10:00Z' },
  { id: 10, content: '开始尝试在项目中使用 Vuetify 的 Virtual Scroller 来处理大数据列表。1 万条数据的滚动比之前用分页流畅太多。', tags: ['性能', 'Vue'], createdAt: '2026-06-03T13:25:00Z' },
  { id: 11, content: '写了一些小的 Node.js 脚本来自动化日常任务（批量重命名、图片压缩、文件同步）。CLI 工具虽然小众，但确实能省很多时间。', tags: ['Node.js', '工具'], createdAt: '2026-06-02T09:00:00Z' },
  { id: 12, content: '一个值得养成的习惯：每次修完 bug 都写一条测试。虽然当时看起来多花了时间，但长期来看大大减少了回归 bug。', tags: ['测试', '工程化'], createdAt: '2026-06-01T19:30:00Z' },
  { id: 13, content: '今天尝试用 Chrome DevTools 的 Performance 面板排查了一次页面卡顿。通过火焰图发现是一个 useEffect 里触发了不必要的重渲染。', tags: ['性能', '调试'], createdAt: '2026-05-30T15:00:00Z' },
  { id: 14, content: '关于前端状态管理的一个感悟：不是所有的状态都需要放进全局 store。组件内 useState / ref 足够时，别为了"优雅"而过度设计。', tags: ['前端', '架构'], createdAt: '2026-05-28T11:45:00Z' },
  { id: 15, content: '最近在研究 WebAssembly，用 Rust 写了一个处理字符串的模块在浏览器里跑，性能比纯 JS 提升了 3-5 倍。可惜目前调试体验还是不太行。', tags: ['WebAssembly', 'Rust', '性能'], createdAt: '2026-05-25T20:15:00Z' },
]

function send(res: any, data: any, statusCode = 200) {
  res.statusCode = statusCode
  res.end(JSON.stringify(data))
}

function safeParse(body: string): any {
  try {
    return JSON.parse(body || '{}')
  } catch {
    return {}
  }
}

function findRootParentId(comments: Comment[], parentId: number): number {
  const parent = comments.find(c => c.id === parentId)
  if (!parent || parent.parentId === null) return parentId
  return findRootParentId(comments, parent.parentId)
}

const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const method = req.method?.toUpperCase() ?? ''
  const url = req.url ?? ''
  const parsedUrl = new URL(url, `http://localhost:${PORT}`)
  const pathname = parsedUrl.pathname

  let body = ''
  for await (const chunk of req) body += chunk

  if (method === 'GET' && pathname === '/health') {
    return send(res, { status: 'ok' })
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    const { username, password } = safeParse(body)
    if (!username || !password) {
      return send(res, { code: 400, data: null, message: '用户名和密码不能为空' })
    }
    if (username === 'admin' && password === '123456') {
      return send(res, {
        code: 200,
        data: { token: 'mock_token_abc123', userInfo: { id: 1, name: '清清', avatar: '' } },
        message: '登录成功',
      })
    }
    return send(res, { code: 400, data: null, message: '用户名或密码错误' })
  }

  if (method === 'GET' && pathname === '/api/users') {
    return send(res, { code: 200, data: users, message: 'success' })
  }

  const userMatch = pathname.match(/^\/api\/user\/(\d+)$/)
  if (method === 'GET' && userMatch) {
    const id = Number(userMatch[1])
    const user = users.find(u => u.id === id)
    return send(res, { code: user ? 200 : 404, data: user ?? null, message: user ? 'success' : '用户不存在' })
  }

  if (method === 'POST' && pathname === '/api/user') {
    const { name, email } = safeParse(body)
    if (!name || !email) {
      return send(res, { code: 400, data: null, message: 'name 和 email 不能为空' })
    }
    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${users.length + 1}`,
    }
    users.push(newUser)
    return send(res, { code: 200, data: newUser, message: '创建成功' })
  }

  if (method === 'GET' && pathname === '/api/articles') {
    return send(res, { code: 200, data: articles, message: 'success' })
  }

  const articleMatch = pathname.match(/^\/api\/articles\/(\d+)$/)
  if (method === 'GET' && articleMatch) {
    const id = Number(articleMatch[1])
    const article = articles.find(a => a.id === id)
    return send(res, { code: article ? 200 : 404, data: article ?? null, message: article ? 'success' : '文章不存在' })
  }

  const commentGetMatch = pathname.match(/^\/api\/articles\/(\d+)\/comments$/)
  if (method === 'GET' && commentGetMatch) {
    const articleId = Number(commentGetMatch[1])
    const cs = commentStore.get(articleId) ?? []
    return send(res, { code: 200, data: cs, message: 'ok' })
  }

  const commentPostMatch = pathname.match(/^\/api\/articles\/(\d+)\/comments$/)
  if (method === 'POST' && commentPostMatch) {
    const articleId = Number(commentPostMatch[1])
    const parsed = safeParse(body)
    const { author, content } = parsed
    let parentId: number | null = parsed.parentId ?? null
    if (!author || !content) {
      return send(res, { code: 400, data: null, message: 'author 和 content 不能为空' })
    }
    if (!commentStore.has(articleId)) commentStore.set(articleId, [])
    const cs = commentStore.get(articleId)!
    const id = cs.length === 0 ? 1 : Math.max(...cs.map(c => c.id)) + 1
    if (parentId !== null) {
      parentId = findRootParentId(cs, parentId)
    }
    const newComment: Comment = {
      id,
      articleId,
      author,
      content,
      parentId,
      createdAt: new Date().toISOString(),
    }
    cs.push(newComment)
    return send(res, { code: 200, data: newComment, message: '评论成功' })
  }

  const deleteMatch = pathname.match(/^\/api\/comments\/(\d+)$/)
  if (method === 'DELETE' && deleteMatch) {
    const commentId = Number(deleteMatch[1])
    for (const [articleId, cs] of commentStore.entries()) {
      const idx = cs.findIndex(c => c.id === commentId)
      if (idx !== -1) {
        const filtered = cs.filter(c => c.id !== commentId && c.parentId !== commentId)
        commentStore.set(articleId, filtered)
        return send(res, { code: 200, data: null, message: '删除成功' })
      }
    }
    return send(res, { code: 404, data: null, message: '评论不存在' })
  }

  if (method === 'GET' && pathname === '/api/thoughts') {
    const page = Number(parsedUrl.searchParams.get('page')) || 1
    const pageSize = Number(parsedUrl.searchParams.get('pageSize')) || 10
    const sorted = [...thoughts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const start = (page - 1) * pageSize
    const items = sorted.slice(start, start + pageSize)
    return send(res, {
      code: 200,
      data: { items, total: sorted.length, page, pageSize },
      message: 'success',
    })
  }

  send(res, { code: 404, data: null, message: '接口不存在' }, 404)
})

server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`)
})
