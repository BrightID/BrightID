// @flow

import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Spinner from 'react-native-spinkit';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import store from '@/store';
import SearchConnections from '../Connections/SearchConnections';
import RecoveringConnectionCard from './RecoveringConnectionCard';

const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

const RecoveringConnectionScreen = () => {
  const connections = useSelector((state) => state.connections.connections)
    .filter((item) =>
      `${item.name}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchParam.toLowerCase().replace(/\s/g, '')),
    )
    .filter((item) => item.status === 'verified');

  const searchParam = useSelector((state) => state.connections.searchParam);

  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  // const aesKey = ;

  const renderConnection = ({ item }) => (
    <RecoveringConnectionCard
      {...item}
      aesKey={route.params?.aesKey}
      style={styles.recoveringConnectionCard}
    />
  );

  const {
    recoveryData: { totalItems, completedItems },
  } = store.getState();

  const waiting = totalItems > 0 && completedItems < totalItems;
  let msg;
  if (waiting) {
    msg = t('restore.text.sendingProgress', { completedItems, totalItems });
  } else {
    msg = t('restore.text.chooseConnectionToHelp');
  }
  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
              {t('restore.title.chooseConnection')}
            </Text>
            <Text style={styles.infoText}>{msg}</Text>
            <Spinner
              isVisible={waiting}
              size={DEVICE_LARGE ? 48 : 42}
              type="Wave"
              color="#4a90e2"
            />
          </View>
          <SearchConnections navigation={navigation} />
          <View style={styles.mainContainer}>
            <FlatList
              style={styles.connectionsContainer}
              contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
              data={connections}
              keyExtractor={({ id }, index) => id + index}
              renderItem={renderConnection}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyList title={t('restore.text.noConnections')} />
              }
              getItemLayout={getItemLayout}
            />
          </View>
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
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  mainContainer: {
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
  },
  connectionsContainer: {
    flex: 1,
    width: '96.7%',
    borderTopWidth: 1,
    borderTopColor: '#e3e1e1',
  },
  moreIcon: {
    marginRight: 16,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    backgroundColor: '#fff',
    width: '96.7%',
    marginBottom: 11,
  },
  titleText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.09)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
  },
  recoveringConnectionCard: {
    marginBottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e1e1',
    width: '100%',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#428BE5',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 12,
    marginTop: 9,
    marginBottom: 30,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

// export default connect(({ connections, user, recoveryData }) => ({
//   ...connections,
//   ...user,
//   ...recoveryData
// }))(withTranslation()(RecoveringConnectionScreen));

export default RecoveringConnectionScreen;
