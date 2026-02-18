import { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import { useNavigate } from 'react-router-dom';

export function PhoneLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/phone/login/send-otp', { phone });
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response: any = await apiClient.post('/auth/phone/login/verify-otp', {
        phone,
        otp,
      });

      // Sauvegarder le token
      if (response.token) {
        localStorage.setItem('token', response.token);
        apiClient.setToken(response.token);
      }

      // Rediriger selon le rôle
      let redirectPath = '/';
      if (response.user?.is_superuser) {
        redirectPath = '/superadmin';
      } else if (response.user?.is_staff) {
        redirectPath = '/admin';
      } else if (response.user?.is_seller) {
        redirectPath = '/dashboard';
      } else {
        redirectPath = '/client';
      }

      navigate(redirectPath, { replace: true });
      window.location.reload(); // Reload to update auth state
    } catch (err: any) {
      setError(err.message || 'Code OTP invalide');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+223 XX XX XX XX"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all text-base"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Format: +223XXXXXXXX ou 00223XXXXXXXX
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Envoi en cours...</span>
            ) : (
              <>
                <span>Recevoir le code</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Entrez le code à 6 chiffres"
              maxLength={6}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all text-center text-2xl tracking-widest"
              required
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Code envoyé au {phone}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Vérification...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Modifier le numéro
          </button>
        </form>
      )}
    </div>
  );
}
