import * as React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store/hooks';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  DARK_ORANGE,
  DARKER_GREY,
  GREEN,
  LIGHT_GREY,
  WHITE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import {
  acceptInvite,
  addOperation,
  joinGroup,
  rejectInvite,
  selectConnectionById,
  selectGroupName,
} from '@/actions';
import { GroupPhoto } from '@/components/Groups/GroupPhoto';
import {
  backupPhoto,
  backupUser,
} from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import Check from '@/components/Icons/Check';
import xGrey from '@/static/x_grey.svg';
import BrightidError from '@/api/brightidError';
import { useNodeApiContext } from '@/context/NodeApiContext';

const InviteCard = (props) => {
  const { invite } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const inviter = useSelector((state) =>
    selectConnectionById(state, invite.inviter),
  );
  const navigation = useNavigation();
  const { backupCompleted } = useSelector((state) => state.user);
  const { api } = useNodeApiContext();
  const groupName = useSelector((state) =>
    selectGroupName(state, invite.groupObj),
  );

  const handleRejectInvite = () => {
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
              await dispatch(rejectInvite(invite.id));
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

  const handleAcceptInvite = async () => {
    try {
      const op = await api.joinGroup(invite.groupObj.id);
      dispatch(addOperation(op));
      dispatch(acceptInvite(invite.id));
      await dispatch(joinGroup(invite.groupObj));
      Alert.alert(
        t('common.alert.success'),
        t('notifications.alert.text.successGroupInvite', {
          defaultValue: 'You joined {{groupName}}',
          groupName,
        }),
      );
      if (backupCompleted) {
        await dispatch(backupUser());
        if (invite.groupObj.photo && invite.groupObj.photo.filename) {
          await dispatch(
            backupPhoto(invite.groupObj.id, invite.groupObj.photo.filename),
          );
        }
      }
      navigation.navigate('Members', { group: invite.groupObj });
    } catch (err) {
      if (err instanceof BrightidError) {
        // Something went wrong in the backend while applying operation
        Alert.alert(
          t('notifications.alert.text.failureAcceptGroupInvite'),
          `${err.errorNum} - ${err.message}`,
        );
      } else {
        Alert.alert('Error', err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        <GroupPhoto group={invite.groupObj} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{groupName}</Text>
        <Text style={styles.invitationMsg}>
          {t('notifications.item.text.pendingGroupInvite', {
            name: inviter?.name,
          })}
        </Text>
      </View>
      <View style={styles.approvalButtonContainer}>
        <TouchableOpacity
          style={styles.greenCircle}
          onPress={handleAcceptInvite}
        >
          <Check
            color={GREEN}
            width={DEVICE_LARGE ? 20 : 17}
            height={DEVICE_LARGE ? 20 : 17}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.greyCircle}
          onPress={handleRejectInvite}
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
};

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

export default InviteCard;
