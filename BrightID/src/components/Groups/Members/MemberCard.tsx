import * as React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { photoDirectory } from '@/utils/filesystem';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { WHITE, BLUE, GREY, RED, LIGHT_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

const ICON_SIZE = DEVICE_LARGE ? 36 : 32;
const ACTION_ADD_ADMIN = i18next.t('groups.memberActionSheet.addAdmin');
const ACTION_DISMISS = i18next.t('groups.memberActionSheet.dismissMember');
// Not using 'common.actionSheet.cancel' because 'Cancel' instead of 'cancel' (making sure printed text doesn't change after i18n)
const ACTION_CANCEL = i18next.t('groups.memberActionSheet.cancel');

export type GroupMember = {
  memberId: string;
  userId: string;
  photo: Photo;
  name: string;
  connectionDate: number;
};

type MemberCardProps = GroupMember & {
  handleDismiss: (...args: Array<any>) => any;
  handleAddAdmin: (...args: Array<any>) => any;
  userIsAdmin: boolean;
  memberIsAdmin: boolean;
  // flaggers: any; TODO replace with reporters from v6 api
  testID: string;
};

export const MemberCard = ({
  memberId,
  userId,
  photo,
  name,
  connectionDate,
  handleDismiss,
  handleAddAdmin,
  userIsAdmin,
  memberIsAdmin,
  testID,
}: MemberCardProps) => {
  const navigation = useNavigation();
  const [contextActions, setContextActions] = useState<Array<string>>([]);
  const [flagged, setFlagged] = useState<boolean | number>(false);
  const [imgErr, setImgErr] = useState(false);
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();

  // set possible actions depending on user and member admin status
  useEffect(() => {
    const actions: Array<string> = [];
    if (userIsAdmin) {
      if (!memberIsAdmin) {
        // member can be promoted to admin
        actions.push(ACTION_ADD_ADMIN);
      }
      if (userId !== memberId) {
        // member can be dismissed from group
        actions.push(ACTION_DISMISS);
      }
    }
    if (actions.length > 0) {
      actions.push(ACTION_CANCEL);
    }
    setContextActions(actions);
  }, [userIsAdmin, memberIsAdmin, userId, memberId]);

  // show reported status of member?
  // TODO replace with reporters from v6 api
  /*  useEffect(() => {
    if (!userIsAdmin) {
      // only admins can see reported state
      setFlagged(false);
    } else {
      setFlagged(flaggers && Object.keys(flaggers).length);
    }
  }, [flaggers, userIsAdmin]);
   */

  const performAction = (index: number) => {
    if (contextActions.length === 0) return;

    const action = contextActions[index];
    console.log(`Performing action ${action}`);
    switch (action) {
      case ACTION_DISMISS:
        handleDismiss({ id: memberId, name });
        break;
      case ACTION_ADD_ADMIN:
        handleAddAdmin({ id: memberId, name });
        break;
      case ACTION_CANCEL:
      default:
      // do nothing
    }
  };

  const handleActionSheet = () => {
    if (contextActions.length === 0) return;

    showActionSheetWithOptions(
      {
        options: contextActions,
        cancelButtonIndex: contextActions.indexOf(ACTION_CANCEL),
        destructiveButtonIndex: contextActions.indexOf(ACTION_DISMISS),
        title: t('common.actionSheet.title'),
        showSeparators: true,
        textStyle: {
          color: BLUE,
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          textAlign: 'center',
          width: '100%',
        },
      },
      performAction,
    );
  };

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo.filename}`,
        }
      : require('@/static/default_profile.jpg');

  const memberTestID = memberIsAdmin ? 'admin' : 'regular';
  return (
    <View testID={memberTestID}>
      <View style={styles.container} testID={testID}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FullScreenPhoto', { photo });
          }}
        >
          <Image
            source={imageSource}
            style={styles.photo}
            onError={() => {
              console.log('settingImgErr');
              setImgErr(true);
            }}
            accessibilityLabel="profile picture"
          />
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.statusContainer}>
            {flagged ? (
              <Text style={styles.flagged}>{t('common.tag.reported')}</Text>
            ) : null}
          </View>
          {connectionDate > 0 && (
            <Text style={styles.connectedText}>
              {t('common.tag.connectionDate', {
                date: moment(connectionDate).fromNow(),
              })}
            </Text>
          )}
        </View>
        {contextActions.length > 0 && (
          <TouchableOpacity
            testID="memberContextBtn"
            style={styles.moreIcon}
            onPress={handleActionSheet}
          >
            <MaterialDesignIcons
              name="dots-vertical"
              size={ICON_SIZE}
              color={LIGHT_GREY}
            />
          </TouchableOpacity>
        )}
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
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  photo: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: DEVICE_LARGE ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[20],
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  flagged: {
    fontFamily: 'ApexNew-Medium',
    fontSize: fontSize[14],
    color: RED,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[12],
    color: GREY,
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});
