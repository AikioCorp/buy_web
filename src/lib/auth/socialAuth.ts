import { supabase } from '../supabase/client';

/**
 * Service d'authentification sociale (Google, Facebook)
 */

export const socialAuth = {
  /**
   * Connexion avec Google
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Connexion avec Facebook
   */
  async signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Gérer le callback OAuth après redirection
   */
  async handleOAuthCallback() {
    try {
      // Supabase gère automatiquement le callback
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        // Vérifier si le profil existe, sinon le créer
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profil n'existe pas, le créer
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
              avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || null,
              role: 'customer',
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        return { session, error: null };
      }

      return { session: null, error: 'No session found' };
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return { session: null, error: error.message };
    }
  },

  /**
   * Vérifier l'état de la session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error: any) {
      return { session: null, error: error.message };
    }
  },

  /**
   * Écouter les changements d'authentification
   */
  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event: any, session: any) => {
      callback(session);
    });
  },
};

export default socialAuth;
