import { get, post, put, del } from '@/utils/request'
import type { ArticleDetail } from './article'

export interface CreateArticleParams {
  title: string
  content: string
  category: string
  categoryColor?: string
  tags?: string[]
  date?: string
}

export function getAdminArticles() {
  return get<ArticleDetail[]>('/api/admin/articles')
}

export function getAdminArticle(id: number) {
  return get<ArticleDetail>(`/api/admin/articles/${id}`)
}

export function createArticle(params: CreateArticleParams) {
  return post<ArticleDetail>('/api/admin/articles', params)
}

export function updateArticle(id: number, params: CreateArticleParams) {
  return put<ArticleDetail>(`/api/admin/articles/${id}`, params)
}

export function deleteArticle(id: number) {
  return del<null>(`/api/admin/articles/${id}`)
}
