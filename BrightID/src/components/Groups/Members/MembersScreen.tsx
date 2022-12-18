import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useContext,
} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  AlertButton,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { innerJoin } from 'ramda';
import { useTranslation } from 'react-i18next';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard';
import { useDispatch, useSelector } from '@/store/hooks';
import {
  leaveGroup,
  updateGroup,
  dismissFromGroup,
  addAdmin,
  selectAllConnections,
  userSelector,
  selectGroupName,
} from '@/actions';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE, WHITE, BLUE, DARK_GREY } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { groupByIdSelector } from '@/utils/groups';
import { addOperation } from '@/reducer/operationsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';
import { MemberCard } from '@/components/Groups/Members/MemberCard';

export const MembersScreen = () => {
  const navigation = useNavigation();
  const route: { params?: { group: Group } } = useRoute() as {
    params?: { group: Group };
  };
  const groupID = route.params.group.id;
  const dispatch = useDispatch();
  const api = useContext(NodeApiContext);
  const connections = useSelector(selectAllConnections);
  const user = useSelector(userSelector);
  const { group, admins, members } = useSelector((state) =>
    groupByIdSelector(state, groupID),
  );
  const [contextActions, setContextActions] = useState([]);
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const groupName = useSelector((state) => selectGroupName(state, group));

  const ACTION_INVITE = t('groups.groupActionSheet.inviteUser');
  const ACTION_LEAVE = t('groups.groupActionSheet.leaveGroup');
  // Not using 'common.actionSheet.cancel' because 'Cancel' instead of 'cancel' (making sure printed text doesn't change after i18n)
  const ACTION_CANCEL = t('groups.groupActionSheet.cancel');
  const ACTION_COPY_GROUPID = t(
    'groups.groupActionSheet.copyGroupId',
    'Copy group ID to clipboard',
  );

  useEffect(() => {
    navigation.setOptions({
      title: groupName,
    });
  }, [groupName, navigation]);

  useLayoutEffect(() => {
    if (contextActions.length > 0) {
      // action sheet actions
      const handleLeaveGroup = () => {
        const buttons: AlertButton[] = [
          {
            text: t('common.alert.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.alert.ok'),
            onPress: async () => {
              try {
                const op = await api.leaveGroup(groupID);
                dispatch(addOperation(op));
                await dispatch(leaveGroup(group));
                navigation.goBack();
              } catch (err) {
                Alert.alert(
                  t('groups.alert.title.errorLeaveGroup'),
                  err.message,
                );
              }
            },
          },
        ];
        Alert.alert(
          t('groups.alert.title.leaveGroup'),
          t('groups.alert.text.leaveGroup'),
          buttons,
          {
            cancelable: true,
          },
        );
      };

      const handleInvite = () => {
        navigation.navigate('InviteList', {
          group,
        });
      };

      const handleCopyGroupId = () => {
        Clipboard.setString(groupID);
        const msg = t(
          'groups.alert.text.groupIdCopied',
          'Group ID copied to clipboard',
        );
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG);
        } else {
          Alert.alert(msg);
        }
      };

      const performAction = (index) => {
        const action = contextActions[index];
        console.log(`Performing action ${action}`);
        switch (action) {
          case ACTION_INVITE:
            handleInvite();
            break;
          case ACTION_LEAVE:
            handleLeaveGroup();
            break;
          case ACTION_COPY_GROUPID:
            handleCopyGroupId();
            break;
          case ACTION_CANCEL:
          default:
          // do nothing
        }
      };

      // set up top right button in header
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            testID="groupOptionsBtn"
            style={{ marginRight: 11 }}
            onPress={() => {
              showActionSheetWithOptions(
                {
                  options: contextActions,
                  cancelButtonIndex: contextActions.indexOf(ACTION_CANCEL),
                  destructiveButtonIndex: contextActions.indexOf(ACTION_LEAVE),
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
            }}
          >
            <Material name="dots-horizontal" size={32} color={WHITE} />
          </TouchableOpacity>
        ),
      });
    }
  }, [
    navigation,
    contextActions,
    showActionSheetWithOptions,
    dispatch,
    group,
    groupID,
    t,
    ACTION_LEAVE,
    ACTION_CANCEL,
    ACTION_INVITE,
    api,
    ACTION_COPY_GROUPID,
  ]);

  // set available actions for group
  useEffect(() => {
    const actions = [];
    if (admins.includes(user.id)) {
      // admins can invite other members to group
      actions.push(ACTION_INVITE);
    }
    if (members.includes(user.id)) {
      // existing member can leave group
      actions.push(ACTION_LEAVE);
    }
    // copy groupId to clipboard
    actions.push(ACTION_COPY_GROUPID);
    actions.push(ACTION_CANCEL);
    setContextActions(actions);
  }, [
    user.id,
    admins,
    members,
    ACTION_INVITE,
    ACTION_LEAVE,
    ACTION_CANCEL,
    ACTION_COPY_GROUPID,
  ]);

  useEffect(() => {
    console.log(`updating group info ${groupID}`);
    api.getGroup(groupID).then((data) => {
      dispatch(updateGroup(data));
    });
  }, [api, dispatch, groupID]);

  // Only include the group members that user knows (is connected with), and the user itself
  const groupMembers: Array<GroupMember> = useMemo(() => {
    return ([user] as Array<GroupMember>).concat(
      innerJoin(
        (connection, member) => connection.id === member,
        connections,
        members,
      ),
    );
  }, [user, connections, members]);

  const handleDismiss = (user) => {
    const buttons: AlertButton[] = [
      {
        text: t('common.alert.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.alert.ok'),
        onPress: async () => {
          try {
            const op = await api.dismiss(user.id, groupID);
            dispatch(addOperation(op));
            dispatch(dismissFromGroup({ member: user.id, group }));
          } catch (err) {
            Alert.alert(
              t('groups.alert.title.errorDismissMember'),
              err.message,
            );
          }
        },
      },
    ];
    Alert.alert(
      t('groups.alert.title.dismissMember'),
      t('groups.alert.text.dismissMember', { name: user.name }),
      buttons,
      {
        cancelable: true,
      },
    );
  };

  const handleAddAdmin = (user) => {
    const buttons: AlertButton[] = [
      {
        text: t('common.alert.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.alert.ok'),
        onPress: async () => {
          try {
            const op = await api.addAdmin(user.id, groupID);
            dispatch(addOperation(op));
            dispatch(addAdmin({ member: user.id, group }));
          } catch (err) {
            Alert.alert(
              t('groups.alert.text.addAdmin', { name: user.name }),
              err.message,
            );
          }
        },
      },
    ];
    Alert.alert(
      t('groups.alert.title.addAdmin'),
      t('groups.alert.text.addAdmin', { name: user.name }),
      buttons,
      {
        cancelable: true,
      },
    );
  };

  const renderMember = ({
    item,
    index,
  }: {
    item: GroupMember;
    index: number;
  }) => {
    const memberIsAdmin = admins.includes(item.id);
    const userIsAdmin = admins.includes(user.id);
    return (
      <MemberCard
        testID={`memberItem-${index}`}
        connectionDate={(item as Connection).connectionDate || 0}
        memberId={item.id}
        name={item.name}
        photo={item.photo}
        memberIsAdmin={memberIsAdmin}
        userIsAdmin={userIsAdmin}
        userId={user.id}
        handleDismiss={handleDismiss}
        handleAddAdmin={handleAddAdmin}
      />
    );
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <View testID="membersView" style={styles.mainContainer}>
          <View>
            <FlatList
              style={styles.membersContainer}
              data={groupMembers}
              keyExtractor={({ id }, index) => id + index}
              renderItem={renderMember}
              contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyList title={t('groups.text.noMembers')} />
              }
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  membersContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
  },
  moreIcon: {
    marginRight: 16,
  },
  groupName: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[28],
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    textAlign: 'center',
  },
  optionsOverlay: {
    backgroundColor: DARK_GREY,
  },
  optionsContainer: {
    backgroundColor: WHITE,
    height: '12%',
    width: '105%',
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: WHITE,
    position: 'absolute',
    top: -18,
    right: 20,
  },
  optionsBox: {
    flexDirection: 'row',
    width: '90%',
    height: '70%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  leaveGroupText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[24],
    marginLeft: 30,
  },
  backButtonContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 10,
  },
  headerPhoto: {
    marginLeft: 11,
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  backStyle: {
    paddingTop: 8,
    paddingLeft: 11,
  },
});
