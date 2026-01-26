import React, { useState } from 'react'
import { MessageSquare, Send, Search } from 'lucide-react'
import { useConversations, useConversation } from '../../../hooks/useMessages'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const MessagesPage: React.FC = () => {
  const { conversations, isLoading } = useConversations()
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  
  const { messages, sendMessage, isLoading: messagesLoading } = useConversation(
    selectedConversationId || 0
  )

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversationId) return

    const conversation = conversations.find(c => c.id === selectedConversationId)
    if (!conversation) return

    await sendMessage({
      receiver_id: conversation.other_user.id,
      content: messageText,
    })
    setMessageText('')
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
        <p className="text-gray-600 mt-1">Communiquez avec les vendeurs</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Liste des conversations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">Aucune conversation</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                      selectedConversationId === conversation.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {conversation.other_user.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.other_user.full_name}
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
                ))
              )}
            </div>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      {selectedConversation.other_user.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.other_user.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">@{selectedConversation.other_user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.sender.id !== selectedConversation.other_user.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-green-100' : 'text-gray-500'
                              }`}
                            >
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
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={20} />
                      Envoyer
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                  <p>Sélectionnez une conversation pour commencer</p>
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
