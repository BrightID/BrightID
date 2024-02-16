import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import i18next from 'i18next';
import CheckBox from '@react-native-community/checkbox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from '@/store/hooks';
import {
  BLACK,
  DARK_PRIMARY,
  GRAY8,
  GRAY9,
  GREY,
  ORANGE,
  SUCCESS,
  WHITE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { RecoveryErrorType } from './RecoveryError';
import { setupRecovery } from './thunks/recoveryThunks';
import { buildRecoveryChannelQrUrl } from '@/utils/recovery';
import {
  createRecoveryChannel,
  pollRecoveryChannel,
} from './thunks/channelThunks';
import {
  resetRecoveryData,
  selectRecoveryStep,
  setRecoverStep,
  uploadCompletedByOtherSide,
} from './recoveryDataSlice';
import {
  clearImportChannel,
  createSyncChannel,
  pollImportChannel,
  setupSync,
} from '../ImportFlow/thunks/channelThunks';
import { recover_steps, UNIVERSAL_LINK_PREFIX } from '@/utils/constants';
import { userSelector } from '@/reducer/userSlice';
import BrightIDLogo from '@/components/Icons/BrightIDLogo';
import Copy from '@/components/Icons/Copy';

/**
 * Recovery Code screen of BrightID
 *
 * displays a qrcode
 */

const RecoveryCodeScreen = ({ route }) => {
  const { action, urlType } = route.params;
  const [qrUrl, setQrUrl] = useState<URL>();
  const [qrsvg, setQrsvg] = useState('');
  const [alreadyNotified, setAlreadyNotified] = useState(false);
  const recoveryData = useSelector((state) => state.recoveryData);
  const { id } = useSelector(userSelector);
  const isScanned = useSelector(
    (state) =>
      uploadCompletedByOtherSide(state) ||
      state.recoveryData.recoveredConnections ||
      state.recoveryData.recoveredGroups ||
      state.recoveryData.recoveredBlindSigs,
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const step = useSelector(selectRecoveryStep);

  const sigCount = recoveryData.sigs
    ? Object.values(recoveryData.sigs).length
    : 0;

  // start polling recovery channel to get sig and mutual info
  useEffect(() => {
    if (
      action === 'recovery' &&
      recoveryData.recoverStep === recover_steps.POLLING_SIGS &&
      !recoveryData.channel.pollTimerId
    ) {
      dispatch(pollRecoveryChannel());
    }
  }, [
    action,
    dispatch,
    recoveryData.channel.pollTimerId,
    recoveryData.recoverStep,
  ]);

  // create recovery data and start polling channel
  useEffect(() => {
    const runRecoveryEffect = async () => {
      // create publicKey, secretKey, aesKey for user
      await dispatch(setupRecovery());
      // create channel and upload new publicKey to get signed by the scanner
      await dispatch(createRecoveryChannel());
      dispatch(setRecoverStep(recover_steps.POLLING_SIGS));
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

    if (step === recover_steps.NOT_STARTED) {
      if (action === 'recovery') {
        if (!id) {
          console.log(`initializing recovery process`);
          runRecoveryEffect();
        } else {
          console.log(`Not starting recovery process, user has id!`);
        }
      } else if (action === 'import') {
        console.log(`initializing import process`);
        runImportEffect();
      } else if (action === 'sync') {
        console.log(`initializing sync process`);
        runSyncEffect();
      }
    }
  }, [action, dispatch, id, step]);

  const [changePrimaryDevice, setChangePrimaryDevice] = useState(true);
  // set QRCode and SVG
  useEffect(() => {
    if (recoveryData.channel.url && recoveryData.aesKey) {
      const newQrUrl = buildRecoveryChannelQrUrl({
        aesKey: recoveryData.aesKey,
        url: recoveryData.channel.url,
        t: urlType,
        changePrimaryDevice,
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
  }, [
    changePrimaryDevice,
    recoveryData.aesKey,
    recoveryData.channel.url,
    urlType,
  ]);

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
      if (action === 'import') {
        clearImportChannel();
      }
      dispatch(resetRecoveryData());
      dispatch(setRecoverStep(recover_steps.ERROR));
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
        // we have enough sigs. Advance to next screen
        dispatch(setRecoverStep(recover_steps.RESTORING));
        navigation.navigate('Restore');
      } else if (action === 'import' && isScanned) {
        navigation.navigate('Import', { changePrimaryDevice });
      } else if (action === 'sync' && isScanned) {
        navigation.navigate('Devices', { syncing: true, asScanner: false });
      }
    }, [
      action,
      alreadyNotified,
      sigCount,
      isScanned,
      t,
      dispatch,
      navigation,
      changePrimaryDevice,
    ]),
  );

  const copyQr = () => {
    const universalLink = `${UNIVERSAL_LINK_PREFIX}connection-code/${encodeURIComponent(
      qrUrl.href,
    )}`;

    const languageTag = i18next.resolvedLanguage;
    const expirationDate = new Date(recoveryData.channel.expires);
    const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'UTC',
      timeZoneName: 'short',
    };
    const expirationTimestamp = new Intl.DateTimeFormat(
      languageTag,
      dateTimeFormatOptions,
    ).format(expirationDate);
    console.log(expirationTimestamp);

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
          link: `${universalLink} `, // enforce trailing space to fix #1066
          expirationTimestamp,
        });
        break;
      case 'import':
        alertTitle = t('import.alert.title', 'Import BrightID link');
        alertText = t(
          'import.alert.text',
          'Open this link with the BrightID app that should be imported.',
        );
        clipboardMsg = t('import.clipboardmessage', {
          link: `${universalLink} `, // enforce trailing space to fix #1066
          expirationTimestamp,
        });
        break;
      case 'sync':
        alertTitle = t('sync.alert.title', 'Sync user data');
        alertText = t(
          'sync.alert.text',
          'Open this link with the BrightID app that should be synced.',
        );
        clipboardMsg = t('sync.clipboardmessage', {
          link: `${universalLink} `, // enforce trailing space to fix #1066
          expirationTimestamp,
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.container}>
        <View style={styles.LogoContainer}>
          <BrightIDLogo />
        </View>

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
            {action === 'import' && (
              <View style={styles.changePrimaryDeviceSwitchContainer}>
                <CheckBox
                  tintColors={{ false: GREY, true: ORANGE }}
                  onValueChange={(value) => {
                    setChangePrimaryDevice(value);
                  }}
                  value={changePrimaryDevice}
                />
                <Text
                  style={styles.changePrimaryDeviceSwitchLabel}
                  onPress={() => {
                    setChangePrimaryDevice(!changePrimaryDevice);
                  }}
                >
                  set as primary device
                </Text>
              </View>
            )}
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
              <Copy />
              <Text style={styles.copyText}>
                {' '}
                {t('common.button.copyLink')}
              </Text>
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
  LogoContainer: {},
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    paddingLeft: 20,
    paddingRight: 20,
    zIndex: 10,
    overflow: 'hidden',
  },
  changePrimaryDeviceSwitchContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  changePrimaryDeviceSwitchLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: GRAY9,
  },
  qrsvgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryCodeInfoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[17],
    textAlign: 'center',
    color: GRAY9,
    width: '80%',
    lineHeight: 24,
  },
  additionalInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    textAlign: 'center',
    color: GRAY8,
    lineHeight: 24,
    marginBottom: DEVICE_LARGE ? 50 : 45,
  },
  signatures: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    textAlign: 'center',
    color: SUCCESS,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    minWidth: 100,
    marginTop: 20,
  },
  copyText: {
    color: DARK_PRIMARY,
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    marginLeft: 12,
  },
});

export default RecoveryCodeScreen;
