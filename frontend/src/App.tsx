import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

import TrackingPage from './pages/TrackingPage';
import SellerDashboard from './pages/SellerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import BuyerDashboard from './pages/BuyerDashboard'; // Import BuyerDashboard
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage

import { useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function App() {
  const { isAuthenticated, role, logout } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Freshedtz</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && role === UserRole.Seller && (
                <Nav.Link as={Link} to="/seller-dashboard">{t('dashboard_button')}</Nav.Link>
              )}
              {isAuthenticated && role === UserRole.Driver && (
                <Nav.Link as={Link} to="/driver-dashboard">{t('dashboard_button')}</Nav.Link>
              )}
              {isAuthenticated && role === UserRole.Buyer && (
                <Nav.Link as={Link} to="/buyer-dashboard">{t('dashboard_button')}</Nav.Link>
              )}

            </Nav>
            <Nav>
              {isAuthenticated && <Nav.Link onClick={logout}>{t('logout_button')}</Nav.Link>}
              {!isAuthenticated && <Nav.Link as={Link} to="/login">{t('login_button')}</Nav.Link>}
              {!isAuthenticated && <Nav.Link as={Link} to="/register">{t('register_button')}</Nav.Link>}
              <Nav.Link as={Link} to="/settings">{t('settings_title')}</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={
            isAuthenticated && role === UserRole.Buyer ? (
              <BuyerDashboard />
            ) : (
              <h1>{t('welcome_message')}</h1>
            )
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Protected Seller Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.Seller]} />}>
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
          </Route>

          {/* Protected Driver Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.Driver]} />}>
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
          </Route>

          {/* Protected Buyer Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.Buyer]} />}>
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          </Route>


        </Routes>
      </Container>
    </Router>
  );
}

export default App;
