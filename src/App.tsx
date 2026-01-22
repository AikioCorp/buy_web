import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthLayout } from './components/AuthLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardWelcomePopup } from './components/DashboardWelcomePopup'
import { HomePage } from './pages/HomePage'
import { ShopsPage } from './pages/ShopsPage'
import { ShopDetailPage } from './pages/ShopDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TodosPage } from './pages/TodosPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { TestApiPage } from './pages/TestApiPage'

// Import du Layout Dashboard Vendeur
import DashboardLayout from './components/dashboard/DashboardLayout'

// Import des pages dashboard vendeur
import {
  VendorDashboardPage,
  ProductsPage,
  OrdersPage,
  SettingsPage
} from './pages/dashboard'

// Import du Layout Dashboard Client
import { ClientDashboardLayout } from './components/dashboard/client'

// Import des pages dashboard client
import {
  ClientDashboardPage,
  OrdersPage as ClientOrdersPage,
  ProfilePage as ClientProfilePage
} from './pages/dashboard/client'

function App() {
  return (
    <div className="pb-20 md:pb-0"> {/* Padding-bottom pour la navbar mobile */}
    <Router>
      <DashboardWelcomePopup />
      <Routes>
        {/* Routes d'authentification sans navbar */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Routes principales avec navbar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:id" element={<ShopDetailPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="test-api" element={<TestApiPage />} />
          <Route path="admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="todos" element={<ProtectedRoute><TodosPage /></ProtectedRoute>} />
        </Route>
        
        {/* Routes du dashboard vendeur */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<VendorDashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Routes du dashboard client */}
        <Route path="/client" element={<ProtectedRoute><ClientDashboardLayout /></ProtectedRoute>}>
          <Route index element={<ClientDashboardPage />} />
          <Route path="orders" element={<ClientOrdersPage />} />
          <Route path="profile" element={<ClientProfilePage />} />
        </Route>
      </Routes>
    </Router>
    </div>
  )
}

export default App
