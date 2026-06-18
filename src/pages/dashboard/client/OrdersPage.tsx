import React, { useState, useEffect } from 'react'
import { Search, Package, CheckCircle, Clock, XCircle, Calendar, Loader2, Truck, Eye, X, AlertTriangle, Phone, MapPin, CreditCard, FileText } from 'lucide-react'
import { ordersService, Order, OrderStatus } from '../../../lib/api/ordersService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buymore-api-production.up.railway.app'

const getImageUrl = (item: any): string | null => {
  if (!item) return null;

  // 1. Try direct product_image field (often used in OrderItem responses)
  if (item.product_image) {
    const url = item.product_image;
    if (url.startsWith('http://')) return url.replace('http://', 'https://');
    if (url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // 2. Try nested product.media or product.images
  const product = item.product || item;
  const mediaArray = product?.media || product?.images || [];

  if (Array.isArray(mediaArray) && mediaArray.length > 0) {
    const primaryImage = mediaArray.find((m: any) => m.is_primary) || mediaArray[0];
    let url = primaryImage?.image_url || primaryImage?.file || primaryImage?.image;

    if (url) {
      if (typeof url === 'string') {
        if (url.startsWith('http://')) return url.replace('http://', 'https://');
        if (url.startsWith('https://')) return url;
        return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
  }

  return null;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading orders...')
      const response = await ordersService.getMyOrders()
      console.log('Orders response:', response)
      console.log('Orders response.data type:', typeof response.data)
      console.log('Orders response.data:', JSON.stringify(response.data, null, 2))

      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log('Orders array:', response.data.length, 'orders')
          setOrders(response.data)
        } else if ((response.data as any).results) {
          console.log('Orders results:', (response.data as any).results.length, 'orders')
          setOrders((response.data as any).results)
        } else if ((response.data as any).data) {
          // Handle nested data structure
          const nestedData = (response.data as any).data
          if (Array.isArray(nestedData)) {
            console.log('Orders nested array:', nestedData.length, 'orders')
            setOrders(nestedData)
          } else if (nestedData.results) {
            console.log('Orders nested results:', nestedData.results.length, 'orders')
            setOrders(nestedData.results)
          } else {
            console.log('No orders data structure recognized - nested data:', nestedData)
            setOrders([])
          }
        } else {
          console.log('No orders data structure recognized - data:', response.data)
          setOrders([])
        }
      } else {
        console.log('No response.data')
        setOrders([])
      }
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err)
      setError(err.message || 'Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintReceipt = async (orderId: number) => {
    try {
      setReceiptLoading(true)
      const res = await ordersService.getOrderReceipt(orderId)
      setReceiptLoading(false)

      if (res.error || !res.data) {
        alert("Impossible de charger le reçu de paiement.")
        return
      }

      // Handle envelope structure
      const payload: any = res.data
      const receipt = payload.data
      const order = payload.order
      
      if (!receipt || !order) {
        alert("Les données du reçu de paiement sont incomplètes.")
        return
      }

      const receiptNumber = receipt.receipt_number || order.order_number
      const amount = Math.round(parseFloat(receipt.amount))
      const paymentMethod = receipt.payment_method
      const paymentRef = receipt.payment_ref || ''
      const createdAt = new Date(receipt.created_at).toLocaleString('fr-FR')
      const clientName = order.shipping_full_name
      const clientPhone = order.shipping_phone
      const clientAddress = `${order.shipping_commune}, ${order.shipping_quartier}`

      const isPaid = order.payment_status === 'paid'
      const statusText = isPaid ? 'PAYÉ' : order.payment_status === 'failed' ? 'ÉCHEC' : 'EN ATTENTE DE PAIEMENT'
      const statusColor = isPaid ? '#16a34a' : order.payment_status === 'failed' ? '#dc2626' : '#d97706'
      const docTitle = isPaid ? 'Reçu de paiement' : 'Facture'
      const totalLabel = isPaid ? 'TOTAL PAYÉ' : 'TOTAL À PAYER'

      const itemsHtml = (order.order_items || []).map((item: any) => 
        '<tr>' +
          '<td style="padding: 8px; border-bottom: 1px solid #ddd;">' + item.product_name + '</td>' +
          '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">' + item.quantity + '</td>' +
          '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">' + formatPrice(item.unit_price) + '</td>' +
          '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">' + formatPrice(item.total_price) + '</td>' +
        '</tr>'
      ).join('')

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        let html = '<html><head><title>' + docTitle + ' ' + receiptNumber + '</title>'
        html += '<style>'
        html += 'body { font-family: Arial, sans-serif; color: #333; margin: 20px; line-height: 1.5; }'
        html += '.header { text-align: center; margin-bottom: 30px; }'
        html += '.logo { font-size: 24px; font-weight: bold; color: #16a34a; }'
        html += '.title { font-size: 20px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }'
        html += '.info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }'
        html += '.info-table td { padding: 5px 0; }'
        html += '.items-table th { background: #f4f4f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }'
        html += '.totals { text-align: right; margin-top: 20px; font-size: 16px; }'
        html += '.footer { text-align: center; margin-top: 50px; font-size: 12px; color: #71717a; border-top: 1px solid #ddd; padding-top: 20px; }'
        html += '@media print { .print-btn { display: none; } }'
        html += '</style></head><body>'
        html += '<div style="text-align: right;"><button class="print-btn" onclick="window.print()" style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Imprimer / Enregistrer en PDF</button></div>'
        html += '<div class="header"><div class="logo">BuyMore</div><div class="title">' + docTitle + '</div><div style="margin-top: 5px; color: #71717a;">Numéro : ' + receiptNumber + '</div></div>'
        html += '<table class="info-table"><tr><td style="width: 50%;"><strong>Date :</strong> ' + createdAt + '</td><td style="width: 50%; text-align: right;"><strong>Statut :</strong> <span style="color: ' + statusColor + '; font-weight: bold;">' + statusText + '</span></td></tr>'
        html += '<tr><td><strong>Client :</strong> ' + clientName + '</td><td style="text-align: right;"><strong>Téléphone :</strong> ' + clientPhone + '</td></tr>'
        html += '<tr><td colspan="2"><strong>Adresse :</strong> ' + clientAddress + '</td></tr></table>'
        html += '<h3 style="margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Articles commandés</h3>'
        html += '<table class="items-table"><thead><tr><th>Description</th><th style="text-align: center;">Qté</th><th style="text-align: right;">Prix unitaire</th><th style="text-align: right;">Total</th></tr></thead><tbody>'
        html += itemsHtml
        html += '</tbody></table>'
        html += '<div class="totals"><p>Sous-total : ' + formatPrice(order.subtotal || order.total_amount) + '</p><p>Frais de livraison : ' + formatPrice(order.delivery_fee || 0) + '</p>'
        html += '<p style="font-size: 20px; font-weight: bold; margin-top: 10px;">' + totalLabel + ' : <span style="color: #16a34a;">' + formatPrice(amount) + '</span></p></div>'
        html += '<div style="margin-top: 30px; background: #f4f4f5; padding: 15px; border-radius: 8px; font-size: 14px;"><strong>Détails du paiement :</strong><br/>'
        html += 'Moyen de paiement : ' + (paymentMethod === 'orange_money' ? 'Orange Money' : paymentMethod === 'moov_money' ? 'Moov Money' : paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : paymentMethod) + '<br/>'
        if (paymentRef) {
          html += 'Référence de transaction : ' + paymentRef + '<br/>'
        }
        html += '</div>'
        html += '<div class="footer">Merci pour votre confiance sur BuyMore !<br/>www.buymore.ml</div>'
        html += '</body></html>'
        
        printWindow.document.write(html)
        printWindow.document.close()
      }
    } catch (err) {
      setReceiptLoading(false)
      console.error(err)
      alert("Erreur lors de la récupération du reçu.")
    }
  }

  // Filter orders based on active tab and search
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab
    const matchesSearch = searchQuery === '' ||
      order.id.toString().includes(searchQuery) ||
      order.items?.some(item => item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-500" />
      case 'confirmed':
        return <CheckCircle size={18} className="text-blue-500" />
      case 'processing':
        return <Package size={18} className="text-purple-500" />
      case 'shipped':
        return <Truck size={18} className="text-indigo-500" />
      case 'delivered':
        return <CheckCircle size={18} className="text-green-500" />
      case 'cancelled':
        return <XCircle size={18} className="text-red-500" />
      default:
        return <Clock size={18} className="text-gray-500" />
    }
  }

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'confirmed':
        return 'Confirmée'
      case 'processing':
        return 'En préparation'
      case 'shipped':
        return 'Expédiée'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('fr-FR').format(Number(price)) + ' FCFA'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Count orders by status
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order)
    setIsViewModalOpen(true)
  }

  const handleCancelOrder = async (order: Order) => {
    setOrderToCancel(order)
    setIsCancelModalOpen(true)
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return
    try {
      setActionLoading(true)
      await ordersService.cancelMyOrder(orderToCancel.id)
      setIsCancelModalOpen(false)
      setOrderToCancel(null)
      loadOrders()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Chargement des commandes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800">Erreur</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={loadOrders}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes commandes</h1>
        <p className="text-gray-600">Suivez l'état de vos commandes et consultez l'historique</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par numéro de commande ou produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex overflow-x-auto p-2 gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'all'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            Toutes <span className="ml-1 font-bold">({orderCounts.all})</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'pending'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Clock size={16} />
            En attente <span className="ml-1 font-bold">({orderCounts.pending})</span>
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'processing'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Package size={16} />
            En préparation <span className="ml-1 font-bold">({orderCounts.processing})</span>
          </button>
          <button
            onClick={() => setActiveTab('shipped')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'shipped'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Truck size={16} />
            Expédiées <span className="ml-1 font-bold">({orderCounts.shipped})</span>
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'delivered'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <CheckCircle size={16} />
            Livrées <span className="ml-1 font-bold">({orderCounts.delivered})</span>
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'cancelled'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <XCircle size={16} />
            Annulées <span className="ml-1 font-bold">({orderCounts.cancelled})</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
              <p className="text-gray-500">Vous n'avez pas encore de commande dans cette catégorie</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Image du premier produit */}
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {getImageUrl(order.items?.[0]) ? (
                          <img
                            src={getImageUrl(order.items![0])!}
                            alt={order.items?.[0]?.product?.name || 'Produit'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">Commande #{order.id}</span>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusClass(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700 font-medium">
                            {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                            {order.items?.[0]?.product?.store?.name && (
                              <span className="text-gray-500 font-normal"> • {order.items[0].product.store.name}</span>
                            )}
                          </p>
                          <p className="text-gray-500 flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(order.total_amount)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 font-medium text-sm"
                        >
                          <Eye size={16} />
                          Détails
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(order.id)}
                          className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5 font-medium text-sm"
                        >
                          <FileText size={16} />
                          {order.payment_status === 'paid' ? 'Reçu' : 'Facture'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex rounded-full bg-yellow-100 p-3 mb-4">
              <Package size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium">Aucune commande trouvée</h3>
            <p className="text-gray-500 mt-1">
              {orders.length === 0
                ? "Vous n'avez pas encore passé de commande"
                : `Aucune commande ${activeTab !== 'all' ? getStatusText(activeTab as OrderStatus).toLowerCase() : ''}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de détails de commande */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Commande #{viewingOrder.id}</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Progress Timeline */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Suivi de commande</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{
                        width: viewingOrder.status === 'pending' ? '0%' :
                          viewingOrder.status === 'confirmed' ? '25%' :
                            viewingOrder.status === 'processing' ? '50%' :
                              viewingOrder.status === 'shipped' ? '75%' :
                                viewingOrder.status === 'delivered' ? '100%' :
                                  viewingOrder.status === 'cancelled' ? '0%' : '0%'
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="flex justify-between relative">
                    {[
                      { key: 'pending', label: 'En attente', icon: Clock },
                      { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
                      { key: 'processing', label: 'Préparation', icon: Package },
                      { key: 'shipped', label: 'Expédiée', icon: Truck },
                      { key: 'delivered', label: 'Livrée', icon: CheckCircle },
                    ].map((step) => {
                      const StepIcon = step.icon
                      const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
                      const currentIndex = statusOrder.indexOf(viewingOrder.status)
                      const stepIndex = statusOrder.indexOf(step.key)
                      const isActive = stepIndex <= currentIndex && viewingOrder.status !== 'cancelled'
                      const isCurrent = step.key === viewingOrder.status

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent ? 'bg-green-600 text-white ring-4 ring-green-200 scale-110' :
                              isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                            <StepIcon size={18} />
                          </div>
                          <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-green-700' : isActive ? 'text-green-600' : 'text-gray-400'
                            }`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cancelled State */}
                {viewingOrder.status === 'cancelled' && (
                  <div className="mt-4 p-3 bg-red-100 rounded-xl flex items-center gap-3">
                    <XCircle className="text-red-600" size={24} />
                    <div>
                      <p className="font-medium text-red-800">Commande annulée</p>
                      <p className="text-sm text-red-600">Cette commande a été annulée</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm text-gray-500">Numéro de commande</span>
                  <p className="font-bold text-lg text-gray-900">#{viewingOrder.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm text-gray-500">Date de commande</span>
                  <p className="font-bold text-lg text-gray-900">{formatDate(viewingOrder.created_at)}</p>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h3 className="font-semibold mb-3">Articles commandés</h3>
                <div className="space-y-3">
                  {(viewingOrder as any).order_items?.length > 0 ? (
                    (viewingOrder as any).order_items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                          {getImageUrl(item) ? (
                            <img
                              src={getImageUrl(item)!}
                              alt={item.product_name || 'Produit'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.product_name || 'Produit'}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Qté: {item.quantity}</span>
                            <span className="font-bold text-green-600">{formatPrice(item.unit_price)}</span>
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-sm text-gray-500">Total: {formatPrice(item.total_price)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : viewingOrder.items?.length > 0 ? (
                    viewingOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                          {getImageUrl(item) ? (
                            <img
                              src={getImageUrl(item)!}
                              alt={item.product?.name || 'Produit'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.product?.name || 'Produit'}</p>
                          <p className="text-sm text-gray-500">{item.product?.store?.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Qté: {item.quantity}</span>
                            <span className="font-bold text-green-600">{formatPrice(item.unit_price)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun article trouvé</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              {(viewingOrder as any).shipping_full_name && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-gray-500" />
                    Adresse de livraison
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{(viewingOrder as any).shipping_full_name}</p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} />
                      {(viewingOrder as any).shipping_phone}
                    </p>
                    <p className="text-gray-600">
                      {(viewingOrder as any).shipping_quartier}, {(viewingOrder as any).shipping_commune}
                    </p>
                    {(viewingOrder as any).shipping_address_details && (
                      <p className="text-gray-500">{(viewingOrder as any).shipping_address_details}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-gray-500" />
                  Paiement
                </h3>
                <p className="text-sm text-gray-600">
                  {(viewingOrder as any).payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
                    (viewingOrder as any).payment_method === 'mobile_money' ? 'Mobile Money' :
                      (viewingOrder as any).payment_method || 'Non spécifié'}
                </p>
              </div>

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice((viewingOrder as any).subtotal || viewingOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frais de livraison</span>
                  <span>{formatPrice((viewingOrder as any).delivery_fee || 0)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(viewingOrder.total_amount)}</span>
                </div>
              </div>

              {/* Actions */}
              {viewingOrder.status === 'pending' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleCancelOrder(viewingOrder)
                    }}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Annuler cette commande
                  </button>
                </div>
              )}

              {viewingOrder && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => handlePrintReceipt(viewingOrder.id)}
                    disabled={receiptLoading}
                    className="w-full py-3 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {receiptLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <Package size={18} />
                        {viewingOrder.payment_status === 'paid' 
                          ? 'Voir / Imprimer le reçu de paiement' 
                          : 'Voir / Imprimer la facture'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && orderToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Annuler la commande ?</h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir annuler la commande #{orderToCancel.id} ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCancelModalOpen(false)
                    setOrderToCancel(null)
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  disabled={actionLoading}
                >
                  Non, garder
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Oui, annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
