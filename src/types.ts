export type Money = string | number

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  _count?: { products: number }
}

export interface Product {
  id: string
  categoryId: string
  name: string
  description: string | null
  price: Money
  images: string[]
  category?: Category
  inventory?: { quantity: number } | null
  _count?: { reviews: number }
}

export interface Paginated<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface CategoryView {
  id: string
  name: string
  slug: string
  description: string
  image: string
  count?: number
}

export interface ProductView {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  category: string
  stock?: number
  reviews?: number
}

export interface HeroSlide {
  id: string
  category: string
  headline: string
  description: string
  image: string
  alt: string
  filterTarget: string
  accent: string
}
