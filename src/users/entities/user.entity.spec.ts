import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
  });

  it('should be defined', () => {
    expect(user).toBeDefined();
  });

  it('should have correct properties', () => {
    user.id = '123e4567-e89b-12d3-a456-426614174000';
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    user.name = 'Test User';

    expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('hashedPassword');
    expect(user.name).toBe('Test User');
  });

  it('should allow setting all properties', () => {
    const userData = {
      id: '456e7890-e89b-12d3-a456-426614174001',
      email: 'user@test.com',
      password: 'securePassword',
      name: 'John Doe',
    };

    Object.assign(user, userData);

    expect(user.id).toBe(userData.id);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.name).toBe(userData.name);
  });
});