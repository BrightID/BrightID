import { create } from 'apisauce';
import httpBridge from 'react-native-http-bridge';
import { LOCAL_HTTP_SERVER_PORT } from '@/utils/constants';
import { getUserInfo } from '@/components/Onboarding/ImportFlow/thunks/channelUploadThunks';
import { getExplorerCode } from '@/utils/explorer';
import { DEVICE_IOS } from '@/utils/deviceConstants';
import store from '@/store';

const getResponse = async (url: string) => {
  if (url === '/v1/info') {
    return JSON.stringify(await getUserInfo());
  }
  if (url === '/v1/explorer-code') {
    const { user } = store.getState();
    return JSON.stringify({
      explorerCode: getExplorerCode(),
      password: user.password,
    });
  }
  return null;
};

const requestHandler = async (request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  };
  if (request.type === 'OPTIONS') {
    httpBridge.respond(
      request.requestId,
      200,
      'text/html; charset=utf-8',
      undefined,
      headers,
    );
    return;
  }
  const url = request.url.slice(request.url.indexOf('/'));
  if (request.type === 'GET') {
    const response = await getResponse(url);
    if (response) {
      httpBridge.respond(
        request.requestId,
        200,
        'application/json',
        response,
        headers,
      );
      return;
    }
  }
  httpBridge.respond(
    request.requestId,
    404,
    'text/html; charset=utf-8',
    '<html><body>' +
      '<a href="/v1/explorer-code" target="_blank">/v1/explorer-code</a><br/>' +
      '<a href="/v1/info" target="_blank">/v1/info</a>' +
      '</body></html>',
    headers,
  );
};

export async function startHttpServer() {
  httpBridge.start(LOCAL_HTTP_SERVER_PORT, 'http_service', requestHandler);
  if (DEVICE_IOS) {
    // to keep the server alive
    await create({
      baseURL: `http://localhost:${LOCAL_HTTP_SERVER_PORT}`,
    }).get('/');
  }
}

export function stopHttpServer() {
  httpBridge.stop();
}
