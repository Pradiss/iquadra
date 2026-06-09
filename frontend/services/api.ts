import type { AxiosResponse } from "axios"
import axios from "axios"
import { getToken } from "../lib/auth-storage"

export type ApiDataResponse<T> = {
  success: boolean
  message?: string
  data: T
}

export type ApiListResponse<T> = {
  success: boolean
  message?: string
  total?: number
  data: T[]
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002",
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export function unwrapData<T>(response: AxiosResponse<ApiDataResponse<T>>) {
  return response.data.data
}

export function unwrapList<T>(response: AxiosResponse<ApiListResponse<T>>) {
  return response.data.data
}
