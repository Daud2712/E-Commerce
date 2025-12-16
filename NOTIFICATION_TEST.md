# Notification System Testing Guide - UPDATED

## Recent Changes (December 16, 2025)

✅ Added backend console logging to track socket emissions
✅ Added seller order list auto-refresh when new orders arrive
✅ Added debugging to identify which rooms receive which events
✅ Backend server restarted with new debugging features

## Backend Console Logs to Monitor

When testing, watch the **backend terminal** for these logs:

```
[ORDER] Created order: <orderId> | Buyer: <buyerId> | Sellers: [<sellerId1>, <sellerId2>]
[ORDER] Notifying seller: <sellerId> about new order
[SOCKET] Emitting 'newOrder' to seller room: seller-<sellerId>
[ORDER] Notifying buyer: <buyerId> about order placed
[SOCKET] Emitting 'orderPlaced' to user room: user-<buyerId>
```

## Testing Steps (CRITICAL)

### Step 1: Check Backend Console
1. Open the backend terminal where `npm run dev` is running
2. You should see: `Server is running on port 5002`
3. Keep this terminal visible to monitor socket emissions

### Step 2: Test Buyer Login
1. Open browser (Chrome/Edge recommended)
2. Press `F12` → Console tab
3. Login as BUYER
4. Check console for:
   ```
   User <buyerId> with role buyer connecting to socket room.
   Socket connected: <socketId>
   Setting up BUYER notifications for user: <buyerId>
   ```

### Step 3: Test Seller Login
1. Open **ANOTHER browser window** (or incognito/private mode)
2. Press `F12` → Console tab
3. Login as SELLER
4. Check console for:
   ```
   User <sellerId> with role seller connecting to socket room.
   Socket connected: <socketId>
   Setting up SELLER notifications for user: <sellerId>
   ```
5. Navigate to **Parcel Management** page (seller's orders page)

### Step 4: Place Order as Buyer
1. Go back to BUYER window
2. Add seller's products to cart
3. Go to checkout and place order
4. **IMMEDIATELY check BOTH windows:**

#### Buyer Window Console Should Show:
```
BUYER received orderPlaced: {orderId: "...", totalAmount: ..., ...}
```

#### Seller Window Console Should Show:
```
🎉 SELLER received newOrder: {orderId: "...", buyerId: "...", totalAmount: ..., items: [...]}
[ParcelManagement] New order received, refreshing orders list...
```

#### Backend Terminal Should Show:
```
[ORDER] Created order: <orderId> | Buyer: <buyerId> | Sellers: [<sellerId>]
[ORDER] Notifying seller: <sellerId> about new order
[SOCKET] Emitting 'newOrder' to seller room: seller-<sellerId>
[ORDER] Notifying buyer: <buyerId> about order placed
[SOCKET] Emitting 'orderPlaced' to user room: user-<buyerId>
```

### Step 5: Verify Notifications

#### Buyer Should See:
- ✅ Toast: "✅ Order Placed Successfully"
- ✅ Notification bell badge increases
- ✅ Notification dropdown shows "✅ Order Placed Successfully"
- ❌ Should NOT see "🎉 NEW ORDER!" toast

#### Seller Should See:
- ✅ Toast: "🎉 NEW ORDER! Total: XXX TZS" (top-center, 10 seconds)
- ✅ Notification bell badge increases
- ✅ Notification dropdown shows "🎉 New Order Received!"
- ✅ **Orders table auto-refreshes** showing new order
- ❌ Should NOT see "✅ Order Placed Successfully" toast

## Troubleshooting

### Issue: Seller sees buyer's notification ("Order Placed Successfully")

**Diagnosis:**
1. Check seller console - do you see: `BUYER received orderPlaced`?
2. If YES, the seller is receiving BUYER events (wrong!)

**Possible Causes:**
- Seller account has role='buyer' in database
- User logged in as both buyer and seller in same browser
- Multiple tabs with different roles for same user

**Solution:**
1. Logout from all tabs
2. Clear browser cache/cookies
3. Close all browser windows
4. Verify user role in database: `db.users.findOne({email: "seller@example.com"})`
5. Login again in fresh browser window

### Issue: Seller doesn't see notification at all

**Diagnosis:**
1. Check backend console - do you see the `[SOCKET] Emitting 'newOrder'` log?
2. If NO, the seller products aren't being detected

**Possible Causes:**
- Order doesn't contain seller's products
- Product.seller field is null/undefined in database

**Solution:**
1. Check backend logs for: `[ORDER] Created order: ... | Sellers: []`
2. If Sellers array is empty, verify products have seller field:
   ```
   db.products.find({seller: null})
   ```
3. Update products to have correct seller ID

### Issue: Seller notification appears but orders don't refresh

**Diagnosis:**
1. Check seller console for: `[ParcelManagement] New order received, refreshing orders list...`
2. If you see this but table doesn't update, API call is failing

**Solution:**
1. Check Network tab → XHR filter
2. Look for `/api/orders` request
3. Check for errors in response

### Issue: Both buyer and seller see BOTH notifications

**Diagnosis:**
1. Check which console logs appear:
   - Buyer console: `BUYER received orderPlaced` ✅ + `SELLER received newOrder` ❌
   - Seller console: `SELLER received newOrder` ✅ + `BUYER received orderPlaced` ❌

**Possible Causes:**
- User has multiple roles assigned
- Socket joining multiple rooms
- Backend emitting to wrong rooms

**Solution:**
1. Check backend logs - verify only ONE emit per role:
   ```
   [SOCKET] Emitting 'newOrder' to seller room: seller-<ID>    (for seller only)
   [SOCKET] Emitting 'orderPlaced' to user room: user-<ID>    (for buyer only)
   ```
2. If you see both for same user, check user's role assignment
3. Verify socket joining in backend logs:
   ```
   Seller <sellerId> joined their room    (for seller)
   User <buyerId> joined their room       (for buyer)
   ```

## WebSocket Inspection (Advanced)

1. Open DevTools → Network tab
2. Filter: `WS` (WebSocket)
3. Click the socket.io connection
4. View **Messages** tab
5. Look for actual socket events:

**Buyer should receive:**
```
42["orderPlaced",{"orderId":"...","totalAmount":...}]
```

**Seller should receive:**
```
42["newOrder",{"orderId":"...","buyerId":"...","items":[...]}]
```

## Success Criteria

✅ Buyer receives `orderPlaced` event only
✅ Seller receives `newOrder` event only  
✅ Each role sees appropriate toast notification
✅ Notification bell badge updates correctly
✅ Notification dropdown shows role-specific messages
✅ Seller's orders table auto-refreshes
✅ Backend logs show correct room emissions
✅ No cross-contamination of notifications

## Quick Test Script

**Run this in order:**
1. ✅ Backend running on port 5002
2. ✅ Frontend running on localhost:5173
3. ✅ Login as SELLER in Window 1 → Open Console → Go to Parcel Management
4. ✅ Login as BUYER in Window 2 (incognito) → Open Console
5. ✅ BUYER: Add seller's product to cart → Checkout
6. ✅ Watch BOTH consoles simultaneously
7. ✅ Check backend terminal for socket emission logs
8. ✅ Verify seller's orders table refreshes automatically

**Expected Results:**
- Buyer console: `BUYER received orderPlaced`
- Seller console: `🎉 SELLER received newOrder` + `[ParcelManagement] New order received`
- Backend: Two separate socket emissions to different rooms
- Seller sees new order in table WITHOUT manual refresh
