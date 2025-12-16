import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { IProduct, UserRole } from '../types';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const ProductListingPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation hook

  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('failed_to_fetch_products'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, location.key]); // Add location.key to dependency array

  // Filter products based on search, category, and price range
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange]);

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  // Buyer actions
  const handleAddToCart = (product: IProduct) => {
    if (!user) {
      alert(t('please_login_to_continue'));
      navigate('/login');
      return;
    }
    if (user.role !== UserRole.BUYER) {
      alert(t('only_buyers_can_add_to_cart'));
      return;
    }
    if (product.stock === 0) {
      alert(t('product_out_of_stock'));
      return;
    }
    addToCart(product, 1);
    alert(`${t('added_to_cart')}: ${product.name}`);
  };

  const handleBuyNow = (product: IProduct) => {
    if (!user) {
      alert(t('please_login_to_continue'));
      navigate('/login');
      return;
    }
    if (user.role !== UserRole.BUYER) {
      alert(t('only_buyers_can_buy_now'));
      return;
    }
    if (product.stock === 0) {
      alert(t('product_out_of_stock'));
      return;
    }
    addToCart(product, 1);
    navigate('/cart');
  };

  const handleViewDetails = (productId: string) => {
    navigate(`/products/${productId}`);
  };


  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('loading_products')}</span>
        </Spinner>
        <p className="mt-2">{t('fetching_products_message')}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      <p className="mt-3">{t('failed_to_load_products_suggestion')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>{t('product_listing_page_title')}</h2>
        </Col>
      </Row>

      {/* Search and Filter Section for Buyers */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={t('search_products_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">{t('all_categories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select onChange={(e) => {
              const value = e.target.value;
              if (value === 'low') setPriceRange({ min: 0, max: 5000 });
              else if (value === 'mid') setPriceRange({ min: 5000, max: 20000 });
              else if (value === 'high_mid') setPriceRange({ min: 20000, max: 50000 });
              else if (value === 'high_high') setPriceRange({ min: 50000, max: 200000 }); // New range
              else if (value === 'high') setPriceRange({ min: 200000, max: 10000000 }); // Adjusted high range, increased max to accommodate
              else setPriceRange({ min: 0, max: 10000000 });
            }}>
              <option value="">{t('all_prices')}</option>
              <option value="low">{t('under_5000')}</option>
              <option value="mid">{t('5000_to_20000')}</option>
              <option value="high_mid">{t('20000_to_50000')}</option>
              <option value="high_high">{t('50000_to_200000')}</option>
              <option value="high">{t('over_200000')}</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Buyer View */}
      <div>
        <h4>{t('available_products')}</h4>
        {filteredProducts.length === 0 && !loading && !error ? (
          <Alert variant="info">{t('no_products_found')}</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product._id}>
                <Card className="h-100">
                  {product.images && product.images.length > 0 ? (
                    <Card.Img variant="top" src={getImageUrl(product.images[0])} style={{ height: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '200px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-muted">{t('no_image_available')}</span>
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{product.name}</Card.Title>
                    {product.category && <Card.Subtitle className="mb-2 text-muted">{product.category}</Card.Subtitle>}
                    <Card.Text>{product.description || t('no_description_provided')}</Card.Text>
                    <div className="mt-auto">
                      <Card.Text><strong>TZS {product.price.toLocaleString()}</strong></Card.Text>
                      <Card.Text>
                        <small className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                          {product.stock > 0 ? t('in_stock') : t('out_of_stock')}
                        </small>
                      </Card.Text>
                      <Button
                        variant="outline-primary"
                        className="w-100 mb-2"
                        onClick={() => handleViewDetails(product._id)}
                        >
                          {t('view_details')}
                        </Button>
                        <Button
                          variant="primary"
                          className="w-100 mb-2"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                        >
                          {t('add_to_cart')}
                        </Button>
                        <Button
                          variant="success"
                          className="w-100"
                          onClick={() => handleBuyNow(product)}
                          disabled={product.stock === 0}
                        >
                          {t('buy_now')}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
    </Container>
  );
};

export default ProductListingPage;