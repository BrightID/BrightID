import React from 'react';
import {
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
import { LIGHT_BLACK, ORANGE, WHITE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { useDispatch, useSelector } from '@/store';
import {
  clearBaseUrl,
  removeCurrentNodeUrl,
  resetNodeUrls,
  selectAllNodeUrls,
  selectBaseUrl,
  selectDefaultNodeUrls,
} from '@/reducer/settingsSlice';
import { leaveAllChannels } from '@/components/PendingConnections/actions/channelThunks';

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
            You are not using the default nodelist
          </Text>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetHandler}>
          <Text style={styles.resetButtonText}>Restore default nodelist</Text>
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
          <Text style={styles.headerText}>Current node:</Text>
          <Text style={styles.subHeaderText}>{currentBaseUrl}</Text>
        </View>
        <TouchableOpacity
          testID="SaveLevelBtn"
          style={styles.switchNodeButton}
          onPress={changeNodeHandler}
        >
          <Text style={styles.switchNodeButtonText}>
            Switch to another node
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
});

export default NodeModal;
