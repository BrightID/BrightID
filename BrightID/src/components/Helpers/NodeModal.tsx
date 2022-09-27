import React, { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';
import { create } from 'apisauce';
import { NetworkInfo } from 'react-native-network-info';
import Clipboard from '@react-native-community/clipboard';
import httpBridge from 'react-native-http-bridge';
import { useDispatch, useSelector } from '@/store/hooks';
import { BLACK, GREEN, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_IOS, DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import {
  clearBaseUrl,
  removeCurrentNodeUrl,
  resetNodeUrls,
  selectAllNodeUrls,
  selectBaseUrl,
  selectDefaultNodeUrls,
} from '@/reducer/settingsSlice';
import { leaveAllChannels } from '@/components/PendingConnections/actions/channelThunks';
import GraphQl from '@/components/Icons/GraphQl';
import { getUserInfo } from '@/components/Onboarding/ImportFlow/thunks/channelUploadThunks';
import { getExplorerCode } from '@/utils/explorer';

const NodeModal = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const currentBaseUrl = useSelector(selectBaseUrl);
  const defaultNodeUrls = useSelector(selectDefaultNodeUrls);
  const currentNodeUrls = useSelector(selectAllNodeUrls);
  const dispatch = useDispatch();

  const goBack = () => {
    navigation.goBack();
  };

  const changeNodeHandler = () => {
    navigation.goBack();
    dispatch(leaveAllChannels());
    dispatch(removeCurrentNodeUrl());
  };

  const resetHandler = () => {
    dispatch(resetNodeUrls());
    dispatch(leaveAllChannels());
    dispatch(clearBaseUrl());
  };

  let resetContainer;
  if (!isEqual(defaultNodeUrls, currentNodeUrls)) {
    resetContainer = (
      <>
        <View style={styles.resetInfoContainer}>
          <Text style={styles.resetInfoText}>
            {t('nodeApiGate.reset.text')}
          </Text>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetHandler}>
          <Text style={styles.resetButtonText}>
            {t('nodeApiGate.reset.button')}
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  const [httpServerUrl, setHttpServerUrl] = useState('');

  const password = useSelector((state) => state.user.password);

  const toggleHttpServer = useCallback(async () => {
    const port = 9025;
    if (!httpServerUrl) {
      httpBridge.start(port, 'http_service', async (request) => {
        // you can use request.url, request.type and request.postData here
        const headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        };
        const url = request.url.slice(request.url.indexOf('/'));
        if (request.type === 'OPTIONS') {
          httpBridge.respond(
            request.requestId,
            200,
            'text/html; charset=utf-8',
            undefined,
            headers,
          );
        } else if (request.type === 'GET' && url === '/v1/info') {
          httpBridge.respond(
            request.requestId,
            200,
            'application/json',
            JSON.stringify(await getUserInfo()),
            headers,
          );
        } else if (request.type === 'GET' && url === '/v1/explorer-code') {
          httpBridge.respond(
            request.requestId,
            200,
            'application/json',
            JSON.stringify({
              explorerCode: getExplorerCode(),
              password,
            }),
            headers,
          );
        } else {
          httpBridge.respond(
            request.requestId,
            404,
            'text/html; charset=utf-8',
            '<html><body><a href="/v1/explorer-code" target="_blank">/v1/explorer-code</a></body></html>',
            headers,
          );
        }
      });
      if (DEVICE_IOS) {
        // to keep the server alive
        create({
          baseURL: `http://localhost:${port}`,
        })
          .get('/')
          .catch(console.error);
      }
      const ip = await NetworkInfo.getIPV4Address();
      const serverUrl = `${ip}:${port}`;
      Clipboard.setString(serverUrl);
      Alert.alert(t('home.alert.text.copied'));
      setHttpServerUrl(serverUrl);
    } else {
      httpBridge.stop();
      setHttpServerUrl('');
    }
  }, [httpServerUrl, password, t]);

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <TouchableWithoutFeedback onPress={goBack}>
        <View style={styles.blurView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {t('nodeModal.currentNode.header')}
          </Text>
          <Text style={styles.subHeaderText}>{currentBaseUrl}</Text>
        </View>
        <TouchableOpacity
          testID="SaveLevelBtn"
          style={styles.switchNodeButton}
          onPress={changeNodeHandler}
        >
          <Text style={styles.switchNodeButtonText}>
            {t('nodeModal.switchNodeButtonLabel')}
          </Text>
        </TouchableOpacity>
        {resetContainer}
        <TouchableOpacity
          testID="httpServerBtn"
          style={[
            styles.switchNodeButton,
            styles.httpServerButton,
            {
              backgroundColor: httpServerUrl ? GREEN : ORANGE,
            },
          ]}
          onPress={toggleHttpServer}
          accessible={true}
          accessibilityLabel={t('home.button.httpServer')}
        >
          <GraphQl
            width={DEVICE_LARGE ? 25 : 20}
            height={DEVICE_LARGE ? 25 : 20}
          />
          {httpServerUrl ? (
            <View style={styles.httpServerInfo}>
              <Text
                style={[
                  styles.switchNodeButtonText,
                  {
                    color: BLACK,
                  },
                ]}
              >
                {httpServerUrl}
              </Text>
              <Text style={styles.wifiSharingText}>WiFi Sharing Url</Text>
            </View>
          ) : (
            <Text style={styles.switchNodeButtonText}>
              {t('home.button.httpServer')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  header: {
    marginTop: 5,
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[19],
    textAlign: 'center',
    color: LIGHT_BLACK,
  },
  subHeaderText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: LIGHT_BLACK,
  },
  switchNodeButton: {
    width: '90%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  switchNodeButtonText: {
    paddingLeft: 4,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: WHITE,
  },
  resetInfoContainer: {
    marginBottom: 3,
    marginTop: 25,
  },
  resetInfoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: LIGHT_BLACK,
  },
  resetButton: {
    width: '70%',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  resetButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: WHITE,
  },
  httpServerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: DEVICE_LARGE ? 8 : 6,
  },
  httpServerInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  wifiSharingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[10],
    color: BLACK,
    lineHeight: DEVICE_LARGE ? 12 : 10,
  },
});

export default NodeModal;
