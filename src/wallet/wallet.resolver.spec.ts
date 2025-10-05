import { Test, TestingModule } from '@nestjs/testing';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';

describe('WalletResolver', () => {
  let resolver: WalletResolver;
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletResolver,
        {
          provide: WalletService,
          useValue: {
            createForUser: jest
              .fn()
              .mockResolvedValue({ id: 'w1', address: 'addr' }),
            getByUser: jest.fn().mockResolvedValue([{ id: 'w1' }]),
            refreshBalance: jest
              .fn()
              .mockResolvedValue({ id: 'w1', balance: 0.1 }),
          },
        },
      ],
    }).compile();

    resolver = module.get(WalletResolver);
    service = module.get(WalletService);
  });

  it('createWallet uses CurrentUser.id', async () => {
    await resolver.createWallet({ id: 'u1' } as any);
    expect(service.createForUser).toHaveBeenCalledWith('u1');
  });

  it('myWallets passes CurrentUser.id', async () => {
    await resolver.myWallets({ id: 'u1' } as any);
    expect(service.getByUser).toHaveBeenCalledWith('u1');
  });

  it('refreshWalletBalance passes walletId and CurrentUser.id', async () => {
    await resolver.refreshWalletBalance('w1', { id: 'u1' } as any);
    expect(service.refreshBalance).toHaveBeenCalledWith('w1', 'u1');
  });
});
