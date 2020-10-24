// @flow
import moment from 'moment';
import api from '@/api/brightId';

type props = {
  myConnections: Array<connection>,
  myGroups: Array<group>,
  brightId: string,
};

export const fetchConnectionInfo = async ({
  myConnections,
  myGroups,
  brightId,
}: props) => {
  try {
    const {
      createdAt,
      groups,
      connections,
      flaggers,
      verifications,
    } = await api.getUserInfo(brightId);
    const mutualConnections = myConnections.filter(function (el) {
      return connections.some((x) => x.id === el.id);
    });
    const mutualGroups = myGroups.filter(function (el) {
      return groups.some((x) => x.id === el.id);
    });
    return {
      numConnections: connections.length,
      numGroups: groups.length,
      mutualConnections,
      mutualGroups,
      connectionDate: `Created ${moment(parseInt(createdAt, 10)).fromNow()}`,
      flagged: flaggers && Object.keys(flaggers).length > 0,
      verifications,
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'User not found') {
      // ignore, might be a new user
    } else {
      console.error(err.message);
    }
    return {
      connections: 0,
      groups: 0,
      mutualConnections: [],
      mutualGroups: [],
      connectionDate: 'New user',
      flagged: false,
      verifications: [],
    };
  }
};
