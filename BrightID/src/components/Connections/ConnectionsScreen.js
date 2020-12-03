// @flow

import React, { useMemo } from 'react';
import { StyleSheet, View, StatusBar, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createSelector } from '@reduxjs/toolkit';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { useNavigation } from '@react-navigation/native';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE } from '@/utils/constants';
import { toSearchString } from '@/utils/strings';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { defaultSort } from '@/utils/sorting';
import ConnectionCard from './ConnectionCard';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

/** Helper Component */

const ITEM_HEIGHT = DEVICE_LARGE ? 102 : 92;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const renderItem = ({ item, index }) => {
  item.index = index;
  return <ConnectionCard {...item} />;
};

/** Selectors */
const searchParamSelector = (state) => state.connections.searchParam;
const connectionsSelector = (state) => state.connections.connections;
const filtersSelector = (state) => state.connections.filters;

const filterConnectionsSelector = createSelector(
  [connectionsSelector, searchParamSelector, filtersSelector],
  (connections, searchParam, filters) => {
    const searchString = toSearchString(searchParam);
    return connections.filter(
      (item) =>
        toSearchString(`${item.name}`).includes(searchString) &&
        filters.includes(item.level),
    );
  },
);

/** Main Component */

export const ConnectionsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const connections = useSelector((state) => filterConnectionsSelector(state));
  const { t } = useTranslation();

  const handleNewConnection = () => {
    navigation.navigate('MyCode');
  };

  const ConnectionList = useMemo(() => {
    const onRefresh = async () => {
      try {
        await dispatch(fetchUserInfo());
        dispatch(defaultSort());
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
                title={t('connections.text.noConnections')}
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
        <View style={styles.mainContainer}>{ConnectionList}</View>
        <FloatingActionButton onPress={handleNewConnection} />
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  connectionsContainer: {
    flex: 1,
    width: '100%',
  },
  actionCard: {
    height: DEVICE_LARGE ? 76 : 71,
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 60 : 55,
  },
  actionText: {
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    fontSize: 11,
  },
});

export default ConnectionsScreen;
