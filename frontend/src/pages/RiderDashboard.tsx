import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Button, ButtonGroup, Form, Badge } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User, DeliveryAddress } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation
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
  const { t } = useTranslation(); // Initialize useTranslation

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
      setAvailabilityError(err.response?.data?.message || t('rider_fetch_availability_error'));
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
      setError(err.response?.data?.message || t('rider_fetch_deliveries_error'));
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
      setUpdateError(err.response?.data?.message || t('rider_update_status_error'));
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
      setUpdateError(err.response?.data?.message || t('failed_to_accept_delivery'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectDelivery = async (id: string) => {
    if (window.confirm(t('confirm_reject_delivery'))) {
      setUpdatingId(id);
      setUpdateError('');
      try {
        await api.rejectDelivery(id);
        fetchDeliveries(); // Refresh the list
          } catch (err: any) {
            setUpdateError(err.response?.data?.message || t('failed_to_reject_delivery'));      } finally {
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
      setAvailabilityError(err.response?.data?.message || t('rider_update_availability_error'));
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const formatAddress = (address?: DeliveryAddress) => {
    if (!address) return t('no_address_provided');
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);

    if (parts.length === 0) return t('no_address_provided');

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
      <h2>{t('rider_dashboard_title')}</h2>
      <hr />
      {/* Removed Tabs and Tab components */}
      <div className="mb-3">
          <h4>{t('your_availability_title')}</h4>
          {!user?._id && <Alert variant="warning">{t('rider_user_info_not_available')}</Alert>}
          {availabilityLoading && <Spinner animation="border" size="sm" />}
          {availabilityError && <Alert variant="danger">{availabilityError}</Alert>}
          {isRiderAvailable !== null ? (
          <Form>
              <Form.Check
              type="switch"
              id="rider-availability-switch"
              label={isRiderAvailable ? t('rider_status_free') : t('rider_status_busy')}
              checked={isRiderAvailable}
              onChange={handleRiderAvailabilityToggle}
              disabled={availabilityLoading}
              />
          </Form>
          ) : (
          <p>{t('rider_loading_availability')}</p>
          )}
      </div>

      <hr />

      <h4>{t('your_assigned_deliveries_title')}</h4>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {updateError && <Alert variant="danger">{updateError}</Alert>} {/* Display update error */}
      {!loading && !error && (
          <Table striped bordered hover responsive>
          <thead>
              <tr>
              <th>{t('tracking_number_header')}</th>
              <th>{t('parcel_header')}</th>
              <th>{t('status_header')}</th>
              <th>{t('acceptance_status_header')}</th>
              <th>{t('destination_header')}</th>
              <th>{t('actions_header')}</th>
              </tr>
          </thead>
          <tbody>
              {deliveries.map((delivery) => (
              <tr key={delivery._id}>
                  <td>{delivery.trackingNumber}</td>
                  <td>{delivery.packageName}</td>
                  <td>
                    <Badge bg={
                      delivery.status === 'received' ? 'success' :
                      delivery.status === 'delivered' ? 'info' :
                      delivery.status === 'in_transit' ? 'warning' :
                      delivery.status === 'assigned' ? 'primary' :
                      'secondary'
                    }>
                      {delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </td>
                  <td>
                    {delivery.riderAccepted === null && (
                      <Badge bg="warning">{t('status_pending_response')}</Badge>
                    )}
                    {delivery.riderAccepted === true && (
                      <Badge bg="success">{t('status_accepted')}</Badge>
                    )}
                    {delivery.riderAccepted === false && (
                      <Badge bg="danger">{t('status_rejected')}</Badge>
                    )}
                    {delivery.riderAccepted === undefined && (
                      <span className="text-muted">{t('not_applicable_dash')}</span>
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
                        {updatingId === delivery._id ? t('processing_button') : t('accept_button')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={updatingId === delivery._id}
                        onClick={() => handleRejectDelivery(delivery._id)}
                      >
                        {updatingId === delivery._id ? t('processing_button') : t('reject_button')}
                      </Button>
                    </ButtonGroup>
                  ) : delivery.riderAccepted === true ? (
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="info"
                        disabled={delivery.status === 'in_transit' || updatingId === delivery._id}
                        onClick={() => handleStatusUpdate(delivery._id, 'in_transit')}
                      >
                        {updatingId === delivery._id ? t('updating_button') : t('in_transit_button')}
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        disabled={delivery.status === 'delivered' || updatingId === delivery._id}
                        onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                      >
                        {updatingId === delivery._id ? t('updating_button') : t('delivered_button')}
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <span className="text-muted">{t('not_applicable_dash')}</span>
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