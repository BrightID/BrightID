// @flow

import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { innerJoin } from 'ramda';
import { useTranslation } from 'react-i18next';
import api from '@/api/brightId';
import { leaveGroup, dismissFromGroup } from '@/actions';
import EmptyList from '@/components/Helpers/EmptyList';
import { addAdmin } from '@/actions/groups';
import { ORANGE } from '@/utils/constants';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import MemberCard from './MemberCard';

const ACTION_INVITE = 'Invite user';
const ACTION_LEAVE = 'Leave group';
const ACTION_CANCEL = 'Cancel';

type MembersScreenProps = {
  navigation: any,
  route: any,
};

function MembersScreen(props: MembersScreenProps) {
  const { navigation, route } = props;
  const groupID = route.params.group.id;
  const dispatch = useDispatch();
  const connections = useSelector(
    (state: State) => state.connections.connections,
  );
  const user = useSelector((state: State) => state.user);
  const { group, admins, members } = useSelector((state: State) => {
    const group = state.groups.groups.find((entry) => entry.id === groupID);
    return {
      group,
      admins: group ? group.admins : [],
      members: group ? group.members : [],
    };
  });

  const [contextActions, setContextActions] = useState<Array<string>>([]);
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();

  // set up top right button in header
  useLayoutEffect(() => {
    if (contextActions.length > 0) {
      // action sheet actions
      const handleLeaveGroup = () => {
        const buttons = [
          {
            text: t('common.alert.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.alert.ok'),
            onPress: async () => {
              try {
                await api.leaveGroup(groupID);
                await dispatch(leaveGroup(group));
                navigation.goBack();
              } catch (err) {
                Alert.alert(t('groups.alert.title.errorLeaveGroup'), err.message);
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

      const performAction = (index: number) => {
        const action = contextActions[index];
        console.log(`Performing action ${action}`);
        switch (action) {
          case ACTION_INVITE:
            handleInvite();
            break;
          case ACTION_LEAVE:
            handleLeaveGroup();
            break;
          case ACTION_CANCEL:
          default:
          // do nothing
        }
      };

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
                    color: '#2185D0',
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
            <Material name="dots-horizontal" size={32} color="#fff" />
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
  ]);

  // set available actions for group
  useEffect(() => {
    const actions: Array<string> = [];
    if (admins.includes(user.id)) {
      // admins can invite other members to group
      actions.push(ACTION_INVITE);
    }
    if (members.includes(user.id)) {
      // existing member can leave group
      actions.push(ACTION_LEAVE);
    }
    if (actions.length > 0) {
      actions.push(ACTION_CANCEL);
    }
    setContextActions(actions);
  }, [user.id, admins, members]);

  // Only include the group members that user knows (is connected with), and the user itself
  const groupMembers: Array<connection> = useMemo(() => {
    // TODO: userObj is ugly and just here to satisfy flow typecheck for 'connection' type.
    //    Define a dedicated type for group member to use here or somehow merge user and connection types.
    const userobj = {
      id: user.id,
      name: user.name,
      photo: user.photo,
      score: user.score,
      aesKey: '',
      connectionDate: 0,
      status: '',
      signingKey: '',
      createdAt: 0,
      hasPrimaryGroup: false,
    };
    return [userobj].concat(
      innerJoin(
        (connection, member) => connection.id === member,
        connections,
        members,
      ),
    );
  }, [user, connections, members]);

  const handleDismiss = (user) => {
    const buttons = [
      {
        text: t('common.alert.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.alert.ok'),
        onPress: async () => {
          try {
            await api.dismiss(user.id, groupID);
            await dispatch(dismissFromGroup(user.id, group));
          } catch (err) {
            Alert.alert(
              t('groups.alert.title.errorDismissMember'), 
              err.message
            );
          }
        },
      },
    ];
    Alert.alert(
      t('groups.alert.title.dismissMember'),
      t('groups.alert.text.dismissMember', {name: user.name}),
      buttons,
      {
        cancelable: true,
      },
    );
  };

  const handleAddAdmin = (user) => {
    const buttons = [
      {
        text: t('common.alert.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.alert.ok'),
        onPress: async () => {
          try {
            await api.addAdmin(user.id, groupID);
            await dispatch(addAdmin(user.id, group));
          } catch (err) {
            Alert.alert(
              t('groups.alert.text.addAdmin', {name: user.name}),
              err.message,
            );
          }
        },
      },
    ];
    Alert.alert(
      t('groups.alert.title.addAdmin'),
      t('groups.alert.text.addAdmin', {name: user.name}),
      buttons,
      {
        cancelable: true,
      },
    );
  };

  const renderMember = ({ item, index }) => {
    const memberIsAdmin = admins.includes(item.id);
    const userIsAdmin = admins.includes(user.id);
    return (
      <MemberCard
        testID={`memberItem-${index}`}
        connectionDate={item.connectionDate}
        flaggers={item.flaggers}
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
}

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
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd',
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
    fontSize: 28,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    textAlign: 'center',
  },
  optionsOverlay: {
    backgroundColor: 'rgba(62,34,24,0.4)',
  },
  optionsContainer: {
    backgroundColor: '#fdfdfd',
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
    borderBottomColor: '#fdfdfd',
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
    fontSize: 24,
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

export default MembersScreen;
