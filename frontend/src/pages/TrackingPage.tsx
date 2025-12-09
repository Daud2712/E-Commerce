import React, { useState } from 'react';
import { Form, Button, Container, Card, Spinner, Alert } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery } from '../types';

const TrackingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDelivery(null);

    try {
      const { data } = await api.getDeliveryByTrackingNumber(trackingNumber);
      setDelivery(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>Track Your Package</h2>
      <Form onSubmit={handleTrack}>
        <Form.Group className="mb-3">
          <Form.Label>Enter Tracking Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., a UUID"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Track'}
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {delivery && (
        <Card className="mt-4">
          <Card.Header>Delivery Details for {delivery.trackingNumber}</Card.Header>
          <Card.Body>
            <Card.Text><strong>Status:</strong> {delivery.status}</Card.Text>
            <Card.Text><strong>Package:</strong> {delivery.packageName}</Card.Text>
            <Card.Text><strong>Destination:</strong> {delivery.buyer.address}</Card.Text>
            {/* Add map here later */}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default TrackingPage;
