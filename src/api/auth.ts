import { post } from '@/utils/request'
import type { LoginParams, LoginResult, RegisterParams } from '@/types/api'

export function login(data: LoginParams) {
  return post<LoginResult>('/api/auth/login', data)
}

export function register(data: RegisterParams) {
  return post<LoginResult>('/api/auth/register', data)
}