import { get, post, put, del } from '@/utils/request'
import type { Comment, CreateCommentParams } from '@/types/api'

export function getComments(articleId: number): Promise<Comment[]> {
  return get<Comment[]>(`/api/articles/${articleId}/comments`)
}

export function createComment(params: CreateCommentParams): Promise<Comment> {
  return post<Comment>(`/api/articles/${params.articleId}/comments`, params)
}

export function updateComment(commentId: number, content: string): Promise<Comment> {
  return put<Comment>(`/api/comments/${commentId}`, { content })
}

export function deleteComment(commentId: number): Promise<void> {
  return del<void>(`/api/comments/${commentId}`)
}

export function likeComment(commentId: number): Promise<void> {
  return post<void>(`/api/comments/${commentId}/like`)
}

export function unlikeComment(commentId: number): Promise<void> {
  return del<void>(`/api/comments/${commentId}/like`)
}
