import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { useDispatch, useSelector } from '@/store';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BLACK, DARKER_GREY, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';
import {
  channel_types,
  closeChannel,
} from '@/components/PendingConnections/channelSlice';
import api from '@/api/brightId';
import { setupRecovery } from '@/components/Onboarding/RecoveryFlow/thunks/recoveryThunks';
import { buildRecoveryChannelQrUrl } from '@/utils/recovery';
import { buildChannelQrUrl } from '@/utils/channels';
import {
  clearChannel,
  createChannel,
  pollChannel,
} from './thunks/channelThunks';
import { resetRecoveryData } from './recoveryDataSlice';

/**
 * Recovery Code screen of BrightID
 *
 * displays a qrcode
 */
const RecoveryCodeScreen = () => {
  const [qrUrl, setQrUrl] = useState<URL>();
  const [qrsvg, setQrsvg] = useState('');
  const [alreadyNotified, setAlreadyNotified] = useState(false);

  const recoveryData = useSelector((state: State) => state.recoveryData);

  const sigCount = recoveryData.sigs
    ? Object.values(recoveryData.sigs).length
    : 0;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // create recovery data and start polling channel
  useEffect(() => {
    const runEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel for recovery sigs
      await dispatch(createChannel());
      // start polling channel
      dispatch(pollChannel());
    };
    if (!recoveryData.aesKey) {
      console.log(`initializing recovery process`);
      runEffect();
    }
  }, [dispatch, recoveryData]);

  // set QRCode and SVG
  useEffect(() => {
    if (recoveryData.channel.url && recoveryData.aesKey) {
      const newQrUrl = buildRecoveryChannelQrUrl({
        aesKey: recoveryData.aesKey,
        url: recoveryData.channel.url,
      });
      console.log(`new qrCode url: ${newQrUrl.href}`);
      setQrUrl(newQrUrl);

      const parseQrString = (err, qrsvg) => {
        if (err) return console.log(err);
        setQrsvg(qrsvg);
      };

      qrcode.toString(newQrUrl.href, (err, qr) => {
        if (err) return console.log(err);
        parseString(qr, parseQrString);
      });
    }
  }, [recoveryData.aesKey, recoveryData.channel.url]);

  // track errors
  useEffect(() => {
    if (recoveryData.errorType !== RecoveryErrorType.NONE) {
      // something went wrong. Show error message to user and stop recovery process
      let message;
      switch (recoveryData.errorType) {
        case RecoveryErrorType.MISMATCH_ID:
          message = t(
            'recovery.error.mismatchId',
            'Your recovery connections selected different accounts',
          );
          break;
        case RecoveryErrorType.GENERIC:
        default:
          // use untranslated errorMessage from state if available, generic message otherwise
          message =
            recoveryData.errorMessage !== ''
              ? recoveryData.errorMessage
              : t('recovery.error.unknown', 'An unknown error occured');
      }
      Alert.alert(
        t('recovery.error.title', 'Account recovery failed'),
        message,
      );
      clearChannel();
      dispatch(resetRecoveryData());
      navigation.goBack();
    }
  }, [
    dispatch,
    navigation,
    recoveryData.errorMessage,
    recoveryData.errorType,
    t,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!alreadyNotified && sigCount === 1) {
        // alert user that one of their sigs exists
        Alert.alert(
          t('common.alert.info'),
          t('common.alert.text.trustedSigned'),
        );
        setAlreadyNotified(true);
      } else if (sigCount > 1) {
        navigation.navigate('Restore');
      }
    }, [sigCount, alreadyNotified, t, navigation]),
  );

  const copyQr = () => {
    const universalLink = `https://app.brightid.org/connection-code/${encodeURIComponent(
      qrUrl.href,
    )}`;
    const clipboardMsg = __DEV__
      ? universalLink
      : t('recovery.alert.clipboardmessage', {
          defaultValue: 'Help me recover my BrightID: {{link}}',
          link: universalLink,
        });

    Alert.alert(
      t('recovery.alert.title', 'Recovery link'),
      t(
        'recovery.alert.text',
        'Share this link with your recovery connections.',
      ),
      [
        {
          text: t('common.button.copy'),
          onPress: () => {
            Clipboard.setString(clipboardMsg);
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <Text style={styles.recoveryCodeInfoText}>
          {t('recovery.text.askTrustedConnections')}
        </Text>

        {qrsvg ? (
          <View style={styles.qrsvgContainer}>
            <Text style={styles.signatures}>
              {t('recovery.text.signatures', { count: sigCount })}
            </Text>
            <Svg
              height={DEVICE_LARGE ? '240' : '200'}
              width={DEVICE_LARGE ? '240' : '200'}
              viewBox={path(['svg', '$', 'viewBox'], qrsvg)}
              shape-rendering="crispEdges"
            >
              <Path
                fill={WHITE}
                d={path(['svg', 'path', '0', '$', 'd'], qrsvg)}
              />
              <Path
                stroke={BLACK}
                d={path(['svg', 'path', '1', '$', 'd'], qrsvg)}
              />
            </Svg>

            <TouchableOpacity style={styles.copyContainer} onPress={copyQr}>
              <Material
                size={24}
                name="content-copy"
                color={LIGHT_BLACK}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.copyText}> {t('common.button.copy')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.qrsvgContainer}>
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 48 : 42}
              type="9CubeGrid"
              color={ORANGE}
            />
          </View>
        )}
        <Text style={styles.additionalInfo}>
          {t('recovery.text.additionalInfo')}
        </Text>
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
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  qrsvgContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryCodeInfoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: BLACK,
    width: '80%',
    marginTop: DEVICE_LARGE ? 30 : 26,
  },
  additionalInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: DARKER_GREY,
    width: '80%',
    marginBottom: DEVICE_LARGE ? 50 : 45,
  },
  signatures: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: BLACK,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    minWidth: 100,
  },
  copyText: {
    color: BLACK,
    fontFamily: 'Poppins-Medium',
  },
});

export default RecoveryCodeScreen;
