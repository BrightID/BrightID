import * as action from '../index';

describe('actions', () => {
  it('should create an action to update the user trust score', () => {
    const trustScore = '99.9';
    expect(action.userTrustScore(trustScore)).toMatchSnapshot();
  });
  it('should create an action to update the trust score of a connection', () => {
    const publicKey = [];
    const trustScore = '88.6';
    expect(
      action.connectionTrustScore(publicKey, trustScore),
    ).toMatchSnapshot();
  });
});
