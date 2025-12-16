import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Badge, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isAvailable: boolean;
}

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, filterCategory, filterStock]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.getProducts();
      const myProducts = data.filter((p: any) => p.seller._id === user?._id);
      setProducts(myProducts);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(t('failed_to_fetch_products'));
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Stock filter
    if (filterStock === 'in-stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (filterStock === 'out-of-stock') {
      filtered = filtered.filter(p => p.stock === 0);
    } else if (filterStock === 'low-stock') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
    }

    setFilteredProducts(filtered);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  const totalProducts = products.length;
  const inStock = products.filter(p => p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <p>{t('loading_products')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📦 Inventory Management</h2>
        <Button variant="primary" onClick={() => navigate('/seller/manage-products')}>
          ➕ Add New Product
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Total Products</h5>
              <h2 className="text-primary">{totalProducts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">In Stock</h5>
              <h2 className="text-success">{inStock}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Out of Stock</h5>
              <h2 className="text-danger">{outOfStock}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Low Stock</h5>
              <h2 className="text-warning">{lowStock}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="text-muted">Total Inventory Value</h5>
              <h2 className="text-success">TZS {totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Products</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Category</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Stock</Form.Label>
                <Form.Select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock (&le; 10)</option>
                  <option value="out-of-stock">Out of Stock</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card>
        <Card.Header>
          <h5>Product List ({filteredProducts.length})</h5>
        </Card.Header>
        <Card.Body>
          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted">No products found.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price (TZS)</th>
                  <th>Stock</th>
                  <th>Value (TZS)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockValue = product.price * product.stock;
                  return (
                    <tr key={product._id}>
                      <td>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
                        )}
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        <br />
                        <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                      </td>
                      <td>{product.category}</td>
                      <td>{product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td>
                        {product.stock === 0 ? (
                          <Badge bg="danger">{product.stock}</Badge>
                        ) : product.stock <= 10 ? (
                          <Badge bg="warning">{product.stock}</Badge>
                        ) : (
                          <Badge bg="success">{product.stock}</Badge>
                        )}
                      </td>
                      <td>{stockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td>
                        {product.isAvailable && product.stock > 0 ? (
                          <Badge bg="success">Available</Badge>
                        ) : (
                          <Badge bg="secondary">Unavailable</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/seller/manage-products?edit=${product._id}`)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InventoryPage;
