import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlAuthGuard } from './gql-auth.guard';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;

  beforeEach(() => {
    guard = new GqlAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequest', () => {
    it('should return request from GraphQL context', () => {
      const mockRequest = { user: { id: '123' } };
      const mockContext = {
        getContext: () => ({ req: mockRequest }),
      };

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockContext as any);

      const executionContext = {} as ExecutionContext;
      const result = guard.getRequest(executionContext);

      expect(GqlExecutionContext.create).toHaveBeenCalledWith(executionContext);
      expect(result).toBe(mockRequest);
    });
  });
});