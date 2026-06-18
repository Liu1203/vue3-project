import { get, post, del } from '@/utils/request'
import type { ArticleDetail } from './article'

export function favoriteArticle(id: number): Promise<void> {
  return post<void>(`/api/articles/${id}/favorite`)
}

export function unfavoriteArticle(id: number): Promise<void> {
  return del<void>(`/api/articles/${id}/favorite`)
}

export function checkFavorited(id: number): Promise<boolean> {
  return get<boolean>(`/api/articles/${id}/favorite/check`)
}

export function getFavorites(): Promise<ArticleDetail[]> {
  return get<ArticleDetail[]>('/api/user/favorites')
}
