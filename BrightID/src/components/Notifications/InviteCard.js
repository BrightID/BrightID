// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { DEVICE_LARGE } from '@/utils/constants';
import { getGroupName } from '@/utils/groups';
import { acceptInvite, rejectInvite, joinGroup } from '@/actions';
import api from '@/api/node';
import GroupPhoto from '@/components/GroupsScreens/GroupPhoto';
import { backupUser, backupPhoto } from '@/components/Recovery/helpers';
import checkGreen from '@/static/check_green.svg';
import xGrey from '@/static/x_grey.svg';

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
    const { dispatch, invite, backupCompleted, id } = this.props;
    try {
      await api.joinGroup(invite.id);
      await dispatch(acceptInvite(invite.inviteId));
      invite.members.push(id);
      await dispatch(joinGroup(invite));
      Alert.alert('Success', `You joined ${getGroupName(invite)}`);
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
          <Text style={styles.name}>{getGroupName(invite)}</Text>
          <Text style={styles.invitationMsg}>
            {inviter?.name} invited you to join
          </Text>
        </View>
        <View style={styles.approvalButtonContainer}>
          <TouchableOpacity
            style={styles.greenCircle}
            onPress={this.acceptInvite}
          >
            <SvgXml
              xml={checkGreen}
              width={DEVICE_LARGE ? 20 : 17}
              height={DEVICE_LARGE ? 20 : 17}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.greyCircle}
            onPress={this.rejectInvite}
          >
            <SvgXml
              xml={xGrey}
              width={DEVICE_LARGE ? 15 : 12}
              height={DEVICE_LARGE ? 15 : 12}
            />
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
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
  },
  photoContainer: {
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginLeft: DEVICE_LARGE ? 15 : 12,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 71 : 65,
  },
  name: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 11,
    color: '#B64B32',
  },
  greenCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#5DEC9A',
  },
  greyCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#707070',
    marginLeft: 7,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    minWidth: 100,
  },
});

export default connect(({ connections }) => ({
  ...connections,
}))(InviteCard);
