import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native';
import { getUserInfo } from '@/components/Onboarding/ImportFlow/thunks/channelUploadThunks';

/** HomeScreen Component */

export const AuraScreen = () => {
  const webviewRef = useRef();
  const uri = 'http://10.0.2.2:3000/';
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    getUserInfo().then((data) => setUserInfo(data));
  }, []);

  const injectedJs = useMemo(
    () => `window.postMessage('${JSON.stringify({ userInfo })}', '${uri}')`,
    [userInfo],
  );

  return (
    <>
      {injectedJs ? (
        <WebView
          ref={webviewRef}
          style={{ marginTop: 60 }}
          originWhitelist={['*']}
          injectedJavaScript={injectedJs}
          source={{ uri }}
        />
      ) : (
        <Text>Loading...</Text>
      )}
    </>
  );
};

export default AuraScreen;
