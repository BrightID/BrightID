import React, { useContext, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import i18next from 'i18next';
import { BlurView } from '@react-native-community/blur';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from '@/store';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { connection_levels, report_reasons } from '@/utils/constants';
import { ORANGE, WHITE, BLUE, BLACK, DARKER_GREY, GREEN } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { StackScreenProps } from '@react-navigation/stack';
import { selectConnectionById } from '@/reducer/connectionsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';
import { setConnectionLevel } from '@/actions';
import { reportConnection } from './models/reportConnection';

const reasonStrings = {
  [report_reasons.SPAMMER]: {
    description: i18next.t('connectionDetails.text.reportSpammer'),
  },
  [report_reasons.DUPLICATE]: {
    description: i18next.t('connectionDetails.text.reportDuplicate'),
  },
  [report_reasons.OTHER]: {
    description: i18next.t('connectionDetails.text.reportOther'),
  },
};

type props = StackScreenProps<ModalStackParamList, 'ReportReason'>;

const ReportReasonModal = ({ route, navigation }: props) => {
  const { connectionId, successCallback, reporting } = route.params;
  const { t } = useTranslation();
  const api = useContext(NodeApiContext);
  const connection: Connection = useSelector((state: State) =>
    selectConnectionById(state, connectionId),
  );
  const dispatch = useDispatch();
  const [reason, setReason] = useState(!reporting ? 'Unreport' : '');

  // If connection just got reported it will not exist anymore. Just return null for this render cycle, as
  // navigation.goBack() is already dispatched
  if (!connection) {
    return null;
  }

  const confirmReport = () => {
    // inside report module
    if (reason && reporting) {
      console.log(
        `Reporting connection ${connection.name} with reason ${reason}`,
      );
      // close modal
      navigation.goBack();
      if (reporting) {
        dispatch(reportConnection({ id: connectionId, reason, api }));
      } else {
        // unreport connection
      }

      if (successCallback) {
        successCallback();
      }
      // inside undo report module
    } else {
      navigation.navigate('SetTrustlevel', {
        connectionId,
      });
      dispatch(
        setConnectionLevel({
          id: connection.id,
          level: connection_levels.SUSPICIOUS,
        }),
      );
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
        reducedTransparencyFallbackColor={BLACK}
      />
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {t(
              `connectionDetails.text.${
                reporting ? 'reportConnection' : 'unReportConnection'
              }`,
              {
                name: connection.name,
              },
            )}
          </Text>
        </View>
        <View style={styles.message}>
          <Material name="information" size={26} color={BLUE} />
          <Text style={styles.messageText}>
            {t(
              `connectionDetails.text.${
                reporting ? 'reportImpact' : 'unReportImpact'
              }`,
              {
                name: connection.name,
                reportReason: connection.reportReason,
              },
            )}
          </Text>
        </View>
        <View style={styles.divider} />
        {reporting && (
          <View style={styles.radioButtonsContainer}>
            {Object.keys(reasonStrings).map((reason) =>
              renderReasonButton(reason),
            )}
          </View>
        )}
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
              {reporting
                ? t('connectionDetails.button.reportSubmit')
                : t('connectionDetails.button.ok')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="CancelReportBtn"
            style={[styles.modalButton, styles.cancelButton]}
            onPress={cancelReport}
          >
            <Text style={styles.cancelButtonText}>
              {t('connectionDetails.button.reportCancel')}
            </Text>
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
    backgroundColor: WHITE,
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
    fontSize: fontSize[22],
    textAlign: 'center',
  },
  message: {
    flexDirection: 'row',
  },
  messageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[13],
    textAlign: 'left',
    marginLeft: 10,
    color: DARKER_GREY,
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
    fontSize: fontSize[15],
    color: BLACK,
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
    backgroundColor: WHITE,
    borderRadius: 50,
    borderColor: DARKER_GREY,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: DARKER_GREY,
  },
  submitButton: {
    backgroundColor: GREEN,
    borderRadius: 50,
    borderColor: GREEN,
    borderWidth: 1,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: BLACK,
  },
  submitButtonDisabledText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: DARKER_GREY,
  },
});

export default ReportReasonModal;
