// @flow

import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import ActionSheet from 'react-native-actionsheet';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import EmptyList from '@/components/Helpers/EmptyList';
import { deleteConnection } from '@/actions';
import { ORANGE, DEVICE_LARGE } from '@/utils/constants';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useActionSheet } from '@expo/react-native-action-sheet';
import ConnectionCard from './ConnectionCard';
import { defaultSort } from './models/sortingUtility';
import {
  handleFlagging,
  flagAndDeleteConnection,
} from './models/flagConnection';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

/** Helper Component */

const ICON_SIZE = 26;

const ActionComponent = ({ id, name, secretKey, status }) => {
  const dispatch = useDispatch();
  const { showActionSheetWithOptions } = useActionSheet();
  let flaggingOptions = [
    'Flag as Duplicate',
    'Flag as Fake',
    'Flag as Deceased',
    'Join All Groups',
    'cancel',
  ];
  // comment out for test release
  if (!__DEV__) {
    // remove 'Join All Groups'
    flaggingOptions.splice(3, 1);
  }

  let removeOptions = ['Remove', 'cancel'];

  return (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: '#F28C33' }]}
        disabled={status === 'initiated'}
        onPress={() => {
          showActionSheetWithOptions(
            {
              options: flaggingOptions,
              cancelButtonIndex: flaggingOptions.length - 1,
              title: 'What do you want to do?',
            },
            handleFlagging({ id, name, dispatch, secretKey }),
          );
        }}
      >
        <Material size={ICON_SIZE} name="flag" color="#fff" />
        <Text style={styles.actionText}>Flag</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: '#ED4634' }]}
        onPress={() => {
          showActionSheetWithOptions(
            {
              options: removeOptions,
              cancelButtonIndex: removeOptions.length - 1,
              destructiveButtonIndex: 0,
              title: `Are you sure you want to remove ${name}?`,
              message: `This will not effect you're connection with ${name} on the BrightID social graph. If you have reason to believe that ${name} is fake or a duplicate, please flag them instead.`,
            },
            (index) => {
              if (index === 0) dispatch(deleteConnection(id));
            },
          );
        }}
      >
        <Material size={ICON_SIZE} name="delete-forever" color="#fff" />
        <Text style={styles.actionText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

/** Selectors */

const searchParamSelector = (state) => state.connections.searchParam;
const connectionsSelector = (state) => state.connections.connections;

const filterConnectionsSelector = createSelector(
  connectionsSelector,
  searchParamSelector,
  (connections, searchParam) => {
    const searchString = searchParam.toLowerCase().replace(/\s/g, '');
    return connections.filter((item) =>
      `${item.name}`.toLowerCase().replace(/\s/g, '').includes(searchString),
    );
  },
);

/** Main Component */

export const ConnectionsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const connections = useSelector(filterConnectionsSelector);

  useFocusEffect(
    useCallback(() => {
      dispatch(defaultSort());
      dispatch(fetchUserInfo());
    }, [dispatch]),
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchUserInfo());
      setRefreshing(false);
    } catch (err) {
      console.log(err.message);
      setRefreshing(false);
    }
  };

  const handleNewConnection = () => {
    navigation.navigate('MyCode');
  };

  const handleRemoveConnection = (connection) => {
    // if (connection.status === 'verified') {
    //   console.log(
    //     `Cant remove verified connection ${connection.id} (${connection.name}).`,
    //   );
    //   return;
    // }

    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          console.log(
            `Removing connection ${connection.id} (${connection.name})`,
          );
          dispatch(deleteConnection(connection.id));
        },
      },
    ];
    Alert.alert(
      `Remove connection`,
      `Are you sure you want to remove connection with ${connection.name}? You can reconnect anytime.`,
      buttons,
      {
        cancelable: true,
      },
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />

      <View style={styles.container} testID="connectionsScreen">
        <View style={styles.mainContainer}>
          <SwipeListView
            style={styles.connectionsContainer}
            data={connections}
            keyExtractor={({ id }, index) => id + index}
            renderItem={({ item }) => {
              return <ConnectionCard {...item} />;
            }}
            renderHiddenItem={({ item }, rowMap) => (
              <ActionComponent {...item} />
            )}
            leftOpenValue={0}
            rightOpenValue={DEVICE_LARGE ? -120 : -110}
            swipeToOpenPercent={22}
            contentContainerStyle={{
              paddingBottom: 70,
              paddingTop: 20,
              flexGrow: 1,
            }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <EmptyList
                iconType="account-off-outline"
                title="No connections"
              />
            }
          />
        </View>

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
  moreIcon: {
    marginRight: 16,
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    height: DEVICE_LARGE ? 102 : 92,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  actionCard: {
    height: DEVICE_LARGE ? 76 : 71,
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 60 : 55,
  },
  actionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#fff',
    fontSize: 11,
  },
});

export default ConnectionsScreen;
