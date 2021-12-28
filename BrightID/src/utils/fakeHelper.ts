import { NodeApi } from '@/api/brightId';

export const connectFakeUsers = async (
  fakeUser1: FakeUser,
  fakeUser2: FakeUser,
  api: NodeApi,
  level: ConnectionLevel,
) => {
  const timestamp = Date.now();

  let flagReason;

  // Connect user1 -> user2
  const user1Promise = api.addConnection(
    fakeUser1.id,
    fakeUser2.id,
    level,
    timestamp,
    flagReason,
    fakeUser1,
  );

  // Connect user2 -> user1
  const user2Promise = api.addConnection(
    fakeUser2.id,
    fakeUser1.id,
    level,
    timestamp,
    flagReason,
    fakeUser2,
  );

  const ops = await Promise.all([user1Promise, user2Promise]);
  return ops;
};
