import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Dropdown, Badge } from 'react-bootstrap';
import * as api from '../services/api';
import { IOrder, User } from '../types';
import { useTranslation } from 'react-i18next';

const ParcelManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [riders, setRiders] = useState<User[]>([]);
    const [riderListError, setRiderListError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.getAllOrders();
            setOrders(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch orders.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRiders = async () => {
        try {
            const { data } = await api.getAvailableRiders();
            setRiders(data);
            setRiderListError('');
        } catch (err: any) {
            console.error("Could not fetch riders:", err);
            setRiderListError(err.response?.data?.message || 'Failed to fetch riders.');
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchRiders();
    }, []);

    const handleAssignRider = async (orderId: string, riderId: string) => {
        try {
            await api.updateOrderStatus(orderId, { status: 'processing', assignedRider: riderId });
            setSuccessMessage('Rider assigned successfully!');
            fetchOrders();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to assign rider.');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.updateOrderStatus(orderId, { status });
            setSuccessMessage(`Order status updated to ${status}!`);
            fetchOrders();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update order status.');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: string } = {
            pending: 'warning',
            processing: 'info',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'danger',
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const getPaymentBadge = (status: string) => {
        const variants: { [key: string]: string } = {
            pending: 'warning',
            paid: 'success',
            failed: 'danger',
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <Container>
            <h3>{t('my_deliveries')}</h3>
            <p className="text-muted">
                View and manage orders from your products. Assign riders to deliver orders to customers.
            </p>

            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            {riderListError && <Alert variant="warning">{riderListError}</Alert>}

            {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                </div>
            )}

            {!loading && orders.length === 0 && (
                <Alert variant="info">
                    No orders yet. Orders from buyers will appear here.
                </Alert>
            )}

            {!loading && orders.length > 0 && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Buyer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Shipping Address</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>
                                    <small className="text-muted">
                                        #{order._id?.slice(-8)}
                                    </small>
                                </td>
                                <td>
                                    <div>
                                        <strong>{(order.buyer as any)?.name || 'N/A'}</strong>
                                    </div>
                                    <small className="text-muted">
                                        {(order.buyer as any)?.email || ''}
                                    </small>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.85em' }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="mb-1">
                                                • {item.productName} x {item.quantity}
                                                <br />
                                                <small className="text-muted">
                                                    KSh {item.price.toFixed(2)} each
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <strong>KSh {order.totalAmount.toFixed(2)}</strong>
                                </td>
                                <td>
                                    {order.shippingAddress?.street ? (
                                        <div style={{ fontSize: '0.85em' }}>
                                            <div>{order.shippingAddress.street}</div>
                                            <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                                            {order.shippingAddress.postalCode && (
                                                <div>{order.shippingAddress.postalCode}</div>
                                            )}
                                            {order.shippingAddress.phone && (
                                                <div><small>📞 {order.shippingAddress.phone}</small></div>
                                            )}
                                        </div>
                                    ) : (
                                        <small className="text-muted">No address provided</small>
                                    )}
                                </td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td>
                                    {order.status === 'pending' && (
                                        <Dropdown>
                                            <Dropdown.Toggle variant="primary" size="sm">
                                                Assign Rider
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {riders.filter(r => r.isAvailable).length === 0 && (
                                                    <Dropdown.Item disabled>
                                                        No available riders
                                                    </Dropdown.Item>
                                                )}
                                                {riders.filter(r => r.isAvailable).map(rider => (
                                                    <Dropdown.Item
                                                        key={rider._id}
                                                        onClick={() => handleAssignRider(order._id!, rider._id)}
                                                    >
                                                        {rider.name} (Available)
                                                    </Dropdown.Item>
                                                ))}
                                                {riders.filter(r => !r.isAvailable).map(rider => (
                                                    <Dropdown.Item key={rider._id} disabled>
                                                        {rider.name} (Busy)
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}

                                    {order.status === 'processing' && (
                                        <Dropdown>
                                            <Dropdown.Toggle variant="info" size="sm">
                                                Update Status
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleUpdateOrderStatus(order._id!, 'shipped')}>
                                                    Mark as Shipped
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleUpdateOrderStatus(order._id!, 'delivered')}>
                                                    Mark as Delivered
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}

                                    {order.status === 'shipped' && (
                                        <Dropdown>
                                            <Dropdown.Toggle variant="info" size="sm">
                                                Update Status
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleUpdateOrderStatus(order._id!, 'delivered')}>
                                                    Mark as Delivered
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}

                                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                                        <small className="text-muted">
                                            {order.status === 'delivered' ? '✓ Completed' : 'Cancelled'}
                                        </small>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ParcelManagementPage;
