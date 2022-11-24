import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-spinkit';
import { BLACK, DARKER_GREY, GREEN, ORANGE, RED, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useDispatch, useSelector } from '@/store/hooks';
import { fontSize } from '@/theme/fonts';
import {
  resetLinkingAppState,
  selectLinkingAppInfo,
  selectSponsoringStep,
} from '@/reducer/appsSlice';
import { sponsoring_steps } from '@/utils/constants';
import { selectIsSponsored } from '@/reducer/userSlice';

const SponsoringView = ({ sponsoringStep, appName }) => {
  const isSponsored = useSelector(selectIsSponsored);

  let isError: boolean;
  let iconData: { color: string; name: string };
  let stateDescription: string;
  let stateDetails: string;
  switch (sponsoringStep) {
    case sponsoring_steps.PRECHECK_APP:
      stateDescription = `Checking for prior sponsoring request (${sponsoringStep})`;
      break;
    case sponsoring_steps.WAITING_OP:
      stateDescription = `Requesting sponsorship from app (${sponsoringStep})`;
      break;
    case sponsoring_steps.WAITING_APP:
      stateDescription = `Waiting for ${appName} to sponsor you (${sponsoringStep})`;
      break;
    case sponsoring_steps.ERROR_OP:
      isError = true;
      iconData = { color: RED, name: 'alert-circle-outline' };
      stateDescription = `Error submitting request sponsorship operation! (${sponsoringStep})`;
      break;
    case sponsoring_steps.ERROR_APP:
      isError = true;
      iconData = { color: RED, name: 'alert-circle-outline' };
      stateDescription = `Timeout waiting for ${appName} to sponsor you! (${sponsoringStep})`;
      break;
    case sponsoring_steps.SUCCESS:
      iconData = { color: GREEN, name: 'checkmark-circle-outline' };
      stateDescription = `Successfully sponsored! (${sponsoringStep})`;
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

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeaderTextContainer}>
        <Text style={styles.stepHeaderText}>Sponsoring phase</Text>
      </View>
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
          <Text style={styles.infoSubText}>{stateDetails}</Text>
        </View>
      </View>
    </View>
  );
};

const LinkingView = ({ sponsoringStep }) => {
  let isError: boolean;
  let iconData: { color: string; name: string };
  let stateDescription: string;
  let stateDetails: string;

  switch (sponsoringStep) {
    case sponsoring_steps.LINK_WAITING_V5:
      stateDescription = `Waiting for link operation to confirm (${sponsoringStep})`;
      break;
    case sponsoring_steps.LINK_WAITING_V6:
      stateDescription = `Waiting for link function to complete (${sponsoringStep})`;
      break;
    case sponsoring_steps.LINK_ERROR:
      isError = true;
      iconData = { color: RED, name: 'alert-circle-outline' };
      stateDescription = `Failed to link app! (${sponsoringStep})`;
      break;
    case sponsoring_steps.LINK_SUCCESS:
      iconData = { color: GREEN, name: 'checkmark-circle-outline' };
      stateDescription = `Successfully linked! (${sponsoringStep})`;
      break;
    default:
      iconData = { color: DARKER_GREY, name: 'information-circle-outline' };
      stateDescription = `Waiting for sponsoring before linking phase can start. (${sponsoringStep})`;
  }

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeaderTextContainer}>
        <Text style={styles.stepHeaderText}>Linking phase</Text>
      </View>
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
          <Text style={styles.infoSubText}>{stateDetails}</Text>
        </View>
      </View>
    </View>
  );
};

const AppLinkingScreen = () => {
  const dispatch = useDispatch();
  const sponsoringStep = useSelector(selectSponsoringStep);
  const linkingAppInfo = useSelector(selectLinkingAppInfo);

  const error_states = [
    sponsoring_steps.ERROR_OP,
    sponsoring_steps.ERROR_APP,
    sponsoring_steps.LINK_ERROR,
  ];
  const isError = error_states.includes(sponsoringStep);
  const isSuccess = sponsoringStep === sponsoring_steps.LINK_SUCCESS;

  let resultContainer;
  if (isError || isSuccess) {
    resultContainer = (
      <>
        <View style={styles.divider} />
        <View style={styles.resultContainer}>
          <View style={styles.resultTextContainer}>
            {isSuccess && (
              <Text style={styles.resultContainerSuccessText}>
                Successfully linked!
              </Text>
            )}
            {isError && (
              <Text style={styles.resultContainerErrorText}>
                Linking failed.
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              testID="ResetAppLinkingState"
              style={styles.resetButton}
              onPress={() => {
                dispatch(resetLinkingAppState());
              }}
            >
              <Text style={styles.resetText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>
            Linking with{' '}
            <Text style={styles.headerTextAppname}>
              {linkingAppInfo.appInfo.name}
            </Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <SponsoringView
          sponsoringStep={sponsoringStep}
          appName={linkingAppInfo.appInfo.name}
        />
        <View style={styles.divider} />
        <LinkingView sponsoringStep={sponsoringStep} />
        {resultContainer}
      </View>
    </>
  );
};

export default AppLinkingScreen;

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
    paddingTop: 25,
  },
  divider: {
    width: DEVICE_LARGE ? 240 : 200,
    marginTop: 15,
    marginBottom: 15,
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
    marginTop: 15,
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
