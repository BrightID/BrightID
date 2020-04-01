// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { DEVICE_TYPE } from '@/utils/constants';
import { getGroupName } from '@/utils/groups';
import { acceptInvite, rejectInvite, joinGroup } from '@/actions';
import api from '@/Api/BrightId';
import GroupPhoto from '@/components/GroupsScreens/GroupPhoto';
import { backupUser, backupPhoto } from '@/components/Recovery/helpers';

class InviteCard extends React.Component<Props> {
  rejectInvite = () => {
    const { invite, dispatch } = this.props;
    Alert.alert(
      'Reject',
      'Are you sure you want to reject joining this group?',
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
              await dispatch(rejectInvite(invite.inviteId));
              if (invite.isNew) {
                await api.deleteGroup(invite.id);
              }
            } catch (err) {
              Alert.alert('Failed to reject the invite', err.message);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  acceptInvite = async () => {
    const { dispatch, invite, backupCompleted } = this.props;
    try {
      await api.joinGroup(invite.id);
      await dispatch(acceptInvite(invite.inviteId));
      await dispatch(joinGroup(invite));

      if (backupCompleted) {
        await backupUser();
        if (invite.photo && invite.photo.filename) {
          await backupPhoto(invite.id, invite.photo.filename);
        }
      }
    } catch (err) {
      Alert.alert('Failed to join the group', err.message);
    }
  };

  render() {
    const { invite, connections } = this.props;
    const inviter = connections.find((conn) => invite.inviter === conn.id);
    return (
      <View style={styles.container}>
        <View style={styles.photoContainer}>
          <GroupPhoto group={invite} />
        </View>
        <View style={styles.info}>
          <Text style={styles.invitationMsg}>
            {inviter.name} invited you to join
          </Text>
          <Text style={styles.name}>{getGroupName(invite)}</Text>
        </View>
        <View style={styles.approvalButtonContainer}>
          <TouchableOpacity style={styles.moreIcon} onPress={this.acceptInvite}>
            <AntDesign size={30} name="checkcircle" color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreIcon} onPress={this.rejectInvite}>
            <AntDesign size={30} name="closecircle" color="#f7651c" />
          </TouchableOpacity>
        </View>
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
    borderBottomColor: '#e3e0e4',
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 10,
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
  },
  photoContainer: {
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginLeft: 25,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    height: DEVICE_TYPE === 'large' ? 71 : 65,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 14 : 12,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  moreIcon: {
    marginRight: 8,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

export default connect((state) => state)(withNavigation(InviteCard));
