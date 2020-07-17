import { generateChannelData } from '@/utils/channels';
import { channel_types } from '@/components/NewConnectionsScreens/channelSlice';

// mocking by module name stopped working since RN61, see
// https://github.com/facebook/react-native/issues/26579#issuecomment-535765528)

describe('Test qrcode encoding', () => {
  test('encodes and decodes qrdata', async () => {
    const channelData = await generateChannelData(channel_types.SINGLE);
    expect(channelData).toBeDefined();
  });
});
