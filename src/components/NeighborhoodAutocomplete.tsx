import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

interface Neighborhood {
  id: string
  name: string
  commune: string
}

// Liste statique des quartiers de Bamako (à remplacer par un endpoint API)
const BAMAKO_NEIGHBORHOODS: Neighborhood[] = [
  { id: '1', name: 'ACI 2000', commune: 'Commune IV' },
  { id: '2', name: 'Badalabougou', commune: 'Commune V' },
  { id: '3', name: 'Hamdallaye', commune: 'Commune IV' },
  { id: '4', name: 'Hippodrome', commune: 'Commune II' },
  { id: '5', name: 'Kalaban Coura', commune: 'Commune V' },
  { id: '6', name: 'Lafiabougou', commune: 'Commune IV' },
  { id: '7', name: 'Magnambougou', commune: 'Commune VI' },
  { id: '8', name: 'Missira', commune: 'Commune II' },
  { id: '9', name: 'Niarela', commune: 'Commune II' },
  { id: '10', name: 'Quinzambougou', commune: 'Commune II' },
  { id: '11', name: 'Sabalibougou', commune: 'Commune V' },
  { id: '12', name: 'Sebenikoro', commune: 'Commune IV' },
  { id: '13', name: 'Sogoniko', commune: 'Commune VI' },
  { id: '14', name: 'Torokorobougou', commune: 'Commune V' },
]

interface NeighborhoodAutocompleteProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}

export function NeighborhoodAutocomplete({
  value,
  onChange,
  required = false,
  placeholder = "Sélectionnez un quartier",
  className = ""
}: NeighborhoodAutocompleteProps) {
  const [neighborhoods] = useState<Neighborhood[]>(BAMAKO_NEIGHBORHOODS)
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<Neighborhood[]>(BAMAKO_NEIGHBORHOODS)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Filtrer les quartiers selon la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNeighborhoods(neighborhoods)
    } else {
      const filtered = neighborhoods.filter(
        (n) =>
          n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.commune.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredNeighborhoods(filtered)
    }
  }, [searchTerm, neighborhoods])

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (neighborhood: Neighborhood) => {
    onChange(`${neighborhood.name}, ${neighborhood.commune}`)
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSearchTerm(newValue)
    setIsOpen(true)
  }

  // Grouper par commune
  const groupedNeighborhoods = filteredNeighborhoods.reduce((acc, neighborhood) => {
    if (!acc[neighborhood.commune]) {
      acc[neighborhood.commune] = []
    }
    acc[neighborhood.commune].push(neighborhood)
    return acc
  }, {} as Record<string, Neighborhood[]>)

  return (
    <div ref={wrapperRef} className="relative group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Quartier {required && '*'}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#0f4c2b] transition-colors" />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          required={required}
          className={`block w-full pl-12 pr-10 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c2b] focus:border-transparent transition-all bg-gray-50 focus:bg-white ${className}`}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && filteredNeighborhoods.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {Object.entries(groupedNeighborhoods).map(([commune, hoods]) => (
            <div key={commune}>
              <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">
                {commune}
              </div>
              {hoods.map((neighborhood) => (
                <button
                  key={neighborhood.id}
                  type="button"
                  onClick={() => handleSelect(neighborhood)}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#0f4c2b]" />
                    <span className="text-sm text-gray-900">{neighborhood.name}</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredNeighborhoods.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
          Aucun quartier trouvé
        </div>
      )}
    </div>
  )
}
