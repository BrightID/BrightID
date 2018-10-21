// @flow

import nacl from 'tweetnacl';
import { mainReducer, initialState } from '../main';
import {
  USER_TRUST_SCORE,
  GROUPS_COUNT,
  SEARCH_PARAM,
  UPDATE_CONNECTIONS,
  UPDATE_USER_DATA,
  REMOVE_USER_DATA,
} from '../../actions';

describe('main reducer', () => {
  test('should return the initial state', () => {
    expect(mainReducer(undefined, {})).toMatchSnapshot();
  });

  test('should update USER_TRUST_SCORE', () => {
    expect(
      mainReducer(undefined, {
        type: USER_TRUST_SCORE,
        trustScore: '99.9',
      }),
    ).toMatchSnapshot();
  });

  test('should update GROUPS_COUNT', () => {
    expect(
      mainReducer(undefined, {
        type: GROUPS_COUNT,
        groupsCount: 64,
      }),
    ).toMatchSnapshot();
  });

  test('should update SEARCH_PARAM', () => {
    expect(
      mainReducer(undefined, {
        type: SEARCH_PARAM,
        value: 'hi john',
      }),
    ).toMatchSnapshot();
  });

  test('should UPDATE_CONNECTIONS', () => {
    expect(
      mainReducer(undefined, {
        type: UPDATE_CONNECTIONS,
        connections: [
          {
            publicKey: [],
            name: 'Test User',
            avatar: 'todo...',
            connectionDate: 1532537998586,
            trustScore: '85.1',
          },
        ],
      }),
    ).toMatchSnapshot();
  });

  test('should UPDATE_USER_DATA', () => {
    expect(
      mainReducer(undefined, {
        type: UPDATE_USER_DATA,
        publicKey: [],
        secretKey: [],
        nameornym: 'Test User',
        userAvatar: 'todo...',
      }),
    ).toMatchSnapshot();
  });

  test('should REMOVE_USER_DATA', () => {
    expect(
      mainReducer(undefined, {
        type: REMOVE_USER_DATA,
        publicKey: new Uint8Array(32),
        secretKey: new Uint8Array(64),
        name: 'Test User',
        userAvatar: 'todo...',
      }),
    ).toMatchSnapshot();
  });
});

test('should update USER_TRUST_SCORE', () => {
  expect(
    mainReducer(undefined, {
      type: USER_TRUST_SCORE,
      trustScore: '99.9',
    }),
  ).toEqual({
    ...initialState,
    trustScore: '99.9',
  });
});

// test('should update GROUPS_COUNT', () => {
//   expect(
//     mainReducer(undefined, {
//       type: GROUPS_COUNT,
//       groupsCount: 64,
//     }),
//   ).toEqual({
//     ...initialState,
//     groupsCount: 64,
//   });
// });

// test('should update SEARCH_PARAM', () => {
//   expect(
//     mainReducer(undefined, {
//       type: SEARCH_PARAM,
//       value: 'hi john',
//     }),
//   ).toEqual({
//     ...initialState,
//     searchParam: 'hi john',
//   });
// });

// test('should UPDATE_CONNECTIONS', () => {
//   const pk = new Uint8Array(32);
//   expect(
//     mainReducer(undefined, {
//       type: UPDATE_CONNECTIONS,
//       connections: [
//         {
//           publicKey: pk,
//           name: 'Test User',
//           avatar: 'todo...',
//           connectionDate: 1532537998586,
//           trustScore: '85.1',
//         },
//       ],
//     }),
//   ).toEqual({
//     ...initialState,
//     connections: [
//       {
//         publicKey: pk,
//         name: 'Test User',
//         avatar: 'todo...',
//         connectionDate: 1532537998586,
//         trustScore: '85.1',
//       },
//     ],
//   });
// });

// test('should UPDATE_USER_DATA', () => {
//   const { publicKey, secretKey } = nacl.sign.keyPair();
//   expect(
//     mainReducer(undefined, {
//       type: UPDATE_USER_DATA,
//       publicKey,
//       secretKey,
//       nameornym: 'Test User',
//       userAvatar: 'todo...',
//     }),
//   ).toEqual({
//     ...initialState,
//     publicKey,
//     secretKey,
//     name: 'Test User',
//     userAvatar: 'todo...',
//   });
// });

// test('should REMOVE_USER_DATA', () => {
//   expect(
//     mainReducer(undefined, {
//       type: REMOVE_USER_DATA,
//       publicKey: new Uint8Array(32),
//       secretKey: new Uint8Array(64),
//       name: 'Test User',
//       userAvatar: 'todo...',
//     }),
//   ).toEqual({
//     ...initialState,
//     publicKey: '',
//     secretKey: '',
//     name: '',
//     userAvatar: '',
//   });
// });

// test('should set PUBLICKEY2', () => {
//   const { publicKey } = nacl.sign.keyPair();
//   expect(
//     mainReducer(undefined, {
//       type: PUBLICKEY2,
//       publicKey2: publicKey,
//     }),
//   ).toEqual({
//     ...initialState,
//     publicKey2: publicKey,
//   });
// });
