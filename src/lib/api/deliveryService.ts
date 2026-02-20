/**
 * Service de gestion des zones et frais de livraison
 */

import { apiClient } from './apiClient';

// Communes de Bamako avec leurs quartiers
export const BAMAKO_COMMUNES: Record<string, string[]> = {
  'Commune I': [
    'Korofina Nord', 'Korofina Sud', 'Banconi', 'Boulkassoumbougou', 
    'Djelibougou', 'Sotuba', 'Fadjiguila', 'Sikoroni', 'Doumanzana'
  ],
  'Commune II': [
    'Hippodrome', 'Médina Coura', 'Bozola', 'Niarela', 'Quinzambougou', 
    'Bagadadji', 'TSF', 'Missira', 'Zone Industrielle', 'Bougouba'
  ],
  'Commune III': [
    'Bamako Coura', 'Darsalam', 'Ouolofobougou', 'ACI 2000', 'Point G', 
    'Koulouba', 'N\'Tomikorobougou', 'Samé', 'Badialan I', 'Badialan II', 'Badialan III'
  ],
  'Commune IV': [
    'Lafiabougou', 'Hamdallaye', 'Djicoroni Para', 'Sébenikoro', 
    'Taliko', 'Lassa', 'Sébénikoro', 'Djélibougou'
  ],
  'Commune V': [
    'Badalabougou', 'Quartier du Fleuve', 'Torokorobougou', 'Daoudabougou', 
    'Sabalibougou', 'Kalaban Coura', 'Baco Djicoroni ACI', 'Baco Djicoroni Golf', 'Garantiguibougou'
  ],
  'Commune VI': [
    'Sogoniko', 'Faladié', 'Magnambougou', 'Niamakoro', 'Banankabougou', 
    'Missabougou', 'Sokorodji', 'Yirimadio', 'Dianéguéla', 'Senou'
  ]
};

// Interface pour une zone de livraison
export interface DeliveryZone {
  id?: number;
  store_id: number;
  commune: string;
  quartiers: string[]; // Liste des quartiers couverts (vide = tous les quartiers de la commune)
  delivery_fee: number;
  estimated_time: string; // Ex: "24h", "48h", "2-3 jours"
  is_active: boolean;
}

// Interface pour l'adresse d'une boutique
export interface StoreAddress {
  commune: string;
  quartier: string;
  address_details?: string;
  phone: string;
  whatsapp?: string;
}

// Configuration de livraison par défaut pour Bamako
export const DEFAULT_DELIVERY_CONFIG = {
  base_fee: 1000, // Frais de base en FCFA
  zone_fees: {
    'Commune I': 1000,
    'Commune II': 1000,
    'Commune III': 1000,
    'Commune IV': 1000,
    'Commune V': 1000,
    'Commune VI': 1500, // Zone périphérique
  } as Record<string, number>,
  estimated_times: {
    'Commune I': 'Sous 24h',
    'Commune II': 'Sous 24h',
    'Commune III': 'Sous 24h',
    'Commune IV': 'Sous 24h',
    'Commune V': 'Sous 24h',
    'Commune VI': '24-48h',
  } as Record<string, string>
};

// Calcul des frais de livraison en fonction de la commune du client
export function calculateDeliveryFee(
  customerCommune: string,
  customZones?: DeliveryZone[]
): { fee: number; estimatedTime: string } {
  // Si des zones personnalisées sont définies pour la boutique
  if (customZones && customZones.length > 0) {
    const zone = customZones.find(z => z.commune === customerCommune && z.is_active);
    if (zone) {
      return {
        fee: zone.delivery_fee,
        estimatedTime: zone.estimated_time
      };
    }
  }

  // Sinon utiliser la configuration par défaut
  const fee = DEFAULT_DELIVERY_CONFIG.zone_fees[customerCommune] || DEFAULT_DELIVERY_CONFIG.base_fee;
  const estimatedTime = DEFAULT_DELIVERY_CONFIG.estimated_times[customerCommune] || '2-3 jours';

  return { fee, estimatedTime };
}

// Calcul des frais de livraison pour un panier multi-boutiques
export function calculateCartDeliveryFees(
  customerCommune: string,
  storeIds: number[],
  storeDeliveryZones: Record<number, DeliveryZone[]>
): { totalFee: number; feesByStore: Record<number, number> } {
  const feesByStore: Record<number, number> = {};
  let totalFee = 0;

  // Utiliser un Set pour éviter de compter deux fois la même boutique
  const uniqueStoreIds = [...new Set(storeIds)];

  for (const storeId of uniqueStoreIds) {
    const zones = storeDeliveryZones[storeId] || [];
    const { fee } = calculateDeliveryFee(customerCommune, zones);
    feesByStore[storeId] = fee;
    totalFee += fee;
  }

  return { totalFee, feesByStore };
}

export const deliveryService = {
  /**
   * Récupérer les zones de livraison d'une boutique
   */
  async getStoreDeliveryZones(storeId: number) {
    try {
      const response = await apiClient.get<DeliveryZone[]>(`/api/stores/${storeId}/delivery-zones/`);
      return { data: response.data || [], status: response.status };
    } catch (error: any) {
      // Si l'endpoint n'existe pas, retourner un tableau vide
      if (import.meta.env.DEV) {
        console.warn('Delivery zones endpoint not available:', error.message);
      }
      return { data: [], status: 200 };
    }
  },

  /**
   * Créer une zone de livraison pour une boutique
   */
  async createDeliveryZone(storeId: number, zone: Omit<DeliveryZone, 'id' | 'store_id'>) {
    return apiClient.post<DeliveryZone>(`/api/stores/${storeId}/delivery-zones/`, {
      ...zone,
      store_id: storeId
    });
  },

  /**
   * Mettre à jour une zone de livraison
   */
  async updateDeliveryZone(storeId: number, zoneId: number, zone: Partial<DeliveryZone>) {
    return apiClient.patch<DeliveryZone>(`/api/stores/${storeId}/delivery-zones/${zoneId}/`, zone);
  },

  /**
   * Supprimer une zone de livraison
   */
  async deleteDeliveryZone(storeId: number, zoneId: number) {
    return apiClient.delete(`/api/stores/${storeId}/delivery-zones/${zoneId}/`);
  },

  /**
   * Récupérer les communes et quartiers de Bamako
   */
  getBamakoCommunes() {
    return BAMAKO_COMMUNES;
  },

  /**
   * Récupérer les quartiers d'une commune
   */
  getQuartiersByCommune(commune: string): string[] {
    return BAMAKO_COMMUNES[commune] || [];
  },

  /**
   * Calculer les frais de livraison
   */
  calculateFee(customerCommune: string, customZones?: DeliveryZone[]) {
    return calculateDeliveryFee(customerCommune, customZones);
  }
};
