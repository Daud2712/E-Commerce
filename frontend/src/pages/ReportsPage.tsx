import React, { useState } from 'react';
import { Container, Tabs, Tab, Card, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

interface SalesReport {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  orders: any[];
}

interface StockReport {
  summary: {
    totalProducts: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
    totalStockValue: number;
  };
  categoryBreakdown: any;
  products: any[];
}

interface ExpenseReport {
  period: string;
  startDate: string;
  endDate: string;
  totalExpenses: number;
  expenseCount: number;
  categoryBreakdown: any;
  expenses: any[];
}

const ReportsPage: React.FC = () => {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);
  const [expenseReport, setExpenseReport] = useState<ExpenseReport | null>(null);
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [expensePeriod, setExpensePeriod] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSalesReport = async (period: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/reports/sales?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesReport(data);
    } catch (err: any) {
      setError('Failed to fetch sales report.');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStockReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/reports/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStockReport(data);
    } catch (err: any) {
      setError('Failed to fetch stock report.');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchExpenseReport = async (period: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/reports/expenses?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenseReport(data);
    } catch (err: any) {
      setError('Failed to fetch expense report.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <h2>📊 Reports</h2>
      <hr />

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Tabs defaultActiveKey="sales" className="mb-3">
        {/* Sales Report Tab */}
        <Tab eventKey="sales" title="📈 Sales Report">
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Period</Form.Label>
                    <Form.Select
                      value={salesPeriod}
                      onChange={(e) => setSalesPeriod(e.target.value)}
                    >
                      <option value="daily">Today</option>
                      <option value="weekly">Last 7 Days</option>
                      <option value="monthly">Last 30 Days</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="yearly">Last 1 Year</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Button onClick={() => fetchSalesReport(salesPeriod)} disabled={loading}>
                    {loading ? 'Loading...' : 'Generate Report'}
                  </Button>
                </Col>
              </Row>

              {salesReport && (
                <>
                  <Row className="mb-4">
                    <Col md={4}>
                      <Card className="text-center bg-success text-white">
                        <Card.Body>
                          <h6>Total Revenue</h6>
                          <h3>TZS {salesReport.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center bg-primary text-white">
                        <Card.Body>
                          <h6>Total Orders</h6>
                          <h3>{salesReport.totalOrders}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center bg-info text-white">
                        <Card.Body>
                          <h6>Average Order Value</h6>
                          <h3>TZS {salesReport.averageOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <h5>Order Details</h5>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Items</th>
                        <th>Amount (TZS)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.orders.map((order) => {
                        const sellerItems = order.items.filter((item: any) => item.product?.seller);
                        const orderTotal = sellerItems.reduce((sum: number, item: any) => 
                          sum + (item.price * item.quantity), 0
                        );
                        return (
                          <tr key={order._id}>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td><small>{order._id.substring(0, 8)}...</small></td>
                            <td>{order.buyer?.name || 'N/A'}</td>
                            <td>{sellerItems.length}</td>
                            <td>{orderTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td><span className="badge bg-primary">{order.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Stock Report Tab */}
        <Tab eventKey="stock" title="📦 Stock Report">
          <Card>
            <Card.Body>
              <Button onClick={fetchStockReport} disabled={loading} className="mb-3">
                {loading ? 'Loading...' : 'Generate Stock Report'}
              </Button>

              {stockReport && (
                <>
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h6>Total Products</h6>
                          <h3>{stockReport.summary.totalProducts}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h6>In Stock</h6>
                          <h3 className="text-success">{stockReport.summary.inStock}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h6>Low Stock</h6>
                          <h3 className="text-warning">{stockReport.summary.lowStock}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h6>Out of Stock</h6>
                          <h3 className="text-danger">{stockReport.summary.outOfStock}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="mb-4">
                    <Card.Header><h5>Total Stock Value</h5></Card.Header>
                    <Card.Body>
                      <h2 className="text-success">
                        TZS {stockReport.summary.totalStockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </h2>
                    </Card.Body>
                  </Card>

                  <h5>Category Breakdown</h5>
                  <Table responsive className="mb-4">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Total Stock</th>
                        <th>Total Value (TZS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stockReport.categoryBreakdown).map(([category, data]: [string, any]) => (
                        <tr key={category}>
                          <td><strong>{category}</strong></td>
                          <td>{data.count}</td>
                          <td>{data.totalStock}</td>
                          <td>{data.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <h5>Product Details</h5>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price (TZS)</th>
                        <th>Value (TZS)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockReport.products.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>
                            {product.stock === 0 ? (
                              <span className="badge bg-danger">{product.stock}</span>
                            ) : product.stock <= 10 ? (
                              <span className="badge bg-warning">{product.stock}</span>
                            ) : (
                              <span className="badge bg-success">{product.stock}</span>
                            )}
                          </td>
                          <td>{product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td>{product.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td>
                            {product.isAvailable && product.stock > 0 ? (
                              <span className="badge bg-success">Available</span>
                            ) : (
                              <span className="badge bg-secondary">Unavailable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Expense Report Tab */}
        <Tab eventKey="expenses" title="💰 Expense Report">
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Period</Form.Label>
                    <Form.Select
                      value={expensePeriod}
                      onChange={(e) => setExpensePeriod(e.target.value)}
                    >
                      <option value="daily">Today</option>
                      <option value="weekly">Last 7 Days</option>
                      <option value="monthly">Last 30 Days</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="yearly">Last 1 Year</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Button onClick={() => fetchExpenseReport(expensePeriod)} disabled={loading}>
                    {loading ? 'Loading...' : 'Generate Report'}
                  </Button>
                </Col>
              </Row>

              {expenseReport && (
                <>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Card className="text-center bg-danger text-white">
                        <Card.Body>
                          <h6>Total Expenses</h6>
                          <h3>TZS {expenseReport.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="text-center bg-warning text-white">
                        <Card.Body>
                          <h6>Number of Expenses</h6>
                          <h3>{expenseReport.expenseCount}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <h5>Category Breakdown</h5>
                  <Table responsive className="mb-4">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Total (TZS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(expenseReport.categoryBreakdown).map(([category, data]: [string, any]) => (
                        <tr key={category}>
                          <td><strong>{category}</strong></td>
                          <td>{data.count}</td>
                          <td className="text-danger">{data.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <h5>Expense Details</h5>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount (TZS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseReport.expenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.description}</td>
                          <td>{expense.category}</td>
                          <td className="text-danger">
                            <strong>{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ReportsPage;
