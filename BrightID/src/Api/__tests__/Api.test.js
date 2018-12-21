import api from '../BrightIdApi';
import server from '../server';

describe('Server', () => {
  describe('when the base url is updated', () => {
    const setBaseUrl = jest.spyOn(api, "setBaseUrl");
    server.update("test-url");

    it('should update the url of the brightid API', () => {
      expect(setBaseUrl).toHaveBeenCalledWith("test-url/brightid");
    });
  });
});

