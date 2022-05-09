import ChannelAPI from '@/api/channelService';

const generateRandomString = function (length = 6) {
  return Math.random().toString(20).substr(2, length);
};

// increase test timeout (default is 5 seconds, which sometimes fails when running in CI env)
jest.setTimeout(90000);

describe('ChannelAPI', () => {
  let channelApi: ChannelAPI;
  const sharedChannelId = generateRandomString();
  const myData = {
    some: 'random stuff',
    more: {
      nested: 'nested stuff',
      nested2: 'and more',
    },
  };
  const dataId = generateRandomString();

  beforeAll(() => {
    // channelApi = new ChannelAPI('http://test.brightid.org/profile');
    channelApi = new ChannelAPI('http://127.0.0.1:3000');
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

  describe('Channel limit', () => {
    beforeAll(async () => {
      const uploadTillFull = async (resolve, reject, count) => {
        console.log(`Uploading ${count}...`);
        try {
          await channelApi.upload({
            channelId: sharedChannelId,
            dataId: `${dataId}-${count++}`,
            data: myData,
          });
          uploadTillFull(resolve, reject, count);
        } catch (e) {
          console.log(`uploaded ${count} items until channel error`);
          return resolve(e);
        }
      };
      // upload random data until "channel full" response.
      const error: Error = await new Promise((r, j) => uploadTillFull(r, j, 0));
      expect(error.message).toEqual('Channel full');
    });

    test('upload should succeed when deleting an item before', async () => {
      // download and delete one item from channel
      const data = await channelApi.download({
        channelId: sharedChannelId,
        dataId: `${dataId}-0`,
        deleteAfterDownload: true,
      });

      // try upload again
      await expect(
        channelApi.upload({
          channelId: sharedChannelId,
          dataId: `extraData`,
          data: myData,
        }),
      ).resolves.toBeUndefined();
    });
  });

  /*
  describe(`Legacy channel limit`, () => {
    const channel_limit = 30;
    const channelId = generateRandomString();

    beforeAll(async () => {
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

   */
});
