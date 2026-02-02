/**
 * Export centralisé de tous les services API
 */

export * from './apiClient';
export * from './authService';
export * from './productsService';
// Exporter categoriesService avec alias pour éviter les conflits
export { categoriesService } from './categoriesService';
export type { Category as CategoryItem, CreateCategoryData } from './categoriesService';
export * from './ordersService';
// Exporter profileService avec alias pour éviter les conflits
export { profileService } from './profileService';
export type { CustomerProfile, UpdateProfileData, Address as ProfileAddress, CreateAddressData as ProfileCreateAddressData } from './profileService';
export * from './shopsService';
export * from './favoritesService';
export * from './addressesService';
export * from './paymentsService';
export * from './messagesService';
export * from './notificationsService';
export * from './usersService';
