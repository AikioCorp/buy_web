export interface BamakoQuartierOption {
  quartier: string
  commune: string
  label: string
}

export const BAMAKO_ZONES: Record<string, { quartiers: string[]; frais_livraison: number }> = {
  'Commune I': {
    quartiers: ['Korofina Nord', 'Korofina Sud', 'Banconi', 'Boulkassoumbougou', 'Djelibougou', 'Sotuba', 'Fadjiguila', 'Sikoroni', 'Doumanzana'],
    frais_livraison: 1000,
  },
  'Commune II': {
    quartiers: ['Hippodrome', 'Médina Coura', 'Bozola', 'Niarela', 'Quinzambougou', 'Bagadadji', 'TSF', 'Missira', 'Zone Industrielle', 'Bougouba'],
    frais_livraison: 1000,
  },
  'Commune III': {
    quartiers: ['Bamako Coura', 'Darsalam', 'Ouolofobougou', 'ACI 2000', 'Point G', 'Koulouba', "N'Tomikorobougou", 'Samé', 'Badialan I', 'Badialan II', 'Badialan III'],
    frais_livraison: 1000,
  },
  'Commune IV': {
    quartiers: ['Lafiabougou', 'Hamdallaye', 'Djicoroni Para', 'Sébenikoro', 'Taliko', 'Lassa', 'Sébénikoro', 'Djélibougou'],
    frais_livraison: 1000,
  },
  'Commune V': {
    quartiers: ['Badalabougou', 'Quartier du Fleuve', 'Torokorobougou', 'Daoudabougou', 'Sabalibougou', 'Kalaban Coura', 'Baco Djicoroni ACI', 'Baco Djicoroni Golf', 'Garantiguibougou'],
    frais_livraison: 1000,
  },
  'Commune VI': {
    quartiers: ['Sogoniko', 'Faladié', 'Magnambougou', 'Niamakoro', 'Banankabougou', 'Missabougou', 'Sokorodji', 'Yirimadio', 'Dianéguéla', 'Senou'],
    frais_livraison: 1000,
  },
}

export const BAMAKO_QUARTIER_OPTIONS: BamakoQuartierOption[] = Object.entries(BAMAKO_ZONES).flatMap(
  ([commune, config]) =>
    config.quartiers.map((quartier) => ({
      quartier,
      commune,
      label: `${quartier} · ${commune}`,
    })),
)

export function normalizeQuartierSearch(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function findQuartierOption(query: string): BamakoQuartierOption | undefined {
  const normalizedQuery = normalizeQuartierSearch(query)
  if (!normalizedQuery) return undefined

  return BAMAKO_QUARTIER_OPTIONS.find((option) => {
    const normalizedLabel = normalizeQuartierSearch(option.label)
    const normalizedQuartier = normalizeQuartierSearch(option.quartier)
    return normalizedLabel === normalizedQuery || normalizedQuartier === normalizedQuery
  })
}

export function resolveQuartierOption(query: string): BamakoQuartierOption | undefined {
  const exactMatch = findQuartierOption(query)
  if (exactMatch) return exactMatch

  const suggestions = getQuartierSuggestions(query, 2)
  if (suggestions.length === 1) {
    return suggestions[0]
  }

  return undefined
}

export function getQuartierSuggestions(query: string, limit = 8): BamakoQuartierOption[] {
  const normalizedQuery = normalizeQuartierSearch(query)
  if (!normalizedQuery) {
    return BAMAKO_QUARTIER_OPTIONS.slice(0, limit)
  }

  const startsWithMatches: BamakoQuartierOption[] = []
  const containsMatches: BamakoQuartierOption[] = []

  BAMAKO_QUARTIER_OPTIONS.forEach((option) => {
    const normalizedLabel = normalizeQuartierSearch(option.label)
    const normalizedQuartier = normalizeQuartierSearch(option.quartier)
    const normalizedCommune = normalizeQuartierSearch(option.commune)

    const matches =
      normalizedLabel.includes(normalizedQuery) ||
      normalizedQuartier.includes(normalizedQuery) ||
      normalizedCommune.includes(normalizedQuery)

    if (!matches) return

    const strongMatch =
      normalizedQuartier.startsWith(normalizedQuery) ||
      normalizedCommune.startsWith(normalizedQuery) ||
      normalizedLabel.startsWith(normalizedQuery)

    if (strongMatch) {
      startsWithMatches.push(option)
    } else {
      containsMatches.push(option)
    }
  })

  return [...startsWithMatches, ...containsMatches].slice(0, limit)
}
