import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize useTranslation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.login({ email, password });
      auth.login(data.token, data.userId, data.role);
      
      if (data.role === UserRole.Seller) {
        navigate('/seller-dashboard');
      } else if (data.role === UserRole.Driver) {
        navigate('/driver-dashboard');
      } else if (data.role === UserRole.Buyer) { // Explicitly redirect buyers to their dashboard
        navigate('/buyer-dashboard');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      const err = error as any;
      setError(err.response?.data?.message || t('invalid_credentials_error')); // Translated error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">{t('login_title')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>{t('email_address_label')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t('enter_email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>{t('password_label')}</Form.Label>
            <Form.Control
              type="password"
              placeholder={t('password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? t('logging_in_button') : t('login_button')}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default LoginPage;
