export function parseLinkAppParams(path: string) {
  let linkAppParams = null;
  const linkAppIdentifier = '/link-app/';
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  if (path.startsWith(linkAppIdentifier)) {
    let paramsString = path.replace(linkAppIdentifier, '');

    const version = paramsString.split('/')[0];
    paramsString = paramsString.substring(paramsString.indexOf('/') + 1);

    if (version === 'v1') {
      const [context, contextId, callbackUrl] = paramsString.split('/');
      if (context && contextId) {
        linkAppParams = {
          context,
          contextId,
          callbackUrl: callbackUrl
            ? decodeURIComponent(callbackUrl)
            : undefined,
        };
      }
    }
  }
  return linkAppParams;
}
