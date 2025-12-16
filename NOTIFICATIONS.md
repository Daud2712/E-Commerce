# Freshedtz Notification System

## Overview
The application now has a comprehensive real-time notification system using Socket.IO that keeps buyers, sellers, and riders informed about order and delivery updates.

## Notification Events

### For Buyers 🛒
1. **Order Placed** (`orderPlaced`)
   - Triggered when: Buyer successfully places an order
   - Message: "Your order has been placed successfully!"
   - Toast Type: Success (green)

2. **Order Update** (`orderUpdate`)
   - Triggered when: Seller updates order status
   - Message: "Order [ID] has been updated to [status]"
   - Toast Type: Info (blue)

3. **Order Shipped** (`orderShipped`)
   - Triggered when: Order status changes to "shipped"
   - Message: "📦 Your order has been shipped and is on the way!"
   - Toast Type: Info (blue)

4. **Order Delivered** (`orderDelivered`)
   - Triggered when: Order status changes to "delivered"
   - Message: "✅ Your order has been delivered!"
   - Toast Type: Success (green)

5. **Rider Assigned** (`riderAssigned`)
   - Triggered when: A rider is assigned to deliver their parcel
   - Message: "Rider [Name] has been assigned to your delivery"
   - Toast Type: Info (blue)

6. **Delivery Update** (`deliveryUpdate`)
   - Triggered when: Delivery status changes (in_transit, delivered, etc.)
   - Message: Custom message based on status
   - Toast Type: Info (blue)

### For Sellers 🏪
1. **New Order** (`newOrder`)
   - Triggered when: A buyer places an order containing their products
   - Message: "🎉 New order received! Order #[ID] - Total: [Amount]"
   - Toast Type: Success (green)
   - Includes: Sound notification

### For Riders 🚚
1. **Delivery Assigned** (`deliveryAssigned`)
   - Triggered when: Seller assigns them to a delivery
   - Message: "🚚 New delivery assigned! - Tracking: [Number]"
   - Toast Type: Info (blue)
   - Includes: Sound notification

2. **Delivery Update** (`deliveryUpdate`)
   - Triggered when: Delivery status is updated
   - Message: "Delivery [Tracking] status: [status]"
   - Toast Type: Info (blue)

## Technical Implementation

### Backend
- **Socket Rooms**: Each user type joins specific rooms:
  - Buyers: `user-{userId}`
  - Sellers: `seller-{sellerId}`
  - Riders: `rider-{riderId}`

- **Emit Functions** (`src/utils/socket.ts`):
  ```typescript
  emitToUser(userId, event, data)    // For buyers
  emitToSeller(sellerId, event, data) // For sellers
  emitToRider(riderId, event, data)   // For riders
  ```

### Frontend
- **Socket Service** (`src/services/socket.ts`): Manages WebSocket connections
- **App.tsx**: Sets up notification listeners based on user role
- **Toast Notifications**: Uses `react-toastify` for displaying notifications

## Adding New Notifications

### Backend
```typescript
// In your controller
import { emitToUser, emitToSeller, emitToRider } from '../utils/socket';

// Emit to specific user
emitToUser(userId, 'eventName', {
  message: 'Notification message',
  data: { /* additional data */ },
  timestamp: new Date()
});
```

### Frontend
```typescript
// In App.tsx or specific component
useEffect(() => {
  if (isAuthenticated && userId) {
    const handleEvent = (data: any) => {
      toast.info(data.message);
    };

    socketService.on('eventName', handleEvent);

    return () => {
      socketService.off('eventName', handleEvent);
    };
  }
}, [isAuthenticated, userId]);
```

## Notification Sound
- Location: `/public/notification.mp3`
- Currently: Placeholder file
- To enable: Replace with actual MP3 audio file
- Used for: High-priority notifications (new orders, rider assignments)

## Testing Notifications
1. **Login** as different user types in separate browsers
2. **Place Order** as buyer → Seller receives notification
3. **Update Order Status** as seller → Buyer receives notification
4. **Assign Rider** as seller → Both buyer and rider receive notifications
5. **Update Delivery** as rider → Buyer receives notification

## Future Enhancements
- [ ] Notification history/inbox
- [ ] Read/unread status
- [ ] Notification preferences/settings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Push notifications (PWA)
- [ ] Notification badges on navbar
- [ ] Mute/unmute notifications
