/**
 * Gestion centralisée de la redirection après authentification.
 *
 * Problème résolu : quand un utilisateur lance un achat (checkout / panier /
 * détail produit) sans être connecté, il doit revenir à son parcours après
 * login — et NON être envoyé vers son dashboard.
 *
 * Principe : on stocke le chemin de retour dans sessionStorage AVANT d'ouvrir
 * le popup de connexion. Après auth réussie, les formulaires consomment ce
 * chemin. S'il est absent, on retombe sur la redirection par rôle (dashboard).
 *
 * sessionStorage survit au window.location.reload() que font les formulaires
 * OTP, donc le retour fonctionne même avec un rechargement complet.
 */

const RETURN_TO_KEY = 'auth_return_to';

/** Mémorise le chemin où revenir après login (ex: '/checkout'). */
export function setAuthReturnTo(path: string): void {
  try {
    sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    /* sessionStorage indisponible — on ignore */
  }
}

/** Lit et efface le chemin de retour. Retourne null si absent. */
export function consumeAuthReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(RETURN_TO_KEY);
    if (path) sessionStorage.removeItem(RETURN_TO_KEY);
    return path;
  } catch {
    return null;
  }
}

/** Calcule le chemin de redirection par rôle (comportement par défaut). */
export function roleBasedRedirect(user: {
  is_superuser?: boolean;
  is_staff?: boolean;
  is_seller?: boolean;
} | null | undefined): string {
  if (user?.is_superuser) return '/superadmin';
  if (user?.is_staff) return '/admin';
  if (user?.is_seller) return '/dashboard';
  return '/client';
}

/**
 * Détermine la destination finale après auth :
 * - returnTo prioritaire (parcours d'achat en cours)
 * - sinon redirection par rôle
 */
export function resolvePostAuthRedirect(user: {
  is_superuser?: boolean;
  is_staff?: boolean;
  is_seller?: boolean;
} | null | undefined): string {
  return consumeAuthReturnTo() ?? roleBasedRedirect(user);
}
