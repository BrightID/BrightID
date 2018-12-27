import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { setUserInfo } from '../setUserInfo';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async action', () => {
  test('sets up dummy data including userData', () => {
    const store = mockStore({ trustScore: '22.3' });
    const userData = {
      publicKey: [],
      secretKey: [],
      nameornym: 'charlie sheen',
      avatar: 'avatar',
    };
    return store.dispatch(setUserInfo(userData)).then(() => {
      // return of async actions
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  test('sets up dummy data without userData', () => {
    const store = mockStore({ trustScore: '22.3' });
    const userData = {
      nameornym: 'charlie sheen',
      avatar: 'avatar',
    };
    return store.dispatch(setUserInfo(userData)).then(() => {
      // return of async actions
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
