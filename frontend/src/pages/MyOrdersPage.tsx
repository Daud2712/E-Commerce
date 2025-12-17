import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import * as api from '../services/api';
import { IOrder } from '../types';
import { useTranslation } from 'react-i18next';

const MyOrdersPage: React.FC = () => {
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('failed_to_fetch_orders'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(t('confirm_cancel_order'))) {
      return;
    }

    try {
      await api.cancelOrder(orderId);
      alert(t('order_cancelled_successfully'));
      fetchOrders(); // Refresh orders
    } catch (err: any) {
      alert(err.response?.data?.message || t('failed_to_cancel_order'));
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

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      received: 'success',
    };
    const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return <Badge bg={variants[status] || 'secondary'}>{formattedStatus}</Badge>;
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
          <span className="visually-hidden">{t('loading')}</span>
        </Spinner>
        <p className="mt-2">{t('loading_orders')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">{t('my_orders')}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Alert variant="info">
          <h5>{t('no_orders_yet')}</h5>
          <p>{t('no_orders_message')}</p>
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
                      <small className="font-monospace">{order._id.substring(0, 8)}{t('ellipsis')}</small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items.length} {t('items')}</td>
                    <td>
                      <strong>{t('price_with_currency_display', { amount: order.totalAmount.toFixed(2) })}</strong>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewDetails(order)}
                      >
                        {t('view')}
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          {t('cancel')}
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
          <Modal.Title>{t('order_details') || 'Order Details'}</Modal.Title>
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
                <strong>{t('order_id')}:</strong> {selectedOrder._id}
              </div>
              <div className="mb-3">
                <strong>{t('date')}:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
              <div className="mb-3">
                <strong>{t('status')}:</strong> {getStatusBadge(selectedOrder.status)}
              </div>

              <h5 className="mt-4">{t('shipping_address')}</h5>
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

              <h5 className="mt-4">{t('order_items')}</h5>
              <Table>
                <thead>
                  <tr>
                    <th>{t('product')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('price')}</th>
                    <th>{t('subtotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{t('price_with_currency_display', { amount: item.price.toFixed(2) })}</td>
                      <td>{t('price_with_currency_display', { amount: (item.price * item.quantity).toFixed(2) })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end">
                <h5>{t('total')}{t('colon_separator')} {t('price_with_currency_display', { amount: selectedOrder.totalAmount.toFixed(2) })}</h5>
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
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyOrdersPage;
