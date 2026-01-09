import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
import TanzaniaLocationSelector from '../components/TanzaniaLocationSelector';

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    region: '',
    district: '',
    ward: '',
    street: '',
    postalCode: '',
    phone: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'azampay'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);

  // Load user's delivery address if available
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.getMyProfile();
        if (data.deliveryAddress) {
          setShippingAddress({
            region: data.deliveryAddress.state || '',
            district: data.deliveryAddress.city || '',
            ward: '',
            street: data.deliveryAddress.street || '',
            postalCode: data.deliveryAddress.postalCode || '',
            phone: '', // Don't auto-fill phone number
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

  const handleLocationSelect = useCallback((location: {
    region: string;
    district: string;
    ward: string;
    street: string;
    postcode: string;
    lat: number;
    lng: number;
  }) => {
    setShippingAddress((prev) => {
      // Only update if something actually changed to avoid re-renders
      if (
        prev.region === location.region &&
        prev.district === location.district &&
        prev.ward === location.ward &&
        prev.street === location.street &&
        prev.postalCode === location.postcode
      ) {
        return prev; // No change, don't update
      }
      
      return {
        region: location.region,
        district: location.district,
        ward: location.ward,
        street: location.street,
        postalCode: location.postcode,
        latitude: location.lat,
        longitude: location.lng,
        phone: prev.phone, // Explicitly keep the phone number
      };
    });
    // Reset address saved status when location changes
    setAddressSaved(false);
  }, []);

  const handleSaveAddress = () => {
    // Validate all required fields - check for both undefined and empty strings
    if (!shippingAddress.region || shippingAddress.region.trim() === '' ||
        !shippingAddress.district || shippingAddress.district.trim() === '' ||
        !shippingAddress.ward || shippingAddress.ward.trim() === '' ||
        !shippingAddress.street || shippingAddress.street.trim() === '' ||
        !shippingAddress.phone || shippingAddress.phone.trim() === '') {
      const missingFields = [];
      if (!shippingAddress.region || shippingAddress.region.trim() === '') missingFields.push('Region');
      if (!shippingAddress.district || shippingAddress.district.trim() === '') missingFields.push('District');
      if (!shippingAddress.ward || shippingAddress.ward.trim() === '') missingFields.push('Ward/Area');
      if (!shippingAddress.street || shippingAddress.street.trim() === '') missingFields.push('Street');
      if (!shippingAddress.phone || shippingAddress.phone.trim() === '') missingFields.push('Phone Number');
      
      setError(`Please complete the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setAddressSaved(true);
    setError('');
    alert('✓ Shipping address saved successfully!');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if address has been saved
    if (!addressSaved) {
      setError('Please save your shipping address before placing the order');
      setLoading(false);
      return;
    }

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!shippingAddress.region || shippingAddress.region.trim() === '') missingFields.push('Region');
    if (!shippingAddress.district || shippingAddress.district.trim() === '') missingFields.push('District');
    if (!shippingAddress.ward || shippingAddress.ward.trim() === '') missingFields.push('Ward/Area');
    if (!shippingAddress.street || shippingAddress.street.trim() === '') missingFields.push('Street');
    if (!shippingAddress.phone || shippingAddress.phone.trim() === '') missingFields.push('Phone Number');

    if (missingFields.length > 0) {
      const errorMessage = `Please complete the following fields: ${missingFields.join(', ')}`;
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
        street: `${shippingAddress.street}, ${shippingAddress.ward}`,
        city: shippingAddress.district,
        state: shippingAddress.region,
        postalCode: shippingAddress.postalCode,
        country: 'Tanzania',
        phone: shippingAddress.phone,
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
        `Order placed successfully! Order ID: ${data.order._id}`
      );
      navigate('/buyer-dashboard'); // Redirect to buyer dashboard to view orders
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message ||
          'Checkout failed. Please try again.'
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
      <h2 className="mb-4">Checkout</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handlePlaceOrder}>
        <Row>
          <Col md={8}>
            {/* Shipping Address Form */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Shipping Address</h5>
                {addressSaved && (
                  <span className="badge bg-success">✓ Address Saved</span>
                )}
              </Card.Header>
              <Card.Body>
                <TanzaniaLocationSelector
                  onLocationSelect={handleLocationSelect}
                  initialRegion={shippingAddress.region}
                  initialDistrict={shippingAddress.district}
                  initialWard={shippingAddress.ward}
                  initialStreet={shippingAddress.street}
                />
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => {
                          setShippingAddress(prev => ({ ...prev, phone: e.target.value }));
                          setAddressSaved(false);
                        }}
                        required
                        placeholder="e.g., +255 712 345 678"
                        maxLength={15}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-grid gap-2">
                  <Button 
                    variant={addressSaved ? "success" : "primary"}
                    onClick={handleSaveAddress}
                    type="button"
                    disabled={
                      !shippingAddress.region || shippingAddress.region.trim() === '' ||
                      !shippingAddress.district || shippingAddress.district.trim() === '' ||
                      !shippingAddress.ward || shippingAddress.ward.trim() === '' ||
                      !shippingAddress.street || shippingAddress.street.trim() === '' ||
                      !shippingAddress.phone || shippingAddress.phone.trim() === ''
                    }
                  >
                    {addressSaved ? '✓ Address Saved' : 'Save Shipping Address'}
                  </Button>
                  {(
                    !shippingAddress.region || shippingAddress.region.trim() === '' ||
                    !shippingAddress.district || shippingAddress.district.trim() === '' ||
                    !shippingAddress.ward || shippingAddress.ward.trim() === '' ||
                    !shippingAddress.street || shippingAddress.street.trim() === '' ||
                    !shippingAddress.phone || shippingAddress.phone.trim() === ''
                  ) && (
                    <small className="text-muted text-center">
                      Complete all fields above to save address
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Payment Method Selection */}
            <Card className="mb-4">
              <Card.Header>
                <h5>Payment Method</h5>
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
                            <strong>Cash on Delivery</strong>
                            <div className="small text-muted">Pay when you receive your order</div>
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
                            <strong>Azam Pay</strong>
                            <div className="small text-muted">Pay via mobile money</div>
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
                <h5>Review Items</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
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
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Logo.jpeg'; }}
                              />
                            )}
                            <span>{item.product.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>TZS {item.product.price.toFixed(2)}</td>
                        <td>
                          <strong>TZS {(item.product.price * item.quantity).toFixed(2)}</strong>
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
                <h5>Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items:</span>
                  <span>{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>TZS {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span className="text-success">Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong className="text-primary">TZS {getCartTotal().toFixed(2)}</strong>
                </div>

                <Button
                  variant="success"
                  className="w-100"
                  size="lg"
                  type="submit"
                  disabled={loading || !addressSaved}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : !addressSaved ? (
                    <>
                      🔒 Save Address First
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  className="w-100 mt-2"
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  Back to Cart
                </Button>
              </Card.Body>
            </Card>

            {/* Security Note */}
            <Card>
              <Card.Body className="small">
                <p className="mb-2">
                  <strong>🔒 Secure Checkout</strong>
                </p>
                <p className="mb-0 text-muted">
                  Your information is protected and secure. We never share your personal details.
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
