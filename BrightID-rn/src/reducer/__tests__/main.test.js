// @flow

import nacl from 'tweetnacl';
import { mainReducer, initialState } from '../index';
import {
  USER_TRUST_SCORE,
  GROUPS_COUNT,
  SEARCH_PARAM,
  UPDATE_CONNECTIONS,
  UPDATE_USER_DATA,
  REMOVE_USER_DATA,
  USER_AVATAR,
  REFRESH_NEARBY_PEOPLE,
  PUBLICKEY2,
} from '../../actions';

describe('main reducer', () => {
  it('should return the initial state', () => {
    expect(mainReducer(undefined, {})).toMatchSnapshot();
  });

  it('should update USER_TRUST_SCORE', () => {
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

  it('should update GROUPS_COUNT', () => {
    expect(
      mainReducer(undefined, {
        type: GROUPS_COUNT,
        count: 64,
      }),
    ).toEqual({
      ...initialState,
      groupsCount: 64,
    });
  });

  it('should update SEARCH_PARAM', () => {
    expect(
      mainReducer(undefined, {
        type: SEARCH_PARAM,
        value: 'hi john',
      }),
    ).toEqual({
      ...initialState,
      searchParam: 'hi john',
    });
  });

  it('should UPDATE_CONNECTIONS', () => {
    const pk = new Uint8Array(32);
    expect(
      mainReducer(undefined, {
        type: UPDATE_CONNECTIONS,
        connections: [
          {
            publicKey: pk,
            name: 'Test User',
            avatar: 'todo...',
            connectionDate: 1532537998586,
            trustScore: '85.1',
          },
        ],
      }),
    ).toEqual({
      ...initialState,
      connections: [
        {
          publicKey: pk,
          name: 'Test User',
          avatar: 'todo...',
          connectionDate: 1532537998586,
          trustScore: '85.1',
        },
      ],
    });
  });

  it('should UPDATE_USER_DATA', () => {
    const { publicKey, secretKey } = nacl.sign.keyPair();
    expect(
      mainReducer(undefined, {
        type: UPDATE_USER_DATA,
        publicKey,
        secretKey,
        nameornym: 'Test User',
        userAvatar: 'todo...',
      }),
    ).toEqual({
      ...initialState,
      publicKey,
      secretKey,
      name: 'Test User',
      userAvatar: 'todo...',
    });
  });

  it('should REMOVE_USER_DATA', () => {
    expect(
      mainReducer(undefined, {
        type: REMOVE_USER_DATA,
        publicKey: new Uint8Array(32),
        secretKey: new Uint8Array(64),
        name: 'Test User',
        userAvatar: 'todo...',
      }),
    ).toEqual({
      ...initialState,
      publicKey: '',
      secretKey: '',
      name: '',
      userAvatar: '',
    });
  });

  it('should set PUBLICKEY2', () => {
    const { publicKey } = nacl.sign.keyPair();
    expect(
      mainReducer(undefined, {
        type: PUBLICKEY2,
        publicKey2: publicKey,
      }),
    ).toEqual({
      ...initialState,
      publicKey2: publicKey,
    });
  });

  it('should update USER_TRUST_SCORE', () => {
    expect(
      mainReducer(undefined, {
        type: USER_TRUST_SCORE,
        trustScore: '99.9',
      }),
    ).toMatchSnapshot();
  });

  it('should update GROUPS_COUNT', () => {
    expect(
      mainReducer(undefined, {
        type: GROUPS_COUNT,
        count: 64,
      }),
    ).toMatchSnapshot();
  });

  it('should update SEARCH_PARAM', () => {
    expect(
      mainReducer(undefined, {
        type: SEARCH_PARAM,
        value: 'hi john',
      }),
    ).toMatchSnapshot();
  });

  it('should UPDATE_CONNECTIONS', () => {
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

  it('should UPDATE_USER_DATA', () => {
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

  it('should REMOVE_USER_DATA', () => {
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

  it('should set PUBLICKEY2', () => {
    expect(
      mainReducer(undefined, {
        type: PUBLICKEY2,
        publicKey2: [],
      }),
    ).toMatchSnapshot();
  });
});
