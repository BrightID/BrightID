// @flow

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { DEVICE_LARGE, DEVICE_ANDROID } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORANGE, report_reasons } from '../../utils/constants';
import { reportConnection } from './models/reportConnection';

type props = {
  route: any,
  navigation: any,
};

const reasonStrings = {
  [report_reasons.SPAMMER]: {
    description: 'This person sent me unwanted connection request',
  },
  [report_reasons.DUPLICATE]: {
    description: 'I know this person created multiple accounts',
  },
  [report_reasons.FAKE]: {
    description: 'This person does not exist',
  },
};

const ReportReasonModal = ({ route, navigation }: props) => {
  const { connectionId, successCallback } = route.params;
  const connection: connection = useSelector((state: State) =>
    state.connections.connections.find((conn) => conn.id === connectionId),
  );
  const dispatch = useDispatch();
  const [reason, setReason] = useState(undefined);

  // Don't crash when connection does not exist. Should never happen.
  if (!connection) {
    console.log(`Connection ${connectionId} not found!`);
    return null;
  }

  const confirmReport = () => {
    if (reason) {
      console.log(
        `Reporting connection ${connection.name} with reason ${reason}`,
      );
      // close modal
      navigation.goBack();
      dispatch(reportConnection({ id: connectionId, reason }));
      if (successCallback) {
        successCallback();
      }
    }
  };

  const cancelReport = () => {
    navigation.goBack();
  };

  const renderReasonButton = (btnReason: string) => {
    const active = btnReason === reason;
    return (
      <TouchableOpacity
        testID={`${btnReason}-RadioBtn`}
        key={btnReason}
        onPress={() => setReason(btnReason)}
        style={styles.radioButton}
      >
        <View style={styles.radioCircle}>
          {active && <View style={styles.radioInnerCircle} />}
        </View>
        <View style={styles.radioLabel}>
          <Text style={styles.radioLabelText}>
            {reasonStrings[btnReason]?.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} testID="ReportReasonModal">
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={
          // eslint-disable-next-line no-new-wrappers
          DEVICE_ANDROID ? new String('black') : 'black' // BlurView lib flow definition expects Wrapper String type
        }
      />
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Report {connection.name}</Text>
        </View>
        <View style={styles.message}>
          <Material name="information" size={26} color="#2185D0" />
          <Text style={styles.messageText}>
            {`Note that reporting ${connection.name} will negatively affect their BrightID verification, and the report might be shown to other users.`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.radioButtonsContainer}>
          {Object.keys(reasonStrings).map((reason) =>
            renderReasonButton(reason),
          )}
        </View>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            testID="SubmitReportBtn"
            style={[styles.modalButton, styles.submitButton]}
            onPress={confirmReport}
            disabled={!reason}
          >
            <Text
              style={
                reason
                  ? styles.submitButtonText
                  : styles.submitButtonDisabledText
              }
            >
              Submit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="CancelReportBtn"
            style={[styles.modalButton, styles.cancelButton]}
            onPress={cancelReport}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  header: {
    marginTop: 5,
    marginBottom: 25,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 22 : 19,
    textAlign: 'center',
  },
  message: {
    flexDirection: 'row',
  },
  messageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 13 : 12,
    textAlign: 'left',
    marginLeft: 10,
    color: '#827F7F',
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ORANGE,
    width: '105%',
    height: 1,
    marginTop: DEVICE_LARGE ? 24 : 22,
    marginBottom: DEVICE_LARGE ? 24 : 22,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonsContainer: {
    marginLeft: 10,
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: ORANGE,
    alignItems: 'center', // To center the checked circle…
    justifyContent: 'center',
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 10,
    backgroundColor: ORANGE,
  },
  radioLabel: {
    marginLeft: DEVICE_LARGE ? 12 : 10,
    marginRight: DEVICE_LARGE ? 12 : 10,
  },
  radioLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    borderColor: '#707070',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#707070',
  },
  submitButton: {
    backgroundColor: '#5DEC9A',
    borderRadius: 50,
    borderColor: '#5DEC9A',
    borderWidth: 1,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#000',
  },
  submitButtonDisabledText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#707070',
  },
});

export default ReportReasonModal;
