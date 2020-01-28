// @flow

import * as React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';

type Props = {};

export default class BrightIdOnboard extends React.Component<Props> {
  render() {
    return (
      <View
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
          <Text style={styles.secondaryText}>
            BrightID uses the people you know{' '}
          </Text>
          <Text style={styles.secondaryText}>
            to enforce one-account-per-person
          </Text>
          <Text style={styles.secondaryText}>
            for important applications like
          </Text>
          <Text style={styles.secondaryText}>
            voting and universal basic income.
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 18,
    fontWeight: '500',
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 15,
  },
  secondaryText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
});
