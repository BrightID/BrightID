import {
  generateChannelData,
  decodeChannelQrString,
  encodeChannelQrString,
} from '@/utils/channels';
import {
  channel_types,
  channel_states,
} from '@/components/NewConnectionsScreens/channelSlice';
import ChannelAPI from '@/api/channelService';

describe('Test channel data', () => {
  for (const channel_type of Object.values(channel_types)) {
    test(`creates channel type ${channel_type}`, async () => {
      const channel = await generateChannelData(channel_type);
      // all expected keys there?
      expect(channel).toMatchObject({
        api: expect.any(ChannelAPI),
        aesKey: expect.any(String),
        id: expect.any(String),
        initiatorProfileId: expect.any(String),
        ipAddress: expect.any(String),
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

    test(`encodes and decodes qrdata for type ${channel_type}`, async () => {
      const originalChannel = await generateChannelData(channel_types.SINGLE);
      const qrString = encodeChannelQrString(originalChannel);
      const decodedChannel = await decodeChannelQrString(qrString);
      // check properties that should be equal:
      expect(decodedChannel).toMatchObject({
        aesKey: originalChannel.aesKey,
        ipAddress: originalChannel.ipAddress,
        id: originalChannel.id,
        timestamp: originalChannel.timestamp,
        ttl: originalChannel.ttl,
        type: originalChannel.type,
        state: originalChannel.state,
      });
      // "myProfileId" of originalChannel should become "initiatorProfileId"
      expect(decodedChannel.initiatorProfileId).toEqual(
        originalChannel.myProfileId,
      );
      // decodedChannel should have a unique myProfileId
      expect(decodedChannel.myProfileId).not.toEqual(
        originalChannel.myProfileId,
      );
      // decodedChannel should have a ChannelApi instance
      expect(decodedChannel.api).toBeInstanceOf(ChannelAPI);
    });
  }
});
