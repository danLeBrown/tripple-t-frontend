export type ProductType = 'Preform' | 'Cap' | 'Bottle' | 'Nylon' | 'Other';

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
  name: string;
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
  business_name: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  contact_person_email: string | null;
  contact_person_phone_number: string;
  status: SupplierStatus;
  address: string;
  state: string;
}

export interface Customer extends BaseEntity {
  business_name: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  contact_person_email: string | null;
  contact_person_phone_number: string;
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

// Expense types
export type ExpenseCategory =
  | 'utility'
  | 'office_supplies'
  | 'salary'
  | 'maintenance'
  | 'miscellaneous'
  | 'bonus'
  | 'allowances';

export interface Expense extends BaseEntity {
  category: ExpenseCategory;
  amount: number;
  narration: string;
  reported_at: number;
  has_been_calculated?: boolean;
}

// Upload types
export interface PresignedUrlResponse {
  url: string;
  key: string;
}

export interface Upload extends BaseEntity {
  name: string;
  relative_url: string;
  file_mimetype: string;
  file_size: number;
}

// Purchase Record types
export interface PurchaseRecord extends BaseEntity {
  upload_id: string | null;
  product_id: string;
  product_name: string;
  product_type: ProductType;
  supplier_id: string;
  supplier_name: string;
  quantity_in_bags: number;
  price_per_bag: number;
  total_price: number;
  purchased_at: number;
  upload?: Upload;
}

export interface CreatePurchaseRecordDto {
  product_id: string;
  quantity_in_bags: number;
  price_per_bag: number;
}

export interface CreatePurchaseRecordsRequest {
  upload?: {
    name: string;
    relative_url: string;
    file_mimetype: string;
    file_size: number;
  };
  upload_id?: string;
  purchased_at: number;
  purchase_records: CreatePurchaseRecordDto[];
}

// Bottle Production types
export interface BottleProduction extends BaseEntity {
  preform_supplier_id: string;
  supplier_name: string;
  preform_product_id: string;
  preform_name: string;
  bottle_product_id: string;
  bottle_name: string;
  preform_size: number;
  preform_color: string;
  preforms_used: number;
  preforms_defective: number;
  preforms_successful: number;
  bottle_size: number;
  bottle_color: string;
  bottles_produced: number;
  bottles_defective: number;
  bottles_successful: number;
  produced_at: number;
  notes: string | null;
  supplier?: Supplier;
  preform_product?: Product;
  bottle_product?: Product;
}

export interface CreateBottleProductionRequest {
  preform_supplier_id: string;
  preform_product_id: string;
  bottle_product_id: string;
  preform_size: number;
  preforms_used: number;
  preforms_defective: number;
  bottle_size: number;
  bottle_color: string;
  bottles_produced: number;
  bottles_defective: number;
  produced_at: number;
  notes?: string;
}

export interface UpdateBottleProductionRequest {
  preforms_used?: number;
  preforms_defective?: number;
  bottle_color?: string;
  bottles_produced?: number;
  bottles_defective?: number;
  notes?: string;
}
