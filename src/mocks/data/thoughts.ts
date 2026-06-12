import type { Thought } from '@/api/thought'

export const thoughts: Thought[] = [
  {
    id: 1,
    content: '今天试了一下 Vue 3 的 Suspense，在异步组件加载场景下体验很好，配合 `<Suspense>` + `<template #fallback>` 可以优雅处理 loading 状态。',
    tags: ['Vue', '前端'],
    createdAt: '2026-06-12T14:30:00Z',
  },
  {
    id: 2,
    content: '最近在重读《深入理解 TypeScript》，对条件类型和 infer 关键字有了更深的理解。类型编程的本质其实就是类型层面的函数式编程。',
    tags: ['TypeScript', '读书'],
    createdAt: '2026-06-11T09:15:00Z',
  },
  {
    id: 3,
    content: 'CSS Container Queries 终于普及了！以后再也不用 Media Queries 在不同组件上下文里猜尺寸了，容器查询才是组件化时代的正确方案。',
    tags: ['CSS', '前端'],
    createdAt: '2026-06-10T16:45:00Z',
  },
  {
    id: 4,
    content: '看到一个观点：程序员最好的学习方式是写出来——写博客、写开源、写小工具。教是最好的学，深以为然。',
    tags: ['思考', '成长'],
    createdAt: '2026-06-09T20:00:00Z',
  },
  {
    id: 5,
    content: '推荐一个 Vite 插件：vite-plugin-inspect，可以查看每个模块的编译中间态，对调试构建流程非常有帮助。',
    tags: ['Vite', '工具'],
    createdAt: '2026-06-08T11:20:00Z',
  },
  {
    id: 6,
    content: '刚把项目从 Vue 3.4 升级到 3.5，defineProps 的响应式解构终于正式可用了！代码简洁很多，不用再写一堆 computed 来解构 props。',
    tags: ['Vue', '前端'],
    createdAt: '2026-06-07T10:00:00Z',
  },
  {
    id: 7,
    content: '读了一篇关于 Web 性能指标的文章，才发现 INP (Interaction to Next Paint) 已经成为 Core Web Vitals 之一了。对交互响应的要求越来越高。',
    tags: ['性能', 'Web'],
    createdAt: '2026-06-06T15:30:00Z',
  },
  {
    id: 8,
    content: '用了几天 Cursor IDE，AI 辅助编程确实能提高效率。但感觉关键还是人要清楚自己要写什么，AI 更擅长补全和重构。',
    tags: ['AI', '工具'],
    createdAt: '2026-06-05T08:45:00Z',
  },
  {
    id: 9,
    content: 'Vue 3 的 Teleport 真是个好东西 —— 用在对话框和弹出层场景，不用再担心 z-index 和父容器 overflow:hidden 的问题了。',
    tags: ['Vue', '前端'],
    createdAt: '2026-06-04T17:10:00Z',
  },
  {
    id: 10,
    content: '开始尝试在项目中使用 Vuetify 的 Virtual Scroller 来处理大数据列表。1 万条数据的滚动比之前用分页流畅太多。',
    tags: ['性能', 'Vue'],
    createdAt: '2026-06-03T13:25:00Z',
  },
  {
    id: 11,
    content: '写了一些小的 Node.js 脚本来自动化日常任务（批量重命名、图片压缩、文件同步）。CLI 工具虽然小众，但确实能省很多时间。',
    tags: ['Node.js', '工具'],
    createdAt: '2026-06-02T09:00:00Z',
  },
  {
    id: 12,
    content: '一个值得养成的习惯：每次修完 bug 都写一条测试。虽然当时看起来多花了时间，但长期来看大大减少了回归 bug。',
    tags: ['测试', '工程化'],
    createdAt: '2026-06-01T19:30:00Z',
  },
  {
    id: 13,
    content: '今天尝试用 Chrome DevTools 的 Performance 面板排查了一次页面卡顿。通过火焰图发现是一个 useEffect 里触发了不必要的重渲染。',
    tags: ['性能', '调试'],
    createdAt: '2026-05-30T15:00:00Z',
  },
  {
    id: 14,
    content: '关于前端状态管理的一个感悟：不是所有的状态都需要放进全局 store。组件内 useState / ref 足够时，别为了"优雅"而过度设计。',
    tags: ['前端', '架构'],
    createdAt: '2026-05-28T11:45:00Z',
  },
  {
    id: 15,
    content: '最近在研究 WebAssembly，用 Rust 写了一个处理字符串的模块在浏览器里跑，性能比纯 JS 提升了 3-5 倍。可惜目前调试体验还是不太行。',
    tags: ['WebAssembly', 'Rust', '性能'],
    createdAt: '2026-05-25T20:15:00Z',
  },
]
