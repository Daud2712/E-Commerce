import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Button, ButtonGroup, Form, Badge } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User, DeliveryAddress, IOrder } from '../types';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';

// Removed: import TrackingPage from './TrackingPage';

const RiderDashboard = () => {
  const { user } = useAuth(); // Get the current user from AuthContext
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // General error for deliveries
  const [updateError, setUpdateError] = useState(''); // Error for delivery status updates
  const [updatingId, setUpdatingId] = useState<string | null>(null); // To track which delivery is being updated

  const [isRiderAvailable, setIsRiderAvailable] = useState<boolean | null>(null); // State for rider's availability
  const [availabilityLoading, setAvailabilityLoading] = useState(false); // Loading state for availability update
  const [availabilityError, setAvailabilityError] = useState(''); // Error for availability update

  // Removed: const [activeTab, setActiveTab] = useState('myDeliveries');

  console.log('RiderDashboard: user', user);
  console.log('RiderDashboard: isRiderAvailable', isRiderAvailable);
  console.log('RiderDashboard: availabilityLoading', availabilityLoading);
  console.log('RiderDashboard: availabilityError', availabilityError);

  const fetchRiderAvailability = async () => {
    if (!user?._id) return;
    setAvailabilityLoading(true);
    try {
      const response = await api.getUserProfile(user._id);
      setIsRiderAvailable(response.data.isAvailable);
    } catch (err: any) {
      console.error('Failed to fetch rider availability:', err);
      setAvailabilityError(err.response?.data?.message || 'Failed to fetch rider availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) { // Reverted dependency
        fetchRiderAvailability();
    }
  }, [user?._id]); // Reverted dependency

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('[RiderDashboard] Fetching rider deliveries...');
      const { data } = await api.getRiderDeliveries();
      console.log('[RiderDashboard] Received deliveries:', data);
      console.log('[RiderDashboard] Number of deliveries:', data.length);
      setDeliveries(data);
    } catch (err: any) { // Type assertion for error handling
      console.error('[RiderDashboard] Error fetching deliveries:', err);
      setError(err.response?.data?.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
        fetchDeliveries();
    }
  }, [user?._id]);

  // Listen for delivery notifications to refresh the list
  useEffect(() => {
    const handleDeliveryAssigned = () => {
      console.log('[RiderDashboard] Received deliveryAssigned event, refreshing deliveries');
      fetchDeliveries();
    };

    const handleDeliveryUpdate = () => {
      console.log('[RiderDashboard] Received deliveryUpdate event, refreshing deliveries');
      fetchDeliveries();
    };

    socketService.on('deliveryAssigned', handleDeliveryAssigned);
    socketService.on('deliveryUpdate', handleDeliveryUpdate);

    return () => {
      socketService.off('deliveryAssigned', handleDeliveryAssigned);
      socketService.off('deliveryUpdate', handleDeliveryUpdate);
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: Delivery['status']) => {
    setUpdatingId(id); // Set updating ID
    setUpdateError(''); // Clear previous update errors
    try {
      await api.updateDeliveryStatus(id, status);
      fetchDeliveries(); // Refresh the list
    } catch (err: any) { // Type assertion for error handling
      setUpdateError(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setUpdatingId(null); // Clear updating ID
    }
  };

  const handleAcceptDelivery = async (id: string) => {
    setUpdatingId(id);
    setUpdateError('');
    try {
      await api.acceptDelivery(id);
      fetchDeliveries(); // Refresh the list
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectDelivery = async (id: string) => {
    if (window.confirm('Are you sure you want to reject this delivery?')) {
      setUpdatingId(id);
      setUpdateError('');
      try {
        await api.rejectDelivery(id);
        fetchDeliveries(); // Refresh the list
          } catch (err: any) {
            setUpdateError(err.response?.data?.message || 'Failed to reject delivery');      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleMarkPaymentPaid = async (delivery: Delivery) => {
    if (!delivery.order) {
      setUpdateError('Order information not available.');
      return;
    }

    const orderId = typeof delivery.order === 'string' ? delivery.order : delivery.order._id;
    
    if (window.confirm('Mark payment as received from buyer?')) {
      setUpdatingId(delivery._id);
      setUpdateError('');
      try {
        await api.updatePaymentStatus(orderId, 'paid');
        alert('Payment marked as paid successfully!');
        fetchDeliveries(); // Refresh the list
      } catch (err: any) {
        setUpdateError(err.response?.data?.message || 'Failed to update payment status.');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleRiderAvailabilityToggle = async () => {
    if (isRiderAvailable === null) return; // Don't toggle if initial status isn't loaded
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const newAvailability = !isRiderAvailable;
      await api.updateRiderAvailability(newAvailability);
      setIsRiderAvailable(newAvailability);
    } catch (err: any) {
      console.error('Failed to update rider availability:', err);
      setAvailabilityError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const formatAddress = (address?: DeliveryAddress) => {
    if (!address) return 'No address provided';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);

    if (parts.length === 0) return 'No address provided';

    return (
      <div>
        <div><strong>{parts.join(', ')}</strong></div>
        {address.phone && <div><small>📞 {address.phone}</small></div>}
        {address.additionalInfo && <div><small>ℹ️ {address.additionalInfo}</small></div>}
      </div>
    );
  };

  return (
    <Container>
      <h2>Rider Dashboard</h2>
      <hr />
      {/* Removed Tabs and Tab components */}
      <div className="mb-3">
          <h4>Your Availability</h4>
          {!user?._id && <Alert variant="warning">User information not available</Alert>}
          {availabilityLoading && <Spinner animation="border" size="sm" />}
          {availabilityError && <Alert variant="danger">{availabilityError}</Alert>}
          {isRiderAvailable !== null ? (
          <Form>
              <Form.Check
              type="switch"
              id="rider-availability-switch"
              label={isRiderAvailable ? 'Available' : 'Busy'}
              checked={isRiderAvailable}
              onChange={handleRiderAvailabilityToggle}
              disabled={availabilityLoading}
              />
          </Form>
          ) : (
          <p>Loading availability...</p>
          )}
      </div>

      <hr />

      <h4>Your Assigned Deliveries</h4>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {updateError && <Alert variant="danger">{updateError}</Alert>} {/* Display update error */}
      {!loading && !error && (
          <Table striped bordered hover responsive>
          <thead>
              <tr>
              <th>Tracking Number</th>
              <th>Buyer</th>
              <th>Parcel</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Destination</th>
              <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              {deliveries.map((delivery) => (
              <tr key={delivery._id}>
                  <td>{delivery.trackingNumber}</td>
                  <td>
                    <div>
                      <strong>{delivery.buyer?.name || 'N/A'}</strong>
                    </div>
                    {delivery.buyer?.email && (
                      <small className="text-muted">{delivery.buyer.email}</small>
                    )}
                  </td>
                  <td>{delivery.packageName}</td>
                  <td>
                    {(() => {
                      // Show only pending, in_transit, or delivered
                      let displayStatus = 'pending';
                      let variant = 'warning';
                      
                      if (delivery.status === 'in_transit') {
                        displayStatus = 'in_transit';
                        variant = 'primary';
                      } else if (delivery.status === 'delivered' || delivery.status === 'received') {
                        displayStatus = 'delivered';
                        variant = 'success';
                      }
                      
                      return (
                        <Badge bg={variant}>
                          {displayStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td>
                    {typeof delivery.order === 'object' && delivery.order?.paymentStatus ? (
                      <Badge bg={
                        delivery.order.paymentStatus === 'paid' ? 'success' :
                        delivery.order.paymentStatus === 'failed' ? 'danger' :
                        'warning'
                      }>
                        {delivery.order.paymentStatus.replace(/\w/g, l => l.toUpperCase())}
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>{formatAddress(delivery.buyer?.deliveryAddress)}</td>
                  <td>
                  {delivery.riderAccepted === null ? (
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="success"
                        disabled={updatingId === delivery._id}
                        onClick={() => handleAcceptDelivery(delivery._id)}
                      >
                        {updatingId === delivery._id ? 'Processing...' : 'Accept'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={updatingId === delivery._id}
                        onClick={() => handleRejectDelivery(delivery._id)}
                      >
                        {updatingId === delivery._id ? 'Processing...' : 'Reject'}
                      </Button>
                    </ButtonGroup>
                  ) : delivery.riderAccepted === true ? (
                    <div>
                      <ButtonGroup className="mb-2">
                        <Button
                          size="sm"
                          variant="info"
                          disabled={delivery.status === 'in_transit' || updatingId === delivery._id}
                          onClick={() => handleStatusUpdate(delivery._id, 'in_transit')}
                        >
                          {updatingId === delivery._id ? 'Updating...' : 'In Transit'}
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          disabled={delivery.status === 'delivered' || updatingId === delivery._id}
                          onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                        >
                          {updatingId === delivery._id ? 'Updating...' : 'Delivered'}
                        </Button>
                      </ButtonGroup>
                      {(delivery.status === 'delivered' || delivery.status === 'received') && 
                       typeof delivery.order === 'object' && 
                       delivery.order?.paymentStatus === 'pending' && 
                       delivery.order?.paymentMethod === 'cash' && (
                        <div>
                          <Button
                            size="sm"
                            variant="warning"
                            disabled={updatingId === delivery._id}
                            onClick={() => handleMarkPaymentPaid(delivery)}
                          >
                            💰 Mark Paid
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted">N/A</span>
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

export default RiderDashboard;