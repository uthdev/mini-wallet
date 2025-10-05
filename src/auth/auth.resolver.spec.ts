import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './entities/auth-response.entity';
import { User } from '../users/entities/user.entity';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'jwt-token',
    user: mockUser,
  };

  const mockAuthService = {
    register: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await resolver.register(input);

      expect(mockAuthService.register).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };

      const mockAuthResponse: AuthResponse = {
        accessToken: 'jwt-token',
        user: userWithoutPassword,
      };

      mockAuthService.validateUser.mockResolvedValue(userWithoutPassword);
      mockAuthService.login.mockResolvedValue(mockAuthResponse.accessToken);

      const result = await resolver.login(input);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        input.email,
        input.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith({
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error for invalid credentials', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(resolver.login(input)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('me', () => {
    it('should return current user', async () => {
      const userContext = { userId: mockUser.id };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await resolver.me(userContext);

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should return true for logout', async () => {
      const result = await resolver.logout();

      expect(result).toBe(true);
    });
  });
});
