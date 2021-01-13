import ChannelAPI from '@/api/channelService';

const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

describe('ChannelAPI', () => {
  let channelApi;
  let sharedChannelId = generateRandomString();
  const myData = {
    some: 'random stuff',
    more: {
      nested: 'nested stuff',
      nested2: 'and more',
    },
  };
  const dataId = generateRandomString();

  beforeAll(() => {
    channelApi = new ChannelAPI('http://test.brightid.org/profile');
    // channelApi = new ChannelAPI('127.0.0.1:3000');
  });

  test(`list unknown/empty channel`, async () => {
    const channelId = generateRandomString();
    const result = await channelApi.list(channelId);
    expect(result).toEqual([]);
  });

  describe(`upload, list and download`, () => {
    test('upload data to channel', async () => {
      jest.setTimeout(10000);
      await channelApi.upload({
        channelId: sharedChannelId,
        dataId,
        data: myData,
      });
    });

    test('list data in channel', async () => {
      const list = await channelApi.list(sharedChannelId);
      expect(list).toHaveLength(1);
      expect(list[0]).toEqual(dataId);
    });

    test('download data from channel', async () => {
      jest.setTimeout(10000);
      const data = await channelApi.download({
        channelId: sharedChannelId,
        dataId,
      });
      expect(data).toMatchObject(myData);
    });
  });

  describe(`Channel limit`, () => {
    const channel_limit = 30;
    const channelId = generateRandomString();

    beforeAll(async () => {
      // increase test timeout to 30 seconds (default is 5 seconds, which sometimes fails when running in CI env)
      jest.setTimeout(30000);

      // fill channel up to limit
      for (let i = 0; i < channel_limit; i++) {
        await channelApi.upload({
          channelId,
          dataId: generateRandomString(),
          data: {
            somekey: `value ${i}`,
          },
        });
      }
      // check if all entries are there
      const list = await channelApi.list(channelId);
      expect(list).toHaveLength(channel_limit);
    });

    test(`Adding more than ${channel_limit} entries to channel fails`, async () => {
      await expect(
        channelApi.upload({
          channelId,
          dataId: generateRandomString(),
          data: {
            somekey: `random data`,
          },
        }),
      ).rejects.toThrow('Channel full');
    });
  });
});
