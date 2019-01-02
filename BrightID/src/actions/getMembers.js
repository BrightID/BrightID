// @flow

import { innerJoin } from "ramda";
import { getConnections } from './getConnections';
import api from '../Api/BrightId';

export const getMembers = (groupId: string) => async (dispatch: () => null, getState) => {
  await getConnections();

  const { connections } = getState().main;

  const members = await api.getMembers(groupId);

  // return a list of connections filtered by the members of this group

  return innerJoin(
    (connection, publicKey) => connection.publicKey === publicKey,
    connections, members
  );
};
