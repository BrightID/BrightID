import React from 'react';
import { useDispatch, useSelector } from '@/store/hooks';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  clearBaseUrl,
  removeCurrentNodeUrl,
  resetNodeUrls,
  selectAllNodeUrls,
  selectBaseUrl,
  selectDefaultNodeUrls,
} from '@/reducer/settingsSlice.ts';
import { leaveAllChannels } from '@/components/PendingConnections/actions/channelThunks.ts';
import { isEqual } from 'lodash';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BLACK, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors.ts';
import { DEVICE_LARGE } from '@/utils/deviceConstants.ts';
import { fontSize } from '@/theme/fonts.ts';

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
