import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, CheckCircle, Info, X, Loader2 } from 'lucide-react'

type ConfirmType = 'warning' | 'danger' | 'success' | 'info'

interface ConfirmOptions {
  title: string
  message: string
  type?: ConfirmType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  alert: (title: string, message: string, type?: ConfirmType) => Promise<void>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolveRef(() => resolve)
    })
  }, [])

  const alert = useCallback((title: string, message: string, type: ConfirmType = 'info'): Promise<void> => {
    return new Promise((resolve) => {
      setOptions({
        title,
        message,
        type,
        confirmText: 'OK',
        cancelText: undefined
      })
      setIsOpen(true)
      setResolveRef(() => () => resolve())
    })
  }, [])

  const handleConfirm = async () => {
    if (options?.onConfirm) {
      setIsLoading(true)
      try {
        await options.onConfirm()
      } finally {
        setIsLoading(false)
      }
    }
    setIsOpen(false)
    resolveRef?.(true)
    setOptions(null)
    setResolveRef(null)
  }

  const handleCancel = () => {
    options?.onCancel?.()
    setIsOpen(false)
    resolveRef?.(false)
    setOptions(null)
    setResolveRef(null)
  }

  const getIcon = () => {
    switch (options?.type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getIconBg = () => {
    switch (options?.type) {
      case 'danger':
        return 'bg-red-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'success':
        return 'bg-green-100'
      default:
        return 'bg-blue-100'
    }
  }

  const getConfirmButtonStyle = () => {
    switch (options?.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[300] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={!isLoading ? handleCancel : undefined}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in-95 duration-200">
              {/* Close button */}
              {options.cancelText !== undefined && (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <div className="p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${getIconBg()} flex items-center justify-center mx-auto mb-4`}>
                  {getIcon()}
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {options.title}
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 text-center mb-6">
                  {options.message}
                </p>
                
                {/* Actions */}
                <div className={`flex gap-3 ${options.cancelText ? 'justify-end' : 'justify-center'}`}>
                  {options.cancelText && (
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {options.cancelText}
                    </button>
                  )}
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2.5 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 ${getConfirmButtonStyle()}`}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {options.confirmText || 'Confirmer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}
