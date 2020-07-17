import { NativeModules } from 'react-native';
import { generateChannelData } from '@/utils/channels';
import { channel_types } from '@/components/NewConnectionsScreens/channelSlice';

// mocking by module name stopped working since RN61, see
// https://github.com/facebook/react-native/issues/26579#issuecomment-535765528)
/*
jest.mock('NativeModules', () => {
  return {
    RNRandomBytes: {
      randomBytes: jest.fn(),
    },
  };
});
 */

// Try to mock by full path as suggested workaround - Also not working :-(
jest.mock('react-native/Libraries/NativeModules', () => {
  return {
    RNRandomBytes: {
      randomBytes: jest.fn(),
    },
  };
});

describe('Test qrcode encoding', () => {
  test('encodes and decodes qrdata', async () => {
    const channelData = await generateChannelData(channel_types.SINGLE);
    expect(channelData).toBeDefined();
  });
});
