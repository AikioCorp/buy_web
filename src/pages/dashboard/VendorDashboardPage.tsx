import React from 'react'
import { ShoppingBag, Users, TrendingUp, Truck, Package, AlertCircle } from 'lucide-react'

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

const RecentOrderCard = ({ 
  orderId, customer, total, date, status 
}: { 
  orderId: string, 
  customer: string, 
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

  return (
    <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-gray-600">#{orderId}</span>
        <p className="font-medium">{customer}</p>
      </div>
      <div>
        <p className="font-bold">{total}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    </div>
  )
}

const LowStockItem = ({ 
  name, stock, image 
}: { 
  name: string, 
  stock: number, 
  image: string 
}) => (
  <div className="flex items-center gap-3 pb-3 mb-3 border-b">
    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
      {image ? (
        <img src={image} alt={name} className="h-10 w-10 object-contain" />
      ) : (
        <Package size={20} className="text-gray-400" />
      )}
    </div>
    <div className="flex-1">
      <p className="font-medium">{name}</p>
      <div className="flex items-center gap-1">
        <AlertCircle size={14} className="text-red-500" />
        <span className="text-sm text-red-500">Stock: {stock} restant</span>
      </div>
    </div>
  </div>
)

const VendorDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Vendeur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Commandes" 
          value="24" 
          icon={<ShoppingBag size={24} className="text-white" />}
          color="bg-blue-500" 
        />
        <StatCard 
          title="Clients" 
          value="143" 
          icon={<Users size={24} className="text-white" />}
          color="bg-green-500" 
        />
        <StatCard 
          title="Ventes" 
          value="56.500 XOF" 
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-purple-500" 
        />
        <StatCard 
          title="Livraisons" 
          value="12" 
          icon={<Truck size={24} className="text-white" />}
          color="bg-yellow-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Commandes Récentes</h2>
              <a href="/dashboard/orders" className="text-sm text-green-600 hover:text-green-800">
                Voir Toutes
              </a>
            </div>
            <div>
              <RecentOrderCard 
                orderId="ORD-2021" 
                customer="Ibrahim Touré" 
                total="12.500 XOF" 
                date="15 Nov" 
                status="delivered"
              />
              <RecentOrderCard 
                orderId="ORD-2020" 
                customer="Aminata Diallo" 
                total="8.700 XOF" 
                date="14 Nov" 
                status="processing"
              />
              <RecentOrderCard 
                orderId="ORD-2019" 
                customer="Moussa Keita" 
                total="14.250 XOF" 
                date="12 Nov" 
                status="pending"
              />
              <RecentOrderCard 
                orderId="ORD-2018" 
                customer="Fatoumata Sylla" 
                total="5.800 XOF" 
                date="10 Nov" 
                status="delivered"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Statistiques de Ventes</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
                  Semaine
                </button>
                <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md font-medium">
                  Mois
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
                  Année
                </button>
              </div>
            </div>
            <div className="h-60 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Graphique des ventes ici</p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <h2 className="text-lg font-bold mb-4">Produits à Faible Stock</h2>
            <div>
              <LowStockItem name="Smartphone Samsung A53" stock={3} image="" />
              <LowStockItem name="Écouteurs Bluetooth Sony" stock={2} image="" />
              <LowStockItem name="Chargeur rapide 20W" stock={4} image="" />
              <LowStockItem name="Coque iPhone 13" stock={1} image="" />
            </div>
            <a 
              href="/dashboard/products" 
              className="block text-center mt-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
            >
              Gérer l'inventaire
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-bold mb-4">Messages Récents</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                  AT
                </div>
                <div>
                  <p className="font-medium">Amadou Traoré</p>
                  <p className="text-sm text-gray-500 truncate">Je voudrais savoir si...</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
                  FK
                </div>
                <div>
                  <p className="font-medium">Fatou Koné</p>
                  <p className="text-sm text-gray-500 truncate">Est-ce que vous livrez à...</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                  SD
                </div>
                <div>
                  <p className="font-medium">Souleymane Diakité</p>
                  <p className="text-sm text-gray-500 truncate">Merci pour la rapidité...</p>
                </div>
              </div>
            </div>
            <a 
              href="/dashboard/messages" 
              className="block text-center mt-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
            >
              Voir tous les messages
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboardPage
