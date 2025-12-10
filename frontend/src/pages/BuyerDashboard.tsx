import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Tabs, Tab, Nav } from 'react-bootstrap';
import * as api from '../services/api';
import { Delivery } from '../types';
import TrackingPage from './TrackingPage'; // Import TrackingPage
import { useTranslation } from 'react-i18next'; // Import useTranslation

const BuyerDashboard = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('deliveries'); // New state for active tab
  const { t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    if (activeTab === 'deliveries') { // Only fetch deliveries if the deliveries tab is active
      const fetchDeliveries = async () => {
        try {
          setLoading(true);
          const { data } = await api.getBuyerDeliveries();
          setDeliveries(data);
        } catch (err: any) {
          setError(err.response?.data?.message || t('buyer_deliveries_fetch_error')); // Translated error
        } finally {
          setLoading(false);
        }
      };
      fetchDeliveries();
    }
  }, [activeTab]); // Rerun effect when activeTab changes

  return (
    <Container>
      <h2>{t('buyer_dashboard_title')}</h2>
      <hr />
      <Tabs
        id="buyer-dashboard-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k!)}
        className="mb-3"
      >
        <Tab eventKey="deliveries" title={t('your_deliveries_tab')}>
          <h4>{t('your_deliveries_tab')}</h4>
          {loading && <Spinner animation="border" />}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>{t('tracking_number_header')}</th>
                  <th>{t('package_name_header')}</th>
                  <th>{t('status_header')}</th>
                  <th>{t('seller_header')}</th>
                  <th>{t('driver_header')}</th>
                  <th>{t('buyer_registration_no_header')}</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length > 0 ? (
                  deliveries.map((delivery) => (
                    <tr key={delivery._id}>
                      <td>{delivery.trackingNumber}</td>
                      <td>{delivery.packageName}</td>
                      <td>{delivery.status}</td>
                      <td>{delivery.seller.name}</td>
                      <td>{delivery.driver ? delivery.driver.name : t('not_yet_assigned_driver')}</td>
                      <td>{delivery.buyer?.registrationNumber || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">{t('no_deliveries_found')}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="profile" title={t('profile_tab')}>
          <h4>{t('your_profile_title')}</h4>
          <p>{t('profile_content_placeholder')}</p>
        </Tab>
        <Tab eventKey="orderHistory" title={t('order_history_tab')}>
          <h4>{t('your_order_history_title')}</h4>
          <p>{t('order_history_content_placeholder')}</p>
        </Tab>
        <Tab eventKey="trackPackage" title={t('track_package_tab')}>
          <TrackingPage />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default BuyerDashboard;
