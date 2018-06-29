// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import GroupAvatar from './EligibleGroupAvatar';

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
  names: Array<string>,
  trustScore: string,
};

class EligibleGroupCard extends React.Component<Props> {
  renderApprovalButtons = () => (
    <View style={styles.approvalButtonContainer}>
      <TouchableOpacity style={styles.moreIcon}>
        <Feather size={30} name="x-circle" color="#ccc" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreIcon}>
        <Feather size={30} name="check-circle" color="#ccc" />
      </TouchableOpacity>
    </View>
  );
  renderReviewButton = () => (
    <TouchableOpacity style={styles.reviewButton}>
      <Text style={styles.reviewButtonText}>New Group</Text>
      <Text style={styles.reviewButtonText}> Review</Text>
    </TouchableOpacity>
  );
  render() {
    const { names } = this.props;
    return (
      <View style={styles.container}>
        <GroupAvatar />
        <View style={styles.info}>
          <Text style={styles.names}>{this.props.names.join(', ')}</Text>
          <Text style={styles.trustScore}>
            {this.props.trustScore}% Trusted
          </Text>
        </View>
        {names.length > 2
          ? this.renderApprovalButtons()
          : this.renderReviewButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: 90,
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
  },
  avatar: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: 71,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    // width: "50%"
  },
  names: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  trustScore: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: 'green',
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

export default connect(null)(EligibleGroupCard);
