import type { Role, OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

export type { Role, OrderStatus, PaymentStatus, PaymentMethod };

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalSellers: number;
  ordersTrend?: { date: string; count: number; revenue: number }[];
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  status: string;
  images: string[];
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description?: string;
}

export interface BrandFormValues {
  name: string;
  logo?: string;
  slug: string;
}

export interface OrderUpdateStatus {
  status: OrderStatus;
}

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
