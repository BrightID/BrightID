// @flow

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from 'react-redux';
import { ORANGE, report_reasons } from '../../utils/constants';
import { reportConnection } from './models/reportConnection';

type props = {
  route: any,
  navigation: any,
};

const reasonStrings = {
  [report_reasons.FAKE]: 'Fake account',
  [report_reasons.DUPLICATE]: 'Duplicate account',
  [report_reasons.SPAMMER]: 'Spammer',
  [report_reasons.DECEASED]: 'Deceased',
};

const ReportReasonModal = ({ route, navigation }: props) => {
  const { connectionId, successCallback } = route.params;
  const connection: connection = useSelector((state: State) =>
    state.connections.connections.find((conn) => conn.id === connectionId),
  );
  const dispatch = useDispatch();

  // go back silently if connection does not exist. Should never happen.
  if (!connection) {
    console.log(`Connection ${connectionId} not found!`);
    navigation.goBack();
    return null;
  }

  const confirmReport = async (reason: string) => {
    console.log(
      `Reporting connection ${connection.name} with reason ${reason}`,
    );
    dispatch(reportConnection({ id: connectionId, reason }));
    // close modal
    navigation.goBack();
    if (successCallback) {
      successCallback();
    }
  };

  const cancelReport = async () => {
    navigation.goBack();
  };

  const renderReportButton = (reason: string) => {
    return (
      <TouchableOpacity
        testID={`${reason}-ReportBtn`}
        key={reason}
        style={styles.reportButton}
        onPress={() => confirmReport(reason)}
      >
        <Text style={styles.reportButtonText}>{reasonStrings[reason]}</Text>
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
          new String('black') // BlurView lib flow definition expects Wrapper String type
        }
      />
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Report {connection.name}</Text>
        </View>
        <View style={styles.message}>
          <Text style={styles.messageText}>
            {`Note that reporting ${connection.name} will negatively affect their BrightID verification, and the report might be shown to other users.`}
          </Text>
        </View>
        {Object.values(report_reasons).map((reason) =>
          renderReportButton(reason),
        )}
        <TouchableOpacity
          testID="CancelReportBtn"
          style={styles.cancelButton}
          onPress={cancelReport}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 30 : 25,
  },
  header: {
    marginTop: 5,
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 20 : 17,
    textAlign: 'center',
  },
  message: {},
  messageText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 15 : 13,
    textAlign: 'left',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    width: '90%',
    borderRadius: 100,
    borderColor: ORANGE,
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 17 : 15,
    color: ORANGE,
  },
  cancelButton: {
    width: '90%',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 17 : 15,
    color: '#000',
  },
});

export default ReportReasonModal;
