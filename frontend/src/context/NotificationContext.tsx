import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';
import { UserRole } from '../types';
import { toast } from 'react-toastify';

export interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Load notifications from localStorage on init
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const { isAuthenticated, role, userId } = useAuth();

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId || !role) {
      return;
    }

    console.log(`[NOTIFICATION SETUP] User: ${userId}, Role: ${role}`);

    // BUYER notifications - ONLY listen to buyer events
    if (role === UserRole.BUYER) {
      console.log('[BUYER] Setting up buyer-only event listeners');
      
      const handleOrderPlaced = (data: any) => {
        console.log(`[BUYER ${userId}] Received orderPlaced:`, data);
        if (data.buyerId !== userId) {
          console.log(`[BUYER ${userId}] IGNORING - not my order (buyerId: ${data.buyerId})`);
          return;
        }
        
        console.log(`[BUYER ${userId}] Processing MY order notification`);
        const message = data.message || 'Your order has been placed successfully!';
        toast.success(message);
        addNotification({ 
          type: 'success', 
          title: 'Order Placed', 
          message 
        });
      };

      const handleOrderUpdate = (data: any) => {
        if (data.buyerId !== userId) return;
        
        const message = data.message || `Order #${data.orderId.substring(0, 8)} status: ${data.status}`;
        toast.info(message);
        addNotification({ 
          type: 'info', 
          title: 'Order Updated', 
          message 
        });
      };

      socketService.on('orderPlaced', handleOrderPlaced);
      socketService.on('orderUpdate', handleOrderUpdate);

      return () => {
        console.log(`[BUYER ${userId}] Cleaning up event listeners`);
        socketService.off('orderPlaced', handleOrderPlaced);
        socketService.off('orderUpdate', handleOrderUpdate);
      };
    }

    // SELLER notifications - ONLY listen to seller events
    if (role === UserRole.SELLER) {
      console.log('[SELLER] Setting up seller-only event listeners');
      
      const handleNewOrder = (data: any) => {
        console.log(`[SELLER ${userId}] Received newOrder:`, data);
        const message = `New order! Total: ${data.totalAmount.toFixed(2)} TZS`;
        toast.success(message);
        addNotification({ 
          type: 'order', 
          title: 'New Order Received', 
          message 
        });
        
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
        
        window.dispatchEvent(new CustomEvent('newOrderReceived', { detail: data }));
      };

      socketService.on('newOrder', handleNewOrder);

      return () => {
        console.log(`[SELLER ${userId}] Cleaning up event listeners`);
        socketService.off('newOrder', handleNewOrder);
      };
    }

    // RIDER notifications - ONLY listen to rider events
    if (role === UserRole.RIDER) {
      console.log(`[RIDER ${userId}] Setting up rider-only event listeners`);
      
      const handleDeliveryAssigned = (data: any) => {
        console.log(`[RIDER ${userId}] Received deliveryAssigned:`, data);
        const message = `New delivery assigned: ${data.trackingNumber || 'N/A'}`;
        toast.info(message);
        addNotification({ 
          type: 'delivery', 
          title: 'Delivery Assigned', 
          message 
        });
        
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
        
        // Dispatch event to refresh delivery list
        window.dispatchEvent(new CustomEvent('deliveryAssigned', { detail: data }));
      };

      socketService.on('deliveryAssigned', handleDeliveryAssigned);

      return () => {
        console.log(`[RIDER ${userId}] Cleaning up event listeners`);
        socketService.off('deliveryAssigned', handleDeliveryAssigned);
      };
    }
  }, [isAuthenticated, userId, role, addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
