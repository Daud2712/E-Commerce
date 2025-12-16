import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

import SellerDashboard from './pages/SellerDashboard';
import RiderDashboard from './pages/RiderDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import SettingsPage from './pages/SettingsPage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProductsPage from './pages/ProductsPage';
import ManageProductsPage from './pages/ManageProductsPage';
import ParcelManagementPage from './pages/ParcelManagementPage';
import InventoryPage from './pages/InventoryPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';

import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import NotificationDropdown from './components/NotificationDropdown';
import { UserRole } from './types';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';

function App() {
  const { isAuthenticated, role, logout } = useAuth();
  const { getCartCount } = useCart();
  const { t } = useTranslation();

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img 
              src="/Logo.jpeg" 
              alt="Freshedtz Logo" 
              height="40" 
              className="me-2"
              style={{ borderRadius: '4px' }}
            />
            Freshedtz
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {role !== UserRole.RIDER && (
                <Nav.Link as={Link} to="/">{t('products_link')}</Nav.Link>
              )}

              {isAuthenticated && (
                <Nav.Link as={Link} to={
                  role === UserRole.SELLER ? "/seller/products" :
                  role === UserRole.RIDER ? "/rider-dashboard" :
                  "/deliveries"
                }>
                  {role === UserRole.SELLER ? t('admin_page_nav_link') :
                   role === UserRole.RIDER ? t('my_deliveries') :
                   t('track_parcels')}
                </Nav.Link>
              )}

              {isAuthenticated && role === UserRole.BUYER && (
                <Nav.Link as={Link} to="/my-orders">{t('my_orders')}</Nav.Link>
              )}

            </Nav>
            <Nav>
              {isAuthenticated && role === UserRole.BUYER && (
                <Nav.Link as={Link} to="/cart" className="position-relative">
                  🛒 {t('cart')}
                  {getCartCount() > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                      {getCartCount()}
                    </Badge>
                  )}
                </Nav.Link>
              )}
              {isAuthenticated && <NotificationDropdown />}
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
            role === UserRole.RIDER ? <RiderDashboard /> : <ProductListingPage />
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<ProtectedRoute allowedRoles={[UserRole.SELLER]} />}>
            <Route path="/seller" element={<SellerDashboard />}>
              <Route path="products" element={<ProductsPage />} />
              <Route path="manage-products" element={<ManageProductsPage />} />
              <Route path="parcel-management" element={<ParcelManagementPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route index element={<Navigate to="products" />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.RIDER]} />}>
            <Route path="/rider-dashboard" element={<RiderDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.BUYER]} />}>
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
          </Route>

          <Route path="/products" element={<ProductListingPage />} />

          <Route element={<ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.RIDER]} />}>
            <Route path="/deliveries" element={
              role === UserRole.RIDER ? <RiderDashboard /> : <BuyerDashboard />
            } />
          </Route>
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
