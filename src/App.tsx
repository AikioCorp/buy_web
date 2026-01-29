import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { ScrollToTop } from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import { Layout } from './components/Layout'
import { AuthLayout } from './components/AuthLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProtectedRouteByRole } from './components/ProtectedRouteByRole'
import { DashboardWelcomePopup } from './components/DashboardWelcomePopup'
import { HomePage } from './pages/HomePage'
import { ShopsPage } from './pages/ShopsPage'
import { ShopDetailPage } from './pages/ShopDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TestApiPage } from './pages/TestApiPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ProductsPage as PublicProductsPage } from './pages/ProductsPage'
import { DealsPage } from './pages/DealsPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { FavoritesPage as PublicFavoritesPage } from './pages/FavoritesPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { FAQPage } from './pages/FAQPage'
import { TermsPage } from './pages/TermsPage'

// Import du Layout Dashboard Vendeur
import DashboardLayout from './components/dashboard/DashboardLayout'

// Import des pages dashboard vendeur
import {
  VendorDashboardPage,
  ProductsPage,
  OrdersPage,
  SettingsPage,
  StorePage,
  AnalyticsPage,
  EarningsPage,
  ShippingPage,
  HelpPage
} from './pages/dashboard'

// Import du Layout Dashboard Client
import { ClientDashboardLayout } from './components/dashboard/client'

// Import des pages dashboard client
import {
  ClientDashboardPage,
  OrdersPage as ClientOrdersPage,
  ProfilePage as ClientProfilePage,
  FavoritesPage,
  AddressesPage,
  PaymentsPage,
  MessagesPage,
  NotificationsPage,
  SettingsPage as ClientSettingsPage
} from './pages/dashboard/client'

// Import du Layout Dashboard Admin
import { AdminDashboardLayout } from './components/dashboard/admin'

// Import du Layout Dashboard SuperAdmin
import { SuperAdminDashboardLayout } from './components/dashboard/superadmin'

// Import des pages dashboard admin
import {
  AdminDashboardPage,
  SuperAdminDashboardPage,
  AdminUsersPage,
  AdminReportsPage,
  AdminModerationPage,
  AdminAnalyticsPage,
  AdminSecurityPage,
  AdminSettingsPage
} from './pages/dashboard/admin'
import SuperAdminUsersPage from './pages/dashboard/admin/SuperAdminUsersPage'
import SuperAdminShopsPage from './pages/dashboard/admin/SuperAdminShopsPage'
import SuperAdminCategoriesPage from './pages/dashboard/admin/SuperAdminCategoriesPage'
import SuperAdminProductsPage from './pages/dashboard/admin/SuperAdminProductsPage'
import SuperAdminOrdersPage from './pages/dashboard/admin/SuperAdminOrdersPage'
import SuperAdminRestaurantsPage from './pages/dashboard/admin/SuperAdminRestaurantsPage'
import SuperAdminPermissionsPage from './pages/dashboard/admin/SuperAdminPermissionsPage'
import SuperAdminAnalyticsPage from './pages/dashboard/admin/SuperAdminAnalyticsPage'
import SuperAdminPerformancePage from './pages/dashboard/admin/SuperAdminPerformancePage'
import SuperAdminSettingsPage from './pages/dashboard/admin/SuperAdminSettingsPage'
import { useAuthStore } from './stores/authStore'

function App() {
  const { loadUser } = useAuthStore()
  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <ToastProvider>
    <div className="pb-20 md:pb-0"> {/* Padding-bottom pour la navbar mobile */}
    <Router>
      <ScrollToTop />
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
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<PublicProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="favorites" element={<PublicFavoritesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="test-api" element={<TestApiPage />} />
        </Route>

        {/* Routes du dashboard vendeur */}
        <Route path="/dashboard" element={
          <ProtectedRouteByRole allowedRoles={['vendor']}>
            <DashboardLayout />
          </ProtectedRouteByRole>
        }>
          <Route index element={<VendorDashboardPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="shipping" element={<ShippingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Routes du dashboard client */}
        <Route path="/client" element={
          <ProtectedRouteByRole allowedRoles={['client']}>
            <ClientDashboardLayout />
          </ProtectedRouteByRole>
        }>
          <Route index element={<ClientDashboardPage />} />
          <Route path="orders" element={<ClientOrdersPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ClientProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<ClientSettingsPage />} />
        </Route>

        {/* Routes du dashboard admin */}
        <Route path="/admin" element={
          <ProtectedRouteByRole allowedRoles={['admin', 'super_admin']}>
            <AdminDashboardLayout />
          </ProtectedRouteByRole>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Routes du dashboard super admin */}
        <Route path="/superadmin" element={
          <ProtectedRouteByRole allowedRoles={['super_admin']}>
            <SuperAdminDashboardLayout />
          </ProtectedRouteByRole>
        }>
          <Route index element={<SuperAdminDashboardPage />} />
          <Route path="users" element={<SuperAdminUsersPage />} />
          <Route path="businesses" element={<SuperAdminShopsPage />} />
          <Route path="restaurants" element={<SuperAdminRestaurantsPage />} />
          <Route path="categories" element={<SuperAdminCategoriesPage />} />
          <Route path="products" element={<SuperAdminProductsPage />} />
          <Route path="orders" element={<SuperAdminOrdersPage />} />
          <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
          <Route path="performance" element={<SuperAdminPerformancePage />} />
          <Route path="security" element={<SuperAdminPermissionsPage />} />
          <Route path="settings" element={<SuperAdminSettingsPage />} />
        </Route>
      </Routes>
    </Router>
    </div>
    </ToastProvider>
  )
}

export default App
