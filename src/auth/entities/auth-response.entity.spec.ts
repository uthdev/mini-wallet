import { AuthResponse } from './auth-response.entity';
import { User } from '../../users/entities/user.entity';

describe('AuthResponse', () => {
  it('should be defined', () => {
    expect(AuthResponse).toBeDefined();
  });

  it('should create an instance with required properties', () => {
    const mockUser: Omit<User, 'password'> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
    };

    const authResponse = new AuthResponse();
    authResponse.accessToken = 'jwt-token-123';
    authResponse.user = mockUser;

    expect(authResponse.accessToken).toBe('jwt-token-123');
    expect(authResponse.user).toEqual(mockUser);
  });

  it('should allow user to be undefined', () => {
    const authResponse = new AuthResponse();
    authResponse.accessToken = 'jwt-token-123';

    expect(authResponse.accessToken).toBe('jwt-token-123');
    expect(authResponse.user).toBeUndefined();
  });
});