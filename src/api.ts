import type { Category, Paginated, Product } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { signal })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return response.json() as Promise<T>
}

export function getLandingData(signal?: AbortSignal) {
  return Promise.all([
    get<Category[]>('/categories', signal),
    get<Paginated<Product>>('/products?limit=8', signal),
  ])
}
