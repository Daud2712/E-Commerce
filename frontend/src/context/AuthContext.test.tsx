import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import socketService from './services/socket';

// Mock the socket service
jest.mock('./services/socket', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
  disconnect: jest.fn(),
  joinUser: jest.fn(),
  joinSeller: jest.fn(),
  joinRider: jest.fn(),
}));

const TestComponent = () => {
  const { login, logout, userId, role } = useAuth();

  return (
    <div>
      <div data-testid="userId">{userId}</div>
      <div data-testid="role">{role}</div>
      <button onClick={() => login('token1', 'user1', 'buyer')}>Login as Buyer</button>
      <button onClick={() => login('token2', 'user2', 'seller')}>Login as Seller</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should connect and join the correct room when a buyer logs in', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login as Buyer'));

    expect(socketService.connect).toHaveBeenCalled();
    expect(socketService.joinUser).toHaveBeenCalledWith('user1');
    expect(socketService.joinSeller).not.toHaveBeenCalled();
    expect(socketService.joinRider).not.toHaveBeenCalled();
  });

  it('should disconnect the socket on logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login as Buyer'));
    fireEvent.click(screen.getByText('Logout'));

    expect(socketService.disconnect).toHaveBeenCalled();
  });

  it('should disconnect the old socket and connect with the new user when switching users', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login as buyer
    fireEvent.click(screen.getByText('Login as Buyer'));

    await waitFor(() => {
      expect(screen.getByTestId('userId')).toHaveTextContent('user1');
    });

    expect(socketService.connect).toHaveBeenCalledTimes(1);
    expect(socketService.joinUser).toHaveBeenCalledWith('user1');

    // Logout
    fireEvent.click(screen.getByText('Logout'));
    expect(socketService.disconnect).toHaveBeenCalledTimes(1);

    // Login as seller
    fireEvent.click(screen.getByText('Login as Seller'));

    await waitFor(() => {
      expect(screen.getByTestId('userId')).toHaveTextContent('user2');
    });

    expect(socketService.connect).toHaveBeenCalledTimes(2);
    expect(socketService.joinSeller).toHaveBeenCalledWith('user2');
  });
});
