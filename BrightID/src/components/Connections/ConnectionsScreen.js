// @flow

import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import EmptyList from '@/components/Helpers/EmptyList';
import { deleteConnection } from '@/actions';
import { ORANGE, DEVICE_LARGE, LIGHTBLUE } from '@/utils/constants';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import ConnectionCard from './ConnectionCard';
import { defaultSort } from './models/sortingUtility';
import { handleFlagging } from './models/flagConnection';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

/** Helper Component */

const ICON_SIZE = 26;

const ActionComponent = ({ id, name, secretKey, status }) => {
  const dispatch = useDispatch();
  const { showActionSheetWithOptions } = useActionSheet();
  const disabled = status === 'initiated';
  const isStale = status === 'stale';

  let flaggingOptions = [
    'Flag as Duplicate',
    'Flag as Fake',
    'Flag as Deceased',
    'Join All Groups',
    'Connect to other fake connections',
    'cancel',
  ];
  // comment out for test release
  if (!__DEV__) {
    // remove debug functionality
    flaggingOptions.splice(3, 2);
  }

  const FlagButton = () => (
    <TouchableOpacity
      testID="flagBtn"
      style={[styles.actionCard, { backgroundColor: '#F28C33' }]}
      disabled={disabled}
      onPress={() => {
        showActionSheetWithOptions(
          {
            options: flaggingOptions,
            cancelButtonIndex: flaggingOptions.length - 1,
            title: 'What do you want to do?',
            message: `Flagging ${name} will negatively effect their BrightID score, and this flag might be shown to other users.`,
            showSeparators: true,
            textStyle: {
              color: '#2185D0',
              textAlign: 'center',
              width: '100%',
            },
            titleTextStyle: {
              fontSize: DEVICE_LARGE ? 20 : 17,
            },
            messageTextStyle: {
              fontSize: DEVICE_LARGE ? 15 : 12,
            },
          },
          handleFlagging({ id, name, dispatch, secretKey }),
        );
      }}
    >
      <Material size={ICON_SIZE} name="flag" color="#fff" />
      <Text style={styles.actionText}>Flag</Text>
    </TouchableOpacity>
  );

  const unflagOptions = ['cancel'];

  const UnFlagButton = () => (
    <TouchableOpacity
      testID="unFlagBtn"
      style={[styles.actionCard, { backgroundColor: '#aaa' }]}
      disabled={disabled}
      onPress={() => {
        showActionSheetWithOptions(
          {
            options: unflagOptions,
            cancelButtonIndex: unflagOptions.length - 1,
            title: 'Try Again Later!',
            message: 'This feature is not ready yet.',
          },
          () => {},
        );
      }}
    >
      <Material size={ICON_SIZE} name="flag-remove" color="#fff" />
      <Text style={styles.actionText}>Unflag</Text>
    </TouchableOpacity>
  );

  const removeOptions = ['Remove', 'cancel'];

  const RemoveButton = () => (
    <TouchableOpacity
      testID="removeBtn"
      style={[styles.actionCard, { backgroundColor: '#FF0000' }]}
      disabled={disabled}
      onPress={() => {
        showActionSheetWithOptions(
          {
            options: removeOptions,
            cancelButtonIndex: removeOptions.length - 1,
            destructiveButtonIndex: 0,
            title: `Remove connection`,
            message: `Are you sure you want to remove connection with ${name}? You can reconnect anytime.`,
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
  );

  // let hideOptions = ['Hide', 'cancel'];

  // const HideButton = () => (
  //   <TouchableOpacity
  //     style={[styles.actionCard, { backgroundColor: '#a5a5a5' }]}
  //     disabled={disabled}
  //     onPress={() => {
  //       showActionSheetWithOptions(
  //         {
  //           options: hideOptions,
  //           cancelButtonIndex: hideOptions.length - 1,
  //           destructiveButtonIndex: 0,
  //           title: `Are you sure you want to hide ${name}?`,
  //           message: `This will not effect you're connection with ${name} on the BrightID social graph.`,
  //         },
  //         (index) => {
  //           if (index === 0) dispatch(hideConnection(id));
  //         },
  //       );
  //     }}
  //   >
  //     <Material size={ICON_SIZE} name="eye-off" color="#fff" />
  //     <Text style={styles.actionText}>Hide</Text>
  //   </TouchableOpacity>
  // );

  // let unHideOptions = ['UnHide', 'cancel'];

  // const UnHideButton = () => (
  //   <TouchableOpacity
  //     style={[styles.actionCard, { backgroundColor: '#a5a5a5' }]}
  //     disabled={disabled}
  //     onPress={() => {
  //       showActionSheetWithOptions(
  //         {
  //           options: unHideOptions,
  //           cancelButtonIndex: unHideOptions.length - 1,
  //           // destructiveButtonIndex: 0,
  //           title: `Are you sure you want to unhide ${name}?`,
  //           message: `This will not effect you're connection with ${name} on the BrightID social graph.`,
  //         },
  //         (index) => {
  //           if (index === 0) dispatch(showConnection(id));
  //         },
  //       );
  //     }}
  //   >
  //     <Material size={ICON_SIZE} name="eye" color="#fff" />
  //     <Text style={styles.actionText}>Show</Text>
  //   </TouchableOpacity>
  // );

  return (
    <View style={styles.actionContainer}>
      {isStale ? <RemoveButton /> : <FlagButton />}
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
  const connections = useSelector((state) => filterConnectionsSelector(state));

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
      dispatch(defaultSort());
      setRefreshing(false);
    } catch (err) {
      console.log(err.message);
      setRefreshing(false);
    }
  };

  const handleNewConnection = () => {
    navigation.navigate('MyCode');
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
            renderItem={({ item, index }) => {
              item.index = index;
              return <ConnectionCard {...item} />;
            }}
            renderHiddenItem={({ item }, rowMap) => (
              <ActionComponent {...item} />
            )}
            leftOpenValue={0}
            rightOpenValue={DEVICE_LARGE ? -60 : -55}
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
            // ListFooterComponent={() =>
            //   hiddenConnectionCount > 0 || showHidden ? (
            //     <TouchableOpacity
            //       style={styles.listFooter}
            //       onPress={() => {
            //         setShowHidden((showHiden) => !showHiden);
            //       }}
            //     >
            //       <Text style={styles.listFooterText}>
            //         {showHidden ? 'Hide' : 'Show'} Hidden Connections
            //       </Text>
            //     </TouchableOpacity>
            //   ) : null
            // }
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
  listFooter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  listFooterText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: LIGHTBLUE,
  },
});

export default ConnectionsScreen;
