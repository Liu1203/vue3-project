import { get, post, put, del, upload } from '@/utils/request'
import type { User, UpdateProfileParams, ChangePasswordParams, PageResult } from '@/types/api'

export function getUsers() {
  return get<User[]>('/api/users')
}

export function getUserById(id: number) {
  return get<User>(`/api/user/${id}`)
}

export function createUser(data: { name: string; email: string }) {
  return post<User>('/api/user', data)
}

export function updateAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return upload<string>('/api/user/avatar', formData)
}

export function updateProfile(data: UpdateProfileParams) {
  return put<User>('/api/user/profile', data)
}

export function changePassword(data: ChangePasswordParams) {
  return put<void>('/api/user/password', data)
}

export function getAdminUsers(page: number = 1, pageSize: number = 10) {
  return get<PageResult<User>>('/api/admin/users', { page, pageSize })
}

export function updateUserRole(id: number, role: string) {
  return put<void>(`/api/admin/users/${id}/role`, { role })
}

export function deleteUser(id: number) {
  return del<void>(`/api/admin/users/${id}`)
}