import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nacl from 'tweetnacl';

import { generateMessage } from '../exchange';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async action', () => {
  test('sets up dummy data without userData', () => {
    const keyPair1 = nacl.sign.keyPair();
    let keyPair2 = {
      publicKey: new Uint8Array([
        187,
        140,
        200,
        233,
        104,
        179,
        188,
        241,
        76,
        240,
        229,
        54,
        242,
        103,
        201,
        4,
        131,
        44,
        118,
        37,
        204,
        6,
        161,
        35,
        191,
        33,
        47,
        175,
        32,
        183,
        174,
        40,
      ]),
    };
    // mocking async storage conversion
    keyPair2 = JSON.stringify(keyPair2);
    keyPair2 = JSON.parse(keyPair2);

    const store = mockStore({ main: keyPair1 });

    store.dispatch(generateMessage(keyPair2.publicKey));
    expect(store.getActions()).toMatchSnapshot();
  });
});
