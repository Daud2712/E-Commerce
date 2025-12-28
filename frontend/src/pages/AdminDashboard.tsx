import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
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
  const [pendingSellers, setPendingSellers] = useState<User[]>([]);
  const [pendingRiders, setPendingRiders] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sellersRes, ridersRes, usersRes] = await Promise.all([
        api.getPendingSellers(token!),
        api.getPendingRiders(token!),
        api.getAllUsers(token!)
      ]);
      setPendingSellers(sellersRes.data);
      setPendingRiders(ridersRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
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

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pending Sellers</Card.Title>
              <h3>{pendingSellers.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pending Riders</Card.Title>
              <h3>{pendingRiders.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h3>{allUsers.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="pending-sellers" className="mb-3">
        <Tab eventKey="pending-sellers" title={`Pending Sellers (${pendingSellers.length})`}>
          <Card>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No pending sellers</td>
                    </tr>
                  ) : (
                    pendingSellers.map((seller) => (
                      <tr key={seller._id}>
                        <td>{seller.name}</td>
                        <td>{seller.email}</td>
                        <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                        <td>
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="pending-riders" title={`Pending Riders (${pendingRiders.length})`}>
          <Card>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRiders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No pending riders</td>
                    </tr>
                  ) : (
                    pendingRiders.map((rider) => (
                      <tr key={rider._id}>
                        <td>{rider.name}</td>
                        <td>{rider.email}</td>
                        <td>{new Date(rider.createdAt).toLocaleDateString()}</td>
                        <td>
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="all-users" title="All Users">
          <Card>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><Badge bg="info">{user.role}</Badge></td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>
                        {user.status === 'suspended' ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleReactivate(user._id)}
                          >
                            Reactivate
                          </Button>
                        ) : user.status === 'approved' && user.role !== 'admin' ? (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setShowSuspendModal(true);
                            }}
                          >
                            Suspend
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Reject Modal */}
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
    </Container>
  );
};

export default AdminDashboard;
