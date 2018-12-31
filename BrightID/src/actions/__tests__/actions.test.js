import * as action from '../index';

describe('actions', () => {
  test('should create an action to update the user trust score', () => {
    const score = '99.9';
    expect(action.setUserScore(score)).toMatchSnapshot();
  });

  test('should create an action to update the trust score of a connection', () => {
    const publicKey = [];
    const score = '88.6';
    expect(
      action.connectionScore(publicKey, score),
    ).toMatchSnapshot();
  });

  test('should create an action to set the group count', () => {
    const groupsCount = '15';
    expect(action.setGroupsCount(groupsCount)).toMatchSnapshot();
  });

  test('should create an action to set the search param', () => {
    const searchParam = 'gandolf';
    expect(action.setSearchParam(searchParam)).toMatchSnapshot();
  });

  test('should create an action to set the connections list', () => {
    const connections = [];
    expect(action.setConnections(connections)).toMatchSnapshot();
  });

  test('should create an action to add a connection', () => {
    const connection = {};
    expect(action.addConnection(connection)).toMatchSnapshot();
  });

  test('should create an action to set user data', () => {
    const userData = {
      publicKey: [],
      secretKey: [],
      name: 'aragon',
      photo: 'photo string',
    };
    expect(action.setUserData(userData)).toMatchSnapshot();
  });

  test('should create an action to remove user data', () => {
    expect(action.removeUserData()).toMatchSnapshot();
  });

  test('should create an action to set user photo', () => {
    const photo = 'photo string';
    expect(action.setPhoto(photo)).toMatchSnapshot();
  });

  test('should create an action to set public key 1', () => {
    const publicKey2 = [];
    expect(action.setPublicKey2(publicKey2)).toMatchSnapshot();
  });

  test('should create an action to set public key 1', () => {
    const nearbyPeople = [];
    expect(action.refreshNearbyPeople(nearbyPeople)).toMatchSnapshot();
  });

  test('should create an action to set public key 1', () => {
    const errmsg = 'error message';
    expect(action.handleError(errmsg)).toMatchSnapshot();
  });
});
