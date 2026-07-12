import type {
  Category,
  CategoryView,
  HeroSlide,
  Product,
  ProductView,
} from './types';

const images = {
  fashion:
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85',
  home: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=85',
  beauty:
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85',
  electronics:
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1400&q=85',
  everyday:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=85',
  sport:
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=85',
  kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85',
  pantry:
    'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1400&q=85',
  tote: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=85',
  lamp: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=85',
  serum:
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
  headphones:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
  basket:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
  sneakers:
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
  blocks:
    'https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&w=1200&q=85',
  bottle:
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=85',
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'fashion',
    category: 'Fashion',
    headline: 'Curio Fashion',
    description:
      'Wardrobe pieces, bags, and daily staples chosen for fit, texture, and lasting ease.',
    image: images.fashion,
    alt: 'Editorial fashion pieces arranged in a warm studio setting',
    filterTarget: 'fashion',
    accent: '#c8ee4f',
  },
  {
    id: 'home',
    category: 'Home',
    headline: 'Curio Home',
    description:
      'Calm furniture, lighting, textiles, and table objects that make a room feel considered.',
    image: images.home,
    alt: 'A refined living room with soft seating and warm natural light',
    filterTarget: 'home',
    accent: '#c8ee4f',
  },
  {
    id: 'beauty',
    category: 'Beauty',
    headline: 'Curio Beauty',
    description:
      'Skin, body, and grooming essentials with clean formulas and quietly beautiful packaging.',
    image: images.beauty,
    alt: 'Premium beauty products on a light stone surface',
    filterTarget: 'beauty',
    accent: '#c8ee4f',
  },
  {
    id: 'electronics',
    category: 'Electronics',
    headline: 'Curio Tech',
    description:
      'Useful devices and accessories selected for performance without visual noise.',
    image: images.electronics,
    alt: 'Minimal electronics and accessories arranged on a desk',
    filterTarget: 'electronics',
    accent: '#c8ee4f',
  },
  {
    id: 'everyday',
    category: 'Everyday Essentials',
    headline: 'Curio Everyday',
    description:
      'Groceries, personal care, kids, sport, and household refills made easier to discover.',
    image: images.everyday,
    alt: 'Fresh grocery essentials in a reusable shopping basket',
    filterTarget: 'everyday',
    accent: '#c8ee4f',
  },
];

export const fallbackCategories: CategoryView[] = [
  {
    id: 'fashion',
    slug: 'fashion',
    name: 'Fashion',
    description: 'Polished wardrobe pieces, bags, and daily accessories.',
    image: images.fashion,
    count: 28,
  },
  {
    id: 'home',
    slug: 'home',
    name: 'Home',
    description: 'Furniture, lighting, textiles, and kitchen details.',
    image: images.home,
    count: 34,
  },
  {
    id: 'beauty',
    slug: 'beauty',
    name: 'Beauty',
    description: 'Skin, body, hair, and grooming essentials.',
    image: images.beauty,
    count: 19,
  },
  {
    id: 'electronics',
    slug: 'electronics',
    name: 'Electronics',
    description: 'Devices and accessories with useful, lasting design.',
    image: images.electronics,
    count: 22,
  },
  {
    id: 'everyday',
    slug: 'everyday',
    name: 'Everyday',
    description: 'Pantry, cleaning, personal care, and household refills.',
    image: images.everyday,
    count: 41,
  },
  {
    id: 'sports',
    slug: 'sports',
    name: 'Sports',
    description: 'Training gear, recovery tools, and outdoor staples.',
    image: images.sport,
    count: 16,
  },
  {
    id: 'kids',
    slug: 'kids',
    name: 'Kids',
    description: 'Bright, durable finds for play, school, and nursery.',
    image: images.kids,
    count: 18,
  },
  {
    id: 'groceries',
    slug: 'groceries',
    name: 'Groceries',
    description: 'Fresh market basics and pantry favorites.',
    image: images.pantry,
    count: 52,
  },
];

export const fallbackProducts: ProductView[] = [
  {
    id: 'p1',
    name: 'Softline Tote',
    description: 'Structured carryall in recycled canvas',
    price: 62000,
    image: images.tote,
    categoryId: 'fashion',
    category: 'Fashion',
    stock: 14,
    reviews: 38,
  },
  {
    id: 'p2',
    name: 'Glow Table Lamp',
    description: 'Warm dimmable lamp for shelves and bedsides',
    price: 98000,
    image: images.lamp,
    categoryId: 'home',
    category: 'Home',
    stock: 7,
    reviews: 21,
  },
  {
    id: 'p3',
    name: 'Daily Barrier Serum',
    description: 'Hydrating serum for morning and evening routines',
    price: 24500,
    image: images.serum,
    categoryId: 'beauty',
    category: 'Beauty',
    stock: 31,
    reviews: 64,
  },
  {
    id: 'p4',
    name: 'Quiet Studio Headphones',
    description: 'Wireless over-ear listening with soft isolation',
    price: 189000,
    image: images.headphones,
    categoryId: 'electronics',
    category: 'Electronics',
    stock: 8,
    reviews: 42,
  },
  {
    id: 'p5',
    name: 'Market Basket',
    description: 'Seasonal produce and pantry staples for the week',
    price: 37000,
    image: images.basket,
    categoryId: 'everyday',
    category: 'Everyday',
    stock: 22,
    reviews: 17,
  },
  {
    id: 'p6',
    name: 'Tempo Runner',
    description: 'Light training sneaker with cushioned support',
    price: 124000,
    image: images.sneakers,
    categoryId: 'sports',
    category: 'Sports',
    stock: 5,
    reviews: 29,
  },
  {
    id: 'p7',
    name: 'Color Play Blocks',
    description: 'Smooth wooden set for open-ended play',
    price: 28500,
    image: images.blocks,
    categoryId: 'kids',
    category: 'Kids',
    stock: 0,
    reviews: 12,
  },
  {
    id: 'p8',
    name: 'Steel Water Bottle',
    description: 'Double-wall bottle for errands, school, and training',
    price: 18500,
    image: images.bottle,
    categoryId: 'everyday',
    category: 'Everyday',
    stock: 26,
    reviews: 55,
  },
];

export function normalizeCategories(categories: Category[]): CategoryView[] {
  return categories.map((category, index) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description:
      category.description ??
      'A curated department of useful, well-made everyday goods.',
    image:
      category.imageUrl ||
      fallbackCategories[index % fallbackCategories.length].image,
    count: category._count?.products,
  }));
}

export function normalizeProducts(products: Product[]): ProductView[] {
  return products.map((product, index) => ({
    id: product.id,
    name: product.name,
    description:
      product.description ??
      'A well-chosen marketplace find for everyday life.',
    price: Number(product.price),
    image:
      product.images?.[0] ||
      fallbackProducts[index % fallbackProducts.length].image,
    categoryId: product.categoryId,
    category: product.category?.name ?? 'Marketplace',
    stock: product.inventory?.quantity,
    reviews: product._count?.reviews,
  }));
}
