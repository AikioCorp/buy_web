import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '../lib/api';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('🔄 Handling OAuth callback...');
      console.log('URL:', window.location.href);

      // Extraire le token directement du hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (!accessToken) {
        console.error('❌ No access token found in hash');
        setError('Aucun token trouvé');
        setTimeout(() => navigate('/login?error=no_token'), 2000);
        return;
      }

      console.log('✅ Access token found in hash');

      // Utiliser le token OAuth directement pour notre backend
      const token = accessToken;
      
      // Sauvegarder le token
      localStorage.setItem('token', token);

      try {
        // Set token first so apiClient sends it with requests
        apiClient.setToken(token);

        // Vérifier si l'utilisateur existe dans notre backend
        const meResult = await apiClient.get<any>('/api/auth/me/');

        if (!meResult.error && meResult.data) {
          const userData = meResult.data;

          const userRole = userData.is_superuser ? 'super_admin'
            : userData.is_staff ? 'admin'
            : userData.is_seller ? 'vendor'
            : 'client';

          useAuthStore.setState({
            user: userData,
            isAuthenticated: true,
            role: userRole,
            isLoading: false,
            error: null,
          });

          const redirectPath = userData.is_superuser ? '/superadmin'
            : userData.is_staff ? '/admin'
            : userData.is_seller ? '/dashboard'
            : '/client';

          navigate(redirectPath, { replace: true });
        } else if (meResult.status === 404 || meResult.status === 401) {
          // Utilisateur n'existe pas, créer le profil
          const payload = JSON.parse(atob(token.split('.')[1]));
          const email = payload.email || '';
          const fullName = payload.user_metadata?.full_name || payload.user_metadata?.name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const username = `${firstName.toLowerCase()}_${Date.now().toString(36).slice(-4)}`;

          // Reset token so register call is unauthenticated
          apiClient.setToken(null);
          const createResult = await apiClient.post<any>('/api/auth/register', {
            email,
            username,
            password: Math.random().toString(36).slice(-16),
            first_name: firstName,
            last_name: lastName,
          });

          if (!createResult.error && createResult.data) {
            apiClient.setToken(token);
            useAuthStore.setState({
              user: createResult.data.user || createResult.data,
              isAuthenticated: true,
              role: 'client',
              isLoading: false,
              error: null,
            });
            navigate('/');
          } else {
            setError('Erreur lors de la création du profil');
            setTimeout(() => navigate('/login?error=profile_creation_failed'), 2000);
          }
        } else {
          throw new Error('Erreur lors de la vérification du profil');
        }
      } catch (apiError: any) {
        setError('Erreur de connexion au serveur');
        setTimeout(() => navigate('/login?error=api_error'), 2000);
      }

    } catch (error: any) {
      console.error('❌ OAuth callback error:', error);
      setError(error.message || 'Erreur inconnue');
      setTimeout(() => navigate('/login?error=auth_failed'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        {error ? (
          <>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur d'authentification</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0f4c2b] mx-auto mb-4"></div>
            <p className="text-gray-600">Connexion en cours...</p>
            <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
