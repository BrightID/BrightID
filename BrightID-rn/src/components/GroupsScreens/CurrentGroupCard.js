// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import CurrentGroupAvatar from './CurrentGroupAvatar';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop trustScore
 * @prop connectionTime
 * @prop avatar
 */

type Props = {
  name: string,
  trustScore: string,
  left: boolean,
};

type State = {
  height: number,
};

class CurrentGroupCard extends React.Component<Props, State> {
  state = {
    width: 0,
  };

  render() {
    return (
      <View style={styles.container}>
        <CurrentGroupAvatar />
        <Text style={styles.name}>{this.props.name}</Text>
        <Text style={styles.trustScore}>{this.props.trustScore}% Trusted</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 182,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    // minHeight: 182,
    borderColor: '#e3e0e4',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 7.3,
  },
  trustScore: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: 'green',
    marginTop: 7.3,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
  },
  moreIcon: {
    marginRight: 8,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  reviewButton: {
    width: 78,
    height: 47,
    borderRadius: 3,
    borderColor: '#4990e2',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#4990e2',
  },
});

export default connect(null)(CurrentGroupCard);
