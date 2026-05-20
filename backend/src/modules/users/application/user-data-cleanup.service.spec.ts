import { DataSource, QueryRunner } from 'typeorm';
import { UserDataCleanupService } from './user-data-cleanup.service';

describe('UserDataCleanupService', () => {
  let service: UserDataCleanupService;
  let mockQuery: jest.Mock;
  let mockQueryRunner: jest.Mocked<
    Pick<
      QueryRunner,
      'connect' | 'startTransaction' | 'commitTransaction' | 'rollbackTransaction' | 'release' | 'query'
    >
  >;
  let mockDataSource: jest.Mocked<Pick<DataSource, 'createQueryRunner'>>;

  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue(undefined);
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: mockQuery,
    };
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    service = new UserDataCleanupService(mockDataSource as unknown as DataSource);
  });

  it('deletes all learner data for the user in a transaction', async () => {
    const userId = 'user-123';

    await service.clearAllUserData(userId);

    expect(mockDataSource.createQueryRunner).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);

    expect(mockQuery).toHaveBeenCalledTimes(11);
    for (const call of mockQuery.mock.calls) {
      expect(call[1]).toEqual([userId]);
    }

    expect(mockQuery.mock.calls[10][0]).toContain(
      'UPDATE users SET onboarding_completed = false',
    );
  });

  it('rolls back when a delete fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('db error'));

    await expect(service.clearAllUserData('user-123')).rejects.toThrow('db error');

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('deletes account, tokens, and soft-deletes the user in a transaction', async () => {
    const userId = 'user-123';

    await service.deleteAccount(userId);

    expect(mockQuery).toHaveBeenCalledTimes(15);
    expect(mockQuery.mock.calls[10][0]).toContain('DELETE FROM refresh_tokens');
    expect(mockQuery.mock.calls[14][0]).toContain('deleted_at = NOW()');
  });
});
