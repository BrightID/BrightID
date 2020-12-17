// @flow

import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Spinner from 'react-native-spinkit';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { connectionsSelector } from '@/utils/connectionsSelector';
import store from '@/store';
import RecoveringConnectionCard from './RecoveringConnectionCard';

const ITEM_HEIGHT = DEVICE_LARGE ? 102 : 92;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const RecoveringConnectionScreen = () => {
  const connections = useSelector(connectionsSelector);

  const { t } = useTranslation();
  const route = useRoute();

  const [uploadingData, setUploadingData] = useState(false);

  const renderConnection = ({ item, index }) => {
    item.index = index;
    return (
      <RecoveringConnectionCard
        {...item}
        aesKey={route.params?.aesKey}
        setUploadingData={setUploadingData}
      />
    );
  };

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
        {!uploadingData ? (
          <View style={styles.mainContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.infoText}>{msg}</Text>
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
                ListEmptyComponent={
                  <EmptyList title={t('restore.text.noConnections')} />
                }
                getItemLayout={getItemLayout}
              />
            </View>
          </View>
        ) : (
          <View style={styles.mainContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.infoText}>Uploading Shared DAta</Text>
            </View>
            <Spinner size={DEVICE_LARGE ? 48 : 42} type="Wave" color={ORANGE} />
          </View>
        )}
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
    width: '100%',
  },
  moreIcon: {
    marginRight: 16,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: 11,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    textAlign: 'center',
    width: '80%',
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

export default RecoveringConnectionScreen;
