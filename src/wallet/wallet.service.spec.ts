import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

// Mock axios globally
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WalletService', () => {
  let service: WalletService;
  let repo: Repository<Wallet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useClass: Repository },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) =>
              key === 'blockcypher.token'
                ? 'token'
                : 'https://api.blockcypher.com/v1/btc/test3',
            ),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    repo = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // createForUser
  // -------------------------
  it('createForUser: creates and saves a new wallet', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { address: 'newAddr' },
    } as AxiosResponse);

    jest.spyOn(repo, 'create').mockReturnValue({
      address: 'newAddr',
      user: { id: 'u1' },
      balance: 0,
    } as any);

    jest.spyOn(repo, 'save').mockResolvedValue({
      id: 'w1',
      address: 'newAddr',
      balance: 0,
    } as any);

    const result = await service.createForUser('u1');

    expect(result.address).toBe('newAddr');
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  // -------------------------
  // getByUser
  // -------------------------
  it('getByUser: returns wallets for a user', async () => {
    jest
      .spyOn(repo, 'find')
      .mockResolvedValue([{ id: 'w1', address: 'addr' }] as any);

    const result = await service.getByUser('u1');

    expect(result).toHaveLength(1);
    expect(result[0].address).toBe('addr');
  });

  // -------------------------
  // refreshBalance
  // -------------------------
  it('refreshBalance: throws Forbidden if wallet not owned by user', async () => {
    jest
      .spyOn(repo, 'findOne')
      .mockResolvedValue({ id: 'w1', user: { id: 'other' } } as any);

    await expect(service.refreshBalance('w1', 'u1')).rejects.toThrow(
      'Forbidden',
    );
  });

  it('refreshBalance: throws NotFound if wallet does not exist', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);

    await expect(service.refreshBalance('w1', 'u1')).rejects.toThrow(
      'Wallet not found',
    );
  });

  it('refreshBalance: updates balance if owned', async () => {
    const wallet = { id: 'w1', address: 'addr', user: { id: 'u1' } } as any;

    jest.spyOn(repo, 'findOne').mockResolvedValue(wallet);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue({ ...wallet, balance: 0.1 } as any);

    mockedAxios.get.mockResolvedValue({
      data: { balance: 10000000, unconfirmed_balance: 0 },
    } as AxiosResponse);

    const result = await service.refreshBalance('w1', 'u1');

    expect(result.balance).toBe(0.1);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ balance: 0.1 }),
    );
  });

  it('createForUser: throws error when API fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API Error'));

    await expect(service.createForUser('u1')).rejects.toThrow('Failed to create wallet address');
  });
});