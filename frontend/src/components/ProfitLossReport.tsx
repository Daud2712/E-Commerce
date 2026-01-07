import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';
import api from '../services/api';

interface ProfitLossData {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  orders: number;
  expenseItems: any[];
}

const ProfitLossReport: React.FC = () => {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfitLoss();
  }, [period]);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch sales data
      const salesRes = await api.get(`/reports/sales?period=${period}`);
      const expenseRes = await api.get(`/reports/expenses?period=${period}`);
      
      const totalRevenue = salesRes.data.totalRevenue || 0;
      const totalExpenses = expenseRes.data.totalExpenses || 0;
      const grossProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      setData({
        period: salesRes.data.period,
        startDate: salesRes.data.startDate,
        endDate: salesRes.data.endDate,
        totalRevenue,
        totalExpenses,
        grossProfit,
        netProfit: grossProfit,
        profitMargin,
        orders: salesRes.data.totalOrders,
        expenseItems: expenseRes.data.expenseItems || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profit and loss report');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'success' : 'danger';
  };

  return (
    <div className="profit-loss-report">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">📊 Profit & Loss Report</h4>
        </Card.Header>
        <Card.Body>
          {/* Period Selector */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Select Period:</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {[
                { value: 'daily', label: '📅 Daily' },
                { value: 'weekly', label: '📆 Weekly' },
                { value: 'monthly', label: '📊 Monthly' },
                { value: '6months', label: '📈 6 Months' },
                { value: 'yearly', label: '📉 Yearly' },
              ].map(opt => (
                <Button
                  key={opt.value}
                  variant={period === opt.value ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setPeriod(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading report...</p>
            </div>
          ) : data ? (
            <>
              {/* Date Range */}
              <Row className="mb-4">
                <Col md={12}>
                  <small className="text-muted">
                    📅 Period: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                  </small>
                </Col>
              </Row>

              {/* Key Metrics */}
              <Row className="mb-4">
                <Col md={6} lg={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body className="bg-success text-white rounded">
                      <h6>Total Revenue</h6>
                      <h3>{formatCurrency(data.totalRevenue)}</h3>
                      <small>({data.orders} orders)</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body className="bg-danger text-white rounded">
                      <h6>Total Expenses</h6>
                      <h3>{formatCurrency(data.totalExpenses)}</h3>
                      <small>({data.expenseItems?.length || 0} items)</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body className={`bg-${getProfitColor(data.grossProfit)} text-white rounded`}>
                      <h6>Gross Profit</h6>
                      <h3>{formatCurrency(data.grossProfit)}</h3>
                      <small>{data.profitMargin.toFixed(2)}% margin</small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} lg={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body className={`bg-${getProfitColor(data.netProfit)} text-white rounded`}>
                      <h6>Net Profit</h6>
                      <h3>{formatCurrency(data.netProfit)}</h3>
                      <small>Bottom line</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Detailed P&L Statement */}
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">📋 Detailed Profit & Loss Statement</h6>
                </Card.Header>
                <Card.Body>
                  <Table responsive className="mb-0">
                    <tbody>
                      <tr>
                        <td><strong>Total Revenue</strong></td>
                        <td className="text-end"><strong className="text-success">{formatCurrency(data.totalRevenue)}</strong></td>
                      </tr>
                      <tr>
                        <td><strong>Total Expenses</strong></td>
                        <td className="text-end"><strong className="text-danger">-{formatCurrency(data.totalExpenses)}</strong></td>
                      </tr>
                      <tr className="border-top-2">
                        <td><strong>Gross Profit</strong></td>
                        <td className="text-end"><strong className={`text-${getProfitColor(data.grossProfit)}`}>{formatCurrency(data.grossProfit)}</strong></td>
                      </tr>
                      <tr>
                        <td><strong>Profit Margin</strong></td>
                        <td className="text-end"><strong>{data.profitMargin.toFixed(2)}%</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Expense Breakdown */}
              {data.expenseItems && data.expenseItems.length > 0 && (
                <Card>
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">💰 Expense Breakdown</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped hover>
                      <thead className="table-light">
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>% of Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.expenseItems.map((expense, idx) => (
                          <tr key={idx}>
                            <td>{expense.category}</td>
                            <td className="text-danger">{formatCurrency(expense.amount)}</td>
                            <td>{((expense.amount / data.totalRevenue) * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {/* Summary */}
              <Alert className="mt-4" variant={getProfitColor(data.netProfit) === 'success' ? 'success' : 'warning'}>
                <strong>📊 Summary:</strong> {' '}
                {data.netProfit >= 0
                  ? `You made a profit of ${formatCurrency(data.netProfit)} this ${period}! Keep up the good work!`
                  : `You're running at a loss of ${formatCurrency(Math.abs(data.netProfit))} this ${period}. Consider reviewing your expenses.`
                }
              </Alert>
            </>
          ) : null}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfitLossReport;
