import {
  generateChannelData,
  decodeChannelQrString,
  encodeChannelQrString,
  createChannelInfo,
} from '@/utils/channels';
import {
  channel_types,
  channel_states,
} from '@/components/PendingConnectionsScreens/channelSlice';
import ChannelAPI from '@/api/channelService';

describe('Test channel data', () => {
  const ipAddress = '192.168.2.2';
  for (const channel_type of Object.values(channel_types)) {
    test(`creates channel type ${channel_type}`, async () => {
      const channel = await generateChannelData(channel_type, ipAddress);
      // all expected keys there?
      expect(channel).toMatchObject({
        api: expect.any(ChannelAPI),
        aesKey: expect.any(String),
        id: expect.any(String),
        initiatorProfileId: expect.any(String),
        ipAddress,
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

    test(`encodes and decodes old format qrdata for type ${channel_type}`, async () => {
      const originalChannel = await generateChannelData(
        channel_type,
        ipAddress,
      );
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

    test(`creates correct channel info for type ${channel_type}`, async () => {
      const originalChannel = await generateChannelData(
        channel_type,
        ipAddress,
      );
      const channelInfo = createChannelInfo(originalChannel);
      expect(channelInfo).toMatchObject({
        version: 1,
        type: originalChannel.type,
        timestamp: originalChannel.timestamp,
        ttl: originalChannel.ttl,
        initiatorProfileId: originalChannel.myProfileId,
      });
    });
  }
});
