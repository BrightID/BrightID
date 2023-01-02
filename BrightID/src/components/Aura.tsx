import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { Text, TouchableOpacity } from 'react-native';

/** HomeScreen Component */

export const AuraScreen = () => {
  const webviewRef = useRef();
  const uri = 'http://10.0.2.2:3000/';

  const sendDataToWebView = () => {
    webviewRef?.current?.injectJavaScript(
      `window.postMessage('dataaaaa', '${uri}')`,
    );
  };

  return (
    <>
      <WebView
        ref={webviewRef}
        style={{ marginTop: 60 }}
        originWhitelist={['*']}
        injectJavaScript={() => {
          return "window.alert('second message')";
        }}
        source={{ uri }}
      />
      <TouchableOpacity onPress={sendDataToWebView}>
        <Text>hi</Text>
      </TouchableOpacity>
    </>
  );
};

export default AuraScreen;
