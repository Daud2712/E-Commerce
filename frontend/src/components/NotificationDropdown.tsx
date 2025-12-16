import React, { useState } from 'react';
import { Dropdown, Badge, ListGroup, Button } from 'react-bootstrap';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const [show, setShow] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'delivery':
        return '🚚';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} align="end">
      <Dropdown.Toggle
        variant="link"
        id="notification-dropdown"
        className="position-relative text-white text-decoration-none p-2"
        style={{ fontSize: '1.5rem' }}
      >
        🔔
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '400px', maxHeight: '500px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {notifications.length > 0 && (
            <div>
              {unreadCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none p-0 me-2"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none text-danger p-0"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: '3rem' }}>🔕</div>
            <p className="mb-0">No notifications</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item
                key={notification.id}
                className={`border-0 ${!notification.read ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <span className="me-2" style={{ fontSize: '1.2rem' }}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <strong className={!notification.read ? 'text-primary' : ''}>
                        {notification.title}
                      </strong>
                      {!notification.read && (
                        <Badge bg="primary" pill className="ms-2" style={{ fontSize: '0.6rem' }}>
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="mb-1 small" style={{ whiteSpace: 'pre-line' }}>
                      {notification.message}
                    </p>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-muted p-0 ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
