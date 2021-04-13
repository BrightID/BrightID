import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from '@/store';
import { useRoute, RouteProp } from '@react-navigation/native';
import { innerJoin } from 'ramda';
import { useTranslation } from 'react-i18next';
import api from '@/api/brightId';
import { dismissFromGroup, addAdmin, selectAllConnections } from '@/actions';
import EmptyList from '@/components/Helpers/EmptyList';
import MemberCard from './MemberCard';

type MembersRoute = RouteProp<{ Members: { group: Group } }, 'Members'>;

function MembersList() {
  const dispatch = useDispatch();
  const route = useRoute<MembersRoute>();

  const connections = useSelector(selectAllConnections);
  const user = useSelector((state) => state.user);

  const { group } = route.params;
  const { id: groupID, admins = [], members = [] } = group;

  const { t } = useTranslation();

  // Only include the group members that user knows (is connected with), and the user itself
  const groupMembers = useMemo(() => {
    const userobj: Connection = {
      id: user.id,
      name: user.name,
      photo: user.photo,
      score: user.score,
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
      // @ts-ignore
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
      // @ts-ignore
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
    <FlatList
      style={styles.membersContainer}
      data={groupMembers}
      keyExtractor={({ id }, index) => id + index}
      renderItem={renderMember}
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyList title={t('groups.text.noMembers')} />}
    />
  );
}

const styles = StyleSheet.create({
  membersContainer: {
    flex: 1,
  },
});

export default MembersList;
