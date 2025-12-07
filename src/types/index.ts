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

// Auth types
export interface Permission extends BaseEntity {
  subject: string;
  slug: string;
  action: string;
  description: string;
}

export interface RolePermission extends BaseEntity {
  role_id: string;
  permission_id: string;
  permission: Permission;
}

export interface Role extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  permissions: RolePermission[];
}

export interface UserRole extends BaseEntity {
  user_id: string;
  role_id: string;
  role: Role;
}

export interface User extends BaseEntity {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
  status: string;
  last_login_at: number | null;
  user_role: UserRole | null;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  is_first_login: boolean;
}
