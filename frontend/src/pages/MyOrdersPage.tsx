import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import * as api from '../services/api';
import { IOrder } from '../types';
const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.getBuyerOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.cancelOrder(orderId);
      alert('Order cancelled successfully');
      fetchOrders(); // Refresh orders
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to confirm receipt of this order?')) {
      return;
    }

    try {
      await api.confirmReceipt(orderId);
      alert('Order receipt confirmed successfully!');
      fetchOrders(); // Refresh orders
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm receipt.');
    }
  };

  const handleViewDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (order: IOrder) => {
    const variants: { [key: string]: string } = {
      pending: 'warning',
      assigned: 'info',
      in_transit: 'primary',
      delivered: 'success',
    };
    
    // Determine display status: pending, assigned to rider, in_transit, or delivered only
    let displayStatus = 'pending';
    let displayText = 'Pending';
    
    if (order.hasDelivery) {
      if (order.deliveryStatus === 'in_transit') {
        displayStatus = 'in_transit';
        displayText = 'In Transit';
      } else if (order.deliveryStatus === 'delivered' || order.deliveryStatus === 'received' || order.status === 'received') {
        displayStatus = 'delivered';
        displayText = 'Delivered';
      } else if (order.deliveryStatus === 'assigned' || order.status === 'processing') {
        displayStatus = 'assigned';
        displayText = 'Assigned To Rider';
      }
    } else if (order.status === 'delivered' || order.status === 'received' || order.status === 'shipped') {
      displayStatus = 'delivered';
      displayText = 'Delivered';
    } else if (order.status === 'processing') {
      displayStatus = 'assigned';
      displayText = 'Assigned To Rider';
    }
    
    return <Badge bg={variants[displayStatus] || 'secondary'}>{displayText}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: 'warning',
      paid: 'success',
      failed: 'danger',
    };
    const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return <Badge bg={variants[status] || 'secondary'}>{formattedStatus}</Badge>;
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading orders...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">My Orders</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Alert variant="info">
          <h5>No Orders Yet</h5>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <small className="font-monospace">{order._id.substring(0, 8)}...</small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items.length} items</td>
                    <td>
                      <strong>TZS {order.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td>{getStatusBadge(order)}</td>
                    <td>{getPaymentStatusBadge(order.paymentStatus || 'pending')}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewDetails(order)}
                      >
                        View
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleConfirmReceipt(order._id)}
                          className="d-flex align-items-center gap-1"
                        >
                          <span>✓</span> Confirm Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              {selectedOrder.status === 'delivered' && (
                <Alert variant="success">
                  <strong>📦 Order Delivered!</strong>
                  <p className="mb-0">
                    Please confirm that you have received this order by clicking the "Confirm Receipt" button below.
                  </p>
                </Alert>
              )}
              
              <div className="mb-3">
                <strong>Order ID:</strong> {selectedOrder._id}
              </div>
              <div className="mb-3">
                <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
              <div className="mb-3">
                <strong>Status:</strong> {getStatusBadge(selectedOrder)}
              </div>

              <h5 className="mt-4">Shipping Address</h5>
              <p>
                {selectedOrder.shippingAddress.street && `${selectedOrder.shippingAddress.street}, `}
                {selectedOrder.shippingAddress.city && `${selectedOrder.shippingAddress.city}, `}
                {selectedOrder.shippingAddress.state && `${selectedOrder.shippingAddress.state} `}
                {selectedOrder.shippingAddress.postalCode && `${selectedOrder.shippingAddress.postalCode}, `}
                {selectedOrder.shippingAddress.country}
                <br />
                {selectedOrder.shippingAddress.phone && (
                  <>
                    <strong>Phone:</strong> {selectedOrder.shippingAddress.phone}
                  </>
                )}
              </p>

              <h5 className="mt-4">Order Items</h5>
              <Table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>TZS {item.price.toFixed(2)}</td>
                      <td>TZS {(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end">
                <h5>Total: TZS {selectedOrder.totalAmount.toFixed(2)}</h5>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && selectedOrder.status === 'delivered' && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowModal(false);
                handleConfirmReceipt(selectedOrder._id);
              }}
            >
              ✓ Confirm Receipt
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyOrdersPage;
