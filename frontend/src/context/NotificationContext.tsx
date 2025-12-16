import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated, role, userId } = useAuth();
  const { t } = useTranslation();

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
    if (isAuthenticated && userId) {
      const cleanupListeners: (() => void)[] = [];

      switch (role) {
        case UserRole.BUYER:
          console.log('Setting up BUYER notifications for user:', userId);
          const handleOrderPlaced = (data: any) => {
            console.log('BUYER received orderPlaced:', data);
            const message = data.message || 'Your order has been placed successfully!';
            toast.success(message);
            addNotification({ type: 'success', title: '✅ Order Placed Successfully', message, data });
          };
          const handleOrderUpdate = (data: any) => {
            console.log('BUYER received orderUpdate:', data);
            const message = data.message || t('order_update_notification', { orderId: data.orderId.substring(0, 8), status: t('status_' + data.status, data.status) });
            toast.info(message);
            addNotification({ type: 'order', title: '📦 Order Updated', message, data });
          };
          const handleOrderShipped = (data: any) => {
            console.log('BUYER received orderShipped:', data);
            const message = data.message || '📦 Your order has been shipped and is on the way!';
            toast.info(message);
            addNotification({ type: 'delivery', title: '🚚 Order Shipped', message, data });
          };
          const handleOrderDelivered = (data: any) => {
            console.log('BUYER received orderDelivered:', data);
            const message = data.message || '✅ Your order has been delivered!';
            toast.success(message);
            addNotification({ type: 'success', title: '✅ Order Delivered', message, data });
          };
          const handleRiderAssigned = (data: any) => {
            console.log('BUYER received riderAssigned:', data);
            const message = data.message || `Rider ${data.riderName} has been assigned to your delivery`;
            toast.info(message);
            addNotification({ type: 'delivery', title: '🚴 Rider Assigned', message, data });
          };
          const handleDeliveryUpdateBuyer = (data: any) => {
            console.log('BUYER received deliveryUpdate:', data);
            const message = data.message || `Delivery status: ${data.status}`;
            toast.info(message);
            addNotification({ type: 'delivery', title: '📍 Delivery Update', message, data });
          };

          socketService.on('orderPlaced', handleOrderPlaced);
          socketService.on('orderUpdate', handleOrderUpdate);
          socketService.on('orderShipped', handleOrderShipped);
          socketService.on('orderDelivered', handleOrderDelivered);
          socketService.on('riderAssigned', handleRiderAssigned);
          socketService.on('deliveryUpdate', handleDeliveryUpdateBuyer);

          cleanupListeners.push(() => {
            socketService.off('orderPlaced', handleOrderPlaced);
            socketService.off('orderUpdate', handleOrderUpdate);
            socketService.off('orderShipped', handleOrderShipped);
            socketService.off('orderDelivered', handleOrderDelivered);
            socketService.off('riderAssigned', handleRiderAssigned);
            socketService.off('deliveryUpdate', handleDeliveryUpdateBuyer);
          });
          break;

        case UserRole.RIDER:
          console.log('Setting up RIDER notifications for user:', userId);
          const handleDeliveryAssigned = (data: any) => {
            console.log('RIDER received deliveryAssigned:', data);
            const detailedMessage = `🚚 New Delivery Assignment\n📍 Tracking: ${data.trackingNumber || 'N/A'}\n👤 Customer: ${data.buyerName || 'N/A'}\n🕒 ${new Date().toLocaleString()}`.trim();
            toast.info(`🚚 New delivery assigned - ${data.trackingNumber}`, { autoClose: 7000 });
            addNotification({ type: 'delivery', title: '🚚 New Delivery Assigned', message: detailedMessage, data });
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Could not play notification sound'));
          };
          const handleDeliveryUpdateRider = (data: any) => {
            console.log('RIDER received deliveryUpdate:', data);
            const message = data.message || `Delivery ${data.trackingNumber} status: ${data.status}`;
            toast.info(message);
            addNotification({ type: 'delivery', title: '📍 Delivery Status Update', message, data });
          };

          socketService.on('deliveryAssigned', handleDeliveryAssigned);
          socketService.on('deliveryUpdate', handleDeliveryUpdateRider);

          cleanupListeners.push(() => {
            socketService.off('deliveryAssigned', handleDeliveryAssigned);
            socketService.off('deliveryUpdate', handleDeliveryUpdateRider);
          });
          break;

        case UserRole.SELLER:
          console.log('Setting up SELLER notifications for user:', userId);
          const handleNewOrder = (data: any) => {
            console.log('🎉 SELLER received newOrder:', data);
            const itemsList = data.items.map((item: any) => `${item.productName} (x${item.quantity})`).join(', ');
            const detailedMessage = `📦 Order #${data.orderId.toString().substring(0, 8)}\n💰 Total: ${data.totalAmount.toFixed(2)} TZS\n📋 Items: ${itemsList}\n👤 Buyer: ${data.buyerId ? data.buyerId.substring(0, 8) : 'N/A'}\n🕒 ${new Date().toLocaleString()}`.trim();
            toast.success(`🎉 NEW ORDER! Total: ${data.totalAmount.toFixed(2)} TZS`, { autoClose: 10000, position: 'top-center' });
            addNotification({ type: 'order', title: '🎉 New Order Received!', message: detailedMessage, data: { ...data, itemDetails: data.items, orderTime: new Date().toISOString() } });
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Could not play notification sound'));
            window.dispatchEvent(new CustomEvent('newOrderReceived', { detail: data }));
          };

          socketService.on('newOrder', handleNewOrder);
          
          cleanupListeners.push(() => {
            socketService.off('newOrder', handleNewOrder);
          });
          break;
      }
    
      return () => {
        console.log('Cleaning up all notifications.');
        cleanupListeners.forEach(cleanup => cleanup());
      };
    }
  }, [isAuthenticated, userId, role, t, addNotification]);

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
