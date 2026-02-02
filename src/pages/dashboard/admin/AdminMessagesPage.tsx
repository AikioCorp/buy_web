import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Search, Loader2, RefreshCw, Send, Store, 
  User, Lock, X, Users
} from 'lucide-react'
import { useToast } from '../../../components/Toast'
import { messagesService, Conversation, Message } from '../../../lib/api/messagesService'
import { usePermissions } from '../../../hooks/usePermissions'

const AdminMessagesPage: React.FC = () => {
  const { showToast } = useToast()
  const { canViewModeration, isSuperAdmin } = usePermissions()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const hasAccess = isSuperAdmin || canViewModeration()

  useEffect(() => {
    if (hasAccess) {
      loadConversations()
    }
  }, [hasAccess])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await messagesService.getAllConversations(1, 50, typeFilter !== 'all' ? typeFilter : undefined)
      if (response.data?.results) {
        setConversations(response.data.results)
      } else {
        setConversations([])
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: number) => {
    try {
      setMessagesLoading(true)
      const response = await messagesService.getConversationMessagesAdmin(conversationId)
      if (response.data?.results) {
        setConversationMessages(response.data.results)
      }
    } catch (err: any) {
      showToast('Erreur lors du chargement des messages', 'error')
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    loadMessages(conv.id)
  }

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return
    
    try {
      setSending(true)
      await messagesService.sendAdminMessage(selectedConversation.id, replyText)
      setReplyText('')
      loadMessages(selectedConversation.id)
      showToast('Message envoyé', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error')
    } finally {
      setSending(false)
    }
  }

  const getParticipantName = (conv: Conversation, isShop: boolean) => {
    const participant = conv.participants?.find(p => isShop ? p.shop : p.user)
    if (isShop && participant?.shop) {
      return participant.shop.name
    }
    if (!isShop && participant?.user) {
      return `${participant.user.first_name || ''} ${participant.user.last_name || ''}`.trim() || participant.user.username
    }
    return 'Inconnu'
  }

  const getConversationTitle = (conv: Conversation) => {
    const names = conv.participants?.map(p => {
      if (p.shop) return p.shop.name
      if (p.user) return `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() || p.user.username
      return 'Inconnu'
    }) || []
    return names.join(' ↔ ')
  }

  // Permission denied view
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-500 text-center max-w-md">
          Vous n'avez pas la permission d'accéder à cette page.
        </p>
      </div>
    )
  }

  const filteredConversations = conversations.filter(conv => {
    const title = getConversationTitle(conv).toLowerCase()
    return title.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Messages</h1>
              <p className="text-white/80 mt-1">Surveillez les communications boutiques-clients</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="font-medium">{conversations.length} conversations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="all">Tous les types</option>
            <option value="shop_client">Boutique-Client</option>
            <option value="direct">Direct</option>
          </select>
          <button 
            onClick={loadConversations}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users size={18} />
                Conversations ({filteredConversations.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Aucune conversation</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0">
                        {conv.type === 'shop_client' ? <Store size={18} /> : <User size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {getConversationTitle(conv)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {conv.type === 'shop_client' ? 'Boutique ↔ Client' : 'Direct'}
                        </p>
                        {conv.last_message && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {conv.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getConversationTitle(selectedConversation)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {conversationMessages.length} messages
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : conversationMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message dans cette conversation
                    </div>
                  ) : (
                    conversationMessages.map((msg) => {
                      const isShop = !!msg.sender_shop_id
                      const senderName = isShop 
                        ? msg.sender_shop?.name 
                        : `${msg.sender_user?.first_name || ''} ${msg.sender_user?.last_name || ''}`.trim() || msg.sender_user?.username
                      
                      return (
                        <div key={msg.id} className={`flex ${isShop ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl p-4 ${
                            isShop 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {isShop ? <Store size={14} /> : <User size={14} />}
                              <span className="text-xs font-medium opacity-80">{senderName}</span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-2 ${isShop ? 'text-white/60' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Répondre en tant qu'admin..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Envoyer
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm text-gray-400 mt-1">pour voir les messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminMessagesPage
