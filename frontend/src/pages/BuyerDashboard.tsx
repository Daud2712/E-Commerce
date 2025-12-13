import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Tabs, Tab, Nav, Form, Button, Card, Row, Col } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User, DeliveryAddress } from '../types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const BuyerDashboard = () => {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeTab, setActiveTab] = useState('deliveries'); // New state for active tab
  const { t } = useTranslation(); // Initialize useTranslation

  // Profile state
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    additionalInfo: '',
  });


  // Order History state
  const [orderHistory, setOrderHistory] = useState<Delivery[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryError, setOrderHistoryError] = useState('');

  // Load user profile on mount to get registration number
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data } = await api.getMyProfile();
        setProfile(data);
        if (data.deliveryAddress) {
          setDeliveryAddress(data.deliveryAddress);
          // Pre-fill M-Pesa phone number if available in profile
        }
      } catch (err: any) {
        console.error('Failed to load user profile:', err);
      }
    };
    loadUserProfile();
  }, []);

  // Fetch Order History when tab is active
  useEffect(() => {
    if (activeTab === 'orderHistory' && profile?._id) {
      const fetchOrderHistory = async () => {
        try {
          setOrderHistoryLoading(true);
          setOrderHistoryError('');
          const { data } = await api.getBuyerDeliveries();
          setOrderHistory(data);
        } catch (err: any) {
          setOrderHistoryError(err.response?.data?.message || t('buyer_deliveries_fetch_error'));
        } finally {
          setOrderHistoryLoading(false);
        }
      };
      fetchOrderHistory();
    }
  }, [activeTab, profile?._id, t]); // Added t to dependencies due to its use in fetchOrderHistory

  const handleTrackDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDelivery(null);

    if (!trackingNumber.trim()) {
      setError(t('please_enter_tracking_number'));
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.getDeliveryByTrackingNumber(trackingNumber.trim());

      // Verify this delivery belongs to the current user (buyer)
      if (profile && data.buyer._id !== profile._id) {
        setError(t('tracking_number_not_yours'));
        setDelivery(null);
      } else {
        setDelivery(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('delivery_not_found'));
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  };

  // Load profile when profile tab is active
  useEffect(() => {
    if (activeTab === 'profile') {
      const fetchProfile = async () => {
        try {
          setProfileLoading(true);
          const { data } = await api.getMyProfile();
          setProfile(data);
          if (data.deliveryAddress) {
            setDeliveryAddress(data.deliveryAddress);
          }
        } catch (err: any) {
          setProfileError(err.response?.data?.message || t('failed_to_load_profile'));
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    }
  }, [activeTab]);

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');
      const { data } = await api.updateProfile({ deliveryAddress });
      setProfile(data.user);
      setProfileSuccess(t('profile_updated_successfully'));
    } catch (err: any) {
      setProfileError(err.response?.data?.message || t('failed_to_update_profile'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleReceiveDelivery = async (deliveryId: string) => {
    try {
      const { data } = await api.receiveDelivery(deliveryId);
      setDelivery(data); // Update the single delivery
    } catch (err: any) {
      setError(err.response?.data?.message || t('buyer_receive_delivery_error'));
    }
  };

  const handleUnreceiveDelivery = async (deliveryId: string) => {
    try {
      const { data } = await api.unreceiveDelivery(deliveryId);
      setDelivery(data); // Update the single delivery
    } catch (err: any) {
      setError(err.response?.data?.message || t('failed_to_undo_received_status'));
    }
  };

  return (
    <Container>
      <h2>{t('buyer_dashboard_title')}</h2>


      {/* Delivery Address Required Alert */}
      {profile && (!profile.deliveryAddress?.street || !profile.deliveryAddress?.city || !profile.deliveryAddress?.phone) && (
        <Alert variant="warning" className="mb-3">
          <Row className="align-items-center">
            <Col md={9}>
              <h5 className="mb-2">
                <strong>⚠️ {t('delivery_address_required')}</strong>
              </h5>
              <p className="mb-0">
                {t('delivery_address_required_text')}
              </p>
            </Col>
            <Col md={3} className="text-md-end">
              <Button
                variant="warning"
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                {t('add_address_now')}
              </Button>
            </Col>
          </Row>
        </Alert>
      )}

      {/* Registration Number Display */}
      {profile?.registrationNumber && (
        <Alert variant="info" className="mb-3">
          <Row className="align-items-center">
            <Col md={8}>
              <h5 className="mb-0">
                <strong>{t('your_registration_number')}</strong>{' '}
                <span className="text-primary" style={{ fontSize: '1.3em', fontWeight: 'bold' }}>
                  {profile.registrationNumber}
                </span>
              </h5>
              <small className="text-muted">
                {t('share_registration_number')}
              </small>
            </Col>
            <Col md={4} className="text-md-end">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(profile.registrationNumber || '');
                  alert(t('registration_number_copied'));
                }}
              >
                📋 {t('copy_number')}
              </Button>
            </Col>
          </Row>
        </Alert>
      )}

      <hr />
      <Tabs
        id="buyer-dashboard-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k!)}
        className="mb-3"
      >
        <Tab eventKey="deliveries" title={t('track_package_tab')}>
          <h4>{t('track_package_tab')}</h4>

          <Form onSubmit={handleTrackDelivery} className="mb-4">
            <Row className="align-items-end">
              <Col md={9}>
                <Form.Group controlId="trackingNumber">
                  <Form.Label>{t('enter_tracking_number')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enter_your_tracking_number')}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? t('tracking') : t('track_parcel')}
                </Button>
              </Col>
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}

          {delivery && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{t('delivery_details')}</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>{t('tracking_number')}</strong>
                    <p className="text-primary" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                      {delivery.trackingNumber}
                    </p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <strong>{t('status')}</strong>
                    <p>
                      <span
                        className={`badge ${
                          delivery.status === 'received' ? 'bg-success' :
                          delivery.status === 'delivered' ? 'bg-info' :
                          delivery.status === 'in_transit' ? 'bg-warning' :
                          delivery.status === 'assigned' ? 'bg-primary' :
                          'bg-secondary'
                        }`}
                        style={{ fontSize: '1em' }}
                      >
                        {delivery.status === 'assigned' ? t('status_assigned_to_rider') : t('status_' + delivery.status)}                     </span>
                    </p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <strong>{t('parcel_name')}</strong>
                    <p>{delivery.packageName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>{t('price')}</strong>
                    <p>{delivery.price ? t('price_with_currency_display', { amount: delivery.price.toLocaleString() }) : 'N/A'}</p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <strong>{t('seller')}</strong>
                    <p>{delivery.seller.name}</p>
                  </Col>
                </Row>

                {delivery.status === 'delivered' && (
                  <Alert variant="success" className="mb-3">
                    <p className="mb-2">
                      <strong>{t('parcel_delivered')}</strong>
                    </p>
                    <p className="mb-0">
                      {t('confirm_parcel_reception')}
                    </p>
                  </Alert>
                )}

                {delivery.status === 'delivered' && (
                  <Button
                    variant="success"
                    onClick={() => handleReceiveDelivery(delivery._id)}
                    className="w-100"
                  >
                    {t('mark_as_received')}
                  </Button>
                )}

                {delivery.status === 'received' && (
                  <>
                    <Alert variant="info" className="mb-3">
                      {t('confirmed_reception')}
                    </Alert>
                    <Button
                      variant="warning"
                      onClick={() => handleUnreceiveDelivery(delivery._id)}
                      className="w-100"
                    >
                      {t('undo_received_status')}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Tab>
        <Tab eventKey="profile" title={t('profile_tab')}>
          <h4>{t('your_profile_title')}</h4>

          {/* Address Status Indicator */}
          {profile && profile.deliveryAddress?.street && profile.deliveryAddress?.city && profile.deliveryAddress?.phone && !profileLoading && (
            <Alert variant="success" className="mb-3">
              ✅ {t('delivery_address_set_up')}
            </Alert>
          )}

          {profileLoading && <Spinner animation="border" />}
          {profileError && <Alert variant="danger">{profileError}</Alert>}
          {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}

          {profile && !profileLoading && (
            <Card className="mb-4">
              <Card.Header>
                <strong>{t('delivery_address')}</strong>
                <small className="text-muted ms-2">{t('required_to_receive_deliveries')}</small>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSaveProfile}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t('street_address')} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('enter_street_address')}
                          value={deliveryAddress.street || ''}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t('city')} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('enter_city')}
                          value={deliveryAddress.city || ''}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('state_province')}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('enter_state_province')}
                          value={deliveryAddress.state || ''}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('postal_code')}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('enter_postal_code')}
                          value={deliveryAddress.postalCode || ''}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('country')}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('enter_country')}
                          value={deliveryAddress.country || ''}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t('phone_number')} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder={t('enter_phone_number')}
                          value={deliveryAddress.phone || ''}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('additional_information')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={t('additional_information_placeholder')}
                      value={deliveryAddress.additionalInfo || ''}
                      onChange={(e) => handleAddressChange('additionalInfo', e.target.value)}
                    />
                  </Form.Group>

                  <Alert variant="info" className="mb-3">
                    <small>
                      <strong>{t('note_prefix')}:</strong> {t('note_required_fields')}
                    </small>
                  </Alert>

                  <Button variant="primary" type="submit" disabled={profileLoading}>
                    {profileLoading ? t('saving') : t('save_delivery_address')}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Tab>
        <Tab eventKey="orderHistory" title={t('order_history_tab')}>
          <h4>{t('your_order_history_title')}</h4>
          {orderHistoryLoading && <Spinner animation="border" />}
          {orderHistoryError && <Alert variant="danger">{orderHistoryError}</Alert>}
          {!orderHistoryLoading && !orderHistoryError && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>{t('tracking_number_header')}</th>
                  <th>{t('package_name_header')}</th>
                  <th>{t('status_header')}</th>
                  <th>{t('seller_header')}</th>
                  <th>{t('rider_header')}</th>
                  <th>{t('price_column')}</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.length > 0 ? (
                  orderHistory.map((delivery) => (
                    <tr key={delivery._id}>
                      <td>{delivery.trackingNumber}</td>
                      <td>{delivery.packageName}</td>
                      <td>{delivery.status.toUpperCase()}</td>
                      <td>{delivery.seller.name}</td>
                      <td>{delivery.rider ? delivery.rider.name : t('not_yet_assigned_rider')}</td>
                      <td>{delivery.price ? t('price_with_currency_display', { amount: delivery.price.toLocaleString() }) : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>{t('no_deliveries_found')}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default BuyerDashboard;
