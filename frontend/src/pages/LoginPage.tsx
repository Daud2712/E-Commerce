import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { UserRole } from '../types';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await api.login({ email, password });
      auth.login(data.token, data.userId, data.role);
      
      if (data.role === UserRole.Seller) {
        navigate('/seller-dashboard');
      } else if (data.role === UserRole.Driver) {
        navigate('/driver-dashboard');
      } else {
        navigate('/'); // Or a buyer dashboard if one exists
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default LoginPage;
