import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../services/api';
import { useLanguage } from '../context/LanguageContext'; // Import useLanguage
import { useTranslation } from 'react-i18next'; // Import useTranslation

const SettingsPage: React.FC = () => {
    console.log("SettingsPage rendering...");
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const { language, changeLanguage } = useLanguage(); // Use useLanguage hook
    const { t } = useTranslation(); // Initialize useTranslation

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            logout(); // Log out the user after successful deletion
            navigate('/'); // Redirect to home or login page
            alert(t('your_account_deleted_alert')); // Translated alert
        } catch (err: any) {
            setError(err.response?.data?.message || t('failed_to_delete_account_error')); // Translated error
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<any>) => {
        changeLanguage(e.target.value); // Use changeLanguage from context
    };

    return (
        <Container className="my-5">
            <h2 className="mb-4">{t('settings_title')}</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4">
                <Card.Header>{t('language_settings_header')}</Card.Header>
                <Card.Body>
                    <Form.Group controlId="languageSelect">
                        <Form.Label>{t('select_language_label')}</Form.Label>
                        <Form.Control as="select" value={language} onChange={handleLanguageChange}>
                            <option value="en">{t('language_english')}</option>
                            <option value="es">{t('language_spanish')}</option>
                            <option value="fr">{t('language_french')}</option>
                            <option value="sw">{t('language_swahili')}</option>
                            <option value="de">{t('language_german')}</option>
                            <option value="zh">{t('language_chinese')}</option>
                        </Form.Control>
                    </Form.Group>
                    <p className="mt-3 text-muted">
                        {t('language_selection_note')}
                    </p>
                </Card.Body>
            </Card>

            {isAuthenticated && (
                <Card border="danger">
                    <Card.Header className="bg-danger text-white">{t('danger_zone_header')}</Card.Header>
                    <Card.Body>
                        <Card.Title>{t('delete_account_title')}</Card.Title>
                        <Card.Text>
                            {t('delete_account_text')}
                        </Card.Text>
                        <Button variant="outline-danger" onClick={() => {
                            setShowDeleteModal(true);
                        }}>
                            {t('delete_my_account_button')}
                        </Button>
                    </Card.Body>
                </Card>
            )}

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('confirm_account_deletion_title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {t('confirm_account_deletion_body')}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        {t('cancel_button')}
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        {t('delete_account_button')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SettingsPage;
