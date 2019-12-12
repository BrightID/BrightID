// @flow

import { innerJoin } from 'ramda';
import api from '../Api/BrightId';

export const getMembers = (groupId: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const { connections } = getState();

  const members = await api.getMembers(groupId);
  console.log('members', members);

  // return a list of connections filtered by the members of this group

  return innerJoin(
    (connection, id) => connection.id === id,
    connections,
    members,
  );
};
