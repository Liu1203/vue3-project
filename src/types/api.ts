// 用户数据类型
export interface User {
  id: number
  name: string
  email: string
  avatar: string
  username: string
  role: string
}

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页结果
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 更新个人资料参数
export interface UpdateProfileParams {
  name?: string
  email?: string
}

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

// 新增：登录请求体
export interface LoginParams {
  username: string
  password: string
}

// 注册请求体
export interface RegisterParams {
  username: string
  password: string
  name: string
  email: string
}

// 登录返回数据
export interface LoginResult {
  token: string
  userInfo: {
    id: number
    name: string
    avatar: string
    role?: string
  }
}

// 评论
export interface Comment {
  id: number
  articleId: number
  author: string
  authorAvatar?: string
  content: string
  parentId: number | null
  createdAt: string
  likeCount?: number
  likedByMe?: boolean
}

// 创建评论参数
export interface CreateCommentParams {
  articleId: number
  author: string
  authorAvatar?: string
  content: string
  parentId?: number | null
}

// 灵感随想
export interface Thought {
  id: number
  content: string
  tags: string[]
  createdAt: string
}

export interface PaginatedThoughts {
  items: Thought[]
  total: number
  page: number
  pageSize: number
}