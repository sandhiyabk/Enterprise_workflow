import React, { useState, useEffect, useRef } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { Bell, X } from 'lucide-react';

interface NotificationPanelProps {
  userId: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications(userId);
        setNotifications(data);
        // For simplicity, we consider all fetched as unread if they were just loaded
        // In a real app, you'd have a 'read' status in DB
        setUnreadCount(data.length > 0 ? 1 : 0); 
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    // Socket connection
    notificationService.connectSocket(userId, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      notificationService.disconnectSocket();
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={togglePanel}
        className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white relative"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold text-center leading-4 border-2 border-gray-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5 max-h-[400px] overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-gray-50 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-100 transition-colors"
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
