import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Product, Colour, Size, Unit, Supplier, Customer, SearchParams } from '../types';
import productsService from '../services/products.service';
import colorsService from '../services/colors.service';
import sizesService from '../services/sizes.service';
import unitsService from '../services/units.service';
import suppliersService from '../services/suppliers.service';
import customersService from '../services/customers.service';

export const useConfigurationStore = defineStore('configuration', () => {
  const products = ref<Product[]>([]);
  const colors = ref<Colour[]>([]);
  const sizes = ref<Size[]>([]);
  const units = ref<Unit[]>([]);
  const suppliers = ref<Supplier[]>([]);
  const customers = ref<Customer[]>([]);

  // Pagination metadata
  const pagination = ref({
    total: 0,
    limit: 10,
    page: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Products
  async function fetchProducts(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await productsService.search(params);
      products.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch products';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'>) {
    loading.value = true;
    error.value = null;
    try {
      const newProduct = await productsService.create(product);
      products.value.push(newProduct);
      return newProduct;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create product';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id: string, product: Partial<Product>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await productsService.update(id, product);
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update product';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await productsService.delete(id);
      products.value = products.value.filter(p => p.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete product';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Colors
  async function fetchColors(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colorsService.search(params);
      colors.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch colors';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createColor(colour: Omit<Colour, 'id' | 'created_at' | 'updated_at' | 'slug'>) {
    loading.value = true;
    error.value = null;
    try {
      const newColor = await colorsService.create(colour);
      colors.value.push(newColor);
      return newColor;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create color';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateColor(id: string, color: Partial<Colour>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await colorsService.update(id, color);
      const index = colors.value.findIndex(c => c.id === id);
      if (index !== -1) {
        colors.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update color';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteColor(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await colorsService.delete(id);
      colors.value = colors.value.filter(c => c.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete color';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Sizes
  async function fetchSizes(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sizesService.search(params);
      sizes.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch sizes';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createSize(size: Omit<Size, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true;
    error.value = null;
    try {
      const newSize = await sizesService.create(size);
      sizes.value.push(newSize);
      return newSize;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create size';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSize(id: string, size: Partial<Size>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await sizesService.update(id, size);
      const index = sizes.value.findIndex(s => s.id === id);
      if (index !== -1) {
        sizes.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update size';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSize(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await sizesService.delete(id);
      sizes.value = sizes.value.filter(s => s.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete size';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Units
  async function fetchUnits(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await unitsService.search(params);
      units.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch units';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createUnit(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'slug'>) {
    loading.value = true;
    error.value = null;
    try {
      const newUnit = await unitsService.create(unit);
      units.value.push(newUnit);
      return newUnit;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create unit';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateUnit(id: string, unit: Partial<Unit>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await unitsService.update(id, unit);
      const index = units.value.findIndex(u => u.id === id);
      if (index !== -1) {
        units.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update unit';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUnit(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await unitsService.delete(id);
      units.value = units.value.filter(u => u.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete unit';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Suppliers
  async function fetchSuppliers(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await suppliersService.search(params);
      suppliers.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true;
    error.value = null;
    try {
      const newSupplier = await suppliersService.create(supplier);
      suppliers.value.push(newSupplier);
      return newSupplier;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSupplier(id: string, supplier: Partial<Supplier>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await suppliersService.update(id, supplier);
      const index = suppliers.value.findIndex(s => s.id === id);
      if (index !== -1) {
        suppliers.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSupplier(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await suppliersService.delete(id);
      suppliers.value = suppliers.value.filter(s => s.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Customers
  async function fetchCustomers(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await customersService.search(params);
      customers.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch customers';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true;
    error.value = null;
    try {
      const newCustomer = await customersService.create(customer);
      customers.value.push(newCustomer);
      return newCustomer;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCustomer(id: string, customer: Partial<Customer>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await customersService.update(id, customer);
      const index = customers.value.findIndex(c => c.id === id);
      if (index !== -1) {
        customers.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCustomer(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await customersService.delete(id);
      customers.value = customers.value.filter(c => c.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    colors,
    sizes,
    units,
    suppliers,
    customers,
    pagination,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchColors,
    createColor,
    updateColor,
    deleteColor,
    fetchSizes,
    createSize,
    updateSize,
    deleteSize,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
});

