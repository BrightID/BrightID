import { parseLinkAppParams } from '@/utils/deeplink';

describe('Test channel data', () => {
  const linkParams = {
    callbackUrl: 'https://api.example.com/',
    context: 'exampleApp',
    contextId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  };
  test('parses link-app v1 deeplink types', async () => {
    const { context, contextId } = linkParams;
    const callbackUrl = encodeURIComponent(linkParams.callbackUrl);

    const path = `/link-app/v1/${context}/${contextId}/${callbackUrl}`;

    const linkAppParams = parseLinkAppParams(path);
    expect(linkAppParams).toEqual(linkParams);
  });

  test('parses link-app v1 deeplink types without slashes (from brightid:// links)', async () => {
    const { context, contextId } = linkParams;
    const callbackUrl = encodeURIComponent(linkParams.callbackUrl);

    const path = `link-app/v1/${context}/${contextId}/${callbackUrl}`;

    const linkAppParams = parseLinkAppParams(path);
    expect(linkAppParams).toEqual(linkParams);
  });
});
