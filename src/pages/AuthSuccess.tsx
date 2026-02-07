import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    handleSuccess();
  }, []);

  const handleSuccess = async () => {
    const token = searchParams.get('token');

    if (!token) {
      console.error('❌ No token found in URL');
      navigate('/login?error=no_token');
      return;
    }

    console.log('✅ Token received, saving...');

    // Sauvegarder le token dans localStorage
    localStorage.setItem('token', token);

    // Charger les données utilisateur
    try {
      await loadUser();
      console.log('✅ User loaded successfully');
      navigate('/');
    } catch (error) {
      console.error('❌ Error loading user:', error);
      navigate('/login?error=load_user_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion réussie !</h2>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}

export default AuthSuccess;
