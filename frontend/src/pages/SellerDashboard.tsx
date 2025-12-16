import { Link, Outlet, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Container, Nav, Card, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';

const SellerDashboard = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        message: string;
        show: boolean;
    }>>([]);

    useEffect(() => {
        if (user && user._id) {
            // Connect to socket and join seller room
            socketService.connect();
            socketService.joinSeller(user._id);

            // Listen for new order notifications
            const handleNewOrder = (data: any) => {
                const notificationId = `${Date.now()}-${Math.random()}`;
                const message = `🎉 New order received! Order ID: ${data.orderId.toString().substring(0, 8)}... Total: TZS ${data.totalAmount.toFixed(2)}`;
                
                setNotifications(prev => [...prev, {
                    id: notificationId,
                    message,
                    show: true
                }]);

                // Auto-hide notification after 5 seconds
                setTimeout(() => {
                    setNotifications(prev => 
                        prev.map(n => n.id === notificationId ? { ...n, show: false } : n)
                    );
                }, 5000);

                // Play notification sound (optional)
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Could not play notification sound'));
            };

            socketService.on('newOrder', handleNewOrder);

            return () => {
                socketService.off('newOrder', handleNewOrder);
                socketService.disconnect();
            };
        }
    }, [user]);

    const closeNotification = (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, show: false } : n)
        );
    };

    return (
        <Container fluid>
            {/* Toast Notifications for new orders */}
            <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', zIndex: 9999 }}>
                {notifications.filter(n => n.show).map(notification => (
                    <Toast
                        key={notification.id}
                        onClose={() => closeNotification(notification.id)}
                        show={notification.show}
                        delay={5000}
                        autohide
                        bg="success"
                    >
                        <Toast.Header>
                            <strong className="me-auto">New Order!</strong>
                            <small>just now</small>
                        </Toast.Header>
                        <Toast.Body className="text-white">{notification.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
            <h2>{t('seller_dashboard_title')}</h2>
            <hr />

            <Row>
                {/* Main Content Area (Left Side) */}
                <Col md={9}>
                    <Outlet />
                </Col>

                {/* Admin Navigation Sidebar (Right Side) */}
                <Col md={3}>
                    <Card className="sticky-top" style={{ top: '20px' }}>
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">📊 {t('admin_page_title')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <h6 className="text-primary mb-3">🛍️ {t('product_management_title')}</h6>
                            <Nav className="flex-column mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/products"
                                        active={location.pathname === '/seller/products' || location.pathname === '/seller' || location.pathname === '/seller/'}
                                        className="text-dark py-2"
                                    >
                                        📦 {t('products_tab')}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/manage-products"
                                        active={location.pathname === '/seller/manage-products'}
                                        className="text-dark py-2"
                                    >
                                        ➕ {t('manage_products_tab')}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/inventory"
                                        active={location.pathname === '/seller/inventory'}
                                        className="text-dark py-2"
                                    >
                                        📊 Inventory
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <h6 className="text-primary mb-3">📮 {t('parcel_management_title')}</h6>
                            <Nav className="flex-column mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/parcel-management"
                                        active={location.pathname === '/seller/parcel-management'}
                                        className="text-dark py-2"
                                    >
                                        📦 {t('parcel_management_tab')}
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <h6 className="text-primary mb-3">📊 Analytics</h6>
                            <Nav className="flex-column mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/expenses"
                                        active={location.pathname === '/seller/expenses'}
                                        className="text-dark py-2"
                                    >
                                        💰 Expenses
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/reports"
                                        active={location.pathname === '/seller/reports'}
                                        className="text-dark py-2"
                                    >
                                        📈 Reports
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SellerDashboard;
