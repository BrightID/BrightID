import React, { useMemo, useCallback, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

// Redux
import { useDispatch, useSelector } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllConnections,
  recoveryConnectionsSelector,
} from '@/reducer/connectionsSlice';
import {
  addOperation,
  setConnectionLevel,
  setConnectionsSearch,
  setConnectionsSearchOpen,
} from '@/actions';

import { toSearchString } from '@/utils/strings';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/stack';
import { ORANGE, WHITE, GREY, DARK_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { connection_levels } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { calculateCooldownPeriod } from '@/utils/recovery';
import { NodeApiContext } from '../NodeApiGate';
// Import Components Local
import RecoveryConnectionCard from './RecoverConnectionsCard';
import AnimatedTopSearchBar from './TopSearchBar';

const searchParamSelector = (state: State) => state.connections.searchParam;

const newRecoveryConnectionSelector = createSelector(
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

// Create Custom Local Components
const EmptyList = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text style={styles.emptyMessage}>
        No Accont Available to be added to Recovery Account. :)
      </Text>
    </View>
  );
};

export const NewRecoveryConnectionList = (props) => {
  const { navigation } = props;

  const { t } = useTranslation();
  const api = useContext(NodeApiContext);
  const headerHeight = useHeaderHeight();
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.user.id);
  const connections = useSelector(newRecoveryConnectionSelector);
  const recoveryConnections = useSelector(recoveryConnectionsSelector);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [updateInProgress, setUpdateInProgress] = useState<boolean>(false);

  // toggle for select and deselect recovery account
  const filter = useCallback(
    (id: string) => {
      if (selectedAccounts.includes(id)) {
        setSelectedAccounts(selectedAccounts.filter((value) => value !== id));
      } else {
        setSelectedAccounts([...selectedAccounts, id]);
      }
    },
    [selectedAccounts],
  );

  // submit new recovery account
  const confirm = async () => {
    if (updateInProgress) return;

    try {
      setUpdateInProgress(true);
      console.log(recoveryConnections.length);
      console.log(selectedAccounts.length);

      const totalRecoveryAccount =
        recoveryConnections.length + selectedAccounts.length;

      if (totalRecoveryAccount < 3) {
        Alert.alert(
          t('common.alert.error'),
          `Need ${
            3 - totalRecoveryAccount
          } more account to enable backup your BrightID`,
        );
      } else {
        // calculate cooldown period
        const cooldownPeriod = calculateCooldownPeriod({ recoveryConnections });

        // apply
        const promises = [];
        for (const id of selectedAccounts) {
          promises.push(
            api.addConnection(myId, id, connection_levels.RECOVERY, Date.now()),
          );
          dispatch(
            setConnectionLevel({ id, level: connection_levels.RECOVERY }),
          );
        }

        const ops = await Promise.all(promises);
        for (const op of ops) {
          dispatch(addOperation(op));
        }

        // show info about cooldown period
        if (cooldownPeriod > 0) {
          navigation.navigate('RecoveryCooldownInfo', {
            successCallback: () => {
              navigation.navigate('Home');
            },
          });
        } else {
          Alert.alert(
            t('common.alert.success'),
            t(
              'backup.alert.text.completed',
              'Recovery connections have been successfully added',
            ),
          );
          navigation.navigate('Home');
        }
      }
    } catch (error) {
      console.warn(error.message);
    } finally {
      setUpdateInProgress(false);
    }
  };

  const ConnectionsList = useMemo(() => {
    return (
      <FlatList
        data={connections}
        contentContainerStyle={{
          paddingTop: '5%',
          paddingBottom: '33%',
        }}
        renderItem={({ item, index }) => (
          <RecoveryConnectionCard
            {...item}
            index={index}
            isSelectionActive={true}
            onSelect={filter}
            isSelected={selectedAccounts.includes(item.id)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyList />}
      />
    );
  }, [connections, selectedAccounts, filter]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />

      <View style={styles.container}>
        {recoveryConnections.length === 0 ? (
          <Text style={styles.recoveryMessage}>
            Choose three or more already known connection to backup your
            BrightID
          </Text>
        ) : (
          <Text style={styles.recoveryMessage}>
            Connections must be already known before they can be setup as
            recovery.
          </Text>
        )}
        <AnimatedTopSearchBar
          sortable={false}
          setSearchValue={setConnectionsSearch}
          setSearchOpen={setConnectionsSearchOpen}
          searchOpenSelector={(state: State) => state.connections.searchOpen}
        />
        {ConnectionsList}
        <BlurView
          style={styles.buttonContainer}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor={WHITE}
        >
          <TouchableOpacity
            disabled={updateInProgress || selectedAccounts.length === 0}
            style={[
              styles.button,
              {
                backgroundColor:
                  updateInProgress || selectedAccounts.length === 0
                    ? GREY
                    : ORANGE,
              },
            ]}
            onPress={confirm}
          >
            {updateInProgress ? (
              <ActivityIndicator size="small" color={WHITE} />
            ) : (
              <Text style={styles.buttonLabel}>Add</Text>
            )}
          </TouchableOpacity>
        </BlurView>
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
  buttonContainer: {
    position: 'absolute',
    zIndex: 10,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '3%',
    paddingBottom: '11%',
  },
  button: {
    backgroundColor: ORANGE,
    height: 50,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  buttonLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    color: WHITE,
  },
  recoveryMessage: {
    paddingHorizontal: '10%',
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    marginTop: '5%',
    textAlign: 'center',
  },
  emptyMessage: {
    paddingHorizontal: '10%',
    fontFamily: 'Poppins-Regular',
    marginTop: '50%',
    textAlign: 'center',
  },
});

export default NewRecoveryConnectionList;
