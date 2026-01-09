import React from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const handleQuantityChange = (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      alert('Quantity exceeds available stock');
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          <h4>Cart is Empty</h4>
          <p>Your shopping cart is empty. Browse our products and add items to your cart.</p>
        </Alert>
        <Button variant="primary" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Shopping Cart</h2>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Actions</th>
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
                              style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Logo.jpeg'; }}
                            />
                          )}
                          <div>
                            <strong>{item.product.name}</strong>
                            {item.product.category && (
                              <div className="text-muted small">{item.product.category}</div>
                            )}
                            <div className="text-muted small">
                              Available: {item.product.stock}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>TZS {item.product.price.toLocaleString()}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.product._id,
                              parseInt(e.target.value) || 1,
                              item.product.stock
                            )
                          }
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <strong>TZS {(item.product.price * item.quantity).toLocaleString()}</strong>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <div className="mt-3">
            <Button variant="outline-secondary" onClick={() => navigate('/products')}>
              {'Continue Shopping'}
            </Button>
            <Button variant="outline-danger" className="ms-2" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </Col>

        <Col md={4}>
          <Card>
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
                <span>TZS {getCartTotal().toLocaleString()}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">TZS {getCartTotal().toLocaleString()}</strong>
              </div>
              <Button
                variant="success"
                className="w-100"
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Body>
              <h6>Shopping Tips</h6>
              <ul className="small">
                <li>Free shipping on all orders</li>
                <li>Cash on delivery available</li>
                <li>Contact seller for product inquiries</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
