// @flow

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  connectionsSelector,
  recoveryConnectionsSelector,
} from '@/utils/connectionsSelector';
import { ORANGE, BLUE, WHITE, LIGHT_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, DEVICE_TYPE } from '@/utils/deviceConstants';
import EmptyList from '@/components/Helpers/EmptyList';
import { connection_levels } from '@/utils/constants';
import api from '@/api/brightId';
import { setConnectionLevel } from '@/actions/connections';
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
  const myId = useSelector((state) => state.user.id);
  const connections = useSelector(connectionsSelector);
  const trustedConnections = useSelector(recoveryConnectionsSelector);
  const [selectedConnections, setSelectedConnections] = useState(
    trustedConnections.map((item) => item.id),
  );

  const toggleSelection = (id) => {
    console.log(`toggle connection ${id}`);
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

  const navigateToBackup = async () => {
    try {
      if (selectedConnections.length < 3) {
        Alert.alert(
          t('common.alert.error'),
          t('backup.alert.text.needThreeTrusted'),
        );
      } else {
        // determine which connections need to be changed
        const connectionsToUpgrade = connections.filter(
          (item) =>
            selectedConnections.includes(item.id) &&
            item.level !== connection_levels.RECOVERY,
        );
        const connectionsToDowngrade = trustedConnections.filter(
          (item) => !selectedConnections.includes(item.id),
        );

        // apply changes
        const promises = [];
        for (const item of connectionsToUpgrade) {
          console.log(`Setting ${item.name} to RECOVERY`);
          promises.push(
            api.addConnection(
              myId,
              item.id,
              connection_levels.RECOVERY,
              undefined,
              Date.now(),
            ),
          );
          dispatch(setConnectionLevel(item.id, connection_levels.RECOVERY));
        }
        for (const item of connectionsToDowngrade) {
          console.log(`Setting ${item.name} to ALREADY_KNOWN`);
          promises.push(
            api.addConnection(
              myId,
              item.id,
              connection_levels.ALREADY_KNOWN,
              undefined,
              Date.now(),
            ),
          );
          dispatch(
            setConnectionLevel(item.id, connection_levels.ALREADY_KNOWN),
          );
        }
        await Promise.all(promises);
        navigation.navigate('Backup');
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
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
              data={connections}
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
            onPress={navigateToBackup}
            style={styles.nextButton}
          >
            <Text style={styles.buttonInnerText}>
              {t('backup.button.next')}
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
