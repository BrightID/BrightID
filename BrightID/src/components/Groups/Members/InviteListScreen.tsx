import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, Alert, StatusBar } from 'react-native';
import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from '@/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import fetchUserInfo from '@/actions/fetchUserInfo';
import api from '@/api/brightId';
import { encryptAesKey } from '@/utils/invites';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { connectionsSelector } from '@/utils/connectionsSelector';
import ConnectionCard from '../../Connections/ConnectionCard';

const ITEM_HEIGHT = DEVICE_LARGE ? 102 : 92;

const getItemLayout = (_data: any, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const eligibleSelector = createSelector(
  connectionsSelector,
  (_: State, group: Group) => group,
  (connections, group) => {
    return connections.filter(
      (conn) =>
        !group?.members?.includes(conn.id) &&
        (group?.type !== 'primary' || !conn.hasPrimaryGroup),
    );
  },
);

type InviteRoute = RouteProp<{ InviteList: { group: Group } }, 'InviteList'>;

const InviteListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute<InviteRoute>();

  const group = route.params?.group;
  const connections = useSelector((state) => eligibleSelector(state, group));

  const { t } = useTranslation();

  const inviteToGroup = async (connection) => {
    try {
      const data = await encryptAesKey(group?.aesKey, connection.signingKey);
      await api.invite(connection.id, group?.id, data);
      Alert.alert(
        t('groups.alert.title.inviteSuccess'),
        t('groups.alert.text.inviteSuccess', { name: connection.name }),
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.alert.error'), err.message);
    }
  };

  const renderItem = ({ item, index }) => (
    <ConnectionCard
      {...item}
      index={index}
      handlePress={() => inviteToGroup(item)}
    />
  );

  const EligibleInviteList = useMemo(() => {
    const onRefresh = async () => {
      try {
        await dispatch(fetchUserInfo());
      } catch (err) {
        console.log(err.message);
      }
    };
    console.log('Rendering Connections List');
    return (
      <FlatList
        style={styles.connectionsContainer}
        data={connections}
        keyExtractor={({ id }, index) => id + index}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={{
          paddingBottom: 70,
          paddingTop: 20,
          flexGrow: 1,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <EmptyList
            iconType="account-off-outline"
            title={t('groups.text.noEligibleConnection')}
          />
        }
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />

      <View style={styles.container} testID="connectionsScreen">
        <View style={styles.mainContainer}>{EligibleInviteList}</View>
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
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
  },
  connectionsContainer: {
    flex: 1,
    width: '100%',
  },
});

export default InviteListScreen;
