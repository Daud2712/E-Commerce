import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../services/api';
import { useLanguage } from '../context/LanguageContext'; // Import useLanguage
// Import useTranslation

const SettingsPage: React.FC = () => {
    console.log("SettingsPage rendering...");
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const { language, changeLanguage } = useLanguage(); // Use useLanguage hook
    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            logout(); // Log out the user after successful deletion
            navigate('/'); // Redirect to home or login page
            alert('Your account has been deleted'); // Translated alert
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account'); // Translated error
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<any>) => {
        changeLanguage(e.target.value); // Use changeLanguage from context
    };

    return (
        <Container className="my-5">
            <h2 className="mb-4">{'Settings'}</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4">
                <Card.Header>{'Language Settings'}</Card.Header>
                <Card.Body>
                    <Form.Group controlId="languageSelect">
                        <Form.Label>{'Select Language'}</Form.Label>
                        <Form.Control as="select" value={language} onChange={handleLanguageChange}>
                            <option value="en">{'English'}</option>
                            <option value="es">{'Spanish'}</option>
                            <option value="fr">{'French'}</option>
                            <option value="sw">{'Swahili'}</option>
                            <option value="de">{'German'}</option>
                            <option value="zh">{'Chinese'}</option>
                        </Form.Control>
                    </Form.Group>
                    <p className="mt-3 text-muted">
                        {'Select your preferred language for the interface'}
                    </p>
                </Card.Body>
            </Card>

            {isAuthenticated && (
                <Card border="danger">
                    <Card.Header className="bg-danger text-white">{'Danger Zone'}</Card.Header>
                    <Card.Body>
                        <Card.Title>{'Delete Account'}</Card.Title>
                        <Card.Text>
                            {'Permanently delete your account and all data'}
                        </Card.Text>
                        <Button variant="outline-danger" onClick={() => {
                            setShowDeleteModal(true);
                        }}>
                            {'Delete My Account'}
                        </Button>
                    </Card.Body>
                </Card>
            )}

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{'Confirm Account Deletion'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {'Are you sure you want to delete your account? This action cannot be undone.'}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        {'Cancel'}
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        {'Delete Account'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SettingsPage;
