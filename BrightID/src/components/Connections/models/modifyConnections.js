// @flow

import api from '../../../Api/BrightId';
import { deleteConnection, flagConnection } from '../../../actions';
import { fakeJoinGroups } from '../../../actions/fakeGroup';

const removeConnection = (connection) => async () => {
  const { dispatch, id } = connection;
  try {
    await api.deleteConnection(id);
    // remove connection from redux
    dispatch(deleteConnection(id));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

const flagAndDeleteConnection = (connection, flag) => async () => {
  const { dispatch, id } = connection;
  try {
    await api.flagConnection(id, flag.toLowerCase());
    // flag connection
    dispatch(flagConnection(id, flag));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

const fakeJoinAllGs = (connection) => async () => {
  const { dispatch, id, secretKey } = connection;
  dispatch(fakeJoinGroups({ id, secretKey }));
};

export const performAction = (
  action,
  connection,
): ({ handler: () => void, title: string, msg: string }) => {
  const { name } = connection;
  switch (action) {
    case 'Delete': {
      let handler = removeConnection(connection);
      let title = 'Delete Connection';
      let msg = `Are you sure you want to remove ${name} from your list of connections?`;
      return { handler, title, msg };
    }
    case 'Flag as Duplicate':
    case 'Flag as Fake':
    case 'Flag as Diseased': {
      let handler = flagAndDeleteConnection(
        connection,
        action.split(' as ')[1],
      );
      let title = 'Flag and Delete Connection';
      let reason = action.split(' as ')[1];
      let msg = `Are you sure you want to flag ${name} as ${reason} and remove the connection?`;
      return { handler, title, msg };
    }
    case 'Join All Groups': {
      let handler = fakeJoinAllGs(connection);
      let title = 'Join Groups';
      let msg = `Are you sure you want to join all groups`;
      return { handler, title, msg };
    }
    default: {
      return { handler: () => null, title: '', msg: '' };
    }
  }
};
