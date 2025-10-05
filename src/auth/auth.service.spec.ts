import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
  };

  const mockSafeUser: Omit<User, 'password'> = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should return null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response with token and user', async () => {
      const userPayload = { id: mockUser.id, email: mockUser.email };
      const token = 'jwt-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(userPayload);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userPayload.id,
        email: userPayload.email,
      });
      expect(result).toEqual(token);
    });
  });

  describe('register', () => {
    it('should register new user and return auth response', async () => {
      const input = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      const token = 'jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.register(input);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockUsersService.create).toHaveBeenCalledWith(input);
      expect(result).toEqual({
        accessToken: token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it('should throw error when email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(input)).rejects.toThrow(
        new UnauthorizedException('Email already in use'),
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockSafeUser);

      const result = await service.getCurrentUser(mockUser.id);

      expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockSafeUser);
    });
  });
});
