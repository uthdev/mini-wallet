import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(input);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...input,
        password: 'hashedPassword',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['wallets'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['wallets'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
