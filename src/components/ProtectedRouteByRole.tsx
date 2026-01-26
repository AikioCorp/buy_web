import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { type UserRole } from '../lib/api'

interface ProtectedRouteByRoleProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRouteByRole({ children, allowedRoles }: ProtectedRouteByRoleProps) {
  const { user, isLoading, role } = useAuthStore()
  const location = useLocation()

  const derivedRole = (user?.is_superuser ? 'super_admin' : user?.is_staff ? 'admin' : user?.is_seller ? 'vendor' : (role ?? 'client')) as UserRole
  const effectiveRole = derivedRole || role

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    // Redirect based on user role
    if (effectiveRole === 'client') {
      return <Navigate to="/client" state={{ from: location }} replace />
    } else if (effectiveRole === 'vendor') {
      return <Navigate to="/dashboard" state={{ from: location }} replace />
    } else if (effectiveRole === 'admin') {
      return <Navigate to="/admin" state={{ from: location }} replace />
    } else if (effectiveRole === 'super_admin') {
      return <Navigate to="/superadmin" state={{ from: location }} replace />
    }
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}
