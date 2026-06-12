import { get } from '@/utils/request'
import type { PaginatedThoughts } from '@/types/api'

export interface Thought {
  id: number
  content: string
  tags: string[]
  createdAt: string
}

export function getThoughts(page = 1, pageSize = 10): Promise<PaginatedThoughts> {
  return get<PaginatedThoughts>('/api/thoughts', { page, pageSize })
}
