import React, { useState } from 'react'
import { MessageSquare, Send, Search, Store, User, Loader2 } from 'lucide-react'
import { useConversations, useConversation } from '../../../hooks/useMessages'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuthStore } from '../../../stores/authStore'
import { Conversation } from '../../../lib/api/messagesService'

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore()
  const { conversations, isLoading } = useConversations()
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { messages, sendMessage, isLoading: messagesLoading } = useConversation(
    selectedConversationId || 0
  )

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversationId) return

    await sendMessage(messageText)
    setMessageText('')
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  // Get the "other" participant in a conversation (the shop or user that is not the current user)
  const getOtherParticipant = (conv: Conversation) => {
    const participant = conv.participants?.find(p => {
      if (p.shop) return true // Shops are always "other"
      if (p.user && String(p.user.id) !== String(user?.id)) return true
      return false
    })
    
    if (participant?.shop) {
      return {
        type: 'shop' as const,
        name: participant.shop.name,
        avatar: participant.shop.logo_url,
        initial: participant.shop.name.charAt(0)
      }
    }
    if (participant?.user) {
      const fullName = `${participant.user.first_name || ''} ${participant.user.last_name || ''}`.trim() || participant.user.username
      return {
        type: 'user' as const,
        name: fullName,
        avatar: participant.user.avatar_url,
        initial: fullName.charAt(0)
      }
    }
    return { type: 'user' as const, name: 'Inconnu', avatar: null, initial: '?' }
  }

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv)
    return other.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-green-600" />
          Messages
        </h1>
        <p className="text-gray-600 mt-1">Communiquez avec les vendeurs et boutiques</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Liste des conversations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-100 focus:border-green-300"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Aucune conversation</p>
                  <p className="text-gray-400 text-sm mt-1">Contactez une boutique pour commencer</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const other = getOtherParticipant(conversation)
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                        selectedConversationId === conversation.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                          other.type === 'shop' 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {other.type === 'shop' ? <Store size={20} /> : other.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {other.name}
                            </h3>
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            {other.type === 'shop' ? <Store size={10} /> : <User size={10} />}
                            <span>{other.type === 'shop' ? 'Boutique' : 'Utilisateur'}</span>
                          </div>
                          {conversation.last_message && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message.content}
                            </p>
                          )}
                          {conversation.unread_count > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  {(() => {
                    const other = getOtherParticipant(selectedConversation)
                    return (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                          other.type === 'shop' 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {other.type === 'shop' ? <Store size={18} /> : other.initial}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{other.name}</h3>
                          <p className="text-sm text-gray-500">
                            {other.type === 'shop' ? 'Boutique' : 'Utilisateur'}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                        <p>Aucun message</p>
                        <p className="text-sm text-gray-400 mt-1">Envoyez le premier message !</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.sender_user_id === user?.id
                      const isFromShop = !!message.sender_shop_id
                      const senderName = isFromShop 
                        ? message.sender_shop?.name 
                        : `${message.sender_user?.first_name || ''} ${message.sender_user?.last_name || ''}`.trim() || message.sender_user?.username
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md rounded-2xl p-4 ${
                              isOwn
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                                : isFromShop
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                  : 'bg-white border border-gray-200 text-gray-900'
                            }`}
                          >
                            {!isOwn && (
                              <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                                {isFromShop ? <Store size={12} /> : <User size={12} />}
                                <span>{senderName}</span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-2 ${isOwn || isFromShop ? 'opacity-60' : 'text-gray-400'}`}>
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                      <Send size={18} />
                      Envoyer
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm text-gray-400 mt-1">ou contactez une boutique depuis sa page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
