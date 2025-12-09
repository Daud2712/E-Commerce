import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import TrackingPage from './pages/TrackingPage';
import SellerDashboard from './pages/SellerDashboard';
import DriverDashboard from './pages/DriverDashboard';

import { useAuth } from './context/AuthContext';
import { UserRole } from './types';

function App() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Freshedtz</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && role === UserRole.Seller && (
                <Nav.Link as={Link} to="/seller-dashboard">Dashboard</Nav.Link>
              )}
              {isAuthenticated && role === UserRole.Driver && (
                <Nav.Link as={Link} to="/driver-dashboard">Dashboard</Nav.Link>
              )}
              <Nav.Link as={Link} to="/track">Track Package</Nav.Link>
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<h1>Welcome to Freshedtz</h1>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/track" element={<TrackingPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
