import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Percent, DollarSign, Package, Tag, Store } from 'lucide-react';
import { apiClient } from '../../lib/api/apiClient';
import { useToast } from '../Toast';

interface Commission {
  id: number;
  store_id: number;
  rule_type: 'product' | 'category' | 'store_default';
  product_id?: number;
  category_id?: number;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  is_active: boolean;
  product?: { id: number; name: string; image_url?: string };
  category?: { id: number; name: string };
  created_at: string;
}

interface CommissionManagementModalProps {
  storeId: number;
  storeName: string;
  defaultCommissionRate: number;
  defaultCommissionType: 'percentage' | 'fixed';
  onClose: () => void;
  onUpdate: () => void;
}

const CommissionManagementModal: React.FC<CommissionManagementModalProps> = ({
  storeId,
  storeName,
  defaultCommissionRate,
  defaultCommissionType,
  onClose,
  onUpdate,
}) => {
  const { showToast } = useToast();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'default' | 'rules'>('default');
  
  // Default commission state
  const [defaultRate, setDefaultRate] = useState(defaultCommissionRate);
  const [defaultType, setDefaultType] = useState<'percentage' | 'fixed'>(defaultCommissionType);
  const [savingDefault, setSavingDefault] = useState(false);

  // New rule state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_type: 'product' as 'product' | 'category',
    product_id: '',
    category_id: '',
    commission_rate: 10,
    commission_type: 'percentage' as 'percentage' | 'fixed',
  });

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCommissions();
    loadProducts();
    loadCategories();
  }, [storeId]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/admin/stores/${storeId}/commissions`);
      setCommissions(response.data as Commission[]);
    } catch (error: any) {
      showToast(error.message || 'Erreur lors du chargement des commissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiClient.get(`/api/products?store_id=${storeId}`);
      const data: any = response.data;
      setProducts(data.results || data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data as any[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSaveDefaultCommission = async () => {
    try {
      setSavingDefault(true);
      await apiClient.put(`/api/admin/stores/${storeId}/default-commission`, {
        rate: defaultRate,
        type: defaultType,
      });
      showToast('Commission par défaut mise à jour', 'success');
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSavingDefault(false);
    }
  };

  const handleAddRule = async () => {
    try {
      const payload = {
        store_id: storeId,
        rule_type: newRule.rule_type,
        product_id: newRule.rule_type === 'product' ? parseInt(newRule.product_id) : undefined,
        category_id: newRule.rule_type === 'category' ? parseInt(newRule.category_id) : undefined,
        commission_rate: newRule.commission_rate,
        commission_type: newRule.commission_type,
      };

      await apiClient.post('/api/admin/commissions', payload);
      showToast('Règle de commission ajoutée', 'success');
      setShowAddForm(false);
      setNewRule({
        rule_type: 'product',
        product_id: '',
        category_id: '',
        commission_rate: 10,
        commission_type: 'percentage',
      });
      loadCommissions();
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de l\'ajout de la règle', 'error');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return;

    try {
      await apiClient.delete(`/api/admin/commissions/${id}`);
      showToast('Règle supprimée', 'success');
      loadCommissions();
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleRule = async (id: number, isActive: boolean) => {
    try {
      await apiClient.put(`/api/admin/commissions/${id}`, { is_active: !isActive });
      showToast(`Règle ${!isActive ? 'activée' : 'désactivée'}`, 'success');
      loadCommissions();
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la mise à jour', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Gestion des Commissions</h2>
              <p className="text-white/90 mt-1">{storeName}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('default')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'default'
                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-5 h-5 inline-block mr-2" />
            Commission par Défaut
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'rules'
                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-5 h-5 inline-block mr-2" />
            Règles Spécifiques ({commissions?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'default' ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Commission par défaut :</strong> Cette commission s'applique à tous les produits de la boutique 
                  qui n'ont pas de règle spécifique (par produit ou par catégorie).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Commission
                  </label>
                  <select
                    value={defaultType}
                    onChange={(e) => setDefaultType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant Fixe (FCFA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux de Commission
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={defaultRate}
                      onChange={(e) => setDefaultRate(parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {defaultType === 'percentage' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Exemple de calcul</h4>
                <p className="text-sm text-gray-600">
                  Pour un produit à <strong>10,000 FCFA</strong> :
                </p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  Commission = {defaultType === 'percentage' 
                    ? `${((10000 * defaultRate) / 100).toLocaleString()} FCFA (${defaultRate}%)`
                    : `${defaultRate.toLocaleString()} FCFA`
                  }
                </p>
              </div>

              <button
                onClick={handleSaveDefaultCommission}
                disabled={savingDefault}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {savingDefault ? 'Enregistrement...' : 'Enregistrer la Commission par Défaut'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Les règles spécifiques ont priorité sur la commission par défaut
                </p>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une Règle
                </button>
              </div>

              {showAddForm && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4 border-2 border-green-200">
                  <h4 className="font-semibold text-gray-900">Nouvelle Règle de Commission</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de Règle</label>
                      <select
                        value={newRule.rule_type}
                        onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value as 'product' | 'category' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="product">Par Produit</option>
                        <option value="category">Par Catégorie</option>
                      </select>
                    </div>

                    {newRule.rule_type === 'product' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                        <select
                          value={newRule.product_id}
                          onChange={(e) => setNewRule({ ...newRule, product_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Sélectionner un produit</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                        <select
                          value={newRule.category_id}
                          onChange={(e) => setNewRule({ ...newRule, category_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de Commission</label>
                      <select
                        value={newRule.commission_type}
                        onChange={(e) => setNewRule({ ...newRule, commission_type: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="percentage">Pourcentage (%)</option>
                        <option value="fixed">Montant Fixe (FCFA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Taux</label>
                      <input
                        type="number"
                        value={newRule.commission_rate}
                        onChange={(e) => setNewRule({ ...newRule, commission_rate: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRule}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8 text-gray-500">Chargement...</div>
              ) : !commissions || commissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune règle spécifique définie</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <div
                      key={commission.id}
                      className={`border rounded-lg p-4 ${
                        commission.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Product Image */}
                          {commission.rule_type === 'product' && commission.product?.image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img 
                                src={commission.product.image_url} 
                                alt={commission.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {commission.rule_type === 'product' ? (
                                <Package className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Tag className="w-5 h-5 text-purple-600" />
                              )}
                              <span className="font-semibold text-gray-900">
                                {commission.rule_type === 'product' 
                                  ? commission.product?.name || `Produit #${commission.product_id}`
                                  : commission.category?.name || `Catégorie #${commission.category_id}`
                                }
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                commission.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {commission.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Commission : <strong className="text-green-600">
                                {commission.commission_rate}{commission.commission_type === 'percentage' ? '%' : ' FCFA'}
                              </strong>
                            </p>
                            {/* Explanation */}
                            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-800">
                              <strong>Exemple :</strong> Pour un produit à 10,000 FCFA → Commission = {' '}
                              <strong>
                                {commission.commission_type === 'percentage'
                                  ? `${((10000 * commission.commission_rate) / 100).toLocaleString()} FCFA (${commission.commission_rate}%)`
                                  : `${commission.commission_rate.toLocaleString()} FCFA`
                                }
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRule(commission.id, commission.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              commission.is_active 
                                ? 'text-orange-600 hover:bg-orange-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={commission.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {commission.is_active ? '⏸' : '▶'}
                          </button>
                          <button
                            onClick={() => handleDeleteRule(commission.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionManagementModal;
