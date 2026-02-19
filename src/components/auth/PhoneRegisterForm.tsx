import { useState, useRef, useEffect } from 'react';
import { Phone, ArrowRight, ArrowLeft, RefreshCw, Shield, Smartphone, User } from 'lucide-react';
import { authService } from '@/lib/api/authService';
import { apiClient } from '@/lib/api/apiClient';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export function PhoneRegisterForm() {
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formattedPhone, setFormattedPhone] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus premier input OTP
  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  // Étape 1 : Envoyer l'OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.sendPhoneOtp(phone);
      if (response.error) {
        setError(response.error);
        return;
      }
      setFormattedPhone(response.data?.phone || phone);
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '');
    if (digit.length > 1) {
      // Gestion du collage
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

  // Étape 2 : Valider le code et passer aux détails
  const handleValidateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    setStep('details');
  };

  // Étape 3 : Compléter l'inscription avec le code OTP + nom/prénom
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.verifyPhoneOtp({
        phone,
        otp: otpCode,
        first_name: firstName,
        last_name: lastName,
      });

      if (response.error) {
        setError(response.error);
        // Si le code OTP est expiré, revenir à l'étape OTP
        if (response.error.includes('OTP') || response.error.includes('expiré') || response.error.includes('invalide')) {
          setStep('otp');
          setOtp(['', '', '', '', '', '']);
        }
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

      // Rediriger
      const user = data.user;
      if (data.is_new_user) {
        // Nouvel utilisateur → profil client
        navigate('/client', { replace: true });
      } else {
        // Utilisateur existant → page appropriée
        let redirectPath = '/client';
        if (user?.is_superuser) redirectPath = '/superadmin';
        else if (user?.is_staff) redirectPath = '/admin';
        else if (user?.is_seller) redirectPath = '/dashboard';
        navigate(redirectPath, { replace: true });
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
      if (err.message?.includes('OTP')) {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
      }
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
        setError(response.error);
        return;
      }
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  // Indicateur d'étape
  const steps = [
    { key: 'phone', label: 'Téléphone' },
    { key: 'otp', label: 'Code OTP' },
    { key: 'details', label: 'Informations' },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="space-y-4">
      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${idx <= currentStepIdx
                  ? 'bg-[#0f4c2b] text-white'
                  : 'bg-gray-200 text-gray-500'
                }`}
            >
              {idx + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${idx <= currentStepIdx ? 'text-gray-900' : 'text-gray-400'
              }`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${idx < currentStepIdx ? 'bg-[#0f4c2b]' : 'bg-gray-200'
                }`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Étape 1 : Numéro de téléphone */}
      {step === 'phone' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone-register" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone-register"
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
      )}

      {/* Étape 2 : Code OTP */}
      {step === 'otp' && (
        <form onSubmit={handleValidateOtp} className="space-y-5">
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
            disabled={otpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continuer</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Actions */}
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

      {/* Étape 3 : Informations personnelles */}
      {step === 'details' && (
        <form onSubmit={handleCompleteRegistration} className="space-y-4">
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
              <User className="h-7 w-7 text-[#0f4c2b]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Vos informations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complétez votre profil pour finaliser l'inscription
            </p>
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all text-base"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all text-base"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !firstName.trim() || !lastName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f4c2b] to-[#1a5f3a] text-white py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : (
              <>
                <span>Créer mon compte</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('otp')}
            className="w-full flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </form>
      )}
    </div>
  );
}
