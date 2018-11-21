// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import GroupAvatar from './EligibleGroupAvatar';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop trustScore
 */

type Props = {
  names: Array<string>,
  trustScore: string,
};

class EligibleGroupCard extends React.Component<Props> {
  renderApprovalButtons = () => (
    <View style={styles.approvalButtonContainer}>
      <TouchableOpacity style={styles.moreIcon}>
        <AntDesign size={30} name="closecircleo" color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreIcon}>
        <AntDesign size={30} name="checkcircleo" color="#000" />
      </TouchableOpacity>
    </View>
  );

  renderReviewButton = () => (
    <TouchableOpacity style={styles.reviewButton}>
      <Text style={styles.reviewButtonText}>Awaiting co-</Text>
      <Text style={styles.reviewButtonText}>founders</Text>
    </TouchableOpacity>
  );

  trustScoreColor = () => {
    const { trustScore } = this.props;
    if (parseFloat(trustScore) >= 85) {
      return { color: '#139c60' };
    } else {
      return { color: '#e39f2f' };
    }
  };

  renderTrustScore = () => {
    const { trustScore } = this.props;
    if (trustScore) {
      return (
        <View style={styles.trustScoreContainer}>
          <Text style={styles.trustScoreLeft}>Score:</Text>
          <Text style={[styles.trustScoreRight, this.trustScoreColor()]}>
            {this.props.trustScore}
          </Text>
        </View>
      );
    }
  };

  render() {
    const { names, trustScore } = this.props;
    return (
      <View style={styles.container}>
        <GroupAvatar names={names} />
        <View style={styles.info}>
          <Text style={styles.names}>{names.join(', ')}</Text>
          {this.renderTrustScore()}
        </View>
        {trustScore ? this.renderApprovalButtons() : this.renderReviewButton()}
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
  info: {
    marginLeft: 25,
    flex: 1,
    height: 71,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  names: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  trustScoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  trustScoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
  },
  moreIcon: {
    marginRight: 8,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  reviewButton: {
    width: 89,
    height: 43,
    borderRadius: 3,
    backgroundColor: '#f8f8ba',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    // fontWeight: '500',
    color: '#b9b75c',
  },
});

export default connect(null)(EligibleGroupCard);
