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
  
  // Avis
  REVIEWS_VIEW: 'reviews_view',
  REVIEWS_MODERATE: 'reviews_moderate',
  REVIEWS_DELETE: 'reviews_delete',
  
  // Rapports
  REPORTS_VIEW: 'reports_view',
  REPORTS_EXPORT: 'reports_export',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics_view',
  
  // Gestion des mots de passe
  USERS_RESET_PASSWORD: 'users_reset_password',
  USERS_CHANGE_STATUS: 'users_change_status',
  
  // Notifications
  NOTIFICATIONS_SEND: 'notifications_send',
  
  // Catégories
  CATEGORIES_VIEW: 'categories_view',
  CATEGORIES_CREATE: 'categories_create',
  CATEGORIES_EDIT: 'categories_edit',
  CATEGORIES_DELETE: 'categories_delete',
  
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
  
  /**
   * Vérifie si l'utilisateur peut gérer les avis
   */
  const canViewReviews = () => hasPermission(ALL_PERMISSIONS.REVIEWS_VIEW)
  const canModerateReviews = () => hasPermission(ALL_PERMISSIONS.REVIEWS_MODERATE)
  const canDeleteReviews = () => hasPermission(ALL_PERMISSIONS.REVIEWS_DELETE)
  
  /**
   * Vérifie si l'utilisateur peut voir les rapports
   */
  const canViewReports = () => hasPermission(ALL_PERMISSIONS.REPORTS_VIEW)
  const canExportReports = () => hasPermission(ALL_PERMISSIONS.REPORTS_EXPORT)
  
  /**
   * Vérifie si l'utilisateur peut voir les analytics
   */
  const canViewAnalytics = () => hasPermission(ALL_PERMISSIONS.ANALYTICS_VIEW)
  
  /**
   * Vérifie si l'utilisateur peut réinitialiser les mots de passe
   */
  const canResetPassword = () => hasPermission(ALL_PERMISSIONS.USERS_RESET_PASSWORD)
  const canChangeUserStatus = () => hasPermission(ALL_PERMISSIONS.USERS_CHANGE_STATUS)
  
  /**
   * Vérifie si l'utilisateur peut envoyer des notifications
   */
  const canSendNotifications = () => hasPermission(ALL_PERMISSIONS.NOTIFICATIONS_SEND)
  
  /**
   * Vérifie si l'utilisateur peut gérer les catégories
   */
  const canViewCategories = () => hasPermission(ALL_PERMISSIONS.CATEGORIES_VIEW)
  const canCreateCategories = () => hasPermission(ALL_PERMISSIONS.CATEGORIES_CREATE)
  const canEditCategories = () => hasPermission(ALL_PERMISSIONS.CATEGORIES_EDIT)
  const canDeleteCategories = () => hasPermission(ALL_PERMISSIONS.CATEGORIES_DELETE)
  
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
    
    // Avis
    canViewReviews,
    canModerateReviews,
    canDeleteReviews,
    
    // Rapports
    canViewReports,
    canExportReports,
    
    // Analytics
    canViewAnalytics,
    
    // Mots de passe et statut
    canResetPassword,
    canChangeUserStatus,
    
    // Notifications
    canSendNotifications,
    
    // Catégories
    canViewCategories,
    canCreateCategories,
    canEditCategories,
    canDeleteCategories,
  }
}

export default usePermissions
