import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { withTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  DARK_ORANGE,
  GREEN,
  DARKER_GREY,
  LIGHT_GREY,
  WHITE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { getGroupName } from '@/utils/groups';
import { acceptInvite, rejectInvite, joinGroup } from '@/actions';
import api from '@/api/brightId';
import GroupPhoto from '@/components/Groups/GroupPhoto';
import {
  backupUser,
  backupPhoto,
} from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import Check from '@/components/Icons/Check';
import xGrey from '@/static/x_grey.svg';

class InviteCard extends React.Component {
  rejectInvite = () => {
    const { invite, dispatch, t } = this.props;
    Alert.alert(
      t('notifications.alert.title.rejectGroupInvite'),
      t('notifications.alert.text.rejectGroupInvite'),
      [
        {
          text: t('common.alert.cancel'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: t('common.alert.sure'),
          onPress: async () => {
            try {
              await dispatch(rejectInvite(invite.inviteId));
              if (invite.isNew) {
                await api.deleteGroup(invite.id);
              }
            } catch (err) {
              Alert.alert(
                t('notifications.alert.title.failureRejectGroupInvite'),
                err.message,
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  acceptInvite = async () => {
    const { dispatch, invite, backupCompleted, id, navigation, t } = this.props;
    try {
      await api.joinGroup(invite.id);
      await dispatch(acceptInvite(invite.inviteId));
      invite.members.push(id);
      await dispatch(joinGroup(invite));
      Alert.alert(
        t('common.alert.success'),
        t('notifications.alert.text.successGroupInvite', {
          defaultValue: 'You joined {{groupName}}',
          groupName: getGroupName(invite),
        }),
      );
      if (backupCompleted) {
        await dispatch(backupUser());
        if (invite.photo && invite.photo.filename) {
          await dispatch(backupPhoto(invite.id, invite.photo.filename));
        }
      }
      navigation.navigate('Members', { group: invite });
    } catch (err) {
      Alert.alert(
        t('notifications.alert.text.failureAcceptGroupInvite'),
        err.message,
      );
    }
  };

  render() {
    const { invite, connections, t } = this.props;
    const inviter = connections.find((conn) => invite.inviter === conn.id);
    return (
      <View style={styles.container}>
        <View style={styles.photoContainer}>
          <GroupPhoto group={invite} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{getGroupName(invite)}</Text>
          <Text style={styles.invitationMsg}>
            {t('notifications.item.text.pendingGroupInvite', {
              name: inviter?.name,
            })}
          </Text>
        </View>
        <View style={styles.approvalButtonContainer}>
          <TouchableOpacity
            style={styles.greenCircle}
            onPress={this.acceptInvite}
          >
            <Check
              color={GREEN}
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
    backgroundColor: WHITE,
    borderBottomColor: LIGHT_GREY,
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[20],
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARK_ORANGE,
  },
  greenCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: GREEN,
  },
  greyCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: DARKER_GREY,
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
}))(withTranslation()(InviteCard));
