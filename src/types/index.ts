export type ProductType = 'preform' | 'cap' | 'bottle';

// Base interface that all entities extend
export interface BaseEntity {
  id: string;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface Product extends BaseEntity {
  type: ProductType;
  size: number;
  colour: string;
  unit: string;
  slug: string;
}

export interface Colour extends BaseEntity {
  name: string;
  slug: string;
}

export interface Size extends BaseEntity {
  value: number;
}

export interface Unit extends BaseEntity {
  name: string;
  symbol: string;
  slug: string;
}

export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type CustomerStatus = 'active' | 'inactive' | 'pending';

export interface Supplier extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: SupplierStatus;
  address: string;
  state: string;
}

export interface Customer extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: CustomerStatus;
  address: string;
  state: string;
}

// Pagination and Search types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  page: number;
}

export interface SearchParams {
  query?: string;
  limit?: number;
  page?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  from_time?: number;
  to_time?: number;
}

