import React, { useContext, useMemo } from 'react';
import { StyleSheet, View, StatusBar, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import _ from 'lodash';
import { useDispatch, useSelector, store } from '@/store';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import EmptyList from '@/components/Helpers/EmptyList';
import { connectionsSelector } from '@/utils/connectionsSelector';
import { ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { NodeApiContext } from '@/components/NodeApiGate';
import { updateConnections } from '@/actions';
import ConnectionCard from './ConnectionCard';
import { MAX_DISPLAY_CONNECTIONS } from '@/utils/constants';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

/** Helper Component */
const ITEM_HEIGHT = DEVICE_LARGE ? 102 : 92;

const getItemLayout = (_data, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const renderItem = ({ item, index }: { item: Connection; index: number }) => {
  return <ConnectionCard {...item} index={index} />;
};

/** Main Component */

export const ConnectionsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const api = useContext(NodeApiContext);
  const route: { params?: { group: Group } } = useRoute() as {
    params?: { group: Group };
  };
  const excludeGroup = route.params?.group;
  const connections = useSelector((state) =>
    connectionsSelector(state, excludeGroup?.members),
  ).slice(0, MAX_DISPLAY_CONNECTIONS);
  const { t } = useTranslation();

  const handleNewConnection = () => {
    navigation.navigate('MyCode');
  };

  const ConnectionList = useMemo(() => {
    const onRefresh = async () => {
      console.log('Reloading Connections');
      const {
        user: { id },
      } = store.getState();
      try {
        const conns = await api.getConnections(id, 'outbound');
        const incomingConns = await api.getConnections(id, 'inbound');
        const incomingConnsById = _.keyBy(incomingConns, 'id');
        for (const conn of conns) {
          conn.incomingLevel = incomingConnsById[conn.id]?.level;
        }
        dispatch(updateConnections(conns));
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
    color: WHITE,
    fontSize: fontSize[11],
  },
});

export default ConnectionsScreen;
