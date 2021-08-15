import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { ORANGE, BLACK, WHITE, GREEN, DARKER_GREY, GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { connection_levels } from '@/utils/constants';
import { toSearchString } from '@/utils/strings';

// Import Components Local
import RecoveryConnectionCard from './RecoverConnectionsCard';
import AnimatedTopSearchBar from './TopSearchBar';

// Redux
import { useSelector } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllConnections,
  setConnectionsSearch,
  setConnectionsSearchOpen,
} from '@/reducer/connectionsSlice';
const searchParamSelector = (state: State) => state.connections.searchParam;

const recoveryConnectionSelector = createSelector(
  [selectAllConnections, searchParamSelector],
  (connections, search) => {
    const searchString = toSearchString(search);
    const includeRecovery = Array<ConnectionLevel>(
      connection_levels.ALREADY_KNOWN,
      connection_levels.RECOVERY,
    );
    return connections.filter(
      (conn) =>
        includeRecovery.includes(conn.incomingLevel) &&
        conn.level !== connection_levels.RECOVERY &&
        conn.level !== connection_levels.REPORTED &&
        toSearchString(`${conn?.name}`).includes(searchString),
    );
  },
);

const renderItem = ({ item, index }: { item: Connection; index: number }) => {
  return (
    <RecoveryConnectionCard {...item} index={index} isReplacedActive={true} />
  );
};

export const ReplaceRecoveryConnectionsList = (props) => {
  const { navigation, route } = props;
  const { currentAccount } = route.params;

  const headerHeight = useHeaderHeight();
  const connections = useSelector(recoveryConnectionSelector);

  const [updateOnProgress, setUpdateOnProgress] = useState<Boolean>(false);

  const update = async () => {};

  const handleSort = () => {
    navigation.navigate('SortConnections');
  };

  const ConnectionList = useMemo(() => {
    return (
      <FlatList
        data={connections}
        contentContainerStyle={{
          marginTop: '5%',
        }}
        renderItem={({ item, index }) => (
          <RecoveryConnectionCard
            {...item}
            index={index}
            isReplacedActive={true}
            currentAccount={currentAccount}
          />
        )}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    );
  }, [connections]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />

      <View style={styles.container}>
        <AnimatedTopSearchBar
          sortable={false}
          handleSort={handleSort}
          setSearchValue={setConnectionsSearch}
          setSearchOpen={setConnectionsSearchOpen}
          searchOpenSelector={(state: State) => state.connections.searchOpen}
        />
        {ConnectionList}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
});

export default ReplaceRecoveryConnectionsList;
