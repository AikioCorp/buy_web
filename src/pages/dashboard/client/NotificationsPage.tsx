import React from 'react'
import { Bell, Check, Trash2, Package, MessageSquare, Tag, AlertCircle } from 'lucide-react'
import { useNotifications } from '../../../hooks/useNotifications'

const NotificationsPage: React.FC = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="text-blue-600" />
      case 'message':
        return <MessageSquare className="text-green-600" />
      case 'promotion':
        return <Tag className="text-purple-600" />
      case 'system':
        return <AlertCircle className="text-orange-600" />
      default:
        return <Bell className="text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50'
      case 'message':
        return 'bg-green-50'
      case 'promotion':
        return 'bg-purple-50'
      case 'system':
        return 'bg-orange-50'
      default:
        return 'bg-gray-50'
    }
  }

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      await deleteNotification(id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `Il y a ${diffInMinutes} min`
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays}j`
    }
  }

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-green-600" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes vos notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Check size={20} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-600">Vous n'avez pas encore de notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 ${!notification.is_read ? 'border-l-4 border-green-600' : ''
                }`}
            >
              <div className={`p-3 rounded-lg ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className={`text-sm ${!notification.is_read ? 'text-gray-700' : 'text-gray-600'}`}>
                  {notification.content}
                </p>

                <div className="flex gap-2 mt-3">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 flex items-center gap-1"
                    >
                      <Check size={14} />
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
