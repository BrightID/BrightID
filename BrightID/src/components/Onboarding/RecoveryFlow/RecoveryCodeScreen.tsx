import React, { useCallback, useEffect } from 'react';
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
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import i18next from 'i18next';
import CheckBox from '@react-native-community/checkbox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from '@/store/hooks';
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
import { resetRecoveryData, setRecoverStep } from './recoveryDataSlice';
import { clearImportChannel } from '../ImportFlow/thunks/channelThunks';
import { recover_steps, UNIVERSAL_LINK_PREFIX } from '@/utils/constants';
import BrightIDLogo from '@/components/Icons/BrightIDLogo';
import Copy from '@/components/Icons/Copy';
import { useGenerateRecoveryQrAndPoll } from './useGenerateRecoveryQrAndPoll';

/**
 * Recovery Code screen of BrightID
 *
 * displays a qrcode
 */

const RecoveryCodeScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const { action, urlType } = route.params;

  const {
    isScanned,
    qrUrl,
    qrsvg,
    sigCount,
    changePrimaryDevice,
    setChangePrimaryDevice,
    recoveryData,
    alreadyNotified,
    setAlreadyNotified,
  } = useGenerateRecoveryQrAndPoll({ action, urlType });

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
      setAlreadyNotified,
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
                  // style={{borderRadius: }}
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
    marginLeft: 8,
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
