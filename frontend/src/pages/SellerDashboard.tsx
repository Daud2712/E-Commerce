import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table, Spinner, Dropdown } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery, User } from '../types';

const SellerDashboard = () => {
    // Form state
    const [packageName, setPackageName] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [buyerAddress, setBuyerAddress] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Delivery list state
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

    // Drivers list state
    const [drivers, setDrivers] = useState<User[]>([]);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const { data } = await api.getDeliveries();
            setDeliveries(data);
        } catch (err: any) {
            setListError(err.response?.data?.message || 'Could not fetch deliveries.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const { data } = await api.getAvailableDrivers();
            setDrivers(data);
        } catch (err: any) {
            console.error("Could not fetch drivers:", err);
        }
    };

    useEffect(() => {
        fetchDeliveries();
        fetchDrivers();
    }, []);

    const handleCreateDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        const deliveryData = {
            packageName,
            buyer: { name: buyerName, address: buyerAddress },
        };

        try {
            await api.createDelivery(deliveryData);
            setFormSuccess('Delivery created successfully!');
            setPackageName('');
            setBuyerName('');
            setBuyerAddress('');
            fetchDeliveries();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Something went wrong.');
        }
    };

    const handleAssignDriver = async (deliveryId: string, driverId: string) => {
        try {
            await api.assignDriver(deliveryId, driverId);
            fetchDeliveries();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Could not assign driver.');
        }
    };

    return (
        <Container>
            <h2>Seller Dashboard</h2>
            <hr />
            <h4>Create New Delivery</h4>
            {formError && <Alert variant="danger">{formError}</Alert>}
            {formSuccess && <Alert variant="success">{formSuccess}</Alert>}
            <Form onSubmit={handleCreateDelivery}>
                {/* ... form fields ... */}
            </Form>
            <hr />
            <h4>Your Deliveries</h4>
            {loading && <Spinner animation="border" />}
            {listError && <Alert variant="danger">{listError}</Alert>}
            {!loading && !listError && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Tracking Number</th>
                            <th>Package</th>
                            <th>Status</th>
                            <th>Buyer</th>
                            <th>Address</th>
                            <th>Assign Driver</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveries.map((delivery) => (
                            <tr key={delivery._id}>
                                <td>{delivery.trackingNumber}</td>
                                <td>{delivery.packageName}</td>
                                <td>{delivery.status}</td>
                                <td>{delivery.buyer.name}</td>
                                <td>{delivery.buyer.address}</td>
                                <td>
                                    {delivery.status === 'pending' && (
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" size="sm">
                                                Assign
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {drivers.map(driver => (
                                                    <Dropdown.Item key={driver._id} onClick={() => handleAssignDriver(delivery._id, driver._id)}>
                                                        {driver.name}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}
                                    {delivery.status !== 'pending' && (delivery.driver ? 'Assigned' : 'N/A')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default SellerDashboard;
