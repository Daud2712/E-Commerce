import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Button, ButtonGroup, Form } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Removed: import TrackingPage from './TrackingPage';

const DriverDashboard = () => {
  const { user } = useAuth(); // Get the current user from AuthContext
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // General error for deliveries
  const [updateError, setUpdateError] = useState(''); // Error for delivery status updates
  const [updatingId, setUpdatingId] = useState<string | null>(null); // To track which delivery is being updated

  const [isDriverAvailable, setIsDriverAvailable] = useState<boolean | null>(null); // State for driver's availability
  const [availabilityLoading, setAvailabilityLoading] = useState(false); // Loading state for availability update
  const [availabilityError, setAvailabilityError] = useState(''); // Error for availability update
  const { t } = useTranslation(); // Initialize useTranslation

  // Removed: const [activeTab, setActiveTab] = useState('myDeliveries');

  console.log('DriverDashboard: user', user);
  console.log('DriverDashboard: isDriverAvailable', isDriverAvailable);
  console.log('DriverDashboard: availabilityLoading', availabilityLoading);
  console.log('DriverDashboard: availabilityError', availabilityError);

  const fetchDriverAvailability = async () => {
    if (!user?._id) return;
    setAvailabilityLoading(true);
    try {
      const response = await api.getUserProfile(user._id);
      setIsDriverAvailable(response.data.isAvailable);
    } catch (err: any) {
      console.error('Failed to fetch driver availability:', err);
      setAvailabilityError(err.response?.data?.message || t('driver_fetch_availability_error'));
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) { // Reverted dependency
        fetchDriverAvailability();
    }
  }, [user?._id]); // Reverted dependency

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const { data } = await api.getDeliveries(); // Same API call as seller
      setDeliveries(data);
    } catch (err: any) { // Type assertion for error handling
      setError(err.response?.data?.message || t('driver_fetch_deliveries_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries(); // Reverted dependency
  }, []); // Reverted dependency

  const handleStatusUpdate = async (id: string, status: Delivery['status']) => {
    setUpdatingId(id); // Set updating ID
    setUpdateError(''); // Clear previous update errors
    try {
      await api.updateDeliveryStatus(id, status);
      fetchDeliveries(); // Refresh the list
    } catch (err: any) { // Type assertion for error handling
      setUpdateError(err.response?.data?.message || t('driver_update_status_error'));
    } finally {
      setUpdatingId(null); // Clear updating ID
    }
  };

  const handleDriverAvailabilityToggle = async () => {
    if (isDriverAvailable === null) return; // Don't toggle if initial status isn't loaded
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const newAvailability = !isDriverAvailable;
      await api.updateDriverAvailability(newAvailability);
      setIsDriverAvailable(newAvailability);
    } catch (err: any) {
      console.error('Failed to update driver availability:', err);
      setAvailabilityError(err.response?.data?.message || t('driver_update_availability_error'));
    } finally {
      setAvailabilityLoading(false);
    }
  };

  return (
    <Container>
      <h2>{t('driver_dashboard_title')}</h2>
      <hr />
      {/* Removed Tabs and Tab components */}
      <div className="mb-3">
          <h4>{t('your_availability_title')}</h4>
          {console.log('User in DriverDashboard:', user)}
          {!user?._id && <Alert variant="warning">{t('driver_user_info_not_available')}</Alert>}
          {availabilityLoading && <Spinner animation="border" size="sm" />}
          {availabilityError && <Alert variant="danger">{availabilityError}</Alert>}
          {isDriverAvailable !== null ? (
          <Form>
              <Form.Check
              type="switch"
              id="driver-availability-switch"
              label={isDriverAvailable ? t('driver_status_free') : t('driver_status_busy')}
              checked={isDriverAvailable}
              onChange={handleDriverAvailabilityToggle}
              disabled={availabilityLoading}
              />
          </Form>
          ) : (
          <p>{t('driver_loading_availability')}</p>
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
              <th>{t('package_header')}</th>
              <th>{t('status_header')}</th>
              <th>{t('destination_header')}</th>
              <th>{t('actions_header')}</th>
              </tr>
          </thead>
          <tbody>
              {deliveries.map((delivery) => (
              <tr key={delivery._id}>
                  <td>{delivery.trackingNumber}</td>
                  <td>{delivery.packageName}</td>
                  <td>{delivery.status}</td>
                  <td>{delivery.buyer?.address || 'N/A'}</td>
                  <td>
                  <ButtonGroup>
                      <Button
                      size="sm"
                      variant="info"
                      disabled={delivery.status === 'in-transit' || updatingId === delivery._id}
                      onClick={() => handleStatusUpdate(delivery._id, 'in-transit')}
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
                  </td>
              </tr>
              ))}
          </tbody>
          </Table>
      )}
    </Container>
  );
};

export default DriverDashboard;