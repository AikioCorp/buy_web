/**
 * Export centralisé de tous les services API
 */

export * from './apiClient';
export * from './authService';

// Export des services de produits avec alias pour Category
export { 
  productsService,
  type Product,
  type ProductMedia,
  type ProductsResponse,
  type CreateProductData,
  type Store,
  type Category as ProductCategory
} from './productsService';

// Export du service de catégories
export { 
  categoriesService,
  type Category 
} from './categoriesService';

// Export du service de boutiques
export * from './shopsService';

// Export des services de commandes avec alias pour Address
export {
  ordersService,
  type Order,
  type OrderItem,
  type OrderStatus,
  type CreateOrderData,
  type Customer,
  type Address as OrderAddress
} from './ordersService';

// Export du service de profil
export {
  profileService,
  type CustomerProfile,
  type UpdateProfileData,
  type Address,
  type CreateAddressData
} from './profileService';
