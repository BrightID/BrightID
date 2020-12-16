// @flow

import React, { useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { useSelector } from 'react-redux';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import api from '@/api/brightId';
import ChannelAPI from '@/api/channelService';
import {
  setupRecovery,
  uploadSigRequest,
  checkChannel,
  recoveryQrStr,
} from './helpers';

/**
 * Recovery Code screen of BrightID
 *
 * displays a qrcode
 */

const RecoveryCodeScreen = () => {
  const checkInProgress = useRef(false);

  const [qrsvg, setQrsvg] = useState('');
  const [copied, setCopied] = useState(false);

  const count = useSelector(
    (state) =>
      state.connections.connections.length + state.groups.groups.length,
  );

  let recoveryData = useSelector((state) => state.recoveryData);

  const { t } = useTranslation();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let channelApi;
      let checkIntervalId = 0;

      const parseQrString = (err, qrsvg) => {
        if (err) return console.log(err);
        setQrsvg(qrsvg);
      };

      if (!recoveryData.timestamp) {
        // setup recovery only if it's not set up before
        setupRecovery().catch((err) => {
          // warn user
          alert(err.message);
        });
      } else {
        api
          .ip()
          .then((ipAddress) => {
            channelApi = new ChannelAPI(`http://${ipAddress}/profile`);
            return uploadSigRequest(channelApi, recoveryData);
          })
          .then(() => {
            qrcode.toString(recoveryQrStr(), (err, qr) => {
              if (err) return console.log(err);
              parseString(qr, parseQrString);
            });
            checkIntervalId = setInterval(() => {
              if (checkInProgress.current) {
                console.log('checkChannel in progress');
                return;
              }
              checkInProgress.current = true;
              checkChannel(channelApi)
                .then((ready) => {
                  checkInProgress.current = false;
                  if (ready) navigation.navigate('Restore');
                })
                .catch((err) => {
                  checkInProgress.current = false;
                  console.warn(err);
                });
            }, 3000);
            console.log('start waiting for sigs', checkIntervalId);
          });
      }

      () => {
        clearInterval(checkIntervalId);
      };
    }, [recoveryData, navigation]),
  );

  const copyQr = () => {
    const recoveryCode = recoveryQrStr();
    const universalLink = `https://app.brightid.org/connection-code/${recoveryCode}`;
    Clipboard.setString(universalLink);
    setCopied(true);
  };

  const renderCopyQr = () => (
    <TouchableOpacity style={styles.copyContainer} onPress={copyQr}>
      <Material
        size={24}
        name="content-copy"
        color="#333"
        style={{ width: 24, height: 24 }}
      />
      <Text style={styles.copyText}> {t('common.button.copy')}</Text>
    </TouchableOpacity>
  );

  const renderSpinner = () => (
    <View style={styles.qrsvgContainer}>
      <Spinner
        // style={styles.spinner}
        isVisible={true}
        size={47}
        type="9CubeGrid"
        color="#4990e2"
      />
    </View>
  );

  const renderQrCode = () => (
    <View style={[styles.qrsvgContainer]}>
      <Svg
        height={DEVICE_LARGE ? '260' : '200'}
        width={DEVICE_LARGE ? '260' : '200'}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={path(['svg', '$', 'viewBox'], qrsvg)}
        shape-rendering="crispEdges"
      >
        <Path
          fill={copied ? 'lightblue' : '#fff'}
          d={path(['svg', 'path', '0', '$', 'd'], qrsvg)}
        />
        <Path stroke="#000" d={path(['svg', 'path', '1', '$', 'd'], qrsvg)} />
      </Svg>
    </View>
  );

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <View style={styles.topHalf}>
          <Text style={styles.recoveryCodeInfoText}>
            {t('recovery.text.askTrustedConnections')}
          </Text>
          <Text style={styles.recoveryCodeInfoText}>
            {t('recovery.text.recoveredItems', { count })}
          </Text>
        </View>
        <View style={styles.bottomHalf}>
          {qrsvg ? renderQrCode() : renderSpinner()}
          {qrsvg ? renderCopyQr() : <View />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  topHalf: {
    height: '33%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHalf: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  recoveryCodeInfoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#4a4a4a',
    marginLeft: 4,
    marginRight: 4,
  },
  qrsvgContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    minWidth: 100,
  },
  copyText: {
    color: '#333',
    fontFamily: 'ApexNew-Book',
  },
});

export default RecoveryCodeScreen;
