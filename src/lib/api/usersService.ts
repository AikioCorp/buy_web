import { apiClient } from './apiClient'

export interface UserData {
  id: string  // UUID from Supabase
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  is_seller: boolean
  is_superuser: boolean
  is_staff: boolean
  is_active: boolean
  date_joined: string
  last_login?: string
  role?: 'client' | 'vendor' | 'admin' | 'super_admin'
  permissions?: string[]
}

export interface UsersListResponse {
  count: number
  next: string | null
  previous: string | null
  results: UserData[]
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  is_seller?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  is_active?: boolean
}

class UsersService {
  async createUser(data: CreateUserData) {
    try {
      const response = await apiClient.post<UserData>('/api/admin/users/', data)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur')
    }
  }

  async getAllUsers(page: number = 1, _pageSize: number = 20) {
    try {
      const response = await apiClient.get<UsersListResponse>(
        `/api/admin/users/?page=${page}`
      )
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs')
    }
  }

  async getUserById(userId: string) {
    try {
      const response = await apiClient.get<UserData>(`/api/admin/users/${userId}/`)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur')
    }
  }

  async updateUser(userId: string, data: Partial<UserData>) {
    try {
      const response = await apiClient.patch<UserData>(`/api/admin/users/${userId}/`, data)
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur')
    }
  }

  async deleteUser(userId: string) {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}/`)
      return {
        status: response.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur')
    }
  }

  async searchUsers(query: string, page: number = 1, _pageSize: number = 20) {
    try {
      const response = await apiClient.get<UsersListResponse>(
        `/api/admin/users/?search=${encodeURIComponent(query)}&page=${page}`
      )
      return {
        data: response.data,
        status: response.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche d\'utilisateurs')
    }
  }

  /**
   * Activer/Désactiver un utilisateur (toggle)
   */
  async toggleActive(userId: string) {
    const response = await apiClient.post<{ is_active: boolean }>(`/api/admin/users/${userId}/toggle_active/`)
    if (response.error) {
      throw new Error(response.error)
    }
    return {
      data: response.data,
      status: response.status,
    }
  }

  /**
   * Réinitialiser le mot de passe d'un utilisateur
   */
  async resetPassword(userId: string, newPassword: string) {
    const response = await apiClient.post<{ detail: string }>(`/api/admin/users/${userId}/reset_password/`, {
      new_password: newPassword
    })
    if (response.error) {
      throw new Error(response.error)
    }
    return {
      data: response.data,
      status: response.status,
    }
  }
}

export const usersService = new UsersService()
