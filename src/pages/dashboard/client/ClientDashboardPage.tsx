import React from 'react'
import { ShoppingBag, Package, CreditCard, Clock, Calendar, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@buymore/api-client'

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center">
    <div className={`rounded-full p-3 mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
)

const OrderCard = ({ 
  orderId, shopName, total, date, status 
}: { 
  orderId: string, 
  shopName: string, 
  total: string, 
  date: string,
  status: 'pending' | 'delivered' | 'processing' | 'cancelled'
}) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const statusIcons = {
    pending: <Clock size={16} />,
    delivered: <CheckCircle size={16} />,
    processing: <Package size={16} />,
    cancelled: <Package size={16} />,
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Commande #{orderId}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusClasses[status]}`}>
          {statusIcons[status]}
          <span>
            {status === 'pending' && 'En attente'}
            {status === 'processing' && 'En traitement'}
            {status === 'delivered' && 'Livrée'}
            {status === 'cancelled' && 'Annulée'}
          </span>
        </span>
      </div>
      <p className="font-medium">{shopName}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-green-600 font-bold">{total}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar size={14} /> {date}
        </p>
      </div>
    </div>
  )
}

const ProductSuggestion = ({ 
  name, price, image 
}: { 
  name: string, 
  price: string, 
  image: string 
}) => (
  <div className="group">
    <div className="h-36 bg-gray-100 rounded-lg mb-2 overflow-hidden group-hover:shadow-md transition-all">
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package size={24} className="text-gray-400" />
        </div>
      )}
    </div>
    <h4 className="font-medium text-sm truncate">{name}</h4>
    <p className="text-green-600 font-bold">{price}</p>
  </div>
)

const ClientDashboardPage: React.FC = () => {
  const { profile } = useAuthStore()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Bonjour, {profile?.full_name.split(' ')[0]}</h1>
      <p className="text-gray-600 mb-6">Bienvenue sur votre tableau de bord client.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Commandes totales" 
          value="7" 
          icon={<ShoppingBag size={24} className="text-white" />}
          color="bg-blue-500" 
        />
        <StatCard 
          title="Commandes en cours" 
          value="2" 
          icon={<Package size={24} className="text-white" />}
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Dépenses" 
          value="85.700 XOF" 
          icon={<CreditCard size={24} className="text-white" />}
          color="bg-green-500" 
        />
        <StatCard 
          title="Économies" 
          value="12.500 XOF" 
          icon={<CreditCard size={24} className="text-white" />}
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Commandes récentes</h2>
              <a href="/client/orders" className="text-sm text-green-600 hover:text-green-800">
                Voir toutes
              </a>
            </div>
            <div>
              <OrderCard 
                orderId="2457" 
                shopName="Électronique Plus" 
                total="35.000 XOF" 
                date="15 Nov" 
                status="delivered"
              />
              <OrderCard 
                orderId="2433" 
                shopName="Mode Bamako" 
                total="12.500 XOF" 
                date="30 Oct" 
                status="processing"
              />
              <OrderCard 
                orderId="2422" 
                shopName="Tout pour la Maison" 
                total="28.900 XOF" 
                date="22 Oct" 
                status="pending"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Articles recommandés</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ProductSuggestion
                name="Samsung Galaxy A53"
                price="150.000 XOF"
                image=""
              />
              <ProductSuggestion
                name="Écouteurs sans fil"
                price="25.000 XOF"
                image=""
              />
              <ProductSuggestion
                name="Montre connectée"
                price="45.000 XOF"
                image=""
              />
              <ProductSuggestion
                name="Power Bank 10000mAh"
                price="15.000 XOF"
                image=""
              />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <h2 className="text-lg font-bold mb-4">Statut de livraison</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium">Commande #2433</p>
                  <p className="text-sm text-green-600">En route</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Préparation</span>
                  <span>En transit</span>
                  <span>Livré</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium">Commande #2422</p>
                  <p className="text-sm text-blue-600">Préparation</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Préparation</span>
                  <span>En transit</span>
                  <span>Livré</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-bold mb-4">Boutiques favorites</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">EP</span>
                </div>
                <div>
                  <p className="font-medium">Électronique Plus</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {'★★★★☆'}
                    </div>
                    <span className="text-xs ml-1 text-gray-500">4.0</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">MB</span>
                </div>
                <div>
                  <p className="font-medium">Mode Bamako</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {'★★★★★'}
                    </div>
                    <span className="text-xs ml-1 text-gray-500">5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">TM</span>
                </div>
                <div>
                  <p className="font-medium">Tout pour la Maison</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {'★★★☆☆'}
                    </div>
                    <span className="text-xs ml-1 text-gray-500">3.5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboardPage
