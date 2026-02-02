/**
 * Hook pour gérer les permissions utilisateur
 * Permet de vérifier si l'utilisateur a une permission spécifique
 */

import { useAuthStore } from '../stores/authStore'

// Liste de toutes les permissions disponibles
export const ALL_PERMISSIONS = {
  // Utilisateurs
  USERS_VIEW: 'users_view',
  USERS_EDIT: 'users_edit',
  USERS_DELETE: 'users_delete',
  USERS_CREATE: 'users_create',
  
  // Boutiques
  SHOPS_VIEW: 'shops_view',
  SHOPS_CREATE: 'shops_create',
  SHOPS_VALIDATE: 'shops_validate',
  SHOPS_EDIT: 'shops_edit',
  SHOPS_DELETE: 'shops_delete',
  
  // Produits
  PRODUCTS_VIEW: 'products_view',
  PRODUCTS_CREATE: 'products_create',
  PRODUCTS_EDIT: 'products_edit',
  PRODUCTS_DELETE: 'products_delete',
  PRODUCTS_MODERATE: 'products_moderate',
  
  // Commandes
  ORDERS_VIEW: 'orders_view',
  ORDERS_CREATE: 'orders_create',
  ORDERS_MANAGE: 'orders_manage',
  ORDERS_CANCEL: 'orders_cancel',
  
  // Modération
  MODERATION_VIEW: 'moderation_view',
  MODERATION_MANAGE: 'moderation_manage',
  
  // Paramètres
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_EDIT: 'settings_edit',
} as const

export type PermissionId = typeof ALL_PERMISSIONS[keyof typeof ALL_PERMISSIONS]

export function usePermissions() {
  const { user, role } = useAuthStore()
  
  // Super admins ont toutes les permissions
  const isSuperAdmin = role === 'super_admin'
  
  // Récupérer les permissions de l'utilisateur
  const userPermissions: string[] = (user as any)?.permissions || []
  
  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permission: PermissionId | string): boolean => {
    // Super admins ont toutes les permissions
    if (isSuperAdmin) return true
    
    // Vérifier si la permission est dans la liste
    return userPermissions.includes(permission)
  }
  
  /**
   * Vérifie si l'utilisateur a au moins une des permissions
   */
  const hasAnyPermission = (permissions: (PermissionId | string)[]): boolean => {
    if (isSuperAdmin) return true
    return permissions.some(p => userPermissions.includes(p))
  }
  
  /**
   * Vérifie si l'utilisateur a toutes les permissions
   */
  const hasAllPermissions = (permissions: (PermissionId | string)[]): boolean => {
    if (isSuperAdmin) return true
    return permissions.every(p => userPermissions.includes(p))
  }
  
  /**
   * Vérifie si l'utilisateur peut voir les utilisateurs
   */
  const canViewUsers = () => hasPermission(ALL_PERMISSIONS.USERS_VIEW)
  const canEditUsers = () => hasPermission(ALL_PERMISSIONS.USERS_EDIT)
  const canDeleteUsers = () => hasPermission(ALL_PERMISSIONS.USERS_DELETE)
  const canCreateUsers = () => hasPermission(ALL_PERMISSIONS.USERS_CREATE)
  
  /**
   * Vérifie si l'utilisateur peut gérer les boutiques
   */
  const canViewShops = () => hasPermission(ALL_PERMISSIONS.SHOPS_VIEW)
  const canCreateShops = () => hasPermission(ALL_PERMISSIONS.SHOPS_CREATE)
  const canValidateShops = () => hasPermission(ALL_PERMISSIONS.SHOPS_VALIDATE)
  const canEditShops = () => hasPermission(ALL_PERMISSIONS.SHOPS_EDIT)
  const canDeleteShops = () => hasPermission(ALL_PERMISSIONS.SHOPS_DELETE)
  
  /**
   * Vérifie si l'utilisateur peut gérer les produits
   */
  const canViewProducts = () => hasPermission(ALL_PERMISSIONS.PRODUCTS_VIEW)
  const canCreateProducts = () => hasPermission(ALL_PERMISSIONS.PRODUCTS_CREATE)
  const canEditProducts = () => hasPermission(ALL_PERMISSIONS.PRODUCTS_EDIT)
  const canDeleteProducts = () => hasPermission(ALL_PERMISSIONS.PRODUCTS_DELETE)
  const canModerateProducts = () => hasPermission(ALL_PERMISSIONS.PRODUCTS_MODERATE)
  
  /**
   * Vérifie si l'utilisateur peut gérer les commandes
   */
  const canViewOrders = () => hasPermission(ALL_PERMISSIONS.ORDERS_VIEW)
  const canCreateOrders = () => hasPermission(ALL_PERMISSIONS.ORDERS_CREATE)
  const canManageOrders = () => hasPermission(ALL_PERMISSIONS.ORDERS_MANAGE)
  const canCancelOrders = () => hasPermission(ALL_PERMISSIONS.ORDERS_CANCEL)
  
  /**
   * Vérifie si l'utilisateur peut modérer
   */
  const canViewModeration = () => hasPermission(ALL_PERMISSIONS.MODERATION_VIEW)
  const canManageModeration = () => hasPermission(ALL_PERMISSIONS.MODERATION_MANAGE)
  
  /**
   * Vérifie si l'utilisateur peut gérer les paramètres
   */
  const canViewSettings = () => hasPermission(ALL_PERMISSIONS.SETTINGS_VIEW)
  const canEditSettings = () => hasPermission(ALL_PERMISSIONS.SETTINGS_EDIT)
  
  return {
    // Permissions brutes
    permissions: userPermissions,
    isSuperAdmin,
    
    // Méthodes génériques
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Utilisateurs
    canViewUsers,
    canEditUsers,
    canDeleteUsers,
    canCreateUsers,
    
    // Boutiques
    canViewShops,
    canCreateShops,
    canValidateShops,
    canEditShops,
    canDeleteShops,
    
    // Produits
    canViewProducts,
    canCreateProducts,
    canEditProducts,
    canDeleteProducts,
    canModerateProducts,
    
    // Commandes
    canViewOrders,
    canCreateOrders,
    canManageOrders,
    canCancelOrders,
    
    // Modération
    canViewModeration,
    canManageModeration,
    
    // Paramètres
    canViewSettings,
    canEditSettings,
  }
}

export default usePermissions
