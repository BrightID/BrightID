import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { connectionsSelector } from '@/utils/connectionsSelector';
import { ORANGE, BLUE, WHITE, LIGHT_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, DEVICE_TYPE } from '@/utils/deviceConstants';
import EmptyList from '@/components/Helpers/EmptyList';
import { connection_levels } from '@/utils/constants';
import {
  setConnectionLevel,
  recoveryConnectionsSelector,
  addOperation,
} from '@/actions';
import { calculateCooldownPeriod } from '@/utils/recovery';
import { NodeApiContext } from '@/components/NodeApiGate';
import TrustedConnectionCard from './TrustedConnectionCard';

/**
 * Backup screen of BrightID
 * Displays a search input and list of Connection Cards
 */
const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

const TrustedConnectionsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const myId = useSelector((state: State) => state.user.id);
  const connections = useSelector((state) =>
    connectionsSelector(state, undefined),
  );
  const recoveryConnections = useSelector(recoveryConnectionsSelector);
  const [selectedConnections, setSelectedConnections] = useState(
    recoveryConnections.map((item) => item.id),
  );
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const api = useContext(NodeApiContext);

  const knownLevels = Array<ConnectionLevel>(
    connection_levels.ALREADY_KNOWN,
    connection_levels.RECOVERY,
  );
  const knownConnections = connections.filter(
    (conn) =>
      knownLevels.includes(conn.incomingLevel) ||
      conn.level === connection_levels.RECOVERY,
  );

  const toggleSelection = (id) => {
    const index = selectedConnections.indexOf(id);
    if (index >= 0) {
      // deselect id
      selectedConnections.splice(index, 1);
      setSelectedConnections([...selectedConnections]);
    } else {
      // select id
      setSelectedConnections([...selectedConnections, id]);
    }
  };

  const renderConnection = ({ item }) => (
    <TrustedConnectionCard
      {...item}
      style={styles.connectionCard}
      selected={selectedConnections.includes(item.id)}
      toggleHandler={toggleSelection}
    />
  );

  const save = async () => {
    if (updateInProgress) return;
    try {
      if (selectedConnections.length < 3) {
        Alert.alert(
          t('common.alert.error'),
          t('backup.alert.text.needThreeTrusted'),
        );
      } else {
        setUpdateInProgress(true);
        // determine which connections need to be changed
        const connectionsToUpgrade = connections.filter(
          (item) =>
            selectedConnections.includes(item.id) &&
            item.level !== connection_levels.RECOVERY,
        );
        const connectionsToDowngrade = recoveryConnections.filter(
          (item) => !selectedConnections.includes(item.id),
        );

        const cooldownPeriod = calculateCooldownPeriod({ recoveryConnections });

        if (connectionsToUpgrade.length || connectionsToDowngrade.length) {
          // apply changes
          const promises = [];
          for (const item of connectionsToUpgrade) {
            console.log(`Setting ${item.name} to RECOVERY`);
            promises.push(
              api.addConnection(
                myId,
                item.id,
                connection_levels.RECOVERY,
                Date.now(),
              ),
            );
            dispatch(
              setConnectionLevel({
                id: item.id,
                level: connection_levels.RECOVERY,
              }),
            );
          }
          for (const item of connectionsToDowngrade) {
            console.log(`Setting ${item.name} to ALREADY_KNOWN`);
            promises.push(
              api.addConnection(
                myId,
                item.id,
                connection_levels.ALREADY_KNOWN,
                Date.now(),
              ),
            );
            dispatch(
              setConnectionLevel({
                id: item.id,
                level: connection_levels.ALREADY_KNOWN,
              }),
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
                'Social recovery of your BrightID is now enabled',
              ),
            );
            navigation.navigate('Home');
          }
        }
      }
    } catch (err) {
      console.warn(err.message);
    } finally {
      setUpdateInProgress(false);
    }
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="TrustedConnectionsScreen">
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.infoText}>
              {t('backup.text.chooseTrustedConnections')}
            </Text>
          </View>
          <View style={styles.mainContainer}>
            <FlatList
              style={styles.connectionsContainer}
              contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
              data={knownConnections}
              keyExtractor={({ id }, index) => id + index}
              renderItem={renderConnection}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              getItemLayout={getItemLayout}
              ListEmptyComponent={
                <EmptyList
                  iconType="account-off-outline"
                  title={t('backup.text.noConnections')}
                />
              }
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={updateInProgress}
            onPress={save}
            style={styles.nextButton}
          >
            <Text style={styles.buttonInnerText}>
              {t('backup.button.save', 'Set recovery connections')}
            </Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 10,
  },
  mainContainer: {
    marginTop: 4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionsContainer: {
    flex: 1,
    width: '96.7%',
  },
  emptyText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[20],
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_TYPE === 'large' ? 6 : 0,
    backgroundColor: WHITE,
    width: '96.7%',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GREY,
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[18],
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    margin: 12,
    paddingLeft: 10,
  },
  connectionCard: {
    marginBottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GREY,
    width: '100%',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: BLUE,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 12,
    marginTop: 9,
    marginBottom: DEVICE_TYPE === 'large' ? 30 : 9,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: WHITE,
    fontWeight: '600',
    fontSize: fontSize[18],
  },
});

export default TrustedConnectionsScreen;
