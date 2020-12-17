// @flow

import * as React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { Trans } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK } from '@/theme/colors';

type Props = {};

export default class BrightIdOnboard extends React.Component<Props> {
  render() {
    return (
      <View
        testID="brightIdOnboard"
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <View style={styles.top}>
          <Image
            source={require('../../../static/brightidonboard.png')}
            style={styles.logo}
          />
        </View>
        <View style={styles.top}>
          <Trans
            i18nKey="onboarding.text.intro"
            components={{ text: <Text style={styles.secondaryText} /> }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  top: {},
  bottom: {},
  logo: {
    marginLeft: 'auto',
    marginRight: 'auto',
    // marginTop: 100,
    marginBottom: 41,
  },
  mainText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[18],
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 15,
  },
  secondaryText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[18],
    lineHeight: 22,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: BLACK,
  },
});
