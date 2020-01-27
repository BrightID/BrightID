// @flow

import * as React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';

type Props = {};

export default class AddConnections extends React.Component<Props> {
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
            source={require('../../../static/icons8-anonymous-mask-96.png')}
            style={styles.guyFox}
          />
          <Text style={styles.mainText}>Join Groups</Text>
        </View>
        <View style={styles.top}>
          <Text style={styles.secondaryText}>Prove you're a unique person</Text>
          <Text style={styles.secondaryText}>
            while preserving your privacy.
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
  guyFox: {
    marginLeft: 'auto',
    marginRight: 'auto',
    // marginTop: 100,
    marginBottom: 41,
  },
  mainText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 24,
    fontWeight: '500',
    fontStyle: 'normal',
    color: '#222',
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.09)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
    marginBottom: 15,
  },
  secondaryText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    lineHeight: 22,
    color: '#222',
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
});
