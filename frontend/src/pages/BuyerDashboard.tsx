import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Tabs, Tab, Nav, Form, Button, Card, Row, Col } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User, DeliveryAddress } from '../types';

const BuyerDashboard = () => {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeTab, setActiveTab] = useState('deliveries'); // New state for active tab

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
          setOrderHistoryError(err.response?.data?.message || 'Failed to fetch deliveries');
        } finally {
          setOrderHistoryLoading(false);
        }
      };
      fetchOrderHistory();
    }
  }, [activeTab, profile?._id]);

  const handleTrackDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDelivery(null);

    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.getDeliveryByTrackingNumber(trackingNumber.trim());

      // Verify this delivery belongs to the current user (buyer)
      if (profile && data.buyer._id !== profile._id) {
        setError('This tracking number does not belong to you');
        setDelivery(null);
      } else {
        setDelivery(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delivery not found');
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
          setProfileError(err.response?.data?.message || 'Failed to load profile');
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
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleReceiveDelivery = async (deliveryId: string) => {
    try {
      const { data } = await api.receiveDelivery(deliveryId);
      setDelivery(data); // Update the single delivery
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm delivery');
    }
  };

  const handleUnreceiveDelivery = async (deliveryId: string) => {
    try {
      const { data } = await api.unreceiveDelivery(deliveryId);
      setDelivery(data); // Update the single delivery
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to undo received status');
    }
  };

  return (
    <Container>
      <h2>Buyer Dashboard</h2>


      {/* Delivery Address Required Alert */}
      {profile && (!profile.deliveryAddress?.street || !profile.deliveryAddress?.city || !profile.deliveryAddress?.phone) && (
        <Alert variant="warning" className="mb-3">
          <Row className="align-items-center">
            <Col md={9}>
              <h5 className="mb-2">
                <strong>⚠️ Delivery Address Required</strong>
              </h5>
              <p className="mb-0">
                Please add your delivery address to receive orders
              </p>
            </Col>
            <Col md={3} className="text-md-end">
              <Button
                variant="warning"
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                Add Address Now
              </Button>
            </Col>
          </Row>
        </Alert>
      )}

      {/* Registration Number Display - REMOVED per requirements */}
      {false && profile?.registrationNumber && (
        <Alert variant="info" className="mb-3">
          <Row className="align-items-center">
            <Col md={8}>
              <h5 className="mb-0">
                <strong>Your Registration Number</strong>{' '}
                <span className="text-primary" style={{ fontSize: '1.3em', fontWeight: 'bold' }}>
                  {profile?.registrationNumber}
                </span>
              </h5>
              <small className="text-muted">
                Share this number with sellers to receive parcels
              </small>
            </Col>
            <Col md={4} className="text-md-end">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(profile?.registrationNumber || '');
                  alert('Registration number copied to clipboard!');
                }}
              >
                📋 Copy Number
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
        <Tab eventKey="deliveries" title="Track Package">
          <h4>Track Package</h4>

          <Form onSubmit={handleTrackDelivery} className="mb-4">
            <Row className="align-items-end">
              <Col md={9}>
                <Form.Group controlId="trackingNumber">
                  <Form.Label>Enter Tracking Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Tracking...' : 'Track Parcel'}
                </Button>
              </Col>
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}

          {delivery && (
            <Card className="mb-4">
              <Card.Header>
              <h5 className="mb-0">Delivery Details</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>{'Tracking Number'}</strong>
                    <p className="text-primary" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                      {delivery.trackingNumber}
                    </p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <strong>{'Status'}</strong>
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
                        {delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}                     </span>
                    </p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <strong>{'Parcel Name'}</strong>
                    <p>{delivery.packageName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>{'Price'}</strong>
                    <p>{delivery.price ? 'TSh ' + delivery.price.toLocaleString() : 'N/A'}</p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <strong>{'Seller'}</strong>
                    <p>{delivery.seller.name}</p>
                  </Col>
                </Row>

                {delivery.status === 'delivered' && (
                  <Alert variant="success" className="mb-3">
                    <p className="mb-2">
                      <strong>{'Parcel Delivered'}</strong>
                    </p>
                    <p className="mb-0">
                      {'Please confirm that you have received your parcel'}
                    </p>
                  </Alert>
                )}

                {delivery.status === 'delivered' && (
                  <Button
                    variant="success"
                    onClick={() => handleReceiveDelivery(delivery._id)}
                    className="w-100"
                  >
                    {'Mark As Received'}
                  </Button>
                )}

                {delivery.status === 'received' && (
                  <>
                    <Alert variant="info" className="mb-3">
                      {'Confirmed Reception'}
                    </Alert>
                    <Button
                      variant="warning"
                      onClick={() => handleUnreceiveDelivery(delivery._id)}
                      className="w-100"
                    >
                      {'Undo Received Status'}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Tab>
        <Tab eventKey="profile" title={'Profile'}>
          <h4>{'Your Profile'}</h4>

          {/* Address Status Indicator */}
          {profile && profile.deliveryAddress?.street && profile.deliveryAddress?.city && profile.deliveryAddress?.phone && !profileLoading && (
            <Alert variant="success" className="mb-3">
              ✅ Delivery Address Set Up
            </Alert>
          )}

          {profileLoading && <Spinner animation="border" />}
          {profileError && <Alert variant="danger">{profileError}</Alert>}
          {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}

          {profile && !profileLoading && (
            <Card className="mb-4">
              <Card.Header>
                <strong>{'Delivery Address'}</strong>
                <small className="text-muted ms-2">{'Required to receive deliveries'}</small>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSaveProfile}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {'Street Address'} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={'Enter street address'}
                          value={deliveryAddress.street || ''}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {'City'} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={'Enter city'}
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
                        <Form.Label>{'State/Province'}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={'Enter state/province'}
                          value={deliveryAddress.state || ''}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{'Postal Code'}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={'Enter postal code'}
                          value={deliveryAddress.postalCode || ''}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{'Country'}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={'Enter country'}
                          value={deliveryAddress.country || ''}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {'Phone Number'} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder={'Enter phone number'}
                          value={deliveryAddress.phone || ''}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Additional Information</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="e.g., Apartment number, landmarks, special instructions"
                      value={deliveryAddress.additionalInfo || ''}
                      onChange={(e) => handleAddressChange('additionalInfo', e.target.value)}
                    />
                  </Form.Group>

                  <Alert variant="info" className="mb-3">
                    <small>
                      <strong>{'Note'}:</strong> {'Street, City, and Phone Number are required fields'}
                    </small>
                  </Alert>

                  <Button variant="primary" type="submit" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Delivery Address'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Tab>
        <Tab eventKey="orderHistory" title={'Order History'}>
          <h4>{'Your Order History'}</h4>
          {orderHistoryLoading && <Spinner animation="border" />}
          {orderHistoryError && <Alert variant="danger">{orderHistoryError}</Alert>}
          {!orderHistoryLoading && !orderHistoryError && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Package Name</th>
                  <th>Status</th>
                  <th>Seller</th>
                  <th>Rider</th>
                  <th>Price</th>
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
                      <td>{delivery.rider ? delivery.rider.name : 'Not Yet Assigned'}</td>
                      <td>{delivery.price ? 'TSh ' + delivery.price.toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>{'No deliveries found'}</td>
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
