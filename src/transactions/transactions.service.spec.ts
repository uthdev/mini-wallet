import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TransactionsService', () => {
  let service: TransactionsService;
  let txRepo: Repository<Transaction>;
  let walletRepo: Repository<Wallet>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(Transaction), useClass: Repository },
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

    service = module.get<TransactionsService>(TransactionsService);
    txRepo = module.get(getRepositoryToken(Transaction));
    walletRepo = module.get(getRepositoryToken(Wallet));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listByWallet: throws Forbidden if wallet not owned', async () => {
    jest.spyOn(walletRepo, 'findOne').mockResolvedValue({ id: 'w1', user: { id: 'other' } } as any);
    await expect(service.listByWallet('w1', 'u1')).rejects.toThrow('Forbidden');
  });

  it('listByWallet: returns txs if owned', async () => {
    jest.spyOn(walletRepo, 'findOne').mockResolvedValue({ id: 'w1', user: { id: 'u1' } } as any);
    jest.spyOn(txRepo, 'find').mockResolvedValue([{ id: 't1' }] as any);
    const result = await service.listByWallet('w1', 'u1');
    expect(result).toHaveLength(1);
  });

  it('createAndSend: creates tx and marks as SENT when API succeeds', async () => {
    const wallet = { id: 'w1', address: 'fromAddr', user: { id: 'u1' } } as any;

    (dataSource.transaction as jest.Mock).mockImplementation(async (fn) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue(wallet),
        create: jest.fn().mockReturnValue({ id: 't1', status: 'PENDING' }),
        save: jest
          .fn()
          .mockResolvedValueOnce({ id: 't1', status: 'PENDING' })
          .mockResolvedValueOnce({ id: 't1', status: 'SENT', txHash: 'hash' }),
      };
      return fn(manager);
    });

    mockedAxios.post
      .mockResolvedValueOnce({ data: {} } as AxiosResponse) // /txs/new
      .mockResolvedValueOnce({ data: { tx: { hash: 'hash' } } } as AxiosResponse); // /txs/send

    const result = await service.createAndSend('w1', 'toAddr', 0.001, 'u1');
    expect(result.status).toBe('SENT');
    expect(result.txHash).toBe('hash');
  });

  it('createAndSend: throws Forbidden if wallet not owned', async () => {
    (dataSource.transaction as jest.Mock).mockImplementation(async (fn) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue({ id: 'w1', user: { id: 'other' } }),
        create: jest.fn(),
        save: jest.fn(),
      };
      return fn(manager);
    });

    await expect(service.createAndSend('w1', 'toAddr', 0.001, 'u1')).rejects.toThrow('Forbidden');
  });

  it('refreshStatus: updates tx to CONFIRMED when confirmations > 0', async () => {
    const tx = { id: 't1', txHash: 'hash', wallet: { user: { id: 'u1' } } } as any;

    (dataSource.transaction as jest.Mock).mockImplementation(async (fn) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue(tx),
        save: jest.fn().mockResolvedValue({ ...tx, status: 'CONFIRMED' }),
      };
      return fn(manager);
    });

    mockedAxios.get.mockResolvedValue({ data: { confirmations: 2 } } as AxiosResponse);

    const result = await service.refreshStatus('t1', 'u1');
    expect(result.status).toBe('CONFIRMED');
  });

  it('refreshStatus: throws Forbidden if tx not owned', async () => {
    (dataSource.transaction as jest.Mock).mockImplementation(async (fn) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue({ id: 't1', wallet: { user: { id: 'other' } } }),
        save: jest.fn(),
      };
      return fn(manager);
    });

    await expect(service.refreshStatus('t1', 'u1')).rejects.toThrow('Forbidden');
  });

  it('createAndSend: marks tx as FAILED when API fails', async () => {
    const wallet = { id: 'w1', address: 'fromAddr', user: { id: 'u1' } } as any;
    const saveMock = jest.fn().mockResolvedValue({ id: 't1', status: 'FAILED' });

    (dataSource.transaction as jest.Mock).mockImplementation(async (fn) => {
      const manager = {
        findOne: jest.fn().mockResolvedValue(wallet),
        create: jest.fn().mockReturnValue({ id: 't1', status: 'PENDING' }),
        save: saveMock,
      };
      return fn(manager);
    });

    mockedAxios.post.mockRejectedValue(new Error('API Error'));

    await expect(service.createAndSend('w1', 'toAddr', 0.001, 'u1')).rejects.toThrow('Failed to send transaction');
    expect(saveMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILED' }));
  });
});