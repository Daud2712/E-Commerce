import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [allSellers, setAllSellers] = useState<User[]>([]);
  const [allRiders, setAllRiders] = useState<User[]>([]);
  const [allBuyers, setAllBuyers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [approvingAllBuyers, setApprovingAllBuyers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserName, setDeleteUserName] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [sellersRes, ridersRes, buyersRes] = await Promise.all([
        api.getAllSellers(token!),
        api.getAllRiders(token!),
        api.getAllBuyers(token!)
      ]);
      console.log('[AdminDashboard] Sellers response:', sellersRes.data);
      console.log('[AdminDashboard] Riders response:', ridersRes.data);
      console.log('[AdminDashboard] Buyers response:', buyersRes.data);
      setAllSellers(sellersRes.data || []);
      setAllRiders(ridersRes.data || []);
      setAllBuyers(buyersRes.data || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load users';
      console.error('[AdminDashboard] Error loading admin data:', { status: error.response?.status, message: errorMsg, error });
      setError(`Error loading users: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.approveUser(userId, token!);
      alert('User approved successfully');
      loadData();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const handleReject = async () => {
    try {
      await api.rejectUser(selectedUserId, reason, token!);
      alert('User rejected successfully');
      setShowRejectModal(false);
      setReason('');
      loadData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const handleSuspend = async () => {
    try {
      await api.suspendUser(selectedUserId, reason, token!);
      alert('User suspended successfully');
      setShowSuspendModal(false);
      setReason('');
      loadData();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await api.reactivateUser(userId, token!);
      alert('User reactivated successfully');
      loadData();
    } catch (error) {
      console.error('Error reactivating user:', error);
      alert('Failed to reactivate user');
    }
  };

  const handleApproveAllBuyers = async () => {
    if (!window.confirm('Are you sure you want to approve all pending buyer accounts?')) {
      return;
    }

    try {
      setApprovingAllBuyers(true);
      const response = await api.approveAllBuyers(token!);
      alert(`✅ ${response.data.approvedCount} buyer account(s) approved successfully!`);
      loadData();
    } catch (error) {
      console.error('Error approving buyers:', error);
      alert('Failed to approve buyer accounts');
    } finally {
      setApprovingAllBuyers(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.deleteUser(selectedUserId, token!);
      alert(`✅ User "${deleteUserName}" deleted successfully`);
      setShowDeleteModal(false);
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
      suspended: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h3>Loading...</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Sellers</Card.Title>
              <h3>{allSellers.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Riders</Card.Title>
              <h3>{allRiders.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Buyers</Card.Title>
              <h3>{allBuyers.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="sellers" className="mb-3">
        <Tab eventKey="sellers" title={`Sellers (${allSellers.length})`}>
          <Card>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSellers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">No sellers found</td>
                    </tr>
                  ) : (
                    allSellers.map((seller) => (
                      <tr key={seller._id}>
                        <td>{seller.name}</td>
                        <td>{seller.email}</td>
                        <td>{getStatusBadge(seller.status)}</td>
                        <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                        <td>
                          {seller.status === 'pending' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleApprove(seller._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(seller._id);
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          ) : seller.status === 'suspended' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleReactivate(seller._id)}
                              >
                                Reactivate
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(seller._id);
                                  setDeleteUserName(seller.name);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          ) : seller.status === 'approved' ? (
                            <>
                              <Button
                                variant="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setSelectedUserId(seller._id);
                                  setShowSuspendModal(true);
                                }}
                              >
                                Suspend
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(seller._id);
                                  setDeleteUserName(seller.name);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(seller._id);
                                setDeleteUserName(seller.name);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="riders" title={`Riders (${allRiders.length})`}>
          <Card>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allRiders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">No riders found</td>
                    </tr>
                  ) : (
                    allRiders.map((rider) => (
                      <tr key={rider._id}>
                        <td>{rider.name}</td>
                        <td>{rider.email}</td>
                        <td>{getStatusBadge(rider.status)}</td>
                        <td>{new Date(rider.createdAt).toLocaleDateString()}</td>
                        <td>
                          {rider.status === 'pending' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleApprove(rider._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(rider._id);
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          ) : rider.status === 'suspended' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleReactivate(rider._id)}
                              >
                                Reactivate
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(rider._id);
                                  setDeleteUserName(rider.name);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          ) : rider.status === 'approved' ? (
                            <>
                              <Button
                                variant="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setSelectedUserId(rider._id);
                                  setShowSuspendModal(true);
                                }}
                              >
                                Suspend
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(rider._id);
                                  setDeleteUserName(rider.name);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(rider._id);
                                setDeleteUserName(rider.name);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="buyers" title={`Buyers (${allBuyers.length})`}>
          <Card>
            <Card.Body>
              {allBuyers.some((buyer) => (buyer as any).status === 'pending') && (
                <div className="mb-3">
                  <Button
                    variant="success"
                    onClick={handleApproveAllBuyers}
                    disabled={approvingAllBuyers}
                    className="mb-3"
                  >
                    {approvingAllBuyers ? 'Approving...' : '✅ Approve All Pending Buyers'}
                  </Button>
                </div>
              )}
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registration Number</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBuyers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">No buyers found</td>
                    </tr>
                  ) : (
                    allBuyers.map((buyer) => (
                      <tr key={buyer._id}>
                        <td>{buyer.name}</td>
                        <td>{buyer.email}</td>
                        <td><code>{(buyer as any).registrationNumber || 'N/A'}</code></td>
                        <td>{getStatusBadge(buyer.status)}</td>
                        <td>{new Date(buyer.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(buyer._id);
                              setDeleteUserName(buyer.name);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!reason.trim()}>
            Reject User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Suspend Modal */}
      <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Suspend User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for suspension</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSuspend} disabled={!reason.trim()}>
            Suspend User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>⚠️ Warning:</strong> This action is permanent and cannot be undone. You are about to delete the account for <strong>{deleteUserName}</strong>.
          </Alert>
          <p>Are you sure you want to delete this account? All associated data will be removed.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
