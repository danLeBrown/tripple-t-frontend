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

// Note: Supplier and Customer DTOs not provided, keeping existing structure
// but updating to use snake_case and Unix timestamps
export interface Supplier extends BaseEntity {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Customer extends BaseEntity {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

