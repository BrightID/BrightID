import {
  generateChannelData,
  createChannelInfo,
  buildChannelQrUrl,
} from '@/utils/channels';
import ChannelAPI from '@/api/channelService';
import { channel_states, channel_types } from '@/utils/constants';

describe('Test channel data', () => {
  const url = new URL(`https://some.node.org/profile`);
  for (const channel_type of Object.values(channel_types)) {
    test(`creates channel type ${channel_type}`, async () => {
      const channel = await generateChannelData(channel_type, url);
      // all expected keys there?
      expect(channel).toMatchObject({
        api: expect.any(ChannelAPI),
        aesKey: expect.any(String),
        id: expect.any(String),
        initiatorProfileId: expect.any(String),
        url,
        myProfileId: expect.any(String),
        state: expect.any(String),
        timestamp: expect.any(Number),
        ttl: expect.any(Number),
        type: expect.any(String),
      });
      // channel type?
      expect(channel.type).toBe(channel_type);
      // initial channel state should be open
      expect(channel.state).toBe(channel_states.OPEN);
    });

    test(`builds correct channel url for QRCode`, async () => {
      const testUrl = new URL(`https://some.node.org/profile`);
      const channel = await generateChannelData(channel_type, testUrl);
      const channelUrl = buildChannelQrUrl(channel);
      expect(channelUrl.host).toBe('some.node.org');
      expect(channelUrl.searchParams.get('aes')).toBe(channel.aesKey);
      expect(channelUrl.searchParams.get('id')).toBe(channel.id);
    });

    test(`creates correct channel info for type ${channel_type}`, async () => {
      const originalChannel = await generateChannelData(channel_type, url);
      const channelInfo = createChannelInfo(originalChannel);
      // channel type STAR requires version 2, other types 1
      const expectedVersion = channel_type === channel_types.STAR ? 2 : 1;
      expect(channelInfo).toMatchObject({
        version: expectedVersion,
        type: originalChannel.type,
        timestamp: originalChannel.timestamp,
        ttl: originalChannel.ttl,
        initiatorProfileId: originalChannel.myProfileId,
      });
    });
  }
});
