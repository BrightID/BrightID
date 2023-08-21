import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, StatusBar } from 'react-native';
import { Wave } from 'react-native-animated-spinkit';
import { useTranslation } from 'react-i18next';
import { useSelector } from '@/store/hooks';
import EmptyList from '@/components/Helpers/EmptyList';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { connectionsSelector } from '@/utils/connectionsSelector';
import { ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import RecoveringConnectionCard from './RecoveringConnectionCard';

const ITEM_HEIGHT = DEVICE_LARGE ? 102 : 92;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const RecoveringConnectionScreen = () => {
  const connections = useSelector((state) =>
    connectionsSelector(state, undefined),
  );
  const { t } = useTranslation();
  const [uploadingData, setUploadingData] = useState(false);

  const renderConnection = ({ item, index }) => {
    item.index = index;
    return (
      <RecoveringConnectionCard {...item} setUploadingData={setUploadingData} />
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
      <View style={styles.container}>
        {!uploadingData ? (
          <View style={styles.mainContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.infoText}>
                {t('restore.text.chooseConnectionToHelp')}
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
                ListEmptyComponent={
                  <EmptyList
                    title={t('restore.emptyList.text.nobodyHasChosen')}
                  />
                }
                getItemLayout={getItemLayout}
              />
            </View>
          </View>
        ) : (
          <View style={styles.mainContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.infoText}>Uploading Shared Data</Text>
            </View>
            <Wave size={DEVICE_LARGE ? 48 : 42} color={ORANGE} />
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
    backgroundColor: WHITE,
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
    backgroundColor: WHITE,
    width: '100%',
    marginBottom: 11,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[15],
    textAlign: 'center',
    width: '80%',
  },
});

export default RecoveringConnectionScreen;
