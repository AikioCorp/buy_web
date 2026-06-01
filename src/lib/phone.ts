/**
 * Normalisation des numéros de téléphone maliens pour les paiements mobile money.
 *
 * Les opérateurs (Orange/Moov/Wave) via InTouch attendent le numéro local à
 * 8 chiffres (ex: "70796969"), sans préfixe +223 ni espaces.
 */

/** Retourne les 8 chiffres locaux (sans +223, sans espaces). '' si invalide. */
export function toLocalMsisdn(raw: string | null | undefined): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, ''); // garder uniquement les chiffres
  // Retirer l'indicatif pays 223 s'il est présent en tête
  if (digits.startsWith('223')) {
    digits = digits.slice(3);
  }
  // Un numéro malien mobile fait 8 chiffres
  return digits.length === 8 ? digits : digits.slice(-8);
}

/** Retourne le format international +223XXXXXXXX. '' si invalide. */
export function toInternationalMsisdn(raw: string | null | undefined): string {
  const local = toLocalMsisdn(raw);
  return local.length === 8 ? `+223${local}` : '';
}

/** Vérifie qu'un numéro malien local valide (8 chiffres) peut être extrait. */
export function hasValidMsisdn(raw: string | null | undefined): boolean {
  return toLocalMsisdn(raw).length === 8;
}
