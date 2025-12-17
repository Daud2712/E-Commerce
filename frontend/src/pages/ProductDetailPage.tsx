import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Carousel } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { IProduct, UserRole } from '../types';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth(); // Import useAuth to access user role
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const { data } = await api.getProductById(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, t]);

  const handleAddToCart = () => {
    if (!user) {
      alert('Please login to continue');
      navigate('/login');
      return;
    }
    if (!product) return;

    if (quantity > product.stock) {
      alert(t('quantity_exceeds_stock_detail', { stock: product.stock }));
      return;
    }

    addToCart(product, quantity);
    alert(`${'Added to cart'}: ${quantity} x ${product.name}`);
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please login to continue');
      navigate('/login');
      return;
    }
    if (user.role !== UserRole.BUYER) {
      alert('Only buyers can buy now');
      return;
    }
    if (!product || product.stock === 0) return;

    if (quantity > product.stock) {
      alert(t('quantity_exceeds_stock_detail', { stock: product.stock }));
      return;
    }

    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{'Loading...'}</span>
        </Spinner>
        <p className="mt-2">{'Loading product details...'}</p>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button variant="primary" onClick={() => navigate('/products')}>
          {'Back to Products'}
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Button variant="link" onClick={() => navigate('/products')} className="mb-3">
        ← {'Back to Products'}
      </Button>

      <Row>
        <Col md={6}>
          {product.images && product.images.length > 0 ? (
            product.images.length === 1 ? (
              <Card.Img
                src={getImageUrl(product.images[0])}
                alt={product.name}
                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <Carousel>
                {product.images.map((image, idx) => (
                  <Carousel.Item key={idx}>
                    <img
                      className="d-block w-100"
                      src={getImageUrl(image)}
                      alt={`${product.name} ${idx + 1}`}
                      style={{ maxHeight: '500px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            )
          ) : (
            <div
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
            >
              <p className="text-muted">{'No image available'}</p>
            </div>
          )}
        </Col>

        <Col md={6}>
          <h2>{product.name}</h2>
          {product.category && (
            <Badge bg="secondary" className="mb-3">
              {product.category}
            </Badge>
          )}

          <h3 className="text-primary mb-3">TZS {product.price.toLocaleString()}</h3>

          <div className="mb-3">
            {product.stock > 0 ? (
              <Badge bg="success">{'In Stock'}</Badge>
            ) : (
              <Badge bg="danger">{'Out of Stock'}</Badge>
            )}
          </div>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{'Description'}</Card.Title>
              <Card.Text>
                {product.description || 'No description available'}
              </Card.Text>
            </Card.Body>
          </Card>

          {/* Seller information removed per requirements */}

          {product.stock > 0 && (
            <div className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label><strong>{'Quantity'}</strong></Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  style={{ width: '100px' }}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  {'Add to Cart'}
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleBuyNow}
                >
                  {'Buy Now'}
                </Button>
              </div>
            </div>
          )}

          {product.stock === 0 && (
            <Alert variant="warning">
              {'Product out of stock'} {'Check back later'}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
