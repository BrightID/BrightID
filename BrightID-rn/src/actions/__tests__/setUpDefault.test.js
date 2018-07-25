import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { setUpDefault } from '../setUpDefault';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async action', () => {
  it('sets up dummy data including userData', () => {
    const store = mockStore({ trustScore: '22.3' });
    const userData = {
      publicKey: [],
      secretKey: [],
      nameornym: 'charlie sheen',
      userAvatar: 'avatar',
    };
    return store.dispatch(setUpDefault(userData)).then(() => {
      // return of async actions
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  it('sets up dummy data without userData', () => {
    const store = mockStore({ trustScore: '22.3' });
    const userData = {
      nameornym: 'charlie sheen',
      userAvatar: 'avatar',
    };
    return store.dispatch(setUpDefault(userData)).then(() => {
      // return of async actions
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
