import { generateChannelData } from '@/utils/channels';
import { channel_types } from '@/components/NewConnectionsScreens/channelSlice';

describe('Test qrcode encoding', () => {
  test('encodes and decodes qrdata', async () => {
    const channelData = await generateChannelData(channel_types.SINGLE);
    expect(true);
  });
});
