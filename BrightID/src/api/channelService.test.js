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
      await channelApi.upload({
        channelId: sharedChannelId,
        id: dataId,
        data: myData,
      });
    });

    test('list data in channel', async () => {
      const list = await channelApi.list(sharedChannelId);
      expect(list).toHaveLength(1);
      expect(list[0]).toEqual(dataId);
    });

    test('download data from channel', async () => {
      const data = await channelApi.download({
        channelId: sharedChannelId,
        dataId,
      });
      expect(data).toMatchObject(myData);
    });
  });
});
