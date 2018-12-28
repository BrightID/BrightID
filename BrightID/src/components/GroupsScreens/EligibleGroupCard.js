// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import GroupAvatar from './GroupAvatar';
import { uInt8ArrayToUrlSafeB64 } from '../../utils/encoding';
import { deleteNewGroup, joinGroup } from './actions';
import { groupName } from '../../utils/groups';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop score
 */

class EligibleGroupCard extends React.Component<Props> {
  renderApprovalButtons = () => (
    <View style={styles.approvalButtonContainer}>
      <TouchableOpacity
        style={styles.moreIcon}
        onPress={this.deleteThisGroup}
      >
        <AntDesign size={30} name="closecircleo" color="#000"/>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.moreIcon}
        onPress={this.joinThisGroup}
      >
        <AntDesign size={30} name="checkcircleo" color="#000"/>
      </TouchableOpacity>
    </View>
  );

  renderReviewButton = () => (
    <TouchableOpacity style={styles.reviewButton}>
      <Text style={styles.reviewButtonText}>Awaiting co-</Text>
      <Text style={styles.reviewButtonText}>founders</Text>
    </TouchableOpacity>
  );

  scoreColor = () => {
    const { group } = this.props;
    if (group.score >= 85) {
      return { color: '#139c60' };
    } else {
      return { color: '#e39f2f' };
    }
  };

  deleteThisGroup = () => {
    Alert.alert(
      'Delete Group',
      'Delete this group?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Sure',
          onPress: async () => {
            try {
              let result = await this.props.dispatch(
                deleteNewGroup(this.props.group.id),
              );
              alert(
                result.success
                  ? 'Group deleted successfully'
                  : JSON.stringify(result, null, 4),
              );
            } catch (err) {
              console.log(err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  joinThisGroup = async () => {
    try {
      let result = await this.props.dispatch(joinGroup(this.props.group.id));
      if (result.success) {
        GroupAvatar.updatePhoto();
      } else {
        Alert.alert('Failed to join the group', JSON.stringify(result, null, 4));
      }
    } catch (err) {
      console.log(err);
    }
  };

  alreadyIn() {
    const { group, publicKey } = this.props;
    return group.knownMembers.indexOf(uInt8ArrayToUrlSafeB64(publicKey)) >= 0;
  }

  render() {
    const { group } = this.props;
    console.log(group);
    return (
      <View style={styles.container}>
        <GroupAvatar group={group}/>
        <View style={styles.info}>
          <Text style={styles.names}>{groupName(group)}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLeft}>Score:</Text>
            <Text style={[styles.scoreRight, this.scoreColor()]}>
              {group.score}
            </Text>
          </View>
        </View>
        {!this.alreadyIn()
          ? this.renderApprovalButtons()
          : this.renderReviewButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  scoreRight: {
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

export default connect(({ main }) => main)(EligibleGroupCard);
