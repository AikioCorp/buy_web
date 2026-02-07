import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
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

      // Utiliser le token Supabase directement pour notre backend
      const token = accessToken;
      
      // Sauvegarder le token
      localStorage.setItem('token', token);

      try {
        // Vérifier si l'utilisateur existe dans notre backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Utilisateur existe, récupérer ses données
          console.log('✅ User profile found in backend');
          
          const userData = await response.json();
          console.log('👤 User data from API:', userData);
          
          // IMPORTANT: Mettre à jour le store MANUELLEMENT avec les données récupérées
          console.log('📥 Setting token and updating store...');
          
          // 1. Définir le token dans apiClient
          apiClient.setToken(token);
          
          // 2. Déterminer le rôle
          const userRole = userData.is_superuser ? 'super_admin' 
            : userData.is_staff ? 'admin' 
            : userData.is_seller ? 'vendor' 
            : 'client';
          
          // 3. Mettre à jour le store directement
          useAuthStore.setState({
            user: userData,
            isAuthenticated: true,
            role: userRole,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ Store updated manually:', { 
            isAuthenticated: true, 
            userId: userData.id,
            role: userRole 
          });
          
          // Déterminer la redirection basée sur le rôle
          let redirectPath = '/';
          
          if (userData.is_superuser) {
            redirectPath = '/superadmin';
          } else if (userData.is_staff) {
            redirectPath = '/admin';
          } else if (userData.is_seller) {
            redirectPath = '/dashboard';
          } else {
            redirectPath = '/client';
          }
          
          console.log('🔀 Redirecting to:', redirectPath);
          
          // Rediriger
          navigate(redirectPath, { replace: true });
        } else if (response.status === 404 || response.status === 401) {
          // Utilisateur n'existe pas, créer le profil
          console.log('⚠️ Profile not found, creating new profile...');
          
          // Décoder le JWT pour obtenir les infos utilisateur
          const payload = JSON.parse(atob(token.split('.')[1]));
          const email = payload.email || '';
          const fullName = payload.user_metadata?.full_name || payload.user_metadata?.name || '';
          
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const username = `${firstName.toLowerCase()}_${Date.now().toString(36).slice(-4)}`;

          const createResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              username,
              password: Math.random().toString(36).slice(-16), // Mot de passe aléatoire
              first_name: firstName,
              last_name: lastName,
            }),
          });

          if (createResponse.ok) {
            console.log('✅ New profile created');
            const newUserData = await createResponse.json();
            
            // Mettre à jour le store avec le nouvel utilisateur
            apiClient.setToken(token);
            useAuthStore.setState({
              user: newUserData.user || newUserData,
              isAuthenticated: true,
              role: 'client',
              isLoading: false,
              error: null,
            });
            
            navigate('/');
          } else {
            const errorData = await createResponse.json();
            console.error('❌ Failed to create profile:', errorData);
            setError('Erreur lors de la création du profil');
            setTimeout(() => navigate('/login?error=profile_creation_failed'), 2000);
          }
        } else {
          throw new Error('Erreur lors de la vérification du profil');
        }
      } catch (apiError: any) {
        console.error('❌ API error:', apiError);
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
