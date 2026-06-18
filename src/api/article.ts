import { get, post, del } from '@/utils/request'

export interface ArticleDetail {
  id: number
  title: string
  content: string
  category: string
  categoryColor: string
  tags: string[]
  date: string
  viewCount?: number
  likeCount?: number
  likedByMe?: boolean
}

export function getArticles(): Promise<ArticleDetail[]> {
  return get<ArticleDetail[]>('/api/articles')
}

export function getArticleById(id: number): Promise<ArticleDetail> {
  return get<ArticleDetail>(`/api/articles/${id}`)
}

export function likeArticle(id: number): Promise<void> {
  return post<void>(`/api/articles/${id}/like`)
}

export function unlikeArticle(id: number): Promise<void> {
  return del<void>(`/api/articles/${id}/like`)
}

export function incrementViewCount(id: number): Promise<void> {
  return post<void>(`/api/articles/${id}/view`)
}