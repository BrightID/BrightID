import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store';
import { BLACK, DARKER_GREY, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { RecoveryErrorType } from './RecoveryError';
import { setupRecovery } from './thunks/recoveryThunks';
import { buildRecoveryChannelQrUrl } from '@/utils/recovery';
import {
  clearRecoveryChannel,
  createRecoveryChannel,
  pollRecoveryChannel,
} from './thunks/channelThunks';
import {
  resetRecoveryData,
  uploadCompletedByOtherSide,
} from './recoveryDataSlice';
import {
  setupSync,
  createSyncChannel,
  pollImportChannel,
  clearImportChannel,
} from '../ImportFlow/thunks/channelThunks';

/**
 * Recovery Code screen of BrightID
 *
 * displays a qrcode
 */
enum RecoverSteps {
  NOT_STARTED,
  RUNNING,
  ERROR,
}

const RecoveryCodeScreen = ({ route }) => {
  const { action, urlType } = route.params;
  const [qrUrl, setQrUrl] = useState<URL>();
  const [qrsvg, setQrsvg] = useState('');
  const [alreadyNotified, setAlreadyNotified] = useState(false);
  const recoveryData = useSelector((state: State) => state.recoveryData);
  const isScanned = useSelector(
    (state: State) =>
      uploadCompletedByOtherSide(state) ||
      state.recoveryData.recoveredConnections ||
      state.recoveryData.recoveredGroups ||
      state.recoveryData.recoveredBlindSigs,
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [step, setStep] = useState<RecoverSteps>(RecoverSteps.NOT_STARTED);

  const sigCount = recoveryData.sigs
    ? Object.values(recoveryData.sigs).length
    : 0;

  // create recovery data and start polling channel
  useEffect(() => {
    const runRecoveryEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel and upload new publicKey to get signed by the scanner
      await dispatch(createRecoveryChannel());
      // start polling channel to get sig and mutual info
      dispatch(pollRecoveryChannel());
    };
    const runImportEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel and upload new publicKey to be added as a new signing key by the scanner
      await dispatch(createRecoveryChannel());
      // start polling channel to get connections/groups/blindsigs info
      dispatch(pollImportChannel());
    };
    const runSyncEffect = async () => {
      // create a new aesKey
      await dispatch(setupSync());
      // create channel and upload lastSyncTime to the channel if it is not primary device
      // or poll lastSyncTime from other side if it is and then upload connections/groups/blindsigs
      // added after lastSyncTime to the channel
      await dispatch(createSyncChannel());
      // start polling channel to get new connections/groups/blindsigs info
      dispatch(pollImportChannel());
    };

    if (step === RecoverSteps.NOT_STARTED) {
      if (action === 'recovery') {
        console.log(`initializing recovery process`);
        runRecoveryEffect();
      } else if (action === 'import') {
        console.log(`initializing import process`);
        runImportEffect();
      } else if (action === 'sync') {
        console.log(`initializing sync process`);
        runSyncEffect();
      }
      setStep(RecoverSteps.RUNNING);
    }
  }, [action, dispatch, recoveryData.aesKey, step]);

  // set QRCode and SVG
  useEffect(() => {
    if (recoveryData.channel.url && recoveryData.aesKey) {
      const newQrUrl = buildRecoveryChannelQrUrl({
        aesKey: recoveryData.aesKey,
        url: recoveryData.channel.url,
        t: urlType,
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
  }, [recoveryData.aesKey, recoveryData.channel.url, urlType]);

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
      if (action === 'recovery') {
        clearRecoveryChannel();
      } else if (action === 'import') {
        clearImportChannel();
      }
      dispatch(resetRecoveryData());
      setStep(RecoverSteps.ERROR);
      navigation.goBack();
    }
  }, [
    action,
    dispatch,
    navigation,
    recoveryData.errorMessage,
    recoveryData.errorType,
    t,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (action === 'recovery' && !alreadyNotified && sigCount === 1) {
        // alert user that one of their sigs exists
        Alert.alert(
          t('common.alert.info'),
          t('common.alert.text.recoverySigned'),
        );
        setAlreadyNotified(true);
      } else if (action === 'recovery' && sigCount > 1) {
        navigation.navigate('Restore');
      } else if (action === 'import' && isScanned) {
        navigation.navigate('Import');
      } else if (action === 'sync' && isScanned) {
        navigation.navigate('Devices', { syncing: true, asScanner: false });
      }
    }, [action, alreadyNotified, sigCount, isScanned, t, navigation]),
  );

  const copyQr = () => {
    const universalLink = `https://app.brightid.org/connection-code/${encodeURIComponent(
      qrUrl.href,
    )}`;

    let alertTitle: string;
    let alertText: string;
    let clipboardMsg: string;
    switch (action) {
      case 'recovery':
        alertTitle = t('recovery.alert.title', 'Recovery link');
        alertText = t(
          'recovery.alert.text',
          'Share this link with your recovery connections.',
        );
        clipboardMsg = t('recovery.clipboardmessage', {
          defaultValue: 'Help me recover my BrightID: {{link}}',
          link: universalLink,
        });
        break;
      case 'import':
        alertTitle = t('import.alert.title', 'Import BrightID link');
        alertText = t(
          'import.alert.text',
          'Open this link with the BrightID app that should be imported.',
        );
        clipboardMsg = t('import.clipboardmessage', {
          defaultValue: 'Export your BrightID to another device: {{link}}',
          link: universalLink,
        });
        break;
      case 'sync':
        alertTitle = t('sync.alert.title', 'Sync user data');
        alertText = t(
          'sync.alert.text',
          'Open this link with the BrightID app that should be synced.',
        );
        clipboardMsg = t('sync.clipboardmessage', {
          defaultValue: 'Sync your BrightID data with another device: {{link}}',
          link: universalLink,
        });
        break;
      default:
        break;
    }

    if (__DEV__) {
      clipboardMsg = universalLink;
    }

    Alert.alert(
      alertTitle,
      alertText,
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
          {action === 'recovery' && t('recovery.text.askScanning')}
          {action === 'import' && t('import.text.askScanning')}
          {action === 'sync' && t('sync.text.askScanning')}
        </Text>

        {qrsvg ? (
          <View style={styles.qrsvgContainer}>
            <Text style={styles.signatures}>
              {action === 'recovery'
                ? t('recovery.text.signatures', { count: sigCount })
                : ''}
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
            {__DEV__ && (
              <View>
                <Text style={{ fontSize: 6 }} testID="qrcode">
                  {qrUrl?.href}
                </Text>
              </View>
            )}
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
          {action === 'recovery' && t('recovery.text.additionalInfo')}
          {action === 'import' && t('import.text.additionalInfo')}
          {action === 'sync' && t('sync.text.additionalInfo')}
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
