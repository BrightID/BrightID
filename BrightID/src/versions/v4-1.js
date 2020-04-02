import { hydrateConnections, hydrateUser, setApps } from '@/actions';
import { store } from '@/store';

export const updateReducer = (state) => {
  const {
    apps,
    connections,
    trustedConnections,
    connectionSort,
    score,
    isSponsored,
    name,
    photo,
    searchParam,
    notifications,
    backupCompleted,
    id,
    publicKey,
    password,
    hashedId,
    secretKey,
  } = state;
};
