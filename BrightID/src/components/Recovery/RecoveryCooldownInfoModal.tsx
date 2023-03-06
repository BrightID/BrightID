import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Trans, useTranslation } from 'react-i18next';
import moment from 'moment';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { WHITE, BLUE, BLACK, DARKER_GREY, GREEN } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import Info from '@/components/Icons/Info';
import { RECOVERY_COOLDOWN_DURATION } from '@/utils/constants';

type props = NativeStackScreenProps<
  ModalStackParamList,
  'RecoveryCooldownInfo'
>;

const RecoveryCooldownInfoModal = ({ route, navigation }: props) => {
  const { successCallback } = route.params || {};
  const { t } = useTranslation();

  const cooldownPeriodString = moment
    .duration(RECOVERY_COOLDOWN_DURATION)
    .humanize();

  const dismissModal = () => {
    // leave modal and execute callback function
    navigation.goBack();
    if (successCallback) {
      successCallback();
    }
  };

  const messageTextCooldown = (
    <Text style={styles.messageText}>
      <Trans
        i18nKey="recoveryCooldownModal.text.cooldownGeneric"
        defaults="Note that change of recovery connections takes effect after a cooldown period of up to <period>{{ cooldownPeriod }}</period> for security reasons."
        values={{
          cooldownPeriod: cooldownPeriodString,
        }}
        components={{
          period: <Text style={styles.period} />,
        }}
      />
    </Text>
  );
  return (
    <View style={styles.container} testID="RecoveryCooldownInfo">
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <View style={styles.modalContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerIcon}>
            <Info color={BLUE} width={60} height={60} />
          </View>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {t(
                'recoveryCooldownModal.title',
                'Cooldown period for recovery connections',
              )}
            </Text>
          </View>
        </View>
        <View style={styles.message}>{messageTextCooldown}</View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            testID="OkayBtn"
            style={styles.okayButton}
            onPress={dismissModal}
          >
            <Text style={styles.okayButtonText}>
              {t('recoveryCooldownModal.dismissButtonLabel', 'Got it')}
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
  headerContainer: {
    marginTop: 5,
    marginBottom: 25,
    paddingLeft: 30,
    flexDirection: 'row',
  },
  headerIcon: {
    justifyContent: 'center',
  },
  header: {},
  headerText: {
    paddingLeft: 15,
    paddingRight: 20,
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[18],
    textAlign: 'left',
    color: BLACK,
  },
  message: {
    marginLeft: 5,
  },
  messageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[13],
    textAlign: 'left',
    color: DARKER_GREY,
  },
  period: {
    fontFamily: 'Poppins-Bold',
    color: BLACK,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  okayButton: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 50,
    borderColor: GREEN,
    borderWidth: 1,
  },
  okayButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: BLACK,
  },
});

export default RecoveryCooldownInfoModal;
