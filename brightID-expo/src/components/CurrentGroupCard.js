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
      <View
        style={{
          width: this.state.width === 0 ? '100%' : this.state.width,
          height: this.state.width > 185 ? this.state.width : 185,
          minHeight: 185,
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderColor: '#e3e0e4',
          borderTopWidth: 1,
          borderLeftWidth: this.props.left ? 1 : 0,
          borderRightWidth: 1,
          borderBottomWidth: 1,
        }}
        onLayout={(event) => {
          // first we set the width at 100%
          // then we calculate 50% manually
          let { width } = event.nativeEvent.layout;
          width = width / 2;

          if (this.state.width === 0) {
            this.setState({ width });
          }
        }}
      >
        <CurrentGroupAvatar />
        <Text style={styles.name}>{this.props.name}</Text>
        <Text style={styles.trustScore}>{this.props.trustScore}% Trusted</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '50%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
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
