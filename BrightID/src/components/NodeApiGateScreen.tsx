import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-native-spinkit';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { isEqual } from 'lodash';
import { useDispatch, useSelector } from '@/store/hooks';
import { ApiGateState, useNodeApiContext } from '@/context/NodeApiContext';
import { BLACK, ORANGE, RED, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { NODE_CHOOSER_TIMEOUT_MS } from '@/utils/constants';
import {
  resetNodeUrls,
  selectAllNodeUrls,
  selectDefaultNodeUrls,
} from '@/reducer/settingsSlice';

const calculateSecondsLeft = (startTimestamp: number) => {
  const endTime = startTimestamp + NODE_CHOOSER_TIMEOUT_MS;
  const remaining = endTime - Date.now();
  return Math.ceil(remaining / 1000);
};

export const NodeApiGateScreen = () => {
  const { gateState, startTimestamp, retryHandler } = useNodeApiContext();
  const { t } = useTranslation();
  const [stateDescription, setStateDescription] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [iconData, setIconData] = useState<{ color: string; name: string }>(
    undefined,
  );
  const defaultNodeUrls = useSelector(selectDefaultNodeUrls);
  const currentNodeUrls = useSelector(selectAllNodeUrls);
  const dispatch = useDispatch();

  useEffect(() => {
    switch (gateState) {
      case ApiGateState.INITIAL:
      case ApiGateState.SEARCHING_NODE:
      case ApiGateState.SEARCH_REQUESTED:
      case ApiGateState.NODE_AVAILABLE:
        setIconData(undefined);
        setStateDescription(t('nodeApiGate.state.connecting'));
        break;
      case ApiGateState.ERROR_NO_NODE:
        setIconData({ color: RED, name: 'alert-circle-outline' });
        if (currentNodeUrls.length) {
          setStateDescription(t('nodeApiGate.state.noConnection'));
        } else {
          setStateDescription(t('nodeApiGate.state.noNode'));
        }
        break;
      default:
        console.log(`Unhandled gateState ${gateState}!`);
    }
  }, [currentNodeUrls.length, gateState, t]);

  // countdown until timeout reached
  useEffect(() => {
    let timerId;
    if (startTimestamp > 0) {
      timerId = setInterval(() => {
        const remainingSeconds = calculateSecondsLeft(startTimestamp);
        if (remainingSeconds >= 0) {
          setSecondsLeft(remainingSeconds);
        }
      }, 500);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [startTimestamp]);

  const resetHandler = () => {
    dispatch(resetNodeUrls());
    retryHandler();
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

  let retryInfo;
  if (currentNodeUrls.length) {
    retryInfo = (
      <TouchableOpacity style={styles.retryBtn} onPress={retryHandler}>
        <Text style={styles.retryBtnText}>{t('common.button.retry')}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={WHITE}
          animated={true}
        />

        <View style={styles.header}>
          <Image
            source={require('@/static/brightid-final.png')}
            accessible={true}
            accessibilityLabel="Home Header Logo"
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        <View style={styles.center}>
          {iconData ? (
            <Ionicons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 84 : 72}
              // @ts-ignore
              name={iconData.name}
              color={iconData.color}
            />
          ) : (
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 84 : 72}
              type="Wave"
              color={ORANGE}
            />
          )}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>{stateDescription}</Text>
          </View>
          {gateState !== ApiGateState.ERROR_NO_NODE ? (
            <View style={styles.timeoutContainer}>
              {secondsLeft > 0 && (
                <Text style={styles.infoText}>
                  {t('nodeApiGate.timer.text', { secondsLeft })}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              {retryInfo}
              {resetContainer}
            </View>
          )}
        </View>
      </SafeAreaView>
      <View style={styles.orangeBottom} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    marginBottom: DEVICE_LARGE ? 35 : 20,
    zIndex: 2,
    overflow: 'hidden',
  },
  orangeBottom: {
    backgroundColor: ORANGE,
    width: '100%',
    height: 100,
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15%',
  },
  logo: {
    maxWidth: '40%',
    maxHeight: 90,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    margin: 40,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: 26,
  },
  timeoutContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DEVICE_LARGE ? 85 : 70,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DEVICE_LARGE ? 85 : 70,
  },
  retryBtnContainer: {},
  retryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 160 : 140,
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: ORANGE,
    borderRadius: 100,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  retryBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
  },
  resetInfoContainer: {
    marginBottom: 3,
    marginTop: 25,
  },
  resetInfoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: ORANGE,
    borderRadius: 100,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  resetButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: WHITE,
    marginLeft: 20,
    marginRight: 20,
  },
});
