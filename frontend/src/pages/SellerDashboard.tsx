import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table, Spinner, Dropdown, Tabs, Tab } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User } from '../types';
import TrackingPage from './TrackingPage'; // Import TrackingPage
import { useTranslation } from 'react-i18next'; // Import useTranslation

const SellerDashboard = () => {
    // Form state
    const [packageName, setPackageName] = useState('');
    const [buyerRegistrationNumber, setBuyerRegistrationNumber] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(1); // New state for quantity, default to 1
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [createDeliveryLoading, setCreateDeliveryLoading] = useState(false); // New loading state for delivery creation

    // Delivery list state
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

    // Drivers list state
    const [drivers, setDrivers] = useState<User[]>([]);
    const [driverListError, setDriverListError] = useState(''); // New state for driver list errors

    const [activeTab, setActiveTab] = useState('manageDeliveries'); // New state for active tab
    const { t } = useTranslation(); // Initialize useTranslation

    console.log('SellerDashboard: Current deliveries', deliveries);
    console.log('SellerDashboard: Available/Busy Drivers', drivers);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const { data } = await api.getDeliveries();
            setDeliveries(data);
        } catch (err: any) {
            setListError(err.response?.data?.message || t('seller_fetch_deliveries_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const { data } = await api.getAvailableDrivers();
            setDrivers(data);
            setDriverListError(''); // Clear error on success
        } catch (err: any) {
            console.error("Could not fetch drivers:", err);
            setDriverListError(err.response?.data?.message || t('seller_fetch_drivers_error')); // Set error message
        }
    };

    useEffect(() => {
        if (activeTab === 'manageDeliveries') {
            fetchDeliveries();
            fetchDrivers();
        }
    }, [activeTab]);

    const handleCreateDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setCreateDeliveryLoading(true);

        const deliveryData = {
            packageName,
            buyerRegistrationNumber, // Use buyerRegistrationNumber
            price,
        };

        try {
            await api.createDelivery(deliveryData);
            setFormSuccess(t('delivery_created_success_message'));
            setPackageName('');
            setBuyerRegistrationNumber(''); // Reset buyer registration number
            setPrice(0); // Reset price
            fetchDeliveries();
        } catch (err: any) {
            setFormError(err.response?.data?.message || t('delivery_create_error'));
        } finally {
            setCreateDeliveryLoading(false);
        }
    };

    const handleAssignDriver = async (deliveryId: string, driverId: string) => {
        try {
            await api.assignDriver(deliveryId, driverId);
            fetchDeliveries();
        } catch (err: any) {
            alert(err.response?.data?.message || t('assign_driver_error'));
        }
    };

    return (
        <Container>
            <h2>{t('seller_dashboard_title')}</h2>
            <hr />
            <Tabs
                id="seller-dashboard-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k!)}
                className="mb-3"
            >
                <Tab eventKey="manageDeliveries" title={t('manage_deliveries_tab')}>
                    <h4>{t('create_new_delivery_title')}</h4>
                    {formError && <Alert variant="danger">{formError}</Alert>}
                    {formSuccess && <Alert variant="success">{formSuccess}</Alert>}
                    <Form onSubmit={handleCreateDelivery}>
                        <Form.Group className="mb-3" controlId="packageName">
                            <Form.Label>{t('package_name_label')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('enter_package_name_placeholder')}
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="buyerRegistrationNumber">
                            <Form.Label>{t('buyer_registration_number_label')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('enter_buyer_registration_number_placeholder')}
                                value={buyerRegistrationNumber}
                                onChange={(e) => setBuyerRegistrationNumber(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="price">
                            <Form.Label>{t('price_label')}</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder={t('enter_price_placeholder')}
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                required
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="quantity">
                            <Form.Label>{t('quantity_label')}</Form.Label>
                            <Form.Control
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                min="1"
                                max="10"
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" disabled={createDeliveryLoading}>
                            {createDeliveryLoading ? t('creating_delivery_button') : t('create_delivery_button')}
                        </Button>
                    </Form>
                    <hr />
                    <h4>{t('your_deliveries_title')}</h4>
                    {loading && <Spinner animation="border" />}
                    {listError && <Alert variant="danger">{listError}</Alert>}
                    {driverListError && <Alert variant="danger">{driverListError}</Alert>} {/* Display driver list error */}
                    {!loading && !listError && (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>{t('tracking_number_header')}</th>
                                    <th>{t('package_header')}</th>
                                    <th>{t('status_header')}</th>
                                    <th>{t('buyer_name_header')}</th>
                                    <th>{t('buyer_registration_no_header')}</th>
                                    <th>{t('assign_driver_header')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map((delivery) => (
                                    <tr key={delivery._id}>
                                        <td>{delivery.trackingNumber}</td>
                                        <td>{delivery.packageName}</td>
                                        <td>{delivery.status}</td>
                                        <td>{delivery.buyer?.name || 'N/A'}</td>
                                        <td>{delivery.buyer?.registrationNumber || 'N/A'}</td>
                                        <td>
                                            {delivery.status === 'pending' && (
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" size="sm" disabled={drivers.filter(d => d.isAvailable).length === 0}>
                                                        {t('assign_driver_dropdown_text')} {drivers.filter(d => d.isAvailable).length === 0 ? t('no_available_drivers_text') : ''}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        {drivers.filter(d => d.isAvailable).map(driver => (
                                                            <Dropdown.Item key={driver._id} onClick={() => handleAssignDriver(delivery._id, driver._id)}>
                                                                {driver.name} ({t('available_driver_status')})
                                                            </Dropdown.Item>
                                                        ))}
                                                        {drivers.filter(d => !d.isAvailable).map(driver => (
                                                            <Dropdown.Item key={driver._id} disabled>
                                                                {driver.name} ({t('busy_driver_status')})
                                                            </Dropdown.Item>
                                                        ))}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            )}
                                            {delivery.status !== 'pending' && (delivery.driver ? t('assigned_driver_status') : 'N/A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Tab>
                <Tab eventKey="trackPackage" title={t('track_package_tab')}>
                    <TrackingPage />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default SellerDashboard;
