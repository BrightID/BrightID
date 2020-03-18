// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import GroupPhoto from '../GroupsScreens/GroupPhoto';
import { getGroupName } from '@/utils/groups';
import { acceptInvite, rejectInvite, joinGroup } from '@/actions';
import api from '@/Api/BrightId';
import { backupUser, backupPhoto } from '../Recovery/helpers';

class InviteCard extends React.Component<Props> {

  reject= () => {
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
              await dispatch(rejectInvite(invite));
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

  accept = async () => {
    const { dispatch, navigation, invite, backupCompleted } = this.props;
    try {
      await dispatch(acceptInvite(invite));
      await dispatch(joinGroup(invite));
      navigation.navigate('Groups');
      if (backupCompleted) {
        await backupUser();
        if (invite.photo && invite.photo.filename) {
          await backupPhoto(invite.id, invite.photo.filename);
        }
      }
      await api.joinGroup(invite.id);
    } catch (err) {
      Alert.alert('Failed to join the group', err.message);
    }
  };

  render() {
    const { invite, navigation, connections } = this.props;
    const inviter = connections.find(conn => invite.inviter === conn.id);
    return (
      <View style={styles.container}>
        <GroupPhoto group={invite} />
        <View style={styles.info}>
          <Text style={styles.invitationMsg}>{inviter.name} invited you to join</Text>
          <Text style={styles.name}>{getGroupName(invite)}</Text>
        </View>
        <View style={styles.approvalButtonContainer}>
          <TouchableOpacity
            style={styles.moreIcon}
            onPress={this.reject}
          >
            <AntDesign size={30} name="closecircleo" color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreIcon}
            onPress={this.accept}
          >
            <AntDesign size={30} name="checkcircleo" color="#000" />
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
  },
  info: {
    marginLeft: 25,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
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
