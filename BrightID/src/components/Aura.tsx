import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native';
import { getUserInfo } from '@/components/Onboarding/ImportFlow/thunks/channelUploadThunks';
import { useSelector } from '@/store/hooks';
import { userSelector } from '@/reducer/userSlice';

/** HomeScreen Component */

export const AuraScreen = () => {
  const webviewRef = useRef();
  const uri = 'http://10.0.2.2:3000/';
  const [userInfo, setUserInfo] = useState(null);
  const user = useSelector(userSelector);

  useEffect(() => {
    getUserInfo(user).then((data) => setUserInfo(data));
  }, [user]);

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
