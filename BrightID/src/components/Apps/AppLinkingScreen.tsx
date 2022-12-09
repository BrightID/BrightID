import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { BLACK, DARKER_GREY, GREEN, ORANGE, RED, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from '@/store/hooks';
import { fontSize } from '@/theme/fonts';
import {
  resetLinkingAppState,
  selectAppInfoByAppId,
  selectLinkingAppError,
  selectLinkingAppInfo,
  selectApplinkingStep,
  selectApplinkingStepText,
  setAppLinkingStep,
} from '@/reducer/appsSlice';
import { app_linking_steps } from '@/utils/constants';
import { selectIsSponsored } from '@/reducer/userSlice';
import { startLinking } from '@/components/Apps/appThunks';

const ConfirmationView = ({ appName }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const confirmHandler = () => {
    console.log(`User confirmed linking.`);
    dispatch(setAppLinkingStep({ step: app_linking_steps.USER_CONFIRMED }));
    dispatch(startLinking());
  };

  const rejectHandler = () => {
    console.log(`User rejected linking!`);
    dispatch(resetLinkingAppState());
  };

  return (
    <View style={styles.stepContainer} testID="AppLinkingConfirmationView">
      <View style={styles.statusContainer}>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>
            {t('apps.alert.text.linkApp', {
              context: appName,
            })}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          testID="ConfirmLinking"
          style={[styles.modalButton, styles.submitButton]}
          onPress={confirmHandler}
        >
          <Text style={styles.submitButtonText}>{t('common.alert.yes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="RejectLinking"
          style={[styles.modalButton, styles.cancelButton]}
          onPress={rejectHandler}
        >
          <Text style={styles.cancelButtonText}>{t('common.alert.no')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AppLinkingView = ({ sponsoringStep, appName, text }) => {
  const isSponsored = useSelector(selectIsSponsored);
  const error = useSelector(selectLinkingAppError);

  let iconData: { color: string; name: string };
  let stateDescription: string;
  const stateDetails = text;
  switch (sponsoringStep) {
    case app_linking_steps.REFRESHING_APPS:
      stateDescription = `Verifying app details`;
      break;
    case app_linking_steps.SPONSOR_PRECHECK_APP:
      stateDescription = `Checking for prior sponsoring request`;
      break;
    case app_linking_steps.SPONSOR_WAITING_OP:
      stateDescription = `Requesting sponsorship from app`;
      break;
    case app_linking_steps.SPONSOR_WAITING_APP:
      stateDescription = `Waiting for ${appName} to sponsor you`;
      break;
    case app_linking_steps.LINK_WAITING_V5:
      stateDescription = `Waiting for link operation to confirm`;
      break;
    case app_linking_steps.LINK_WAITING_V6:
      stateDescription = `Waiting for link function to complete`;
      break;
    case app_linking_steps.LINK_SUCCESS:
      iconData = { color: GREEN, name: 'checkmark-circle-outline' };
      stateDescription = `Successfully linked!`;
      break;
    default:
      if (isSponsored) {
        iconData = { color: GREEN, name: 'checkmark-circle-outline' };
        stateDescription = `You are sponsored.`;
      } else {
        iconData = { color: RED, name: 'alert-circle-outline' };
        stateDescription = `You are not sponsored.`;
      }
  }

  if (error) {
    iconData = { color: RED, name: 'alert-circle-outline' };
  }

  return (
    <View
      style={styles.stepContainer}
      testID={`AppLinkingStep-${sponsoringStep}`}
    >
      <View style={styles.statusContainer}>
        <View>
          {iconData ? (
            <IonIcons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 64 : 44}
              name={iconData.name}
              color={iconData.color}
            />
          ) : (
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 64 : 44}
              type="Wave"
              color={ORANGE}
            />
          )}
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>{stateDescription}</Text>
          {stateDetails && (
            <Text style={styles.infoSubText}>{stateDetails}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const AppLinkingScreen = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const appLinkingStep = useSelector(selectApplinkingStep);
  const appLinkingStepText = useSelector(selectApplinkingStepText);
  const linkingAppInfo = useSelector(selectLinkingAppInfo);
  const error = useSelector(selectLinkingAppError);
  const appInfo = useSelector((state: RootState) =>
    linkingAppInfo
      ? selectAppInfoByAppId(state, linkingAppInfo.appId)
      : undefined,
  );

  const showConfirm =
    appLinkingStep === app_linking_steps.WAITING_USER_CONFIRMATION;
  const showProgress =
    appLinkingStep > app_linking_steps.IDLE &&
    appLinkingStep <= app_linking_steps.LINK_SUCCESS;
  const isSuccess = appLinkingStep === app_linking_steps.LINK_SUCCESS;
  const appName = appInfo?.name || linkingAppInfo?.appId || 'undefined';

  let resultContainer;
  if (error || isSuccess) {
    resultContainer = (
      <>
        <View style={styles.resultContainer}>
          <View style={styles.resultTextContainer}>
            {isSuccess && (
              <Text style={styles.resultContainerSuccessText}>
                {t('apps.alert.text.linkSuccess', {
                  context: appName,
                })}
              </Text>
            )}
            {error ? (
              <>
                <Text
                  style={styles.resultContainerErrorText}
                  testID={`AppLinkingError-${appLinkingStep}`}
                >
                  {t('apps.alert.title.linkingFailed')}
                </Text>
                <Text style={styles.infoSubText}>{error}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              testID="ResetAppLinkingState"
              style={styles.resetButton}
              onPress={() => {
                dispatch(resetLinkingAppState());
              }}
            >
              <Text style={styles.resetText}>{t('common.alert.dismiss')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  const goBack = () => {
    navigation.goBack();
  };

  let content;
  if (showConfirm) {
    content = (
      <>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>{t('apps.alert.title.linkApp')}</Text>
        </View>
        <ConfirmationView appName={appName} />
      </>
    );
  } else if (showProgress) {
    content = (
      <>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>
            Linking with <Text style={styles.headerTextAppname}>{appName}</Text>
          </Text>
        </View>
        <AppLinkingView
          sponsoringStep={appLinkingStep}
          text={appLinkingStepText}
          appName={appName}
        />
      </>
    );
  }

  return (
    <View style={[styles.container, { marginTop: -headerHeight }]}>
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
        {content}
        {resultContainer}
      </View>
    </View>
  );
};

export default AppLinkingScreen;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
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
    padding: DEVICE_LARGE ? 20 : 15,
  },
  divider: {
    width: DEVICE_LARGE ? 240 : 200,
    marginTop: 20,
    marginBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BLACK,
  },
  stepContainer: {
    width: '100%',
    marginTop: 0,
  },
  headerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[20],
    color: BLACK,
  },
  headerTextAppname: {
    fontFamily: 'Poppins-Bold',
  },
  stepHeaderTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepHeaderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[18],
    color: BLACK,
  },
  headerInfoText: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: DARKER_GREY,
    fontSize: fontSize[12],
    maxWidth: '90%',
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLACK,
  },
  infoSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[10],
    color: BLACK,
  },
  resultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  resultTextContainer: {
    padding: 2,
  },
  resultContainerSuccessText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: BLACK,
  },
  resultContainerErrorText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: RED,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: DEVICE_LARGE ? 240 : 200,
    marginBottom: 10,
  },
  resetText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
    marginLeft: 10,
  },
});
