// @flow

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
});
