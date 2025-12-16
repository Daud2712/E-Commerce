import React from 'react';
import { Dropdown, Badge, ListGroup } from 'react-bootstrap';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒';
      case 'delivery': return '🚚';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="light" id="notification-dropdown" className="position-relative">
        🔔
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '350px', maxHeight: '500px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {notifications.length > 0 && (
            <div>
              <button 
                className="btn btn-sm btn-link p-0 me-2" 
                onClick={markAllAsRead}
                style={{ fontSize: '0.8rem' }}
              >
                Mark all read
              </button>
              <button 
                className="btn btn-sm btn-link p-0 text-danger" 
                onClick={clearAll}
                style={{ fontSize: '0.8rem' }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No notifications
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notif) => (
              <ListGroup.Item
                key={notif.id}
                className={`py-2 ${!notif.read ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="d-flex">
                  <div className="me-2" style={{ fontSize: '1.2rem' }}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {notif.message}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                  {!notif.read && (
                    <div>
                      <Badge bg="primary" pill style={{ fontSize: '0.6rem' }}>New</Badge>
                    </div>
                  )}
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
