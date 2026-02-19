import { useState, useRef, useEffect } from 'react';
import { Phone, ArrowRight, ArrowLeft, RefreshCw, Shield, Smartphone } from 'lucide-react';
import { authService } from '@/lib/api/authService';
import { apiClient } from '@/lib/api/apiClient';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export function PhoneLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formattedPhone, setFormattedPhone] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Countdown timer pour le renvoi OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus le premier input OTP quand on arrive à l'étape OTP
  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.sendPhoneOtp(phone);
      if (response.error) {
        setError(typeof response.error === 'string' ? response.error : (response.error as any)?.message || JSON.stringify(response.error));
        return;
      }
      setFormattedPhone(response.data?.phone || phone);
      setStep('otp');
      setCountdown(60); // 60 secondes avant de pouvoir renvoyer
    } catch (err: any) {
      const msg = err?.message || err?.toString?.() || 'Erreur lors de l\'envoi du code';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Uniquement des chiffres
    const digit = value.replace(/\D/g, '');
    if (digit.length > 1) {
      // Gestion du collage de code complet
      const digits = digit.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const otpCode = otp.join('');

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await authService.verifyPhoneOtp({
        phone,
        otp: otpCode,
      });

      if (response.error) {
        setError(typeof response.error === 'string' ? response.error : (response.error as any)?.message || JSON.stringify(response.error));
        return;
      }

      const data = response.data;
      if (!data) {
        setError('Réponse invalide du serveur');
        return;
      }

      // Mettre à jour le store d'authentification
      const { loadUser } = useAuthStore.getState();
      await loadUser();

      // Rediriger selon le rôle
      const user = data.user;
      let redirectPath = '/';
      if (user?.is_superuser) {
        redirectPath = '/superadmin';
      } else if (user?.is_staff) {
        redirectPath = '/admin';
      } else if (user?.is_seller) {
        redirectPath = '/dashboard';
      } else {
        redirectPath = '/client';
      }

      navigate(redirectPath, { replace: true });
      window.location.reload();
    } catch (err: any) {
      const msg = err?.message || err?.toString?.() || 'Code OTP invalide ou expiré';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.sendPhoneOtp(phone);
      if (response.error) {
        setError(typeof response.error === 'string' ? response.error : (response.error as any)?.message || JSON.stringify(response.error));
        return;
      }
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err?.message || err?.toString?.() || 'Erreur lors du renvoi du code';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone-login" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone-login"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="70 00 00 00"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all text-base"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Le préfixe +223 est ajouté automatiquement si nécessaire
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : (
              <>
                <Smartphone className="h-5 w-5" />
                <span>Recevoir le code SMS</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          {/* Header avec icône */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
              <Shield className="h-7 w-7 text-[#0f4c2b]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Vérification</h3>
            <p className="mt-1 text-sm text-gray-500">
              Code envoyé au <span className="font-medium text-gray-700">{formattedPhone || phone}</span>
            </p>
          </div>

          {/* OTP Input (6 chiffres séparés) */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
                  handleOtpChange(index, pastedData);
                }}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-[#0f4c2b] transition-all"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Renvoyer le code */}
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp(['', '', '', '', '', '']);
                setError('');
              }}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier le numéro
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isLoading}
              className="flex items-center gap-1 text-[#0f4c2b] hover:text-[#1a5f3a] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer le code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
