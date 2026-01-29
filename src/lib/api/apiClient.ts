/**
 * API Client pour BuyMore Web
 * Remplace Supabase par Django REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.buymore.ml';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Charger le token depuis localStorage au démarrage
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Définir le token d'authentification
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Headers par défaut pour les requêtes
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  /**
   * Effectuer une requête HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Gérer les différents formats d'erreur Django
        let errorMessage = 'Une erreur est survenue';
        if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) 
              ? data.non_field_errors.join(', ') 
              : data.non_field_errors;
          } else {
            // Extraire les erreurs de champs spécifiques
            const fieldErrors = Object.entries(data)
              .filter(([key]) => key !== 'status')
              .map(([key, value]) => {
                const msg = Array.isArray(value) ? value.join(', ') : value;
                return `${key}: ${msg}`;
              });
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join(' | ');
            }
          }
        }
        console.error('API Error:', response.status, errorMessage, data);
        return {
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erreur réseau',
        status: 0,
      };
    }
  }

  /**
   * Requête GET
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * Requête POST
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requête PUT
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requête PATCH
   */
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requête DELETE
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload de fichier (multipart/form-data)
   */
  async upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.token ? `Token ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          error: data?.message || data?.detail || 'Erreur lors de l\'upload',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erreur réseau',
        status: 0,
      };
    }
  }

  /**
   * Requête POST avec FormData (multipart/form-data)
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.token ? `Token ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMessage = 'Une erreur est survenue';
        if (data) {
          if (data.detail) errorMessage = data.detail;
          else if (data.error) errorMessage = data.error;
          else if (data.message) errorMessage = data.message;
        }
        return {
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erreur réseau',
        status: 0,
      };
    }
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Export des types
export type { ApiResponse };
