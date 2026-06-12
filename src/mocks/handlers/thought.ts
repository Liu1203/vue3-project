import { http, HttpResponse } from 'msw'
import type { ApiResponse, PaginatedThoughts } from '@/types/api'
import { thoughts } from '../data/thoughts'

export const thoughtHandlers = [
  http.get('/api/thoughts', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10

    const sorted = [...thoughts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const start = (page - 1) * pageSize
    const items = sorted.slice(start, start + pageSize)

    return HttpResponse.json({
      code: 200,
      data: {
        items,
        total: sorted.length,
        page,
        pageSize,
      },
      message: 'success',
    } as ApiResponse<PaginatedThoughts>)
  }),
]
