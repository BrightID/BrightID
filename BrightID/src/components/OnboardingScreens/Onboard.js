// @flow

import * as React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { withTranslation } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLUE, LIGHT_BLACK } from '@/theme/colors';
import MaintainPrivacy from './onboardingCards/MaintainPrivacy';
import BrightIdOnboard from './onboardingCards/BrightIdOnboard';

/* Description */
/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 */

type State = {
  activeSlide: number,
  entries: number[],
};

/* Constants */
/* ======================================== */

const winWidth = Dimensions.get('window').width;
const statusBarHeight = getStatusBarHeight();

/* Onboarding Screen */
/* ======================================== */

export class Onboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeSlide: 0,
      entries: [...Array(2)],
    };
  }

  renderItem = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        return (
          <View key={index} style={styles.onboardingCards}>
            <BrightIdOnboard />
          </View>
        );
      case 1:
        return (
          <View key={index} style={styles.onboardingCards}>
            <MaintainPrivacy />
          </View>
        );
      default:
    }
  };
  // slide item

  render() {
    const { t } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={WHITE}
          animated={true}
        />

        <View style={styles.center}>
          <TouchableOpacity
            testID="getStartedBtn"
            onPress={() => this.props.navigation.navigate('SignUp')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {t('onboarding.button.getStarted')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  carousel: {
    flex: 3.5,
    marginTop: statusBarHeight,
  },
  onboardingCards: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  pagination: {},
  button: {
    width: 300,
    borderWidth: 1,
    borderColor: BLUE,
    paddingTop: 13,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontFamily: 'ApexNew-Medium',
    color: BLUE,
    fontSize: fontSize[18],
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  dotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    backgroundColor: LIGHT_BLACK,
  },
});

export default withTranslation()(Onboard);
