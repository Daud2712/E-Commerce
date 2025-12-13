import { Link, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { Container, Nav, Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const SellerDashboard = () => {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <Container fluid>
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
                            </Nav>

                            <h6 className="text-primary mb-3">📮 {t('parcel_management_title')}</h6>
                            <Nav className="flex-column">
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
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SellerDashboard;
