import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';

describe('TransactionsResolver', () => {
  let resolver: TransactionsResolver;
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsResolver,
        {
          provide: TransactionsService,
          useValue: {
            createAndSend: jest
              .fn()
              .mockResolvedValue({ id: 't1', status: 'SENT' }),
            listByWallet: jest.fn().mockResolvedValue([{ id: 't1' }]),
            refreshStatus: jest
              .fn()
              .mockResolvedValue({ id: 't1', status: 'CONFIRMED' }),
          },
        },
      ],
    }).compile();

    resolver = module.get(TransactionsResolver);
    service = module.get(TransactionsService);
  });

  it('createTransaction passes walletId, toAddress, amount, and user.id', async () => {
    await resolver.createTransaction(
      { walletId: 'w1', toAddress: 'addr', amountBtc: 0.001 },
      { id: 'u1' } as any,
    );
    expect(service.createAndSend).toHaveBeenCalledWith(
      'w1',
      'addr',
      0.001,
      'u1',
    );
  });

  it('walletTransactions passes walletId and user.id', async () => {
    await resolver.walletTransactions('w1', { id: 'u1' } as any);
    expect(service.listByWallet).toHaveBeenCalledWith('w1', 'u1');
  });

  it('refreshTransactionStatus passes txId and user.id', async () => {
    await resolver.refreshTransactionStatus('t1', { id: 'u1' } as any);
    expect(service.refreshStatus).toHaveBeenCalledWith('t1', 'u1');
  });
});
