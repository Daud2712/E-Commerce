import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery } from '../types';

const DriverDashboard = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await api.getDeliveries(); // Same API call as seller
      setDeliveries(data);
    } catch (err: any) { // Type assertion for error handling
      setError(err.response?.data?.message || 'Could not fetch deliveries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStatusUpdate = async (id: string, status: Delivery['status']) => {
    try {
      await api.updateDeliveryStatus(id, status);
      fetchDeliveries(); // Refresh the list
    } catch (err: any) { // Type assertion for error handling
      alert(err.response?.data?.message || 'Could not update status.');
    }
  };

  return (
    <Container>
      <h2>Driver Dashboard</h2>
      <hr />
      <h4>Your Assigned Deliveries</h4>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Package</th>
              <th>Status</th>
              <th>Destination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery._id}>
                <td>{delivery.trackingNumber}</td>
                <td>{delivery.packageName}</td>
                <td>{delivery.status}</td>
                <td>{delivery.buyer.address}</td>
                <td>
                  <ButtonGroup>
                    <Button
                      size="sm"
                      variant="info"
                      disabled={delivery.status === 'in-transit'}
                      onClick={() => handleStatusUpdate(delivery._id, 'in-transit')}
                    >
                      In Transit
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={delivery.status === 'delivered'}
                      onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                    >
                      Delivered
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