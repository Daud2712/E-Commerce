import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Form, Row, Col, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Office Supplies',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    'Office Supplies',
    'Utilities',
    'Rent',
    'Marketing',
    'Transportation',
    'Salaries',
    'Equipment',
    'Packaging',
    'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to fetch expenses.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      };

      if (editingExpense) {
        await axios.put(`${API_URL}/expenses/${editingExpense._id}`, expenseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/expenses`, expenseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: '',
        category: 'Office Supplies',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      setError(err.response?.data?.message || 'Failed to save expense.');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses();
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense.');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc: any, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  if (loading) {
    return <Container className="mt-5 text-center"><p>Loading expenses...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>💰 Expense Tracking</h2>
        <Button variant="primary" onClick={() => {
          setEditingExpense(null);
          setFormData({
            description: '',
            amount: '',
            category: 'Office Supplies',
            date: new Date().toISOString().split('T')[0]
          });
          setShowModal(true);
        }}>
          ➕ Add Expense
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Total Expenses</h5>
              <h2 className="text-danger">TZS {totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Number of Expenses</h5>
              <h2 className="text-primary">{expenses.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-muted">Average Expense</h5>
              <h2 className="text-info">
                TZS {expenses.length > 0 ? (totalExpenses / expenses.length).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Category Breakdown */}
      <Card className="mb-4">
        <Card.Header><h5>Expenses by Category</h5></Card.Header>
        <Card.Body>
          <Row>
            {Object.entries(categoryTotals).map(([category, total]: [string, any]) => (
              <Col md={4} key={category} className="mb-2">
                <strong>{category}:</strong> TZS {total.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Expenses Table */}
      <Card>
        <Card.Header><h5>All Expenses</h5></Card.Header>
        <Card.Body>
          {expenses.length === 0 ? (
            <p className="text-center text-muted">No expenses recorded yet.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount (TZS)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td className="text-danger">
                      <strong>{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(expense)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(expense._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Enter expense description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount (TZS)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ExpensesPage;
