// @flow
import { createMigrate } from 'redux-persist';

const migrations = {
  5: (state) => {
    const nextState = {
      ...state,
    };

    delete nextState.user.notifications;

    return nextState;
  },
};

export const migrate = createMigrate(migrations, { debug: false });
