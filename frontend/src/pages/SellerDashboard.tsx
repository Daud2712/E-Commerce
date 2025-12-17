import { Link, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { Container, Nav, Card, Row, Col } from 'react-bootstrap';
const SellerDashboard = () => {
    const location = useLocation();

    return (
        <Container fluid>
            <h2>{'Seller Dashboard'}</h2>
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
                            <h5 className="mb-0">📊 {'Admin Page'}</h5>
                        </Card.Header>
                        <Card.Body>
                            <h6 className="text-primary mb-3">🛍️ {'Product Management'}</h6>
                            <Nav className="flex-column mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/products"
                                        active={location.pathname === '/seller/products' || location.pathname === '/seller' || location.pathname === '/seller/'}
                                        className="text-dark py-2"
                                    >
                                        📦 {'Products'}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/manage-products"
                                        active={location.pathname === '/seller/manage-products'}
                                        className="text-dark py-2"
                                    >
                                        ➕ {'Manage Products'}
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

                            <h6 className="text-primary mb-3">📮 {'Parcel Management'}</h6>
                            <Nav className="flex-column mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/seller/parcel-management"
                                        active={location.pathname === '/seller/parcel-management'}
                                        className="text-dark py-2"
                                    >
                                        📦 {'Parcel Management'}
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
