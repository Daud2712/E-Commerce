import React, { useState } from 'react';
import { Form, Button, Container, Card, Spinner, Alert } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery } from '../types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const TrackingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation(); // Initialize useTranslation

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDelivery(null);

    try {
      const { data } = await api.getDeliveryByTrackingNumber(trackingNumber);
      setDelivery(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('tracking_error_message'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>{t('track_your_package_title')}</h2>
      <Form onSubmit={handleTrack}>
        <Form.Group className="mb-3">
          <Form.Label>{t('enter_tracking_number_label')}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t('tracking_number_placeholder')}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : t('track_button')}
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {delivery && (
        <Card className="mt-4">
          <Card.Header>{t('delivery_details_for')} {delivery.trackingNumber}</Card.Header>
          <Card.Body>
            <Card.Text><strong>{t('status_label')}{t('colon_separator')}</strong> {delivery.status}</Card.Text>
            <Card.Text><strong>{t('package_label')}{t('colon_separator')}</strong> {delivery.packageName}</Card.Text>
            <Card.Text><strong>{t('destination_label')}{t('colon_separator')}</strong> {delivery.buyer.deliveryAddress?.city || t('not_applicable_short')}</Card.Text>
            {/* Add map here later */}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default TrackingPage;
