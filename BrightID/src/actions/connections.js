// @flow
import api from '../Api/BrightId';
import { updateConnection } from './index';

// TODO - use getUserInfo for connection data
export const updateScores = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    const { connections } = getState();
    let index = 0;
    for (let user of connections) {
      // user.score = await api.getUserScore(user.publicKey);
      console.log(user);
      dispatch(updateConnection(user, index));
      index++;
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
