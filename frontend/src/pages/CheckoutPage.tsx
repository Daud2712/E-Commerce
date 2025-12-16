import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
import { useTranslation } from 'react-i18next';
import LocationPicker from '../components/LocationPicker';

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'azampay'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load user's delivery address if available
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.getMyProfile();
        if (data.deliveryAddress) {
          setShippingAddress({
            street: data.deliveryAddress.street || '',
            city: data.deliveryAddress.city || '',
            state: data.deliveryAddress.state || '',
            postalCode: data.deliveryAddress.postalCode || '',
            country: data.deliveryAddress.country || '',
            phone: data.deliveryAddress.phone || '',
            latitude: undefined,
            longitude: undefined,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate('/cart');
    }
  }, [cartItems, navigate, success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setShippingAddress((prev) => ({
      ...prev,
      street: location.address,
      latitude: location.lat,
      longitude: location.lng,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      const errorMessage = t('please_complete_shipping_address');
      setError(errorMessage);
      setLoading(false);
      return;
    }

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      })),
      shippingAddress: {
        ...shippingAddress,
        latitude: shippingAddress.latitude,
        longitude: shippingAddress.longitude,
      },
      paymentMethod,
    };

    try {
      const { data } = await api.checkout(orderData);
      setSuccess(true);
      clearCart();

      // Show success message and redirect
      alert(
        t('order_placed_successfully', { orderId: data.order._id })
      );
      navigate('/buyer-dashboard'); // Redirect to buyer dashboard to view orders
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message ||
          t('checkout_failed')
      );
    } finally {
      setLoading(false);
      console.log('handlePlaceOrder finished. Loading set to false.');
    }
  };

  if (cartItems.length === 0 && !success) {
    return null; // Will redirect via useEffect
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">{t('checkout')}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handlePlaceOrder}>
        <Row>
          <Col md={8}>
            {/* Shipping Address Form */}
            <Card className="mb-4">
              <Card.Header>
                <h5>{t('shipping_address')}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('street_address')}{t('required_field_suffix')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleInputChange}
                        required
                        placeholder={t('enter_street_address')}
                      />
                      <div className="mt-2">
                        <LocationPicker
                          onLocationSelect={handleLocationSelect}
                          initialAddress={shippingAddress.street}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('city')}{t('required_field_suffix')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        placeholder={t('enter_city')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('state_province')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        placeholder={t('enter_state_province')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('postal_code')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        placeholder={t('enter_postal_code')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('country')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        placeholder={t('enter_country')}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('phone_number')}{t('required_field_suffix')}</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        placeholder={t('enter_phone_number')}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Payment Method Selection */}
            <Card className="mb-4">
              <Card.Header>
                <h5>{t('payment_method')}</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="payment-cash"
                      name="paymentMethod"
                      label={
                        <div className="d-flex align-items-center">
                          <span className="fs-5 me-2">💵</span>
                          <div>
                            <strong>{t('cash_on_delivery')}</strong>
                            <div className="small text-muted">{t('pay_when_you_receive')}</div>
                          </div>
                        </div>
                      }
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'azampay')}
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="payment-azampay"
                      name="paymentMethod"
                      label={
                        <div className="d-flex align-items-center">
                          <span className="fs-5 me-2">📱</span>
                          <div>
                            <strong>{t('azam_pay')}</strong>
                            <div className="small text-muted">{t('pay_via_phone')}</div>
                          </div>
                        </div>
                      }
                      value="azampay"
                      checked={paymentMethod === 'azampay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'azampay')}
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Order Items Review */}
            <Card className="mb-4">
              <Card.Header>
                <h5>{t('review_items')}</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>{t('product')}</th>
                      <th>{t('quantity')}</th>
                      <th>{t('price')}</th>
                      <th>{t('subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.product._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.product.images && item.product.images.length > 0 && (
                              <img
                                src={getImageUrl(item.product.images[0])}
                                alt={item.product.name}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                  marginRight: '10px',
                                  borderRadius: '4px',
                                }}
                              />
                            )}
                            <span>{item.product.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{t('price_with_currency_display', { amount: item.product.price.toFixed(2) })}</td>
                        <td>
                          <strong>{t('price_with_currency_display', { amount: (item.product.price * item.quantity).toFixed(2) })}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            {/* Order Summary */}
            <Card className="mb-4" style={{ position: 'sticky', top: '20px' }}>
              <Card.Header>
                <h5>{t('order_summary')}</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('items')}{t('colon_separator')}</span>
                  <span>{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('subtotal')}{t('colon_separator')}</span>
                  <span>{t('price_with_currency_display', { amount: getCartTotal().toFixed(2) })}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('shipping')}{t('colon_separator')}</span>
                  <span className="text-success">{t('free')}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>{t('total')}{t('colon_separator')}</strong>
                  <strong className="text-primary">{t('price_with_currency_display', { amount: getCartTotal().toFixed(2) })}</strong>
                </div>

                <Button
                  variant="success"
                  className="w-100"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t('processing')}
                    </>
                  ) : (
                    t('place_order')
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  className="w-100 mt-2"
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  {t('back_to_cart')}
                </Button>
              </Card.Body>
            </Card>

            {/* Security Note */}
            <Card>
              <Card.Body className="small">
                <p className="mb-2">
                  <strong>🔒 {t('secure_checkout')}</strong>
                </p>
                <p className="mb-0 text-muted">
                  {t('secure_checkout_message')}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CheckoutPage;
